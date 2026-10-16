import { useEffect, useState } from "react";
import { portfolioApi } from "../../api/portfolioApi";
import ProjectTracker from "../../components/ProjectTracker";
import { useToast } from "../context/useToast";
import { useConfirm } from "../context/useConfirm";
import { usePortfolio } from "../../context/usePortfolio";

const DEFAULT_TRACKING = {
  milestone_title: "47 days until next preview build",
  milestone_date: "Nov 30th",
  milestone_progress: 55,
  last_build: "Sep 30th",
  section_title: "Development Sprint - 86%",
  total_tasks_label: "670 Tasks",
  changes_last_24h: "22 Changes in last 24hrs",
  items: [
    { name: "Frontend / UI", current: 196, total: 197, unit: "%", color: "slate" },
    { name: "Backend / API", current: 119, total: 131, unit: "%", color: "steel" },
    { name: "Database & Storage", current: 84, total: 87, unit: "%", color: "zinc" },
    { name: "Core Features & Code", current: 181, total: 255, unit: "%", color: "charcoal" },
    { name: "Testing & Bug Fixes", current: 0, total: 0, unit: "Fixed", color: "silver" },
  ],
};

export default function AdminProjects() {
  const toast = useToast();
  const confirm = useConfirm();
  const { refreshProjects } = usePortfolio();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [syncingGithub, setSyncingGithub] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'ongoing' | 'completed'

  const [form, setForm] = useState({
    name: "",
    commit_hash: "",
    description: "",
    stack: "",
    github_url: "",
    demo_url: "",
    status: "ongoing", // 'ongoing' | 'completed'
    is_published: true, // true (published) | false (unpublished / draft)
    start_date: "",
    end_date: "",
    images: [],
    demo_video_url: "",
    tracking_data: { ...DEFAULT_TRACKING },
    contributors: [],
    auto_sync_github: false,
    sort_order: 1,
  });
  const [newContributorUsername, setNewContributorUsername] = useState("");
  const [fetchingContributor, setFetchingContributor] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await portfolioApi.getProjects({ all: true });
      setProjects(res.data || []);
      if (typeof refreshProjects === "function") {
        refreshProjects();
      }
    } catch (err) {
      console.error("Failed to load projects:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    portfolioApi
      .getProjects({ all: true })
      .then((res) => {
        if (active) {
          setProjects(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load projects:", err.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setNewImageUrl("");
    setNewContributorUsername("");
    setForm({
      name: "",
      commit_hash: Math.random().toString(16).substring(2, 8),
      description: "",
      stack: "React, Node.js, MongoDB, Tailwind CSS",
      github_url: "",
      demo_url: "#",
      status: "ongoing",
      is_published: true,
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      images: [],
      demo_video_url: "",
      tracking_data: JSON.parse(JSON.stringify(DEFAULT_TRACKING)),
      contributors: [],
      auto_sync_github: false,
      sort_order: projects.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setNewImageUrl("");
    setNewContributorUsername("");
    setForm({
      name: proj.name || "",
      commit_hash: proj.commit_hash || "",
      description: proj.description || "",
      stack: Array.isArray(proj.stack) ? proj.stack.join(", ") : "",
      github_url: proj.github_url || "",
      demo_url: proj.demo_url || "#",
      status: proj.status || "completed",
      is_published: proj.is_published !== false,
      start_date: proj.start_date || "",
      end_date: proj.end_date || "",
      images: Array.isArray(proj.images) ? [...proj.images] : [],
      demo_video_url: proj.demo_video_url || "",
      tracking_data:
        proj.tracking_data && Object.keys(proj.tracking_data).length > 0
          ? JSON.parse(JSON.stringify(proj.tracking_data))
          : JSON.parse(JSON.stringify(DEFAULT_TRACKING)),
      contributors: Array.isArray(proj.contributors) ? [...proj.contributors] : [],
      auto_sync_github: Boolean(proj.auto_sync_github),
      sort_order: proj.sort_order ?? 0,
    });
    setModalOpen(true);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setForm({
      ...form,
      images: [...form.images, newImageUrl.trim()],
    });
    setNewImageUrl("");
  };

  const handleRemoveImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddContributor = async () => {
    const raw = newContributorUsername.trim().replace(/^@/, "");
    if (!raw) return;

    if (form.contributors?.some((c) => (c.username || c.login)?.toLowerCase() === raw.toLowerCase())) {
      toast.warning("This contributor is already added.");
      return;
    }

    setFetchingContributor(true);
    try {
      const res = await fetch(`https://api.github.com/users/${raw}`);
      if (res.ok) {
        const u = await res.json();
        const newContrib = {
          username: u.login,
          name: u.name || u.login,
          avatar_url: u.avatar_url,
          html_url: u.html_url,
          contributions: 1,
        };
        setForm((prev) => ({
          ...prev,
          contributors: [...(prev.contributors || []), newContrib],
        }));
        setNewContributorUsername("");
      } else {
        const fallbackContrib = {
          username: raw,
          name: raw,
          avatar_url: `https://avatars.githubusercontent.com/${raw}`,
          html_url: `https://github.com/${raw}`,
          contributions: 1,
        };
        setForm((prev) => ({
          ...prev,
          contributors: [...(prev.contributors || []), fallbackContrib],
        }));
        setNewContributorUsername("");
      }
    } catch {
      const fallbackContrib = {
        username: raw,
        name: raw,
        avatar_url: `https://avatars.githubusercontent.com/${raw}`,
        html_url: `https://github.com/${raw}`,
        contributions: 1,
      };
      setForm((prev) => ({
        ...prev,
        contributors: [...(prev.contributors || []), fallbackContrib],
      }));
      setNewContributorUsername("");
    } finally {
      setFetchingContributor(false);
    }
  };

  const handleRemoveContributor = (index) => {
    setForm((prev) => ({
      ...prev,
      contributors: prev.contributors.filter((_, i) => i !== index),
    }));
  };

  const handleFetchRepoContributors = async () => {
    if (!form.github_url || !form.github_url.includes("github.com/")) {
      toast.warning("Please enter a valid GitHub repository URL first.");
      return;
    }
    const clean = form.github_url.trim().replace(/\.git$/, "");
    const parts = clean.split("github.com/")[1]?.split("/");
    if (!parts || parts.length < 2) {
      toast.error("Invalid GitHub repository URL (expected https://github.com/owner/repo)");
      return;
    }

    setFetchingContributor(true);
    toast.info("Fetching contributors from GitHub repository...");
    try {
      const res = await fetch(`https://api.github.com/repos/${parts[0]}/${parts[1]}/contributors?per_page=12`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((c) => ({
            username: c.login,
            name: c.login,
            avatar_url: c.avatar_url,
            html_url: c.html_url,
            contributions: c.contributions,
          }));
          setForm((prev) => ({
            ...prev,
            contributors: mapped,
          }));
          toast.success(`Loaded ${mapped.length} contributors from GitHub repository!`);
        } else {
          toast.warning("No public contributors returned for this repository.");
        }
      } else {
        toast.error("Could not fetch repo contributors (check repository URL or GitHub rate limits).");
      }
    } catch (err) {
      toast.error("GitHub error: " + err.message);
    } finally {
      setFetchingContributor(false);
    }
  };

  const handleToggleAutoSync = async () => {
    const nextVal = !form.auto_sync_github;
    setForm((prev) => ({ ...prev, auto_sync_github: nextVal }));

    if (nextVal) {
      if (!form.github_url || !form.github_url.includes("github.com/")) {
        toast.warning("Auto-Sync enabled! Please provide a GitHub URL so commits sync automatically.");
        return;
      }

      setSyncingGithub(true);
      toast.info("Auto-Sync enabled! Performing live synchronization with GitHub...");
      try {
        let stats = null;
        let fetchedContributors = null;

        if (editingProject?.id) {
          const res = await portfolioApi.syncProjectGithub(editingProject.id, {
            github_url: form.github_url,
            end_date: form.end_date,
          });
          if (res.data?.stats) {
            stats = res.data.stats;
            fetchedContributors = res.data.contributors;
          } else {
            stats = res.data;
          }
        } else {
          // Direct client sync via GitHub API if not saved yet
          const clean = form.github_url.trim().replace(/\.git$/, "");
          const parts = clean.split("github.com/")[1]?.split("/");
          if (parts && parts.length >= 2) {
            const commitsRes = await fetch(`https://api.github.com/repos/${parts[0]}/${parts[1]}/commits?per_page=1`);
            if (commitsRes.ok) {
              const commits = await commitsRes.json();
              if (commits?.[0]?.sha) {
                setForm((prev) => ({
                  ...prev,
                  commit_hash: commits[0].sha.substring(0, 7),
                }));
              }
            }

            const repoRes = await fetch(`https://api.github.com/repos/${parts[0]}/${parts[1]}`);
            if (repoRes.ok) {
              const rd = await repoRes.json();
              stats = {
                milestone_title: form.end_date ? `Tracking toward ${form.end_date}` : "Sprint in progress",
                milestone_date: form.end_date || "Target Date",
                milestone_progress: 65,
                last_build: rd.pushed_at ? new Date(rd.pushed_at).toDateString().slice(4, 10) : "Recent",
                section_title: `Repo Progress - 82%`,
                total_tasks_label: `${rd.size || 250} Tasks`,
                changes_last_24h: "Recent commits tracked",
                items: [
                  { name: "Frontend / UI", current: 95, total: 100, unit: "%", color: "slate" },
                  { name: "Backend / API", current: 85, total: 90, unit: "%", color: "steel" },
                  { name: "Database & Storage", current: 30, total: 32, unit: "%", color: "zinc" },
                  { name: "Core Features & Code", current: 150, total: 200, unit: "%", color: "charcoal" },
                  { name: "Testing & Bug Fixes", current: rd.open_issues_count || 0, total: (rd.open_issues_count || 0) + 1, unit: "Fixed", color: "silver" },
                ],
              };
            }
          }
        }

        if (stats) {
          setForm((prev) => ({
            ...prev,
            tracking_data: stats,
            contributors: fetchedContributors && fetchedContributors.length > 0 ? fetchedContributors : prev.contributors,
          }));
          toast.success("Auto-Sync is now ACTIVE! Metrics & commits will automatically reflect on public cards.");
        } else {
          toast.info("Auto-Sync enabled. GitHub metrics will automatically refresh on next commit.");
        }
      } catch (err) {
        toast.warning("Auto-Sync enabled. Sync notice: " + err.message);
      } finally {
        setSyncingGithub(false);
      }
    } else {
      toast.info("Auto-Sync disabled. Manual performance editing is now enabled.");
    }
  };

  const handleUpdateTaskItem = (index, field, value) => {
    const updatedItems = [...(form.tracking_data.items || [])];
    if (updatedItems[index]) {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === "current" || field === "total" ? Number(value) || 0 : value,
      };
      setForm({
        ...form,
        tracking_data: {
          ...form.tracking_data,
          items: updatedItems,
        },
      });
    }
  };

  const handleAddTaskItem = () => {
    const newItem = {
      name: "New Task Area",
      current: 50,
      total: 100,
      unit: "%",
      color: "slate",
    };
    setForm((prev) => ({
      ...prev,
      tracking_data: {
        ...prev.tracking_data,
        items: [...(prev.tracking_data?.items || []), newItem],
      },
    }));
  };

  const handleRemoveTaskItem = (index) => {
    setForm((prev) => ({
      ...prev,
      tracking_data: {
        ...prev.tracking_data,
        items: (prev.tracking_data?.items || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      is_published: form.is_published !== false,
      auto_sync_github: Boolean(form.auto_sync_github),
      stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean),
      sort_order: Number(form.sort_order),
      contributors: Array.isArray(form.contributors) ? form.contributors : [],
    };

    try {
      if (editingProject) {
        await portfolioApi.updateProject(editingProject.id, payload);
        toast.success(`Project "${payload.name}" updated successfully!`);
      } else {
        await portfolioApi.createProject(payload);
        toast.success(`Project "${payload.name}" created successfully!`);
      }
      setModalOpen(false);
      loadProjects();
    } catch (err) {
      toast.error("Error saving project: " + err.message);
    }
  };

  const handleTogglePublish = async (proj) => {
    const nextVal = proj.is_published === false;

    // Immediate optimistic local update
    setProjects((prev) =>
      prev.map((p) => (String(p.id) === String(proj.id) ? { ...p, is_published: nextVal } : p))
    );

    try {
      await portfolioApi.togglePublishProject(proj.id, nextVal);
      toast.success(`"${proj.name}" is now ${nextVal ? "PUBLISHED (live on public website)" : "UNPUBLISHED (hidden draft)"}!`);
      loadProjects();
    } catch {
      try {
        await portfolioApi.updateProject(proj.id, {
          ...proj,
          is_published: nextVal,
        });
        toast.success(`"${proj.name}" is now ${nextVal ? "PUBLISHED (live on public website)" : "UNPUBLISHED (hidden draft)"}!`);
        loadProjects();
      } catch (err) {
        toast.error(`Failed to update publication status: ${err.message}`);
        loadProjects();
      }
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: "projects.delete_prompt",
      message: `Permanently delete project "${name}"? This action cannot be undone.`,
      confirmText: "Delete Project",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await portfolioApi.deleteProject(id);
      toast.success(`Project "${name}" deleted.`);
      loadProjects();
    } catch (err) {
      toast.error("Error deleting project: " + err.message);
    }
  };

  const filteredProjects =
    statusFilter === "all"
      ? projects
      : statusFilter === "published"
      ? projects.filter((p) => p.is_published !== false)
      : statusFilter === "unpublished"
      ? projects.filter((p) => p.is_published === false)
      : projects.filter((p) => (p.status || "completed") === statusFilter);

  return (
    <div className="admin-container">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">📁 Projects Management</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-dim)", fontSize: 13 }}>
            Manage media collections, demo videos, start/end timelines, and GitHub sprint performance tracking.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + New Project
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, margin: "18px 0 16px", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("all")}
        >
          All ({projects.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "published" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("published")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
          Published ({projects.filter((p) => p.is_published !== false).length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "unpublished" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("unpublished")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
          Unpublished ({projects.filter((p) => p.is_published === false).length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "ongoing" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("ongoing")}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
          Ongoing ({projects.filter((p) => p.status === "ongoing").length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${statusFilter === "completed" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setStatusFilter("completed")}
        >
          Completed ({projects.filter((p) => (p.status || "completed") === "completed").length})
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            Loading projects...
          </p>
        ) : filteredProjects.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            No projects found. Click "+ New Project" to add one.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Project Name</th>
                  <th>Media</th>
                  <th>Dates</th>
                  <th>Tracking</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const isOngoing = p.status === "ongoing";
                  const isPublished = p.is_published !== false;
                  const imgCount = Array.isArray(p.images) ? p.images.length : 0;
                  const hasVideo = Boolean(p.demo_video_url);

                  return (
                    <tr key={p.id}>
                      <td style={{ color: "var(--accent-amber)" }}>#{p.sort_order}</td>
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
                            title="Visible on the public portfolio website"
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#34d399",
                                boxShadow: "0 0 6px #34d399",
                              }}
                            />
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
                            title="Hidden from public visitors (Draft mode)"
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24" }} />
                            UNPUBLISHED
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: isOngoing ? "rgba(16, 185, 129, 0.15)" : "rgba(168, 85, 247, 0.15)",
                            color: isOngoing ? "#34d399" : "#c084fc",
                            border: `1px solid ${isOngoing ? "rgba(16, 185, 129, 0.3)" : "rgba(168, 85, 247, 0.3)"}`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {isOngoing && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />}
                          {isOngoing ? "ONGOING" : "COMPLETED"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--accent-purple)", fontFamily: "var(--font-mono)" }}>
                          #{p.commit_hash}
                        </div>
                        {Array.isArray(p.contributors) && p.contributors.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                            {p.contributors.slice(0, 3).map((c, i) => (
                              <img
                                key={c.username || i}
                                src={c.avatar_url || `https://avatars.githubusercontent.com/${c.username}`}
                                alt={c.name || c.username}
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid var(--accent-teal)",
                                }}
                                title={c.name || c.username}
                              />
                            ))}
                            <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                              👥 {p.contributors.length}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, fontSize: 12, color: "var(--text-dim)" }}>
                          {hasVideo && <span title="Has demo video">🎬 Video</span>}
                          {imgCount > 0 && <span title={`${imgCount} photos`}>🖼 {imgCount}</span>}
                          {!hasVideo && imgCount === 0 && <span>—</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        {p.start_date || "—"} {p.end_date ? `→ ${p.end_date}` : ""}
                      </td>
                      <td>
                        {p.auto_sync_github ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#34d399",
                              border: "1px solid rgba(16, 185, 129, 0.35)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontFamily: "var(--font-mono)",
                            }}
                            title="Automatically syncs metrics on GitHub commits"
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "#34d399",
                                boxShadow: "0 0 6px #34d399",
                              }}
                            />
                            Auto-Sync ON
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-dim)",
                              fontFamily: "var(--font-mono)",
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              display: "inline-block",
                            }}
                          >
                            Manual
                          </span>
                        )}
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
                            onClick={() => handleTogglePublish(p)}
                            title="Unpublish this project (hide from public website)"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
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
                            onClick={() => handleTogglePublish(p)}
                            title="Publish this project (make visible on public website)"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Publish
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ marginRight: 6 }}
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-danger"
                          onClick={() => handleDelete(p.id, p.name)}
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

      {/* CREATE / EDIT PROJECT MODAL */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 16 }}>
                {editingProject ? `Edit: ${editingProject.name}` : "Create New Project"}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* 1. Project Identity */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  <div className="admin-form-group">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. StudyFlow — Student Planner"
                      required
                      style={{ width: "100%", minWidth: 0 }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Commit Hash *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.commit_hash}
                      onChange={(e) => setForm({ ...form, commit_hash: e.target.value })}
                      placeholder="c91a4f"
                      required
                      style={{ width: "100%", minWidth: 0 }}
                    />
                  </div>
                </div>

                {/* 2. Publication Visibility, Status & Timeline */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
                  <div className="admin-form-group">
                    <label>Publication Visibility</label>
                    <select
                      className="admin-input"
                      value={form.is_published ? "published" : "unpublished"}
                      onChange={(e) => setForm({ ...form, is_published: e.target.value === "published" })}
                      style={{
                        width: "100%",
                        minWidth: 0,
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
                    <label>Development Status</label>
                    <select
                      className="admin-input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      style={{ width: "100%", minWidth: 0 }}
                    >
                      <option value="ongoing">● Ongoing (In Progress)</option>
                      <option value="completed">✓ Completed</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      style={{ width: "100%", minWidth: 0 }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>End Date / Target</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      style={{ width: "100%", minWidth: 0 }}
                    />
                  </div>
                </div>

                {/* 3. Description */}
                <div className="admin-form-group">
                  <label>Description *</label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Comprehensive description of the application, features and architecture..."
                    required
                    style={{ width: "100%", minWidth: 0, resize: "vertical" }}
                  />
                </div>

                {/* 4. Tech Stack */}
                <div className="admin-form-group">
                  <label>Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.stack}
                    onChange={(e) => setForm({ ...form, stack: e.target.value })}
                    placeholder="React, Node.js, Express, MongoDB, Tailwind CSS"
                    style={{ width: "100%", minWidth: 0 }}
                  />
                </div>

                {/* 5. Repositories & Links */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                  <div className="admin-form-group">
                    <label>GitHub Repository URL *</label>
                    <input
                      type="url"
                      className="admin-input"
                      value={form.github_url}
                      onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                      placeholder="https://github.com/YeshiniWckramasinghe/..."
                      required
                      style={{ width: "100%", minWidth: 0 }}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Live Demo URL (or #)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.demo_url}
                      onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                      placeholder="https://..."
                      style={{ width: "100%", minWidth: 0 }}
                    />
                  </div>
                </div>

                {/* 5b. GitHub Contributor Mentions & Collaborators */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, color: "var(--accent-teal)" }}>
                        👥 Contributor Mentions &amp; Collaborators
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-dim)" }}>
                        Displayed on public cards after tags row with profile picture, name, and GitHub profile link.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleFetchRepoContributors}
                      disabled={fetchingContributor || !form.github_url}
                      title="Fetch contributors list directly from repository"
                      style={{ flexShrink: 0 }}
                    >
                      {fetchingContributor ? "Fetching..." : "🔄 Fetch Repo Contributors"}
                    </button>
                  </div>

                  {/* Add Contributor by Username */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                    <input
                      type="text"
                      className="admin-input"
                      value={newContributorUsername}
                      onChange={(e) => setNewContributorUsername(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddContributor();
                        }
                      }}
                      placeholder="Add by GitHub username (e.g. YeshiniWckramasinghe or octocat)"
                      style={{ flex: "1 1 240px", minWidth: 0 }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddContributor}
                      disabled={fetchingContributor || !newContributorUsername.trim()}
                      style={{ flexShrink: 0 }}
                    >
                      + Add Contributor
                    </button>
                  </div>

                  {/* Existing Contributors List */}
                  {Array.isArray(form.contributors) && form.contributors.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {form.contributors.map((c, idx) => (
                        <div
                          key={c.username || idx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 10px 4px 6px",
                            borderRadius: 999,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            fontSize: 12,
                            maxWidth: "100%",
                          }}
                        >
                          <img
                            src={c.avatar_url || `https://avatars.githubusercontent.com/${c.username}`}
                            alt={c.name || c.username}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1.5px solid var(--accent-teal)",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span style={{ fontWeight: 600, color: "var(--text)" }}>
                              {c.name || c.username}
                            </span>
                            {c.contributions ? (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 10.5,
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--accent-teal)",
                                }}
                              >
                                ({c.contributions} commits)
                              </span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveContributor(idx)}
                            style={{
                              marginLeft: 4,
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "none",
                              color: "#ef4444",
                              borderRadius: "50%",
                              width: 18,
                              height: 18,
                              fontSize: 11,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                            title="Remove contributor"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 6,
                        background: "var(--surface)",
                        border: "1px dashed var(--border)",
                        fontSize: 12,
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      No contributors added yet. Click &quot;🔄 Fetch Repo Contributors&quot; or type a username above.
                    </div>
                  )}
                </div>

                {/* 6. Media Section: Image Collection & Demo Video */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                  }}
                >
                  <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--accent-teal)" }}>
                    🎬 Media Collection (Photos &amp; Demo Video)
                  </h4>

                  {/* Demo Video Input */}
                  <div className="admin-form-group" style={{ marginBottom: 14 }}>
                    <label>Demo Video URL (Direct MP4, WebM, YouTube, or Loom)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.demo_video_url}
                      onChange={(e) => setForm({ ...form, demo_video_url: e.target.value })}
                      placeholder="https://.../video.mp4 or https://youtube.com/watch?v=..."
                      style={{ width: "100%", minWidth: 0 }}
                    />
                  </div>

                  {/* Image Collection List */}
                  <div className="admin-form-group">
                    <label>Image Collection ({form.images.length} images uploaded)</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                      <input
                        type="url"
                        className="admin-input"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        style={{ flex: "1 1 220px", minWidth: 0 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleAddImage}
                        style={{ flexShrink: 0 }}
                      >
                        + Add Image URL
                      </button>
                      <label
                        className="btn btn-ghost btn-sm"
                        style={{ cursor: "pointer", margin: 0, flexShrink: 0 }}
                      >
                        📁 Upload File
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>

                    {/* Image Thumbnails Grid */}
                    {form.images.length > 0 && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                        {form.images.map((img, i) => (
                          <div
                            key={i}
                            style={{
                              position: "relative",
                              width: 80,
                              height: 60,
                              borderRadius: 6,
                              overflow: "hidden",
                              border: "1px solid var(--border)",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={img}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              style={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                background: "rgba(0,0,0,0.75)",
                                border: "none",
                                color: "#ef4444",
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                fontSize: 10,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. GitHub Performance & Sprint Tracker */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    padding: 16,
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          color: "var(--accent-purple)",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          />
                        </svg>
                        GitHub Performance &amp; Sprint Tracker
                      </h4>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-dim)" }}>
                        When enabled, committing to GitHub automatically syncs your commit hash, build dates &amp; performance metrics to the public website.
                      </p>
                    </div>

                    {/* Enable Auto-Sync Option / Interactive Toggle Switch */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: form.auto_sync_github ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.04)",
                        padding: "6px 14px",
                        borderRadius: 30,
                        border: `1px solid ${form.auto_sync_github ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                        transition: "all 0.25s ease",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            color: form.auto_sync_github ? "#34d399" : "var(--text-dim)",
                            letterSpacing: "0.5px",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            justifyContent: "flex-end",
                          }}
                        >
                          {form.auto_sync_github && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#34d399",
                                boxShadow: "0 0 8px #34d399",
                              }}
                            />
                          )}
                          {form.auto_sync_github ? "AUTO-SYNC ENABLED" : "AUTO-SYNC DISABLED"}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                          {form.auto_sync_github ? (syncingGithub ? "Syncing now..." : "Real-time sync active") : "Click switch to enable"}
                        </div>
                      </div>

                      <label
                        style={{
                          position: "relative",
                          display: "inline-block",
                          width: 48,
                          height: 25,
                          cursor: "pointer",
                          userSelect: "none",
                          margin: 0,
                          flexShrink: 0,
                        }}
                        title={form.auto_sync_github ? "Click to disable auto-sync" : "Click to enable auto-sync on GitHub commit"}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(form.auto_sync_github)}
                          onChange={handleToggleAutoSync}
                          disabled={syncingGithub}
                          style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: form.auto_sync_github ? "#10b981" : "rgba(255, 255, 255, 0.16)",
                            borderRadius: 30,
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            border: `1px solid ${form.auto_sync_github ? "#34d399" : "var(--border)"}`,
                            boxShadow: form.auto_sync_github ? "0 0 12px rgba(16, 185, 129, 0.45)" : "none",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              content: '""',
                              height: 17,
                              width: 17,
                              left: form.auto_sync_github ? 26 : 3,
                              bottom: 3,
                              backgroundColor: "#ffffff",
                              borderRadius: "50%",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
                            }}
                          />
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Auto-Sync Live State Indicator Banner */}
                  {form.auto_sync_github && (
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#34d399",
                            boxShadow: "0 0 8px #34d399",
                          }}
                        />
                        <span style={{ fontSize: 12, color: "#34d399", fontWeight: 500 }}>
                          Auto-Sync Active: Commits pushed to GitHub automatically sync performance metrics &amp; latest commit hash (#{(form.commit_hash || "auto").substring(0, 7)}) to public cards.
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        ● Auto-refreshed live
                      </span>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Milestone Countdown Text</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.tracking_data.milestone_title || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tracking_data: { ...form.tracking_data, milestone_title: e.target.value },
                          })
                        }
                        placeholder="e.g. 47 days until next preview build"
                        style={{ width: "100%", minWidth: 0 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Target Date</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.tracking_data.milestone_date || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tracking_data: { ...form.tracking_data, milestone_date: e.target.value },
                          })
                        }
                        placeholder="Nov 30th"
                        style={{ width: "100%", minWidth: 0 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Progress %</label>
                      <input
                        type="number"
                        className="admin-input"
                        value={form.tracking_data.milestone_progress || 50}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tracking_data: { ...form.tracking_data, milestone_progress: Number(e.target.value) },
                          })
                        }
                        style={{ width: "100%", minWidth: 0 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Section Title &amp; %</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.tracking_data.section_title || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tracking_data: { ...form.tracking_data, section_title: e.target.value },
                          })
                        }
                        placeholder="Tech Update - 86%"
                        style={{ width: "100%", minWidth: 0 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Tasks Total</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.tracking_data.total_tasks_label || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tracking_data: { ...form.tracking_data, total_tasks_label: e.target.value },
                          })
                        }
                        placeholder="670 Tasks"
                        style={{ width: "100%", minWidth: 0 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Recent Changes Footer</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.tracking_data.changes_last_24h || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tracking_data: { ...form.tracking_data, changes_last_24h: e.target.value },
                          })
                        }
                        placeholder="22 Changes in last 24hrs"
                        style={{ width: "100%", minWidth: 0 }}
                      />
                    </div>
                  </div>

                  {/* Task Category Bars Editor */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, fontWeight: 600 }}>
                      Performance Category Bars:
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: "3px 9px" }}
                        onClick={handleAddTaskItem}
                      >
                        + Add Bar
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, padding: "3px 9px", color: "var(--accent-teal)" }}
                        onClick={() =>
                          setForm({
                            ...form,
                            tracking_data: {
                              ...form.tracking_data,
                              items: [
                                { name: "Frontend / UI", current: 95, total: 100, unit: "%", color: "slate" },
                                { name: "Backend / API", current: 85, total: 90, unit: "%", color: "steel" },
                                { name: "Database & Storage", current: 30, total: 32, unit: "%", color: "zinc" },
                                { name: "Core Features & Code", current: 150, total: 200, unit: "%", color: "charcoal" },
                                { name: "Testing & Bug Fixes", current: 0, total: 0, unit: "Fixed", color: "silver" },
                              ],
                            },
                          })
                        }
                      >
                        ↺ Reset Software Defaults
                      </button>
                    </div>
                  </div>

                  <datalist id="software-categories">
                    <option value="Frontend / UI" />
                    <option value="Backend / API" />
                    <option value="Database & Storage" />
                    <option value="Core Features & Code" />
                    <option value="Testing & Bug Fixes" />
                    <option value="DevOps & Deployment" />
                    <option value="Documentation" />
                  </datalist>

                  <div style={{ overflowX: "auto", margin: "4px 0", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0, 0, 0, 0.15)" }}>
                    <div style={{ minWidth: 560, padding: 8 }}>
                      {/* Column Header Guide */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(140px, 1.8fr) 75px 75px 125px minmax(110px, 1fr) 28px",
                          gap: 8,
                          padding: "4px 6px 6px",
                          fontSize: 11,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-dim)",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                          marginBottom: 6,
                        }}
                      >
                        <span>Category Name</span>
                        <span style={{ textAlign: "center" }}>Done</span>
                        <span style={{ textAlign: "center" }}>Total</span>
                        <span>Theme Gray</span>
                        <span>Preview</span>
                        <span></span>
                      </div>

                      {/* Rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(form.tracking_data.items || []).map((item, idx) => {
                          const curr = Number(item.current) || 0;
                          const tot = Number(item.total) || 0;
                          const pct = tot > 0 ? Math.round((curr / tot) * 100) : item.unit === "Fixed" ? 100 : 0;
                          return (
                            <div
                              key={idx}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "minmax(140px, 1.8fr) 75px 75px 125px minmax(110px, 1fr) 28px",
                                gap: 8,
                                alignItems: "center",
                                background: "var(--surface)",
                                padding: "4px 6px",
                                borderRadius: 5,
                                border: "1px solid var(--border)",
                              }}
                            >
                              <input
                                type="text"
                                className="admin-input"
                                list="software-categories"
                                value={item.name}
                                onChange={(e) => handleUpdateTaskItem(idx, "name", e.target.value)}
                                placeholder="Category"
                                style={{ minWidth: 0, padding: "5px 8px", fontSize: 12 }}
                              />
                              <input
                                type="number"
                                className="admin-input"
                                value={item.current}
                                onChange={(e) => handleUpdateTaskItem(idx, "current", e.target.value)}
                                placeholder="0"
                                style={{ minWidth: 0, padding: "5px 6px", fontSize: 12, textAlign: "center" }}
                              />
                              <input
                                type="number"
                                className="admin-input"
                                value={item.total}
                                onChange={(e) => handleUpdateTaskItem(idx, "total", e.target.value)}
                                placeholder="100"
                                style={{ minWidth: 0, padding: "5px 6px", fontSize: 12, textAlign: "center" }}
                              />
                              <select
                                className="admin-input"
                                value={item.color || "slate"}
                                onChange={(e) => handleUpdateTaskItem(idx, "color", e.target.value)}
                                style={{ minWidth: 0, padding: "5px 6px", fontSize: 11.5 }}
                              >
                                <option value="slate">Slate Gray</option>
                                <option value="steel">Steel Gray</option>
                                <option value="zinc">Zinc Gray</option>
                                <option value="charcoal">Charcoal Gray</option>
                                <option value="silver">Silver Gray</option>
                              </select>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontFamily: "var(--font-mono)",
                                  color: "#ffffff",
                                  background: "rgba(15, 23, 42, 0.8)",
                                  padding: "3px 6px",
                                  borderRadius: 4,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  textAlign: "center",
                                }}
                                title={`${item.name} [${curr}/${tot}] ${item.unit === "Fixed" ? "Fixed" : `${pct}%`}`}
                              >
                                [{curr}/{tot}] {item.unit === "Fixed" ? "Fixed" : `${pct}%`}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTaskItem(idx)}
                                style={{
                                  background: "rgba(239, 68, 68, 0.15)",
                                  border: "none",
                                  color: "#ef4444",
                                  borderRadius: 4,
                                  width: 24,
                                  height: 24,
                                  fontSize: 12,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Remove category bar"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Live Visual Widget Preview */}
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, color: "var(--accent-teal)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                      Live Widget Preview (Side-by-side public card preview):
                    </label>
                    <div style={{ maxWidth: 440, width: "100%" }}>
                      <ProjectTracker
                        tracking={form.tracking_data}
                        isOngoing={form.status === "ongoing"}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Display Order */}
                <div className="admin-form-group" style={{ maxWidth: 140 }}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    style={{ width: "100%", minWidth: 0 }}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
