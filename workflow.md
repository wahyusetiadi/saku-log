# Buku Panduan (User Guide) Bot WhatsApp Saku-Log

Selamat datang di Panduan Penggunaan Saku-Log via WhatsApp Bot! Dengan bot ini, Anda bisa mencatat, menghapus, dan merekap pengeluaran langsung dari obrolan WhatsApp tanpa perlu membuka aplikasi web.

---

## 🚀 Daftar Perintah (Commands) Bot

Berikut adalah daftar perintah yang saat ini dikenali oleh bot:

### 1. Mencatat Pengeluaran
Untuk mencatat pengeluaran baru, kirim pesan dengan format awalan nominal diikuti keterangannya. Anda bebas menggunakan awalan minus (`-`), titik (`•`), atau langsung angkanya saja.

**Contoh yang Benar:**
* `50000 makan siang`
* `- 25000 jajan boba`
* `• 150000 belanja mingguan`

*Bot akan secara pintar mendeteksi angka pertama sebagai jumlah uang (amount) dan kata-kata setelahnya sebagai deskripsi.*

### 2. Membatalkan Transaksi Terakhir (Undo)
Jika Anda salah mengetik nominal atau deskripsi pada transaksi yang baru saja Anda masukkan, Anda bisa membatalkannya dengan cepat tanpa perlu membuka web.

**Ketik salah satu kata ini:**
* `batal`
* `undo`

**Cara Kerja:** Bot akan mencari 1 transaksi paling terakhir milik Anda yang dicatat **pada hari ini**, dan langsung menghapusnya dari database.

### 3. Laporan Rekapitulasi (Quick Report)
Ingin tahu sudah berapa banyak uang yang Anda keluarkan bulan ini?

**Ketik awalan kata:**
* `rekap`
* `rekap bulan ini` (atau kalimat apapun yang diawali kata rekap)

**Cara Kerja:** Bot akan otomatis menarik semua transaksi Anda dari tanggal 1 hingga akhir bulan saat ini, menjumlahkannya, dan memberikan informasi **Total Pengeluaran Bulan Ini**.

---

## 🛠️ FAQ & Troubleshooting

Jika bot tidak merespons pesanan Anda, periksa beberapa hal berikut:

**1. Kenapa bot membalas "Maaf, nomor Anda belum terdaftar"?**
Ini berarti nomor WhatsApp Anda belum dicatat di database. Masuk ke dashboard Supabase Anda, buka tabel `users`, dan pastikan kolom `whatsapp_number` di akun Anda terisi dengan angka tanpa awalan plus, contoh: `628123456789`.

**2. Kenapa tidak ada balasan sama sekali?**
* Pastikan HP Bot Anda (yang di-scan QR-nya di Green API) dalam keadaan hidup dan terkoneksi internet.
* Pastikan token `GREEN_API` sudah dimasukkan ke halaman *Environment Variables* di Vercel Anda, dan Anda sudah melakukan **Redeploy**.
* Pastikan Anda memasukkan URL **Domain Utama Vercel** Anda di pengaturan Webhook Green API. Jangan gunakan Preview URL (URL yang ada kode acaknya), karena Vercel akan memblokir request tersebut ke halaman login.

**3. Format Pesan Salah?**
Jika Anda mengetik seperti `makan 50000` (terbalik), bot akan menolak dan memberikan peringatan format yang benar. Pastikan selalu mendahulukan nominal angka!
