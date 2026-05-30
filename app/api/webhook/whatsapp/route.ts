import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/lib/greenapi";

export async function GET(req: Request) {
  // GreenAPI kadang mengirim GET request hanya untuk mengecek apakah URL webhook aktif
  return NextResponse.json({ status: "Webhook is alive and listening" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Pastikan ini adalah pesan masuk dari chat teks biasa
    if (
      body.typeWebhook !== "incomingMessageReceived" ||
      !body.messageData ||
      body.messageData.typeMessage !== "textMessage"
    ) {
      return NextResponse.json({ status: "ignored" });
    }

    const chatId = body.senderData.chatId;
    const textMessage = body.messageData.textMessageData.textMessage;
    
    // Ekstrak nomor WA dari chatId
    const whatsappNumber = chatId.split("@")[0];

    // Cari user berdasarkan nomor WA di database Saku-Log
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, currency")
      .eq("whatsapp_number", whatsappNumber)
      .single();

    if (userError || !user) {
      await sendWhatsAppMessage(
        chatId,
        "Maaf, nomor Anda belum terdaftar di sistem Saku-Log. Silakan tambahkan nomor Anda di database."
      );
      return NextResponse.json({ status: "unregistered_user" });
    }

    // Deteksi fitur Batal / Undo
    const lowerText = textMessage.toLowerCase().trim();
    if (lowerText === "batal" || lowerText === "undo") {
      const today = new Date().toISOString().split("T")[0];
      const { data: latestExpense, error: fetchExpenseError } = await supabaseAdmin
        .from("expenses")
        .select("id, amount, description")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchExpenseError || !latestExpense) {
        await sendWhatsAppMessage(chatId, "⚠️ Tidak ada transaksi terbaru hari ini yang bisa dibatalkan.");
        return NextResponse.json({ status: "no_undo_available" });
      }

      const { error: deleteError } = await supabaseAdmin
        .from("expenses")
        .delete()
        .eq("id", latestExpense.id);

      if (deleteError) {
        await sendWhatsAppMessage(chatId, "❌ Gagal membatalkan transaksi. Terjadi kesalahan server.");
        return NextResponse.json({ status: "error_delete" });
      }

      const formattedAmount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: user.currency || "IDR",
        maximumFractionDigits: 0,
      }).format(latestExpense.amount);

      await sendWhatsAppMessage(chatId, `✅ Transaksi terakhir berhasil dibatalkan dan dihapus:\n\n🗑️ ${latestExpense.description} (${formattedAmount})`);
      return NextResponse.json({ status: "success_undo" });
    }

    // Deteksi fitur Rekap / Laporan Cepat
    if (lowerText.startsWith("rekap")) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const endDate = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01`;

      const { data: expenses, error: fetchError } = await supabaseAdmin
        .from("expenses")
        .select("amount")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lt("date", endDate);

      if (fetchError) {
        await sendWhatsAppMessage(chatId, "❌ Gagal memuat rekap pengeluaran.");
        return NextResponse.json({ status: "error_rekap" });
      }

      const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: user.currency || "IDR",
        maximumFractionDigits: 0,
      }).format(totalAmount);
      
      const monthName = now.toLocaleString("id-ID", { month: "long" });
      await sendWhatsAppMessage(
        chatId,
        `📊 *Rekap Pengeluaran Anda*\nBulan: ${monthName} ${currentYear}\n\n*Total Pengeluaran:* ${formattedTotal}`
      );
      
      return NextResponse.json({ status: "success_rekap" });
    }
    // Parsing pesan yang sudah diperbarui agar kebal Auto-Format WA (bisa baca '-', '•', atau langsung angka)
    // Contoh yang akan lolos: "- 50000 makan", "• 50000 makan", "-50000 makan", "50000 makan"
    const regex = /^\s*[-•]?\s*(\d+)\s+(.+)$/i;
    const match = textMessage.match(regex);

    if (!match) {
      await sendWhatsAppMessage(
        chatId,
        "Format pesan tidak dikenali.\n\nContoh yang benar:\n- 50000 makan siang\n- 15000 bensin"
      );
      return NextResponse.json({ status: "invalid_format" });
    }

    const amount = parseFloat(match[1]);
    const description = match[2].trim();

    // Simpan transaksi ke tabel expenses
    const { error: insertError } = await supabaseAdmin.from("expenses").insert({
      user_id: user.id,
      amount: amount,
      description: description,
      date: new Date().toISOString().split("T")[0],
    });

    if (insertError) {
      console.error(insertError);
      await sendWhatsAppMessage(chatId, "Terjadi kesalahan saat menyimpan transaksi Anda.");
      return NextResponse.json({ status: "error_insert" });
    }

    // Transaksi Berhasil disimpan
    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: user.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

    await sendWhatsAppMessage(
      chatId,
      `✅ Berhasil dicatat!\n\nPengeluaran: ${description}\nNominal: ${formattedAmount}`
    );

    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
