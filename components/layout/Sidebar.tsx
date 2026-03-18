"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Receipt,
  Calendar,
  Target,
  Settings,
  LogOut,
  Wallet,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Pengeluaran", icon: Receipt },
  { href: "/calendar", label: "Kalender", icon: Calendar },
  { href: "/planner", label: "Planner", icon: Target },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── DESKTOP: sidebar kiri ── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-white border-r border-surface-100 flex-col z-20">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-surface-900 leading-none">
                sda
              </h1>
              <p className="text-xs text-surface-400 mt-0.5">
                Catat Pengeluaranmu
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${isActive(href) ? "active" : ""}`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive(href) && (
                <ChevronRight
                  size={14}
                  style={{ color: "var(--color-primary-500)" }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-surface-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary-700">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-surface-400 truncate">
                @{session?.user?.username}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="sidebar-item w-full mt-2"
            style={{ color: "#dc2626" }}
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE: top header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-surface-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-surface-900">SakuLog</span>
        </div>
        <div className="hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-4"
          style={{ color: "#dc2626" }}
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* ── MOBILE: bottom navigation ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-surface-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  color: active
                    ? "var(--color-primary-600)"
                    : "var(--color-surface-400)",
                  backgroundColor: active
                    ? "var(--color-primary-50)"
                    : "transparent",
                  minWidth: "52px",
                }}
              >
                <Icon size={20} />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: active ? "600" : "500",
                  }}
                >
                  {label === "Pengeluaran" ? "Catat" : label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
