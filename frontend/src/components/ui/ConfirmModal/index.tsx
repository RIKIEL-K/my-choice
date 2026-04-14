import * as React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    icon: "bg-red-100 text-red-600",
    confirm: "bg-red-500 hover:bg-red-600 focus:ring-red-400",
    bar: "bg-red-500",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    confirm: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
    bar: "bg-amber-500",
  },
  info: {
    icon: "bg-violet-100 text-violet-600",
    confirm: "bg-violet-600 hover:bg-violet-700 focus:ring-violet-400",
    bar: "bg-violet-600",
  },
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Oui",
  cancelLabel = "Non",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const styles = variantStyles[variant];

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        className="fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm animate-[scaleIn_200ms_ease-out]"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60">
          {/* Accent bar */}
          <div className={`h-1 ${styles.bar}`} />

          {/* Body */}
          <div className="px-6 pt-6 pb-5 text-center">
            {/* Icon */}
            <div
              className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${styles.icon}`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Title */}
            <h3
              id="confirm-modal-title"
              className="text-base font-semibold text-slate-900 mb-1"
            >
              {title}
            </h3>

            {/* Message */}
            <p
              id="confirm-modal-desc"
              className="text-sm text-slate-500 leading-relaxed"
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors rounded-bl-2xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-400"
            >
              {cancelLabel}
            </button>
            <div className="w-px bg-slate-100" />
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-sm font-semibold text-white transition-colors rounded-br-2xl focus:outline-none focus:ring-2 focus:ring-inset ${styles.confirm}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
