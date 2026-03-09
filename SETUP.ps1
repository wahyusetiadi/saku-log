# ============================================================
# SAKU-LOG - Script Setup Otomatis
# Jalankan di folder root project kamu:
# PS> .\SETUP.ps1
# ============================================================

Write-Host "🚀 Saku-log Setup Script" -ForegroundColor Green
Write-Host "Membuat semua file yang diperlukan..." -ForegroundColor Yellow
Write-Host ""

# Helper function buat file + folder otomatis
function WriteFile($path, $content) {
    $dir = Split-Path $path -Parent
    if ($dir -and !(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  ✓ $path" -ForegroundColor Cyan
}

# ============================================================
# LANGKAH 1: Hapus folder & file lama yang salah
# ============================================================
Write-Host "📁 Membersihkan struktur lama..." -ForegroundColor Yellow

# Hapus folder (page) yang salah, ganti jadi (app)
if (Test-Path "app\(page)") {
    Remove-Item -Recurse -Force "app\(page)"
    Write-Host "  ✓ Hapus app\(page)" -ForegroundColor Red
}
# Hapus folder api yang salah (harusnya di dalam app\)
if (Test-Path "api" -and !(Test-Path "app\api")) {
    Remove-Item -Recurse -Force "api"
    Write-Host "  ✓ Hapus api\ (salah lokasi)" -ForegroundColor Red
} elseif (Test-Path "api") {
    Remove-Item -Recurse -Force "api"
    Write-Host "  ✓ Hapus api\ (salah lokasi)" -ForegroundColor Red
}
# Hapus components\ui\Header.tsx bawaan Next.js
if (Test-Path "components\ui\Header.tsx") {
    Remove-Item -Force "components\ui\Header.tsx"
}

Write-Host ""

# ============================================================
# LANGKAH 2: Config files (root level)
# ============================================================
Write-Host "⚙️  Menulis config files..." -ForegroundColor Yellow

WriteFile "tailwind.config.ts" @'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        surface: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
'@

WriteFile ".env.local" @'
# isi dengan nilai dari Supabase dan generate secret kamu
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=GANTI_DENGAN_HASIL_openssl_rand_base64_32

NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
'@

# ============================================================
# LANGKAH 3: types/
# ============================================================
Write-Host ""
Write-Host "📝 Menulis types/..." -ForegroundColor Yellow

WriteFile "types\index.ts" @'
export interface User {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id?: string;
  category?: Category;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  is_planned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Planner {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  month: number;
  year: number;
  budget_amount: number;
  notes?: string;
  created_at: string;
}

export interface MonthlyStats {
  total: number;
  transactionCount: number;
  byCategory: CategoryStat[];
  dailyTrend: DailyTrend[];
  comparedToLastMonth: number;
}

export interface CategoryStat {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  budget_amount?: number;
  budget_percentage?: number;
}

export interface DailyTrend {
  date: string;
  amount: number;
}

export interface PlannerWithStats extends Planner {
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      currency: string;
    };
  }
  interface User {
    id: string;
    name: string;
    username: string;
    currency: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    currency: string;
  }
}
'@

# ============================================================
# LANGKAH 4: lib/
# ============================================================
Write-Host ""
Write-Host "📚 Menulis lib/..." -ForegroundColor Yellow

WriteFile "lib\supabase.ts" @'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
'@

WriteFile "lib\utils.ts" @'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, formatStr: string = "dd MMMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: idLocale });
}

export function formatMonth(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, "MMMM yyyy", { locale: idLocale });
}

export function getMonthRange(month: number, year: number) {
  const date = new Date(year, month - 1, 1);
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd"),
  };
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export const DEFAULT_COLORS = [
  "#22c55e","#3b82f6","#f59e0b","#ef4444",
  "#8b5cf6","#ec4899","#14b8a6","#f97316",
  "#06b6d4","#84cc16",
];

export const DEFAULT_CATEGORIES = [
  { name: "Makanan & Minuman", icon: "🍽️", color: "#f59e0b" },
  { name: "Transportasi",      icon: "🚗", color: "#3b82f6" },
  { name: "Belanja",           icon: "🛍️", color: "#ec4899" },
  { name: "Hiburan",           icon: "🎮", color: "#8b5cf6" },
  { name: "Kesehatan",         icon: "💊", color: "#ef4444" },
  { name: "Tagihan",           icon: "📄", color: "#78716c" },
  { name: "Pendidikan",        icon: "📚", color: "#14b8a6" },
  { name: "Lainnya",           icon: "📦", color: "#a8a29e" },
];

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000)         return `${(amount / 1_000).toFixed(0)}rb`;
  return amount.toString();
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
'@

# ============================================================
# LANGKAH 5: app/ root files
# ============================================================
Write-Host ""
Write-Host "🏠 Menulis app/ root files..." -ForegroundColor Yellow

WriteFile "app\globals.css" @'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply text-surface-800 bg-surface-50; }
  h1,h2,h3,h4,h5,h6 { @apply font-semibold text-surface-900; }
}

