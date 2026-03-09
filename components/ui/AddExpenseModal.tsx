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