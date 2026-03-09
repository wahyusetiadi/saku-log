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