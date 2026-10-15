import { useEffect, useState } from "react";
import { portfolioApi } from "../../api/portfolioApi";
import ServiceIcon from "../../components/ServiceIcon";
import { SERVICE_ICONS, resolveServiceIcon } from "../../utils/serviceIconsData";
import { useToast } from "../context/useToast";
import { useConfirm } from "../context/useConfirm";

export default function AdminServices() {
  const toast = useToast();
  const confirm = useConfirm();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'unpublished'

  const [form, setForm] = useState({
    command: "run website-development",
    icon: "globe",
    title: "",
    description: "",
    deliverables: "Custom Web Apps, Performance & SEO, Clean Codebase",
    sort_order: 1,
    is_published: true,
  });

  const loadServices = async () => {
    try {
      const res = await portfolioApi.getServices({ all: true });
      setServices(res.data || []);
    } catch (err) {
      console.error("Failed to load services:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    portfolioApi
      .getServices({ all: true })
      .then((res) => {
        if (active) {
          setServices(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load services:", err.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setForm({
      command: "run website-development",
      icon: "globe",
      title: "",
      description: "",
      deliverables: "Custom Web Apps, Performance & SEO, Clean Codebase",
      sort_order: services.length + 1,
      is_published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    const deliverablesStr = Array.isArray(srv.deliverables)
      ? srv.deliverables.join(", ")
      : typeof srv.deliverables === "string"
      ? srv.deliverables
      : "";

    setForm({
      command: srv.command || `run ${srv.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      icon: resolveServiceIcon(srv.icon, srv.title),
      title: srv.title || "",
      description: srv.description || srv.desc || "",
      deliverables: deliverablesStr,
      sort_order: srv.sort_order ?? 0,
      is_published: srv.is_published !== false,
    });
    setModalOpen(true);
  };

  const handleTitleChange = (val) => {
    const slug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    setForm((prev) => ({
      ...prev,
      title: val,
      // Auto-suggest command if adding new service or if command was auto-generated
      command: editingService ? prev.command : `run ${slug || "service"}`,
      // Auto-suggest icon if icon hasn't been explicitly selected
      icon: editingService ? prev.icon : resolveServiceIcon(prev.icon, val),
    }));
  };

  const handleTogglePublish = async (srv) => {
    const nextVal = srv.is_published === false;

    // Immediate optimistic local update
    setServices((prev) =>
      prev.map((s) => (String(s.id) === String(srv.id) ? { ...s, is_published: nextVal } : s))
    );

    try {
      await portfolioApi.togglePublishService(srv.id, nextVal);
      toast.success(`"${srv.title}" is now ${nextVal ? "PUBLISHED (live on public website)" : "UNPUBLISHED (hidden draft)"}!`);
      loadServices();
    } catch {
      try {
        await portfolioApi.updateService(srv.id, {
          ...srv,
          is_published: nextVal,
        });
        toast.success(`"${srv.title}" is now ${nextVal ? "PUBLISHED (live on public website)" : "UNPUBLISHED (hidden draft)"}!`);
        loadServices();
      } catch (err) {
        toast.error(`Failed to update publication status: ${err.message}`);
        loadServices();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const deliverablesArray = form.deliverables
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      deliverables: deliverablesArray,
      sort_order: Number(form.sort_order) || 0,
      is_published: Boolean(form.is_published),
    };

    try {
      if (editingService) {
        await portfolioApi.updateService(editingService.id, payload);
      } else {
        await portfolioApi.createService(payload);
      }
      setModalOpen(false);
      loadServices();
      toast.success(`Service "${form.title}" saved successfully!`);
    } catch (err) {
      toast.error("Error saving service: " + err.message);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: "services.delete_prompt",
      message: `Are you sure you want to permanently delete service "${title}"? This will remove it from the public website.`,
      confirmText: "Delete Service",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await portfolioApi.deleteService(id);
      loadServices();
      toast.success(`Service "${title}" deleted.`);
    } catch (err) {
      toast.error("Error deleting service: " + err.message);
    }
  };

  const filteredServices =
    statusFilter === "all"
      ? services
      : statusFilter === "published"
      ? services.filter((s) => s.is_published !== false)
      : services.filter((s) => s.is_published === false);

  const parsedDeliverableTags = form.deliverables
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">💼 Services &amp; Capabilities</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-dim)", fontSize: 13 }}>
            Manage software engineering offerings, terminal commands, vector SVG icons, deliverables, and public visibility.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + New Service
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("all")}
        >
          All ({services.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "published" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("published")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
          Published ({services.filter((s) => s.is_published !== false).length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "unpublished" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("unpublished")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
          Unpublished ({services.filter((s) => s.is_published === false).length})
        </button>
      </div>

      {/* Services Table Card */}
      <div className="admin-card">
        {loading ? (
          <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            Loading services...
          </p>
        ) : filteredServices.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            No services found matching this filter. Click "+ New Service" to create one.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Icon</th>
                  <th>Visibility</th>
                  <th>Title &amp; Deliverables</th>
                  <th>Terminal Command</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((srv) => {
                  const isPublished = srv.is_published !== false;
                  const deliverables = Array.isArray(srv.deliverables)
                    ? srv.deliverables
                    : typeof srv.deliverables === "string" && srv.deliverables
                    ? srv.deliverables.split(",").map((s) => s.trim()).filter(Boolean)
                    : [];

                  return (
                    <tr key={srv.id}>
                      <td style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
                        #{srv.sort_order}
                      </td>
                      <td>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: "rgba(45, 212, 191, 0.08)",
                            border: "1px solid rgba(45, 212, 191, 0.25)",
                            color: "var(--accent-teal)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title={`Icon: ${resolveServiceIcon(srv.icon, srv.title)}`}
                        >
                          <ServiceIcon icon={srv.icon} title={srv.title} size={18} />
                        </div>
                      </td>
                      <td>
                        {isPublished ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 999,
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#34d399",
                              border: "1px solid rgba(16, 185, 129, 0.35)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              letterSpacing: "0.4px",
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
                            PUBLISHED
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 9px",
                              borderRadius: 999,
                              background: "rgba(245, 158, 11, 0.15)",
                              color: "#fbbf24",
                              border: "1px solid rgba(245, 158, 11, 0.35)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              letterSpacing: "0.4px",
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
                            UNPUBLISHED
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{srv.title}</div>
                        {deliverables.length > 0 && (
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                            {deliverables.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: 10.5,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: "rgba(255, 255, 255, 0.05)",
                                  color: "var(--text-dim)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                            {deliverables.length > 3 && (
                              <span style={{ fontSize: 10.5, color: "var(--text-dim)" }}>
                                +{deliverables.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ color: "var(--accent-teal)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        <span style={{ color: "var(--gutter)" }}>➜ ~ npm </span>
                        {srv.command}
                      </td>
                      <td
                        style={{
                          maxWidth: 240,
                          color: "var(--text-dim)",
                          fontSize: 12.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={srv.description}
                      >
                        {srv.description}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {/* Publish / Unpublish Action Button */}
                        {isPublished ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{
                              marginRight: 6,
                              fontSize: 11.5,
                              color: "#fbbf24",
                              border: "1px solid rgba(245, 158, 11, 0.35)",
                              background: "rgba(245, 158, 11, 0.06)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 8px",
                            }}
                            onClick={() => handleTogglePublish(srv)}
                            title="Unpublish this service (hide from public visitors)"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{
                              marginRight: 6,
                              fontSize: 11.5,
                              color: "#34d399",
                              border: "1px solid rgba(16, 185, 129, 0.4)",
                              background: "rgba(16, 185, 129, 0.12)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 8px",
                              fontWeight: 600,
                            }}
                            onClick={() => handleTogglePublish(srv)}
                            title="Publish this service (make live on website)"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ marginRight: 6 }}
                          onClick={() => openEditModal(srv)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-danger"
                          onClick={() => handleDelete(srv.id, srv.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT SERVICE MODAL */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 620, width: "95%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 16 }}>
                {editingService ? `Edit Service: ${editingService.title}` : "Add New Service Offering"}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Title & Command Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="admin-form-group">
                    <label>Service Title *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Website Development"
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Terminal Command (after npm ...)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.command}
                      onChange={(e) => setForm({ ...form, command: e.target.value })}
                      placeholder="run website-development"
                      required
                      style={{ width: "100%", fontFamily: "var(--font-mono)", color: "var(--accent-teal)" }}
                    />
                  </div>
                </div>

                {/* SVG Icon Selector Gallery */}
                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ margin: 0 }}>Vector SVG Icon *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Active:</span>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "rgba(45, 212, 191, 0.12)",
                          padding: "2px 8px",
                          borderRadius: 6,
                          border: "1px solid rgba(45, 212, 191, 0.3)",
                          color: "var(--accent-teal)",
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <ServiceIcon icon={form.icon} size={15} />
                        <span>{resolveServiceIcon(form.icon)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Curated SVG Icons Grid Picker */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                      gap: 8,
                      maxHeight: 140,
                      overflowY: "auto",
                      padding: "8px",
                      background: "rgba(0, 0, 0, 0.15)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {SERVICE_ICONS.map((item) => {
                      const isSelected = resolveServiceIcon(form.icon) === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setForm({ ...form, icon: item.key })}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 6px",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: isSelected ? "rgba(45, 212, 191, 0.18)" : "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${isSelected ? "var(--accent-teal)" : "rgba(255, 255, 255, 0.08)"}`,
                            color: isSelected ? "var(--accent-teal)" : "var(--text-dim)",
                            transition: "all 0.18s ease",
                          }}
                          title={item.label}
                        >
                          <ServiceIcon icon={item.key} size={20} />
                          <span style={{ fontSize: 10, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                            {item.key}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Deliverables & Capabilities Tags */}
                <div className="admin-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ margin: 0 }}>Deliverables / Capability Tags (comma-separated)</label>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Renders pills on public card</span>
                  </div>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.deliverables}
                    onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                    placeholder="Custom Web Apps, Performance & SEO, Clean Codebase"
                    style={{ width: "100%" }}
                  />

                  {/* Live tag preview */}
                  {parsedDeliverableTags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {parsedDeliverableTags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "rgba(45, 212, 191, 0.1)",
                            color: "var(--accent-teal)",
                            border: "1px solid rgba(45, 212, 191, 0.25)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          › {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Service Description */}
                <div className="admin-form-group">
                  <label>Service Description *</label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Clear description of the engineering service, delivery scope, and architecture..."
                    required
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>

                {/* Publication Status & Sort Order */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 14 }}>
                  <div className="admin-form-group">
                    <label>Publication Visibility</label>
                    <select
                      className="admin-input"
                      value={form.is_published ? "published" : "unpublished"}
                      onChange={(e) => setForm({ ...form, is_published: e.target.value === "published" })}
                      style={{
                        width: "100%",
                        borderColor: form.is_published ? "rgba(16, 185, 129, 0.45)" : "rgba(245, 158, 11, 0.45)",
                        color: form.is_published ? "#34d399" : "#fbbf24",
                        fontWeight: 600,
                      }}
                    >
                      <option value="published">🟢 Published (Live on Website)</option>
                      <option value="unpublished">⚪ Unpublished (Draft / Hidden)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
