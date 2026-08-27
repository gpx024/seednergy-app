create table public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('editor', 'publisher', 'owner')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;
revoke all on table public.app_admins from anon, authenticated;
grant select on table public.app_admins to authenticated;

create or replace function public.is_cms_admin(required_roles text[] default array['editor','publisher','owner'])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where user_id = auth.uid() and active and role = any(required_roles)
  );
$$;

revoke all on function public.is_cms_admin(text[]) from public;
grant execute on function public.is_cms_admin(text[]) to authenticated;

create policy "admins can read own role"
on public.app_admins for select to authenticated
using (user_id = auth.uid() and active);

create table public.seed_drafts (
  seed_id uuid primary key references public.seeds(id) on delete cascade,
  seed_data jsonb not null,
  stages_data jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'ready', 'published')),
  validation_errors jsonb not null default '[]'::jsonb,
  based_on_version integer not null default 0,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.seed_publications (
  seed_id uuid not null references public.seeds(id) on delete restrict,
  version integer not null check (version > 0),
  seed_data jsonb not null,
  stages_data jsonb not null,
  published_by uuid references auth.users(id),
  published_at timestamptz not null default now(),
  primary key (seed_id, version)
);

create table public.cms_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.cms_ai_settings (
  id text primary key default 'photo-check',
  model text not null default 'gpt-5.6-luna',
  prompt_version text not null default 'v1',
  system_prompt text not null default '',
  guardrails jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.cms_usage_limits (
  id text primary key default 'global',
  daily_photo_checks_per_user integer not null default 3 check (daily_photo_checks_per_user >= 0),
  daily_ai_cost_usd numeric(10,2) not null default 25 check (daily_ai_cost_usd >= 0),
  monthly_ai_cost_usd numeric(10,2) not null default 500 check (monthly_ai_cost_usd >= 0),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

do $$
declare table_name text;
begin
  foreach table_name in array array['seed_drafts','seed_publications','cms_audit_log','cms_ai_settings','cms_usage_limits']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end $$;

grant select, insert, update on public.seed_drafts to authenticated;
grant select on public.seed_publications to anon, authenticated;
grant select on public.cms_audit_log to authenticated;
grant select, insert, update on public.cms_ai_settings to authenticated;
grant select, insert, update on public.cms_usage_limits to authenticated;

create policy "admins manage seed drafts" on public.seed_drafts
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "published versions are readable" on public.seed_publications
for select to anon, authenticated using (true);
create policy "admins read audit log" on public.cms_audit_log
for select to authenticated using (public.is_cms_admin());
create policy "admins manage AI settings" on public.cms_ai_settings
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "admins manage usage limits" on public.cms_usage_limits
for all to authenticated using (public.is_cms_admin(array['publisher','owner']))
with check (public.is_cms_admin(array['publisher','owner']));

insert into public.seed_publications (seed_id, version, seed_data, stages_data)
select s.id, s.content_version, to_jsonb(s), coalesce(
  (select jsonb_agg(to_jsonb(ss) order by ss.position) from public.seed_stages ss where ss.seed_id = s.id),
  '[]'::jsonb
)
from public.seeds s
on conflict (seed_id, version) do nothing;

insert into public.seed_drafts (seed_id, seed_data, stages_data, status, based_on_version)
select s.id, to_jsonb(s), coalesce(
  (select jsonb_agg(to_jsonb(ss) order by ss.position) from public.seed_stages ss where ss.seed_id = s.id),
  '[]'::jsonb
), 'published', s.content_version
from public.seeds s
on conflict (seed_id) do nothing;

insert into public.cms_ai_settings (id) values ('photo-check') on conflict (id) do nothing;
insert into public.cms_usage_limits (id) values ('global') on conflict (id) do nothing;

create or replace function public.audit_seed_draft_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.cms_audit_log(actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), case when tg_op = 'INSERT' then 'draft_created' else 'draft_updated' end,
    'seed', new.seed_id::text, jsonb_build_object('status', new.status));
  return new;
end;
$$;

create trigger seed_drafts_audit
after insert or update on public.seed_drafts
for each row execute function public.audit_seed_draft_change();

create or replace function public.publish_seed_draft(p_seed_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  draft public.seed_drafts%rowtype;
  stage jsonb;
  next_version integer;
  stage_id uuid;
begin
  if not public.is_cms_admin(array['publisher','owner']) then raise exception 'Publisher access required'; end if;
  select * into draft from public.seed_drafts where seed_id = p_seed_id for update;
  if not found then raise exception 'Seed draft not found'; end if;
  if nullif(trim(draft.seed_data->>'name'), '') is null then raise exception 'Seed name is required'; end if;
  if (draft.seed_data->>'access_type') <> 'coming_soon' and jsonb_array_length(draft.stages_data) = 0 then
    raise exception 'Published seed requires at least one stage';
  end if;
  select coalesce(max(version), 0) + 1 into next_version from public.seed_publications where seed_id = p_seed_id;

  update public.seeds set
    slug = draft.seed_data->>'slug', name = draft.seed_data->>'name', botanical_name = draft.seed_data->>'botanical_name',
    description = draft.seed_data->>'description', expected_result = draft.seed_data->>'expected_result',
    duration_days = (draft.seed_data->>'duration_days')::integer,
    duration_days_min = (draft.seed_data->>'duration_days_min')::integer,
    duration_days_max = (draft.seed_data->>'duration_days_max')::integer,
    difficulty_label = draft.seed_data->>'difficulty_label', environment_summary = draft.seed_data->>'environment_summary',
    light_summary = draft.seed_data->>'light_summary', materials = coalesce(draft.seed_data->'materials', '[]'::jsonb),
    access_type = draft.seed_data->>'access_type', taste_profile = draft.seed_data->>'taste_profile',
    images = coalesce(draft.seed_data->'images', '[]'::jsonb), active = coalesce((draft.seed_data->>'active')::boolean, true),
    content_version = next_version, harvest_mode = draft.seed_data->>'harvest_mode',
    harvest_instructions = draft.seed_data->>'harvest_instructions', harvest_readiness = draft.seed_data->>'harvest_readiness',
    storage_guidance = draft.seed_data->>'storage_guidance', content_review_status = draft.seed_data->>'content_review_status',
    content_sources = coalesce(draft.seed_data->'content_sources', '[]'::jsonb), updated_at = now()
  where id = p_seed_id;

  delete from public.seed_stages where seed_id = p_seed_id;
  for stage in select value from jsonb_array_elements(draft.stages_data)
  loop
    stage_id := case when coalesce(stage->>'id','') ~* '^[0-9a-f-]{36}$' then (stage->>'id')::uuid else extensions.gen_random_uuid() end;
    insert into public.seed_stages (
      id, seed_id, stage, phase, position, day_from, day_to, guidance, next_action, action_interval_days,
      observation_prompt, image, harvest_criteria, what_is_happening, milestone, what_good_looks_like,
      common_problems, photo_check_prompt, harvest_ready
    ) values (
      stage_id, p_seed_id, stage->>'stage', stage->>'phase', (stage->>'position')::integer,
      (stage->>'day_from')::integer, nullif(stage->>'day_to','')::integer, stage->>'guidance', stage->>'next_action',
      coalesce((stage->>'action_interval_days')::integer, 1), stage->>'observation_prompt', nullif(stage->>'image',''),
      stage->'harvest_criteria', stage->>'what_is_happening', stage->>'milestone', stage->>'what_good_looks_like',
      coalesce(stage->'common_problems','[]'::jsonb), nullif(stage->>'photo_check_prompt',''),
      coalesce((stage->>'harvest_ready')::boolean, false)
    );
  end loop;

  insert into public.seed_publications(seed_id, version, seed_data, stages_data, published_by)
  values (p_seed_id, next_version,
    jsonb_set(jsonb_set(draft.seed_data, '{content_version}', to_jsonb(next_version)), '{updated_at}', to_jsonb(now())),
    (select coalesce(jsonb_agg(to_jsonb(ss) order by ss.position), '[]'::jsonb) from public.seed_stages ss where ss.seed_id = p_seed_id),
    auth.uid());
  update public.seed_drafts set status = 'published', based_on_version = next_version,
    seed_data = jsonb_set(seed_data, '{content_version}', to_jsonb(next_version)), updated_by = auth.uid(), updated_at = now()
  where seed_id = p_seed_id;
  insert into public.cms_audit_log(actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'seed_published', 'seed', p_seed_id::text, jsonb_build_object('version', next_version));
  return next_version;
end;
$$;

revoke all on function public.publish_seed_draft(uuid) from public;
grant execute on function public.publish_seed_draft(uuid) to authenticated;

create or replace function public.get_cms_dashboard_metrics()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_cms_admin() then raise exception 'Admin access required'; end if;
  return jsonb_build_object(
    'activeSeeds', (select count(*) from public.seeds where active),
    'drafts', (select count(*) from public.seed_drafts where status <> 'published'),
    'activeCycles', (select count(*) from public.cycles where status in ('active','harvest_ready')),
    'users', (select count(*) from public.profiles where deleted_at is null),
    'aiRequestsToday', (select count(*) from public.ai_request_logs where created_at >= current_date),
    'aiCostTodayUsd', (select coalesce(sum(cost_estimate_usd),0) from public.ai_request_logs where created_at >= current_date)
  );
end;
$$;

revoke all on function public.get_cms_dashboard_metrics() from public;
grant execute on function public.get_cms_dashboard_metrics() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('seed-content', 'seed-content', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "admins upload seed content" on storage.objects for insert to authenticated
with check (bucket_id = 'seed-content' and public.is_cms_admin());
create policy "admins update seed content" on storage.objects for update to authenticated
using (bucket_id = 'seed-content' and public.is_cms_admin()) with check (bucket_id = 'seed-content' and public.is_cms_admin());
create policy "admins delete seed content" on storage.objects for delete to authenticated
using (bucket_id = 'seed-content' and public.is_cms_admin(array['publisher','owner']));
