-- Royal Maroon changes presentation only. All sample wedding content and media
-- come from Java Vibes; guest responses remain isolated by invitation_id.
begin;

do $$
begin
  if not exists (select 1 from public.invitations where slug = 'java-vibes') then
    raise exception 'Java Vibes must be seeded before adding Royal Maroon';
  end if;
end;
$$;

insert into public.templates (
  id, slug, name, theme, is_active, description, thumbnail_path, preview_path, sort_order
)
values (
  '00000000-0000-0000-0000-000000000008'::uuid,
  'royal-maroon',
  'Royal Maroon',
  '{"primary":"#7c2527","accent":"#ceb172","background":"#fff0e5"}'::jsonb,
  true,
  'Nuansa marun dan ivory dengan monogram klasik, floral anggrek, lanskap Nusantara, serta fitur RSVP dan dashboard lengkap.',
  '/media/mockups/mockup-royal-maroon.webp',
  '/royal-maroon?to=Tamu%20Undangan',
  8
)
on conflict (slug) do update set
  name = excluded.name,
  theme = excluded.theme,
  description = excluded.description,
  thumbnail_path = excluded.thumbnail_path,
  preview_path = excluded.preview_path,
  sort_order = excluded.sort_order;

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
  '00000000-0000-0000-0000-000000000108'::uuid,
  template.id, 'royal-maroon', 'published'::public.invitation_status,
  source.bride_name, source.bride_short_name, source.bride_parents, source.bride_photo_path,
  source.groom_name, source.groom_short_name, source.groom_parents, source.groom_photo_path,
  source.event_date, source.ceremony_time, source.reception_time,
  source.venue_name, source.venue_address, source.maps_url,
  source.opening_text, source.quote_text, source.quote_source, source.story, source.story_image_path,
  source.cover_path, source.profile_path, source.gallery_paths, source.music_path, source.gift_info,
  '{}'::jsonb, source.closing_text, source.closing_greeting
from public.invitations as source
cross join public.templates as template
where source.slug = 'java-vibes' and template.slug = 'royal-maroon'
-- Reapplying the seed must not overwrite wedding details or guest responses.
on conflict (slug) do nothing;

-- The existing insert trigger also creates this access record. Ensure it exists
-- on reapplication without rotating any dashboard link already shared.
insert into public.invitation_dashboard_access (invitation_id)
select id from public.invitations where slug = 'royal-maroon'
on conflict (invitation_id) do nothing;

commit;
