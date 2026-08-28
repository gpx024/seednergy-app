# Backup and restore runbook

This runbook covers the Seednergy application data held in Supabase PostgreSQL and Supabase Storage. A database backup does not include the binary files stored in Storage, so both parts must be backed up and verified separately.

## Scope

- PostgreSQL application schema and rows in `public`.
- Public seed imagery in the `seed-content` bucket.
- Private user cycle and harvest imagery in the `cycle-photos` bucket.
- Authentication identities required by foreign keys from application records.

Do not store database passwords, service-role keys, access tokens, or private user photos in Git.

## Database backup

1. Confirm the Supabase CLI is authenticated and the client-owned project is linked.
2. Create timestamped schema and data dumps outside the repository:

```powershell
npx supabase db dump --linked --schema public --file <backup-folder>\public-schema.sql
npx supabase db dump --linked --schema public --data-only --use-copy --file <backup-folder>\public-data.sql
```

3. Record the file sizes and SHA-256 hashes:

```powershell
Get-FileHash <backup-folder>\public-schema.sql -Algorithm SHA256
Get-FileHash <backup-folder>\public-data.sql -Algorithm SHA256
```

4. Keep the backup in an encrypted location separate from the live Supabase project.

For a complete production recovery, also retain the authentication identities referenced by `public.profiles`. Prefer Supabase managed backups for a project-level recovery. An application-only logical restore must recreate or import the matching `auth.users` IDs before foreign-key validation.

## Database restore verification

Always restore into a disposable PostgreSQL instance or a dedicated recovery project, never over the live project.

1. Create an empty PostgreSQL database compatible with the live PostgreSQL major version.
2. Restore the public schema.
3. Import the required authentication user IDs, or use a controlled restore session that defers foreign-key enforcement until the matching identities exist.
4. Restore the public data.
5. Re-enable constraint enforcement and compare every application table row count with the source.
6. Run representative integrity checks for profiles, seeds, publications, cycles, cycle events, harvests, and analytics.
7. Destroy the disposable database after recording the result.

## Storage backup

Storage objects must be downloaded separately from the database dump.

1. Enumerate both buckets recursively:

```powershell
npx supabase storage ls --experimental --linked -r ss:///seed-content
npx supabase storage ls --experimental --linked -r ss:///cycle-photos
```

2. Download every listed object to an encrypted backup folder while preserving its bucket-relative path. The current Windows CLI may require copying objects individually rather than recursively.
3. Record the object count, total bytes, and SHA-256 hash of every downloaded file.
4. Do not publish or inspect private `cycle-photos` content as part of the backup process.

## Storage restore verification

1. Choose one downloaded object from each non-empty bucket.
2. Upload it to the same bucket under a unique `_restore-verification/<timestamp>/` prefix. Never overwrite an existing application object.
3. Download the temporary object to a second local path.
4. Confirm the original and restored SHA-256 hashes match.
5. Delete the temporary remote object and confirm the verification prefix is empty.
6. Delete local verification copies after the result is recorded.

Do not weaken Storage RLS policies to make a restore test pass. Use authorized administrative recovery credentials and keep private object names out of reports.

## Verification record, 28 August 2026

- The `public` schema and data were restored into a disposable local PostgreSQL instance.
- All 28 application tables matched their source row counts.
- Representative matches included 13 profiles, 5 seeds, 8 seed publications, 14 cycles, 30 cycle events, 1 harvest, and 28 analytics events.
- `cycle-photos` contained 3 objects totalling 168,609 bytes. All were downloaded and hashed.
- One `cycle-photos` object was uploaded to a unique verification prefix, downloaded again, and matched its source SHA-256 hash exactly.
- The temporary remote object was deleted and the verification prefix was confirmed empty.
- `seed-content` contained no application objects, so no binary restore could be performed for that bucket. Repeat the object restore test after the first CMS image is uploaded.

## Launch gate

Before production launch:

- Select the appropriate Supabase managed backup or point-in-time recovery plan.
- Establish encrypted off-site retention for Storage objects.
- Schedule recurring backups and periodic restore drills.
- Repeat the `seed-content` restore test after it contains an approved image.

