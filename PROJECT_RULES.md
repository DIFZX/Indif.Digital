# Panduan & Aturan Pengembangan Website InDif Digital (PROJECT_RULES.md)

> **DOKUMEN INI WAJIB DIBACA OLEH AI ASSISTANT / DEVELOPER MANAPUN SEBELUM MELAKUKAN PERUBAHAN APAPUN DI REPOSITORY INI.**
> Dokumen ini mencatat seluruh preferensi pemilik proyek, aturan desain, pantangan revisi (*do's and don'ts*), struktur data, serta standar teknis yang telah disepakati dari iterasi sebelumnya agar tidak terjadi regresi desain.

---

## 1. Profil & Ringkasan Proyek

- **Nama Brand**: **InDif Digital** (Undangan Pernikahan Digital)
- **Repositori**: `Undangan-Digital` (Branch utama: `main`)
- **Tujuan Proyek**: Platform katalog penjualan dan pembuatan website undangan pernikahan digital modern, interaktif, responsif, dan elegan.
- **Teknologi Utama**:
  - **Framework**: Next.js 16 (App Router, Turbopack)
  - **UI Library**: React 19, TypeScript
  - **Styling**: CSS Modules (`*.module.css`) & Global CSS (`app/globals.css`), Vanilla CSS murni tanpa Tailwind kotor.
  - **Database & Auth**: Supabase (PostgreSQL dengan Row Level Security / RLS)
  - **Testing & Tools**: Node.js test runner (`node --test tests/sales-cms.test.mjs`), Playwright & Sharp untuk visual regression dan otomasi render mockup.

---

## 2. Standar Data Mempelai (SANGAT PENTING)

> [!CAUTION]
> **PANTANGAN MUTLAK**: Jangan pernah mengembalikan nama mempelai ke "Intan & Difa"!

Semua template demo katalog resmi menggunakan data pasangan **Dita & Fajar**:

- **Mempelai Wanita**:
  - Nama Lengkap: `Dita Maharani Putri`
  - Nama Panggilan: `Dita`
  - Orang Tua: `Putri Pertama dari Bapak Anas Rifai & Ibu Kholifah`
  - Foto: `/media/sunda-vibes/The Bride.jpg` atau `/media/mustard-black/The Bride.jpg`
- **Mempelai Pria**:
  - Nama Lengkap: `Fajar Sidik`
  - Nama Panggilan: `Fajar`
  - Orang Tua: `Putra Kedua dari Bapak M. Dawam & (Almh) Ibu Dewi Sudarwati`
  - Foto: `/media/sunda-vibes/The Groom.jpg` atau `/media/mustard-black/The Groom.jpg`
- **Informasi Acara**:
  - Tanggal: `2026-12-12` (Sabtu, 12 Desember 2026)
  - Akad / Pemberkatan: `08.00 WIB - Selesai`
  - Resepsi: `11.00 WIB - Selesai`
  - Lokasi: `Waroeng Djoglo Grand Ballroom`, Jl. Joglo Raya No. 45, Kembangan, Jakarta Barat
  - Google Maps: `https://maps.google.com/?q=Waroeng+Djoglo`
- **Hadiah Digital (Wedding Gift)**:
  - Bank: `BCA`
  - Nomor Rekening: `7125091428`
  - Atas Nama: `Fajar Sidik`
- **Salam Penutup**:
  - `"Kami yang berbahagia, Dita & Fajar"`

### Aturan Slug Template
- Slug URL untuk setiap template harus identik dengan nama template (contoh: `/greeny-flowers`, `/pink-vibes`, `/blue-garden`, `/champagne-ivory`, `/dusty-rose`, `/sage-botanical`, dll.).
- Jangan gunakan nama personal lama seperti `/intan-dan-difa` sebagai preview path utama. Namun, sistem di `lib/invitations.ts` dan `lib/demo.ts` tetap menyediakan *alias fallback* agar URL lama tetap dapat dibuka tanpa error 404.

---

## 3. Aturan Desain & Tampilan Storefront (Halaman Utama)

### A. Palet Warna & Tema
- Tampilan website storefront mengusung gaya **Monokrom Modern (Hitam & Putih)**.
- Tersedia tombol switcher **Mode Gelap (Dark)** dan **Mode Terang (Light)** di sudut kanan atas navbar.

### B. Navigasi & Navbar
- **Fixed/Sticky Navbar**: Saat halaman di-scroll ke bawah, navbar harus tetap berada di posisi atas (diam / *fixed*), tidak boleh ikut hilang ter-scroll.
- Navbar dibuat bersih dan minimalis: logo **InDif Digital.**, tautan menu `Template`, ikon media sosial (Instagram, TikTok, WhatsApp), dan switch tema (Light/Dark).
- Jangan tambahkan tombol berlebih atau menu yang membingungkan.

