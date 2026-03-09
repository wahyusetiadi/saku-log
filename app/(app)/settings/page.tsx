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