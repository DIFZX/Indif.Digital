insert into public.templates (
  id,
  slug,
  name,
  theme,
  is_active,
  description,
  thumbnail_path,
  preview_path,
  sort_order
)
values (
  '00000000-0000-0000-0000-000000000007'::uuid,
  'sunda-vibes',
  'Sunda Vibes',
  '{"primary":"#A87B57","secondary":"#7A5436","accent":"#C19C8E","background":"#FFF5ED"}'::jsonb,
  true,
  'Template adat Sunda modern bernuansa Warm Bronze & Ivory dengan ornamen Mahkota Siger, bingkai lengkung floral, alunan kecapi suling, dan animasi scroll dinamis.',
  '/media/sunda-vibes/1.jpg',
  '/sunda-vibes?to=Tamu%20Undangan',
  7
)
on conflict (slug) do update
set
  name = excluded.name,
  theme = excluded.theme,
  is_active = excluded.is_active,
  description = excluded.description,
  thumbnail_path = excluded.thumbnail_path,
  preview_path = excluded.preview_path,
  sort_order = excluded.sort_order;

insert into public.invitations (
  id,
  template_id,
  slug,
  status,
  bride_name,
  bride_short_name,
  bride_parents,
  bride_photo_path,
  groom_name,
  groom_short_name,
  groom_parents,
  groom_photo_path,
  event_date,
  ceremony_time,
  reception_time,
  venue_name,
  venue_address,
  maps_url,
  opening_text,
  quote_text,
  quote_source,
  story,
  story_image_path,
  cover_path,
  profile_path,
  gallery_paths,
  music_path,
  gift_info,
  theme_overrides,
  closing_text,
  closing_greeting
)
select
  '00000000-0000-0000-0000-000000000107'::uuid,
  sv_template.id,
  'sunda-vibes',
  'published'::public.invitation_status,
  'Dita Maharani Putri',
  'Dita',
  'Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah',
  '/media/sunda-vibes/The Bride.jpg',
  'Fajar Sidik',
  'Fajar',
  'Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati',
  '/media/sunda-vibes/The Groom.jpg',
  '2026-12-12',
  '08.00 WIB - Selesai',
  '11.00 WIB - Selesai',
  'Waroeng Djoglo Grand Ballroom',
  'Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat',
  'https://maps.google.com/?q=Waroeng+Djoglo',
  'Kalayan nyuhunkeun widi sareng ridho ti Gusti Allah SWT, simkuring saparakanca seja ngahaturanan uninga kana syukuran pernikahan putra-putri kami:',
  'Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari jenis dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.',
  'QS. Ar-Rum : 21',
  jsonb_build_array(
    jsonb_build_object(
      'year', '2021',
      'title', 'Pertemuan Pertama',
      'text', 'Patepang dina hiji kasempetan anu saderhana, ngawitan silih kenal sareng silih ngabagi carita dugi ka tuwuh rasa asih anu tulus.'
    ),
    jsonb_build_object(
      'year', '2023',
      'title', 'Perjalanan Asih',
      'text', 'Ngaliwatan sagala dinamika sareng kabagjaan sasarengan, nguatkeun komitmen kanggo silih damping dina kaayaan naon wae.'
    ),
    jsonb_build_object(
      'year', '2025',
      'title', 'Momen Lamaran',
      'text', 'Kalayan restu ti sepuh kadua pihak, kami ngalengkahkeun tekad kanggo ngabeungkeut jangji dina acara lamaran anu khidmat.'
    ),
    jsonb_build_object(
      'year', '2026',
      'title', 'Menuju Halal',
      'text', 'Kini dinten anu dinanti parantos cunduk, nyampurnakeun satengahing ageman dina ikatan suci pernikahan anu abadi.'
    )
  ),
  '/media/sunda-vibes/5.jpg',
  '/media/sunda-vibes/1.jpg',
  '/media/sunda-vibes/2.jpg',
  array[
    '/media/sunda-vibes/1.jpg',
    '/media/sunda-vibes/2.jpg',
    '/media/sunda-vibes/3.jpg',
    '/media/sunda-vibes/4.jpg',
    '/media/sunda-vibes/5.jpg',
    '/media/sunda-vibes/The Bride.jpg',
    '/media/sunda-vibes/The Groom.jpg'
  ],
  '/media/sunda-vibes/audio.mp3',
  '{"bank": "BCA", "account_number": "7125091428", "account_name": "Fajar Sidik"}'::jsonb,
  '{}'::jsonb,
  'Mangrupikeun hiji kahormatan sareng kabagjaan kanggo simkuring saparakanca saupami Bapak/Ibu/Saudara/i kersa sumping ngaluuhan sarta maparin doa restu ka kadua calon panganten. Hatur nuhun kana sagala perhatosan sareng kasaeanana.',
  'Hatur Nuhun. Kami yang berbahagia, Dita & Fajar'
from public.templates sv_template
where sv_template.slug = 'sunda-vibes'
on conflict (slug) do update
set
  template_id = excluded.template_id,
  status = excluded.status,
  bride_name = excluded.bride_name,
  bride_short_name = excluded.bride_short_name,
  bride_parents = excluded.bride_parents,
  bride_photo_path = excluded.bride_photo_path,
  groom_name = excluded.groom_name,
  groom_short_name = excluded.groom_short_name,
  groom_parents = excluded.groom_parents,
  groom_photo_path = excluded.groom_photo_path,
  event_date = excluded.event_date,
  ceremony_time = excluded.ceremony_time,
  reception_time = excluded.reception_time,
  venue_name = excluded.venue_name,
  venue_address = excluded.venue_address,
  maps_url = excluded.maps_url,
  opening_text = excluded.opening_text,
  quote_text = excluded.quote_text,
  quote_source = excluded.quote_source,
  story = excluded.story,
  story_image_path = excluded.story_image_path,
  cover_path = excluded.cover_path,
  profile_path = excluded.profile_path,
  gallery_paths = excluded.gallery_paths,
  music_path = excluded.music_path,
  gift_info = excluded.gift_info,
  theme_overrides = excluded.theme_overrides,
  closing_text = excluded.closing_text,
  closing_greeting = excluded.closing_greeting;
