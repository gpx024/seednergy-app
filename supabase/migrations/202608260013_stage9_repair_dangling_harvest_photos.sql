update public.harvests as harvest
set storage_path = null
where harvest.storage_path is not null
  and not exists (
    select 1 from storage.objects as object
    where object.bucket_id = 'cycle-photos'
      and object.name = harvest.storage_path
  );
