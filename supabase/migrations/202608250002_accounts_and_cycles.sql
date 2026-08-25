create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  city text,
  locale text,
  timezone text,
  environment uuid references public.environments(id),
  light_condition uuid references public.light_conditions(id),
  time_availability text,
  motivation text,
  notification_prefs jsonb not null default '{}'::jsonb,
  quiet_hours jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.cycles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  seed_id uuid not null references public.seeds(id),
  seed_content_version integer not null check (seed_content_version > 0),
  status text not null default 'active' check (status in ('active', 'harvest_ready', 'harvested', 'archived')),
  started_at timestamptz not null,
  timezone text not null,
  current_stage text,
  last_action_at timestamptz,
  harvested_at timestamptz,
  last_harvested_at timestamptz,
  harvest_count integer not null default 0 check (harvest_count >= 0),
  created_at timestamptz not null default now()
);

create table public.cycle_events (
  id uuid primary key default extensions.gen_random_uuid(),
  cycle_id uuid not null references public.cycles(id),
  user_id uuid not null references public.profiles(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  client_event_id uuid not null,
  schema_version integer not null default 1 check (schema_version > 0),
  unique (user_id, client_event_id)
);

create index cycles_user_status_idx on public.cycles(user_id, status);
create index cycle_events_cycle_occurred_idx on public.cycle_events(cycle_id, occurred_at);

alter table public.profiles enable row level security;
alter table public.cycles enable row level security;
alter table public.cycle_events enable row level security;

revoke all on public.profiles, public.cycles, public.cycle_events from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.cycles to authenticated;
grant select, insert on public.cycle_events to authenticated;

create policy "profiles select own row" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles update own row" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "cycles select own rows" on public.cycles for select to authenticated using (user_id = auth.uid());
create policy "events select own rows" on public.cycle_events for select to authenticated using (user_id = auth.uid());
create policy "events insert own rows" on public.cycle_events for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.cycles where cycles.id = cycle_events.cycle_id and cycles.user_id = auth.uid())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, coalesce(new.email, ''), nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.start_cycle(
  p_seed_id uuid,
  p_seed_content_version integer,
  p_started_at timestamptz,
  p_timezone text,
  p_client_event_id uuid
)
returns public.cycles
language plpgsql
security definer
set search_path = ''
as $$
declare created_cycle public.cycles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if not exists (
    select 1 from public.seeds
    where id = p_seed_id and active and content_version = p_seed_content_version
  ) then raise exception 'published seed version not found' using errcode = '22023'; end if;

  insert into public.cycles (user_id, seed_id, seed_content_version, started_at, timezone)
  values (auth.uid(), p_seed_id, p_seed_content_version, p_started_at, p_timezone)
  returning * into created_cycle;

  insert into public.cycle_events (cycle_id, user_id, event_type, payload, occurred_at, client_event_id)
  values (created_cycle.id, auth.uid(), 'cycle_started', jsonb_build_object('seed_content_version', p_seed_content_version), p_started_at, p_client_event_id);

  return created_cycle;
end;
$$;

revoke all on function public.start_cycle(uuid, integer, timestamptz, text, uuid) from public;
grant execute on function public.start_cycle(uuid, integer, timestamptz, text, uuid) to authenticated;

create or replace function public.reject_cycle_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'cycle_events is append-only' using errcode = '55000';
end;
$$;

create trigger cycle_events_reject_update
before update on public.cycle_events
for each row execute procedure public.reject_cycle_event_mutation();

create trigger cycle_events_reject_delete
before delete on public.cycle_events
for each row execute procedure public.reject_cycle_event_mutation();
