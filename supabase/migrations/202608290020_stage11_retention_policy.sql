create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

update public.privacy_configuration
set check_photo_retention_days = 90, updated_at = now()
where id = true;

alter table public.photo_checks alter column storage_path drop not null;

update public.photo_checks
set retention_expires_at = submitted_at + interval '90 days'
where retention_expires_at is null;

create or replace function public.set_photo_check_retention()
returns trigger language plpgsql set search_path = '' as $$
declare retention_days integer;
begin
  select check_photo_retention_days into retention_days from public.privacy_configuration where id = true;
  if retention_days is not null then new.retention_expires_at := new.submitted_at + make_interval(days => retention_days); end if;
  return new;
end;
$$;

drop trigger if exists set_photo_check_retention on public.photo_checks;
create trigger set_photo_check_retention before insert on public.photo_checks
for each row execute function public.set_photo_check_retention();

select cron.schedule(
  'seednergy-photo-retention-daily',
  '17 3 * * *',
  $$select net.http_post(
    url := 'https://kvkrmazwjkjhcziawebh.supabase.co/functions/v1/photo-retention',
    headers := jsonb_build_object('Content-Type','application/json','x-retention-secret',(select decrypted_secret from vault.decrypted_secrets where name = 'photo_retention_job_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );$$
);

comment on column public.photo_checks.retention_expires_at is 'AI check image deletion deadline. Guidance metadata remains available after the private image is removed.';
