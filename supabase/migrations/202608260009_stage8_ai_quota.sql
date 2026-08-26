create table public.ai_request_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  client_event_id uuid not null,
  state text not null default 'running' check (state in ('running','completed','failed')),
  status text,
  confidence text,
  model_version text not null,
  prompt_version text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  cached_input_tokens integer not null default 0 check (cached_input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cost_estimate_usd numeric(12,8) not null default 0 check (cost_estimate_usd >= 0),
  latency_ms integer not null default 0 check (latency_ms >= 0),
  attempt_count smallint not null default 0 check (attempt_count >= 0),
  provider_request_id text,
  quota_consumed boolean not null default false,
  error_code text,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (user_id, client_event_id)
);

create index ai_request_logs_daily_quota_idx on public.ai_request_logs(user_id, created_at desc)
  where quota_consumed or state = 'running';

alter table public.ai_request_logs enable row level security;
revoke all on public.ai_request_logs from anon, authenticated;
grant select, insert, update on public.ai_request_logs to service_role;

create or replace function public.begin_ai_photo_check(
  p_user_id uuid,
  p_cycle_id uuid,
  p_client_event_id uuid,
  p_daily_limit integer,
  p_model_version text,
  p_prompt_version text
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
  if p_daily_limit < 1 or p_daily_limit > 1000 then
    raise exception 'invalid_ai_daily_limit' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.cycles
    where id = p_cycle_id and user_id = p_user_id and status in ('active','harvest_ready')
  ) then
    raise exception 'active_cycle_not_found' using errcode = 'P0002';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));

  select * into existing_request from public.ai_request_logs
  where user_id = p_user_id and client_event_id = p_client_event_id;
  if existing_request.id is not null then return existing_request; end if;

  update public.ai_request_logs
  set state = 'failed', error_code = 'reservation_expired', finished_at = now()
  where user_id = p_user_id and state = 'running' and created_at < now() - interval '5 minutes';

  select count(*) into usage_count
  from public.ai_request_logs
  where user_id = p_user_id
    and created_at >= (date_trunc('day', now() at time zone 'UTC') at time zone 'UTC')
    and (quota_consumed or state = 'running');

  if usage_count >= p_daily_limit then
    raise exception 'ai_quota_exceeded' using errcode = 'P0001';
  end if;

  insert into public.ai_request_logs (
    user_id, cycle_id, client_event_id, model_version, prompt_version
  ) values (
    p_user_id, p_cycle_id, p_client_event_id, p_model_version, p_prompt_version
  ) returning * into created_request;
  return created_request;
end;
$$;

create or replace function public.finish_ai_photo_check(
  p_request_id uuid,
  p_status text,
  p_confidence text,
  p_input_tokens integer,
  p_cached_input_tokens integer,
  p_output_tokens integer,
  p_cost_estimate_usd numeric,
  p_latency_ms integer,
  p_attempt_count integer,
  p_provider_request_id text,
  p_error_code text
)
returns public.ai_request_logs
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_request public.ai_request_logs;
  consumes_quota boolean;
begin
  if p_status not in ('on_track','issue_likely','unclear','harvest_likely','not_ready','rejected','provider_error') then
    raise exception 'invalid_ai_status' using errcode = '22023';
  end if;
  if p_confidence not in ('high','medium','low','unknown') then
    raise exception 'invalid_ai_confidence' using errcode = '22023';
  end if;
  consumes_quota := p_status not in ('unclear','rejected','provider_error');

  update public.ai_request_logs set
    state = case when p_status = 'provider_error' then 'failed' else 'completed' end,
    status = p_status,
    confidence = p_confidence,
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
  where id = p_request_id and state = 'running'
  returning * into updated_request;

  if updated_request.id is null then
    select * into updated_request from public.ai_request_logs where id = p_request_id;
  end if;
  return updated_request;
end;
$$;

revoke all on function public.begin_ai_photo_check(uuid,uuid,uuid,integer,text,text) from public, anon, authenticated;
revoke all on function public.finish_ai_photo_check(uuid,text,text,integer,integer,integer,numeric,integer,integer,text,text) from public, anon, authenticated;
grant execute on function public.begin_ai_photo_check(uuid,uuid,uuid,integer,text,text) to service_role;
grant execute on function public.finish_ai_photo_check(uuid,text,text,integer,integer,integer,numeric,integer,integer,text,text) to service_role;
