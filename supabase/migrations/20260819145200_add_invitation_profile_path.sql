alter table public.invitations
add column if not exists profile_path text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invitations_profile_path_media_check'
      and conrelid = 'public.invitations'::regclass
  ) then
    alter table public.invitations
    add constraint invitations_profile_path_media_check
    check (profile_path is null or profile_path like '/media/%');
  end if;
end
$$;

update public.invitations
set profile_path = '/media/elegant/profile-main-v1.jpeg'
where id = '00000000-0000-0000-0000-000000000101';
