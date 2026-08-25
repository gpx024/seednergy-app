insert into public.environments (id, slug, label, position) values
  ('20000000-0000-4000-8000-000000000001', 'indoor', 'Indoor', 1),
  ('20000000-0000-4000-8000-000000000002', 'balcony', 'Balcony', 2),
  ('20000000-0000-4000-8000-000000000003', 'outdoor', 'Outdoor small space', 3)
on conflict (slug) do update set label = excluded.label, position = excluded.position, active = true;

insert into public.light_conditions (id, slug, label, position) values
  ('30000000-0000-4000-8000-000000000001', 'low', 'Low light', 1),
  ('30000000-0000-4000-8000-000000000002', 'medium', 'Medium light', 2),
  ('30000000-0000-4000-8000-000000000003', 'bright', 'Bright indirect light', 3)
on conflict (slug) do update set label = excluded.label, position = excluded.position, active = true;

alter table public.profiles
  add column environment_slug text,
  add column light_condition_slug text,
  add column onboarding_completed_at timestamptz;

create or replace function public.complete_onboarding(
  p_display_name text,
  p_environment_slug text,
  p_light_slug text,
  p_time_availability text,
  p_motivation text,
  p_timezone text,
  p_notifications_enabled boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_environment_slug not in ('indoor','balcony','outdoor') then raise exception 'invalid environment' using errcode = '22023'; end if;
  if p_light_slug not in ('low','medium','bright') then raise exception 'invalid light condition' using errcode = '22023'; end if;
  if p_time_availability not in ('minimal','moderate','flexible') then raise exception 'invalid time availability' using errcode = '22023'; end if;
  if p_motivation not in ('food','nature','calm','sustainability') then raise exception 'invalid motivation' using errcode = '22023'; end if;

  update public.profiles set
    display_name = coalesce(nullif(trim(p_display_name), ''), display_name),
    environment = (select id from public.environments where slug = p_environment_slug),
    environment_slug = p_environment_slug,
    light_condition = (select id from public.light_conditions where slug = p_light_slug),
    light_condition_slug = p_light_slug,
    time_availability = p_time_availability,
    motivation = p_motivation,
    timezone = p_timezone,
    notification_prefs = jsonb_build_object('enabled', p_notifications_enabled),
    onboarding_completed_at = now()
  where id = auth.uid()
  returning * into updated_profile;
  return updated_profile;
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
  return updated_cycle;
end; $$;

create or replace function public.archive_cycle(p_cycle_id uuid, p_occurred_at timestamptz, p_client_event_id uuid)
returns public.cycles language plpgsql security definer set search_path = '' as $$
declare updated_cycle public.cycles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  update public.cycles set status = 'archived' where id = p_cycle_id and user_id = auth.uid() and status <> 'archived' returning * into updated_cycle;
  if updated_cycle.id is null then raise exception 'cycle not found' using errcode = 'P0002'; end if;
  insert into public.cycle_events (cycle_id,user_id,event_type,payload,occurred_at,client_event_id)
  values (p_cycle_id,auth.uid(),'cycle_archived','{}'::jsonb,p_occurred_at,p_client_event_id)
  on conflict (user_id,client_event_id) do nothing;
  return updated_cycle;
end; $$;

create or replace function public.restart_cycle(p_cycle_id uuid, p_started_at timestamptz, p_timezone text, p_client_event_id uuid)
returns public.cycles language plpgsql security definer set search_path = '' as $$
declare old_cycle public.cycles; created_cycle public.cycles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into old_cycle from public.cycles where id = p_cycle_id and user_id = auth.uid();
  if old_cycle.id is null then raise exception 'cycle not found' using errcode = 'P0002'; end if;
  update public.cycles set status = 'archived' where id = old_cycle.id;
  insert into public.cycles (user_id,seed_id,seed_content_version,started_at,timezone)
  values (auth.uid(),old_cycle.seed_id,old_cycle.seed_content_version,p_started_at,p_timezone) returning * into created_cycle;
  insert into public.cycle_events (cycle_id,user_id,event_type,payload,occurred_at,client_event_id)
  values (created_cycle.id,auth.uid(),'cycle_restarted',jsonb_build_object('previous_cycle_id',old_cycle.id),p_started_at,p_client_event_id);
  return created_cycle;
end; $$;

revoke all on function public.complete_onboarding(text,text,text,text,text,text,boolean) from public;
revoke all on function public.mark_cycle_action_done(uuid,text,timestamptz,uuid) from public;
revoke all on function public.archive_cycle(uuid,timestamptz,uuid) from public;
revoke all on function public.restart_cycle(uuid,timestamptz,text,uuid) from public;
grant execute on function public.complete_onboarding(text,text,text,text,text,text,boolean) to authenticated;
grant execute on function public.mark_cycle_action_done(uuid,text,timestamptz,uuid) to authenticated;
grant execute on function public.archive_cycle(uuid,timestamptz,uuid) to authenticated;
grant execute on function public.restart_cycle(uuid,timestamptz,text,uuid) to authenticated;
