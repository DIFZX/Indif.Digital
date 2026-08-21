alter table public.invitations
  add column if not exists quote_text text not null
    default 'Dua hati, satu tujuan, dan perjalanan yang kami pilih untuk dijalani bersama.',
  add column if not exists quote_source text not null default '',
  add column if not exists closing_text text not null
    default 'Terima kasih atas perhatian, doa, dan kehadiran Anda.',
  add column if not exists closing_greeting text not null default '';

update public.invitations
set
  quote_text = 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.',
  quote_source = '(Qs. Ar-Rum: 21)',
  story = jsonb_build_array(
    jsonb_build_object(
      'year', '2023',
      'title', 'Awal Cerita',
      'text', 'Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari.'
    ),
    jsonb_build_object(
      'year', '2025',
      'title', 'Lamaran',
      'text', 'Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik.'
    ),
    jsonb_build_object(
      'year', '2026',
      'title', 'Pernikahan',
      'text', 'Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan.'
    )
  ),
  closing_text = 'Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.',
  closing_greeting = $$Wassalamu'alaikum Wr. Wb$$
where slug = 'intan-dan-difa';
