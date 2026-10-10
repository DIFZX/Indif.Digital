import type { Greeting, Invitation } from "@/lib/types";

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

export const demoInvitations = [
  demoInvitation,
  pinkVibesDemoInvitation,
  blueGardenDemoInvitation,
  netflixDemoInvitation,
  mustardBlackDemoInvitation,
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
