"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, X, Info, CheckCircle } from "lucide-react";

type DialogType = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const icons = {
  danger:  { icon: Trash2,         bg: "bg-red-50",     iconColor: "text-red-500",     btnClass: "bg-red-600 hover:bg-red-700 text-white" },
  warning: { icon: AlertTriangle,  bg: "bg-amber-50",   iconColor: "text-amber-500",   btnClass: "bg-amber-500 hover:bg-amber-600 text-white" },
  info:    { icon: Info,           bg: "bg-blue-50",    iconColor: "text-blue-500",    btnClass: "bg-blue-600 hover:bg-blue-700 text-white" },
  success: { icon: CheckCircle,    bg: "bg-primary-50", iconColor: "text-primary-600", btnClass: "bg-primary-600 hover:bg-primary-700 text-white" },
};

export function ConfirmDialog({
  isOpen,
  type = "danger",
  title,
  message,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { icon: Icon, bg, iconColor, btnClass } = icons[type];

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
            <Icon size={22} className={iconColor} />
          </div>

          {/* Text */}
          <h3 className="text-base font-semibold text-surface-900 mb-2">{title}</h3>
          <p className="text-sm text-surface-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-surface-200 text-surface-700 hover:bg-surface-50 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}