import { useEffect, useState } from "react";
import { portfolioApi } from "../../api/portfolioApi";
import { usePortfolio } from "../../context/usePortfolio";
import { useToast } from "../context/useToast";

export default function AdminSystemSettings() {
  const toast = useToast();
  const { updateSettingsLocally } = usePortfolio();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedSql, setCopiedSql] = useState(false);

  const [form, setForm] = useState({
    site_name: "yeshini.dev",
    browser_title: "Yeshini Wickramasinghe | Full-Stack Developer",
    intro_file_tab: "intro.js",
    intro_greeting: "Hi, I'm",
    hero_name: "Yeshini Wickramasinghe",
    hero_headline: "IT Undergraduate & Full-Stack Developer.",
    hero_sub_headline:
      "I build clean, responsive web apps — from React front-ends to Node & MongoDB back-ends — and I take on freelance projects for clients who need reliable, well-documented code.",
    code_window_title: "developer.js",
    developer_role: "Full-Stack Developer",
    developer_stack_text: "React, Node.js, MongoDB, Python, Java",
    based_in: "Sri Lanka",
    is_available: true,
    cta_primary_label: "View My Work",
    cta_secondary_label: "Contact Me",
    avatar_url: "/avatar.jpg",
    show_avatar: true,
    favicon_url: "/favicon.svg",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await portfolioApi.getSettings();
        if (res.data) {
          const s = res.data;
          setForm({
            site_name: s.site_name || "yeshini.dev",
            browser_title: s.browser_title || "Yeshini Wickramasinghe | Full-Stack Developer",
            intro_file_tab: s.intro_file_tab || "intro.js",
            intro_greeting: s.intro_greeting || "Hi, I'm",
            hero_name: s.hero_name || "Yeshini Wickramasinghe",
            hero_headline: s.hero_headline || "IT Undergraduate & Full-Stack Developer.",
            hero_sub_headline: s.hero_sub_headline || "",
            code_window_title: s.code_window_title || "developer.js",
            developer_role: s.developer_role || "Full-Stack Developer",
            developer_stack_text: Array.isArray(s.developer_stack)
              ? s.developer_stack.join(", ")
              : "React, Node.js, MongoDB, Python, Java",
            based_in: s.based_in || "Sri Lanka",
            is_available: s.is_available ?? true,
            cta_primary_label: s.cta_primary_label || "View My Work",
            cta_secondary_label: s.cta_secondary_label || "Contact Me",
            avatar_url: s.avatar_url || "/avatar.jpg",
            show_avatar: s.show_avatar ?? true,
            favicon_url: s.favicon_url || "/favicon.svg",
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file is too large (max 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setForm((prev) => ({
          ...prev,
          favicon_url: reader.result,
        }));
        toast.success("Website tab image loaded! Save settings to apply.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetFavicon = () => {
    setForm((prev) => ({
      ...prev,
      favicon_url: "/favicon.svg",
    }));
    toast.info("Reset tab image to default (/favicon.svg)");
  };

  const handleClearFavicon = () => {
    setForm((prev) => ({
      ...prev,
      favicon_url: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    const stackArray = form.developer_stack_text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      site_name: form.site_name.trim() || "yeshini.dev",
      browser_title: form.browser_title.trim(),
      intro_file_tab: form.intro_file_tab.trim() || "intro.js",
      intro_greeting: form.intro_greeting.trim() || "Hi, I'm",
      hero_name: form.hero_name.trim(),
      hero_headline: form.hero_headline.trim(),
      hero_sub_headline: form.hero_sub_headline.trim(),
      code_window_title: form.code_window_title.trim() || "developer.js",
      developer_role: form.developer_role.trim() || "Full-Stack Developer",
      developer_stack: stackArray,
      based_in: form.based_in.trim() || "Sri Lanka",
      is_available: Boolean(form.is_available),
      cta_primary_label: form.cta_primary_label.trim() || "View My Work",
      cta_secondary_label: form.cta_secondary_label.trim() || "Contact Me",
      avatar_url: form.avatar_url.trim() || "/avatar.jpg",
      show_avatar: Boolean(form.show_avatar),
      favicon_url: form.favicon_url ? form.favicon_url.trim() : "/favicon.svg",
    };

    try {
      const res = await portfolioApi.updateSettings(payload);
      if (res.success) {
        updateSettingsLocally(payload);
        setSuccessMsg("System & Intro settings saved and applied successfully!");
        toast.success("System & Intro settings saved and applied successfully!");
        setTimeout(() => setSuccessMsg(""), 4500);
      }
    } catch (err) {
      toast.error("Failed to save system settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopySql = () => {
    const sql = `-- Run this in Supabase SQL Editor if you want to sync site_name column in profiles table:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'yeshini.dev';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_file_tab TEXT DEFAULT 'intro.js';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intro_greeting TEXT DEFAULT 'Hi, I''m';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS code_window_title TEXT DEFAULT 'developer.js';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS developer_role TEXT DEFAULT 'Full-Stack Developer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS developer_stack TEXT[] DEFAULT ARRAY['React', 'Node.js', 'MongoDB', 'Python', 'Java']::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cta_primary_label TEXT DEFAULT 'View My Work';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cta_secondary_label TEXT DEFAULT 'Contact Me';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS browser_title TEXT DEFAULT 'Yeshini Wickramasinghe | Full-Stack Developer';`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    toast.info("SQL schema migration snippet copied to clipboard.");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const stackPreviewList = form.developer_stack_text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="admin-container">
        <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
          Loading system settings...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ maxWidth: 980 }}>
      {/* Page Header */}
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">
            <span>⚙️ System &amp; Intro Customization</span>
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-dim)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
            Manage navigation brand name, document title, hero intro, and developer code window.
          </p>
        </div>
        {successMsg && (
          <span style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            ✓ {successMsg}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Navigation & Global Branding */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">🧭 Navigation Bar &amp; Global Branding</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="site_name">
                Navigation Site Name / Brand <span style={{ color: "var(--accent-amber)" }}>*</span>
              </label>
              <input
                id="site_name"
                name="site_name"
                type="text"
                className="admin-input"
                value={form.site_name}
                onChange={handleChange}
                placeholder="e.g. Yashi.dev or yeshini.dev"
                required
              />
              <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Displayed in the top navigation bar, admin console header, and footer.
              </span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="browser_title">Browser Document Title</label>
              <input
                id="browser_title"
                name="browser_title"
                type="text"
                className="admin-input"
                value={form.browser_title}
                onChange={handleChange}
                placeholder="e.g. Yeshini Wickramasinghe | Full-Stack Developer"
              />
              <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Shown on browser tab titles and bookmarks.
              </span>
            </div>
          </div>

          {/* Website Tab Image (Browser Favicon) Upload & Controls */}
          <div className="admin-form-group" style={{ marginTop: 18 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Website Tab Image (Browser Favicon)</span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--accent-orange)",
                  background: "rgba(249, 115, 22, 0.12)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Browser Tab Icon
              </span>
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 18,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              {/* Tab Icon Preview Box */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
                title="Current Tab Favicon Preview"
              >
                {form.favicon_url ? (
                  <img
                    src={form.favicon_url}
                    alt="Favicon"
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: "contain",
                      imageRendering: "crisp-edges",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 20 }}>🌐</span>
                )}
              </div>

              {/* Upload Controls & URL input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      margin: 0,
                      borderColor: "var(--accent-orange)",
                      color: "var(--accent-orange)",
                    }}
                    title="Upload image file from your computer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp,.ico,.png,.svg,.jpg"
                      style={{ display: "none" }}
                      onChange={handleFaviconUpload}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleResetFavicon}
                    title="Reset to default /favicon.svg"
                  >
                    ↺ Reset Default
                  </button>

                  {form.favicon_url && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={handleClearFavicon}
                      style={{ color: "#f87171" }}
                      title="Clear favicon"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    name="favicon_url"
                    className="admin-input"
                    value={form.favicon_url}
                    onChange={handleChange}
                    placeholder="/favicon.svg or https://example.com/icon.png or data:image/..."
                    style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: 11.5,
                color: "var(--text-dim)",
                fontFamily: "var(--font-mono)",
                marginTop: 6,
                display: "block",
              }}
            >
              Upload any PNG, ICO, SVG, JPG, or WebP image. Recommended: 32×32px or 64×64px square icon. Automatically renders in the browser tab.
            </span>
          </div>

          {/* Live Browser Tab Preview */}
          <div style={{ marginTop: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              // LIVE BROWSER TAB PREVIEW (AS SEEN IN CHROME / SAFARI / EDGE)
            </span>
            <div
              style={{
                marginTop: 6,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 14px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
              }}
            >
              {/* Tab Element */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderBottom: "none",
                  borderRadius: "8px 8px 0 0",
                  padding: "7px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  maxWidth: 320,
                  boxShadow: "0 -2px 10px rgba(0,0,0,0.18)",
                }}
              >
                {form.favicon_url ? (
                  <img
                    src={form.favicon_url}
                    alt=""
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: "var(--accent-orange)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "var(--font-sans)",
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: 500,
                  }}
                >
                  {form.browser_title || form.site_name || "Portfolio"}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-dim)", marginLeft: "auto", paddingLeft: 6 }}>
                  ✕
                </span>
              </div>

              {/* Plus icon for next tab */}
              <span style={{ color: "var(--text-dim)", fontSize: 14, padding: "0 6px", userSelect: "none" }}>
                +
              </span>
            </div>
          </div>

          {/* Live Navigation Brand Preview */}
          <div style={{ marginTop: 18 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              // LIVE NAVIGATION BAR PREVIEW
            </span>
            <div
              style={{
                marginTop: 6,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="dot dot-red" />
                <span className="dot dot-amber" />
                <span className="dot dot-green" />
                <strong
                  style={{
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    marginLeft: 6,
                  }}
                >
                  {form.site_name || "yeshini.dev"}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--text-dim)",
                }}
              >
                <span style={{ color: "var(--accent-amber)" }}>● Home.jsx</span>
                <span>About.jsx</span>
                <span>Skills.jsx</span>
                <span>Projects.jsx</span>
                <span>Contact.jsx</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent-teal)",
                    background: "var(--surface)",
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                  }}
                >
                  Theme Toggle [☀️/🌙]
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Intro & Hero Content */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">✨ Hero Intro &amp; Pitch Customization</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="intro_file_tab">Intro Eyebrow File Tab</label>
              <input
                id="intro_file_tab"
                name="intro_file_tab"
                type="text"
                className="admin-input"
                value={form.intro_file_tab}
                onChange={handleChange}
                placeholder="intro.js"
              />
              <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Code comment tab label above the title (e.g. // intro.js)
              </span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="intro_greeting">Greeting Prefix</label>
              <input
                id="intro_greeting"
                name="intro_greeting"
                type="text"
                className="admin-input"
                value={form.intro_greeting}
                onChange={handleChange}
                placeholder="Hi, I'm"
              />
              <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Prefix before your highlighted name (e.g. "Hi, I'm" or "Hello, I'm")
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="hero_name">Display Name</label>
              <input
                id="hero_name"
                name="hero_name"
                type="text"
                className="admin-input"
                value={form.hero_name}
                onChange={handleChange}
                placeholder="Yeshini Wickramasinghe"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="based_in">Location / Based In</label>
              <input
                id="based_in"
                name="based_in"
                type="text"
                className="admin-input"
                value={form.based_in}
                onChange={handleChange}
                placeholder="Sri Lanka"
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="hero_headline">Hero Headline / Primary Role</label>
            <input
              id="hero_headline"
              name="hero_headline"
              type="text"
              className="admin-input"
              value={form.hero_headline}
              onChange={handleChange}
              placeholder="IT Undergraduate & Full-Stack Developer."
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="hero_sub_headline">Hero Subtitle / Description</label>
            <textarea
              id="hero_sub_headline"
              name="hero_sub_headline"
              rows={3}
              className="admin-textarea"
              value={form.hero_sub_headline}
              onChange={handleChange}
              placeholder="I build clean, responsive web apps..."
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="cta_primary_label">Primary Button Label</label>
              <input
                id="cta_primary_label"
                name="cta_primary_label"
                type="text"
                className="admin-input"
                value={form.cta_primary_label}
                onChange={handleChange}
                placeholder="View My Work"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="cta_secondary_label">Secondary Button Label</label>
              <input
                id="cta_secondary_label"
                name="cta_secondary_label"
                type="text"
                className="admin-input"
                value={form.cta_secondary_label}
                onChange={handleChange}
                placeholder="Contact Me"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Hero Code Window (developer.js) */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">💻 Hero Code Editor Window Customization</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="code_window_title">Editor Window File Tab</label>
              <input
                id="code_window_title"
                name="code_window_title"
                type="text"
                className="admin-input"
                value={form.code_window_title}
                onChange={handleChange}
                placeholder="developer.js"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="developer_role">Developer Role Variable</label>
              <input
                id="developer_role"
                name="developer_role"
                type="text"
                className="admin-input"
                value={form.developer_role}
                onChange={handleChange}
                placeholder="Full-Stack Developer"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="developer_stack_text">Tech Stack Array (Comma-separated)</label>
            <input
              id="developer_stack_text"
              name="developer_stack_text"
              type="text"
              className="admin-input"
              value={form.developer_stack_text}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, Python, Java"
            />
          </div>

          <div
            className="admin-form-group"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 6,
              background: "var(--surface-2)",
              padding: "12px 16px",
              borderRadius: 6,
              border: "1px solid var(--border)",
            }}
          >
            <input
              type="checkbox"
              id="is_available_setting"
              name="is_available"
              checked={form.is_available}
              onChange={handleChange}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <label htmlFor="is_available_setting" style={{ cursor: "pointer", color: "var(--text)", margin: 0 }}>
              <strong>Available for hire / freelance</strong> (Controls green pulsing badge and available flag in code)
            </label>
          </div>

          {/* Live Code Window Preview */}
          <div style={{ marginTop: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              // LIVE CODE EDITOR WINDOW PREVIEW
            </span>
            <div
              style={{
                marginTop: 6,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span className="dot dot-red" />
                <span className="dot dot-amber" />
                <span className="dot dot-green" />
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-dim)", marginLeft: 6 }}>
                  {form.code_window_title || "developer.js"}
                </span>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "16px 20px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: "var(--text)",
                  overflowX: "auto",
                }}
              >
                <span style={{ color: "var(--gutter)" }}>
                  // currently {form.is_available ? "available" : "unavailable"} for freelance work
                </span>
                {"\n"}
                <span style={{ color: "var(--accent-purple)" }}>const</span>{" "}
                <span style={{ color: "var(--accent-teal)" }}>developer</span> = {"{"}
                {"\n  "}name: <span style={{ color: "var(--accent-amber)" }}>"{form.hero_name}"</span>,
                {"\n  "}role: <span style={{ color: "var(--accent-amber)" }}>"{form.developer_role}"</span>,
                {"\n  "}stack: [{stackPreviewList.map((s) => `"${s}"`).join(", ")}],
                {"\n  "}basedIn: <span style={{ color: "var(--accent-amber)" }}>"{form.based_in}"</span>,
                {"\n  "}available: <span style={{ color: "var(--accent-rose)" }}>{String(form.is_available)}</span>,
                {"\n"}{"}"};<span style={{ color: "var(--accent-amber)" }}>▍</span>
              </pre>
            </div>
          </div>
        </div>

        {/* Section 4: Database Sync Helper */}
        <div
          className="admin-card"
          style={{
            background: "var(--surface-2)",
            border: "1px dashed var(--border)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h4 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text)" }}>
                🗄️ Supabase PostgreSQL Synchronization
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Settings are automatically saved in the system configuration and synchronized with Supabase.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleCopySql}
              title="Copy SQL migration statement for Supabase"
            >
              {copiedSql ? "✓ SQL Copied!" : "Copy Supabase SQL"}
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, marginTop: 10 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: 200, padding: "12px 28px", fontSize: 14 }}
          >
            {saving ? "Saving Settings..." : "Save System Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