### C. Teks Berjalan (Looping Marquee Banner)
- Banner teks berjalan (*infinite marquee*) dipertahankan untuk memuat keunggulan undangan:
  - *Dapat Dashboard RSVP*
  - *Bebas Request*
  - *Harga Mulai 35 rb*
  - *Revisi Cepat & Mudah*
- **Ukuran Teks**: Dibuat proporsional dan tidak terlalu besar agar tetap bernuansa elegan dan tidak mendominasi visual.

### D. Tombol CTA Jasa Custom Undangan
- Terdapat tombol/banner khusus penawaran custom:
  - Teks wajib: **"Jasa custom undangan hanya 160 rb"**
  - Dilengkapi tombol konsultasi via WhatsApp yang langsung mengarah ke chat.

### E. 3D Coverflow Showcase (Katalog Interaktif)
- **Interaksi**: Mockup smartphone di hero dapat digeser (*drag*) menggunakan kursor mouse di desktop atau di-swipe dengan sentuhan jari pada perangkat mobile.
- **Kontrol Navigasi**:
  - Gunakan indikator titik/bola putih (*dots navigation*) di bagian bawah carousel.
  - **PANTANGAN**: Jangan menggunakan tombol bulat panah kiri `<` dan kanan `>` yang besar dan menumpuk di atas mockup.
- **Desain Frame Mockup**:
  - Gunakan frame smartphone realistis ramping (iPhone dengan Dynamic Island dan home swipe bar).
  - Background di sekitar frame HP wajib **transparan** (tidak ada kotak latar hitam di sekeliling bodi HP).
  - **PANTANGAN**: Jangan gunakan mockup bertumpuk ganda (*double border/mockup*) yang tampak aneh atau buram.
- **Pengecualian**:
  - Template `adventure-wedding-pixel` sengaja dikecualikan dari carousel coverflow 3D di hero, dan hanya ditampilkan pada grid katalog bawah.

---

## 4. Higienitas Ornamen Template Undangan ("Jangan Terlalu Banyak Bunga")

Ketika mengerjakan atau merevisi template undangan (khususnya tema prewedding seperti *Champagne Ivory*, *Dusty Rose*, *Sage Botanical*, dan *Terracotta Warmth*):

1. **Kualitas & Bentuk Aset Bunga**:
   - Aset bunga/botani harus berupa karangan bunga cat air (*watercolor botanical bouquet*) beresolusi tinggi, berorientasi tegak alami, dan berlatar belakang 100% transparan (*clean alpha cutout*).
   - Jangan gunakan bentuk lengkungan siku kaku, ranting aneh, atau garland yang tidak proporsional.

2. **Tata Letak & Posisi Bunga yang Diizinkan**:
   - **Cover Arch**: Sudut kanan bawah bingkai lengkung foto cover (ukuran proporsional 64×82px).
   - **Hero Arch**: Sudut kanan bawah bingkai lengkung foto pembuka (ukuran 64×82px).
   - **Groom & Bride Arch**: Sudut bawah bingkai foto mempelai pria & wanita (ukuran 62×78px).
   - **Quote Card**: Sudut kanan atas kartu kutipan ayat (ukuran 58px).
   - **Section Header**: Ornamen kecil penanda judul bagian di tengah.

3. **PANTANGAN BESAR (Anti-Slop Bunga)**:
   - **JANGAN** menaruh ornamen bunga di:
     - Kartu **Wedding Gift** (nomor rekening & info kirim kado).
     - Kartu **Wedding Event** (detail akad & resepsi).
     - Formulir **RSVP & Buku Tamu**.
   - Bunga pada kartu-kartu fungsional tersebut membuat UI menjadi kotor, ramai, dan tidak terbaca (*cluttered*).
   - Pastikan bunga **TIDAK PERNAH** menutupi wajah mempelai pada foto atau menutupi teks bacaan.

---

## 5. Standar Mockup & Tangkapan Layar Katalog

Setiap kali melakukan pembaruan visual pada sebuah template:
1. **Regenerasi Mobile Screen Capture**:
   - Simpan di: `public/media/screens/{slug}.webp`
   - Ukuran: Viewport 390×844 dengan `deviceScaleFactor: 2` (output 780×1688 px), format WebP kualitas 92.
   - Digunakan oleh carousel 3D Coverflow storefront.
2. **Regenerasi Mockup Studio Katalog**:
   - Simpan di: `public/media/mockups/mockup-{slug}.webp`
   - Ukuran: 600×540 dengan `deviceScaleFactor: 2` (output 1200×1080 px), format WebP kualitas 88.
   - Menggunakan gradien studio radial elips yang senada dengan warna tema dan frame smartphone titanium gelap.

---

## 6. Daftar Template & Arsitektur Kode

