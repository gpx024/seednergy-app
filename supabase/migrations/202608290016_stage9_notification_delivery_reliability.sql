alter table public.push_devices
  add column if not exists disabled_reason text,
  add column if not exists last_registered_at timestamptz not null default now();

alter table public.notifications
  add column if not exists last_error_code text,
  add column if not exists last_error_message text;

create table public.notification_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  push_device_id uuid not null references public.push_devices(id) on delete cascade,
  platform text not null check (platform in ('android','ios')),
  status text not null default 'pending' check (status in ('pending','sending','retry','ticketed','receipt_pending','provider_accepted','failed')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 5),
  receipt_attempt_count integer not null default 0 check (receipt_attempt_count between 0 and 5),
  next_attempt_at timestamptz not null default now(),
  ticket_request_id bigint,
  ticket_id text,
  receipt_request_id bigint,
  error_code text,
  error_message text,
  ticketed_at timestamptz,
  provider_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (notification_id, push_device_id)
);

create index notification_deliveries_work_idx
  on public.notification_deliveries(status, next_attempt_at)
  where status in ('pending','retry','ticketed','sending','receipt_pending');
create index notification_deliveries_ticket_request_idx on public.notification_deliveries(ticket_request_id) where ticket_request_id is not null;
create index notification_deliveries_receipt_request_idx on public.notification_deliveries(receipt_request_id) where receipt_request_id is not null;

alter table public.notification_deliveries enable row level security;
revoke all on public.notification_deliveries from anon, authenticated;
grant select on public.notification_deliveries to authenticated;
create policy "notification deliveries select own rows"
on public.notification_deliveries for select to authenticated
using (exists (
  select 1 from public.notifications notice
  where notice.id = notification_id and notice.user_id = auth.uid()
));

create or replace view public.notification_delivery_metrics
with (security_invoker = true)
as
select
  date_trunc('day', created_at) as delivery_day,
  platform,
  status,
  coalesce(error_code, 'none') as error_code,
  count(*)::bigint as delivery_count,
  avg(attempt_count)::numeric(10,2) as average_attempts
from public.notification_deliveries
group by 1, 2, 3, 4;

revoke all on public.notification_delivery_metrics from anon, authenticated;
grant select on public.notification_delivery_metrics to service_role;

create or replace function public.notification_retry_delay(p_attempt_count integer)
returns interval
language sql
immutable
set search_path = ''
as $$
  select case
    when p_attempt_count <= 1 then interval '1 minute'
    when p_attempt_count = 2 then interval '5 minutes'
    when p_attempt_count = 3 then interval '15 minutes'
    else interval '1 hour'
  end;
$$;

