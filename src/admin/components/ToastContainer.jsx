import "./Toast.css";

const ICON_MAP = {
  error: "✕",
  warning: "⚠",
  success: "✓",
  info: "ℹ",
};

const DEFAULT_EYEBROWS = {
  error: "System Error",
  warning: "System Warning",
  success: "Action Complete",
  info: "System Notice",
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <aside className="toast-container" aria-live="polite" aria-label="System notifications">
      {toasts.map((t) => {
        const type = t.type || "info";
        const icon = t.icon || ICON_MAP[type] || "ℹ";
        const eyebrow = t.eyebrow || DEFAULT_EYEBROWS[type];

        return (
          <div
            key={t.id}
            className={`toast-item ${type}`}
            role="alert"
          >
            <div className="toast-icon-wrap" aria-hidden="true">
              {icon}
            </div>

            <div className="toast-content">
              <span className="toast-eyebrow">// {eyebrow}</span>
              <p className="toast-message">{t.message}</p>
            </div>

            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </aside>
  );
}
