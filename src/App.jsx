import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { PortfolioProvider } from "./context/PortfolioContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminLayout from "./admin/components/AdminLayout";
import { useScrollReveal } from "./hooks/useScrollReveal";

export default function App() {
  const { showBackToTop, scrollToTop } = useScrollReveal();
  const [isAdminRoute, setIsAdminRoute] = useState(
    () => window.location.hash === "#admin" || window.location.pathname.startsWith("/admin")
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(
        window.location.hash === "#admin" || window.location.pathname.startsWith("/admin")
      );
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const openAdmin = () => {
    window.location.hash = "admin";
    setIsAdminRoute(true);
  };

  const exitAdmin = () => {
    window.location.hash = "";
    if (window.location.pathname.startsWith("/admin")) {
      window.history.pushState(null, "", "/");
    }
    setIsAdminRoute(false);
  };

  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <PortfolioProvider>
          {isAdminRoute ? (
            <AdminLayout onExitAdmin={exitAdmin} />
          ) : (
            <>
              <Nav />
              <main>
                <Hero />
                <About />
                <Services />
                <Projects />
                <Skills />
                <Contact />
              </main>
              <Footer onOpenAdmin={openAdmin} />

              {/* Floating Back to Top Button */}
              <button
                type="button"
                className={`back-to-top-btn ${showBackToTop ? "visible" : ""}`}
                onClick={scrollToTop}
                title="Scroll back to top"
                aria-label="Scroll back to top"
              >
                <span aria-hidden="true">▲</span>
                <span>Top</span>
              </button>
            </>
          )}
        </PortfolioProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
