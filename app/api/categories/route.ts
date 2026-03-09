import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("categories").select("*")
    .eq("user_id", session.user.id).order("name");

  if (error) return NextResponse.json({ error: "Gagal ambil kategori" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon, color } = await req.json();
  if (!name) return NextResponse.json({ error: "Nama diperlukan" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({ user_id: session.user.id, name, icon: icon || "📦", color: color || "#a8a29e", is_default: false })
    .select().single();

  if (error) return NextResponse.json({ error: "Gagal buat kategori" }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("categories").delete()
    .eq("id", id).eq("user_id", session.user.id);

  if (error) return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  return NextResponse.json({ message: "Dihapus" });
}