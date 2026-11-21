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

console.log("Menghubungkan ke Supabase di:", url);

const newTemplates = [
  {
    id: "00000000-0000-0000-0000-000000000011",
    slug: "champagne-ivory",
    name: "Champagne Ivory",
    theme: { primary: "#B89358", accent: "#E8D5B5", background: "#FAF7F2" },
    is_active: true,
    catalog_status: "available",
    category: "minimalis",
    description: "Template mewah bernuansa champagne & white silk prewedding dengan aksen arch emas halus, layout minimalis, dan fitur digital lengkap.",
    thumbnail_path: "/media/mustard-black/1.jpg",
    preview_path: "/champagne-ivory?to=Tamu%20Undangan",
    sort_order: 11,
    price: 70000,
    promo_price: 35000,
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    slug: "dusty-rose",
    name: "Dusty Rose",
    theme: { primary: "#B86B7B", accent: "#EBB8C2", background: "#FCF6F7" },
    is_active: true,
    catalog_status: "available",
    category: "minimalis",
    description: "Template romantis bernuansa blush pink & dusty rose dress prewedding dengan kelopak mawar anggun, nuansa manis, dan RSVP interaktif.",
    thumbnail_path: "/media/mustard-black/1.jpg",
    preview_path: "/dusty-rose?to=Tamu%20Undangan",
    sort_order: 12,
    price: 70000,
    promo_price: 35000,
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    slug: "sage-botanical",
    name: "Sage Botanical",
    theme: { primary: "#52704E", accent: "#A3C09F", background: "#F4F6F2" },
    is_active: true,
    catalog_status: "available",
    category: "minimalis",
    description: "Template sejuk bernuansa sage green & eucalyptus prewedding dengan ornamen botanical organik, sentuhan alami, dan amplop digital.",
    thumbnail_path: "/media/mustard-black/1.jpg",
    preview_path: "/sage-botanical?to=Tamu%20Undangan",
    sort_order: 13,
    price: 70000,
    promo_price: 35000,
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    slug: "terracotta-warmth",
    name: "Terracotta Warmth",
    theme: { primary: "#B55B39", accent: "#E8A285", background: "#FAF4EE" },
    is_active: true,
    catalog_status: "available",
    category: "minimalis",
    description: "Template bohemian hangat bernuansa terracotta & desert sand prewedding dengan aksen sunburst earthy, tata letak chic, dan buku tamu online.",
    thumbnail_path: "/media/mustard-black/1.jpg",
    preview_path: "/terracotta-warmth?to=Tamu%20Undangan",
    sort_order: 14,
    price: 70000,
    promo_price: 35000,
  },
];

// 1. Upsert Templates
console.log("\n1. Mendaftarkan 4 template ke tabel 'templates'...");
for (const tmpl of newTemplates) {
  const { data, error } = await client
    .from("templates")
    .upsert(tmpl, { onConflict: "slug" })
    .select("id, slug, name")
    .single();

  if (error) {
    console.error(`Gagal menyimpan template ${tmpl.slug}:`, error.message);
  } else {
    console.log(`✓ Template ${data.name} (${data.slug}) tersimpan dengan ID: ${data.id}`);
  }
}

// 2. Fetch template IDs from DB to ensure accurate foreign keys
const { data: dbTemplates, error: fetchTmplError } = await client
  .from("templates")
  .select("id, slug")
  .in("slug", newTemplates.map((t) => t.slug));

if (fetchTmplError || !dbTemplates) {
  console.error("Gagal mengambil template yang baru disimpan:", fetchTmplError);
  process.exit(1);
}

const templateIdMap = new Map(dbTemplates.map((t) => [t.slug, t.id]));

// 3. Common invitation content (Dita & Fajar)
const baseInvitationData = {
  status: "published",
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
  theme_overrides: {},
  closing_text:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima kasih.",
  closing_greeting: "Kami yang berbahagia, Dita & Fajar",
};

const newInvitations = [
  {
    id: "00000000-0000-0000-0000-000000000111",
    slug: "champagne-ivory",
    template_id: templateIdMap.get("champagne-ivory"),
    ...baseInvitationData,
  },
  {
    id: "00000000-0000-0000-0000-000000000112",
    slug: "dusty-rose",
    template_id: templateIdMap.get("dusty-rose"),
    ...baseInvitationData,
  },
  {
    id: "00000000-0000-0000-0000-000000000113",
    slug: "sage-botanical",
    template_id: templateIdMap.get("sage-botanical"),
    ...baseInvitationData,
  },
  {
    id: "00000000-0000-0000-0000-000000000114",
    slug: "terracotta-warmth",
    template_id: templateIdMap.get("terracotta-warmth"),
    ...baseInvitationData,
  },
];

console.log("\n2. Mendaftarkan 4 undangan ke tabel 'invitations'...");
const createdInvitationIds = [];

for (const inv of newInvitations) {
  const { data, error } = await client
    .from("invitations")
    .upsert(inv, { onConflict: "slug" })
    .select("id, slug, bride_short_name, groom_short_name")
    .single();

  if (error) {
    console.error(`Gagal menyimpan undangan ${inv.slug}:`, error.message);
  } else {
    createdInvitationIds.push(data.id);
    console.log(`✓ Undangan ${data.slug} (${data.bride_short_name} & ${data.groom_short_name}) tersimpan dengan ID: ${data.id}`);
  }
}

// 4. Ensure invitation_dashboard_access exists for each
console.log("\n3. Memeriksa token akses dashboard client di 'invitation_dashboard_access'...");
for (const invId of createdInvitationIds) {
  const { data: existingAccess } = await client
    .from("invitation_dashboard_access")
    .select("invitation_id, access_token")
    .eq("invitation_id", invId)
    .maybeSingle();

  if (!existingAccess) {
    const { data: newAccess, error: insertAccessErr } = await client
      .from("invitation_dashboard_access")
      .insert({ invitation_id: invId })
      .select("invitation_id, access_token")
      .single();

    if (insertAccessErr) {
      console.warn(`Peringatan dashboard access untuk ${invId}:`, insertAccessErr.message);
    } else {
      console.log(`✓ Token dashboard dibuat untuk ${invId}: ${newAccess?.access_token}`);
    }
  } else {
    console.log(`✓ Token dashboard sudah aktif untuk ${invId}: ${existingAccess.access_token}`);
  }
}

// 5. Final summary
console.log("\n=== HASIL PROVISIONING SUPABASE ===");
const { data: finalInvList } = await client
  .from("invitations")
  .select(`
    id, slug, status,
    template:templates(name, slug, category, price, promo_price),
    access:invitation_dashboard_access(access_token)
  `)
  .in("slug", newInvitations.map((i) => i.slug));

for (const item of finalInvList || []) {
  const token = Array.isArray(item.access) ? item.access[0]?.access_token : item.access?.access_token;
  console.log(`
• Slug: ${item.slug}
  Template: ${item.template?.name} (${item.template?.category})
  Status: ${item.status}
  URL Undangan: http://localhost:3000/${item.slug}
  URL Dashboard Client: http://localhost:3000/${item.slug}/dashboard/access?key=${token || ""}`);
}

console.log("\nSelesai! Seluruh data template, undangan, dan token dashboard telah berhasil masuk ke Supabase.");
