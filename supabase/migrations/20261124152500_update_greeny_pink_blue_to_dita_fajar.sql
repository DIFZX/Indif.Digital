-- Update template preview path for Greeny Flowers
update public.templates
set preview_path = '/greeny-flowers?to=Tamu%20Undangan'
where slug = 'greeny-flowers';

-- Update invitations for Greeny Flowers, Pink Vibes, and Blue Garden to Dita & Fajar
update public.invitations
set
  slug = case when slug = 'intan-dan-difa' then 'greeny-flowers' else slug end,
  bride_name = 'Dita Maharani Putri',
  bride_short_name = 'Dita',
  bride_parents = 'Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah',
  bride_photo_path = '/media/sunda-vibes/The Bride.jpg',
  groom_name = 'Fajar Sidik',
  groom_short_name = 'Fajar',
  groom_parents = 'Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati',
  groom_photo_path = '/media/sunda-vibes/The Groom.jpg',
  event_date = '2026-12-12',
  ceremony_time = '08.00 WIB - Selesai',
  reception_time = '11.00 WIB - Selesai',
  venue_name = 'Waroeng Djoglo Grand Ballroom',
  venue_address = 'Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat',
  maps_url = 'https://maps.google.com/?q=Waroeng+Djoglo',
  opening_text = 'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami.',
  quote_text = 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.',
  quote_source = '(QS. Ar-Rum : 21)',
  story = '[
    {"year":"2022","title":"Awal Cerita","text":"Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari."},
    {"year":"2024","title":"Lamaran","text":"Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik."},
    {"year":"2026","title":"Pernikahan","text":"Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan."}
  ]'::jsonb,
  story_image_path = '/media/sunda-vibes/5.jpg',
  cover_path = '/media/sunda-vibes/1.jpg',
  profile_path = '/media/sunda-vibes/2.jpg',
  gallery_paths = array[
    '/media/sunda-vibes/1.jpg',
    '/media/sunda-vibes/2.jpg',
    '/media/sunda-vibes/3.jpg',
    '/media/sunda-vibes/4.jpg',
    '/media/sunda-vibes/5.jpg',
    '/media/sunda-vibes/The Bride.jpg',
    '/media/sunda-vibes/The Groom.jpg'
  ],
  music_path = '/media/elegant/Bergema Selamanya.mp4',
  gift_info = '{"bank":"BCA","account_number":"7125091428","account_name":"Fajar Sidik"}'::jsonb,
  closing_text = 'Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.',
  closing_greeting = 'Kami yang berbahagia, Dita & Fajar'
where slug in ('intan-dan-difa', 'greeny-flowers', 'pink-vibes', 'blue-garden');
