import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Konfigurasi Supabase tidak ditemukan di .env.local");
  process.exit(1);
}

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const templatePayload = {
  id: "00000000-0000-0000-0000-000000000015",
  slug: "jade-pavilion",
  name: "Jade Pavilion",
  theme: { primary: "#2E4A3E", accent: "#A98F5C", background: "#F7F6F1" },
  is_active: true,
  catalog_status: "available",
  category: "spesial",
  description:
    "Template taman botani cat air bernuansa hijau sage & ivory dengan video opening sinematik, paviliun klasik, burung merak, dan fitur RSVP lengkap.",
  thumbnail_path: "/media/mockups/mockup-jade-pavilion.webp",
  preview_path: "/jade-pavilion?to=Tamu%20Undangan",
  sort_order: 15,
  price: 120000,
  promo_price: 80000,
};

console.log("1. Mendaftarkan template Jade Pavilion ke Supabase...");
const { data: templateRow, error: templateError } = await client
  .from("templates")
  .upsert(templatePayload, { onConflict: "slug" })
  .select("id, slug, name")
  .single();

if (templateError || !templateRow) {
  console.error("Gagal menyimpan template jade-pavilion:", templateError?.message);
  process.exit(1);
}
console.log(`✓ Template ${templateRow.name} (${templateRow.slug}) tersimpan: ${templateRow.id}`);

const invitationPayload = {
  id: "00000000-0000-0000-0000-000000000115",
  slug: "jade-pavilion",
  template_id: templateRow.id,
  status: "published",
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
  story_image_path: "/media/sunda-vibes/5.jpg",
  cover_path: "/media/sunda-vibes/1.jpg",
  profile_path: "/media/sunda-vibes/2.jpg",
  gallery_paths: [
    "/media/sunda-vibes/1.jpg",
    "/media/sunda-vibes/2.jpg",
    "/media/sunda-vibes/3.jpg",
    "/media/sunda-vibes/4.jpg",
    "/media/sunda-vibes/5.jpg",
  ],
  music_path: "/media/elegant/Bergema Selamanya.mp4",
  gift_info: {
    bank: "BCA",
    account_number: "7125091428",
    account_name: "Fajar Sidik",
  },
  theme_overrides: {},
  closing_text:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.",
  closing_greeting: "Kami yang berbahagia, Dita & Fajar",
};

console.log("2. Mendaftarkan undangan demo Jade Pavilion (Dita & Fajar)...");
const { data: invitationRow, error: invError } = await client
  .from("invitations")
  .upsert(invitationPayload, { onConflict: "slug" })
  .select("id, slug, bride_short_name, groom_short_name")
  .single();

if (invError || !invitationRow) {
  console.error("Gagal menyimpan undangan jade-pavilion:", invError?.message);
  process.exit(1);
}
console.log(
  `✓ Undangan ${invitationRow.slug} (${invitationRow.bride_short_name} & ${invitationRow.groom_short_name}) tersimpan: ${invitationRow.id}`,
);

console.log("3. Memastikan token akses dashboard RSVP aktif...");
const { data: existingAccess } = await client
  .from("invitation_dashboard_access")
  .select("invitation_id, access_token")
  .eq("invitation_id", invitationRow.id)
  .maybeSingle();

let accessToken = existingAccess?.access_token;
if (!existingAccess) {
  const { data: createdAccess, error: accessError } = await client
    .from("invitation_dashboard_access")
    .insert({ invitation_id: invitationRow.id })
    .select("access_token")
    .single();
  if (accessError) {
    console.error("Gagal membuat token dashboard:", accessError.message);
    process.exit(1);
  }
  accessToken = createdAccess.access_token;
}

console.log("✓ Token dashboard RSVP aktif:", accessToken ? "[tersedia]" : "[kosong]");
console.log("Selesai! Template Jade Pavilion terhubung penuh ke Katalog, RSVP, dan Admin CMS.");
