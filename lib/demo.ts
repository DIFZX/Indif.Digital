import type { Greeting, GuestRSVP, Invitation } from "@/lib/types";

export const demoInvitation: Invitation = {
  id: "00000000-0000-0000-0000-000000000101",
  slug: "intan-dan-difa",
  status: "published",
  bride_name: "Intan",
  bride_short_name: "Intan",
  bride_parents: "Putri Alm. Bapak Soma & Ibu Heny",
  bride_photo_path: "/media/elegant/bride-intan-v1.png",
  groom_name: "Difa",
  groom_short_name: "Difa",
  groom_parents: "Putra Bapak Sulaiman & Ibu Fitrotunisa",
  groom_photo_path: "/media/elegant/groom-difa-v1.png",
  event_date: "2026-12-12",
  ceremony_time: "08.00 WIB",
  reception_time: "11.00–14.00 WIB",
  venue_name: "Gedung Islamic Centre Bekasi",
  venue_address: "Jl. Ahmad Yani No.22, RT.005/RW.002, Marga Jaya, Kec. Bekasi Sel., Kota Bks, Jawa Barat 17141",
  maps_url: "https://share.google/OUegQc3AUuqfbTELX",
  opening_text:
    "Dengan penuh syukur, kami mengundang Anda untuk hadir dan menjadi bagian dari hari bahagia kami.",
  quote_text:
    "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
  quote_source: "(Qs. Ar-Rum: 21)",
  story: [
    {
      year: "2023",
      title: "Awal Cerita",
      text: "Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari.",
    },
    {
      year: "2025",
      title: "Lamaran",
      text: "Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik.",
    },
    {
      year: "2026",
      title: "Pernikahan",
      text: "Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan.",
    },
  ],
  story_image_path: "/media/invitations/intan-dan-difa/story/story-running-v1.png",
  cover_path: "/media/elegant/gallery-couple-v2.png",
  profile_path: "/media/elegant/profile-main-v1.jpeg",
  gallery_paths: [
    "/media/invitations/intan-dan-difa/gallery/gallery-01-v1.png",
    "/media/invitations/intan-dan-difa/gallery/gallery-02-v1.png",
    "/media/invitations/intan-dan-difa/gallery/gallery-03-v1.jpeg",
    "/media/invitations/intan-dan-difa/gallery/gallery-04-v1.jpeg",
    "/media/invitations/intan-dan-difa/gallery/gallery-05-v1.jpeg",
  ],
  music_path: "/media/elegant/Bergema Selamanya.mp4",
  gift_info: { bank: "BCA", account_number: "1234567890", account_name: "Intan" },
  theme_overrides: {},
  closing_text:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.",
  closing_greeting: "Wassalamu'alaikum Wr. Wb",
  template: {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "greeny-flowers",
    name: "Greeny Flowers",
    theme: { primary: "#30493b", accent: "#b8915d", background: "#f5f1e8" },
  },
};

export const pinkVibesDemoInvitation: Invitation = {
  ...demoInvitation,
  id: "00000000-0000-0000-0000-000000000102",
  slug: "pink-vibes",
  theme_overrides: {},
  template: {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "pink-vibes",
    name: "Pink Vibes",
    theme: {
      primary: "#6f334c",
      accent: "#d986a5",
      background: "#fff7f8",
      deep: "#59283e",
      soft: "#f2c4d2",
    },
  },
};

export const blueGardenDemoInvitation: Invitation = {
  ...demoInvitation,
  id: "00000000-0000-0000-0000-000000000103",
  slug: "blue-garden",
  theme_overrides: {},
  template: {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "blue-garden",
    name: "Blue Garden",
    theme: {
      primary: "#456482",
      accent: "#b89c7a",
      background: "#f6f3ec",
      deep: "#304b66",
      soft: "#d9e5ef",
    },
  },
};

