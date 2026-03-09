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