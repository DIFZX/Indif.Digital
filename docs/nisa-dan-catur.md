# Undangan Nisa & Catur

Sumber konten: formulir client `Ani Wedding.pdf`, diperiksa secara visual pada 15 November 2026. Data pesanan dan nomor WhatsApp pemesan tidak dimasukkan ke undangan publik.

Undangan menggunakan template Mustard Black yang dipilih client: hitam matte, aksen mustard, tipografi serif dan script, bingkai lengkung serta bunga lili yang sudah tersedia. Komposisi dan animasi template dipertahankan. ENERGY 2 / RHYTHM 2 / MOTION 2.

- URL publik: `https://inv.indifdigital.my.id/nisa-dan-catur`.
- Nama wanita ditampilkan lebih dahulu, sesuai formulir. Foto terbaru `sampul new.jpeg` dipakai untuk sampul dan bingkai pembuka.
- Foto individu memakai `foto mempelai wanita.png` untuk Nisa dan `foto mempelai pria.png` untuk Catur.
- Galeri berisi sepuluh foto berdua tanpa sampul dan foto individu. Referensi pemilik proyek diterapkan sebagai dua kolom bingkai potret seragam dengan rasio 4:5, sudut membulat dan jarak konsisten. Bingkai tetap memakai warna mustard agar menyatu dengan tema. Pengaturan `gallery_layout` hanya berlaku pada undangan ini.
- Akad dan resepsi berlangsung 22 November 2026 di kediaman mempelai wanita. Jam, orang tua, Instagram, rekening dan alamat pengiriman mengikuti formulir.
- Cerita hanya dirapikan: pertemuan di lorong SMK, bertukar nomor WhatsApp, hubungan semakin dekat setelah sembilan bulan, restu keluarga dan menuju pernikahan. Tidak ditambahkan tahun pertemuan atau acara lamaran.
- Mandiri dan ShopeePay ditampilkan sebagai dua tujuan berbeda. Penerima serta alamat kado mengikuti isian pengiriman, termasuk kode pos.
- Client tidak mengisi acara tambahan atau siaran langsung. Bagian siaran langsung hanya tampil jika URL siaran tersedia.
- Musik memakai MP3 `The PanasDalam Bank (Remastered 2018) - Dulu Kita Masih Remaja (Offical Video Audio).mp3` yang disediakan pemilik proyek. Audio dimulai setelah tombol Buka Undangan ditekan dan dapat dijeda/diputar lewat tombol musik. Pemutar serta konfigurasi musik YouTube dihapus.

## Penyimpanan dan akses

Konten untuk provisioning disimpan di `data/invitations/nisa-dan-catur.json`. Undangan client dibuat sebagai row Supabase baru dengan ID tersendiri dan memakai template `mustard-black`; tidak didaftarkan sebagai template katalog baru. Semua penulisan RSVP, ucapan, statistik dan akses dashboard memakai ID undangan baru tersebut. Cookie dashboard tetap dibatasi per slug dan akses data memakai RPC yang memverifikasi token.

Jalankan `node scripts/provision-nisa-catur.mjs` untuk membuat draft. Setelah kode dan foto tersedia pada domain undangan, jalankan `node scripts/provision-nisa-catur.mjs --publish`. Script memeriksa semua media, mempertahankan ID dan token yang sudah ada, serta berhenti jika konten existing berbeda. Tidak mengubah undangan pelanggan lain, contoh Mustard Black, konfigurasi katalog, atau kebijakan RLS.

Untuk menerapkan revisi media pada undangan yang sudah ada, gunakan `--update-media` setelah file tersedia di domain. Opsi ini hanya memperbarui foto, galeri, musik dan pengaturan galeri; data pernikahan diverifikasi tetap sama. ID undangan, token dashboard, RSVP dan ucapan dipertahankan.

Magic link dashboard ditulis ke `scratch/nisa-catur/dashboard-access.txt`, yang diabaikan Git. Jangan menyalin token ke source, laporan QA, atau halaman publik. Perubahan data berikutnya dilakukan melalui jalur owner/provisioning dengan verifikasi ulang sumber.
