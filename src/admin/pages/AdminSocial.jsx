import { useEffect, useState } from "react";
import { portfolioApi } from "../../api/portfolioApi";
import SocialIcon from "../../components/SocialIcon";
import { SOCIAL_PLATFORMS, resolveSocialIcon } from "../../utils/socialIconsData";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/useToast";
import { usePortfolio } from "../../context/usePortfolio";

const CATEGORIES = [
  { value: "developer", label: "Developer Profile" },
  { value: "professional", label: "Professional" },
  { value: "direct", label: "Direct Contact" },
  { value: "social", label: "Social & Community" },
  { value: "media", label: "Media & Streaming" },
  { value: "design", label: "Design Portfolio" },
  { value: "web", label: "Website / Other" },
];

export default function AdminSocial() {
  const toast = useToast();
  const { refreshSocialLinks } = usePortfolio();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'hidden'
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [form, setForm] = useState({
    platform: "github",
    title: "GitHub",
    url: "",
    display_value: "",
    category: "developer",
    sort_order: 1,
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadLinks = async () => {
    try {
      const res = await portfolioApi.getSocialLinks({ all: true });
      if (res?.data) {
        setLinks(res.data);
      }
      if (typeof refreshSocialLinks === "function") {
        refreshSocialLinks();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    portfolioApi
      .getSocialLinks({ all: true })
      .then((res) => {
        if (active) {
          setLinks(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setErrorMsg(err.message || "Failed to load links");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);


  const handleOpenAdd = () => {
    setEditingLink(null);
    const nextOrder = links.length > 0 ? Math.max(...links.map((l) => Number(l.sort_order) || 0)) + 1 : 1;
    setForm({
      platform: "github",
      title: "GitHub",
      url: "",
      display_value: "",
      category: "developer",
      sort_order: nextOrder,
      is_active: true,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingLink(item);
    setForm({
      platform: resolveSocialIcon(item.platform, item.url, item.title),
      title: item.title || "",
      url: item.url || "",
      display_value: item.display_value || "",
      category: item.category || "social",
      sort_order: Number(item.sort_order) || 1,
      is_active: item.is_active !== false,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSelectPlatform = (platformMeta) => {
    setForm((prev) => {
      const nextTitle = editingLink ? prev.title : platformMeta.label;
      const nextCategory = editingLink ? prev.category : platformMeta.defaultCategory;
      return {
        ...prev,
        platform: platformMeta.key,
        title: nextTitle,
        category: nextCategory,
      };
    });
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setForm((prev) => {
      // Auto-compute display value if empty or was matching previous URL
      const currentClean = prev.url ? prev.url.replace(/^https?:\/\//i, "").replace(/\/$/, "") : "";
      const shouldAutoFill = !prev.display_value || prev.display_value === currentClean;
      const newDisplay = shouldAutoFill
        ? val.replace(/^https?:\/\//i, "").replace(/^mailto:/i, "").replace(/\/$/, "")
        : prev.display_value;

      // Auto-detect platform icon if currently generic
      const detectedIcon = resolveSocialIcon(prev.platform, val, prev.title);

      return {
        ...prev,
        url: val,
        display_value: newDisplay,
        platform: prev.platform === "globe" && detectedIcon !== "globe" ? detectedIcon : prev.platform,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.trim()) {
      setErrorMsg("Target URL or email address is required.");
      toast.warning("Target URL or email address is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        platform: form.platform,
        title: form.title.trim() || form.platform,
        url: form.url.trim(),
        display_value: form.display_value.trim() || form.url.trim().replace(/^https?:\/\//i, ""),
        category: form.category,
        sort_order: Number(form.sort_order) || 1,
        is_active: Boolean(form.is_active),
      };

      if (editingLink) {
        await portfolioApi.updateSocialLink(editingLink.id, payload);
        const msg = `"${payload.title}" link updated successfully!`;
        setSuccessMsg(msg);
        toast.success(msg);
      } else {
        await portfolioApi.createSocialLink(payload);
        const msg = `"${payload.title}" link created successfully!`;
        setSuccessMsg(msg);
        toast.success(msg);
      }

      setModalOpen(false);
      await loadLinks();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Save error:", err);
      const errMsg = err.message || "Failed to save social link.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const nextVal = !item.is_active;
      // Optimistic update
      setLinks((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, is_active: nextVal } : l))
      );

      await portfolioApi.toggleStatusSocialLink(item.id, nextVal);
      const msg = `"${item.title}" is now ${nextVal ? "active & visible" : "hidden"}`;
      setSuccessMsg(msg);
      toast.success(msg);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Status toggle error:", err);
      setErrorMsg("Failed to update status. Reverting...");
      toast.error("Failed to update status. Reverting...");
      await loadLinks();
      setTimeout(() => setErrorMsg(""), 3500);
    }
  };

  const handleOpenDelete = (item) => {
    setLinkToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    setDeleting(true);
    try {
      await portfolioApi.deleteSocialLink(linkToDelete.id);
      const msg = `"${linkToDelete.title}" deleted.`;
      setSuccessMsg(msg);
      toast.success(msg);
      setDeleteModalOpen(false);
      setLinkToDelete(null);
      await loadLinks();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      const errMsg = err.message || "Failed to delete link.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setDeleting(false);
    }
  };

  // Filter links
  const filteredLinks = links.filter((l) => {
    if (statusFilter === "active" && l.is_active === false) return false;
    if (statusFilter === "hidden" && l.is_active !== false) return false;
    if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
    return true;
  });

  const activeCount = links.filter((l) => l.is_active !== false).length;
  const hiddenCount = links.filter((l) => l.is_active === false).length;

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-card-header" style={{ alignItems: "flex-start", gap: 16 }}>
        <div>
          <h2 className="admin-card-title">
            <span>🌐 Social &amp; Contact Links</span>
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Manage social channels, developer profiles, and direct contact handles for the public{" "}
            <strong style={{ color: "var(--accent-teal)" }}>contact.config.json</strong> card.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <span>+ Add Social Link</span>
        </button>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div
          style={{
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid var(--accent-rose)",
            color: "var(--accent-rose)",
            padding: "10px 16px",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
            fontFamily: "var(--font-mono)",
          }}
        >
          ⚠ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: "rgba(45, 212, 191, 0.12)",
            border: "1px solid var(--accent-teal)",
            color: "var(--accent-teal)",
            padding: "10px 16px",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
            fontFamily: "var(--font-mono)",
          }}
        >
          ✓ {successMsg}
        </div>
      )}

      {/* Control Bar: Filter Tabs & Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({links.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "active" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStatusFilter("active")}
            style={
              statusFilter === "active"
                ? { background: "var(--accent-teal)", color: "#000" }
                : {}
            }
          >
            ● Active ({activeCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === "hidden" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStatusFilter("hidden")}
          >
            ○ Hidden ({hiddenCount})
          </button>
        </div>

        {/* Category Dropdown Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
            Category:
          </span>
          <select
            className="admin-input"
            style={{ width: "auto", padding: "4px 10px", fontSize: 12.5 }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Links Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            Loading social links...
          </div>
        ) : filteredLinks.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", margin: "0 0 16px" }}>
              No social links found for this filter.
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              + Add First Social Link
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 48, textAlign: "center" }}>#</th>
                  <th style={{ width: 150 }}>Platform</th>
                  <th>Display Value &amp; Destination</th>
                  <th style={{ width: 110 }}>Category</th>
                  <th style={{ width: 95, textAlign: "center" }}>Status</th>
                  <th style={{ width: 120, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((item) => {
                  const iconKey = resolveSocialIcon(item.platform, item.url, item.title);
                  return (
                    <tr key={item.id}>
                      {/* Order */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11.5,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "var(--surface-2)",
                            color: "var(--text-dim)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          #{item.sort_order || 1}
                        </span>
                      </td>

                      {/* Platform & SVG Icon */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: "rgba(45, 212, 191, 0.08)",
                              border: "1px solid rgba(45, 212, 191, 0.25)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--accent-teal)",
                              flexShrink: 0,
                            }}
                          >
                            <SocialIcon platform={item.platform} url={item.url} size={16} />
                          </div>
                          <div style={{ minWidth: 0, overflow: "hidden" }}>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "var(--text)",
                                fontSize: 13,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                color: "var(--accent-purple)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              "{item.platform || iconKey}"
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Combined Display String & Target URL */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 12.5,
                              color: "var(--accent-teal)",
                              background: "var(--surface-2)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              border: "1px solid var(--border)",
                              display: "inline-block",
                              width: "fit-content",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            "{item.display_value}"
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11.5,
                              color: "var(--text-dim)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              textDecoration: "none",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-amber)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
                            title={item.url}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.url}</span>
                            <span style={{ fontSize: 10, color: "var(--accent-teal)", flexShrink: 0 }}>↗</span>
                          </a>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            color: "var(--text-dim)",
                            textTransform: "capitalize",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.category || "social"}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="btn btn-ghost btn-sm"
                          style={{
                            padding: "2px 8px",
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            borderRadius: 999,
                            borderColor: item.is_active !== false ? "rgba(45, 212, 191, 0.4)" : "var(--border)",
                            background: item.is_active !== false ? "rgba(45, 212, 191, 0.1)" : "var(--surface-2)",
                            color: item.is_active !== false ? "var(--accent-teal)" : "var(--text-dim)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            whiteSpace: "nowrap",
                          }}
                          title={`Click to ${item.is_active !== false ? "hide" : "activate"} on public site`}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: item.is_active !== false ? "var(--accent-teal)" : "var(--text-dim)",
                            }}
                          />
                          <span>{item.is_active !== false ? "Active" : "Hidden"}</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 5, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit this link"
                            style={{ padding: "3px 8px", fontSize: 11.5 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenDelete(item)}
                            style={{ color: "var(--accent-rose)", borderColor: "transparent", padding: "3px 8px", fontSize: 11.5 }}
                            title="Delete this link"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setModalOpen(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 680, width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingLink ? `Edit "${editingLink.title}"` : "Add New Social / Contact Link"}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => !saving && setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {errorMsg && (
                  <div
                    style={{
                      background: "rgba(244, 63, 94, 0.12)",
                      border: "1px solid var(--accent-rose)",
                      color: "var(--accent-rose)",
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ⚠ {errorMsg}
                  </div>
                )}

                {/* Visual SVG Platform Picker */}
                <div className="admin-form-group">
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Choose Platform Vector SVG Icon</span>
                    <span style={{ fontSize: 11, color: "var(--accent-teal)", fontFamily: "var(--font-mono)" }}>
                      Selected: {form.platform}
                    </span>
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(105px, 1fr))",
                      gap: 8,
                      maxHeight: 180,
                      overflowY: "auto",
                      background: "var(--surface-2)",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {SOCIAL_PLATFORMS.map((p) => {
                      const isSelected = form.platform === p.key;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => handleSelectPlatform(p)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 10px",
                            borderRadius: 6,
                            background: isSelected ? "rgba(45, 212, 191, 0.15)" : "var(--surface)",
                            border: `1px solid ${isSelected ? "var(--accent-teal)" : "var(--border)"}`,
                            color: isSelected ? "var(--accent-teal)" : "var(--text)",
                            cursor: "pointer",
                            fontSize: 12,
                            fontFamily: "var(--font-mono)",
                            textAlign: "left",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <SocialIcon platform={p.key} size={16} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Row 1: Title & Key */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
                  <div className="admin-form-group">
                    <label htmlFor="soc_title">Platform Title *</label>
                    <input
                      id="soc_title"
                      type="text"
                      className="admin-input"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. GitHub, LinkedIn, Email"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="soc_platform">
                      Config Key Label (e.g. "github")
                    </label>
                    <input
                      id="soc_platform"
                      type="text"
                      className="admin-input"
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value.toLowerCase().trim() })}
                      placeholder="github, linkedin, email..."
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Target URL & Display Value */}
                <div className="admin-form-group">
                  <label htmlFor="soc_url">Target URL or Mailto *</label>
                  <input
                    id="soc_url"
                    type="text"
                    className="admin-input"
                    value={form.url}
                    onChange={handleUrlChange}
                    placeholder="https://github.com/YourUsername or mailto:you@gmail.com"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="soc_display">
                    Display String (Rendered inside quotes on public Contact card)
                  </label>
                  <input
                    id="soc_display"
                    type="text"
                    className="admin-input"
                    value={form.display_value}
                    onChange={(e) => setForm({ ...form, display_value: e.target.value })}
                    placeholder="e.g. github.com/YourUsername"
                  />
                </div>

                {/* Row 3: Category & Sort Order */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
                  <div className="admin-form-group">
                    <label htmlFor="soc_category">Category</label>
                    <select
                      id="soc_category"
                      className="admin-input"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="soc_order">Display Sort Order</label>
                    <input
                      id="soc_order"
                      type="number"
                      min={1}
                      className="admin-input"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "var(--surface-2)",
                    padding: "10px 14px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                  }}
                >
                  <input
                    type="checkbox"
                    id="soc_is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label htmlFor="soc_is_active" style={{ cursor: "pointer", margin: 0, fontSize: 13, color: "var(--text)" }}>
                    <strong>Active on Public Website</strong> (Visible in contact.config.json card)
                  </label>
                </div>

                {/* Real-Time Live Preview of contact.config.json line */}
                <div
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
                    // Live contact.config.json preview:
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                    <SocialIcon platform={form.platform} url={form.url} size={16} />
                    <span style={{ color: "var(--accent-purple)" }}>"{form.platform || "key"}"</span>:{" "}
                    <span style={{ color: "var(--accent-teal)" }}>
                      "{form.display_value || form.url || "handle"}"
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingLink ? "Update Social Link" : "Create Social Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Social Link"
        message={`Are you sure you want to permanently delete "${linkToDelete?.title}" (${linkToDelete?.display_value})? This link will no longer appear on the public contact section.`}
        confirmText="Delete Link"
        cancelText="Keep"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteModalOpen(false)}
      />
    </div>
  );
}
