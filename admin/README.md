# Seednergy CMS

Private Next.js administration for the Seednergy Supabase project.

## Local setup

1. Apply `supabase/migrations/202608270016_stage14_cms.sql`.
2. Create `admin/.env.local` from `.env.example` using the client-owned Supabase URL and publishable key.
3. Add `http://localhost:3000/auth/callback` to Supabase Auth redirect URLs.
4. Sign in once, then add that authenticated user to `public.app_admins` from the Supabase SQL editor:

```sql
insert into public.app_admins (user_id, role)
select id, 'owner' from auth.users where email = 'your-admin-email@example.com'
on conflict (user_id) do update set role = excluded.role, active = true;
```

5. Run `npm install` and `npm run dev` inside `admin/`.

## Access model

- Editors save drafts and upload seed imagery.
- Publishers can also publish immutable seed versions and set usage limits.
- Owners have publisher rights and are intended to manage administrator membership through Supabase.
- The browser receives only the publishable key. PostgreSQL RLS performs authorization.

## Storage

- `seed-content` is public-read and admin-write, for approved catalogue and stage imagery.
- `cycle-photos` remains private. User paths begin with the authenticated user ID and can only be accessed by that user under RLS.

## Deployment

Deploy `admin/` as a separate Next.js project, for example on Vercel. Add the three variables from `.env.example`, use the deployed domain as `NEXT_PUBLIC_SITE_URL`, and add `https://your-domain/auth/callback` to Supabase Auth redirect URLs.

Backups are handled at the Supabase project level, but database backups do not contain the binary objects in Supabase Storage. Follow the repository [backup and restore runbook](../docs/BACKUP_RESTORE_RUNBOOK.md) for separate database and Storage verification. Before a production launch, enable the appropriate Supabase backup or point-in-time recovery plan and establish encrypted off-site retention for Storage objects.
