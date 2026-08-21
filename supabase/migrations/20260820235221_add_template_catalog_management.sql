alter table public.templates
  add column if not exists description text not null default '',
  add column if not exists thumbnail_path text,
  add column if not exists preview_path text,
  add column if not exists sort_order integer not null default 0;

alter table public.templates
  drop constraint if exists templates_thumbnail_path_media_check,
  add constraint templates_thumbnail_path_media_check
    check (thumbnail_path is null or thumbnail_path like '/media/%'),
  drop constraint if exists templates_preview_path_check,
  add constraint templates_preview_path_check
    check (preview_path is null or preview_path like '/%');

update public.templates
set
  slug = 'greeny-flowers',
  name = 'Greeny Flowers',
  description = 'Nuansa hijau yang lembut, detail bunga yang hangat, dan susunan elegan untuk kisah yang terasa dekat dan personal.',
  thumbnail_path = '/media/elegant/gallery-couple-v2.png',
  preview_path = '/intan-dan-difa?to=Tamu%20Undangan',
  sort_order = 1
where id = '00000000-0000-0000-0000-000000000001';

create index if not exists templates_catalog_sort_idx
  on public.templates (is_active, sort_order, created_at);

grant select on table public.templates to anon;
grant select on table public.templates to authenticated;
grant update (is_active) on table public.templates to authenticated;

create policy "admins can update template visibility"
on public.templates
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);
