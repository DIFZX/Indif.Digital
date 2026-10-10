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
  '00000000-0000-0000-0000-000000000006'::uuid,
  'java-vibes',
  'Java Vibes',
  '{"primary":"#550B18","secondary":"#51260A","accent":"#D4AF37","background":"#FAF1E4"}'::jsonb,
  true,
  'Template adat Jawa bernuansa royal maroon & gold klasik dengan gunungan wayang 3D, ronce melati beranimasi, dan alunan gamelan gending Jawa.',
  '/media/java-vibes/1.jpg',
  '/java-vibes?to=Tamu%20Undangan',
  6
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
  '00000000-0000-0000-0000-000000000106'::uuid,
  jv_template.id,
  'java-vibes',
  'published'::public.invitation_status,
  'Dita Maharani Putri',
  'Dita',
  'Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah',
  '/media/java-vibes/The Bride.jpg',
  'Fajar Sidik',
  'Fajar',
  'Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati',
  '/media/java-vibes/The Groom.jpg',
  '2026-12-12',
  '08.00 WIB - Selesai',
  '11.00 WIB - Selesai',
  'Waroeng Djoglo Grand Ballroom',
  'Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat',
  'https://maps.google.com/?q=Waroeng+Djoglo',
  'Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan putra-putri kami:',
  'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.',
  'Surah Ar-Ruum : 21',
  jsonb_build_array(
    jsonb_build_object(
      'year', '2018',
      'title', 'Pertemuan Pertama',
      'text', 'Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Rasa nyaman itu tumbuh perlahan namun pasti hingga kami memutuskan untuk menjalin hubungan.'
    ),
    jsonb_build_object(
      'year', '2024',
      'title', 'Momen Sakral Lamaran',
      'text', 'Dengan niat yang tulus dan restu kedua orang tua serta keluarga besar, kami memantapkan hati melangkah ke jenjang yang lebih serius melalui prosesi lamaran.'
    ),
    jsonb_build_object(
      'year', '2026',
      'title', 'Ikatan Suci Pernikahan',
      'text', 'Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh berkah dan cinta.'
    )
  ),
  '/media/java-vibes/5.jpg',
  '/media/java-vibes/1.jpg',
  '/media/java-vibes/2.jpg',
  array[
    '/media/java-vibes/1.jpg',
    '/media/java-vibes/2.jpg',
    '/media/java-vibes/3.jpg',
    '/media/java-vibes/4.jpg',
    '/media/java-vibes/5.jpg'
  ],
  '/media/java-vibes/gending-jawa.mp3',
  '{"bank": "BCA", "account_number": "7125091428", "account_name": "Fajar Sidik"}'::jsonb,
  '{}'::jsonb,
  'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai. Atas kehadiran dan doa restu panjenengan sami, kami mengucapkan matur sembah nuwun.',
  'Matur Nuwun. Kami yang berbahagia, Dita & Fajar'
from public.templates jv_template
where jv_template.slug = 'java-vibes'
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
