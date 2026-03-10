import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "csv";
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  let query = supabaseAdmin
    .from("expenses")
    .select("*, category:categories(name, icon)")
    .eq("user_id", session.user.id)
    .order("date", { ascending: false });

  if (month && year) {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }

  const { data: expenses, error } = await query;
  if (error) return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });

  if (format === "csv") {
    const headers = ["Tanggal", "Deskripsi", "Kategori", "Jumlah (IDR)", "Catatan"];
    const rows = expenses?.map((e) => [
      e.date,
      `"${e.description?.replace(/"/g, '""') || ""}"`,
      `"${e.category?.name || "Tanpa Kategori"}"`,
      e.amount,
      `"${e.notes?.replace(/"/g, '""') || ""}"`,
    ]) || [];

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const filename = month && year
      ? `saku-log-${year}-${String(month).padStart(2, "0")}.csv`
      : `saku-log-semua.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // JSON format untuk diproses di client menjadi Excel
  return NextResponse.json({ data: expenses });
}