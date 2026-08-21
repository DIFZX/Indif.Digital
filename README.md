# Undangan Digital

MVP platform undangan digital berbasis Next.js dan Supabase. Template, data undangan, path media, ucapan, dan RSVP tersimpan di database. File media saat ini berada di `public/media` dan direferensikan melalui path stabil seperti `/media/elegant/hero.svg`.

Alur data publik: route `/{slug}` membaca undangan `published` dan template aktif melalui anon key. Form dikirim ke route server `/api/guest-response`, divalidasi dengan Zod, lalu ditulis ke tabel `rsvps` dan `greetings`. Tidak ada service-role key di frontend.

## Menjalankan lokal

1. Jalankan migration `supabase/migrations/202608180001_initial.sql` melalui SQL Editor Supabase.
2. Salin `.env.example` menjadi `.env.local`, lalu isi URL dan anon/publishable key Supabase.
3. Jalankan `npm install`, kemudian `npm run dev`.
4. Buka `http://localhost:3000/intan-dan-difa`.

Tanpa `.env.local`, undangan contoh tetap tampil dalam mode demo; pengiriman form dinonaktifkan karena tidak ada database tujuan.

## Persiapan migrasi media ke Cloudflare R2

Seluruh media melewati resolver di `lib/media.ts`. Selama `NEXT_PUBLIC_MEDIA_BASE_URL` kosong, path `/media/...` tetap dibaca dari folder `public` sehingga cara kerja lokal dan Vercel tidak berubah.

Ketika R2 sudah digunakan:

1. Salin isi proyek ke bucket dengan mempertahankan key lengkapnya. Contoh `public/media/elegant/hero.svg` menjadi object `media/elegant/hero.svg`.
2. Hubungkan custom domain bucket, misalnya `https://media.indifdigital.com`.
3. Isi `NEXT_PUBLIC_MEDIA_BASE_URL=https://media.indifdigital.com` pada environment deployment.
4. Build ulang aplikasi dan uji gambar, galeri, musik, serta video sebelum mengalihkan domain utama.

Path yang disimpan di Supabase tetap `/media/...`; jangan simpan domain Vercel atau domain R2 di setiap baris. Dengan demikian perpindahan provider cukup dilakukan melalui satu environment variable. URL absolut `https://...` tetap didukung untuk kebutuhan khusus dan tidak akan diubah resolver.

## Batas keamanan saat ini

Tidak ada login klien. RLS hanya membuka undangan berstatus `published`, template aktif, dan ucapan yang telah disetujui. Pengunjung dapat menambahkan RSVP dan ucapan, tetapi ucapan baru selalu masuk sebagai `is_approved = false`. Pengelolaan data untuk tahap ini dilakukan melalui Supabase Dashboard.
