# Undangan Nisa & Catur

Sumber konten: formulir client `Ani Wedding.pdf`, diperiksa secara visual pada 15 November 2026. Data pesanan dan nomor WhatsApp pemesan tidak dimasukkan ke undangan publik.

Undangan menggunakan template Mustard Black yang dipilih client: hitam matte, aksen mustard, tipografi serif dan script, bingkai lengkung serta bunga lili yang sudah tersedia. Komposisi dan animasi template dipertahankan. ENERGY 2 / RHYTHM 2 / MOTION 2.

- URL publik: `https://inv.indifdigital.my.id/nisa-dan-catur`.
- Nama wanita ditampilkan lebih dahulu, sesuai formulir. Foto `Sampul_.jpg` dipakai untuk sampul dan bingkai pembuka.
- Foto mempelai sementara memakai foto berdua dari folder client, sesuai arahan pemilik proyek. Ganti `bride_photo_path` dan `groom_photo_path` setelah foto individu tersedia.
- Akad dan resepsi berlangsung 22 November 2026 di kediaman mempelai wanita. Jam, orang tua, Instagram, rekening dan alamat pengiriman mengikuti formulir.
- Cerita hanya dirapikan: pertemuan di lorong SMK, bertukar nomor WhatsApp, hubungan semakin dekat setelah sembilan bulan, restu keluarga dan menuju pernikahan. Tidak ditambahkan tahun pertemuan atau acara lamaran.
- Mandiri dan ShopeePay ditampilkan sebagai dua tujuan berbeda. Penerima serta alamat kado mengikuti isian pengiriman, termasuk kode pos.
- Client tidak mengisi acara tambahan atau siaran langsung. Bagian siaran langsung hanya tampil jika URL siaran tersedia.
- Musik pilihan pemilik proyek: instrumental piano HRPiano, `https://www.youtube.com/watch?v=5XqiLi2HVpU`. Pemutar YouTube ditampilkan setelah undangan dibuka, dengan kontrol bawaan. Pemutaran otomatis bergantung pada kebijakan browser dan ketersediaan YouTube. `music_path` tetap kosong sampai file audio tersedia; lagu contoh tidak dipakai sebagai pengganti.

## Penyimpanan dan akses

Konten untuk provisioning disimpan di `data/invitations/nisa-dan-catur.json`. Undangan client dibuat sebagai row Supabase baru dengan ID tersendiri dan memakai template `mustard-black`; tidak didaftarkan sebagai template katalog baru. Semua penulisan RSVP, ucapan, statistik dan akses dashboard memakai ID undangan baru tersebut. Cookie dashboard tetap dibatasi per slug dan akses data memakai RPC yang memverifikasi token.

Jalankan `node scripts/provision-nisa-catur.mjs` untuk membuat draft. Setelah kode dan foto tersedia pada domain undangan, jalankan `node scripts/provision-nisa-catur.mjs --publish`. Script memeriksa semua media, mempertahankan ID dan token yang sudah ada, serta berhenti jika konten existing berbeda. Tidak mengubah undangan pelanggan lain, contoh Mustard Black, konfigurasi katalog, atau kebijakan RLS.

Magic link dashboard ditulis ke `scratch/nisa-catur/dashboard-access.txt`, yang diabaikan Git. Jangan menyalin token ke source, laporan QA, atau halaman publik. Perubahan data berikutnya dilakukan melalui jalur owner/provisioning dengan verifikasi ulang sumber.
