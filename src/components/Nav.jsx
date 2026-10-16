import { useEffect, useState } from "react";
import { usePortfolio } from "../context/usePortfolio";
import ThemeToggle from "./ThemeToggle";
import "./Nav.css";

const TABS = [
  { id: "home", file: "Home.jsx" },
  { id: "about", file: "About.jsx" },
  { id: "services", file: "Services.jsx" },
  { id: "projects", file: "Projects.jsx" },
  { id: "skills", file: "Skills.jsx" },
  { id: "contact", file: "Contact.jsx" },
];

export default function Nav() {
  const { settings } = usePortfolio();
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  const brandName = settings?.site_name || "Lahiru.dev";

  // highlight the tab whose section is currently in view
  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Track page scroll progress for header progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="nav">
      <div className="nav-scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="dot dot-red" />
          <span className="dot dot-amber" />
          <span className="dot dot-green" />
          <span className="brand-name">{brandName}</span>
        </div>

        <nav className={`tabs ${open ? "tabs-open" : ""}`}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${active === tab.id ? "tab-active" : ""}`}
              onClick={() => handleClick(tab.id)}
            >
              <span className="tab-unsaved" aria-hidden="true">
                {active === tab.id ? "●" : ""}
              </span>
              {tab.file}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <ThemeToggle />

          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}