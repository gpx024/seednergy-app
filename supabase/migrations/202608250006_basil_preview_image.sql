update public.seeds
set images = '[{"kind":"bundled","key":"basil"}]'::jsonb,
    updated_at = now()
where slug = 'basil' and access_type = 'coming_soon';
