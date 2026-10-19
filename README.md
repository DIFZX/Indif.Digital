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

Dashboard client tidak memakai akun atau password. Setiap undangan memperoleh magic link
unik dengan format `/{slug}/dashboard/access?key={token}`. Setelah link dibuka,
token disimpan dalam cookie HTTP-only selama 180 hari dan client diarahkan ke URL
dashboard yang bersih. Jangan menaruh magic link di halaman undangan publik atau
membagikannya selain kepada pemilik undangan.

RLS tetap melarang role anonim membaca tabel RSVP, ucapan, token dashboard, dan
analytics secara langsung. Data dashboard hanya dikeluarkan oleh fungsi Supabase
yang memverifikasi token milik undangan tersebut. Pengunjung tetap dapat mengirim
RSVP dan ucapan untuk undangan `published`.

Jumlah "Undangan Dibuka" dihitung sebagai browser unik per undangan. IP pengunjung
tidak disimpan. Terapkan migration berikut secara berurutan sebelum deployment:

1. `supabase/migrations/20261019190000_secure_dashboard_and_add_views.sql`
2. `supabase/migrations/20261019210000_add_client_dashboard_magic_links.sql`

Untuk melihat link dashboard undangan yang sudah ada, jalankan query ini di SQL Editor
Supabase setelah kedua migration selesai:

```sql
select
  invitation.slug,
  'https://indifdigital.my.id/' || invitation.slug ||
  '/dashboard/access?key=' || access.access_token::text as dashboard_url
from public.invitations as invitation
join public.invitation_dashboard_access as access
  on access.invitation_id = invitation.id
order by invitation.created_at desc;
```
