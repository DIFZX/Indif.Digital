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

export const demoInvitations = [demoInvitation, pinkVibesDemoInvitation];

export const demoGreetings: Greeting[] = [
  {
    id: "demo-greeting",
    guest_name: "Keluarga Santoso",
    message: "Semoga menjadi keluarga yang penuh cinta, hangat, dan bahagia selalu.",
    attendance: "attending",
    created_at: "2026-08-18T08:00:00.000Z",
  },
];
