import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const categoryId = searchParams.get("category_id");

  let query = supabaseAdmin
    .from("expenses")
    .select("*, category:categories(id,name,icon,color)")
    .eq("user_id", session.user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split("T")[0];
    query = query.gte("date", startDate).lte("date", endDate);
  }
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, description, category_id, date, notes } = await req.json();
  if (!amount || !description || !date)
    return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("expenses")
    .insert({
      user_id: session.user.id,
      amount: parseFloat(amount),
      description,
      category_id: category_id || null,
      date,
      notes: notes || null,
    })
    .select("*, category:categories(id,name,icon,color)")
    .single();

  if (error) return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}