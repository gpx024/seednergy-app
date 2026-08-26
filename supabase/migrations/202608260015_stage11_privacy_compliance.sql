alter table public.profiles
  add column if not exists ai_photo_notice_accepted_at timestamptz;

create table public.analytics_events (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_name text not null check (event_name in (
    'app_opened','onboarding_completed','cycle_started','cycle_action_completed',
    'photo_check_started','photo_check_completed','harvest_completed','garden_opened',
    'notification_preference_changed','account_deletion_requested'
  )),
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object'),
  occurred_at timestamptz not null default now()
);

create index analytics_events_user_occurred_idx on public.analytics_events(user_id, occurred_at desc);
alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;

create table public.privacy_configuration (
  id boolean primary key default true check (id),
  check_photo_retention_days integer check (check_photo_retention_days between 1 and 3650),
  updated_at timestamptz not null default now()
);

insert into public.privacy_configuration (id, check_photo_retention_days)
values (true, null)
on conflict (id) do nothing;

create table public.privacy_job_runs (
  id uuid primary key default extensions.gen_random_uuid(),
  job_name text not null check (job_name in ('photo_retention')),
  status text not null check (status in ('running','completed','failed','skipped_unconfigured')),
  deleted_records integer not null default 0 check (deleted_records >= 0),
  deleted_objects integer not null default 0 check (deleted_objects >= 0),
  error_code text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.privacy_configuration enable row level security;
alter table public.privacy_job_runs enable row level security;
revoke all on public.privacy_configuration, public.privacy_job_runs from anon, authenticated;

create or replace function public.accept_ai_photo_notice()
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  update public.profiles
  set ai_photo_notice_accepted_at = coalesce(ai_photo_notice_accepted_at, now())
  where id = auth.uid()
  returning * into updated_profile;
  if updated_profile.id is null then raise exception 'profile not found' using errcode = 'P0002'; end if;
  return updated_profile;
end;
$$;

create or replace function public.record_analytics_event(
  p_event_name text,
  p_properties jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare allowed_keys text[] := array['screen','source','status','seed_slug','cycle_day'];
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_event_name not in (
    'app_opened','onboarding_completed','cycle_started','cycle_action_completed',
    'photo_check_started','photo_check_completed','harvest_completed','garden_opened',
    'notification_preference_changed','account_deletion_requested'
  ) then raise exception 'unsupported analytics event' using errcode = '22023'; end if;
  if jsonb_typeof(coalesce(p_properties, '{}'::jsonb)) <> 'object' then raise exception 'invalid analytics properties' using errcode = '22023'; end if;
  if exists (select 1 from jsonb_object_keys(coalesce(p_properties, '{}'::jsonb)) as entry(key) where entry.key <> all(allowed_keys)) then
    raise exception 'unsupported analytics property' using errcode = '22023';
  end if;
  if length(coalesce(p_properties::text, '{}')) > 1000 then raise exception 'analytics properties too large' using errcode = '22023'; end if;
  insert into public.analytics_events (user_id,event_name,properties,occurred_at)
  values (auth.uid(),p_event_name,coalesce(p_properties,'{}'::jsonb),p_occurred_at);
end;
$$;

create or replace function public.prepare_photo_retention(p_retention_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare updated_count integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  if p_retention_days < 1 or p_retention_days > 3650 then raise exception 'invalid retention period' using errcode = '22023'; end if;
  update public.photo_checks
  set retention_expires_at = submitted_at + make_interval(days => p_retention_days)
  where retention_expires_at is null;
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function public.finalize_account_deletion(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'service role required' using errcode = '42501'; end if;
  perform set_config('seednergy.account_deletion', 'true', true);
  delete from public.notifications where user_id = p_user_id;
  delete from public.push_devices where user_id = p_user_id;
  delete from public.entitlements where user_id = p_user_id;
  delete from public.ai_request_logs where user_id = p_user_id;
  delete from public.photo_checks where user_id = p_user_id;
  delete from public.harvests where user_id = p_user_id;
  delete from public.analytics_events where user_id = p_user_id;
  delete from public.cycle_events where user_id = p_user_id;
  delete from public.cycles where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;
end;
$$;

create or replace function public.reject_cycle_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_setting('seednergy.account_deletion', true) = 'true' then return old; end if;
  raise exception 'cycle_events is append-only' using errcode = '55000';
end;
$$;

revoke all on function public.accept_ai_photo_notice() from public;
revoke all on function public.record_analytics_event(text,jsonb,timestamptz) from public;
revoke all on function public.prepare_photo_retention(integer) from public;
revoke all on function public.finalize_account_deletion(uuid) from public;
grant execute on function public.accept_ai_photo_notice() to authenticated;
grant execute on function public.record_analytics_event(text,jsonb,timestamptz) to authenticated;
grant execute on function public.prepare_photo_retention(integer) to service_role;
grant execute on function public.finalize_account_deletion(uuid) to service_role;
