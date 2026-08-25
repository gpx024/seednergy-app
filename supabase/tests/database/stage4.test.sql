begin;

create extension if not exists pgtap with schema extensions;
create temporary table stage4_test_results (result text not null) on commit drop;
alter table stage4_test_results enable row level security;
grant select, insert on stage4_test_results to authenticated;
create policy "test results are writable" on stage4_test_results for all to authenticated using (true) with check (true);
insert into stage4_test_results select plan(10);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'a@example.com', extensions.crypt('password', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'b@example.com', extensions.crypt('password', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

insert into stage4_test_results select is((select count(*)::integer from public.profiles where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')), 2, 'signup trigger creates profiles');

insert into public.seeds (id, slug, name, description, expected_result, duration_days, access_type, active, content_version)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'test-cress', 'Test Cress', 'Test seed', 'Test result', 7, 'free', true, 1);

set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
set local request.jwt.claim.role = 'authenticated';

insert into stage4_test_results select lives_ok(
  $$select public.start_cycle('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 1, now(), 'Europe/London', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd')$$,
  'authenticated user can start a published cycle'
);
insert into stage4_test_results select is((select count(*)::integer from public.cycles), 1, 'user A can read its cycle');
insert into stage4_test_results select is((select count(*)::integer from public.cycle_events where event_type = 'cycle_started'), 1, 'starting a cycle appends its first event');
insert into stage4_test_results select throws_ok($$update public.cycle_events set event_type = 'changed'$$, '42501', 'permission denied for table cycle_events', 'authenticated users cannot update cycle events');
insert into stage4_test_results select throws_ok($$delete from public.cycle_events$$, '42501', 'permission denied for table cycle_events', 'authenticated users cannot delete cycle events');

reset role;
insert into stage4_test_results select throws_ok($$update public.cycle_events set event_type = 'changed'$$, '55000', 'cycle_events is append-only', 'database trigger rejects cycle event updates');
insert into stage4_test_results select throws_ok($$delete from public.cycle_events$$, '55000', 'cycle_events is append-only', 'database trigger rejects cycle event deletes');
insert into stage4_test_results select is((select public from storage.buckets where id = 'cycle-photos'), false, 'cycle photos bucket is private');

set local role authenticated;
set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
insert into stage4_test_results select is((select count(*)::integer from public.cycles), 0, 'user B cannot read user A cycles');

insert into stage4_test_results select * from finish();
select result from stage4_test_results;
rollback;
