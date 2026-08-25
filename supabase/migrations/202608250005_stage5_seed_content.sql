alter table public.seeds
  add column botanical_name text not null default 'Pending identification',
  add column duration_days_min integer not null default 1 check (duration_days_min > 0),
  add column duration_days_max integer not null default 1 check (duration_days_max >= duration_days_min),
  add column difficulty_label text not null default 'Easy',
  add column environment_summary text not null default 'Indoor',
  add column light_summary text not null default 'Bright indirect light',
  add column harvest_instructions text not null default 'Pending grower review',
  add column harvest_readiness text not null default 'Pending grower review',
  add column storage_guidance text not null default 'Pending grower review',
  add column content_review_status text not null default 'draft' check (content_review_status in ('draft', 'grower_reviewed')),
  add column content_sources jsonb not null default '[]'::jsonb,
  add column updated_at timestamptz not null default now();

alter table public.seed_stages
  add column what_is_happening text not null default 'Pending grower review',
  add column milestone text not null default 'Pending grower review',
  add column what_good_looks_like text not null default 'Pending grower review',
  add column common_problems jsonb not null default '[]'::jsonb,
  add column photo_check_prompt text,
  add column harvest_ready boolean not null default false;

create index seeds_library_order_idx on public.seeds (active desc, access_type, name);
create index seed_stages_seed_position_idx on public.seed_stages (seed_id, position);

insert into public.difficulty_levels (slug, label, position) values ('easy', 'Easy', 1)
on conflict (slug) do update set label = excluded.label, position = excluded.position, active = true;

