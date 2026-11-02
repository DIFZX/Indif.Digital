# CMS admin penjualan

Halaman masuk: `/admin/login`. CMS hanya mengatur katalog penjualan: status Aktif,
Maintenance, Dalam Proses, hapus dari katalog, dan pulihkan dari arsip.
Maintenance/Dalam Proses tetap terlihat dengan tombol Pesan nonaktif. Hapus memakai
arsip (`is_active=false`), sehingga data template, undangan yang sudah dipesan,
RSVP, dan magic link dashboard pelanggan tetap utuh.

## 1. Terapkan migrasi

Untuk proyek yang sudah memiliki tabel undangan dan dashboard, terapkan
`supabase/migrations/20261102120000_sales_cms_and_login_protection.sql`
dan `supabase/migrations/20261102123000_register_legacy_sales_templates.sql`
melalui SQL Editor Supabase atau workflow migrasi yang sesuai. Terapkan sebelum
merilis kode CMS. Jika query katalog gagal, aplikasi tidak menampilkan katalog
cadangan agar template yang dihapus tidak muncul kembali.

Riwayat beberapa migrasi lama pada proyek ini memakai versi berbeda dari file
lokal. Jangan melakukan reset database atau menandai migrasi lama sebagai reverted
hanya untuk meloloskan `db push`. Migrasi CMS sudah diterapkan langsung dan dicatat
bersama perubahan skema dalam satu transaksi per migrasi. Migrasi kedua hanya
mendaftarkan Sunda Vibes dan Mustard Black yang sebelumnya tampil dari data
cadangan; baris template yang sudah ada tetap memakai pengaturan sebelumnya.
Status terbaru ada di
[catatan aktivasi](sales-cms-activation.md).

Migrasi memberi profil admin yang sudah ada role `sales`. Akun ini tidak lagi
bisa membaca RSVP privat, statistik, draft undangan, dan token dashboard pelanggan,
atau membuat undangan. Akses tersebut khusus role `owner` untuk alur provisioning
terpisah. Jangan menjadikan akun CMS sebagai `owner`; halaman CMS hanya menerima
`sales`. Kebutuhan owner dapat dikelola terpisah melalui Supabase Dashboard.
Generator `create-invitation` memakai `INVITATION_OWNER_EMAIL` untuk akun owner
terpisah. Saat CAPTCHA Auth aktif, generator juga memerlukan
`INVITATION_OWNER_CAPTCHA_TOKEN` yang baru diterbitkan widget Turnstile (sekali
pakai, kedaluwarsa 5 menit). Jangan mematikan CAPTCHA untuk menjalankan generator.
Jika tidak memakai alur token tersebut, buat undangan melalui Supabase Dashboard.

## 2. Buat Cloudflare Turnstile

1. Buka Cloudflare Dashboard → **Turnstile → Add widget**.
2. Beri nama misalnya `InDif Admin`, pilih mode **Managed**.
3. Tambahkan hostname sebenarnya, misalnya `www.indifdigital.my.id` dan
   `indifdigital.my.id`. Tambahkan hostname preview hanya bila benar-benar dipakai.
   Untuk pengembangan, gunakan widget khusus dengan hostname `localhost`.
4. Simpan **Site key** dan **Secret key**. Jangan pakai test key di production.
5. Di Supabase Dashboard → **Authentication → Bot and Abuse Protection**,
   aktifkan **CAPTCHA protection**, pilih **Cloudflare Turnstile**, masukkan
   **Secret key** widget yang sama, lalu Save.

Supabase memvalidasi token sekali di server, termasuk login langsung lewat Auth
API. Aplikasi mengirim token melalui `captchaToken`, lalu memeriksa bahwa Supabase
benar-benar menolak token palsu sebelum memproses kredensial admin. Jika CAPTCHA
dinonaktifkan atau penyedia bermasalah, login ditolak. Secret Turnstile cukup
disimpan di Supabase Auth, tidak perlu ditaruh di frontend atau kode proyek.

Referensi: [Supabase CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha),
[Cloudflare widget](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/).

## 3. Isi environment server

