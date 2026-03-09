import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { amount, description, category_id, date, notes } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("expenses")
    .update({ amount: parseFloat(amount), description, category_id: category_id || null, date, notes: notes || null })
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select("*, category:categories(id,name,icon,color)")
    .single();

  if (error) return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  return NextResponse.json({ message: "Dihapus" });
}