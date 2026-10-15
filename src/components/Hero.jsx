import { useState, useEffect, useMemo } from "react";
import { usePortfolio } from "../context/usePortfolio";
import "./Hero.css";

const DEFAULT_STACK = ["React", "Node.js", "MongoDB", "Python", "Java"];

export default function Hero() {
  const { profile, settings } = usePortfolio();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const name = settings?.hero_name || profile?.full_name || "Yeshini Wickramasinghe";
  const headline = settings?.hero_headline || profile?.headline || "IT Undergraduate & Full-Stack Developer.";
  const subHeadline =
    settings?.hero_sub_headline ||
    profile?.sub_headline ||
    "I build clean, responsive web apps — from React front-ends to Node & MongoDB back-ends — and I take on freelance projects for clients who need reliable, well-documented code.";
  const basedIn = settings?.based_in || profile?.based_in || "Sri Lanka";
  const isAvailable = settings?.is_available ?? profile?.is_available ?? true;

  const introFileTab = settings?.intro_file_tab || "intro.js";
  const introGreeting = settings?.intro_greeting || "Hi, I'm";
  const codeWindowTitle = settings?.code_window_title || "developer.js";
  const developerRole = settings?.developer_role || "Full-Stack Developer";
  const developerStack = Array.isArray(settings?.developer_stack) && settings.developer_stack.length > 0
    ? settings.developer_stack
    : DEFAULT_STACK;
  const ctaPrimary = settings?.cta_primary_label || "View My Work";
  const ctaSecondary = settings?.cta_secondary_label || "Contact Me";

  // Dynamic Typewriter Roles
  const roles = useMemo(
    () => [
      developerRole,
      "React & Node.js Specialist",
      "UI/UX Craftsman",
      "Full-Stack Web Engineer",
    ],
    [developerRole]
  );

  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedRole, setDisplayedRole] = useState(developerRole);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFull = roles[currentRoleIndex] || developerRole;
    let timer;

    if (!isDeleting && displayedRole.length < currentFull.length) {
      timer = setTimeout(() => {
        setDisplayedRole(currentFull.slice(0, displayedRole.length + 1));
      }, 70);
    } else if (!isDeleting && displayedRole.length === currentFull.length) {
      timer = setTimeout(() => setIsDeleting(true), 2800);
    } else if (isDeleting && displayedRole.length > 0) {
      timer = setTimeout(() => {
        setDisplayedRole(currentFull.slice(0, displayedRole.length - 1));
      }, 35);
    } else if (isDeleting && displayedRole.length === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      }, 250);
    }

    return () => clearTimeout(timer);
  }, [displayedRole, isDeleting, currentRoleIndex, developerRole, roles]);

  return (
    <section id="home" className="hero">
      {/* Background Ambient Glow */}
      <div className="hero-ambient-glow" aria-hidden="true" />
      <div className="hero-ambient-glow-secondary" aria-hidden="true" />

      <div className="container hero-inner">
        {/* Left Column: Intro copy */}
        <div className="hero-copy reveal-on-scroll reveal-left revealed">
          <span className="eyebrow">{introFileTab}</span>

          <h1 className="hero-title">
            {introGreeting} <span className="accent-amber">{name}</span>.
            <br />
            <span className="hero-headline-static">
              {headline.split("&")[0]}
            </span>
            <span className="hero-dynamic-role-wrap">
              &amp; <span className="hero-dynamic-role">{displayedRole}</span>
              <span className="hero-typing-caret" aria-hidden="true">|</span>
            </span>
          </h1>

          <p className="hero-sub">{subHeadline}</p>

          <div className="hero-cta">
            <button className="btn btn-primary btn-shimmer" onClick={() => scrollTo("projects")}>
              {ctaPrimary}
            </button>
            <button className="btn btn-ghost btn-shimmer" onClick={() => scrollTo("contact")}>
              {ctaSecondary}
            </button>
          </div>
        </div>

        {/* Right Column: Code Editor Window */}
        <div className="hero-window reveal-on-scroll reveal-right revealed" aria-hidden="true">
          <div className="window-bar">
            <span className="dot dot-red" />
            <span className="dot dot-amber" />
            <span className="dot dot-green" />
            <span className="window-title">{codeWindowTitle}</span>
            <span className="window-badge-live">
              <span className="live-ping" />
              <span>active</span>
            </span>
          </div>

          <pre className="window-code">
<span className="tok-comment">// currently {isAvailable ? "available" : "unavailable"} for freelance work</span>{"\n"}
<span className="tok-key">const</span> <span className="tok-var">developer</span> = {"{"}
{"\n  "}<span className="tok-prop">name</span>: <span className="tok-str">"{name}"</span>,
{"\n  "}<span className="tok-prop">role</span>: <span className="tok-str">"{developerRole}"</span>,
{"\n  "}<span className="tok-prop">stack</span>: [{developerStack.map((s) => `"${s}"`).join(", ")}],
{"\n  "}<span className="tok-prop">basedIn</span>: <span className="tok-str">"{basedIn}"</span>,
{"\n  "}<span className="tok-prop">available</span>: <span className="tok-bool">{String(isAvailable)}</span>,
{"\n"}{"}"};<span className="caret">▍</span>
          </pre>
        </div>
      </div>
    </section>
  );
}