Isi `.env.local` untuk lokal dan Vercel → Project → Settings → Environment Variables
untuk deployment. Jangan commit secret.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PUBLIC_KEY
ADMIN_USERNAME=USERNAME_ADMIN
ADMIN_AUTH_EMAIL=EMAIL_ADMIN
SUPABASE_SECRET_KEY=SERVER_SECRET_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY=SITE_KEY_WIDGET
```

Ambil `SUPABASE_SECRET_KEY` dari Supabase Project Settings → API Keys → Secret keys.
Legacy `SUPABASE_SERVICE_ROLE_KEY` juga didukung. Kunci ini hanya di server untuk
RPC pembatas login; bukan client Supabase yang dipakai mengubah template.
Perubahan template selalu memakai sesi akun sales dan melewati RLS.

Site key bersifat publik. Secret key Supabase dan password tidak boleh memakai
prefix `NEXT_PUBLIC_`. Redeploy setelah environment berubah karena Site key masuk
ke bundle frontend pada saat build. Jangan menyalin file `.env.local` ke aset publik.

## 4. Buat akun admin

Jika akun sudah ada di Supabase Auth dan `admin_profiles`, gunakan username/email
akun itu pada environment. Setelah migrasi, role harus `sales`. Tidak ada menu
registrasi publik dan metadata signup tidak dapat memberi hak admin.

Untuk akun baru, script lokal memakai API admin Supabase, membuat user terkonfirmasi
dan profil sales tanpa mengirim email. Email yang sudah terdaftar tidak ditimpa.
Di PowerShell, ambil password lewat input tersembunyi agar tidak masuk history:

```powershell
$cmsPassword = Read-Host 'Password admin (minimal 16 karakter)' -AsSecureString
$cmsCredential = [PSCredential]::new('cms', $cmsPassword)
try {
  $env:ADMIN_SETUP_PASSWORD = $cmsCredential.GetNetworkCredential().Password
  npm.cmd run create-admin
} finally {
  Remove-Item Env:ADMIN_SETUP_PASSWORD -ErrorAction SilentlyContinue
  $cmsCredential = $null
  $cmsPassword = $null
}
```

Username/email default mengikuti `ADMIN_USERNAME` dan `ADMIN_AUTH_EMAIL`.
`ADMIN_SETUP_USERNAME` dan `ADMIN_SETUP_EMAIL` dapat digunakan sebagai override.
Gunakan password unik minimal 16 karakter, simpan dalam password manager, dan
matikan **Allow new users to sign up** di Supabase Auth bila registrasi tidak dipakai.
Password tidak ditulis ke file oleh script. Jangan menyimpan password setup di `.env`.

## 5. Periksa sebelum dipakai

Jalankan `npm.cmd run check:cms`. Ini memeriksa konfigurasi tanpa mencetak secret,
memastikan migrasi/profil tersedia, dan menguji penolakan token CAPTCHA palsu.
Pemeriksaan tidak mengubah katalog atau menghabiskan kuota pembatas login aplikasi.
Tes keamanan lokal: `npm.cmd run test:cms`.

Kemudian verifikasi di deployment HTTPS:

- Buka `/admin` tanpa sesi: harus diarahkan ke `/admin/login`.
- Selesaikan CAPTCHA, masuk dengan akun sales, lalu ubah Maintenance/Dalam Proses.
  Periksa label dan tombol Pesan di website publik.
- Hapus satu template contoh, pastikan hilang dari katalog, tetapi undangan pelanggan
  dengan template yang sama tetap bisa dibuka. Pulihkan melalui tab Diarsipkan.
- Periksa cookie `indif-sales-auth` dan `indif-sales-session`: HttpOnly, Secure,
  SameSite=Strict, Path=/admin.
- Pastikan logout mengakhiri sesi browser dan sesi lebih dari 8 jam meminta login lagi.

Batas 8 jam memakai penanda waktu login yang ditandatangani server dan terikat
ke user. Refresh token Supabase maupun login dari perangkat lain tidak memperpanjang
penanda browser yang sudah ada. Penanda ini melengkapi verifikasi user oleh Supabase,
tidak menggantikan autentikasi provider.

Pembatas aplikasi tersimpan atomik di Postgres: 5 percobaan per IP dalam 15 menit,
dan 30 percobaan total dalam 15 menit untuk menahan percobaan dari banyak IP.
Percobaan dengan data tidak lengkap tetap dihitung. IP disimpan sebagai HMAC,
tanpa password atau username percobaan. Request yang sudah diblokir per IP tidak
menghabiskan kuota global. Login ditolak jika database pembatas tidak tersedia.
Global limit berarti serangan terdistribusi dapat menunda login admin hingga
jendela berikutnya; website publik dan dashboard pelanggan tetap berjalan.

IP hanya dipercaya dari header yang ditulis ulang Vercel saat `VERCEL=1`.
Di hosting lain/lokal, semua request memakai satu bucket bersama, sehingga header
`X-Forwarded-For` palsu tidak dapat melewati pembatas. Jika pindah hosting,
sesuaikan sumber IP hanya setelah proxy tepercaya dikonfigurasi.

Supabase Auth juga harus tetap mengaktifkan rate limit bawaan untuk melindungi
endpoint Auth langsung. Atur di **Authentication → Rate Limits** sesuai kebutuhan.
Lihat [dokumentasi rate limits](https://supabase.com/docs/guides/auth/rate-limits).
Pengamanan ini mengurangi risiko brute force; bukan jaminan kebal semua serangan.

Perubahan katalog dicatat oleh trigger database di `template_catalog_events`
(aktor, sebelum/sesudah, waktu), yang tidak bisa diubah/dibaca akun sales.
Pemeriksaan log dilakukan lewat Supabase Dashboard oleh pemilik proyek.
