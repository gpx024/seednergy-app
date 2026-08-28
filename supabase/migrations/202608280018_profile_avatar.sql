alter table public.profiles
add column if not exists avatar_path text;

alter table public.profiles
drop constraint if exists profiles_avatar_path_owned;

alter table public.profiles
add constraint profiles_avatar_path_owned
check (avatar_path is null or avatar_path like id::text || '/profile/%');
