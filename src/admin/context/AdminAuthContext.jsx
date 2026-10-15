import { useEffect, useState, useCallback } from "react";
import { AdminAuthContext } from "./adminAuthContextDef";
import { portfolioApi } from "../../api/portfolioApi";

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("portfolio_admin_token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("portfolio_admin_token");
    setToken(null);
    setUser(null);
    portfolioApi.logout().catch(() => {});
  }, []);

  useEffect(() => {
    async function verifyUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await portfolioApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn("Session expired or invalid:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyUser();
  }, [token, logout]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await portfolioApi.login(email, password);
      if (res.success && res.session?.access_token) {
        const accessToken = res.session.access_token;
        localStorage.setItem("portfolio_admin_token", accessToken);
        setToken(accessToken);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.error || "Login failed");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