export const netflixDemoInvitation: Invitation = {
  ...demoInvitation,
  id: "00000000-0000-0000-0000-000000000104",
  slug: "netflix",
  bride_name: "Dita Maharani Putri",
  bride_short_name: "Dita",
  bride_parents: "Putri Pertama dari Bapak & Ibu",
  bride_photo_path: "/media/netflix/The Bride.jpg",
  groom_name: "Fajar Sidik",
  groom_short_name: "Fajar",
  groom_parents: "Putra Pertama dari Bapak & Ibu",
  groom_photo_path: "/media/netflix/The Groom.jpg",
  event_date: "2026-12-12",
  ceremony_time: "09.00 - 09.30 WIB",
  reception_time: "10.00 - 14.00 WIB",
  venue_name: "Waroeng Djoglo Grand Ballroom",
  venue_address: "Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat",
  maps_url: "https://maps.google.com/?q=Waroeng+Djoglo",
  opening_text:
    "Setelah Dita & Fajar dipertemukan dalam situasi yang tepat, di mana keduanya telah siap untuk memulai hubungan bersama, tibalah mereka di awal perjalanan baru menuju pernikahan.",
  quote_text:
    "Segala sesuatu kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah).",
  quote_source: "(Q.S Az-Zariyat: 49)",
  story: [
    {
      year: "2022",
      title: "Awal Perkenalan",
      text: "Bukan karena bertemu lalu berjodoh, karena berjodohlah maka kita berdua dipertemukan. Berawal dari tidak sengaja berkenalan di instagram, karena ternyata kita berdua tinggal di kota yang sama, Ehime Japan. Selang beberapa waktu kita memutuskan untuk bertemu dan menjalin hubungan.",
    },
    {
      year: "2024",
      title: "Lamaran",
      text: "Singkat cerita setelah pertemuan dan perkenalan di tahun 2022. Akhirnya kita berdua memutuskan untuk berkomitmen melanjutkan hubungan ini ke jenjang yang lebih serius, dengan melangkah satu langkah lebih dekat. Fajar datang bersama keluarga besarnya untuk melamar Dita. Lamaran diterima dengan baik oleh keluarga Dita dan di hari itu kami sekeluarga menentukan tanggal pernikahan kita berdua.",
    },
    {
      year: "2026",
      title: "Menikah",
      text: "Bismillah tepat pada 12 Desember 2026 kita berdua akan membuka cerita baru dengan status yang baru juga yaitu sepasang Suami Istri. Perjalanan cerita kita akhirnya bermuara di jenjang pernikahan semoga Allah memberikan kelancaran dan menjadikan kami keluarga yang Sakinah Mawaddah Warahmah. Aamiin.",
    },
  ],
  story_image_path: "/media/netflix/5.jpg",
  cover_path: "/media/netflix/1.jpg",
  profile_path: "/media/netflix/2.jpg",
  gallery_paths: [
    "/media/netflix/1.jpg",
    "/media/netflix/2.jpg",
    "/media/netflix/3.jpg",
    "/media/netflix/4.jpg",
    "/media/netflix/5.jpg",
  ],
  music_path: "/media/elegant/Bergema Selamanya.mp4",
  gift_info: {
    bank: "BCA",
    account_number: "7125091428",
    account_name: "Fajar Sidik",
  },
  closing_text:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.",
  closing_greeting: "With Love, Dita & Fajar",
  theme_overrides: {},
  template: {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "netflix",
    name: "Netflix",
    theme: {
      primary: "#e50914",
      background: "#121111",
    },
  },
};

export const mustardBlackDemoInvitation: Invitation = {
  ...demoInvitation,
  id: "00000000-0000-0000-0000-000000000105",
  slug: "mustard-black",
  bride_name: "Dita Maharani Putri",
  bride_short_name: "Dita",
  bride_parents: "Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah",
  bride_photo_path: "/media/mustard-black/The Bride.jpg",
  groom_name: "Fajar Sidik",
  groom_short_name: "Fajar",
  groom_parents: "Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati",
  groom_photo_path: "/media/mustard-black/The Groom.jpg",
  event_date: "2026-12-12",
  ceremony_time: "08.00 WIB - Selesai",
  reception_time: "11.00 WIB - Selesai",
  venue_name: "Waroeng Djoglo Grand Ballroom",
  venue_address: "Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat",
  maps_url: "https://maps.google.com/?q=Waroeng+Djoglo",
  opening_text:
    "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i serta kerabat sekalian untuk menghadiri acara pernikahan kami.",
  quote_text:
    "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
  quote_source: "(QS. Ar-Rum : 21)",
  story: [
    {
      year: "Awal Cerita",
      title: "Pertemuan Pertama",
      text: "Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Tanpa disadari, kebersamaan itu tumbuh menjadi rasa nyaman yang semakin kuat dari hari ke hari.",
    },
    {
      year: "Lamaran",
      title: "Momen Sakral Lamaran",
      text: "Dengan niat yang tulus dan restu keluarga, kami memutuskan untuk melangkah ke tahap yang lebih serius. Momen lamaran menjadi awal dari perjalanan baru yang penuh harapan dan doa baik.",
    },
    {
      year: "Pernikahan",
      title: "Ikatan Suci Pernikahan",
      text: "Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh cinta, kebahagiaan, dan keberkahan.",
    },
  ],
  story_image_path: "/media/mustard-black/5.jpg",
  cover_path: "/media/mustard-black/1.jpg",
  profile_path: "/media/mustard-black/2.jpg",
  gallery_paths: [
    "/media/mustard-black/1.jpg",
    "/media/mustard-black/2.jpg",
    "/media/mustard-black/3.jpg",
    "/media/mustard-black/4.jpg",
    "/media/mustard-black/5.jpg",
  ],
  music_path: "/media/elegant/Bergema Selamanya.mp4",
  gift_info: {
    bank: "BCA",
    account_number: "7125091428",
    account_name: "Fajar Sidik",
  },
  closing_text:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.",
  closing_greeting: "Kami yang berbahagia, Dita & Fajar",
  theme_overrides: {},
  template: {
    id: "00000000-0000-0000-0000-000000000005",
    slug: "mustard-black",
    name: "Mustard Black",
    theme: {
      primary: "#d4a359",
      background: "#141211",
    },
  },
};