@layer components {
  .card { @apply bg-white rounded-2xl border border-surface-100 shadow-card; }
  .card-hover { @apply card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5; }
  .btn { @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-primary { @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:scale-95; }
  .btn-secondary { @apply btn bg-surface-100 text-surface-700 hover:bg-surface-200 focus:ring-surface-400 active:scale-95; }
  .btn-danger { @apply btn bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-400 active:scale-95; }
  .btn-ghost { @apply btn text-surface-600 hover:bg-surface-100 focus:ring-surface-400 active:scale-95; }
  .input { @apply w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all duration-150; }
  .label { @apply block text-sm font-medium text-surface-700 mb-1.5; }
  .badge { @apply inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium; }
  .sidebar-item { @apply flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-600 transition-all duration-150 hover:bg-primary-50 hover:text-primary-700; }
  .sidebar-item.active { @apply bg-primary-50 text-primary-700; }
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { @apply bg-surface-100 rounded-full; }
::-webkit-scrollbar-thumb { @apply bg-surface-300 rounded-full; }
::-webkit-scrollbar-thumb:hover { @apply bg-surface-400; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out; }

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  @apply rounded-lg;
}
'@

WriteFile "app\layout.tsx" @'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Saku-log | Catat Pengeluaranmu",
  description: "Aplikasi pencatat pengeluaran pribadi yang cerdas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface-50`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: "#292524", color: "#f5f5f4", borderRadius: "12px", fontSize: "14px" },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
'@

WriteFile "app\page.tsx" @'
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  else redirect("/login");
}
'@

# ============================================================
# LANGKAH 6: app/login/
# ============================================================
Write-Host ""
Write-Host "🔐 Menulis halaman login..." -ForegroundColor Yellow

WriteFile "app\login\page.tsx" @'
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-surface-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-100 rounded-full opacity-40 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Saku-log</h1>
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
'@

# ============================================================
# LANGKAH 7: app/(app)/ - protected layout & pages
# ============================================================
Write-Host ""
Write-Host "📄 Menulis halaman app (protected)..." -ForegroundColor Yellow

WriteFile "app\(app)\layout.tsx" @'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
'@

WriteFile "app\(app)\dashboard\page.tsx" @'
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, TrendingDown, Receipt, Target, Plus, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, formatMonth, getCurrentMonthYear } from "@/lib/utils";
import { MonthlyStats, Expense } from "@/types";
import { ExpenseSparkline } from "@/components/charts/ExpenseSparkline";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { AddExpenseModal } from "@/components/ui/AddExpenseModal";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { month, year } = getCurrentMonthYear();
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, expensesRes] = await Promise.all([
        fetch(`/api/expenses/stats?month=${month}&year=${year}`),
        fetch(`/api/expenses?month=${month}&year=${year}&limit=5`),
      ]);
      const statsData = await statsRes.json();
      const expensesData = await expensesRes.json();
      setStats(statsData);
      setRecentExpenses(expensesData.data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const currency = session?.user?.currency || "IDR";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Halo, {session?.user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-surface-500 text-sm mt-0.5">Ringkasan pengeluaran {formatMonth(month, year)}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} />Tambah Pengeluaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-surface-500 font-medium">Total Bulan Ini</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">
                {isLoading ? <span className="skeleton h-7 w-32 inline-block" /> : formatCurrency(stats?.total || 0, currency)}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          {!isLoading && stats && (
            <div className="flex items-center gap-1.5 text-xs">
              {stats.comparedToLastMonth >= 0
                ? <><TrendingUp size={13} className="text-red-500" /><span className="text-red-500 font-medium">+{stats.comparedToLastMonth}%</span></>
                : <><TrendingDown size={13} className="text-primary-500" /><span className="text-primary-500 font-medium">{stats.comparedToLastMonth}%</span></>}
              <span className="text-surface-400">dari bulan lalu</span>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-surface-500 font-medium">Total Transaksi</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">
                {isLoading ? <span className="skeleton h-7 w-16 inline-block" /> : stats?.transactionCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-surface-400">{formatMonth(month, year)}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-surface-500 font-medium">Rata-rata/Hari</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">
                {isLoading ? <span className="skeleton h-7 w-24 inline-block" /> : formatCurrency(stats?.total ? stats.total / new Date().getDate() : 0, currency)}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-xs text-surface-400">Berdasarkan hari berjalan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Tren Pengeluaran Harian</h3>
          {isLoading ? <div className="skeleton h-40 w-full" /> : <ExpenseSparkline data={stats?.dailyTrend || []} currency={currency} month={month} year={year} />}
        </div>
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Per Kategori</h3>
          {isLoading ? <div className="skeleton h-40 w-full" /> : <CategoryDonut data={stats?.byCategory || []} currency={currency} />}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-700">Pengeluaran Terbaru</h3>
          <Link href="/expenses" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            Lihat semua<ArrowRight size={12} />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        ) : recentExpenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-10 h-10 text-surface-200 mx-auto mb-2" />
            <p className="text-sm text-surface-400">Belum ada pengeluaran bulan ini</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary mt-3 text-xs py-2"><Plus size={13} />Tambah Pengeluaran</button>
          </div>
        ) : (
          <div className="space-y-1">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-surface-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: (expense.category?.color || "#a8a29e") + "20" }}>
                  {expense.category?.icon || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">{expense.description}</p>
                  <p className="text-xs text-surface-400">{expense.category?.name || "Tanpa Kategori"} · {formatDate(expense.date, "dd MMM")}</p>
                </div>
                <p className="text-sm font-semibold text-surface-800 flex-shrink-0">{formatCurrency(expense.amount, currency)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData(); }} />}
    </div>
  );
}
'@

