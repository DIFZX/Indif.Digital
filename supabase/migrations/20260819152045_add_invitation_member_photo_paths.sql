alter table public.invitations
add column if not exists bride_photo_path text,
add column if not exists groom_photo_path text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'invitations_bride_photo_path_media_check'
      and conrelid = 'public.invitations'::regclass
  ) then
    alter table public.invitations
    add constraint invitations_bride_photo_path_media_check
    check (bride_photo_path is null or bride_photo_path like '/media/%');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'invitations_groom_photo_path_media_check'
      and conrelid = 'public.invitations'::regclass
  ) then
    alter table public.invitations
    add constraint invitations_groom_photo_path_media_check
    check (groom_photo_path is null or groom_photo_path like '/media/%');
  end if;
end
$$;

update public.invitations
set
  bride_photo_path = '/media/elegant/bride-intan-v1.png',
  groom_photo_path = '/media/elegant/groom-difa-v1.png'
where id = '00000000-0000-0000-0000-000000000101';
