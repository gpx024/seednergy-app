insert into public.cms_ai_settings (id, prompt_version)
values ('growth-check','v1'),('issue-feedback','v1'),('stage-review','v1'),('harvest-readiness','v1')
on conflict (id) do nothing;

insert into public.cms_usage_limits (id, daily_photo_checks_per_user)
values ('free',3),('paid',3)
on conflict (id) do nothing;

create or replace function public.validate_seed_publication()
returns trigger language plpgsql set search_path = public as $$
declare stage jsonb; expected_position integer := 1; expected_day integer := 1;
begin
  if new.seed_data->>'access_type' <> 'coming_soon' and jsonb_array_length(coalesce(new.seed_data->'images','[]'::jsonb)) = 0 then
    raise exception 'Published seed requires at least one image';
  end if;
  if new.seed_data->>'access_type' <> 'coming_soon' and jsonb_array_length(new.stages_data) = 0 then
    raise exception 'Published seed requires at least one stage';
  end if;
  for stage in select value from jsonb_array_elements(new.stages_data) order by (value->>'position')::integer
  loop
    if (stage->>'position')::integer <> expected_position or (stage->>'day_from')::integer <> expected_day then
      raise exception 'Stages must be contiguous and ordered';
    end if;
    if nullif(trim(stage->>'next_action'),'') is null or nullif(trim(stage->>'guidance'),'') is null
      or nullif(trim(stage->>'observation_prompt'),'') is null then
      raise exception 'Every stage requires an action, guidance and observation prompt';
    end if;
    expected_position := expected_position + 1;
    expected_day := coalesce((stage->>'day_to')::integer, (stage->>'day_from')::integer) + 1;
  end loop;
  return new;
end;
$$;

create trigger seed_publications_validate
before insert on public.seed_publications
for each row execute function public.validate_seed_publication();

create or replace function public.create_seed_draft(p_name text, p_slug text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare new_id uuid := extensions.gen_random_uuid(); seed_json jsonb;
begin
  if not public.is_cms_admin() then raise exception 'Admin access required'; end if;
  if nullif(trim(p_name),'') is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'A name and URL-safe slug are required'; end if;
  insert into public.seeds (
    id, slug, name, description, expected_result, duration_days, environment_fit, light_needs, materials,
    access_type, use_categories, images, active, content_version, botanical_name, duration_days_min,
    duration_days_max, difficulty_label, environment_summary, light_summary, harvest_instructions,
    harvest_readiness, storage_guidance, content_review_status, content_sources, taste_profile
  ) values (
    new_id, p_slug, p_name, 'Draft description', 'Draft expected result', 7, '{}', '{}', '[]',
    'coming_soon', '{}', '[]', false, 1, 'Pending identification', 1, 7, 'Easy', 'Indoor',
    'Bright indirect light', 'Pending grower review', 'Pending grower review', 'Pending grower review',
    'draft', '[]', 'Pending grower review'
  );
  select to_jsonb(s) into seed_json from public.seeds s where id = new_id;
  insert into public.seed_drafts(seed_id, seed_data, stages_data, status, based_on_version, updated_by)
  values (new_id, seed_json, '[]', 'draft', 0, auth.uid());
  return new_id;
end;
$$;

revoke all on function public.create_seed_draft(text,text) from public;
grant execute on function public.create_seed_draft(text,text) to authenticated;

create or replace function public.get_cms_dashboard_metrics()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_cms_admin() then raise exception 'Admin access required'; end if;
  return jsonb_build_object(
    'activeSeeds', (select count(*) from public.seeds where active),
    'drafts', (select count(*) from public.seed_drafts where status <> 'published'),
    'activeCycles', (select count(*) from public.cycles where status in ('active','harvest_ready')),
    'completedCycles', (select count(*) from public.cycles where status in ('harvested','archived')),
    'users', (select count(*) from public.profiles where deleted_at is null),
    'aiRequestsToday', (select count(*) from public.ai_request_logs where created_at >= current_date),
    'aiCostTodayUsd', (select coalesce(sum(cost_estimate_usd),0) from public.ai_request_logs where created_at >= current_date),
    'seedPopularity', (select coalesce(jsonb_agg(row_data order by starts desc),'[]'::jsonb) from (
      select jsonb_build_object('name',s.name,'starts',count(c.id)) as row_data, count(c.id) as starts
      from public.seeds s left join public.cycles c on c.seed_id=s.id group by s.id,s.name
    ) popularity)
  );
end;
$$;
