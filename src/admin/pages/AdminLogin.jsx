import { useState } from "react";
import { useAdminAuth } from "../context/useAdminAuth";
import ThemeToggle from "../../components/ThemeToggle";
import { useToast } from "../context/useToast";

export default function AdminLogin({ onExit }) {
  const toast = useToast();
  const { login, loading, error: authError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (!res.success) {
      const err = res.error || "Authentication failed. Check credentials.";
      setLocalError(err);
      toast.error(err);
    } else {
      toast.success("Welcome back! Administrator session active.");
    }
  };

  const errorMessage = localError || authError;

  return (
    <div className="admin-wrapper" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="admin-modal" style={{ maxWidth: 440 }}>
        <div className="admin-modal-header">
          <div className="admin-brand">
            <span className="dot dot-red" />
            <span className="dot dot-amber" />
            <span className="dot dot-green" />
            <span style={{ marginLeft: 6 }}>auth.config.js</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle size="sm" />
            <button
              onClick={onExit}
              className="btn btn-ghost btn-sm"
              title="Return to public portfolio"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
            // Sign in to manage portfolio content via Supabase
          </p>

          {errorMessage && (
            <div
              style={{
                background: "rgba(242, 120, 120, 0.1)",
                border: "1px solid var(--accent-rose)",
                color: "var(--accent-rose)",
                padding: "10px 14px",
                borderRadius: 4,
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                marginBottom: 16,
              }}
            >
              ⚠ {errorMessage}
            </div>
          )}

          <div className="admin-form-group">
            <label>Admin Email</label>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label>Password</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={submitting || loading}
            >
              {submitting ? "Authenticating..." : "Login to Console"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onExit}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