WriteFile "app\(app)\expenses\page.tsx" @'
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Search, Filter, Trash2, Pencil, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, formatMonth, getCurrentMonthYear } from "@/lib/utils";
import { Expense, Category } from "@/types";
import { AddExpenseModal } from "@/components/ui/AddExpenseModal";
import toast from "react-hot-toast";

export default function ExpensesPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear().month);
  const [currentYear, setCurrentYear] = useState(getCurrentMonthYear().year);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/expenses?month=${currentMonth}&year=${currentYear}&limit=100`);
      const data = await res.json();
      setExpenses(data.data || []);
    } catch { toast.error("Gagal memuat data"); }
    finally { setIsLoading(false); }
  }, [currentMonth, currentYear]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.data || [])); }, []);

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category?.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || e.category_id === selectedCategory;
    return matchSearch && matchCat;
  });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  const navigateMonth = (dir: 1 | -1) => {
    let m = currentMonth + dir, y = currentYear;
    if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
    setCurrentMonth(m); setCurrentYear(y);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengeluaran ini?")) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dihapus"); fetchExpenses(); } else toast.error("Gagal menghapus");
  };

  const currency = session?.user?.currency || "IDR";
  const grouped = filtered.reduce((acc, e) => { if (!acc[e.date]) acc[e.date] = []; acc[e.date].push(e); return acc; }, {} as Record<string, Expense[]>);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Pengeluaran</h1>
          <p className="text-surface-500 text-sm mt-0.5">Semua catatan pengeluaranmu</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary"><Plus size={16} />Tambah</button>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="font-semibold text-surface-800">{formatMonth(currentMonth, currentYear)}</p>
          <p className="text-sm text-surface-500">{filtered.length} transaksi · <span className="font-medium text-surface-700">{formatCurrency(total, currency)}</span></p>
        </div>
        <button onClick={() => navigateMonth(1)} className="btn-ghost p-2"
          disabled={currentMonth === getCurrentMonthYear().month && currentYear === getCurrentMonthYear().year}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Cari pengeluaran..." className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          <select className="input pl-8 pr-8 cursor-pointer appearance-none" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">Semua Kategori</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Receipt className="w-12 h-12 text-surface-200 mx-auto mb-3" />
          <p className="text-surface-500 font-medium">Tidak ada pengeluaran</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="card overflow-hidden">
              <div className="px-5 py-3 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">{formatDate(date, "EEEE, dd MMMM yyyy")}</p>
                <p className="text-xs font-semibold text-surface-700">{formatCurrency(grouped[date].reduce((s, e) => s + e.amount, 0), currency)}</p>
              </div>
              <div className="divide-y divide-surface-50">
                {grouped[date].map(expense => (
                  <div key={expense.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: (expense.category?.color || "#a8a29e") + "20" }}>
                      {expense.category?.icon || "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800">{expense.description}</p>
                      <p className="text-xs text-surface-400">{expense.category?.name || "Tanpa Kategori"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-surface-800">{formatCurrency(expense.amount, currency)}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingExpense(expense)} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(expense.id)} className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingExpense) && (
        <AddExpenseModal expense={editingExpense || undefined}
          onClose={() => { setShowAddModal(false); setEditingExpense(null); }}
          onSuccess={() => { setShowAddModal(false); setEditingExpense(null); fetchExpenses(); }} />
      )}
    </div>
  );
}
'@

WriteFile "app\(app)\calendar\page.tsx" @'
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Calendar from "react-calendar";
import { parseISO, isSameDay } from "date-fns";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Expense } from "@/types";
import "react-calendar/dist/Calendar.css";

type Value = Date | null | [Date | null, Date | null];

export default function CalendarPage() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentViewMonth, setCurrentViewMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const month = currentViewMonth.getMonth() + 1;
    const year = currentViewMonth.getFullYear();
    fetch(`/api/expenses?month=${month}&year=${year}&limit=200`)
      .then(r => r.json()).then(d => setExpenses(d.data || []))
      .finally(() => setIsLoading(false));
  }, [currentViewMonth]);

  const dayExpenses = expenses.filter(e => isSameDay(parseISO(e.date), selectedDate));
  const selectedDayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currency = session?.user?.currency || "IDR";

  const getDayTotal = (date: Date) =>
    expenses.filter(e => isSameDay(parseISO(e.date), date)).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Kalender Pengeluaran</h1>
        <p className="text-surface-500 text-sm mt-0.5">Lihat pengeluaran berdasarkan tanggal</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="card p-5 lg:col-span-3">
          <style>{`
            .react-calendar{width:100%;background:transparent;font-family:inherit;border:none}
            .react-calendar__navigation{margin-bottom:1rem}
            .react-calendar__navigation button{min-width:36px;background:none;border-radius:8px;font-size:14px;padding:8px}
            .react-calendar__navigation button:hover{background:#f5f5f4}
            .react-calendar__month-view__weekdays{text-align:center;font-size:11px;color:#78716c;font-weight:600;text-transform:uppercase;margin-bottom:4px}
            .react-calendar__month-view__weekdays abbr{text-decoration:none}
            .react-calendar__tile{aspect-ratio:1;max-width:none;border-radius:10px;font-size:13px;padding:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
            .react-calendar__tile:hover{background:#f5f5f4}
            .react-calendar__tile--active{background:#16a34a !important;color:white}
            .react-calendar__tile--now{background:#f0fdf4;color:#16a34a;font-weight:700}
          `}</style>
          <Calendar value={selectedDate}
            onChange={(val: Value) => { if (val instanceof Date) setSelectedDate(val); }}
            onActiveStartDateChange={({ activeStartDate }) => { if (activeStartDate) setCurrentViewMonth(activeStartDate); }}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const total = getDayTotal(date);
              if (total === 0) return null;
              return <span style={{ fontSize: "9px" }} className="font-medium opacity-70">
                {total >= 1000000 ? `${(total/1000000).toFixed(1)}jt` : `${(total/1000).toFixed(0)}rb`}
              </span>;
            }} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">Pengeluaran</p>
            <h3 className="text-base font-bold text-surface-900 mt-0.5">{formatDate(selectedDate, "EEEE, dd MMMM yyyy")}</h3>
            {dayExpenses.length > 0 && <p className="text-2xl font-bold text-surface-900 mt-2">{formatCurrency(selectedDayTotal, currency)}</p>}
          </div>
          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
          ) : dayExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-sm text-surface-500">Tidak ada pengeluaran pada hari ini</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dayExpenses.map(expense => (
                <div key={expense.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: (expense.category?.color || "#a8a29e") + "25" }}>
                    {expense.category?.icon || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{expense.description}</p>
                    <p className="text-xs text-surface-400">{expense.category?.name || "Tanpa Kategori"}</p>
                  </div>
                  <p className="text-sm font-semibold text-surface-800 flex-shrink-0">{formatCurrency(expense.amount, currency)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'@

WriteFile "app\(app)\planner\page.tsx" @'
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Target, ChevronLeft, ChevronRight, Trash2, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency, formatMonth, getCurrentMonthYear, cn } from "@/lib/utils";
import { PlannerWithStats, Category } from "@/types";
import { PlannerModal } from "@/components/ui/PlannerModal";
import toast from "react-hot-toast";

export default function PlannerPage() {
  const { data: session } = useSession();
  const [planners, setPlanners] = useState<PlannerWithStats[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlanner, setEditingPlanner] = useState<PlannerWithStats | null>(null);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear().month);
  const [currentYear, setCurrentYear] = useState(getCurrentMonthYear().year);

  const fetchPlanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/planner?month=${currentMonth}&year=${currentYear}`);
      const data = await res.json();
      setPlanners(data.data || []);
    } catch { toast.error("Gagal memuat planner"); }
    finally { setIsLoading(false); }
  }, [currentMonth, currentYear]);

  useEffect(() => { fetchPlanners(); }, [fetchPlanners]);
  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.data || [])); }, []);

  const navigateMonth = (dir: 1 | -1) => {
    let m = currentMonth + dir, y = currentYear;
    if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
    setCurrentMonth(m); setCurrentYear(y);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus planner ini?")) return;
    const res = await fetch(`/api/planner?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Planner dihapus"); fetchPlanners(); }
  };

  const currency = session?.user?.currency || "IDR";
  const totalBudget = planners.reduce((s, p) => s + p.budget_amount, 0);
  const totalSpent = planners.reduce((s, p) => s + p.spent_amount, 0);
  const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const usedCategoryIds = planners.map(p => p.category_id);
  const availableCategories = categories.filter(c => !usedCategoryIds.includes(c.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Budget Planner</h1>
          <p className="text-surface-500 text-sm mt-0.5">Atur anggaran pengeluaran per kategori</p>
        </div>
        <button onClick={() => { setEditingPlanner(null); setShowModal(true); }} className="btn-primary" disabled={availableCategories.length === 0}>
          <Plus size={16} />Tambah Budget
        </button>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
        <h2 className="font-semibold text-surface-800">{formatMonth(currentMonth, currentYear)}</h2>
        <button onClick={() => navigateMonth(1)} className="btn-ghost p-2"><ChevronRight size={18} /></button>
      </div>

      {planners.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div><p className="text-sm text-surface-500">Total Budget</p><p className="text-xl font-bold text-surface-900">{formatCurrency(totalBudget, currency)}</p></div>
            <div className="text-right"><p className="text-sm text-surface-500">Sisa Budget</p><p className={cn("text-xl font-bold", totalBudget - totalSpent < 0 ? "text-red-500" : "text-primary-600")}>{formatCurrency(totalBudget - totalSpent, currency)}</p></div>
          </div>
          <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", totalPercentage >= 100 ? "bg-red-500" : totalPercentage >= 80 ? "bg-amber-500" : "bg-primary-500")}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 w-full rounded-2xl" />)}</div>
      ) : planners.length === 0 ? (
        <div className="card p-12 text-center">
          <Target className="w-12 h-12 text-surface-200 mx-auto mb-3" />
          <p className="text-surface-500 font-medium">Belum ada budget planner</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4"><Plus size={15} />Buat Budget Pertama</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planners.map(planner => {
            const isOver = planner.percentage_used >= 100;
            const isWarning = planner.percentage_used >= 80 && !isOver;
            return (
              <div key={planner.id} className="card p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: (planner.category?.color || "#a8a29e") + "20" }}>
                      {planner.category?.icon || "📦"}
                    </div>
                    <div>
                      <p className="font-semibold text-surface-800">{planner.category?.name}</p>
                      <p className="text-xs text-surface-400">Budget: {formatCurrency(planner.budget_amount, currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isOver ? <AlertCircle size={16} className="text-red-500" /> : isWarning ? <TrendingUp size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-primary-500" />}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingPlanner(planner); setShowModal(true); }} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50">✏️</button>
                      <button onClick={() => handleDelete(planner.id)} className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-primary-500")}
                      style={{ width: `${Math.min(planner.percentage_used, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-surface-500">Terpakai: <span className="font-medium text-surface-700">{formatCurrency(planner.spent_amount, currency)}</span></span>
                    <span className={cn("font-semibold", isOver ? "text-red-500" : "text-primary-600")}>{planner.percentage_used}%</span>
                  </div>
                  {isOver ? <p className="text-xs text-red-500 font-medium">⚠️ Melebihi budget {formatCurrency(Math.abs(planner.remaining_amount), currency)}</p>
                    : <p className="text-xs text-surface-400">Sisa: {formatCurrency(planner.remaining_amount, currency)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <PlannerModal planner={editingPlanner || undefined} categories={availableCategories} allCategories={categories}
          month={currentMonth} year={currentYear}
          onClose={() => { setShowModal(false); setEditingPlanner(null); }}
          onSuccess={() => { setShowModal(false); setEditingPlanner(null); fetchPlanners(); }} />
      )}
    </div>
  );
}
'@

WriteFile "app\(app)\settings\page.tsx" @'
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Tag, Plus, Trash2 } from "lucide-react";
import { Category } from "@/types";
import { DEFAULT_COLORS, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const EMOJI_OPTIONS = ["🍽️","🚗","🛍️","🎮","💊","📄","📚","📦","✈️","🏠","💄","🎵","⚽","☕","🐕","🎁","💻","📱","🔧","🌿","💰","🎓","🏋️","🎨"];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "📦", color: DEFAULT_COLORS[0] });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newCat.name.trim()) { toast.error("Nama kategori harus diisi"); return; }
    setIsSaving(true);
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCat) });
    if (res.ok) { toast.success("Kategori ditambahkan"); setShowAddCat(false); setNewCat({ name: "", icon: "📦", color: DEFAULT_COLORS[0] }); fetchCategories(); }
    else { const d = await res.json(); toast.error(d.error || "Gagal"); }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Dihapus"); fetchCategories(); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-surface-900">Pengaturan</h1><p className="text-surface-500 text-sm mt-0.5">Kelola profil dan preferensi</p></div>
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5"><User size={18} className="text-surface-500" /><h2 className="font-semibold text-surface-800">Profil</h2></div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-700">{session?.user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-surface-900">{session?.user?.name}</p>
            <p className="text-sm text-surface-500">@{session?.user?.username}</p>
            <span className="badge bg-primary-50 text-primary-700 mt-1">Mata uang: {session?.user?.currency || "IDR"}</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3"><Tag size={18} className="text-surface-500" /><h2 className="font-semibold text-surface-800">Kategori</h2></div>
          <button onClick={() => setShowAddCat(!showAddCat)} className="btn-secondary text-xs py-1.5"><Plus size={13} />Tambah</button>
        </div>
        {showAddCat && (
          <div className="mb-4 p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-3">
            <input type="text" placeholder="Nama kategori" className="input" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} autoFocus />
            <div>
              <p className="text-xs text-surface-500 mb-2">Pilih ikon</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map(emoji => (
                  <button key={emoji} onClick={() => setNewCat({ ...newCat, icon: emoji })}
                    className={cn("w-9 h-9 rounded-lg text-lg transition-all", newCat.icon === emoji ? "bg-primary-100 ring-2 ring-primary-500" : "hover:bg-surface-200")}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-2">Pilih warna</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map(color => (
                  <button key={color} onClick={() => setNewCat({ ...newCat, color })}
                    className={cn("w-7 h-7 rounded-full transition-all", newCat.color === color ? "ring-2 ring-offset-2 ring-surface-400 scale-110" : "hover:scale-105")}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAddCat(false)} className="btn-secondary flex-1 text-xs py-2">Batal</button>
              <button onClick={handleAdd} disabled={isSaving} className="btn-primary flex-1 text-xs py-2">Simpan</button>
            </div>
          </div>
        )}
        {isLoading ? <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-12 w-full" />)}</div> : (
          <div className="space-y-1.5">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 group transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: cat.color + "25" }}>{cat.icon}</div>
                <div className="flex-1"><p className="text-sm font-medium text-surface-800">{cat.name}</p></div>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'@

