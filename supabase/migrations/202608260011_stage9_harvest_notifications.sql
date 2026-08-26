create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

create table public.harvests (
  id uuid primary key default extensions.gen_random_uuid(),
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  seed_id uuid not null references public.seeds(id),
  harvest_number integer not null check (harvest_number > 0),
  harvested_at timestamptz not null,
  storage_path text,
  suggestions jsonb not null default '[]'::jsonb,
  suggestion_status text not null default 'pending' check (suggestion_status in ('pending','completed','fallback','failed')),
  prompt_version text,
  model_version text,
  cost_estimate_usd numeric(12,8) not null default 0 check (cost_estimate_usd >= 0),
  latency_ms integer not null default 0 check (latency_ms >= 0),
  created_at timestamptz not null default now(),
  unique (cycle_id, harvest_number)
);

alter table public.harvests enable row level security;
revoke all on public.harvests from anon, authenticated;
grant select on public.harvests to authenticated;
create policy "harvests select own rows" on public.harvests for select to authenticated using (user_id = auth.uid());

create table public.push_devices (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  platform text not null check (platform in ('android','ios')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

alter table public.push_devices enable row level security;
revoke all on public.push_devices from anon, authenticated;
grant select on public.push_devices to authenticated;
create policy "push devices select own rows" on public.push_devices for select to authenticated using (user_id = auth.uid());

alter table public.notifications
  add column title text not null default 'Seednergy',
  add column body text not null default '',
  add column data jsonb not null default '{}'::jsonb,
  add column client_event_id uuid,
  add column provider_request_id bigint;

create unique index notifications_client_event_idx on public.notifications(user_id, client_event_id) where client_event_id is not null;
create index notifications_due_idx on public.notifications(scheduled_for) where status = 'pending';
revoke insert, update, delete on public.notifications from authenticated;
drop policy if exists "notifications insert own rows" on public.notifications;
drop policy if exists "notifications update own rows" on public.notifications;
drop policy if exists "notifications delete own rows" on public.notifications;

create or replace function public.complete_cycle_harvest(
  p_cycle_id uuid,
  p_harvested_at timestamptz,
  p_storage_path text,
  p_client_event_id uuid
)
returns public.harvests
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_cycle public.cycles;
  seed_mode text;
  next_number integer;
  saved_harvest public.harvests;
  existing_harvest_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_harvested_at > now() + interval '5 minutes' then raise exception 'invalid harvest time' using errcode = '22023'; end if;

  select (payload->>'harvest_id')::uuid into existing_harvest_id
  from public.cycle_events where user_id = auth.uid() and client_event_id = p_client_event_id;
  if existing_harvest_id is not null then
    select * into saved_harvest from public.harvests where id = existing_harvest_id and user_id = auth.uid();
    return saved_harvest;
  end if;

  select * into owned_cycle from public.cycles where id = p_cycle_id and user_id = auth.uid() for update;
  if owned_cycle.id is null then raise exception 'cycle not found' using errcode = 'P0002'; end if;
  if owned_cycle.status <> 'harvest_ready' then raise exception 'cycle is not harvest ready' using errcode = 'P0001'; end if;
  if p_storage_path is not null and p_storage_path !~ ('^' || auth.uid()::text || '/' || p_cycle_id::text || '/harvest/') then
    raise exception 'invalid harvest photo path' using errcode = '22023';
  end if;

  select harvest_mode into seed_mode from public.seeds where id = owned_cycle.seed_id;
  next_number := owned_cycle.harvest_count + 1;
  insert into public.harvests (cycle_id,user_id,seed_id,harvest_number,harvested_at,storage_path)
  values (owned_cycle.id,auth.uid(),owned_cycle.seed_id,next_number,p_harvested_at,p_storage_path)
  returning * into saved_harvest;

  update public.cycles set
    status = case when seed_mode = 'repeating' then 'active' else 'harvested' end,
    harvest_count = next_number,
    harvested_at = case when seed_mode = 'repeating' then harvested_at else p_harvested_at end,
    last_harvested_at = p_harvested_at,
    last_action_at = p_harvested_at
  where id = owned_cycle.id;

  insert into public.cycle_events (cycle_id,user_id,event_type,payload,occurred_at,client_event_id)
  values (owned_cycle.id,auth.uid(),'harvest_completed',jsonb_build_object(
    'harvest_id',saved_harvest.id,'harvest_number',next_number,'storage_path',p_storage_path,'mode',seed_mode
  ),p_harvested_at,p_client_event_id);

  update public.notifications set status = 'cancelled'
  where cycle_id = owned_cycle.id and user_id = auth.uid() and status = 'pending';
  return saved_harvest;
end;
$$;

create or replace function public.register_push_device(p_expo_push_token text, p_platform text)
returns public.push_devices
language plpgsql
security definer
set search_path = ''
as $$
declare saved_device public.push_devices;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_expo_push_token !~ '^ExponentPushToken\[[A-Za-z0-9_-]+\]$' and p_expo_push_token !~ '^ExpoPushToken\[[A-Za-z0-9_-]+\]$' then
    raise exception 'invalid Expo push token' using errcode = '22023';
  end if;
  if p_platform not in ('android','ios') then raise exception 'invalid platform' using errcode = '22023'; end if;
  insert into public.push_devices (user_id,expo_push_token,platform,enabled,updated_at)
  values (auth.uid(),p_expo_push_token,p_platform,true,now())
  on conflict (user_id,expo_push_token) do update set platform = excluded.platform, enabled = true, updated_at = now()
  returning * into saved_device;
  return saved_device;
end;
$$;

create or replace function public.update_notification_preferences(
  p_enabled boolean,
  p_frequency text,
  p_quiet_start text,
  p_quiet_end text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_frequency not in ('daily','every_other_day','important_only') then raise exception 'invalid frequency' using errcode = '22023'; end if;
  perform p_quiet_start::time;
  perform p_quiet_end::time;
  update public.profiles set
    notification_prefs = jsonb_build_object('enabled',p_enabled,'frequency',p_frequency),
    quiet_hours = jsonb_build_object('start',p_quiet_start,'end',p_quiet_end)
  where id = auth.uid() returning * into updated_profile;
  if not p_enabled then
    update public.notifications set status = 'cancelled' where user_id = auth.uid() and status = 'pending';
    update public.push_devices set enabled = false, updated_at = now() where user_id = auth.uid();
  else
    update public.push_devices set enabled = true, updated_at = now() where user_id = auth.uid();
  end if;
  return updated_profile;
end;
$$;

create or replace function public.next_allowed_notification_time(p_user_id uuid, p_requested_at timestamptz)
returns timestamptz
language plpgsql
stable
security definer
set search_path = ''
as $$
declare profile public.profiles; local_requested timestamp; start_time time; end_time time;
begin
  select * into profile from public.profiles where id = p_user_id;
  start_time := coalesce((profile.quiet_hours->>'start')::time,'21:00'::time);
  end_time := coalesce((profile.quiet_hours->>'end')::time,'08:00'::time);
  local_requested := p_requested_at at time zone coalesce(profile.timezone,'UTC');
  if start_time > end_time then
    if local_requested::time >= start_time then
      return ((local_requested::date + 1 + end_time) at time zone coalesce(profile.timezone,'UTC'));
    elsif local_requested::time < end_time then
      return ((local_requested::date + end_time) at time zone coalesce(profile.timezone,'UTC'));
    end if;
  elsif local_requested::time >= start_time and local_requested::time < end_time then
    return ((local_requested::date + end_time) at time zone coalesce(profile.timezone,'UTC'));
  end if;
  return p_requested_at;
end;
$$;

create or replace function public.refresh_cycle_notification(p_cycle_id uuid, p_now timestamptz default now())
returns public.notifications
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_cycle public.cycles;
  profile public.profiles;
  seed_name text;
  current_stage public.seed_stages;
  cycle_day integer;
  interval_days integer;
  requested_at timestamptz;
  next_time timestamptz;
  saved_notification public.notifications;
  frequency text;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into owned_cycle from public.cycles where id = p_cycle_id and user_id = auth.uid();
  if owned_cycle.id is null then raise exception 'cycle not found' using errcode = 'P0002'; end if;
  select * into profile from public.profiles where id = auth.uid();
  delete from public.notifications where cycle_id = p_cycle_id and user_id = auth.uid() and status = 'pending';
  if owned_cycle.status not in ('active','harvest_ready') or coalesce((profile.notification_prefs->>'enabled')::boolean,false) is false then return null; end if;

  cycle_day := greatest(1,(p_now at time zone owned_cycle.timezone)::date - (owned_cycle.started_at at time zone owned_cycle.timezone)::date + 1);
  select * into current_stage from public.seed_stages
  where seed_id = owned_cycle.seed_id and day_from <= cycle_day and (day_to is null or day_to >= cycle_day)
  order by position desc limit 1;
  if current_stage.id is null then return null; end if;
  select name into seed_name from public.seeds where id = owned_cycle.seed_id;
  frequency := coalesce(profile.notification_prefs->>'frequency','daily');
  if frequency = 'important_only' and owned_cycle.status <> 'harvest_ready' then return null; end if;
  interval_days := greatest(current_stage.action_interval_days,case when frequency = 'every_other_day' then 2 else 1 end);
  requested_at := coalesce(owned_cycle.last_action_at + make_interval(days => interval_days),p_now + interval '1 minute');
  next_time := public.next_allowed_notification_time(auth.uid(),greatest(requested_at,p_now + interval '1 minute'));

  insert into public.notifications (user_id,cycle_id,type,scheduled_for,deep_link,status,title,body,data,client_event_id)
  values (auth.uid(),owned_cycle.id,'next_action',next_time,'/cycle/' || owned_cycle.id::text,'pending',
    case when owned_cycle.status = 'harvest_ready' then seed_name || ' is ready' else seed_name || ' needs you' end,
    current_stage.next_action,
    jsonb_build_object('url','/cycle/' || owned_cycle.id::text,'cycleId',owned_cycle.id,'type','next_action'),
    extensions.gen_random_uuid())
  returning * into saved_notification;
  return saved_notification;
end;
$$;

create or replace function public.mark_cycle_action_done(p_cycle_id uuid, p_stage_id text, p_occurred_at timestamptz, p_client_event_id uuid)
returns public.cycles language plpgsql security definer set search_path = '' as $$
declare updated_cycle public.cycles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  update public.cycles set last_action_at = p_occurred_at, current_stage = p_stage_id
  where id = p_cycle_id and user_id = auth.uid() and status in ('active','harvest_ready') returning * into updated_cycle;
  if updated_cycle.id is null then raise exception 'active cycle not found' using errcode = 'P0002'; end if;
  insert into public.cycle_events (cycle_id,user_id,event_type,payload,occurred_at,client_event_id)
  values (p_cycle_id,auth.uid(),'action_completed',jsonb_build_object('stage_id',p_stage_id),p_occurred_at,p_client_event_id)
  on conflict (user_id,client_event_id) do nothing;
  perform public.refresh_cycle_notification(p_cycle_id,p_occurred_at);
  return updated_cycle;
end; $$;

create or replace function public.dispatch_due_notifications()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare queued_count integer := 0; notice public.notifications; device public.push_devices; request_id bigint;
begin
  for notice in select * from public.notifications where status = 'pending' and scheduled_for <= now() order by scheduled_for limit 100 for update skip locked loop
    for device in select * from public.push_devices where user_id = notice.user_id and enabled loop
      select net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := '{"Content-Type":"application/json","Accept":"application/json"}'::jsonb,
        body := jsonb_build_object('to',device.expo_push_token,'title',notice.title,'body',notice.body,'sound','default','data',notice.data)
      ) into request_id;
      queued_count := queued_count + 1;
      update public.notifications set provider_request_id = request_id where id = notice.id;
    end loop;
    if exists (select 1 from public.push_devices where user_id = notice.user_id and enabled) then
      update public.notifications set status = 'sent', delivered_at = now() where id = notice.id;
    end if;
  end loop;
  return queued_count;
end;
$$;

revoke all on function public.complete_cycle_harvest(uuid,timestamptz,text,uuid) from public;
revoke all on function public.register_push_device(text,text) from public;
revoke all on function public.update_notification_preferences(boolean,text,text,text) from public;
revoke all on function public.next_allowed_notification_time(uuid,timestamptz) from public;
revoke all on function public.refresh_cycle_notification(uuid,timestamptz) from public;
revoke all on function public.dispatch_due_notifications() from public;
grant execute on function public.complete_cycle_harvest(uuid,timestamptz,text,uuid) to authenticated;
grant execute on function public.register_push_device(text,text) to authenticated;
grant execute on function public.update_notification_preferences(boolean,text,text,text) to authenticated;
grant execute on function public.refresh_cycle_notification(uuid,timestamptz) to authenticated;
grant execute on function public.dispatch_due_notifications() to service_role;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'seednergy-dispatch-notifications') then
    perform cron.schedule('seednergy-dispatch-notifications','*/5 * * * *','select public.dispatch_due_notifications();');
  end if;
end;
$$;
