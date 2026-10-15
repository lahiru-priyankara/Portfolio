import { usePortfolio } from "../context/usePortfolio";
import "./Footer.css";

export default function Footer({ onOpenAdmin }) {
  const { settings, profile } = usePortfolio();
  const year = new Date().getFullYear();
  const displayName = settings?.hero_name || profile?.full_name || "Yeshini Wickramasinghe";

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="footer-status-pill">
            <span className="footer-status-dot" />
            <span>systems operational</span>
          </span>
          <span className="footer-copyright">
            © {year} {displayName}. Built with React &amp; Vite.
          </span>
        </div>
        <div className="footer-right">
          <span className="footer-tag">
            <span>{"</> with care"}</span>
            {onOpenAdmin && (
              <>
                <span className="footer-sep">·</span>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="footer-admin-btn"
                  title="Open Administration Console"
                >
                  console.login
                </button>
              </>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}