# ============================================================
# LANGKAH 8: app/api/
# ============================================================
Write-Host ""
Write-Host "🔌 Menulis API routes..." -ForegroundColor Yellow

WriteFile "app\api\auth\[...nextauth]\route.ts" @'
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) throw new Error("Username dan password diperlukan");
        const { data: user, error } = await supabaseAdmin.from("users").select("*").eq("username", credentials.username.toLowerCase()).single();
        if (error || !user) throw new Error("Username tidak ditemukan");
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) throw new Error("Password salah");
        return { id: user.id, name: user.name, username: user.username, currency: user.currency, email: null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.username = (user as any).username; token.currency = (user as any).currency; }
      return token;
    },
    async session({ session, token }) {
      if (token) { session.user.id = token.id as string; session.user.username = token.username as string; session.user.currency = token.currency as string; }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
'@

WriteFile "app\api\auth\register\route.ts" @'
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { DEFAULT_CATEGORIES } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { name, username, password } = await req.json();
    if (!name || !username || !password) return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
    if (username.length < 3) return NextResponse.json({ error: "Username minimal 3 karakter" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });

    const { data: existing } = await supabaseAdmin.from("users").select("id").eq("username", username.toLowerCase()).single();
    if (existing) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });

    const password_hash = await bcrypt.hash(password, 12);
    const { data: newUser, error } = await supabaseAdmin.from("users").insert({ name, username: username.toLowerCase(), password_hash, currency: "IDR" }).select().single();
    if (error || !newUser) return NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 });

    await supabaseAdmin.from("categories").insert(DEFAULT_CATEGORIES.map(cat => ({ ...cat, user_id: newUser.id, is_default: true })));
    return NextResponse.json({ message: "Akun berhasil dibuat" }, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
'@

WriteFile "app\api\expenses\route.ts" @'
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"), year = searchParams.get("year");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const categoryId = searchParams.get("category_id");

  let query = supabaseAdmin.from("expenses").select("*, category:categories(id,name,icon,color)")
    .eq("user_id", session.user.id).order("date", { ascending: false }).order("created_at", { ascending: false }).range(offset, offset + limit - 1);

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
  if (!amount || !description || !date) return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("expenses")
    .insert({ user_id: session.user.id, amount: parseFloat(amount), description, category_id: category_id || null, date, notes: notes || null })
    .select("*, category:categories(id,name,icon,color)").single();
  if (error) return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
'@

WriteFile "app\api\expenses\[id]\route.ts" @'
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { amount, description, category_id, date, notes } = await req.json();
  const { data, error } = await supabaseAdmin.from("expenses")
    .update({ amount: parseFloat(amount), description, category_id: category_id || null, date, notes: notes || null })
    .eq("id", params.id).eq("user_id", session.user.id).select("*, category:categories(id,name,icon,color)").single();
  if (error) return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabaseAdmin.from("expenses").delete().eq("id", params.id).eq("user_id", session.user.id);
  if (error) return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  return NextResponse.json({ message: "Dihapus" });
}
'@

