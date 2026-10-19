# Undangan Digital

MVP platform undangan digital berbasis Next.js dan Supabase. Template, data undangan, path media, ucapan, dan RSVP tersimpan di database. File media saat ini berada di `public/media` dan direferensikan melalui path stabil seperti `/media/elegant/hero.svg`.

Alur data publik: route `/{slug}` membaca undangan `published` dan template aktif melalui anon key. Form dikirim ke route server `/api/guest-response`, divalidasi dengan Zod, lalu ditulis ke tabel `rsvps` dan `greetings`. Tidak ada service-role key di frontend.

## Menjalankan lokal

1. Jalankan migration `supabase/migrations/202608180001_initial.sql` melalui SQL Editor Supabase.
2. Salin `.env.example` menjadi `.env.local`, lalu isi URL dan anon/publishable key Supabase.
3. Jalankan `npm install`, kemudian `npm run dev`.
4. Buka `http://localhost:3000/intan-dan-difa`.

Tanpa `.env.local`, undangan contoh tetap tampil dalam mode demo; pengiriman form dinonaktifkan karena tidak ada database tujuan.

## Membuat undangan pelanggan baru

Jalankan generator interaktif dari terminal project:

    npm run create-invitation

Masukkan password akun admin Supabase saat diminta. Password ditampilkan sebagai tanda bintang dan tidak disimpan. Generator akan:

1. Memastikan akun yang login terdaftar di `admin_profiles`.
2. Menduplikasi data dari undangan sumber, misalnya `intan-dan-difa`.
3. Meminta slug, nama mempelai, orang tua, tanggal, waktu, dan lokasi pelanggan baru.
4. Menyalin media ke `public/media/invitations/<slug-baru>` agar file setiap pelanggan terpisah.
5. Menyimpan undangan baru sebagai `draft` agar belum dapat dibuka publik sebelum media diperiksa.

Setelah generator selesai, ganti media di folder pelanggan, commit dan push ke GitHub, tunggu deployment Vercel selesai, kemudian ubah status undangan menjadi `published` melalui Supabase Dashboard.

## Persiapan migrasi media ke Cloudflare R2

Seluruh media melewati resolver di `lib/media.ts`. Selama `NEXT_PUBLIC_MEDIA_BASE_URL` kosong, path `/media/...` tetap dibaca dari folder `public` sehingga cara kerja lokal dan Vercel tidak berubah.

Ketika R2 sudah digunakan:

1. Salin isi proyek ke bucket dengan mempertahankan key lengkapnya. Contoh `public/media/elegant/hero.svg` menjadi object `media/elegant/hero.svg`.
2. Hubungkan custom domain bucket, misalnya `https://media.indifdigital.com`.
3. Isi `NEXT_PUBLIC_MEDIA_BASE_URL=https://media.indifdigital.com` pada environment deployment.
4. Build ulang aplikasi dan uji gambar, galeri, musik, serta video sebelum mengalihkan domain utama.

Path yang disimpan di Supabase tetap `/media/...`; jangan simpan domain Vercel atau domain R2 di setiap baris. Dengan demikian perpindahan provider cukup dilakukan melalui satu environment variable. URL absolut `https://...` tetap didukung untuk kebutuhan khusus dan tidak akan diubah resolver.

## Keamanan dan dashboard

Route `/{slug}/dashboard` memuat data pribadi RSVP dan wajib menggunakan sesi admin
Supabase. RLS tidak memberikan akses baca tabel `rsvps` kepada role anonim.
Pengunjung tetap dapat mengirim RSVP dan ucapan untuk undangan `published`.

Jumlah ?Undangan Dibuka? dihitung sebagai browser unik per undangan melalui cookie
HTTP-only. IP pengunjung tidak disimpan. Terapkan migrasi terbaru di
`supabase/migrations/20261019190000_secure_dashboard_and_add_views.sql` sebelum
