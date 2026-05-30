# Rencana Pengembangan Saku-Log (Next Updates)

Dokumen ini berisi daftar ide dan rencana pengembangan fitur untuk aplikasi Saku-Log dan Bot WhatsApp-nya. Fitur-fitur ini sangat relevan untuk membuat pencatatan keuangan pribadi menjadi jauh lebih otomatis dan "hidup".

---

## 🤖 1. Parsing Natural Language dengan AI (Gemini / OpenAI)
**Masalah saat ini:** Pengguna harus mengetik dengan format kaku (contoh: `- 50000 makan`).
**Rencana Pengembangan:**
- Mengintegrasikan API gratis dari Google Gemini ke webhook Next.js.
- Anda bebas *chat* seperti ke teman: *"bro, barusan gue ngopi abis 35 rebu"*.
- AI akan membaca teks tersebut, mengekstrak nilainya menjadi JSON: `{"amount": 35000, "description": "ngopi"}`, lalu bot akan menyimpannya ke database.

## 💰 2. Multi-Wallet (Banyak Dompet/Rekening)
**Masalah saat ini:** Semua pengeluaran tercampur di satu tempat.
**Rencana Pengembangan:**
- **Update Database:** Menambahkan tabel `wallets` (BCA, Mandiri, GoPay, Tunai).
- **Update Bot:** Jika Anda mengetik `- 50000 makan (gopay)`, saldo di tabel GoPay akan otomatis berkurang.
- **Cek Saldo:** Anda bisa *chat* `saldo gopay` dan bot akan membalas total sisa uang Anda di dompet tersebut.

## 📈 3. Pencatatan Pemasukan (Incomes)
**Masalah saat ini:** Bot baru mendukung pencatatan pengeluaran (*expenses*).
**Rencana Pengembangan:**
- **Update Database:** Menambahkan pembeda antara *expense* dan *income*, atau membuat tabel `incomes`.
- **Update Bot:** Jika Anda mengetik `+ 5000000 gaji bulanan`, bot akan mencatatnya sebagai pemasukan, sehingga fitur `rekap` nantinya bisa menghitung: `Sisa Uang = Pemasukan - Pengeluaran`.

## 🗂️ 4. Auto-Categorization (Kategorisasi Otomatis)
**Masalah saat ini:** Kolom `category_id` masih dikosongkan (Null) saat mencatat lewat WA.
**Rencana Pengembangan:**
- Membuat logika pemetaan kata. Jika deskripsi mengandung kata "makan", "jajan", "kopi", bot akan otomatis memasukkan `category_id` untuk Kategori Makanan.
- Ini akan membuat grafik pie-chart di aplikasi web Saku-Log Anda terisi secara otomatis dan terlihat indah.

## ⏰ 5. Pengingat Tagihan (Bill Reminders / Cron Jobs)
**Rencana Pengembangan:**
- Menggunakan layanan penjadwalan (seperti *Vercel Cron* atau *GitHub Actions*) yang akan memicu endpoint API setiap hari tertentu.
- Misalnya setiap tanggal 25, API akan menyuruh Green API mengirimkan pesan WA ke Anda: *"Halo! Jangan lupa hari ini jatuh tempo bayar kos dan langganan Netflix ya!"*

## 📊 6. Ekspor Data via WhatsApp
**Rencana Pengembangan:**
- Saat Anda *chat* bot dengan kata kunci `ekspor bulan ini`.
- Bot (lewat Next.js) akan membuat file CSV atau PDF berisi seluruh riwayat pengeluaran Anda bulan ini.
- Bot akan mengirimkan file tersebut langsung ke WhatsApp Anda sebagai dokumen (Green API mendukung pengiriman file `sendFileByUpload`).

---
*Dokumen ini dapat digunakan sebagai referensi atau backlog jika Anda ingin mulai menambahkan fitur baru.*