insert into public.seeds (
  id, slug, name, botanical_name, description, expected_result, duration_days, duration_days_min, duration_days_max,
  difficulty_id, difficulty_label, environment_summary, light_summary, materials, access_type, taste_profile,
  images, active, content_version, harvest_mode, harvest_instructions, harvest_readiness, storage_guidance,
  content_review_status, content_sources
) values
(
  '10000000-0000-4000-8000-000000000001', 'cress', 'Cress', 'Lepidium sativum',
  'A quick, visible first grow with peppery leaves for sandwiches, salads and soups.',
  'A dense, even stand of upright green seedlings ready to cut above the growing medium.',
  14, 7, 14, (select id from public.difficulty_levels where slug = 'easy'), 'Easy', 'Bright indoor windowsill or grow light', 'Bright indirect light after germination',
  '["Cress seed sold for food growing","Clean shallow tray with drainage","Peat-free seed compost or clean growing mat","Clean drinking water","Clean scissors"]'::jsonb,
  'free', 'Fresh and peppery', '[{"kind":"bundled","key":"cress"}]'::jsonb, true, 1, 'single',
  'Wash your hands and use clean scissors. Cut the stems just above the growing medium. Rinse with fresh drinking water immediately before eating.',
  'Harvest when the cotyledons are open, the stand is green and upright, and the first true leaves are beginning to appear.',
  'Best used immediately. If needed, keep dry and refrigerated in a clean container for 1 to 2 days, then wash just before use.',
  'draft', '["https://www.rhs.org.uk/education-learning/school-gardening/resources/food-growing/growing-microgreens","https://extension.oregonstate.edu/imported-publication/microgreens","https://extension.psu.edu/a-step-by-step-guide-for-growing-microgreens-at-home"]'::jsonb
),
(
  '10000000-0000-4000-8000-000000000002', 'pea-shoots', 'Pea shoots', 'Pisum sativum',
  'Sweet, tender shoots with larger seeds and satisfying daily growth.',
  'A tray of sturdy green shoots with opened leaves and a fresh pea flavour.',
  10, 8, 10, (select id from public.difficulty_levels where slug = 'easy'), 'Easy', 'Bright indoor windowsill or grow light', 'Bright indirect light after shoots emerge',
  '["Pea seed sold for shoots or microgreens","Clean bowl for soaking","Clean shallow tray with drainage","Seed compost or coconut coir","Clean drinking water","Clean scissors"]'::jsonb,
  'paid', 'Sweet and pea-like', '[{"kind":"bundled","key":"pea-shoots"}]'::jsonb, true, 1, 'single',
  'Wash your hands and use clean scissors. Cut shoots above the growing medium before stems become tough. Rinse with fresh drinking water immediately before eating.',
  'Harvest when shoots are upright with opened leaves, usually around 8 to 10 days under suitable conditions.',
  'Best used immediately. If needed, keep dry and refrigerated in a clean container for 1 to 2 days, then wash just before use.',
  'draft', '["https://extension.usu.edu/yardandgarden/research/grow-your-own-microgreens","https://extension.psu.edu/a-step-by-step-guide-for-growing-microgreens-at-home","https://extension.psu.edu/ensuring-food-safety-in-microgreens-production"]'::jsonb
),
(
  '10000000-0000-4000-8000-000000000003', 'radish-microgreens', 'Radish microgreens', 'Raphanus sativus',
  'Fast-growing microgreens with crisp stems and a distinct radish warmth.',
  'An even canopy of upright stems with fully opened seed leaves and emerging first true leaves.',
  12, 8, 12, (select id from public.difficulty_levels where slug = 'easy'), 'Easy', 'Bright indoor windowsill or grow light', 'Bright indirect light after germination',
  '["Untreated radish seed sold for microgreens","Clean shallow tray with drainage","Seed compost or coconut coir","Clean drinking water","Clean scissors"]'::jsonb,
  'paid', 'Crisp, nutty and spicy', '[{"kind":"bundled","key":"radish-microgreens"}]'::jsonb, true, 1, 'single',
  'Wash your hands and use clean scissors. Cut above the growing medium while stems are crisp. Rinse with fresh drinking water immediately before eating.',
  'Harvest when most cotyledons are open and the first true leaves are beginning to emerge, usually around 8 to 12 days.',
  'Best used immediately. If needed, keep dry and refrigerated in a clean container for 1 to 2 days, then wash just before use.',
  'draft', '["https://extension.usu.edu/yardandgarden/research/grow-your-own-microgreens","https://extension.oregonstate.edu/imported-publication/microgreens","https://extension.psu.edu/the-abcs-of-microgreens"]'::jsonb
),
(
  '10000000-0000-4000-8000-000000000004', 'broccoli-microgreens', 'Broccoli microgreens', 'Brassica oleracea var. italica',
  'Mild brassica microgreens that form a soft green canopy in a small indoor space.',
  'A compact, even canopy of green cotyledons with the first true leaves just beginning to appear.',
  12, 8, 12, (select id from public.difficulty_levels where slug = 'easy'), 'Easy', 'Bright indoor windowsill or grow light', 'Bright indirect light after germination',
  '["Untreated broccoli seed sold for microgreens","Clean shallow tray with drainage","Seed compost or coconut coir","Clean drinking water","Clean scissors"]'::jsonb,
  'paid', 'Mild brassica and slightly nutty', '[{"kind":"bundled","key":"broccoli-microgreens"}]'::jsonb, true, 1, 'single',
  'Wash your hands and use clean scissors. Cut above the growing medium when the canopy is green and open. Rinse with fresh drinking water immediately before eating.',
  'Harvest when cotyledons are fully open and the first true leaves are just emerging, usually around 8 to 12 days.',
  'Best used immediately. If needed, keep dry and refrigerated in a clean container for 1 to 2 days, then wash just before use.',
  'draft', '["https://extension.usu.edu/yardandgarden/research/grow-your-own-microgreens","https://extension.psu.edu/the-abcs-of-microgreens","https://extension.psu.edu/ensuring-food-safety-in-microgreens-production"]'::jsonb
),
(
  '10000000-0000-4000-8000-000000000005', 'basil', 'Basil', 'Ocimum basilicum',
  'A slower aromatic grow planned for a future Seednergy release.', 'A fragrant basil crop guided from seed to harvest.',
  45, 30, 45, (select id from public.difficulty_levels where slug = 'easy'), 'Easy', 'Bright indoor space', 'Bright light',
  '[]'::jsonb, 'coming_soon', 'Aromatic', '[]'::jsonb, true, 1, 'repeating',
  'Coming soon', 'Coming soon', 'Coming soon', 'draft', '[]'::jsonb
)
on conflict (slug) do update set
  name = excluded.name, botanical_name = excluded.botanical_name, description = excluded.description, expected_result = excluded.expected_result,
  duration_days = excluded.duration_days, duration_days_min = excluded.duration_days_min, duration_days_max = excluded.duration_days_max,
  difficulty_id = excluded.difficulty_id, difficulty_label = excluded.difficulty_label, environment_summary = excluded.environment_summary,
  light_summary = excluded.light_summary, materials = excluded.materials, access_type = excluded.access_type, taste_profile = excluded.taste_profile,
  images = excluded.images, active = excluded.active, content_version = excluded.content_version, harvest_mode = excluded.harvest_mode,
  harvest_instructions = excluded.harvest_instructions, harvest_readiness = excluded.harvest_readiness, storage_guidance = excluded.storage_guidance,
  content_review_status = excluded.content_review_status, content_sources = excluded.content_sources, updated_at = now();

