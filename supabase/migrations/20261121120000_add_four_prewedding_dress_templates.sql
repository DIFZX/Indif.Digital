begin;

-- 1. Insert 4 Prewedding Dress Minimalist Templates into Catalog
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
) values
(
  '00000000-0000-0000-0000-000000000011'::uuid,
  'champagne-ivory',
  'Champagne Ivory',
  '{"primary":"#B89358","accent":"#E8D5B5","background":"#FAF7F2"}'::jsonb,
  true,
  'available',
  'minimalis',
  'Template mewah bernuansa champagne & white silk prewedding dengan aksen arch emas halus, layout minimalis, dan fitur digital lengkap.',
  '/media/mustard-black/1.jpg',
  '/champagne-ivory?to=Tamu%20Undangan',
  11,
  70000,
  35000
),
(
  '00000000-0000-0000-0000-000000000012'::uuid,
  'dusty-rose',
  'Dusty Rose',
  '{"primary":"#B86B7B","accent":"#EBB8C2","background":"#FCF6F7"}'::jsonb,
  true,
  'available',
  'minimalis',
  'Template romantis bernuansa blush pink & dusty rose dress prewedding dengan kelopak mawar anggun, nuansa manis, dan RSVP interaktif.',
  '/media/mustard-black/1.jpg',
  '/dusty-rose?to=Tamu%20Undangan',
  12,
  70000,
  35000
),
(
  '00000000-0000-0000-0000-000000000013'::uuid,
  'sage-botanical',
  'Sage Botanical',
  '{"primary":"#52704E","accent":"#A3C09F","background":"#F4F6F2"}'::jsonb,
  true,
  'available',
  'minimalis',
  'Template sejuk bernuansa sage green & eucalyptus prewedding dengan ornamen botanical organik, sentuhan alami, dan amplop digital.',
  '/media/mustard-black/1.jpg',
  '/sage-botanical?to=Tamu%20Undangan',
  13,
  70000,
  35000
),
(
  '00000000-0000-0000-0000-000000000014'::uuid,
  'terracotta-warmth',
  'Terracotta Warmth',
  '{"primary":"#B55B39","accent":"#E8A285","background":"#FAF4EE"}'::jsonb,
  true,
  'available',
  'minimalis',
  'Template bohemian hangat bernuansa terracotta & desert sand prewedding dengan aksen sunburst earthy, tata letak chic, dan buku tamu online.',
  '/media/mustard-black/1.jpg',
  '/terracotta-warmth?to=Tamu%20Undangan',
  14,
  70000,
  35000
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

-- 2. Insert Invitations using Dita & Fajar data (copied from mustard-black)
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
  '00000000-0000-0000-0000-000000000111'::uuid,
  t.id,
  'champagne-ivory',
  'published'::public.invitation_status,
  src.bride_name, src.bride_short_name, src.bride_parents, src.bride_photo_path,
  src.groom_name, src.groom_short_name, src.groom_parents, src.groom_photo_path,
  src.event_date, src.ceremony_time, src.reception_time, src.venue_name, src.venue_address, src.maps_url,
  src.opening_text, src.quote_text, src.quote_source, src.story, src.story_image_path,
  src.cover_path, src.profile_path, src.gallery_paths, src.music_path, src.gift_info,
  '{}'::jsonb, src.closing_text, src.closing_greeting
from public.invitations src
cross join public.templates t
where src.slug = 'mustard-black' and t.slug = 'champagne-ivory'
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
  '00000000-0000-0000-0000-000000000112'::uuid,
  t.id,
  'dusty-rose',
  'published'::public.invitation_status,
  src.bride_name, src.bride_short_name, src.bride_parents, src.bride_photo_path,
  src.groom_name, src.groom_short_name, src.groom_parents, src.groom_photo_path,
  src.event_date, src.ceremony_time, src.reception_time, src.venue_name, src.venue_address, src.maps_url,
  src.opening_text, src.quote_text, src.quote_source, src.story, src.story_image_path,
  src.cover_path, src.profile_path, src.gallery_paths, src.music_path, src.gift_info,
  '{}'::jsonb, src.closing_text, src.closing_greeting
from public.invitations src
cross join public.templates t
where src.slug = 'mustard-black' and t.slug = 'dusty-rose'
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
  '00000000-0000-0000-0000-000000000113'::uuid,
  t.id,
  'sage-botanical',
  'published'::public.invitation_status,
  src.bride_name, src.bride_short_name, src.bride_parents, src.bride_photo_path,
  src.groom_name, src.groom_short_name, src.groom_parents, src.groom_photo_path,
  src.event_date, src.ceremony_time, src.reception_time, src.venue_name, src.venue_address, src.maps_url,
  src.opening_text, src.quote_text, src.quote_source, src.story, src.story_image_path,
  src.cover_path, src.profile_path, src.gallery_paths, src.music_path, src.gift_info,
  '{}'::jsonb, src.closing_text, src.closing_greeting
from public.invitations src
cross join public.templates t
where src.slug = 'mustard-black' and t.slug = 'sage-botanical'
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
  '00000000-0000-0000-0000-000000000114'::uuid,
  t.id,
  'terracotta-warmth',
  'published'::public.invitation_status,
  src.bride_name, src.bride_short_name, src.bride_parents, src.bride_photo_path,
  src.groom_name, src.groom_short_name, src.groom_parents, src.groom_photo_path,
  src.event_date, src.ceremony_time, src.reception_time, src.venue_name, src.venue_address, src.maps_url,
  src.opening_text, src.quote_text, src.quote_source, src.story, src.story_image_path,
  src.cover_path, src.profile_path, src.gallery_paths, src.music_path, src.gift_info,
  '{}'::jsonb, src.closing_text, src.closing_greeting
from public.invitations src
cross join public.templates t
where src.slug = 'mustard-black' and t.slug = 'terracotta-warmth'
on conflict (slug) do nothing;

-- 3. Register client dashboard access tokens for the 4 invitations
insert into public.invitation_dashboard_access (invitation_id)
select id from public.invitations
where slug in ('champagne-ivory', 'dusty-rose', 'sage-botanical', 'terracotta-warmth')
on conflict (invitation_id) do nothing;

commit;