export const javaVibesDemoInvitation: Invitation = {
  ...demoInvitation,
  id: "00000000-0000-0000-0000-000000000106",
  slug: "java-vibes",
  bride_name: "Dita Maharani Putri",
  bride_short_name: "Dita",
  bride_parents: "Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah",
  bride_photo_path: "/media/java-vibes/The Bride.jpg",
  groom_name: "Fajar Sidik",
  groom_short_name: "Fajar",
  groom_parents: "Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati",
  groom_photo_path: "/media/java-vibes/The Groom.jpg",
  event_date: "2026-12-12",
  ceremony_time: "08.00 WIB - Selesai",
  reception_time: "11.00 WIB - Selesai",
  venue_name: "Waroeng Djoglo Grand Ballroom",
  venue_address: "Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat",
  maps_url: "https://maps.google.com/?q=Waroeng+Djoglo",
  opening_text:
    "Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan putra-putri kami:",
  quote_text:
    "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.",
  quote_source: "Surah Ar-Ruum : 21",
  story: [
    {
      year: "2018",
      title: "Pertemuan Pertama",
      text: "Berawal dari pertemuan sederhana, kami saling mengenal dan mulai berbagi banyak cerita. Rasa nyaman itu tumbuh perlahan namun pasti hingga kami memutuskan untuk menjalin hubungan.",
    },
    {
      year: "2024",
      title: "Momen Sakral Lamaran",
      text: "Dengan niat yang tulus dan restu kedua orang tua serta keluarga besar, kami memantapkan hati melangkah ke jenjang yang lebih serius melalui prosesi lamaran.",
    },
    {
      year: "2026",
      title: "Ikatan Suci Pernikahan",
      text: "Kini kami sampai pada hari yang kami nantikan, hari di mana dua hati dipersatukan dalam ikatan suci pernikahan. Semoga langkah ini menjadi awal kehidupan baru yang penuh berkah dan cinta.",
    },
  ],
  story_image_path: "/media/java-vibes/5.jpg",
  cover_path: "/media/java-vibes/1.jpg",
  profile_path: "/media/java-vibes/2.jpg",
  gallery_paths: [
    "/media/java-vibes/1.jpg",
    "/media/java-vibes/2.jpg",
    "/media/java-vibes/3.jpg",
    "/media/java-vibes/4.jpg",
    "/media/java-vibes/5.jpg",
  ],
  music_path: "/media/java-vibes/gending-jawa.mp3",
  gift_info: {
    bank: "BCA",
    account_number: "7125091428",
    account_name: "Fajar Sidik",
  },
  closing_text:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai. Atas kehadiran dan doa restu panjenengan sami, kami mengucapkan matur sembah nuwun.",
  closing_greeting: "Matur Nuwun. Kami yang berbahagia, Dita & Fajar",
  theme_overrides: {},
  template: {
    id: "00000000-0000-0000-0000-000000000006",
    slug: "java-vibes",
    name: "Java Vibes",
    theme: {
      primary: "#550B18",
      background: "#FAF1E4",
    },
  },
};

