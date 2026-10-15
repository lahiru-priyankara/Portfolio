import { useContext } from "react";
import { ConfirmContext } from "./confirmContextDef";

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Fallback to native confirm if outside provider
    return (options) => {
      const msg = typeof options === "string" ? options : options?.message || "Are you sure?";
      return Promise.resolve(window.confirm(msg));
    };
  }
  return context.confirm;
}
