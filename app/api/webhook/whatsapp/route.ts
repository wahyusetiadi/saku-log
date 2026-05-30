import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/lib/greenapi";

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

    const chatId = body.senderData.chatId; // e.g. 628123456789@c.us
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
      // User tidak ditemukan, kirim balasan info
      await sendWhatsAppMessage(
        chatId,
        "Maaf, nomor Anda belum terdaftar di sistem Saku-Log. Silakan tambahkan nomor Anda di database."
      );
      return NextResponse.json({ status: "unregistered_user" });
    }

    // Parsing pesan sederhana (Regex format: - 50000 deskripsi)
    // Bisa menangani "-50000 makan" atau "- 50000 makan siang"
    const regex = /^\s*-\s*(\d+)\s+(.+)$/i;
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
