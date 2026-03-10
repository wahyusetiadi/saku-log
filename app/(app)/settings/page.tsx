"use client";

import { useState } from "react";
import { Tag, Download, User, Lock } from "lucide-react";
import { CategoriesTab } from "@/components/settings/CategoriesTab";
import { ExportTab }     from "@/components/settings/ExportTab";
import { ProfileTab }    from "@/components/settings/ProfileTab";
import { PasswordTab }   from "@/components/settings/PasswordTab";

type Tab = "categories" | "export" | "profile" | "password";

const tabs = [
  { id: "categories" as Tab, label: "Kategori",    icon: Tag },
  { id: "export"     as Tab, label: "Export Data", icon: Download },
  { id: "profile"    as Tab, label: "Edit Profil", icon: User },
  { id: "password"   as Tab, label: "Ubah Sandi",  icon: Lock },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("categories");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-900)" }}>
          Pengaturan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-surface-400)" }}>
          Kelola akun dan preferensi kamu
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 active:scale-95"
            style={{
              background: activeTab === id ? "var(--color-primary-600)" : "white",
              color: activeTab === id ? "white" : "var(--color-surface-600)",
              border: `1px solid ${activeTab === id ? "var(--color-primary-600)" : "var(--color-surface-200)"}`,
            }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "export"     && <ExportTab />}
        {activeTab === "profile"    && <ProfileTab />}
        {activeTab === "password"   && <PasswordTab />}
      </div>
    </div>
  );
}