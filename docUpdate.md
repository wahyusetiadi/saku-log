# Integrasi Saku-Log dengan WhatsApp Menggunakan Green API (Free)

Ya, project Saku-Log ini **sangat bisa** diintegrasikan dengan WhatsApp menggunakan Green API (tier gratis/Developer) sebagai bot pencatat. Green API menyediakan layanan unofficial WhatsApp API yang mudah dihubungkan dengan aplikasi Next.js melalui Webhook dan REST API.

Berikut adalah alur (flow) bagaimana integrasi tersebut bekerja.

---

## 🔄 Alur Kerja (Workflow) Pencatatan via Bot WA

### 1. Proses Input (User ke WA)
* **Aksi:** Anda mengirimkan pesan WhatsApp ke nomor Bot (nomor yang di-scan di Green API).
* **Contoh Pesan:** `- 50000 Makan siang (makanan)` atau `keluar 50k buat makan siang`

### 2. Penerimaan Webhook (Green API ke Next.js)
* **Trigger:** Green API mendeteksi adanya pesan masuk.
* **Webhook:** Green API akan mengirimkan HTTP POST Request berisi data pesan (pengirim, isi teks, waktu) ke endpoint aplikasi Anda (contoh: `https://domain-saku-log.com/api/webhook/whatsapp`).
* *(Catatan: Untuk pengujian di lokal/komputer Anda, dapat menggunakan alat seperti Ngrok).*

### 3. Pemrosesan Data (Next.js)
* **Validasi:** Sistem mencocokkan nomor pengirim WhatsApp dengan nomor yang terdaftar di database (Supabase) untuk mendapatkan identitas User (User ID). Jika nomor tidak dikenali, proses dihentikan.
* **Ekstraksi (Parsing):** Teks pesan dipecah untuk mendapatkan:
  * **Tipe:** Pemasukan atau Pengeluaran
  * **Nominal:** Rp 50.000
  * **Deskripsi:** Makan siang
  * **Kategori:** Makanan

### 4. Penyimpanan Data (Next.js ke Supabase)
* **Insert DB:** Backend Next.js melakukan query Insert ke tabel `transactions` di Supabase, menautkannya dengan User ID yang sesuai.

### 5. Pengiriman Respon (Next.js ke Green API ke User)
* **Kirim API:** Setelah data sukses disimpan, Next.js mengirim HTTP POST ke endpoint Green API (`/waInstance{id}/sendMessage`) untuk membalas pesan.
* **Pesan Diterima:** Anda menerima pesan balasan di WhatsApp sebagai konfirmasi.
* **Contoh Balasan:** `✅ Berhasil dicatat: Pengeluaran - Makan siang Rp 50.000.`

---

## ⚙️ Persiapan & Langkah Implementasi

1. **Setup Green API:**
   * Daftar akun Green API dan buat Instance baru (pilih Developer tier).
   * Tautkan nomor WhatsApp (scan QR Code) yang akan menjadi Bot.
   * Catat `idInstance` dan `apiTokenInstance`.
2. **Setup Endpoint Webhook (Next.js):**
   * Buat file endpoint webhook, misalnya di `app/api/webhook/whatsapp/route.ts`.
   * Di dashboard Green API, masukkan URL endpoint tersebut ke pengaturan **Notification URL**.
3. **Koneksi User (Supabase):**
   * Tambahkan kolom `phone_number` atau buat tabel mapping di database Supabase untuk menghubungkan User ID (auth) dengan Nomor WhatsApp.
4. **Logika Parsing:**
   * Tentukan format pesan baku (misal: `<tipe> <nominal> <deskripsi> <kategori>`) menggunakan *Regular Expression* (RegEx).
   * Atau, jika ingin lebih pintar tanpa format baku, integrasikan dengan LLM (seperti Gemini API gratis) di backend untuk mengubah pesan natural ("tadi makan bakso 15 ribu") menjadi JSON terstruktur.

## ⚠️ Catatan Terkait Green API "Developer" (Free)
* **Batas Percakapan:** Tier gratis Green API membatasi interaksi maksimal ke **3 nomor WhatsApp (chat)** per bulan. Jika Saku-Log ini hanya untuk penggunaan pribadi Anda sendiri, tier ini sudah **lebih dari cukup**.
* **Limit Pesan:** Terdapat batasan pengiriman pesan bulanan (sekitar 1000 pesan), yang biasanya sangat mencukupi untuk pemakaian normal harian.

---

## 💡 Ide Fitur Tambahan (Khusus Penggunaan Pribadi)

Untuk membuat bot ini lebih "hidup" layaknya asisten keuangan pribadi, berikut beberapa fitur yang sangat relevan untuk Anda tambahkan ke depannya:

1. **Laporan & Rekap Cepat (Quick Reports)**
   * **Konsep:** Anda bisa mengirim pesan seperti `rekap bulan ini` atau `rekap minggu ini`.
   * **Respon Bot:** Bot membalas dengan total pemasukan, pengeluaran, sisa saldo, dan *Top 3* kategori pengeluaran terbanyak bulan ini.

2. **Cek Saldo & Dompet (Multi-Wallet)**
   * **Konsep:** Menambahkan opsi sumber dana. Misal: `keluar 50k gopay makan`. Lalu Anda bisa mengetik `saldo gopay`.
   * **Respon Bot:** "Sisa saldo di dompet Gopay Anda: Rp 150.000."

3. **Pengingat Tagihan Rutin (Bill Reminders)**
   * **Konsep:** Menggunakan fitur *Cron Jobs* (misal via Vercel Cron/GitHub Actions) untuk memicu endpoint Next.js Anda setiap tanggal tertentu (misal tanggal 25).
   * **Aksi Bot:** Bot otomatis mengirim pesan ke Anda: `"Halo! Mengingatkan hari ini waktunya bayar Kos dan Listrik ya!"`

4. **Fitur "Undo" (Batal Transaksi)**
   * **Konsep:** Seringkali kita salah ketik nominal. Daripada harus membuka web untuk menghapus, Anda cukup balas pesan terakhir bot dengan kata `batal` atau `undo`.
   * **Aksi Bot:** Next.js mencari transaksi terakhir dari User ID tersebut dan menghapusnya (atau *soft delete*), lalu membalas: `"✅ Transaksi terakhir (Makan siang Rp 50.000) berhasil dibatalkan."`

5. **Parsing Cerdas Menggunakan AI (Gemini/OpenAI)**
   * **Konsep:** Anda tidak perlu menghafal format baku. Cukup chat natural: *"bro, tadi gue jajan boba 25 ribu pake shopeepay"*.
   * **Aksi:** Webhook Next.js mengirim pesan tersebut ke LLM (seperti *Gemini API* yang ada gratisannya) untuk mengubahnya jadi JSON: `{ "type": "expense", "amount": 25000, "category": "Jajan", "wallet": "ShopeePay" }`. Lalu menyimpannya ke Supabase.
