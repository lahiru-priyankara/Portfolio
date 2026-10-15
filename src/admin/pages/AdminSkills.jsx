import { useEffect, useState } from "react";
import { portfolioApi } from "../../api/portfolioApi";
import TechIcon from "../../components/TechIcon";
import { TECH_ICON_PRESETS, detectTechIcon } from "../../utils/techIconsData";
import { useToast } from "../context/useToast";
import { useConfirm } from "../context/useConfirm";

const PRESET_CATEGORIES = [
  { id: "frontend/", label: "Frontend", desc: "UI, styling, client-side frameworks" },
  { id: "backend/", label: "Backend", desc: "APIs, server runtimes, architecture" },
  { id: "database/", label: "Database", desc: "SQL, NoSQL, ORM, data persistence" },
  { id: "tools/", label: "Tools & DevOps", desc: "Git, CI/CD, testing, API clients" },
  { id: "design/", label: "Design & Creative", desc: "UI/UX, graphic design, 3D/game engines" },
];

const DEFAULT_18_SKILLS = [
  // Frontend
  { category: "frontend/", name: "HTML5", icon: "html5", sort_order: 1, level: "Semantic Markup" },
  { category: "frontend/", name: "CSS3", icon: "css3", sort_order: 2, level: "Modern Flex/Grid" },
  { category: "frontend/", name: "JavaScript", icon: "javascript", sort_order: 3, level: "ES6+ Async" },
  { category: "frontend/", name: "React", icon: "react", sort_order: 4, level: "Hooks & Context" },

  // Backend
  { category: "backend/", name: "Node.js", icon: "nodejs", sort_order: 5, level: "REST Services" },
  { category: "backend/", name: "Express.js", icon: "express", sort_order: 6, level: "API Routing" },
  { category: "backend/", name: "Java", icon: "java", sort_order: 7, level: "OOP & Architecture" },
  { category: "backend/", name: "Kotlin", icon: "kotlin", sort_order: 8, level: "Modern JVM" },
  { category: "backend/", name: "PHP", icon: "php", sort_order: 9, level: "Web Backends" },

  // Database
  { category: "database/", name: "MongoDB", icon: "mongodb", sort_order: 10, level: "Document DB" },
  { category: "database/", name: "MySQL", icon: "mysql", sort_order: 11, level: "Relational SQL" },

  // Tools & DevOps
  { category: "tools/", name: "Git", icon: "git", sort_order: 12, level: "Version Control" },
  { category: "tools/", name: "Postman", icon: "postman", sort_order: 13, level: "API Testing" },
  { category: "tools/", name: "GitHub", icon: "github", sort_order: 14, level: "Collaboration" },

  // Design & Creative
  { category: "design/", name: "Figma", icon: "figma", sort_order: 15, level: "UI/UX Prototyping" },
  { category: "design/", name: "Adobe Photoshop", icon: "photoshop", sort_order: 16, level: "Asset Polish" },
  { category: "design/", name: "Adobe Illustrator", icon: "illustrator", sort_order: 17, level: "Vector Graphics" },
  { category: "design/", name: "Unity", icon: "unity", sort_order: 18, level: "3D & Game Engine" },
];

