import { useContext } from "react";
import { ToastContext } from "./toastContextDef";

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside ToastProvider
    return {
      showToast: (msg, type) => console.log(`[Toast ${type || "info"}]: ${msg}`),
      error: (msg) => console.error(`[Toast error]: ${msg}`),
      warning: (msg) => console.warn(`[Toast warning]: ${msg}`),
      success: (msg) => console.log(`[Toast success]: ${msg}`),
      info: (msg) => console.log(`[Toast info]: ${msg}`),
    };
  }
  return context;
}
