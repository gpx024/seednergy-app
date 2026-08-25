create table public.photo_checks (
  id uuid primary key default extensions.gen_random_uuid(),
  cycle_id uuid not null references public.cycles(id),
  user_id uuid not null references public.profiles(id),
  check_type uuid references public.check_types(id),
  storage_path text not null,
  submitted_at timestamptz not null default now(),
  status text not null,
  confidence text,
  result jsonb,
  quota_consumed boolean not null default false,
  retention_expires_at timestamptz,
  error_code text
);

create table public.entitlements (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  product_id text not null,
  provider text not null,
  provider_transaction_id text not null,
  status text not null,
  starts_at timestamptz not null,
  expires_at timestamptz,
  unique (provider, provider_transaction_id)
);

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  cycle_id uuid references public.cycles(id),
  type text not null,
  scheduled_for timestamptz not null,
  delivered_at timestamptz,
  deep_link text,
  status text not null
);

alter table public.photo_checks enable row level security;
alter table public.entitlements enable row level security;
alter table public.notifications enable row level security;

revoke all on public.photo_checks, public.entitlements, public.notifications from anon, authenticated;
grant select, insert on public.photo_checks to authenticated;
grant select on public.entitlements to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

create policy "photo checks select own rows" on public.photo_checks for select to authenticated using (user_id = auth.uid());
create policy "photo checks insert own rows" on public.photo_checks for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.cycles where cycles.id = photo_checks.cycle_id and cycles.user_id = auth.uid())
);
create policy "entitlements select own rows" on public.entitlements for select to authenticated using (user_id = auth.uid());
create policy "notifications select own rows" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications insert own rows" on public.notifications for insert to authenticated with check (user_id = auth.uid());
create policy "notifications update own rows" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications delete own rows" on public.notifications for delete to authenticated using (user_id = auth.uid());
