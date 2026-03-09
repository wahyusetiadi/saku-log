import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";
import { getMonthRange } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year  = parseInt(searchParams.get("year")  || String(new Date().getFullYear()));

  const { data: planners } = await supabaseAdmin.from("planners").select("*, category:categories(id,name,icon,color)").eq("user_id", session.user.id).eq("month", month).eq("year", year);
  const { start, end } = getMonthRange(month, year);
  const { data: expenses } = await supabaseAdmin.from("expenses").select("category_id, amount").eq("user_id", session.user.id).gte("date", start).lte("date", end);

  const result = planners?.map(p => {
    const spent = expenses?.filter(e => e.category_id === p.category_id).reduce((s, e) => s + e.amount, 0) || 0;
    return { ...p, spent_amount: spent, remaining_amount: p.budget_amount - spent, percentage_used: p.budget_amount > 0 ? Math.round((spent / p.budget_amount) * 100) : 0 };
  });

  return NextResponse.json({ data: result });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { category_id, month, year, budget_amount, notes } = await req.json();
  if (!category_id || !month || !year || budget_amount === undefined) return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("planners")
    .upsert({ user_id: session.user.id, category_id, month, year, budget_amount: parseFloat(budget_amount), notes: notes || null }, { onConflict: "user_id,category_id,month,year" })
    .select("*, category:categories(id,name,icon,color)").single();
  if (error) return NextResponse.json({ error: "Gagal simpan planner" }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
  const { error } = await supabaseAdmin.from("planners").delete().eq("id", id).eq("user_id", session.user.id);
  if (error) return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  return NextResponse.json({ message: "Dihapus" });
}