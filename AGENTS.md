<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Agent Instructions & Project Rules

> **PENTING UNTUK AI AGENT**:
> Silakan baca file [PROJECT_RULES.md](file:///d:/Projek%20Coding/Undangan-Digital/PROJECT_RULES.md) sebagai referensi panduan lengkap aturan proyek InDif Digital.

## Ringkasan Aturan Inti (Must-Follow):

1. **Standar Data Mempelai (Dita & Fajar)**:
   - Semua demo template katalog WAJIB menggunakan data pasangan **Dita & Fajar** (`Dita Maharani Putri` & `Fajar Sidik`).
   - JANGAN PERNAH mengembalikan nama mempelai ke "Intan & Difa"!
   - Rekening: BCA `7125091428` a.n. Fajar Sidik.
   - Waktu & Tempat: Waroeng Djoglo Grand Ballroom, Jakarta Barat, 12 Desember 2026.
   - Slug URL: Gunakan slug sesuai nama template (contoh: `/greeny-flowers`, `/pink-vibes`, dll.).

2. **Aturan Bunga & Ornamen Template ("Jangan Terlalu Banyak Bunga")**:
   - Aset bunga harus cat air (*watercolor*) beresolusi tinggi, berlatar transparan, dan tegak natural.
   - Penempatan: Sudut kanan bawah bingkai foto lengkung (*arch*), sudut kanan atas *quote card*, dan penanda judul bagian.
   - **PANTANGAN**: DILARANG menaruh bunga di kartu Wedding Gift (rekening), kartu Wedding Event (acara), atau form RSVP. JANGAN sampai menutupi wajah mempelai atau teks!

3. **Storefront & UI**:
   - Nuansa warna: Hitam & Putih (monokrom elegan) dengan tombol switch Dark/Light mode di kanan atas navbar.
   - Navbar: Harus *fixed* / diam saat di-scroll.
   - Banner teks berjalan (*marquee*): Tetap ada namun ukurannya proporsional (tidak terlalu besar).
   - Tombol CTA: "Jasa custom undangan hanya 160 rb" dengan tombol konsultasi WhatsApp.
   - 3D Coverflow: Bodi smartphone tunggal transparan tanpa border ganda (*no double mockup*), navigasi menggunakan titik/bola putih di bawah (*dots navigation* tanpa tombol panah bulat kanan-kiri).

4. **Validasi & Verifikasi Sebelum Selesai**:
   - `npm run typecheck` (0 error)
   - `npm run test:cms` (41/41 tes lolos)
   - `npm run build` (retry jika muncul prompt advisory Next.js pada first run)

5. **Perlindungan File Production Client (WAJIB)**:
   - Folder `public/media/client/`, `public/media/invitations/`, dan `data/invitations/` adalah **file production customer yang sudah fix**.
   - **JANGAN ubah apapun** di folder client jika tidak ada perintah eksplisit dari pemilik proyek.
   - Jika memang terpaksa harus mengubah file di folder client, **WAJIB tanya dan minta izin user terlebih dahulu**.
   - Pastikan pembaruan template demo katalog tidak pernah menimpa data/foto undangan customer.

6. **Wajib Optimasi Media Sebelum Commit/Push (Template & Undangan Baru)**:
   - Setiap pembuatan template baru atau undangan pelanggan baru **WAJIB** mengoptimalkan seluruh video, foto, dan audio terlebih dahulu menggunakan `node scripts/optimize-media.mjs --scope <folder-baru>` (`--dry-run` dulu, lalu `--apply` dengan backup eksternal di luar repo).
   - **Standar Video**: MP4 H.264 (`libx264`), `yuv420p` (kompatibel Apple/iOS), `-movflags +faststart`, CRF 23–26 (`slow`), 720p untuk opening/background (pertahankan 1080p hanya jika perlu detail desain), hapus audio jika `<video muted>`, target 1–5 MB (opening) / 2–8 MB (background).
   - **Standar Gambar**: WebP untuk dekorasi & foto baru (pertahankan transparansi alpha, maks 1920px, jangan ubah tampilan wajah/warna kulit pelanggan, jangan ubah gambar animasi menjadi statis).
   - **Standar Audio**: MP3 96–128 kbps tanpa embedded cover art besar.
   - **Larangan**: JANGAN pernah commit file mentah/raw kamera atau video uncompressed ke `public/`, JANGAN simpan backup di dalam folder repo yang ikut ter-deploy ke Vercel, dan JANGAN melakukan kompresi massal terhadap undangan lama setiap kali membuat undangan baru.


