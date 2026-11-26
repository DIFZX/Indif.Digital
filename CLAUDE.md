# InDif Digital - AI Assistant Guidelines

> Detail lengkap aturan dan arsitektur proyek terdokumentasi di [PROJECT_RULES.md](PROJECT_RULES.md).

## Aturan Utama yang Wajib Dipatuhi

1. **Standar Data Mempelai**:
   - Seluruh demo katalog WAJIB memakai data **Dita & Fajar** (`Dita Maharani Putri` & `Fajar Sidik`).
   - Jangan pernah kembali ke "Intan & Difa".
   - Rekening: BCA `7125091428` a.n. Fajar Sidik.
   - Lokasi: Waroeng Djoglo Grand Ballroom, Jakarta Barat, 12 Desember 2026.
   - Slug template: `/greeny-flowers`, `/pink-vibes`, `/blue-garden`, dsb.

2. **Higienitas Ornamen Bunga**:
   - Hanya gunakan bunga watercolor transparan berkualitas tinggi di sudut bingkai arch dan kartu kutipan.
   - DILARANG menaruh ornamen bunga pada kartu Wedding Gift (nomor rekening), kartu Wedding Event (akad/resepsi), dan form RSVP.
   - Bunga tidak boleh menutupi wajah mempelai atau tulisan.

3. **Storefront & Desain**:
   - Dominan Hitam & Putih dengan Dark/Light mode switcher di kanan atas.
   - Navbar diam/fixed saat di-scroll.
   - Teks berjalan (marquee) berukuran proporsional (tidak terlalu besar).
   - Tombol CTA: "Jasa custom undangan hanya 160 rb" + WhatsApp.
   - Carousel 3D: Single phone mockup transparan, navigasi titik putih di bawah (tanpa panah bulat kiri-kanan).

4. **Testing & Build**:
   - `npm run typecheck`
   - `npm run test:cms`
   - `npm run build` (retry jika Next.js security advisory muncul di first run)

5. **Perlindungan File Production Client (WAJIB)**:
   - Folder `public/media/client/`, `public/media/invitations/`, dan `data/invitations/` adalah **file production customer yang sudah fix**.
   - **JANGAN ubah apapun** di folder client tanpa perintah eksplisit dari user.
   - Jika memang harus mengubah file di folder client, **WAJIB tanya ke user terlebih dahulu**.
