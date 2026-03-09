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