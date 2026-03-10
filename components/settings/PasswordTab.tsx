"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

export function PasswordTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  const strength =
    form.newPassword.length === 0 ? 0
    : form.newPassword.length < 6 ? 1
    : form.newPassword.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "Lemah", "Sedang", "Kuat"][strength];
  const strengthColor = ["", "#ef4444", "#f97316", "#22c55e"][strength];
  const isMatch = form.confirmPassword.length > 0 && form.newPassword === form.confirmPassword;
  const isMismatch = form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;

  const handleSave = async () => {
    if (!form.currentPassword) return toast.error("Masukkan password saat ini");
    if (form.newPassword.length < 6) return toast.error("Password baru minimal 6 karakter");
    if (form.newPassword !== form.confirmPassword) return toast.error("Konfirmasi password tidak cocok");

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password berhasil diubah!");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Gagal ubah password");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="font-semibold" style={{ color: "var(--color-surface-900)" }}>Ubah Password</h3>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-surface-400)" }}>
          Pastikan password baru kamu kuat dan mudah diingat
        </p>
      </div>

      {/* Password Saat Ini */}
      <div>
        <label className="label">Password Saat Ini</label>
        <div className="relative">
          <input
            type={show.current ? "text" : "password"}
            className="input pr-10"
            value={form.currentPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            placeholder="Masukkan password saat ini"
          />
          <button type="button"
            onClick={() => setShow((prev) => ({ ...prev, current: !prev.current }))}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-surface-400)", background: "none", border: "none", cursor: "pointer" }}>
            {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Password Baru */}
      <div>
        <label className="label">Password Baru</label>
        <div className="relative">
          <input
            type={show.new ? "text" : "password"}
            className="input pr-10"
            value={form.newPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Minimal 6 karakter"
          />
          <button type="button"
            onClick={() => setShow((prev) => ({ ...prev, new: !prev.new }))}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-surface-400)", background: "none", border: "none", cursor: "pointer" }}>
            {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form.newPassword.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                  style={{ background: i <= strength ? strengthColor : "var(--color-surface-200)" }} />
              ))}
            </div>
            <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
          </div>
        )}
      </div>

      {/* Konfirmasi Password */}
      <div>
        <label className="label">Konfirmasi Password Baru</label>
        <div className="relative">
          <input
            type={show.confirm ? "text" : "password"}
            className="input pr-10"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Ulangi password baru"
          />
          <button type="button"
            onClick={() => setShow((prev) => ({ ...prev, confirm: !prev.confirm }))}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-surface-400)", background: "none", border: "none", cursor: "pointer" }}>
            {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {isMismatch && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>Password tidak cocok</p>
        )}
        {isMatch && form.newPassword.length >= 6 && (
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#22c55e" }}>
            <Check size={12} /> Password cocok
          </p>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: "var(--color-primary-600)", border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
        Ubah Password
      </button>
    </div>
  );
}