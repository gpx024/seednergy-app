create or replace function public.remove_harvest_photo(p_harvest_id uuid)
returns public.harvests language plpgsql security definer set search_path = '' as $$
declare saved public.harvests;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  update public.harvests set storage_path = null where id = p_harvest_id and user_id = auth.uid() returning * into saved;
  if saved.id is null then raise exception 'harvest not found' using errcode = 'P0002'; end if;
  return saved;
end;
$$;

create or replace function public.delete_photo_check(p_photo_check_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare saved public.photo_checks;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into saved from public.photo_checks where id = p_photo_check_id and user_id = auth.uid();
  if saved.id is null then return; end if;
  perform set_config('seednergy.account_deletion', 'true', true);
  delete from public.cycle_events where user_id = auth.uid() and event_type = 'photo_check_completed' and payload->>'photo_check_id' = saved.id::text;
  delete from public.ai_request_logs where user_id = auth.uid() and client_event_id = saved.client_event_id;
  delete from public.photo_checks where id = saved.id;
end;
$$;

revoke all on function public.remove_harvest_photo(uuid), public.delete_photo_check(uuid) from public;
grant execute on function public.remove_harvest_photo(uuid), public.delete_photo_check(uuid) to authenticated;
