"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function ProfileTab() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setName(data.name);
          setUsername(data.username);
          setJoinDate(data.created_at);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Nama tidak boleh kosong");
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) toast.success("Nama berhasil diperbarui!");
    else toast.error(data.error || "Gagal update");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="card p-5 space-y-4">
        <div className="skeleton h-6 w-40 rounded-lg" />
        <div className="skeleton h-20 rounded-xl" />
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="font-semibold" style={{ color: "var(--color-surface-900)" }}>Edit Profil</h3>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-surface-400)" }}>
          Perbarui nama tampilan akunmu
        </p>
      </div>

      {/* Avatar preview */}
      <div className="flex items-center gap-4 p-4 rounded-xl"
        style={{ background: "var(--color-surface-50)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate" style={{ color: "var(--color-surface-900)" }}>{name}</p>
          <p className="text-sm truncate" style={{ color: "var(--color-surface-400)" }}>@{username}</p>
          {joinDate && (
            <p className="text-xs mt-0.5" style={{ color: "var(--color-surface-400)" }}>
              Bergabung {new Date(joinDate).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <div>
        <label className="label">Nama Lengkap</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu" />
      </div>

      <div>
        <label className="label">Username</label>
        <input className="input" value={username} disabled
          style={{ background: "var(--color-surface-50)", color: "var(--color-surface-400)", cursor: "not-allowed" }} />
        <p className="text-xs mt-1" style={{ color: "var(--color-surface-400)" }}>
          Username tidak dapat diubah
        </p>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: "var(--color-primary-600)" }}>
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        Simpan Perubahan
      </button>
    </div>
  );
}