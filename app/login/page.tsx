"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || "Gagal membuat akun"); return; }
        toast.success("Akun berhasil dibuat! Silakan login.");
        setIsRegister(false);
        setForm({ name: "", username: form.username, password: "" });
      } else {
        const result = await signIn("credentials", {
          username: form.username, password: form.password, redirect: false,
        });
        if (result?.error) {
          toast.error(result.error === "CredentialsSignin" ? "Username atau password salah" : result.error);
          return;
        }
        toast.success("Selamat datang kembali! 👋");
        router.push("/dashboard");
        router.refresh();
      }
    } catch { toast.error("Terjadi kesalahan. Coba lagi."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-surface-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-100 rounded-full opacity-40 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Saku Log</h1>
          <p className="text-surface-500 text-sm mt-1">Catat Pengeluaranmu dengan Mudah</p>
        </div>
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900">
              {isRegister ? "Buat Akun Baru" : "Masuk ke Akun"}
            </h2>
            <p className="text-sm text-surface-500 mt-1">
              {isRegister ? "Daftar untuk mulai mencatat pengeluaran" : "Masukkan username dan password kamu"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="label">Nama Lengkap</label>
                <input type="text" placeholder="Nama kamu" className="input"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required={isRegister} />
              </div>
            )}
            <div>
              <label className="label">Username</label>
              <input type="text" placeholder="username" className="input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                required autoComplete="username" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••" className="input pr-10"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required autoComplete={isRegister ? "new-password" : "current-password"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isRegister && <p className="text-xs text-surface-400 mt-1">Minimal 6 karakter</p>}
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Memproses..." : isRegister ? "Buat Akun" : "Masuk"}
            </button>
          </form>
          <div className="mt-5 pt-4 border-t border-surface-100 text-center">
            <p className="text-sm text-surface-500">
              {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button onClick={() => { setIsRegister(!isRegister); setForm({ name: "", username: "", password: "" }); }}
                className="text-primary-600 font-medium hover:text-primary-700">
                {isRegister ? "Masuk" : "Daftar sekarang"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}