export default function AdminSkills() {
  const toast = useToast();
  const confirm = useConfirm();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [copiedSql, setCopiedSql] = useState(false);

  const [form, setForm] = useState({
    category: "frontend/",
    name: "",
    icon: "html5",
    level: "",
    sort_order: 1,
  });

  const loadSkills = async () => {
    try {
      const res = await portfolioApi.getSkills();
      setSkills(res.data || []);
    } catch (err) {
      console.error("Failed to load skills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    portfolioApi
      .getSkills()
      .then((res) => {
        if (active) {
          setSkills(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load skills:", err);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const openAddModal = (presetCategory = "frontend/") => {
    setEditingSkill(null);
    setForm({
      category: presetCategory,
      name: "",
      icon: "",
      level: "",
      sort_order: skills.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSkill(s);
    setForm({
      category: s.category || "frontend/",
      name: s.name || "",
      icon: s.icon || detectTechIcon(s.name) || "",
      level: s.level || "",
      sort_order: s.sort_order ?? 0,
    });
    setModalOpen(true);
  };

  const handleNameChange = (newName) => {
    setForm((prev) => {
      const detected = detectTechIcon(newName);
      return {
        ...prev,
        name: newName,
        icon: prev.icon && prev.icon !== detectTechIcon(prev.name) ? prev.icon : detected || prev.icon,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");

    const payload = {
      category: form.category.trim(),
      name: form.name.trim(),
      icon: (form.icon || detectTechIcon(form.name) || "").trim(),
      level: form.level.trim(),
      sort_order: Number(form.sort_order) || 0,
    };

    try {
      if (editingSkill) {
        await portfolioApi.updateSkill(editingSkill.id, payload);
        toast.success(`Updated skill "${payload.name}" successfully!`);
      } else {
        await portfolioApi.createSkill(payload);
        toast.success(`Created skill "${payload.name}" successfully!`);
      }
      setModalOpen(false);
      await loadSkills();
    } catch (err) {
      toast.error("Error saving skill: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: "skills.delete_prompt",
      message: `Are you sure you want to permanently delete "${name}" from your skills stack? This action cannot be undone.`,
      confirmText: "Delete Skill",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await portfolioApi.deleteSkill(id);
      toast.success(`Deleted "${name}" successfully`);
      await loadSkills();
    } catch (err) {
      toast.error("Error deleting skill: " + err.message);
    }
  };

  const handleSeedDefaultStack = async () => {
    const confirmed = await confirm({
      title: "skills.seed_prompt",
      message: "Initialize/restore the 18 default categorized tech stack skills from your reference into Supabase?",
      confirmText: "Initialize Stack",
      variant: "warning",
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      for (const skill of DEFAULT_18_SKILLS) {
        await portfolioApi.createSkill(skill);
      }
      toast.success("Successfully populated 18 skills with official brand icons!");
      await loadSkills();
    } catch (err) {
      toast.error("Error seeding skills: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Grouping & Filtering
  const filteredSkills =
    activeCategoryFilter === "all"
      ? skills
      : skills.filter((s) => s.category === activeCategoryFilter);

  const grouped = skills.reduce((acc, s) => {
    const c = s.category || "other/";
    if (!acc[c]) acc[c] = [];
    acc[c].push(s);
    return acc;
  }, {});

  const sqlMigration = `-- Run this in your Supabase SQL Editor if you want to persist the icon & level columns directly in PostgreSQL:
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS level TEXT DEFAULT '';`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigration);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="admin-container" style={{ maxWidth: 1120 }}>
      {/* Top Header */}
      <div className="admin-card-header" style={{ alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 className="admin-card-title" style={{ fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
            <span>⚡ Skills &amp; Tools Management</span>
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
              Public Section 03
            </span>
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-dim)", fontSize: 13.5 }}>
            Organize your technology stack into clean categories with official vector badge icons.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {statusMsg && (
            <span style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              ✓ {statusMsg}
            </span>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleSeedDefaultStack}
            title="Populate the 18 default skills from reference"
          >
            ⚡ Load 18 Stack Icons
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openAddModal(activeCategoryFilter === "all" ? "frontend/" : activeCategoryFilter)}
          >
            + Add New Skill
          </button>
        </div>
      </div>

      {/* Category Filter Pills & View Toggles */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${activeCategoryFilter === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveCategoryFilter("all")}
          >
            All Skills ({skills.length})
          </button>
          {PRESET_CATEGORIES.map((cat) => {
            const count = grouped[cat.id]?.length || 0;
            return (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm ${activeCategoryFilter === cat.id ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setActiveCategoryFilter(cat.id)}
              >
                {cat.id} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", padding: 3, borderRadius: 6, border: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              background: viewMode === "cards" ? "var(--surface)" : "transparent",
              color: viewMode === "cards" ? "var(--accent-teal)" : "var(--text-dim)",
              border: viewMode === "cards" ? "1px solid var(--border)" : "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Icons Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              background: viewMode === "table" ? "var(--surface)" : "transparent",
              color: viewMode === "table" ? "var(--accent-teal)" : "var(--text-dim)",
              border: viewMode === "table" ? "1px solid var(--border)" : "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Table List
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="admin-card" style={{ padding: 30, textAlign: "center" }}>
          <p style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
            Loading skills and categories...
          </p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="admin-card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", margin: 0 }}>
            No skills found in category <code>{activeCategoryFilter}</code>.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => openAddModal(activeCategoryFilter === "all" ? "frontend/" : activeCategoryFilter)}
            >
              + Add Skill to this Category
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleSeedDefaultStack}>
              Seed 18 Stack Icons
            </button>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* Visual Icon Badges Grid */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {filteredSkills.map((s) => (
            <div
              key={s.id || s.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 14px",
                transition: "transform 0.15s ease, border-color 0.15s ease",
              }}
            >
              <TechIcon icon={s.icon} name={s.name} size={38} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", color: "var(--text)", fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.name}
                </strong>
                <span style={{ fontSize: 11.5, color: "var(--accent-purple)", fontFamily: "var(--font-mono)" }}>
                  {s.category}
                </span>
                {s.level && (
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                    {s.level}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: "3px 8px", fontSize: 11 }}
                  onClick={() => openEditModal(s)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-danger"
                  style={{ padding: "3px 8px", fontSize: 11 }}
                  onClick={() => handleDelete(s.id, s.name)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed Table List */
        <div className="admin-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Icon</th>
                  <th>Skill / Technology</th>
                  <th>Category Folder</th>
                  <th>Level / Role</th>
                  <th>Sort Order</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((s) => (
                  <tr key={s.id || s.name}>
                    <td>
                      <TechIcon icon={s.icon} name={s.name} size={30} />
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>
                      {s.name}
                    </td>
                    <td style={{ color: "var(--accent-purple)", fontFamily: "var(--font-mono)" }}>
                      {s.category}
                    </td>
                    <td style={{ color: "var(--text-dim)", fontSize: 12 }}>
                      {s.level || "—"}
                    </td>
                    <td style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
                      #{s.sort_order}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ marginRight: 6 }}
                        onClick={() => openEditModal(s)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-danger"
                        onClick={() => handleDelete(s.id, s.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supabase Migration SQL Helper */}
      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">🗄️ Supabase Skills Schema Migration</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopySql}>
            {copiedSql ? "✓ Copied!" : "Copy SQL Migration"}
          </button>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: 13, margin: "0 0 10px" }}>
          To persist the icon and level columns directly in PostgreSQL, run this script in your Supabase SQL Editor:
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

      {/* Add / Edit Skill Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 16 }}>
                {editingSkill ? `Edit Skill: ${editingSkill.name}` : "Create New Skill"}
              </h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Live Card Preview */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <TechIcon icon={form.icon || detectTechIcon(form.name)} name={form.name} size={42} />
                  <div>
                    <strong style={{ fontSize: 15, color: "var(--text)", display: "block" }}>
                      {form.name || "Skill / Tech Name"}
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--accent-purple)", fontFamily: "var(--font-mono)" }}>
                      {form.category || "frontend/"}
                    </span>
                    {form.level && (
                      <span style={{ fontSize: 11.5, color: "var(--accent-teal)", display: "block" }}>
                        {form.level}
                      </span>
                    )}
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                    LIVE PREVIEW
                  </span>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="skill_name">
                    Skill / Technology Name <span style={{ color: "var(--accent-amber)" }}>*</span>
                  </label>
                  <input
                    id="skill_name"
                    type="text"
                    className="admin-input"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. React, Node.js, MongoDB, Figma, Unity"
                    required
                  />
                  <span style={{ fontSize: 11.5, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                    Tip: Typing standard names (e.g. HTML5, React, Python) will automatically pick the matching brand icon!
                  </span>
                </div>

                {/* Category Selection */}
                <div className="admin-form-group">
                  <label htmlFor="skill_category">
                    Category Folder <span style={{ color: "var(--accent-amber)" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {PRESET_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.id })}
                        style={{
                          fontSize: 11.5,
                          fontFamily: "var(--font-mono)",
                          padding: "4px 10px",
                          borderRadius: 4,
                          background: form.category === cat.id ? "var(--accent-purple)" : "var(--surface-2)",
                          color: form.category === cat.id ? "#ffffff" : "var(--text-dim)",
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                        }}
                      >
                        {cat.id}
                      </button>
                    ))}
                  </div>
                  <input
                    id="skill_category"
                    type="text"
                    className="admin-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="frontend/, backend/, database/, tools/, design/"
                    required
                  />
                </div>

                {/* Visual Icon Preset Picker */}
                <div className="admin-form-group">
                  <label>Select Icon Badge from Presets</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
                      gap: 8,
                      maxHeight: 160,
                      overflowY: "auto",
                      background: "var(--surface-2)",
                      padding: 10,
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {TECH_ICON_PRESETS.map((preset) => {
                      const isSelected = (form.icon || "").toLowerCase() === preset.key;
                      return (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setForm({ ...form, icon: preset.key })}
                          title={`${preset.name} (${preset.key})`}
                          style={{
                            padding: 2,
                            background: "transparent",
                            border: isSelected ? "2px solid var(--accent-amber)" : "1px solid transparent",
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transform: isSelected ? "scale(1.1)" : "none",
                            transition: "transform 0.15s ease",
                          }}
                        >
                          <TechIcon icon={preset.key} size={32} />
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="Or enter icon key (e.g. react, nodejs) or image URL (https://...)"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
                  <div className="admin-form-group">
                    <label htmlFor="skill_level">Proficiency / Role (Optional)</label>
                    <input
                      id="skill_level"
                      type="text"
                      className="admin-input"
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      placeholder="e.g. Core, Advanced, 3+ Years"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="skill_sort_order">Display Sort Order</label>
                    <input
                      id="skill_sort_order"
                      type="number"
                      className="admin-input"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingSkill ? "Save Changes" : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
