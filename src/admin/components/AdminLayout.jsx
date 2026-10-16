import { useState } from "react";
import { useAdminAuth } from "../context/useAdminAuth";
import { usePortfolio } from "../../context/usePortfolio";
import AdminNav from "./AdminNav";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminSystemSettings from "../pages/AdminSystemSettings";
import AdminProjects from "../pages/AdminProjects";
import AdminSkills from "../pages/AdminSkills";
import AdminServices from "../pages/AdminServices";
import AdminSocial from "../pages/AdminSocial";
import AdminAbout from "../pages/AdminAbout";
import AdminMessages from "../pages/AdminMessages";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import "../admin.css";

export default function AdminLayout({ onExitAdmin }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const { refreshAll } = usePortfolio();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleExit = () => {
    if (typeof refreshAll === "function") {
      refreshAll();
    }
    if (typeof onExitAdmin === "function") {
      onExitAdmin();
    }
  };

  if (loading) {
    return (
      <div className="admin-wrapper" style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent-teal)" }}>
          Checking administrator authentication...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <AdminLogin onExit={handleExit} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="admin-wrapper">
          <AdminNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onExitAdmin={handleExit}
          />

          <main style={{ flex: 1 }}>
            {activeTab === "dashboard" && <AdminDashboard onNavigate={setActiveTab} />}
            {activeTab === "settings" && <AdminSystemSettings />}
            {(activeTab === "about" || activeTab === "profile") && <AdminAbout />}
            {activeTab === "projects" && <AdminProjects />}
            {activeTab === "skills" && <AdminSkills />}
            {activeTab === "services" && <AdminServices />}
            {activeTab === "social" && <AdminSocial />}
            {activeTab === "messages" && <AdminMessages />}
          </main>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
