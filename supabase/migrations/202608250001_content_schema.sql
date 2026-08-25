create extension if not exists pgcrypto with schema extensions;

create table public.seed_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.environments (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.light_conditions (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.difficulty_levels (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.experience_levels (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.equipment_items (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.use_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.check_types (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  label text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.seeds (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  expected_result text not null,
  duration_days integer not null check (duration_days > 0),
  difficulty_id uuid references public.difficulty_levels(id),
  category_id uuid references public.seed_categories(id),
  experience_level_id uuid references public.experience_levels(id),
  environment_fit uuid[] not null default '{}',
  light_needs uuid[] not null default '{}',
  materials jsonb not null default '[]'::jsonb,
  access_type text not null check (access_type in ('free', 'paid', 'coming_soon')),
  taste_profile text,
  use_categories uuid[] not null default '{}',
  images jsonb not null default '[]'::jsonb,
  active boolean not null default false,
  content_version integer not null check (content_version > 0),
  harvest_mode text not null default 'single' check (harvest_mode in ('single', 'repeating')),
  season_start_month smallint check (season_start_month between 1 and 12),
  season_end_month smallint check (season_end_month between 1 and 12),
  hemisphere_sensitive boolean not null default false,
  space_requirement text,
  equipment_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.seed_stages (
  id uuid primary key default extensions.gen_random_uuid(),
  seed_id uuid not null references public.seeds(id) on delete cascade,
  stage text not null,
  phase text not null check (phase in ('setup', 'growth', 'harvest')),
  position integer not null check (position > 0),
  day_from integer not null check (day_from > 0),
  day_to integer check (day_to is null or day_to >= day_from),
  guidance text not null,
  next_action text not null,
  action_interval_days integer not null default 1 check (action_interval_days > 0),
  observation_prompt text not null,
  image text,
  harvest_criteria jsonb,
  unique (seed_id, position),
  unique (seed_id, stage)
);

do $$
declare table_name text;
begin
  foreach table_name in array array['seed_categories','environments','light_conditions','difficulty_levels','experience_levels','equipment_items','use_categories','check_types','seeds','seed_stages']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select on table public.%I to anon, authenticated', table_name);
  end loop;
end $$;

create policy "active lookup values are readable" on public.seed_categories for select using (active);
create policy "active environments are readable" on public.environments for select using (active);
create policy "active light conditions are readable" on public.light_conditions for select using (active);
create policy "active difficulties are readable" on public.difficulty_levels for select using (active);
create policy "active experience levels are readable" on public.experience_levels for select using (active);
create policy "active equipment is readable" on public.equipment_items for select using (active);
create policy "active use categories are readable" on public.use_categories for select using (active);
create policy "active check types are readable" on public.check_types for select using (active);
create policy "published seeds are readable" on public.seeds for select using (active);
create policy "published seed stages are readable" on public.seed_stages for select using (
  exists (select 1 from public.seeds where seeds.id = seed_stages.seed_id and seeds.active)
);