delete from public.seed_stages where seed_id in (
  '10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004'
);

insert into public.seed_stages (
  seed_id, stage, phase, position, day_from, day_to, guidance, next_action, action_interval_days, observation_prompt,
  what_is_happening, what_good_looks_like, common_problems, photo_check_prompt, harvest_ready, harvest_criteria
) values
('10000000-0000-4000-8000-000000000001','setup','setup',1,1,1,'Moisten the clean growing medium until it feels like a wrung-out sponge. Sow evenly and keep the surface damp, never waterlogged.','Set up and sow the tray',1,'Is the surface evenly damp with no standing water?','Seeds are taking up water before germination.','The seeds are spread evenly and remain in contact with a damp surface.','["Standing water or a saturated medium","Dense piles of overlapping seed","A dirty tray or treated seed"]'::jsonb,'Show the whole tray and the moisture level of the surface.',false,null),
('10000000-0000-4000-8000-000000000001','germination','growth',2,2,3,'Keep the medium consistently damp. Once seedlings emerge, move the tray into bright indirect light and allow gentle air movement.','Check moisture and emerging shoots',1,'Can you see even germination across most of the tray?','Roots and pale shoots are emerging from the seed coat.','Most of the tray is germinating evenly, with no slimy patches or unpleasant smell.','["Dry patches causing uneven germination","Excess water encouraging mould or rot","Pale shoots kept without light after emergence"]'::jsonb,'Photograph the tray from above in natural light.',false,null),
('10000000-0000-4000-8000-000000000001','growth','growth',3,4,9,'Give the seedlings bright indirect light. Check daily and bottom-water lightly only when the surface begins to dry.','Check moisture and light',1,'Are the stems upright and becoming greener?','Cotyledons are opening and turning green as the seedlings photosynthesise.','Upright green growth with an even canopy and a clean-smelling surface.','["Long leaning stems from insufficient light","Collapsed stems from excessive moisture","Fuzzy growth spreading beyond root hairs"]'::jsonb,'Show the canopy and the base of the stems without using flash.',false,null),
('10000000-0000-4000-8000-000000000001','pre-harvest','growth',4,10,12,'Keep the tray bright and evenly moist. Avoid wetting the leaves shortly before harvest.','Check harvest development',1,'Are the cotyledons open with the first true leaves beginning to show?','The canopy is filling out and approaching its best texture and flavour.','A dense, upright green canopy with no visible decay or slimy areas.','["Wilting from a dry medium","Yellow growth from weak light","Mould or a sour smell from excess moisture"]'::jsonb,'Show the full canopy and a close view of the leaves.',false,null),
('10000000-0000-4000-8000-000000000001','harvest','harvest',5,13,14,'Harvest with clean scissors above the growing medium. Rinse with fresh drinking water immediately before eating.','Harvest the cress',1,'Is the canopy green, upright and free from visible mould or decay?','The crop has reached the end of this short single-cut cycle.','Open green leaves, crisp stems and a clean fresh smell.','["Slimy or discoloured stems","Visible mould","An unpleasant or sour smell"]'::jsonb,'Show the canopy and stem bases clearly before cutting.',true,'{"cotyledons_open":true,"first_true_leaves_visible":true,"no_visible_decay":true}'::jsonb),

