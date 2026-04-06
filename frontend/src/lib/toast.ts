/**
 * Simple toast utility — matches the project's no-external-lib philosophy.
 * Creates temporary DOM notifications without requiring sonner/react-hot-toast.
 */

type ToastType = "success" | "error" | "info";

function showToast(message: string, type: ToastType = "info") {
  const el = document.createElement("div");
  const colors: Record<ToastType, string> = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-slate-700",
  };
  el.className = `fixed bottom-5 right-5 z-[9999] px-4 py-3 rounded-lg text-white text-sm font-medium shadow-xl ${colors[type]} transition-all`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

export const toast = {
  success: (msg: string) => showToast(msg, "success"),
  error: (msg: string) => showToast(msg, "error"),
  info: (msg: string) => showToast(msg, "info"),
};
