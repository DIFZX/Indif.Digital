# Status aktivasi CMS — 2 November 2026

## Sudah dikerjakan

- Migrasi `20261102120000_sales_cms_and_login_protection` sudah diterapkan pada
  Supabase proyek Undangan-Digital. Skema dan catatan migrasi disimpan dalam satu
  transaksi tanpa menjalankan ulang migrasi lama yang versinya berbeda.
- Migrasi `20261102123000_register_legacy_sales_templates` sudah mendaftarkan
  Sunda Vibes dan Mustard Black yang sebelumnya hanya tampil melalui data
  cadangan. Katalog sekarang berisi 9 template, termasuk 1 template yang sudah
  diarsipkan sebelumnya. Pengaturan template yang sudah ada tetap dipertahankan.
- Akun admin yang sudah ada mempunyai role `sales`. Username dan email sesuai
  konfigurasi lokal, dan email akun sudah terkonfirmasi.
- Secret key server Supabase sudah disimpan di `.env.local`; file ini diabaikan
  Git dan nilai key tidak dicetak dalam log atau ditulis di dokumen.
- Pemeriksaan langsung membuktikan akun sales tidak dapat membaca RSVP privat,
  token dashboard, statistik pelanggan, dan draft undangan. Akun sales juga tidak
  dapat menghapus data template atau mengubah isi desain melalui REST.
- RPC dashboard pelanggan tetap menerima token sah dan menolak token palsu.
  Semua undangan terbit masih mempunyai relasi template yang dapat dibaca publik.
- Pembatas login produksi sudah diuji: lima percobaan diizinkan, percobaan keenam
  ditolak. Seluruh percobaan sintetis di-rollback sehingga tidak menghabiskan
  kuota login admin.

Data pelanggan tetap sama; jumlah template bertambah dua sesuai pendaftaran
desain website yang sudah ada:

| Data | Sebelum | Sesudah |
| --- | ---: | ---: |
| Template | 7 | 9 |
| Undangan terbit | 7 | 7 |
| RSVP | 26 | 26 |
| Ucapan | 26 | 26 |
| Tautan dashboard pelanggan | 7 | 7 |

Seluruh 14 tes otomatis keamanan dan registrasi katalog lulus. Setelah pengaturan
Cloudflare dan Supabase diperbarui oleh pemilik proyek, pemeriksaan langsung ke
Auth API membuktikan CAPTCHA produksi aktif: token palsu ditolak dengan kode
`captcha_failed`. Site key publik yang diberikan pemilik sudah disimpan sebagai
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Seluruh pemeriksaan `npm.cmd run check:cms`
lulus dan build dengan Site key tersebut berhasil.

## Konfigurasi hosting dan browser

Vercel sudah terhubung ke proyek `indif-digital` milik akun pemilik website.
`SUPABASE_SECRET_KEY` tersimpan sebagai Secret dan
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` sebagai Config pada environment Production dan
Preview. Nilai secret tidak ditulis ke log atau commit.

Uji widget asli pada `localhost` menghasilkan kode Cloudflare `110200` (hostname
belum diizinkan). Jika membutuhkan login lokal, tambahkan `localhost` ke daftar
hostname widget di Cloudflare. Jangan mematikan verifikasi server untuk mengatasi
pembatasan hostname. Uji browser otomatis pada hostname produksi belum memperoleh
token CAPTCHA sah; pasangan Site key/Secret key dan alur login penuh perlu
dipastikan melalui widget pada halaman login produksi.

Halaman CMS memakai `https://www.indifdigital.my.id/admin/login`. Status
publikasi mengikuti deployment Vercel, terpisah dari hasil pemeriksaan database.
