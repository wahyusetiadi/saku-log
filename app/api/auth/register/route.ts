import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { DEFAULT_CATEGORIES } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { name, username, password } = await req.json();
    if (!name || !username || !password)
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
    if (username.length < 3)
      return NextResponse.json({ error: "Username minimal 3 karakter" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });

    const { data: existing } = await supabaseAdmin
      .from("users").select("id").eq("username", username.toLowerCase()).single();
    if (existing)
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });

    const password_hash = await bcrypt.hash(password, 12);
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({ name, username: username.toLowerCase(), password_hash, currency: "IDR" })
      .select().single();

    if (error || !newUser)
      return NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 });

    await supabaseAdmin.from("categories").insert(
      DEFAULT_CATEGORIES.map((cat) => ({ ...cat, user_id: newUser.id, is_default: true }))
    );

    return NextResponse.json({ message: "Akun berhasil dibuat" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}