('10000000-0000-4000-8000-000000000002','setup','setup',1,1,1,'Soak pea seed in clean drinking water for about 6 hours, drain well, then sow evenly on a pre-moistened clean medium.','Soak, drain and sow the peas',1,'Are the seeds evenly spread and fully drained?','The larger seeds absorb water before sending out roots.','Plump drained seeds sit in one even layer on a damp, not flooded, medium.','["Soaking in unsafe water","Leaving seeds submerged too long","Standing water beneath the tray"]'::jsonb,'Show the full tray after sowing.',false,null),
('10000000-0000-4000-8000-000000000002','germination','growth',2,2,3,'Keep the tray covered while roots establish. Check daily, keep it damp and remove the cover when shoots begin lifting it.','Check germination and moisture',1,'Are roots and shoots emerging across most of the tray?','Roots anchor into the medium while shoots push upward.','Even emergence with firm pale shoots and no sour smell or slimy seed.','["Rotting seed from excess moisture","Uneven emergence from dry areas","A sour smell indicating decay"]'::jsonb,'Show the full tray and a close view of several seeds.',false,null),
('10000000-0000-4000-8000-000000000002','growth','growth',3,4,6,'Move the uncovered tray into bright indirect light. Bottom-water when needed and rotate the tray if the shoots lean strongly.','Give the shoots light and check moisture',1,'Are the shoots turning green and standing upright?','Leaves unfold and the shoots begin rapid green growth.','Firm upright shoots, green leaves and an evenly moist medium.','["Long pale shoots from delayed light","Leaning toward one light source","Soft stems from excessive moisture"]'::jsonb,'Show the height, leaves and base of the shoots.',false,null),
('10000000-0000-4000-8000-000000000002','pre-harvest','growth',4,7,8,'Keep the leaves dry and the medium lightly moist. Look for opened leaves and tender stems.','Check shoot tenderness',1,'Are most shoots upright with opened leaves?','The shoots are close to their best tender eating stage.','Fresh green leaves, crisp stems and no collapsed wet areas.','["Toughening stems from delayed harvest","Wilting from dryness","Dense wet foliage with poor airflow"]'::jsonb,'Show the full canopy and one representative shoot.',false,null),
('10000000-0000-4000-8000-000000000002','harvest','harvest',5,9,10,'Use clean scissors to cut above the growing medium. Rinse with fresh drinking water immediately before eating.','Harvest the pea shoots',1,'Are the shoots green, tender and free from visible decay?','The shoots have reached a tender single-cut harvest.','Opened green leaves, firm stems and a clean fresh smell.','["Tough or fibrous stems","Slimy leaves or stems","Visible mould or an unpleasant smell"]'::jsonb,'Show the canopy and the lower stems before cutting.',true,'{"leaves_open":true,"stems_upright":true,"no_visible_decay":true}'::jsonb),

('10000000-0000-4000-8000-000000000003','setup','setup',1,1,1,'Moisten a clean growing medium and sow untreated radish seed evenly. Press gently for good contact and cover during early germination.','Sow the radish tray',1,'Is the seed evenly distributed on a damp surface?','The seeds begin absorbing water and preparing to germinate.','An even single layer of seed on a damp, drained medium.','["Overlapping clumps of seed","Standing water","Seed not intended for edible microgreens"]'::jsonb,'Show the full tray after sowing.',false,null),
('10000000-0000-4000-8000-000000000003','germination','growth',2,2,3,'Keep the tray covered and damp while roots establish. Uncover when shoots lift the cover, then move into bright indirect light.','Check germination',1,'Are shoots emerging evenly across the tray?','Fast-growing radish roots and shoots are breaking through the seed coat.','Even emergence with firm shoots and no wet, collapsed patches.','["Dry corners causing patchy growth","Excess humidity and damping-off","Keeping emerged seedlings dark too long"]'::jsonb,'Show the whole tray and the base of the shoots.',false,null),
('10000000-0000-4000-8000-000000000003','growth','growth',3,4,6,'Provide bright indirect light and gentle air movement. Bottom-water only when the medium starts to dry.','Check light and moisture',1,'Are the stems upright and the cotyledons opening?','Cotyledons expand and the canopy becomes green and dense.','Crisp upright stems, open green cotyledons and an even canopy.','["Leaning or long stems from weak light","Collapsed stems from overwatering","Persistent seed hulls where the canopy stayed too dry"]'::jsonb,'Show the canopy and lower stems in natural light.',false,null),
('10000000-0000-4000-8000-000000000003','pre-harvest','growth',4,7,9,'Keep the medium lightly moist and avoid soaking the leaves. Watch for the first true leaves.','Check for first true leaves',1,'Can you see the first true leaves beginning between the cotyledons?','The crop is approaching its best balance of tenderness and flavour.','An upright canopy with fully open cotyledons and early true leaves.','["Wilting from dryness","Yellowing from insufficient light","Slimy patches or an unpleasant smell"]'::jsonb,'Show the full canopy and a close view of the leaf centres.',false,null),
('10000000-0000-4000-8000-000000000003','harvest','harvest',5,10,12,'Cut above the growing medium with clean scissors. Rinse with fresh drinking water immediately before eating.','Harvest the radish microgreens',1,'Are the cotyledons open and the first true leaves beginning to appear?','The microgreens have reached their crisp single-cut harvest stage.','Crisp coloured stems, open green leaves and no visible decay.','["Tougher stems from late harvest","Slimy or discoloured tissue","Visible mould or a sour smell"]'::jsonb,'Show the canopy and stem bases clearly before cutting.',true,'{"cotyledons_open":true,"first_true_leaves_visible":true,"no_visible_decay":true}'::jsonb),

