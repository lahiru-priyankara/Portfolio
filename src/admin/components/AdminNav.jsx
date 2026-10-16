import { useState } from "react";
import { useAdminAuth } from "../context/useAdminAuth";
import { usePortfolio } from "../../context/usePortfolio";
import ConfirmModal from "./ConfirmModal";
import ThemeToggle from "../../components/ThemeToggle";
import "./AdminNav.css";

const TABS = [
  { id: "dashboard", label: "Dashboard.jsx" },
  { id: "settings", label: "Settings.jsx" },
  { id: "about", label: "About.jsx" },
  { id: "projects", label: "Projects.jsx" },
  { id: "skills", label: "Skills.jsx" },
  { id: "services", label: "Services.jsx" },
  { id: "social", label: "Social.jsx" },
  { id: "messages", label: "Messages.jsx" },
];

export default function AdminNav({ activeTab, onSelectTab, onExitAdmin }) {
  const { user, logout } = useAdminAuth();
  const { settings } = usePortfolio();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const siteName = settings?.site_name || "Lahiru.dev";

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <header className="admin-header">
        {/* Top Bar: Brand, Status, Site link & Session */}
        <div className="admin-topbar">
          <div className="admin-topbar-inner">
            <div className="admin-brand-group">
              <div className="window-dots" aria-hidden="true">
                <span className="dot dot-red" />
                <span className="dot dot-amber" />
                <span className="dot dot-green" />
              </div>
              <span className="admin-brand-title">{siteName}</span>
              <span className="admin-breadcrumb-sep">/</span>
              <span className="admin-console-label">admin console</span>
              <span className="admin-db-badge">
                <span className="status-ping" />
                Supabase Connected
              </span>
            </div>

            <div className="admin-actions-group">
              <button
                type="button"
                className="admin-site-btn"
                onClick={onExitAdmin}
                title="Return to public portfolio site"
              >
                <span className="site-icon">↗</span>
                <span>View Public Site</span>
              </button>

              {user?.email && (
                <div className="admin-user-pill" title={`Logged in as ${user.email}`}>
                  <span className="user-dot" />
                  <span className="user-email-text">{user.email}</span>
                </div>
              )}

              <ThemeToggle size="sm" />

              <button
                type="button"
                className="admin-logout-btn"
                onClick={() => setShowLogoutModal(true)}
                title="Sign out of administration console"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tab Strip: All 6 editor tabs centered */}
        <div className="admin-tabstrip">
          <div className="admin-tabstrip-inner">
            <nav className="admin-tabs-list" aria-label="Admin Sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`admin-editor-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => onSelectTab(tab.id)}
                >
                  <span className="tab-status-dot" aria-hidden="true">
                    {activeTab === tab.id ? "●" : ""}
                  </span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Logout */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="auth.logout_prompt"
        message="Are you sure you want to end your administration session and log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
