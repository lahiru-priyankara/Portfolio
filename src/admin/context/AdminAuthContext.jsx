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
    localStorage.removeItem("portfolio_admin_refresh_token");
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
          throw new Error("Invalid session");
        }
      } catch (err) {
        // Attempt session refresh if refresh token is available
        const refreshToken = localStorage.getItem("portfolio_admin_refresh_token");
        if (refreshToken) {
          try {
            const refreshRes = await portfolioApi.refreshToken(refreshToken);
            if (refreshRes.success && refreshRes.session?.access_token) {
              const newAccessToken = refreshRes.session.access_token;
              localStorage.setItem("portfolio_admin_token", newAccessToken);
              if (refreshRes.session.refresh_token) {
                localStorage.setItem("portfolio_admin_refresh_token", refreshRes.session.refresh_token);
              }
              setToken(newAccessToken);
              setUser(refreshRes.user);
              return;
            }
          } catch {
            // refresh failed, logout below
          }
        }
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
        if (res.session.refresh_token) {
          localStorage.setItem("portfolio_admin_refresh_token", res.session.refresh_token);
        }
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
