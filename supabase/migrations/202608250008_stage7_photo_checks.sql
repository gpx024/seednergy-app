insert into public.check_types (id, slug, label, position) values
  ('70000000-0000-4000-8000-000000000001', 'progress', 'Progress check', 1),
  ('70000000-0000-4000-8000-000000000002', 'issue', 'Issue check', 2),
  ('70000000-0000-4000-8000-000000000003', 'stage_review', 'Stage review', 3),
  ('70000000-0000-4000-8000-000000000004', 'harvest_readiness', 'Harvest readiness', 4),
  ('70000000-0000-4000-8000-000000000005', 'follow_up', 'Cycle follow-up', 5)
on conflict (slug) do update set label = excluded.label, position = excluded.position, active = true;

alter table public.photo_checks
  add column client_event_id uuid,
  add constraint photo_checks_status_check check (status in ('on_track','issue_likely','unclear','harvest_likely','not_ready','rejected','provider_error')),
  add constraint photo_checks_confidence_check check (confidence in ('high','medium','low','unknown')),
  add constraint photo_checks_result_object_check check (result is null or jsonb_typeof(result) = 'object');

create unique index photo_checks_user_client_event_unique
  on public.photo_checks(user_id, client_event_id)
  where client_event_id is not null;

create or replace function public.save_photo_check(
  p_cycle_id uuid,
  p_check_type text,
  p_storage_path text,
  p_result jsonb,
  p_occurred_at timestamptz,
  p_client_event_id uuid
)
returns public.photo_checks
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_type public.check_types;
  saved_check public.photo_checks;
  result_status text;
  result_confidence text;
  consumes_quota boolean;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if not exists (select 1 from public.cycles where id = p_cycle_id and user_id = auth.uid()) then
    raise exception 'cycle not found' using errcode = 'P0002';
  end if;
  if split_part(p_storage_path, '/', 1) <> auth.uid()::text then
    raise exception 'invalid storage path' using errcode = '42501';
  end if;

  select * into selected_type from public.check_types where slug = p_check_type and active;
  if selected_type.id is null then raise exception 'invalid check type' using errcode = '22023'; end if;

  result_status := p_result->>'status';
  result_confidence := p_result->>'confidence';
  if result_status not in ('on_track','issue_likely','unclear','harvest_likely','not_ready','rejected','provider_error') then
    raise exception 'invalid photo check status' using errcode = '22023';
  end if;
  if result_confidence not in ('high','medium','low','unknown') then
    raise exception 'invalid photo check confidence' using errcode = '22023';
  end if;
  consumes_quota := result_status not in ('unclear','rejected','provider_error');

  select * into saved_check from public.photo_checks
  where user_id = auth.uid() and client_event_id = p_client_event_id;
  if saved_check.id is not null then return saved_check; end if;

  insert into public.photo_checks (
    cycle_id, user_id, check_type, storage_path, submitted_at, status, confidence,
    result, quota_consumed, retention_expires_at, client_event_id
  ) values (
    p_cycle_id, auth.uid(), selected_type.id, p_storage_path, p_occurred_at, result_status, result_confidence,
    p_result, consumes_quota, null, p_client_event_id
  ) returning * into saved_check;

  insert into public.cycle_events (cycle_id,user_id,event_type,payload,occurred_at,client_event_id)
  values (
    p_cycle_id, auth.uid(), 'photo_check_completed',
    jsonb_build_object('photo_check_id', saved_check.id, 'check_type', p_check_type, 'status', result_status, 'quota_consumed', consumes_quota),
    p_occurred_at, p_client_event_id
  ) on conflict (user_id,client_event_id) do nothing;

  return saved_check;
end;
$$;

revoke insert on public.photo_checks from authenticated;
revoke all on function public.save_photo_check(uuid,text,text,jsonb,timestamptz,uuid) from public;
grant execute on function public.save_photo_check(uuid,text,text,jsonb,timestamptz,uuid) to authenticated;
