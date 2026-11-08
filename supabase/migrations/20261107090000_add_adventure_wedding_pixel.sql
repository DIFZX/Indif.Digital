begin;

do $$
begin
  if not exists (select 1 from public.invitations where slug = 'sunda-vibes') then
    raise exception 'Register the Sunda Vibes preview before Adventure Wedding Pixel';
  end if;
  if exists (select 1 from public.templates where id = '00000000-0000-0000-0000-000000000010' and slug <> 'adventure-wedding-pixel')
    or exists (select 1 from public.invitations where id = '00000000-0000-0000-0000-000000000110' and slug <> 'adventure-wedding-pixel') then
    raise exception 'The Adventure Wedding Pixel seed IDs are already in use';
  end if;
end;
$$;

-- Initial publication is authorized for this release. Reapplication preserves
-- the sales administrator's visibility, price, status and invitation edits.
insert into public.templates (
  id, slug, name, theme, is_active, catalog_status, category,
  description, thumbnail_path, preview_path, sort_order, price, promo_price
)
select
  '00000000-0000-0000-0000-000000000010'::uuid,
  'adventure-wedding-pixel', 'Adventure Wedding Pixel',
  '{"primary":"#483021","accent":"#9d3e57","background":"#fff3d9"}'::jsonb,
  true, 'available', 'spesial',
  'Petualangan taman pixel interaktif dengan pilihan karakter, analog, tombol aksi, galeri, dan RSVP yang terhubung ke dashboard.',
  '/media/adventure-wedding-pixel/thumbnail.webp',
  '/adventure-wedding-pixel?to=Tamu%20Undangan', 10, source.price, source.promo_price
from public.templates as source where source.slug = 'sunda-vibes'
on conflict (slug) do nothing;

insert into public.invitations (
  id, template_id, slug, status,
  bride_name, bride_short_name, bride_parents, bride_photo_path,
  groom_name, groom_short_name, groom_parents, groom_photo_path,
  event_date, ceremony_time, reception_time, venue_name, venue_address, maps_url,
  opening_text, quote_text, quote_source, story, story_image_path,
  cover_path, profile_path, gallery_paths, music_path, gift_info,
  theme_overrides, closing_text, closing_greeting
)
select
  '00000000-0000-0000-0000-000000000110'::uuid,
  theme.id, 'adventure-wedding-pixel', 'published'::public.invitation_status,
  source.bride_name, source.bride_short_name, source.bride_parents, source.bride_photo_path,
  source.groom_name, source.groom_short_name, source.groom_parents, source.groom_photo_path,
  source.event_date, source.ceremony_time, source.reception_time,
  source.venue_name, source.venue_address, source.maps_url,
  source.opening_text, source.quote_text, source.quote_source, source.story, source.story_image_path,
  source.cover_path, source.profile_path, source.gallery_paths, source.music_path, source.gift_info,
  '{}'::jsonb, source.closing_text, source.closing_greeting
from public.invitations as source
cross join public.templates as theme
where source.slug = 'sunda-vibes' and theme.slug = 'adventure-wedding-pixel'
on conflict (slug) do nothing;

insert into public.invitation_dashboard_access (invitation_id)
select id from public.invitations where slug = 'adventure-wedding-pixel'
on conflict (invitation_id) do nothing;

commit;