WriteFile "app\api\expenses\stats\route.ts" @'
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
  const { start, end } = getMonthRange(month, year);

  const { data: expenses } = await supabaseAdmin.from("expenses").select("*, category:categories(id,name,icon,color)")
    .eq("user_id", session.user.id).gte("date", start).lte("date", end);

  const lm = month === 1 ? 12 : month - 1, ly = month === 1 ? year - 1 : year;
  const { start: ls, end: le } = getMonthRange(lm, ly);
  const { data: lastMonth } = await supabaseAdmin.from("expenses").select("amount").eq("user_id", session.user.id).gte("date", ls).lte("date", le);

  const total = expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const lastTotal = lastMonth?.reduce((s, e) => s + e.amount, 0) || 0;
  const comparedToLastMonth = lastTotal === 0 ? 100 : Math.round(((total - lastTotal) / lastTotal) * 100);

  const catMap = new Map<string, any>();
  expenses?.forEach(e => {
    const id = e.category_id || "uncategorized";
    if (!catMap.has(id)) catMap.set(id, { category_id: id, category_name: e.category?.name || "Tanpa Kategori", category_icon: e.category?.icon || "📦", category_color: e.category?.color || "#a8a29e", total_amount: 0, transaction_count: 0 });
    const c = catMap.get(id); c.total_amount += e.amount; c.transaction_count++;
  });

  const byCategory = Array.from(catMap.values())
    .map(c => ({ ...c, percentage: total > 0 ? Math.round((c.total_amount / total) * 100) : 0 }))
    .sort((a, b) => b.total_amount - a.total_amount);

  const dayMap = new Map<string, number>();
  expenses?.forEach(e => dayMap.set(e.date, (dayMap.get(e.date) || 0) + e.amount));
  const dailyTrend = Array.from(dayMap.entries()).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ total, transactionCount: expenses?.length || 0, byCategory, dailyTrend, comparedToLastMonth, lastMonthTotal: lastTotal });
}
'@