create or replace function public.refresh_notification_delivery_status(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  delivery_count integer;
  delivered_count integer;
  terminal_count integer;
  accepted_count integer;
  latest_error record;
begin
  select count(*),
         count(*) filter (where status = 'provider_accepted'),
         count(*) filter (where status in ('provider_accepted','failed')),
         count(*) filter (where status in ('ticketed','receipt_pending','provider_accepted'))
  into delivery_count, delivered_count, terminal_count, accepted_count
  from public.notification_deliveries
  where notification_id = p_notification_id;

  select error_code, error_message into latest_error
  from public.notification_deliveries
  where notification_id = p_notification_id and error_code is not null
  order by updated_at desc limit 1;

  update public.notifications
  set status = case
        when delivered_count > 0 then 'provider_accepted'
        when delivery_count > 0 and terminal_count = delivery_count then 'failed'
        when accepted_count > 0 then 'sent'
        else 'processing'
      end,
      delivered_at = case when delivered_count > 0 then coalesce(delivered_at, now()) else delivered_at end,
      last_error_code = latest_error.error_code,
      last_error_message = left(latest_error.error_message, 500)
  where id = p_notification_id and status <> 'cancelled';
end;
$$;

create or replace function public.fail_or_retry_notification_delivery(
  p_delivery_id uuid,
  p_error_code text,
  p_error_message text,
  p_retryable boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare delivery public.notification_deliveries;
begin
  select * into delivery from public.notification_deliveries where id = p_delivery_id for update;
  if delivery.id is null then return; end if;

  if p_error_code = 'DeviceNotRegistered' then
    update public.push_devices
    set enabled = false, disabled_reason = p_error_code, updated_at = now()
    where id = delivery.push_device_id;
  end if;

  update public.notification_deliveries
  set status = case when p_retryable and attempt_count < 5 then 'retry' else 'failed' end,
      next_attempt_at = case when p_retryable and attempt_count < 5
        then now() + public.notification_retry_delay(attempt_count)
        else next_attempt_at end,
      ticket_request_id = null,
      ticket_id = null,
      receipt_request_id = null,
      error_code = left(coalesce(p_error_code, 'UnknownPushError'), 100),
      error_message = left(coalesce(p_error_message, 'Push delivery failed.'), 500),
      updated_at = now()
  where id = delivery.id;

  perform public.refresh_notification_delivery_status(delivery.notification_id);
end;
$$;

create or replace function public.dispatch_due_notifications()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare queued_count integer := 0; delivery record; request_id bigint;
begin
  insert into public.notification_deliveries (notification_id,push_device_id,platform)
  select notice.id, device.id, device.platform
  from public.notifications notice
  join public.push_devices device on device.user_id = notice.user_id and device.enabled
  where notice.status in ('pending','processing') and notice.scheduled_for <= now()
  on conflict (notification_id,push_device_id) do nothing;

  update public.notifications notice
  set status = 'failed', last_error_code = 'NoRegisteredDevice', last_error_message = 'No enabled push device is registered.'
  where notice.status = 'pending' and notice.scheduled_for <= now()
    and not exists (select 1 from public.push_devices device where device.user_id = notice.user_id and device.enabled);

  for delivery in
    select d.id, d.notification_id, d.attempt_count, device.expo_push_token,
           notice.title, notice.body, notice.data
    from public.notification_deliveries d
    join public.push_devices device on device.id = d.push_device_id and device.enabled
    join public.notifications notice on notice.id = d.notification_id and notice.status <> 'cancelled'
    where d.status in ('pending','retry') and d.next_attempt_at <= now() and d.attempt_count < 5
    order by d.next_attempt_at
    limit 100
    for update of d skip locked
  loop
    select net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      headers := '{"Content-Type":"application/json","Accept":"application/json"}'::jsonb,
      body := jsonb_build_object(
        'to',delivery.expo_push_token,
        'title',delivery.title,
        'body',delivery.body,
        'sound','default',
        'channelId','cycle-actions',
        'data',delivery.data
      ),
      timeout_milliseconds := 10000
    ) into request_id;

    update public.notification_deliveries
    set status = 'sending', ticket_request_id = request_id,
        receipt_request_id = null, attempt_count = attempt_count + 1,
        error_code = null, error_message = null, updated_at = now()
    where id = delivery.id;
    update public.notifications set status = 'processing' where id = delivery.notification_id and status <> 'cancelled';
    queued_count := queued_count + 1;
  end loop;
  return queued_count;
end;
$$;

create or replace function public.reconcile_push_tickets()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare processed integer := 0; delivery record; response record; payload jsonb; ticket jsonb; error_code text;
begin
  for delivery in
    select * from public.notification_deliveries
    where status = 'sending' and ticket_request_id is not null
    order by updated_at limit 100 for update skip locked
  loop
    select * into response from net._http_response where id = delivery.ticket_request_id;
    if response.id is null then continue; end if;
    processed := processed + 1;

    if response.error_msg is not null or response.timed_out or response.status_code = 429 or response.status_code >= 500 then
      perform public.fail_or_retry_notification_delivery(delivery.id,'ExpoTransportError',coalesce(response.error_msg,'Expo push request failed.'),true);
      continue;
    elsif response.status_code < 200 or response.status_code >= 300 then
      perform public.fail_or_retry_notification_delivery(delivery.id,'ExpoRequestRejected',coalesce(response.content,'Expo rejected the push request.'),false);
      continue;
    end if;

    begin payload := response.content::jsonb;
    exception when others then
      perform public.fail_or_retry_notification_delivery(delivery.id,'InvalidExpoResponse','Expo returned an unreadable push ticket.',true);
      continue;
    end;
    ticket := payload->'data';
    if jsonb_typeof(ticket) = 'array' then ticket := ticket->0; end if;
    error_code := ticket#>>'{details,error}';
    if ticket->>'status' = 'ok' and nullif(ticket->>'id','') is not null then
      update public.notification_deliveries
      set status = 'ticketed', ticket_id = ticket->>'id', ticketed_at = now(),
          next_attempt_at = now() + interval '15 minutes', updated_at = now()
      where id = delivery.id;
      perform public.refresh_notification_delivery_status(delivery.notification_id);
    else
      perform public.fail_or_retry_notification_delivery(
        delivery.id,
        coalesce(error_code,'ExpoTicketError'),
        coalesce(ticket->>'message','Expo rejected the push ticket.'),
        error_code = 'MessageRateExceeded'
      );
    end if;
  end loop;
  return processed;
end;
$$;

create or replace function public.request_push_receipts()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare queued_count integer := 0; delivery record; request_id bigint;
begin
  for delivery in
    select * from public.notification_deliveries
    where status = 'ticketed' and ticket_id is not null and next_attempt_at <= now() and receipt_attempt_count < 5
    order by next_attempt_at limit 100 for update skip locked
  loop
    select net.http_post(
      url := 'https://exp.host/--/api/v2/push/getReceipts',
      headers := '{"Content-Type":"application/json","Accept":"application/json"}'::jsonb,
      body := jsonb_build_object('ids',jsonb_build_array(delivery.ticket_id)),
      timeout_milliseconds := 10000
    ) into request_id;
    update public.notification_deliveries
    set status = 'receipt_pending', receipt_request_id = request_id,
        receipt_attempt_count = receipt_attempt_count + 1, updated_at = now()
    where id = delivery.id;
    queued_count := queued_count + 1;
  end loop;
  return queued_count;
end;
$$;

create or replace function public.reconcile_push_receipts()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare processed integer := 0; delivery record; response record; payload jsonb; receipt jsonb; error_code text;
begin
  for delivery in
    select * from public.notification_deliveries
    where status = 'receipt_pending' and receipt_request_id is not null
    order by updated_at limit 100 for update skip locked
  loop
    select * into response from net._http_response where id = delivery.receipt_request_id;
    if response.id is null then continue; end if;
    processed := processed + 1;

    if response.error_msg is not null or response.timed_out or response.status_code = 429 or response.status_code >= 500 then
      update public.notification_deliveries
      set status = case when receipt_attempt_count < 5 then 'ticketed' else 'failed' end,
          receipt_request_id = null,
          next_attempt_at = now() + interval '5 minutes',
          error_code = 'ReceiptTransportError', error_message = left(coalesce(response.error_msg,'Expo receipt request failed.'),500),
          updated_at = now()
      where id = delivery.id;
      perform public.refresh_notification_delivery_status(delivery.notification_id);
      continue;
    elsif response.status_code < 200 or response.status_code >= 300 then
      update public.notification_deliveries
      set status = 'failed', error_code = 'ReceiptRequestRejected', error_message = left(coalesce(response.content,'Expo rejected the receipt request.'),500), updated_at = now()
      where id = delivery.id;
      perform public.refresh_notification_delivery_status(delivery.notification_id);
      continue;
    end if;

    begin payload := response.content::jsonb;
    exception when others then
      update public.notification_deliveries
      set status = case when receipt_attempt_count < 5 then 'ticketed' else 'failed' end,
          receipt_request_id = null, next_attempt_at = now() + interval '5 minutes',
          error_code = 'InvalidReceiptResponse', error_message = 'Expo returned an unreadable receipt response.', updated_at = now()
      where id = delivery.id;
      perform public.refresh_notification_delivery_status(delivery.notification_id);
      continue;
    end;

    receipt := payload->'data'->delivery.ticket_id;
    if receipt is null then
      update public.notification_deliveries
      set status = case when receipt_attempt_count < 5 then 'ticketed' else 'failed' end,
          receipt_request_id = null, next_attempt_at = now() + interval '5 minutes',
          error_code = 'ReceiptUnavailable', error_message = 'Expo did not return a receipt before the retry limit.', updated_at = now()
      where id = delivery.id;
      perform public.refresh_notification_delivery_status(delivery.notification_id);
      continue;
    end if;

    error_code := receipt#>>'{details,error}';
    if receipt->>'status' = 'ok' then
      update public.notification_deliveries
      set status = 'provider_accepted', provider_accepted_at = now(), error_code = null, error_message = null, updated_at = now()
      where id = delivery.id;
      perform public.refresh_notification_delivery_status(delivery.notification_id);
    else
      perform public.fail_or_retry_notification_delivery(
        delivery.id,
        coalesce(error_code,'ExpoReceiptError'),
        coalesce(receipt->>'message','The push provider rejected the notification.'),
        error_code = 'MessageRateExceeded'
      );
    end if;
  end loop;
  return processed;
end;
$$;

create or replace function public.process_notification_delivery_queue()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare tickets integer; receipts integer; sends integer; receipt_requests integer;
begin
  update public.notification_deliveries
  set status = case when attempt_count < 5 then 'retry' else 'failed' end,
      next_attempt_at = now(), ticket_request_id = null,
      error_code = 'TicketRequestTimeout', error_message = 'The Expo ticket request did not complete before the recovery window.', updated_at = now()
  where status = 'sending' and updated_at < now() - interval '15 minutes';
  update public.notification_deliveries
  set status = case when receipt_attempt_count < 5 then 'ticketed' else 'failed' end,
      next_attempt_at = now(), receipt_request_id = null,
      error_code = 'ReceiptRequestTimeout', error_message = 'The Expo receipt request did not complete before the recovery window.', updated_at = now()
  where status = 'receipt_pending' and updated_at < now() - interval '15 minutes';
  tickets := public.reconcile_push_tickets();
  receipts := public.reconcile_push_receipts();
  sends := public.dispatch_due_notifications();
  receipt_requests := public.request_push_receipts();
  return jsonb_build_object('tickets',tickets,'receipts',receipts,'sends',sends,'receipt_requests',receipt_requests);
end;
$$;

create or replace function public.register_push_device(p_expo_push_token text, p_platform text)
returns public.push_devices
language plpgsql
security definer
set search_path = ''
as $$
declare saved_device public.push_devices;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_expo_push_token !~ '^ExponentPushToken\[[A-Za-z0-9_-]+\]$' and p_expo_push_token !~ '^ExpoPushToken\[[A-Za-z0-9_-]+\]$' then
    raise exception 'invalid Expo push token' using errcode = '22023';
  end if;
  if p_platform not in ('android','ios') then raise exception 'invalid platform' using errcode = '22023'; end if;
  insert into public.push_devices (user_id,expo_push_token,platform,enabled,disabled_reason,last_registered_at,updated_at)
  values (auth.uid(),p_expo_push_token,p_platform,true,null,now(),now())
  on conflict (user_id,expo_push_token) do update
  set platform = excluded.platform, enabled = true, disabled_reason = null, last_registered_at = now(), updated_at = now()
  returning * into saved_device;
  return saved_device;
end;
$$;

create or replace function public.update_notification_preferences(
  p_enabled boolean,
  p_frequency text,
  p_quiet_start text,
  p_quiet_end text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare updated_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_frequency not in ('daily','every_other_day','important_only') then raise exception 'invalid frequency' using errcode = '22023'; end if;
  if p_quiet_start !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or p_quiet_end !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or p_quiet_start = p_quiet_end then
    raise exception 'invalid quiet hours' using errcode = '22023';
  end if;
  update public.profiles set
    notification_prefs = jsonb_build_object('enabled',p_enabled,'frequency',p_frequency),
    quiet_hours = jsonb_build_object('start',p_quiet_start,'end',p_quiet_end)
  where id = auth.uid() returning * into updated_profile;
  if not p_enabled then
    update public.notifications set status = 'cancelled' where user_id = auth.uid() and status in ('pending','processing','sent');
    update public.push_devices set enabled = false, disabled_reason = 'UserDisabled', updated_at = now() where user_id = auth.uid();
    update public.notification_deliveries delivery
    set status = 'failed', error_code = 'UserDisabled', error_message = 'The user disabled notifications.', updated_at = now()
    from public.notifications notice
    where delivery.notification_id = notice.id and notice.user_id = auth.uid()
      and delivery.status in ('pending','retry','ticketed','receipt_pending');
  end if;
  return updated_profile;
end;
$$;

revoke all on function public.notification_retry_delay(integer) from public;
revoke all on function public.refresh_notification_delivery_status(uuid) from public;
revoke all on function public.fail_or_retry_notification_delivery(uuid,text,text,boolean) from public;
revoke all on function public.dispatch_due_notifications() from public;
revoke all on function public.reconcile_push_tickets() from public;
revoke all on function public.request_push_receipts() from public;
revoke all on function public.reconcile_push_receipts() from public;
revoke all on function public.process_notification_delivery_queue() from public;
grant execute on function public.process_notification_delivery_queue() to service_role;

do $$
declare existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'seednergy-dispatch-notifications';
  if existing_job is not null then perform cron.unschedule(existing_job); end if;
  perform cron.schedule('seednergy-dispatch-notifications','*/5 * * * *','select public.process_notification_delivery_queue();');
end;
$$;
