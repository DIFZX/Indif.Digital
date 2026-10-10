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
  '00000000-0000-0000-0000-000000000005'::uuid,
  'mustard-black',
  'Mustard Black',
  '{"primary":"#d4a359","background":"#141211"}'::jsonb,
  true,
  'Template undangan pernikahan mewah bernuansa matte black & mustard gold dengan aksen lengkung arch botanis, live streaming, cerita cinta, dan amplop digital.',
  '/media/mustard-black/1.jpg',
  '/mustard-black?to=Tamu%20Undangan',
  5
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
  '00000000-0000-0000-0000-000000000105'::uuid,
  mb_template.id,
  'mustard-black',
  'published'::public.invitation_status,
  'Dita Maharani Putri',
  'Dita',
  'Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah',
  '/media/mustard-black/The Bride.jpg',
  'Fajar Sidik',
  'Fajar',
  'Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati',
  '/media/mustard-black/The Groom.jpg',
  '2026-12-12',
  '08.00 WIB - Selesai',
  '11.00 WIB - Selesai',
  'Waroeng Djoglo Grand Ballroom',
  'Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat',
  'https://maps.google.com/?q=Waroeng+Djoglo',
  'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami.',
  'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.',
  '(QS. Ar-Rum : 21)',
  jsonb_build_array(
    jsonb_build_object(
      'year', 'Awal Cerita',
      'title', 'Pertemuan Pertama',
      'text', 'Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari.'
    ),
    jsonb_build_object(
      'year', 'Lamaran',
      'title', 'Momen Sakral Lamaran',
      'text', 'Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik.'
    ),
    jsonb_build_object(
      'year', 'Pernikahan',
      'title', 'Ikatan Suci Pernikahan',
      'text', 'Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan.'
    )
  ),
  '/media/mustard-black/5.jpg',
  '/media/mustard-black/1.jpg',
  '/media/mustard-black/2.jpg',
  array[
    '/media/mustard-black/1.jpg',
    '/media/mustard-black/2.jpg',
    '/media/mustard-black/3.jpg',
    '/media/mustard-black/4.jpg',
    '/media/mustard-black/5.jpg'
  ],
  '/media/elegant/Bergema Selamanya.mp4',
  '{"bank": "BCA", "account_number": "7125091428", "account_name": "Fajar Sidik"}'::jsonb,
  '{}'::jsonb,
  'Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.',
  'Kami yang berbahagia, Dita & Fajar'
from public.templates mb_template
where mb_template.slug = 'mustard-black'
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