export const sundaVibesDemoInvitation: Invitation = {
  ...demoInvitation,
  id: "00000000-0000-0000-0000-000000000107",
  slug: "sunda-vibes",
  bride_name: "Dita Maharani Putri",
  bride_short_name: "Dita",
  bride_parents: "Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah",
  bride_photo_path: "/media/sunda-vibes/The Bride.jpg",
  groom_name: "Fajar Sidik",
  groom_short_name: "Fajar",
  groom_parents: "Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati",
  groom_photo_path: "/media/sunda-vibes/The Groom.jpg",
  event_date: "2026-12-12",
  ceremony_time: "08.00 WIB - Selesai",
  reception_time: "11.00 WIB - Selesai",
  venue_name: "Waroeng Djoglo Grand Ballroom",
  venue_address: "Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat",
  maps_url: "https://maps.google.com/?q=Waroeng+Djoglo",
  opening_text:
    "Kalayan nyuhunkeun widi sareng ridho ti Gusti Allah SWT, simkuring saparakanca seja ngahaturanan uninga kana syukuran pernikahan putra-putri kami:",
  quote_text:
    "Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia menciptakan pasangan-pasangan untukmu dari jenis dirimu sendiri agar kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.",
  quote_source: "QS. Ar-Rum : 21",
  story: [
    {
      year: "2021",
      title: "Pertemuan Pertama",
      text: "Patepang dina hiji kasempetan anu saderhana, ngawitan silih kenal sareng silih ngabagi carita dugi ka tuwuh rasa asih anu tulus.",
    },
    {
      year: "2023",
      title: "Perjalanan Asih",
      text: "Ngaliwatan sagala dinamika sareng kabagjaan sasarengan, nguatkeun komitmen kanggo silih damping dina kaayaan naon wae.",
    },
    {
      year: "2025",
      title: "Momen Lamaran",
      text: "Kalayan restu ti sepuh kadua pihak, kami ngalengkahkeun tekad kanggo ngabeungkeut jangji dina acara lamaran anu khidmat.",
    },
    {
      year: "2026",
      title: "Menuju Halal",
      text: "Kini dinten anu dinanti parantos cunduk, nyampurnakeun satengahing ageman dina ikatan suci pernikahan anu abadi.",
    },
  ],
  story_image_path: "/media/sunda-vibes/5.jpg",
  cover_path: "/media/sunda-vibes/1.jpg",
  profile_path: "/media/sunda-vibes/2.jpg",
  gallery_paths: [
    "/media/sunda-vibes/1.jpg",
    "/media/sunda-vibes/2.jpg",
    "/media/sunda-vibes/3.jpg",
    "/media/sunda-vibes/4.jpg",
    "/media/sunda-vibes/5.jpg",
    "/media/sunda-vibes/The Bride.jpg",
    "/media/sunda-vibes/The Groom.jpg",
  ],
  music_path: "/media/sunda-vibes/audio.mp3",
  gift_info: {
    bank: "BCA",
    account_number: "7125091428",
    account_name: "Fajar Sidik",
  },
  closing_text:
    "Mangrupikeun hiji kahormatan sareng kabagjaan kanggo simkuring saparakanca saupami Bapak/Ibu/Saudara/i kersa sumping ngaluuhan sarta maparin doa restu ka kadua calon panganten. Hatur nuhun kana sagala perhatosan sareng kasaeanana.",
  closing_greeting: "Hatur Nuhun. Kami yang berbahagia, Dita & Fajar",
  theme_overrides: {},
  template: {
    id: "00000000-0000-0000-0000-000000000007",
    slug: "sunda-vibes",
    name: "Sunda Vibes",
    theme: {
      primary: "#A87B57",
      background: "#FFF5ED",
    },
  },
};

export const demoInvitations = [
  demoInvitation,
  pinkVibesDemoInvitation,
  blueGardenDemoInvitation,
  netflixDemoInvitation,
  mustardBlackDemoInvitation,
  javaVibesDemoInvitation,
  sundaVibesDemoInvitation,
];

export const demoGreetings: Greeting[] = [
  {
    id: "demo-greeting",
    guest_name: "Keluarga Santoso",
    message: "Semoga menjadi keluarga yang penuh cinta, hangat, dan bahagia selalu.",
    attendance: "attending",
    created_at: "2026-08-18T08:00:00.000Z",
  },
];

