import { useState, useCallback, useMemo } from "react";
import { ToastContext } from "./toastContextDef";
import ToastContainer from "../components/ToastContainer";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = options.duration ?? (type === "error" ? 6000 : 4500);

      const newToast = {
        id,
        message,
        type,
        eyebrow: options.eyebrow,
        icon: options.icon,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep at most 5 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toastHelpers = useMemo(
    () => ({
      showToast,
      dismissToast,
      error: (msg, opts) => showToast(msg, "error", opts),
      warning: (msg, opts) => showToast(msg, "warning", opts),
      success: (msg, opts) => showToast(msg, "success", opts),
      info: (msg, opts) => showToast(msg, "info", opts),
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
