create table public.account_deletion_audits (
  id uuid primary key default extensions.gen_random_uuid(),
  status text not null check (status in ('running','completed','failed')),
  deleted_objects integer not null default 0 check (deleted_objects >= 0),
  storage_verified_empty boolean not null default false,
  database_deleted boolean not null default false,
  auth_deleted boolean not null default false,
  error_code text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

comment on table public.account_deletion_audits is
  'Anonymous operational proof of account deletion. Deliberately stores no user identifier, email, token, file path or other personal data.';

alter table public.account_deletion_audits enable row level security;
revoke all on public.account_deletion_audits from anon, authenticated;