('10000000-0000-4000-8000-000000000004','setup','setup',1,1,1,'Moisten a clean medium, sow untreated broccoli seed evenly and press gently for contact. Cover during early germination.','Sow the broccoli tray',1,'Is the seed distributed evenly on a damp surface?','Seeds are taking up water before roots emerge.','An even layer of seed on a clean, damp and drained medium.','["Dense piles of seed","Waterlogged medium","Treated seed not intended for microgreens"]'::jsonb,'Show the full tray after sowing.',false,null),
('10000000-0000-4000-8000-000000000004','germination','growth',2,2,3,'Keep the tray covered and damp. When shoots emerge, uncover and move it into bright indirect light.','Check germination',1,'Are pale shoots appearing across most of the tray?','Roots establish while shoots push upward and shed seed coats.','Even emergence without slimy patches, decay or unpleasant smell.','["Patchy emergence from dry areas","Damping-off from warm wet conditions","Keeping emerged shoots dark too long"]'::jsonb,'Show the full tray and several emerging shoots.',false,null),
('10000000-0000-4000-8000-000000000004','growth','growth',3,4,6,'Give the tray bright indirect light and gentle airflow. Bottom-water when the medium begins to dry.','Check moisture and light',1,'Are the cotyledons opening into an even green canopy?','The cotyledons expand and photosynthesis deepens their green colour.','Compact upright stems and an even green canopy.','["Long leaning stems from insufficient light","Collapsed stems from excess moisture","Dry edges causing uneven height"]'::jsonb,'Show the canopy and stem bases in natural light.',false,null),
('10000000-0000-4000-8000-000000000004','pre-harvest','growth',4,7,9,'Keep the medium lightly moist and the leaves mostly dry. Look for the first true leaves beginning to emerge.','Check harvest development',1,'Are most cotyledons open with tiny true leaves appearing?','The canopy is close to its tender harvest stage.','Open green cotyledons, upright stems and no wet collapsed areas.','["Yellowing in low light","Wilting from dryness","Mould encouraged by dense wet foliage"]'::jsonb,'Show the whole canopy and a close view of the leaf centres.',false,null),
('10000000-0000-4000-8000-000000000004','harvest','harvest',5,10,12,'Cut above the growing medium with clean scissors. Rinse with fresh drinking water immediately before eating.','Harvest the broccoli microgreens',1,'Are the cotyledons fully open and the first true leaves just visible?','The crop has reached a mild, tender single-cut harvest.','A compact green canopy, firm stems and a clean fresh smell.','["Toughening stems from delayed harvest","Slimy or discoloured tissue","Visible mould or an unpleasant smell"]'::jsonb,'Show the canopy and lower stems before cutting.',true,'{"cotyledons_open":true,"first_true_leaves_visible":true,"no_visible_decay":true}'::jsonb);

update public.seed_stages
set milestone = next_action
where seed_id in (
  '10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004'
);

create or replace function public.validate_stage5_seed_content()
returns trigger language plpgsql as $$
begin
  if new.active and new.access_type <> 'coming_soon' and (
    new.botanical_name = 'Pending identification' or jsonb_array_length(new.materials) = 0 or jsonb_array_length(new.images) = 0
  ) then
    raise exception 'Active launch seed content is incomplete';
  end if;
  return new;
end;
$$;

create trigger seeds_validate_stage5_content
before insert or update on public.seeds
for each row execute function public.validate_stage5_seed_content();
