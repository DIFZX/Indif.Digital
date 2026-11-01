-- Keep the existing Sunda Vibes wedding content and media, with a separate
-- invitation identity so RSVP, greetings, analytics, and dashboard stay isolated.
begin;

insert into public.templates (
  id, slug, name, theme, is_active, description, thumbnail_path, preview_path, sort_order
)
values (
  '00000000-0000-0000-0000-000000000009'::uuid,
  'blush-rose', 'Blush Rose',
  '{"primary":"#721727","accent":"#bf949d","background":"#efe6e5"}'::jsonb,
  true,
  'Tema minimalis romantis bernuansa blush pink, mawar burgundy, judul kaligrafi, dan animasi floral lembut dengan fitur undangan lengkap.',
  '/media/mockups/mockup-blush-rose.webp',
  '/blush-rose?to=Tamu%20Undangan',
  9
)
on conflict (slug) do update set
  name = excluded.name,
  theme = excluded.theme,
  description = excluded.description,
  thumbnail_path = excluded.thumbnail_path,
  preview_path = excluded.preview_path,
  sort_order = excluded.sort_order;

-- Prefer a live Sunda Vibes row. Existing catalogues also support a local
-- Sunda demo; use its exact snapshot when the live source has not been seeded.
with source as (
  select * from public.invitations where slug = 'sunda-vibes'
  union all
  select (jsonb_populate_record(null::public.invitations, $sunda$
{
  "id": "00000000-0000-0000-0000-000000000107",
  "slug": "sunda-vibes",
  "status": "published",
  "bride_name": "Dita Maharani Putri",
  "bride_short_name": "Dita",
  "bride_parents": "Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah",
  "bride_photo_path": "/media/sunda-vibes/The Bride.jpg",
  "groom_name": "Fajar Sidik",
  "groom_short_name": "Fajar",
  "groom_parents": "Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati",
  "groom_photo_path": "/media/sunda-vibes/The Groom.jpg",
  "event_date": "2026-12-12",
  "ceremony_time": "08.00 WIB - Selesai",
  "reception_time": "11.00 WIB - Selesai",
  "venue_name": "Waroeng Djoglo Grand Ballroom",
  "venue_address": "Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat",
  "maps_url": "https://maps.google.com/?q=Waroeng+Djoglo",
  "opening_text": "Kalayan nyuhunkeun widi sareng ridho ti Gusti Allah SWT, simkuring saparakanca seja ngahaturanan uninga kana syukuran pernikahan putra-putri kami:",
  "quote_text": "Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari jenis dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.",
  "quote_source": "QS. Ar-Rum : 21",
  "story": [
    {
      "year": "2021",
      "title": "Pertemuan Pertama",
      "text": "Patepang dina hiji kasempetan anu saderhana, ngawitan silih kenal sareng silih ngabagi carita dugi ka tuwuh rasa asih anu tulus."
    },
    {
      "year": "2023",
      "title": "Perjalanan Asih",
      "text": "Ngaliwatan sagala dinamika sareng kabagjaan sasarengan, nguatkeun komitmen kanggo silih damping dina kaayaan naon wae."
    },
    {
      "year": "2025",
      "title": "Momen Lamaran",
      "text": "Kalayan restu ti sepuh kadua pihak, kami ngalengkahkeun tekad kanggo ngabeungkeut jangji dina acara lamaran anu khidmat."
    },
    {
      "year": "2026",
      "title": "Menuju Halal",
      "text": "Kini dinten anu dinanti parantos cunduk, nyampurnakeun satengahing ageman dina ikatan suci pernikahan anu abadi."
    }
  ],
  "story_image_path": "/media/sunda-vibes/5.jpg",
  "cover_path": "/media/sunda-vibes/1.jpg",
  "profile_path": "/media/sunda-vibes/2.jpg",
  "gallery_paths": [
    "/media/sunda-vibes/1.jpg",
    "/media/sunda-vibes/2.jpg",
    "/media/sunda-vibes/3.jpg",
    "/media/sunda-vibes/4.jpg",
    "/media/sunda-vibes/5.jpg",
    "/media/sunda-vibes/The Bride.jpg",
    "/media/sunda-vibes/The Groom.jpg"
  ],
  "music_path": "/media/sunda-vibes/audio.mp3",
  "gift_info": {
    "bank": "BCA",
    "account_number": "7125091428",
    "account_name": "Fajar Sidik"
  },
  "theme_overrides": {},
  "closing_text": "Mangrupikeun hiji kahormatan sareng kabagjaan kanggo simkuring saparakanca saupami Bapak/Ibu/Saudara/i kersa sumping ngaluuhan sarta maparin doa restu ka kadua calon panganten. Hatur nuhun kana sagala perhatosan sareng kasaeanana.",
  "closing_greeting": "Hatur Nuhun. Kami yang berbahagia, Dita & Fajar",
  "template": {
    "id": "00000000-0000-0000-0000-000000000007",
    "slug": "sunda-vibes",
    "name": "Sunda Vibes",
    "theme": {
      "primary": "#A87B57",
      "background": "#FFF5ED"
    }
  }
}
$sunda$::jsonb)).*
  where not exists (select 1 from public.invitations where slug = 'sunda-vibes')
)
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
  '00000000-0000-0000-0000-000000000109'::uuid,
  template.id, 'blush-rose', 'published'::public.invitation_status,
  source.bride_name, source.bride_short_name, source.bride_parents, source.bride_photo_path,
  source.groom_name, source.groom_short_name, source.groom_parents, source.groom_photo_path,
  source.event_date, source.ceremony_time, source.reception_time,
  source.venue_name, source.venue_address, source.maps_url,
  source.opening_text, source.quote_text, source.quote_source, source.story, source.story_image_path,
  source.cover_path, source.profile_path, source.gallery_paths, source.music_path, source.gift_info,
  '{}'::jsonb, source.closing_text, source.closing_greeting
from source
cross join public.templates as template
where source.slug = 'sunda-vibes' and template.slug = 'blush-rose'
on conflict (slug) do nothing;

insert into public.invitation_dashboard_access (invitation_id)
select id from public.invitations where slug = 'blush-rose'
on conflict (invitation_id) do nothing;

commit;
