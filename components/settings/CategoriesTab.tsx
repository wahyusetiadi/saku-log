"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
}

const PRESET_COLORS = [
  "#22c55e","#16a34a","#3b82f6","#6366f1","#8b5cf6",
  "#ec4899","#f43f5e","#f97316","#eab308","#14b8a6",
  "#06b6d4","#a8a29e","#64748b","#78716c",
];

const PRESET_EMOJIS = [
  "🍽️","🚗","🛍️","🎮","💊","📄","📚","📦",
  "☕","🏠","✈️","💄","🎁","⚽","🎵","🐾",
  "🌿","💪","🎓","💰",
];

const DEFAULT_FORM = { name: "", icon: "📦", color: "#22c55e" };

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const json = await res.json();
    setCategories(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setShowForm(false);
    setEditItem(null);
  };

  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setEditItem(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setEditItem(cat);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Nama kategori wajib diisi");
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`/api/categories?id=${editItem.id}`, { method: "DELETE" });
      }
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Gagal menyimpan");
        return;
      }
      toast.success(editItem ? "Kategori diperbarui!" : "Kategori ditambahkan!");
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const res = await fetch(`/api/categories?id=${deleteItem.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Kategori dihapus");
      load();
    } else {
      toast.error("Gagal hapus kategori");
    }
    setDeleteItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Form Tambah / Edit */}
      {showForm && (
        <div className="card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "var(--color-surface-900)" }}>
              {editItem ? "Edit Kategori" : "Tambah Kategori"}
            </h3>
            <button onClick={resetForm}
              className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              style={{ color: "var(--color-surface-400)" }}>
              <X size={16} />
            </button>
          </div>

          <div className="mb-4">
            <label className="label">Nama Kategori</label>
            <input className="input" placeholder="cth: Makanan & Minuman"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="mb-4">
            <label className="label">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_EMOJIS.map((e) => (
                <button key={e} onClick={() => setForm({ ...form, icon: e })}
                  style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    fontSize: "18px", lineHeight: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: form.icon === e ? "var(--color-primary-100)" : "var(--color-surface-100)",
                    outline: form.icon === e ? "2px solid var(--color-primary-500)" : "none",
                    border: "none", cursor: "pointer", transition: "all 0.15s",
                    overflow: "hidden",
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Warna</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ background: c, outline: form.color === c ? `3px solid ${c}` : "none", outlineOffset: "2px", border: "none", cursor: "pointer" }}>
                  {form.color === c && <Check size={13} color="white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", marginBottom: "16px", background: "var(--color-surface-50)" }}>
            <div style={{ width: "36px", height: "36px", minWidth: "36px", borderRadius: "10px", background: form.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", overflow: "hidden" }}>
              {form.icon}
            </div>
            <span style={{ fontSize: "14px", fontWeight: 500, flex: 1, color: "var(--color-surface-700)" }}>
              {form.name || "Nama Kategori"}
            </span>
            <div style={{ width: "12px", height: "12px", minWidth: "12px", borderRadius: "50%", background: form.color }} />
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ border: "1px solid var(--color-surface-200)", color: "var(--color-surface-700)", background: "white" }}>
              Batal
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: "var(--color-primary-600)" }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {editItem ? "Simpan" : "Tambahkan"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card overflow-hidden">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-surface-100)" }}>
          <h3 style={{ fontWeight: 600, color: "var(--color-surface-900)", display: "flex", alignItems: "center", gap: "8px" }}>
            Semua Kategori
            <span style={{ fontSize: "12px", fontWeight: 400, padding: "2px 8px", borderRadius: "9999px", background: "var(--color-surface-100)", color: "var(--color-surface-500)" }}>
              {categories.length}
            </span>
          </h3>
          {!showForm && (
            <button onClick={openAdd}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, color: "white", background: "var(--color-primary-600)", border: "none", cursor: "pointer" }}>
              <Plus size={15} />
              Tambah
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm" style={{ color: "var(--color-surface-400)" }}>Belum ada kategori</p>
          </div>
        ) : (
          <div>
            {categories.map((cat, idx) => (
              <div key={cat.id} style={{
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                height: "60px",
                borderBottom: idx < categories.length - 1 ? "1px solid var(--color-surface-100)" : "none",
                gap: "12px",
              }}>

                {/* Icon — fixed box */}
                <div style={{
                  width: "36px", height: "36px", minWidth: "36px",
                  borderRadius: "10px", background: cat.color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0,
                }}>
                  <span style={{
                    display: "block", width: "20px", height: "20px",
                    fontSize: "16px", lineHeight: "20px",
                    textAlign: "center", overflow: "hidden",
                  }}>
                    {cat.icon}
                  </span>
                </div>

                {/* Nama */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-surface-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cat.name}
                  </p>
                  {cat.is_default && (
                    <p style={{ fontSize: "11px", color: "var(--color-surface-400)" }}>Default</p>
                  )}
                </div>

                {/* Kanan: dot + edit + hapus — semua sejajar */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                  <div style={{ width: "10px", height: "10px", minWidth: "10px", borderRadius: "50%", background: cat.color, marginRight: "16px" }} />

                  <button onClick={() => openEdit(cat)} title="Edit"
                    style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-surface-400)", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-100)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <Pencil size={14} />
                  </button>

                  <button onClick={() => setDeleteItem(cat)} title="Hapus"
                    style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        type="danger"
        title="Hapus Kategori?"
        message={`Kategori "${deleteItem?.name}" akan dihapus permanen. Pengeluaran yang menggunakan kategori ini tidak akan terhapus.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}