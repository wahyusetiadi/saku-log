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