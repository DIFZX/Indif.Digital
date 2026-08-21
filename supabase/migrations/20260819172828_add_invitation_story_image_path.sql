alter table public.invitations
add column if not exists story_image_path text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invitations_story_image_path_media_check'
      and conrelid = 'public.invitations'::regclass
  ) then
    alter table public.invitations
    add constraint invitations_story_image_path_media_check
    check (story_image_path is null or story_image_path like '/media/%');
  end if;
end
$$;

update public.invitations
set story_image_path = '/media/invitations/intan-dan-difa/story/story-running-v1.png'
where id = '00000000-0000-0000-0000-000000000101';
