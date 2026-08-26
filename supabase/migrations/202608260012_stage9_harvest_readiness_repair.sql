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
  authored_stage public.seed_stages;
  seed_mode text;
  cycle_day integer;
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
  if owned_cycle.status not in ('active','harvest_ready') then raise exception 'cycle is not active' using errcode = 'P0001'; end if;
  cycle_day := greatest(1,(p_harvested_at at time zone owned_cycle.timezone)::date - (owned_cycle.started_at at time zone owned_cycle.timezone)::date + 1);
  select * into authored_stage from public.seed_stages
  where seed_id = owned_cycle.seed_id and day_from <= cycle_day and (day_to is null or day_to >= cycle_day)
  order by position desc limit 1;
  if authored_stage.id is null or authored_stage.harvest_ready is false then raise exception 'cycle is not harvest ready' using errcode = 'P0001'; end if;
  if p_storage_path is not null and p_storage_path !~ ('^' || auth.uid()::text || '/' || p_cycle_id::text || '/harvest/') then raise exception 'invalid harvest photo path' using errcode = '22023'; end if;

  select harvest_mode into seed_mode from public.seeds where id = owned_cycle.seed_id;
  next_number := owned_cycle.harvest_count + 1;
  insert into public.harvests (cycle_id,user_id,seed_id,harvest_number,harvested_at,storage_path)
  values (owned_cycle.id,auth.uid(),owned_cycle.seed_id,next_number,p_harvested_at,p_storage_path)
  returning * into saved_harvest;

  update public.cycles set status = case when seed_mode = 'repeating' then 'active' else 'harvested' end,
    harvest_count = next_number, harvested_at = case when seed_mode = 'repeating' then harvested_at else p_harvested_at end,
    last_harvested_at = p_harvested_at, last_action_at = p_harvested_at
  where id = owned_cycle.id;
  insert into public.cycle_events (cycle_id,user_id,event_type,payload,occurred_at,client_event_id)
  values (owned_cycle.id,auth.uid(),'harvest_completed',jsonb_build_object('harvest_id',saved_harvest.id,'harvest_number',next_number,'storage_path',p_storage_path,'mode',seed_mode),p_harvested_at,p_client_event_id);
  update public.notifications set status = 'cancelled' where cycle_id = owned_cycle.id and user_id = auth.uid() and status = 'pending';
  return saved_harvest;
end;
$$;

create or replace function public.refresh_cycle_notification(p_cycle_id uuid, p_now timestamptz default now())
returns public.notifications
language plpgsql
security definer
set search_path = ''
as $$
declare owned_cycle public.cycles; profile public.profiles; seed_name text; current_stage public.seed_stages;
  cycle_day integer; interval_days integer; requested_at timestamptz; next_time timestamptz;
  saved_notification public.notifications; frequency text;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into owned_cycle from public.cycles where id = p_cycle_id and user_id = auth.uid();
  if owned_cycle.id is null then raise exception 'cycle not found' using errcode = 'P0002'; end if;
  select * into profile from public.profiles where id = auth.uid();
  delete from public.notifications where cycle_id = p_cycle_id and user_id = auth.uid() and status = 'pending';
  if owned_cycle.status not in ('active','harvest_ready') or coalesce((profile.notification_prefs->>'enabled')::boolean,false) is false then return null; end if;
  cycle_day := greatest(1,(p_now at time zone owned_cycle.timezone)::date - (owned_cycle.started_at at time zone owned_cycle.timezone)::date + 1);
  select * into current_stage from public.seed_stages where seed_id = owned_cycle.seed_id and day_from <= cycle_day and (day_to is null or day_to >= cycle_day) order by position desc limit 1;
  if current_stage.id is null then return null; end if;
  select name into seed_name from public.seeds where id = owned_cycle.seed_id;
  frequency := coalesce(profile.notification_prefs->>'frequency','daily');
  if frequency = 'important_only' and current_stage.harvest_ready is false then return null; end if;
  interval_days := greatest(current_stage.action_interval_days,case when frequency = 'every_other_day' then 2 else 1 end);
  requested_at := coalesce(owned_cycle.last_action_at + make_interval(days => interval_days),p_now + interval '1 minute');
  next_time := public.next_allowed_notification_time(auth.uid(),greatest(requested_at,p_now + interval '1 minute'));
  insert into public.notifications (user_id,cycle_id,type,scheduled_for,deep_link,status,title,body,data,client_event_id)
  values (auth.uid(),owned_cycle.id,'next_action',next_time,'/cycle/' || owned_cycle.id::text,'pending',
    case when current_stage.harvest_ready then seed_name || ' is ready' else seed_name || ' needs you' end,
    current_stage.next_action,jsonb_build_object('url','/cycle/' || owned_cycle.id::text,'cycleId',owned_cycle.id,'type','next_action'),extensions.gen_random_uuid())
  returning * into saved_notification;
  return saved_notification;
end;
$$;

