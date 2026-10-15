import { useEffect, useState } from "react";
import { portfolioApi } from "../../api/portfolioApi";
import { useToast } from "../context/useToast";

const DEFAULT_PARAGRAPHS = [
  "I'm an IT undergraduate who enjoys turning ideas into working software — mostly web apps, mostly full-stack. I like the part of development where a messy requirement becomes a clean, usable interface, and I care about writing code that the next developer (often future me) can actually read.",
  "Outside coursework, I take on freelance and personal projects to keep building things end to end — from database design to the last pixel of the UI. I'm comfortable working solo with a client directly, or slotting into an existing codebase.",
];

const DEFAULT_TAGS = ["IT Undergraduate", "Freelance Developer", "Sri Lanka", "Open to Work"];

export default function AdminAbout() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedSql, setCopiedSql] = useState(false);

  const [form, setForm] = useState({
    // Section Header
    about_file_tab: "About.jsx",
    about_title_prefix: "A little",
    about_title_highlight: "about me",

    // Bio Paragraphs
    paragraphs: DEFAULT_PARAGRAPHS,
    rawText: DEFAULT_PARAGRAPHS.join("\n\n"),
    editorMode: "cards", // 'cards' | 'raw'

    // Tags
    tags: DEFAULT_TAGS,
    newTag: "",

    // Inspector Profile Card
    inspector_title: "inspector.profile",
    is_available: true,
    based_in: "Sri Lanka",
    inspector_education: "BSc (Hons) in Information Technology",
    inspector_focus: "Full-Stack Web Engineering",
    inspector_experience: "Freelance & Academic Projects",
    customItems: [], // [{ key: "interests", val: "AI & UI Systems" }]

    // Contact & Social Quick Links
    email: "yeshiniarchana@gmail.com",
    github_url: "https://github.com/YeshiniWckramasinghe",
    linkedin_url: "https://linkedin.com/in/yeshini",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await portfolioApi.getProfile();
        if (res.data) {
          const p = res.data;
          const paras =
            Array.isArray(p.about_paragraphs) && p.about_paragraphs.length > 0
              ? p.about_paragraphs
              : DEFAULT_PARAGRAPHS;
          const tags =
            Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : DEFAULT_TAGS;

          setForm({
            about_file_tab: p.about_file_tab || "About.jsx",
            about_title_prefix: p.about_title_prefix || "A little",
            about_title_highlight: p.about_title_highlight || "about me",
            paragraphs: paras,
            rawText: paras.join("\n\n"),
            editorMode: "cards",
            tags: tags,
            newTag: "",
            inspector_title: p.inspector_title || "inspector.profile",
            is_available: p.is_available ?? true,
            based_in: p.based_in || "Sri Lanka",
            inspector_education: p.inspector_education || "BSc (Hons) in Information Technology",
            inspector_focus: p.inspector_focus || "Full-Stack Web Engineering",
            inspector_experience: p.inspector_experience || "Freelance & Academic Projects",
            customItems: Array.isArray(p.inspector_items) ? p.inspector_items : [],
            email: p.email || "",
            github_url: p.github_url || "",
            linkedin_url: p.linkedin_url || "",
          });
        }
      } catch (err) {
        console.error("Failed to load about profile:", err);
        setErrorMsg("Failed to fetch current profile from backend.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Paragraph Management
  const handleParagraphChange = (index, value) => {
    const updated = [...form.paragraphs];
    updated[index] = value;
    setForm((prev) => ({
      ...prev,
      paragraphs: updated,
      rawText: updated.join("\n\n"),
    }));
  };

  const handleAddParagraph = () => {
    const updated = [...form.paragraphs, ""];
    setForm((prev) => ({
      ...prev,
      paragraphs: updated,
      rawText: updated.join("\n\n"),
    }));
  };

  const handleRemoveParagraph = (index) => {
    if (form.paragraphs.length <= 1) return;
    const updated = form.paragraphs.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      paragraphs: updated,
      rawText: updated.join("\n\n"),
    }));
  };

  const handleRawTextChange = (text) => {
    const split = text.split("\n\n").map((p) => p.trim()).filter(Boolean);
    setForm((prev) => ({
      ...prev,
      rawText: text,
      paragraphs: split.length > 0 ? split : [""],
    }));
  };

  // Tag Management
  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    const tag = form.newTag.trim();
    if (!tag) return;
    if (!form.tags.includes(tag)) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        newTag: "",
      }));
    } else {
      setForm((prev) => ({ ...prev, newTag: "" }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Custom Inspector Items
  const handleAddCustomItem = () => {
    setForm((prev) => ({
      ...prev,
      customItems: [...prev.customItems, { key: "new_field", val: "value" }],
    }));
  };

  const handleCustomItemChange = (index, field, value) => {
    const updated = [...form.customItems];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({
      ...prev,
      customItems: updated,
    }));
  };

  const handleRemoveCustomItem = (index) => {
    setForm((prev) => ({
      ...prev,
      customItems: prev.customItems.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const paras =
      form.editorMode === "raw"
        ? form.rawText.split("\n\n").map((p) => p.trim()).filter(Boolean)
        : form.paragraphs.map((p) => p.trim()).filter(Boolean);

    const payload = {
      about_file_tab: form.about_file_tab,
      about_title_prefix: form.about_title_prefix,
      about_title_highlight: form.about_title_highlight,
      about_paragraphs: paras,
      tags: form.tags,
      inspector_title: form.inspector_title,
      is_available: Boolean(form.is_available),
      based_in: form.based_in,
      inspector_education: form.inspector_education,
      inspector_focus: form.inspector_focus,
      inspector_experience: form.inspector_experience,
      inspector_items: form.customItems.filter((item) => item.key && item.val),
      email: form.email,
      github_url: form.github_url,
      linkedin_url: form.linkedin_url,
    };

    try {
      await portfolioApi.updateProfile(payload);
      setSuccessMsg("About section updated and published successfully!");
      toast.success("About section updated and published successfully!");
      setTimeout(() => setSuccessMsg(""), 4500);
    } catch (err) {
      console.error("Save error:", err);
      const errMsg = "Failed to save changes: " + (err.response?.data?.message || err.message);
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const sqlMigration = `-- Run this in your Supabase SQL Editor to support all extended About.jsx features:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_file_tab TEXT DEFAULT 'About.jsx';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_title_prefix TEXT DEFAULT 'A little';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_title_highlight TEXT DEFAULT 'about me';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_title TEXT DEFAULT 'inspector.profile';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_education TEXT DEFAULT 'BSc (Hons) in Information Technology';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_focus TEXT DEFAULT 'Full-Stack Web Engineering';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_experience TEXT DEFAULT 'Freelance & Academic Projects';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inspector_items JSONB DEFAULT '[]'::JSONB;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigration);
    setCopiedSql(true);
    toast.info("SQL schema migration snippet copied to clipboard.");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <p style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
          Loading About.jsx settings...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ maxWidth: 1100 }}>
      {/* Top Header */}
      <div className="admin-card-header" style={{ alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 className="admin-card-title" style={{ fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
            <span>📖 About.jsx Customization</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "var(--accent-teal)",
                background: "var(--surface-2)",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid var(--border)",
              }}
            >
              Public Section 02
            </span>
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-dim)", fontSize: 13.5 }}>
            Customize your developer bio, line-by-line code story, skill tags, and IDE inspector card.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {successMsg && (
            <span style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              ✓ {successMsg}
            </span>
          )}
          {errorMsg && (
            <span style={{ color: "var(--accent-rose)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              ✕ {errorMsg}
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
            style={{ minWidth: 160 }}
          >
            {saving ? "Saving Changes..." : "Save About.jsx"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: Section Header & File Tab Branding */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">🏷️ Section Eyebrow &amp; Heading</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="about_file_tab">File Tab Eyebrow</label>
              <input
                id="about_file_tab"
                name="about_file_tab"
                type="text"
                className="admin-input"
                value={form.about_file_tab}
                onChange={handleChange}
                placeholder="About.jsx"
                required
              />
              <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Code editor file tab label (e.g. <code>About.jsx</code> or <code>// about.js</code>)
              </span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="about_title_prefix">Title Prefix</label>
              <input
                id="about_title_prefix"
                name="about_title_prefix"
                type="text"
                className="admin-input"
                value={form.about_title_prefix}
                onChange={handleChange}
                placeholder="A little"
                required
              />
              <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Prefix before highlighted phrase (e.g. <code>A little</code> or <code>Who</code>)
              </span>
            </div>

            <div className="admin-form-group">
              <label htmlFor="about_title_highlight">Title Highlight (Amber Accent)</label>
              <input
                id="about_title_highlight"
                name="about_title_highlight"
                type="text"
                className="admin-input"
                value={form.about_title_highlight}
                onChange={handleChange}
                placeholder="about me"
                required
              />
              <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Highlighted in amber (e.g. <code>about me</code> or <code>I am</code>)
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Code Editor Bio Paragraphs */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ justifyContent: "space-between" }}>
            <div>
              <h3 className="admin-card-title">💻 Code Block Bio Paragraphs</h3>
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                Each paragraph displays with an IDE line number (01, 02, 03...).
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={`btn btn-sm ${form.editorMode === "cards" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setForm((prev) => ({ ...prev, editorMode: "cards" }))}
              >
                Line Cards
              </button>
              <button
                type="button"
                className={`btn btn-sm ${form.editorMode === "raw" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setForm((prev) => ({ ...prev, editorMode: "raw" }))}
              >
                Raw Text
              </button>
            </div>
          </div>

          {form.editorMode === "cards" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {form.paragraphs.map((para, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 12,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--accent-teal)",
                      paddingTop: 8,
                      minWidth: 26,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <textarea
                    rows={3}
                    className="admin-textarea"
                    value={para}
                    onChange={(e) => handleParagraphChange(idx, e.target.value)}
                    placeholder={`Paragraph ${idx + 1}...`}
                    style={{ flex: 1, margin: 0, resize: "vertical" }}
                  />

                  {form.paragraphs.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemoveParagraph(idx)}
                      title="Remove paragraph"
                      style={{ color: "var(--accent-rose)", borderColor: "transparent", marginTop: 4 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleAddParagraph}
                style={{ alignSelf: "flex-start", marginTop: 6 }}
              >
                + Add Paragraph
              </button>
            </div>
          ) : (
            <div className="admin-form-group">
              <label>Separate each paragraph with an empty line:</label>
              <textarea
                rows={8}
                className="admin-textarea"
                value={form.rawText}
                onChange={(e) => handleRawTextChange(e.target.value)}
                placeholder="First paragraph...&#10;&#10;Second paragraph..."
              />
            </div>
          )}
        </div>

        {/* Section 3: Identity & Skill Tags */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">🏷️ Identity &amp; Role Tags</h3>
            <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              Displayed at the bottom row of the code block.
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            {form.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 12px",
                  borderRadius: 4,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12.5,
                  color: "var(--text)",
                }}
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-rose)",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    fontSize: 14,
                  }}
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, maxWidth: 440 }}>
            <input
              type="text"
              className="admin-input"
              value={form.newTag}
              onChange={(e) => setForm({ ...form, newTag: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="e.g. Open to Work, React, Full-Stack"
            />
            <button type="button" className="btn btn-ghost" onClick={handleAddTag}>
              + Add Tag
            </button>
          </div>
        </div>

        {/* Section 4: IDE Inspector Profile Panel */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">🔍 IDE Inspector Panel (inspector.profile)</h3>
            <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              The code-editor sidebar card showing your career parameters.
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="inspector_title">Inspector Window Title</label>
              <input
                id="inspector_title"
                name="inspector_title"
                type="text"
                className="admin-input"
                value={form.inspector_title}
                onChange={handleChange}
                placeholder="inspector.profile"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="based_in">Location / Base</label>
              <input
                id="based_in"
                name="based_in"
                type="text"
                className="admin-input"
                value={form.based_in}
                onChange={handleChange}
                placeholder="Sri Lanka"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            <div className="admin-form-group">
              <label htmlFor="inspector_education">Education</label>
              <input
                id="inspector_education"
                name="inspector_education"
                type="text"
                className="admin-input"
                value={form.inspector_education}
                onChange={handleChange}
                placeholder="BSc (Hons) in Information Technology"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="inspector_focus">Engineering Focus</label>
              <input
                id="inspector_focus"
                name="inspector_focus"
                type="text"
                className="admin-input"
                value={form.inspector_focus}
                onChange={handleChange}
                placeholder="Full-Stack Web Engineering"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="inspector_experience">Experience Summary</label>
              <input
                id="inspector_experience"
                name="inspector_experience"
                type="text"
                className="admin-input"
                value={form.inspector_experience}
                onChange={handleChange}
                placeholder="Freelance & Academic Projects"
              />
            </div>
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
              <strong>Available for hire / freelance</strong> (Controls green pulsing badge in inspector and hero)
            </label>
          </div>

          {/* Custom Key-Value Pairs */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                Additional Custom Inspector Fields
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddCustomItem}>
                + Add Custom Field
              </button>
            </div>

            {form.customItems.length === 0 ? (
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                No extra fields added. Click "+ Add Custom Field" to display custom keys like interests, languages, or years of experience.
              </span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {form.customItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ width: "35%" }}
                      value={item.key}
                      onChange={(e) => handleCustomItemChange(idx, "key", e.target.value)}
                      placeholder="key (e.g. languages)"
                    />
                    <input
                      type="text"
                      className="admin-input"
                      style={{ flex: 1 }}
                      value={item.val}
                      onChange={(e) => handleCustomItemChange(idx, "val", e.target.value)}
                      placeholder="value (e.g. English, Sinhala)"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemoveCustomItem(idx)}
                      style={{ color: "var(--accent-rose)", borderColor: "transparent" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Live Interactive About Section Preview */}
        <div className="admin-card" style={{ borderColor: "var(--accent-teal)" }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title" style={{ color: "var(--accent-teal)" }}>
              👁️ Live About Section Preview (Synchronized in Real-Time)
            </h3>
          </div>

          <div
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "24px 28px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--accent-teal)",
                display: "block",
                marginBottom: 6,
              }}
            >
              // {form.about_file_tab || "About.jsx"}
            </span>

            <h2
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: "var(--text)",
                margin: "0 0 20px",
              }}
            >
              {form.about_title_prefix}{" "}
              <span style={{ color: "var(--accent-amber)" }}>{form.about_title_highlight}</span>
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              {/* Code block preview */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "16px 20px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                {form.paragraphs.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                    <span style={{ color: "var(--gutter)", minWidth: 20 }}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p style={{ margin: 0, color: "var(--text-dim)" }}>{p || "(Empty paragraph)"}</p>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 14, marginTop: 8, paddingLeft: 34 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 3,
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          color: "var(--accent-teal)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inspector card preview */}
              <div
                style={{
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
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-dim)", marginLeft: 6 }}>
                    {form.inspector_title || "inspector.profile"}
                  </span>
                </div>

                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: "var(--text-dim)" }}>status:</span>
                    <span style={{ color: form.is_available ? "var(--accent-teal)" : "var(--accent-amber)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: form.is_available ? "var(--accent-teal)" : "var(--accent-amber)",
                        }}
                      />
                      {form.is_available ? "Available for hire" : "Busy on projects"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: "var(--text-dim)" }}>location:</span>
                    <span style={{ color: "var(--text)" }}>{form.based_in}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: "var(--text-dim)" }}>education:</span>
                    <span style={{ color: "var(--text)", maxWidth: 180, textAlign: "right" }}>{form.inspector_education}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: "var(--text-dim)" }}>focus:</span>
                    <span style={{ color: "var(--text)", maxWidth: 180, textAlign: "right" }}>{form.inspector_focus}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: "var(--text-dim)" }}>experience:</span>
                    <span style={{ color: "var(--text)", maxWidth: 180, textAlign: "right" }}>{form.inspector_experience}</span>
                  </div>

                  {form.customItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
                      <span style={{ color: "var(--text-dim)" }}>{item.key}:</span>
                      <span style={{ color: "var(--text)" }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Supabase SQL Helper */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">🗄️ Supabase Migration Helper</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopySql}>
              {copiedSql ? "✓ Copied!" : "Copy SQL Migration"}
            </button>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 13, margin: "0 0 10px" }}>
            If you want to sync all new About.jsx fields directly with Supabase, run this script in your Supabase SQL Editor:
          </p>
          <pre
            style={{
              background: "var(--surface-2)",
              padding: "14px",
              borderRadius: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text)",
              overflowX: "auto",
              margin: 0,
            }}
          >
            {sqlMigration}
          </pre>
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            position: "sticky",
            bottom: 20,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              // Ready to publish changes?
            </span>
            {successMsg && (
              <span style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                ✓ {successMsg}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: 180 }}
          >
            {saving ? "Saving to Database..." : "Save About.jsx"}
          </button>
        </div>
      </form>
    </div>
  );
}
