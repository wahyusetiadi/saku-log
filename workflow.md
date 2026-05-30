# Panduan Pengujian (Test Flow) Webhook GreenAPI di Localhost

Karena aplikasi Next.js Anda saat ini berjalan di laptop/lokal (`http://localhost:3000`), server GreenAPI yang berada di internet tidak bisa mengakses URL tersebut secara langsung. 

Berikut adalah dua cara yang bisa Anda lakukan untuk menguji (test) integrasi ini:

---

## Opsi 1: Simulasi Lokal via Postman / cURL (Paling Cepat)
Cara ini dilakukan dengan memalsukan *payload* webhook dari GreenAPI menggunakan Postman. Aplikasi akan mengira pesan datang dari GreenAPI, lalu akan mengirimkan **pesan balasan sungguhan** ke WhatsApp Anda.

1. **Siapkan Database:**
   * Buka Supabase, masuk ke tabel `users`.
   * Pastikan Anda mengisi kolom `whatsapp_number` pada akun Anda dengan format nomor (contoh: `628123456789` - tanpa `+`).
2. **Kirim HTTP POST Request ke Localhost Anda:**
   Gunakan **Postman**, **Insomnia**, atau ekstensi VS Code seperti **Thunder Client**.
   * **URL:** `http://localhost:3000/api/webhook/whatsapp`
   * **Method:** `POST`
   * **Headers:** `Content-Type: application/json`
   * **Body (Raw JSON):**
     ```json
     {
       "typeWebhook": "incomingMessageReceived",
       "senderData": {
         "chatId": "628123456789@c.us" 
       },
       "messageData": {
         "typeMessage": "textMessage",
         "textMessageData": {
           "textMessage": "- 25000 beli kopi"
         }
       }
     }
     ```
     *(Ganti angka `628123456789` pada `chatId` dengan nomor Anda).*
3. **Hasil:**
   * Di terminal tempat `npm run dev` berjalan, Anda bisa melihat apakah ada pesan error atau sukses.
   * Cek HP Anda! Anda seharusnya **menerima balasan di WhatsApp** dari nomor GreenAPI Anda yang mengatakan: `"✅ Berhasil dicatat! Pengeluaran: beli kopi"`.

---

## Opsi 2: Menggunakan Ngrok (Uji Coba Langsung dari WA ke Bot)
Cara ini dilakukan dengan menggunakan Ngrok untuk memberikan URL Publik (HTTPS) sementara pada localhost Anda.

1. **Install & Jalankan Ngrok:**
   * Jika belum punya, download di `ngrok.com`.
   * Buka terminal baru dan jalankan: `ngrok http 3000`.
   * Anda akan mendapatkan URL seperti: `https://1234-abcd.ngrok-free.app`.
2. **Setting di Dashboard GreenAPI:**
   * Buka console GreenAPI, pilih instance Anda.
   * Masuk ke menu **Webhook / Notification**.
   * Aktifkan toggle **incoming messages**.
   * Masukkan **Notification URL** dengan format: 
     `https://1234-abcd.ngrok-free.app/api/webhook/whatsapp` (Ganti dengan URL Ngrok Anda).
3. **Uji Coba Langsung:**
   * Buka aplikasi WhatsApp Anda.
   * Kirim pesan ke nomor Bot Anda: `- 75000 belanja bulanan`.
   * Pesan akan diterima oleh HP Bot -> diteruskan ke GreenAPI -> diteruskan ke Ngrok -> masuk ke Localhost Next.js -> Simpan di Supabase -> Bot membalas pesan.
   
*(Catatan: Setelah mendeploy aplikasi ini ke server seperti Vercel, Anda cukup mengganti Notification URL di GreenAPI dengan URL asli production Anda, misalnya `https://saku-log.vercel.app/api/webhook/whatsapp`).*
