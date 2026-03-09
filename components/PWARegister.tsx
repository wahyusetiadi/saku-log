"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registered"))
        .catch((err) => console.log("SW error:", err));
    }

    // Handle PWA install prompt
    let deferredPrompt: any;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Tampilkan toast install setelah 3 detik
      setTimeout(() => {
        toast(
          (t) => (
            <div className="flex items-center gap-3">
              <span className="text-xl">📲</span>
              <div>
                <p className="font-medium text-sm">Install Saku-log</p>
                <p className="text-xs opacity-75">Tambahkan ke layar utama</p>
              </div>
              <button
                onClick={() => {
                  deferredPrompt?.prompt();
                  toast.dismiss(t.id);
                }}
                style={{
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Install
              </button>
            </div>
          ),
          { duration: 8000, style: { maxWidth: "360px" } }
        );
      }, 3000);
    });
  }, []);

  return null;
}