WriteFile "app\api\categories\route.ts" @'
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("categories").select("*").eq("user_id", session.user.id).order("name");
  if (error) return NextResponse.json({ error: "Gagal ambil kategori" }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, icon, color } = await req.json();
  if (!name) return NextResponse.json({ error: "Nama diperlukan" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("categories").insert({ user_id: session.user.id, name, icon: icon || "📦", color: color || "#a8a29e", is_default: false }).select().single();
  if (error) return NextResponse.json({ error: "Gagal buat kategori" }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id).eq("user_id", session.user.id);
  if (error) return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  return NextResponse.json({ message: "Dihapus" });
}
'@

WriteFile "app\api\planner\route.ts" @'
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
'@

# ============================================================
# LANGKAH 9: components/
# ============================================================
Write-Host ""
Write-Host "🧩 Menulis components..." -ForegroundColor Yellow

WriteFile "components\providers.tsx" @'
"use client";
import { SessionProvider } from "next-auth/react";
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
'@

WriteFile "components\layout\Sidebar.tsx" @'
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LayoutDashboard, Receipt, Calendar, Target, Settings, LogOut, Wallet, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { href: "/expenses",  label: "Pengeluaran",  icon: Receipt },
  { href: "/calendar",  label: "Kalender",     icon: Calendar },
  { href: "/planner",   label: "Planner",      icon: Target },
  { href: "/settings",  label: "Pengaturan",   icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-surface-100 flex flex-col z-20">
      <div className="px-5 py-5 border-b border-surface-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-surface-900 leading-none">Saku-log</h1>
            <p className="text-xs text-surface-400 mt-0.5">Catat Pengeluaranmu</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn("sidebar-item group", isActive && "active")}>
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="text-primary-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-surface-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary-700">{session?.user?.name?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-800 truncate">{session?.user?.name}</p>
            <p className="text-xs text-surface-400 truncate">@{session?.user?.username}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full mt-2 sidebar-item text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={16} /><span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
'@

WriteFile "components\ui\AddExpenseModal.tsx" @'
"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Expense, Category } from "@/types";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Props { expense?: Expense; onClose: () => void; onSuccess: () => void; }

export function AddExpenseModal({ expense, onClose, onSuccess }: Props) {
  const isEditing = !!expense;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    amount: expense?.amount?.toString() || "",
    description: expense?.description || "",
    category_id: expense?.category_id || "",
    date: expense?.date || format(new Date(), "yyyy-MM-dd"),
    notes: expense?.notes || "",
  });

  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.data || [])); }, []);

  const handleSubmit = async () => {
    if (!form.amount || !form.description || !form.date) { toast.error("Field tidak lengkap"); return; }
    setIsLoading(true);
    try {
      const url = isEditing ? `/api/expenses/${expense.id}` : "/api/expenses";
      const res = await fetch(url, { method: isEditing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Gagal menyimpan"); return; }
      toast.success(isEditing ? "Pengeluaran diperbarui" : "Pengeluaran ditambahkan");
      onSuccess();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setIsLoading(false); }
  };

  const displayAmount = form.amount ? new Intl.NumberFormat("id-ID").format(parseInt(form.amount)) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-base font-semibold text-surface-900">{isEditing ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Jumlah (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm">Rp</span>
              <input type="text" inputMode="numeric" placeholder="0" className="input pl-10 text-xl font-bold" autoFocus
                value={displayAmount}
                onChange={e => { const raw = e.target.value.replace(/\./g,"").replace(/,/g,"").replace(/[^0-9]/g,""); setForm({ ...form, amount: raw }); }} />
            </div>
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <input type="text" placeholder="Makan siang, bayar listrik..." className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kategori</label>
              <select className="input cursor-pointer" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Pilih Kategori</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tanggal</label>
              <input type="date" className="input cursor-pointer" value={form.date} max={format(new Date(), "yyyy-MM-dd")} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Catatan <span className="text-surface-400 font-normal">(opsional)</span></label>
            <textarea placeholder="Tambahkan catatan..." className="input resize-none h-20" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-surface-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
            {isLoading ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
'@

WriteFile "components\ui\PlannerModal.tsx" @'
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PlannerWithStats, Category } from "@/types";
import toast from "react-hot-toast";
import { formatMonth } from "@/lib/utils";

interface Props { planner?: PlannerWithStats; categories: Category[]; allCategories: Category[]; month: number; year: number; onClose: () => void; onSuccess: () => void; }

export function PlannerModal({ planner, categories, allCategories, month, year, onClose, onSuccess }: Props) {
  const isEditing = !!planner;
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ category_id: planner?.category_id || "", budget_amount: planner?.budget_amount?.toString() || "", notes: planner?.notes || "" });

  const handleSubmit = async () => {
    if (!form.category_id || !form.budget_amount) { toast.error("Kategori dan budget harus diisi"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category_id: form.category_id, budget_amount: parseFloat(form.budget_amount), month, year, notes: form.notes || null }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Gagal"); return; }
      toast.success(isEditing ? "Budget diperbarui" : "Budget planner dibuat");
      onSuccess();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setIsLoading(false); }
  };

  const displayAmount = form.budget_amount ? new Intl.NumberFormat("id-ID").format(parseInt(form.budget_amount)) : "";
  const editCategories = allCategories.filter(c => c.id === planner?.category_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div><h2 className="text-base font-semibold text-surface-900">{isEditing ? "Edit Budget" : "Tambah Budget"}</h2><p className="text-xs text-surface-400 mt-0.5">{formatMonth(month, year)}</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Kategori</label>
            <select className="input cursor-pointer" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} disabled={isEditing}>
              <option value="">Pilih Kategori</option>
              {(isEditing ? editCategories : categories).map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Budget (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 text-sm">Rp</span>
              <input type="text" inputMode="numeric" placeholder="500.000" className="input pl-10 text-lg font-bold" autoFocus
                value={displayAmount}
                onChange={e => { const raw = e.target.value.replace(/\./g,"").replace(/,/g,"").replace(/[^0-9]/g,""); setForm({ ...form, budget_amount: raw }); }} />
            </div>
          </div>
          <div>
            <label className="label">Catatan <span className="text-surface-400 font-normal">(opsional)</span></label>
            <input type="text" placeholder="Catatan budget..." className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-surface-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button onClick={handleSubmit} disabled={isLoading || (!isEditing && categories.length === 0)} className="btn-primary flex-1">
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
            {isLoading ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan Budget"}
          </button>
        </div>
      </div>
    </div>
  );
}
'@

WriteFile "components\charts\ExpenseSparkline.tsx" @'
"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DailyTrend } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDaysInMonth } from "date-fns";

interface Props { data: DailyTrend[]; currency: string; month: number; year: number; }

export function ExpenseSparkline({ data, currency, month, year }: Props) {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const filled = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return { date: dateStr, amount: data.find(d => d.date === dateStr)?.amount || 0, day };
  });
  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const displayData = isCurrentMonth ? filled.slice(0, today.getDate()) : filled;

  if (data.length === 0) return <div className="h-40 flex items-center justify-center"><p className="text-sm text-surface-400">Belum ada data</p></div>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className="bg-white border border-surface-100 rounded-xl p-3 shadow-lg text-xs">
        <p className="text-surface-500 mb-1">{formatDate(label, "dd MMMM yyyy")}</p>
        <p className="font-semibold text-surface-900">{formatCurrency(payload[0].value, currency)}</p>
      </div>
    );
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={displayData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 10, fill: "#78716c" }} axisLine={false} tickLine={false} width={55}
          tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : v} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} fill="url(#colorAmount)"
          dot={false} activeDot={{ r: 4, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
'@

WriteFile "components\charts\CategoryDonut.tsx" @'
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryStat } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props { data: CategoryStat[]; currency: string; }

export function CategoryDonut({ data, currency }: Props) {
  if (data.length === 0) return <div className="h-40 flex items-center justify-center"><p className="text-sm text-surface-400">Belum ada data</p></div>;

  const top5 = data.slice(0, 5);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-surface-100 rounded-xl p-3 shadow-lg text-xs">
          <p className="font-medium text-surface-800">{d.category_icon} {d.category_name}</p>
          <p className="text-surface-500 mt-0.5">{formatCurrency(d.total_amount, currency)}</p>
          <p className="text-surface-400">{d.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie data={top5} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="total_amount">
            {top5.map((entry, i) => <Cell key={i} fill={entry.category_color} strokeWidth={0} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        {top5.map((cat, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.category_color }} />
            <span className="text-surface-600 flex-1 truncate">{cat.category_icon} {cat.category_name}</span>
            <span className="font-medium text-surface-700">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
'@

# ============================================================
# SELESAI
# ============================================================
Write-Host ""
Write-Host "✅ SELESAI! Semua file berhasil dibuat." -ForegroundColor Green
Write-Host ""
Write-Host "📋 LANGKAH SELANJUTNYA:" -ForegroundColor Yellow
Write-Host "  1. Isi file .env.local dengan kredensial Supabase kamu" -ForegroundColor White
Write-Host "  2. Jalankan SQL schema di Supabase SQL Editor (file: spabase-schema.sql)" -ForegroundColor White
Write-Host "  3. npm install" -ForegroundColor White
Write-Host "  4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Buka http://localhost:3000" -ForegroundColor Cyan