| No | Slug Template | Nama Template | Kategori | Arsitektur / Komponen |
|:---|:---|:---|:---|:---|
| 1 | `greeny-flowers` | Greeny Flowers | Minimalis | `components/invitation-view.tsx` (GreenyInvitationView) |
| 2 | `pink-vibes` | Pink Vibes | Animasi | `components/templates/pink-vibes/` |
| 3 | `blue-garden` | Blue Garden | Animasi | `components/templates/blue-garden/` |
| 4 | `netflix` | Netflix | Spesial | `components/templates/netflix/` |
| 5 | `mustard-black` | Mustard Black | Minimalis | `components/templates/mustard-black/` |
| 6 | `java-vibes` | Java Vibes | Spesial | `components/templates/java-vibes/` |
| 7 | `sunda-vibes` | Sunda Vibes | Adat | `components/templates/sunda-vibes/` |
| 8 | `royal-maroon` | Royal Maroon | Spesial | `components/templates/royal-maroon/` |
| 9 | `blush-rose` | Pinky Bloom | Animasi | `components/templates/blush-rose/` |
| 10 | `champagne-ivory` | Champagne Ivory | Minimalis | `components/templates/prewedding/` |
| 11 | `dusty-rose` | Dusty Rose | Minimalis | `components/templates/prewedding/` |
| 12 | `sage-botanical` | Sage Botanical | Minimalis | `components/templates/prewedding/` |
| 13 | `terracotta-warmth`| Terracotta Warmth | Minimalis | `components/templates/prewedding/` |
| 14 | `adventure-wedding-pixel` | Adventure Wedding Pixel | Interaktif | `components/templates/adventure-wedding-pixel/` |

> Empat tema prewedding modern (*Champagne Ivory*, *Dusty Rose*, *Sage Botanical*, dan *Terracotta Warmth*) berbagi arsitektur bersama di `components/templates/prewedding/prewedding-client-app.tsx` dan `prewedding.module.css`.

---

## 7. Prosedur Pengujian & Catatan Teknis Next.js

Sebelum melakukan commit dan mengumumkan pekerjaan selesai, selalu jalankan urutan pengujian berikut:

```bash
# 1. Pengecekan Type TypeScript (harus 0 error)
npm run typecheck

# 2. Pengujian Sales CMS & Security (seluruh 41 tes harus lolos)
npm run test:cms

# 3. Production Build
npm run build
```

### Catatan Keamanan Next.js 16.4.2 (Security Advisory Quirk)
Pada sesi terminal baru, perintah `npm run build` atau `npx next dev` akan berhenti satu kali dengan pesan `SecurityFatalError` untuk menampilkan saran pembaruan Next.js. **Cukup jalankan ulang (*retry*) perintah yang sama secara langsung**, maka proses build akan berlanjut dan selesai sukses dengan exit code 0.

---

## 8. Standar Git & Repositori

- Selalu gunakan pesan commit konvensional (*conventional commits*) yang jelas dalam bahasa Inggris atau Indonesia, contoh:
  - `feat(templates): update Greeny Flowers, Pink Vibes, and Blue Garden to Dita & Fajar with updated slug`
  - `fix(sage-botanical): update botanical floral asset, align layout format, and regenerate mockups`
- Target push utama adalah branch `main`:
  ```bash
  git push origin main
  ```
- Jaga kebersihan repositori: jangan pernah commit file temporary scratch ke git tracking kecuali skrip utilitas yang memang dibutuhkan jangka panjang.

---

## 9. Perlindungan File & Data Production Client (WAJIB DIPATUHI)

> [!CAUTION]
> **ATURAN MUTLAK PRODUCTION CLIENT**:
> Seluruh file dan data di dalam folder client (`public/media/client/`, `public/media/invitations/`, dan `data/invitations/`) adalah **file production milik customer yang sudah final (*fix*)**.

1. **Dilarang Mengubah Tanpa Perintah**:
   - Jika **TIDAK ADA perintah eksplisit** dari pemilik proyek, **JANGAN PERNAH** mengubah, menghapus, mengganti, atau memodifikasi apapun di folder client (baik foto, musik, tata letak/desain, teks, jadwal, maupun file JSON undangan client).
2. **Wajib Tanya & Minta Izin Terlebih Dahulu**:
   - Apabila dalam suatu tugas atau perbaikan bug dirasa **harus** menyentuh atau mengubah file di dalam folder client, AI Assistant / Developer **WAJIB bertanya dan meminta persetujuan user terlebih dahulu** sebelum melakukan perubahan apapun.
3. **Isolasi Data Demo vs Client**:
   - Pastikan pembaruan pada template demo katalog (data Dita & Fajar) tidak pernah menimpa atau memengaruhi undangan production milik customer (seperti yang dijaga pada `lib/invitations.ts`).

---
*Dokumen ini dibuat dan diperbarui untuk menjaga konsistensi kualitas desain InDif Digital.*
