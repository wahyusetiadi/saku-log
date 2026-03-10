import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// GET: ambil data profil user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, username, currency, created_at")
    .eq("id", session.user.id)
    .single();

  if (error) return NextResponse.json({ error: "Gagal ambil profil" }, { status: 500 });
  return NextResponse.json({ data });
}

// PUT: update nama atau password
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, currentPassword, newPassword } = await req.json();

  // Update nama
  if (name) {
    if (name.trim().length < 2)
      return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("users")
      .update({ name: name.trim() })
      .eq("id", session.user.id);

    if (error) return NextResponse.json({ error: "Gagal update nama" }, { status: 500 });
  }

  // Update password
  if (currentPassword && newPassword) {
    if (newPassword.length < 6)
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });

    // Ambil password hash lama
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", session.user.id)
      .single();

    if (fetchError || !user)
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    // Verifikasi password lama
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid)
      return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });

    // Hash password baru
    const newHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: newHash })
      .eq("id", session.user.id);

    if (updateError)
      return NextResponse.json({ error: "Gagal update password" }, { status: 500 });
  }

  return NextResponse.json({ message: "Profil berhasil diperbarui" });
}