export const javaVibesDemoRSVPs: GuestRSVP[] = [
  {
    id: "jv-rsvp-01",
    guest_name: "Dimas & Partner",
    attendance: "attending",
    guest_count: 2,
    message: "Alhamdulillah setelah penantian panjang lancar sampai hari h bestie🥰",
    created_at: "2026-10-19T09:30:00.000Z",
  },
  {
    id: "jv-rsvp-02",
    guest_name: "Rian & Istri",
    attendance: "attending",
    guest_count: 2,
    message: "MasyaAllahh, selamat menempuh ibadah terpanjang Dita dan Fajar🥰 Sakinah mawaddah warahmah.",
    created_at: "2026-10-19T08:15:00.000Z",
  },
  {
    id: "jv-rsvp-03",
    guest_name: "Sarah Amalia",
    attendance: "attending",
    guest_count: 1,
    message: "Barakallah Dita & mas Fajar! Semoga dilancarkan acaranya sampai hari H yaa cantik.",
    created_at: "2026-10-19T07:45:00.000Z",
  },
  {
    id: "jv-rsvp-04",
    guest_name: "Budi Prasetyo",
    attendance: "attending",
    guest_count: 2,
    message: "Selamat menempuh hidup baru Fajar & Dita, langgeng sampai kakek nenek dan berkah selalu.",
    created_at: "2026-10-18T20:10:00.000Z",
  },
  {
    id: "jv-rsvp-05",
    guest_name: "Anisa Rahma",
    attendance: "attending",
    guest_count: 1,
    message: "Happy wedding Dita sayang! See you on your big day ✨",
    created_at: "2026-10-18T18:05:00.000Z",
  },
  {
    id: "jv-rsvp-06",
    guest_name: "Wahyu Nugroho",
    attendance: "not_attending",
    guest_count: 0,
    message: "Mohon maaf belum bisa hadir mas Fajar karena ada dinas ke luar kota. Doa terbaik untuk kedua mempelai 🙏",
    created_at: "2026-10-18T16:22:00.000Z",
  },
  {
    id: "jv-rsvp-07",
    guest_name: "Hendra Kurniawan",
    attendance: "attending",
    guest_count: 2,
    message: "Selamat berbahagia mas Fajar & mba Dita, semoga menjadi keluarga sakinah mawaddah warahmah.",
    created_at: "2026-10-18T14:40:00.000Z",
  },
  {
    id: "jv-rsvp-08",
    guest_name: "Dian Sastrowardoyo",
    attendance: "not_attending",
    guest_count: 0,
    message: "Happy wedding Dita & Fajar! Maaf berhalangan hadir langsung, semoga acaranya berkah dan lancar ya.",
    created_at: "2026-10-18T12:15:00.000Z",
  },
  {
    id: "jv-rsvp-09",
    guest_name: "Citra Lestari",
    attendance: "attending",
    guest_count: 1,
    message: "Lancar-lancar ya Dit! Doa terbaik untuk kalian berdua 🤍",
    created_at: "2026-10-18T11:05:00.000Z",
  },
  {
    id: "jv-rsvp-10",
    guest_name: "Rizky Ramadhan",
    attendance: "not_attending",
    guest_count: 0,
    message: "Selamat menempuh hidup baru sahabatku, maaf belum bisa datang. Semoga langgeng selamanya!",
    created_at: "2026-10-18T09:50:00.000Z",
  },
  {
    id: "jv-rsvp-11",
    guest_name: "Aditya Pratama",
    attendance: "attending",
    guest_count: 2,
    message: "Selamat brader Fajar! Mantap akhirnya berlabuh juga di pelaminan. Sukses acaranya bro!",
    created_at: "2026-10-17T21:18:00.000Z",
  },
  {
    id: "jv-rsvp-12",
    guest_name: "Putri Ayu",
    attendance: "not_attending",
    guest_count: 0,
    message: "Barakallahu lakum wa baraka alaikum. Maafkan ya Dit belum bisa hadir, doa terbaik untukmu dan suami.",
    created_at: "2026-10-17T19:35:00.000Z",
  },
  {
    id: "jv-rsvp-13",
    guest_name: "Maya Indah",
    attendance: "attending",
    guest_count: 2,
    message: "Selamat untuk Dita dan Mas Fajar, semoga selalu diberkahi kebahagiaan berlimpah.",
    created_at: "2026-10-17T15:20:00.000Z",
  },
];

