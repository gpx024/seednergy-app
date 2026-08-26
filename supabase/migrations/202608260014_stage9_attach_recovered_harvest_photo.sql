create or replace function public.attach_harvest_photo(p_harvest_id uuid, p_storage_path text)
returns public.harvests
language plpgsql
security definer
set search_path = ''
as $$
declare saved_harvest public.harvests;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into saved_harvest from public.harvests where id = p_harvest_id and user_id = auth.uid() for update;
  if saved_harvest.id is null then raise exception 'harvest not found' using errcode = 'P0002'; end if;
  if p_storage_path !~ ('^' || auth.uid()::text || '/' || saved_harvest.cycle_id::text || '/harvest/') then
    raise exception 'invalid harvest photo path' using errcode = '22023';
  end if;
  if saved_harvest.storage_path is null then
    update public.harvests set storage_path = p_storage_path where id = saved_harvest.id returning * into saved_harvest;
  end if;
  return saved_harvest;
end;
$$;

revoke all on function public.attach_harvest_photo(uuid,text) from public;
grant execute on function public.attach_harvest_photo(uuid,text) to authenticated;
