begin;

-- Persist the existing public Sunda Vibes preview so RSVP and its private
-- dashboard can use the same invitation ID. Keep every existing invitation,
-- customer response, dashboard key, and catalog setting unchanged.
do $$
begin
  if not exists (select 1 from public.templates where slug='sunda-vibes') then
    raise exception 'Register the Sunda Vibes catalog entry before its invitation';
  end if;
  if exists (select 1 from public.invitations where id='00000000-0000-0000-0000-000000000107' and slug<>'sunda-vibes') then
    raise exception 'The Sunda Vibes preview ID is already used by another invitation';
  end if;
end;
$$;

insert into public.invitations (
  template_id, id, slug, status, bride_name, bride_short_name, bride_parents, bride_photo_path, groom_name, groom_short_name, groom_parents, groom_photo_path, event_date, ceremony_time, reception_time, venue_name, venue_address, maps_url, opening_text, quote_text, quote_source, story, story_image_path, cover_path, profile_path, gallery_paths, music_path, gift_info, theme_overrides, closing_text, closing_greeting
)
select catalog.id, preview.id, preview.slug, preview.status, preview.bride_name, preview.bride_short_name, preview.bride_parents, preview.bride_photo_path, preview.groom_name, preview.groom_short_name, preview.groom_parents, preview.groom_photo_path, preview.event_date, preview.ceremony_time, preview.reception_time, preview.venue_name, preview.venue_address, preview.maps_url, preview.opening_text, preview.quote_text, preview.quote_source, preview.story, preview.story_image_path, preview.cover_path, preview.profile_path, preview.gallery_paths, preview.music_path, preview.gift_info, preview.theme_overrides, preview.closing_text, preview.closing_greeting
from jsonb_populate_record(null::public.invitations, $sunda_preview_20261103$
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
  "closing_greeting": "Hatur Nuhun. Kami yang berbahagia, Dita & Fajar"
}
$sunda_preview_20261103$::jsonb) as preview
join public.templates as catalog on catalog.slug='sunda-vibes'
on conflict (slug) do nothing;

-- The normal invitation-insert trigger creates this key. Reapplication must
-- also preserve any private link that has already been shared with the owner.
insert into public.invitation_dashboard_access(invitation_id)
select id from public.invitations where slug='sunda-vibes'
on conflict (invitation_id) do nothing;

commit;
