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