import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getMonthRange } from "@/lib/utils";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year  = parseInt(searchParams.get("year")  || String(new Date().getFullYear()));
  const { start, end } = getMonthRange(month, year);

  const { data: expenses } = await supabaseAdmin
    .from("expenses")
    .select("*, category:categories(id,name,icon,color)")
    .eq("user_id", session.user.id)
    .gte("date", start).lte("date", end);

  const lm = month === 1 ? 12 : month - 1;
  const ly = month === 1 ? year - 1 : year;
  const { start: ls, end: le } = getMonthRange(lm, ly);
  const { data: lastMonth } = await supabaseAdmin
    .from("expenses").select("amount")
    .eq("user_id", session.user.id)
    .gte("date", ls).lte("date", le);

  const total = expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const lastTotal = lastMonth?.reduce((s, e) => s + e.amount, 0) || 0;
  const comparedToLastMonth = lastTotal === 0 ? 100 : Math.round(((total - lastTotal) / lastTotal) * 100);

  const catMap = new Map<string, any>();
  expenses?.forEach((e) => {
    const id = e.category_id || "uncategorized";
    if (!catMap.has(id)) catMap.set(id, {
      category_id: id,
      category_name: e.category?.name || "Tanpa Kategori",
      category_icon: e.category?.icon || "📦",
      category_color: e.category?.color || "#a8a29e",
      total_amount: 0, transaction_count: 0,
    });
    const c = catMap.get(id);
    c.total_amount += e.amount;
    c.transaction_count++;
  });

  const byCategory = Array.from(catMap.values())
    .map((c) => ({ ...c, percentage: total > 0 ? Math.round((c.total_amount / total) * 100) : 0 }))
    .sort((a, b) => b.total_amount - a.total_amount);

  const dayMap = new Map<string, number>();
  expenses?.forEach((e) => dayMap.set(e.date, (dayMap.get(e.date) || 0) + e.amount));
  const dailyTrend = Array.from(dayMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ total, transactionCount: expenses?.length || 0, byCategory, dailyTrend, comparedToLastMonth, lastMonthTotal: lastTotal });
}