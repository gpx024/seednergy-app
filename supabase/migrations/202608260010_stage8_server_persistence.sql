alter table public.ai_request_logs add column lease_token uuid;

revoke execute on function public.begin_ai_photo_check(uuid,uuid,uuid,integer,text,text) from service_role;
revoke execute on function public.finish_ai_photo_check(uuid,text,text,integer,integer,integer,numeric,integer,integer,text,text) from service_role;

create or replace function public.begin_ai_photo_check(
  p_user_id uuid,
  p_cycle_id uuid,
  p_client_event_id uuid,
  p_daily_limit integer,
  p_model_version text,
  p_prompt_version text,
  p_lease_token uuid
)
returns public.ai_request_logs
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_request public.ai_request_logs;
  usage_count integer;
  created_request public.ai_request_logs;
begin
  if p_daily_limit < 1 or p_daily_limit > 1000 then raise exception 'invalid_ai_daily_limit' using errcode = '22023'; end if;
  if not exists (
    select 1 from public.cycles where id = p_cycle_id and user_id = p_user_id and status in ('active','harvest_ready')
  ) then raise exception 'active_cycle_not_found' using errcode = 'P0002'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  select * into existing_request from public.ai_request_logs where user_id = p_user_id and client_event_id = p_client_event_id;
  if existing_request.id is not null then return existing_request; end if;

  update public.ai_request_logs set state = 'failed', error_code = 'reservation_expired', finished_at = now()
  where user_id = p_user_id and state = 'running' and created_at < now() - interval '5 minutes';

  select count(*) into usage_count from public.ai_request_logs
  where user_id = p_user_id
    and created_at >= (date_trunc('day', now() at time zone 'UTC') at time zone 'UTC')
    and (quota_consumed or state = 'running');
  if usage_count >= p_daily_limit then raise exception 'ai_quota_exceeded' using errcode = 'P0001'; end if;

  insert into public.ai_request_logs (
    user_id, cycle_id, client_event_id, model_version, prompt_version, lease_token
  ) values (
    p_user_id, p_cycle_id, p_client_event_id, p_model_version, p_prompt_version, p_lease_token
  ) returning * into created_request;
  return created_request;
end;
$$;

create or replace function public.complete_ai_photo_check(
  p_request_id uuid,
  p_lease_token uuid,
  p_user_id uuid,
  p_check_type text,
  p_storage_path text,
  p_result jsonb,
  p_occurred_at timestamptz,
  p_input_tokens integer,
  p_cached_input_tokens integer,
  p_output_tokens integer,
  p_cost_estimate_usd numeric,
  p_latency_ms integer,
  p_attempt_count integer,
  p_provider_request_id text,
  p_error_code text
)
returns public.photo_checks
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_log public.ai_request_logs;
  selected_type public.check_types;
  saved_check public.photo_checks;
  result_status text;
  result_confidence text;
  consumes_quota boolean;
begin
  select * into request_log from public.ai_request_logs
  where id = p_request_id and user_id = p_user_id and lease_token = p_lease_token
  for update;
  if request_log.id is null then raise exception 'invalid_ai_request_lease' using errcode = '42501'; end if;

  select * into saved_check from public.photo_checks
  where user_id = p_user_id and client_event_id = request_log.client_event_id;
  if saved_check.id is not null then return saved_check; end if;
  if request_log.state <> 'running' then raise exception 'ai_request_not_running' using errcode = '55000'; end if;
  if split_part(p_storage_path, '/', 1) <> p_user_id::text or split_part(p_storage_path, '/', 2) <> request_log.cycle_id::text then
    raise exception 'invalid_storage_path' using errcode = '42501';
  end if;

  select * into selected_type from public.check_types where slug = p_check_type and active;
  if selected_type.id is null then raise exception 'invalid_check_type' using errcode = '22023'; end if;
  result_status := p_result->>'status';
  result_confidence := p_result->>'confidence';
  if result_status not in ('on_track','issue_likely','unclear','harvest_likely','not_ready','rejected','provider_error') then
    raise exception 'invalid_ai_status' using errcode = '22023';
  end if;
  if result_confidence not in ('high','medium','low','unknown') then raise exception 'invalid_ai_confidence' using errcode = '22023'; end if;
  consumes_quota := result_status not in ('unclear','rejected','provider_error');

  update public.ai_request_logs set
    state = case when result_status = 'provider_error' then 'failed' else 'completed' end,
    status = result_status,
    confidence = result_confidence,
    input_tokens = greatest(coalesce(p_input_tokens, 0), 0),
    cached_input_tokens = greatest(coalesce(p_cached_input_tokens, 0), 0),
    output_tokens = greatest(coalesce(p_output_tokens, 0), 0),
    cost_estimate_usd = greatest(coalesce(p_cost_estimate_usd, 0), 0),
    latency_ms = greatest(coalesce(p_latency_ms, 0), 0),
    attempt_count = greatest(coalesce(p_attempt_count, 0), 0),
    provider_request_id = p_provider_request_id,
    quota_consumed = consumes_quota,
    error_code = p_error_code,
    finished_at = now()
  where id = request_log.id;

  insert into public.photo_checks (
    cycle_id, user_id, check_type, storage_path, submitted_at, status, confidence,
    result, quota_consumed, retention_expires_at, error_code, client_event_id
  ) values (
    request_log.cycle_id, p_user_id, selected_type.id, p_storage_path, p_occurred_at, result_status, result_confidence,
    p_result, consumes_quota, null, p_error_code, request_log.client_event_id
  ) returning * into saved_check;

  insert into public.cycle_events (cycle_id,user_id,event_type,payload,occurred_at,client_event_id)
  values (
    request_log.cycle_id, p_user_id, 'photo_check_completed',
    jsonb_build_object('photo_check_id', saved_check.id, 'check_type', p_check_type, 'status', result_status, 'quota_consumed', consumes_quota),
    p_occurred_at, request_log.client_event_id
  ) on conflict (user_id,client_event_id) do nothing;
  return saved_check;
end;
$$;

revoke all on function public.begin_ai_photo_check(uuid,uuid,uuid,integer,text,text,uuid) from public, anon, authenticated;
revoke all on function public.complete_ai_photo_check(uuid,uuid,uuid,text,text,jsonb,timestamptz,integer,integer,integer,numeric,integer,integer,text,text) from public, anon, authenticated;
grant execute on function public.begin_ai_photo_check(uuid,uuid,uuid,integer,text,text,uuid) to service_role;
grant execute on function public.complete_ai_photo_check(uuid,uuid,uuid,text,text,jsonb,timestamptz,integer,integer,integer,numeric,integer,integer,text,text) to service_role;
