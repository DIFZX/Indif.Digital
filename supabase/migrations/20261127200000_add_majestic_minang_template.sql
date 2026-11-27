begin;

-- 1. Register Majestic Minang template in Catalog & Admin CMS
insert into public.templates (
  id,
  slug,
  name,
  theme,
  is_active,
  catalog_status,
  category,
  description,
  thumbnail_path,
  preview_path,
  sort_order,
  price,
  promo_price
) values (
  '00000000-0000-0000-0000-000000000016'::uuid,
  'majestic-minang',
  'Majestic Minang',
  '{"primary":"#5E2430","accent":"#D8B261","background":"#F6ECE5"}'::jsonb,
  true,
  'available',
  'spesial',
  'Template adat Minangkabau mewah bernuansa merah maroon & emas ukiran dengan video opening Rumah Gadang, payung kuniang, bingkai emas, dan fitur RSVP lengkap.',
  '/media/mockups/mockup-majestic-minang.webp',
  '/majestic-minang?to=Tamu%20Undangan',
  16,
  120000,
  80000
)
on conflict (slug) do update set
  name = excluded.name,
  theme = excluded.theme,
  is_active = excluded.is_active,
  catalog_status = excluded.catalog_status,
  category = excluded.category,
  description = excluded.description,
  thumbnail_path = excluded.thumbnail_path,
  preview_path = excluded.preview_path,
  sort_order = excluded.sort_order,
  price = excluded.price,
  promo_price = excluded.promo_price;

-- 2. Register Majestic Minang demo invitation using Dita & Fajar standard data
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
  '00000000-0000-0000-0000-000000000116'::uuid,
  t.id,
  'majestic-minang',
  'published'::public.invitation_status,
  src.bride_name, src.bride_short_name, src.bride_parents, src.bride_photo_path,
  src.groom_name, src.groom_short_name, src.groom_parents, src.groom_photo_path,
  src.event_date, src.ceremony_time, src.reception_time, src.venue_name, src.venue_address, src.maps_url,
  src.opening_text, src.quote_text, src.quote_source, src.story, src.story_image_path,
  src.cover_path, src.profile_path, src.gallery_paths, '/media/majestic-minang/minang-baralek-gadang.mp3', src.gift_info,
  '{}'::jsonb, src.closing_text, src.closing_greeting
from public.invitations src
cross join public.templates t
where src.slug = 'mustard-black' and t.slug = 'majestic-minang'
on conflict (slug) do nothing;

-- 3. Provision isolated Client RSVP Dashboard access token
insert into public.invitation_dashboard_access (invitation_id)
select id from public.invitations
where slug = 'majestic-minang'
on conflict (invitation_id) do nothing;

commit;
