begin;

create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'a@example.com', extensions.crypt('password', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'b@example.com', extensions.crypt('password', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

select is((select count(*)::integer from public.profiles where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')), 2, 'signup trigger creates profiles');

insert into public.seeds (id, slug, name, description, expected_result, duration_days, access_type, active, content_version)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'test-cress', 'Test Cress', 'Test seed', 'Test result', 7, 'free', true, 1);

set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local request.jwt.claim.role = 'authenticated';

select lives_ok(
  $$select public.start_cycle('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 1, now(), 'Europe/London', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd')$$,
  'authenticated user can start a published cycle'
);
select is((select count(*)::integer from public.cycles), 1, 'user A can read its cycle');
select is((select count(*)::integer from public.cycle_events where event_type = 'cycle_started'), 1, 'starting a cycle appends its first event');
select throws_ok($$update public.cycle_events set event_type = 'changed'$$, '55000', 'cycle_events is append-only', 'cycle events cannot be updated');
select throws_ok($$delete from public.cycle_events$$, '55000', 'cycle_events is append-only', 'cycle events cannot be deleted');

set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select is((select count(*)::integer from public.cycles), 0, 'user B cannot read user A cycles');
select is((select public from storage.buckets where id = 'cycle-photos'), false, 'cycle photos bucket is private');

select * from finish();
rollback;
