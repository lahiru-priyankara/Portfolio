import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECTS_FILE = path.resolve(__dirname, "../../data/projects_data.json");

function readLocalProjects() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const raw = fs.readFileSync(PROJECTS_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (err) {
    console.error("Error reading local projects file:", err.message);
  }
  return [];
}

function writeLocalProjects(data) {
  try {
    const dir = path.dirname(PROJECTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local projects file:", err.message);
  }
}

/**
 * Helper to fetch public repo stats from GitHub REST API
 */
async function fetchGithubStats(githubUrl, endDateStr = "") {
  try {
    if (!githubUrl || !githubUrl.includes("github.com/")) return null;
    const cleanUrl = githubUrl.trim().replace(/\.git$/, "");
    const parts = cleanUrl.split("github.com/")[1]?.split("/");
    if (!parts || parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1];

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        "User-Agent": "Portfolio-Tracker/1.0",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!repoRes.ok) return null;
    const repoData = await repoRes.json();

    // Fetch recent commits for 24h calculation & latest commit hash
    let changes24h = 0;
    let latestCommitHash = null;
    let latestCommitDate = repoData.pushed_at ? new Date(repoData.pushed_at) : new Date();
    try {
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
        {
          headers: {
            "User-Agent": "Portfolio-Tracker/1.0",
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      if (commitsRes.ok) {
        const commits = await commitsRes.json();
        if (Array.isArray(commits) && commits.length > 0) {
          latestCommitHash = commits[0].sha?.substring(0, 7) || null;
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          changes24h = commits.filter((c) => {
            const dateStr = c.commit?.author?.date || c.commit?.committer?.date;
            return dateStr && new Date(dateStr).getTime() > oneDayAgo;
          }).length;

          const firstDate = commits[0].commit?.author?.date;
          if (firstDate) latestCommitDate = new Date(firstDate);
        }
      }
    } catch {
      // fallback
    }

    // Format last build date e.g. "Sep 30th"
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const lastBuildFormatted = `${monthNames[latestCommitDate.getMonth()]} ${latestCommitDate.getDate()}${getOrdinal(latestCommitDate.getDate())}`;

    // Target milestone date and countdown calculation
    let milestoneDateStr = "Nov 30th";
    let daysLeft = 47;
    if (endDateStr) {
      const targetDate = new Date(endDateStr);
      if (!isNaN(targetDate.getTime())) {
        milestoneDateStr = `${monthNames[targetDate.getMonth()]} ${targetDate.getDate()}${getOrdinal(targetDate.getDate())}`;
        const diffDays = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        daysLeft = diffDays > 0 ? diffDays : 0;
      }
    }

    const openIssues = repoData.open_issues_count || 0;

    // Fetch repository language breakdown
    let languageItems = null;
    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          "User-Agent": "Portfolio-Tracker/1.0",
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (langRes.ok) {
        const langData = await langRes.json();
        const totalBytes = Object.values(langData).reduce((acc, v) => acc + v, 0);
        if (totalBytes > 0) {
          const colors = ["slate", "steel", "zinc", "charcoal", "silver"];
          languageItems = Object.entries(langData).slice(0, 5).map(([lang, bytes], i) => ({
            name: lang,
            current: Math.round((bytes / totalBytes) * 100),
            total: 100,
            unit: "%",
            color: colors[i % colors.length],
          }));
        }
      }
    } catch {
      // fallback
    }

    const fallbackItems = [
      { name: "Frontend / UI", current: 95, total: 100, unit: "%", color: "slate" },
      { name: "Backend / API", current: 88, total: 92, unit: "%", color: "steel" },
      { name: "Database & Storage", current: 40, total: 42, unit: "%", color: "zinc" },
      { name: "Core Features & Code", current: Math.max(repoData.stargazers_count || 45, 30), total: 50, unit: "%", color: "charcoal" },
      { name: "Testing & Bug Fixes", current: openIssues === 0 ? 0 : openIssues, total: openIssues === 0 ? 0 : openIssues + 2, unit: "Fixed", color: "silver" },
    ];

    const stats = {
      milestone_title: `${daysLeft} days until next preview build`,
      milestone_date: milestoneDateStr,
      milestone_progress: Math.min(Math.max(Math.round(((100 - daysLeft) / 100) * 100), 25), 95),
      last_build: lastBuildFormatted,
      section_title: `Development Sprint - ${Math.min(75 + (changes24h * 2), 98)}%`,
      total_tasks_label: `${Math.max(repoData.size || 120, 150)} Tasks`,
      changes_last_24h: changes24h > 0 ? `${changes24h} Changes in last 24hrs` : (latestCommitHash ? `Commit #${latestCommitHash}` : "Live GitHub tracking"),
      items: languageItems && languageItems.length >= 3 ? languageItems : fallbackItems,
    };

    return {
      stats,
      latestCommitHash,
    };
  } catch (err) {
    console.error("Error fetching GitHub stats:", err.message);
    return null;
  }
}

/**
 * Helper to fetch contributors list from GitHub REST API
 */
async function fetchGithubContributors(githubUrl) {
  try {
    if (!githubUrl || !githubUrl.includes("github.com/")) return [];
    const cleanUrl = githubUrl.trim().replace(/\.git$/, "");
    const parts = cleanUrl.split("github.com/")[1]?.split("/");
    if (!parts || parts.length < 2) return [];

    const owner = parts[0];
    const repo = parts[1];

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=12`, {
      headers: {
        "User-Agent": "Portfolio-Tracker/1.0",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((c) => ({
      username: c.login,
      name: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      contributions: c.contributions,
    }));
  } catch (err) {
    console.error("Error fetching GitHub contributors:", err.message);
    return [];
  }
}

/**
 * Sync a single project directly with GitHub API
 */
export async function syncSingleProjectGithub(project) {
  if (!project.github_url || !project.github_url.includes("github.com/")) return project;

  const result = await fetchGithubStats(project.github_url, project.end_date);
  const contributors = await fetchGithubContributors(project.github_url);

  if (result?.stats) {
    project.tracking_data = result.stats;
    if (result.latestCommitHash) {
      project.commit_hash = result.latestCommitHash;
    }
  }

  if (contributors && contributors.length > 0) {
    project.contributors = contributors;
  }

  project.last_github_sync_at = new Date().toISOString();
  project.updated_at = new Date().toISOString();
  return project;
}

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Get all projects (public). Automatically refreshes any project where auto_sync_github is enabled.
 */
export async function getProjects(req, res, next) {
  try {
    const localProjects = readLocalProjects();
    let hasUpdates = false;

    // Check projects that have auto_sync_github enabled
    // Cache threshold: 60 seconds (1 minute) to avoid hitting GitHub rate limits
    const now = Date.now();
    for (const p of localProjects) {
      if (p.auto_sync_github && p.github_url && p.github_url.includes("github.com/")) {
        const lastSync = p.last_github_sync_at ? new Date(p.last_github_sync_at).getTime() : 0;
        if (now - lastSync > 60 * 1000) {
          try {
            await syncSingleProjectGithub(p);
            hasUpdates = true;
          } catch (err) {
            console.error(`Auto-sync error for project ${p.name}:`, err.message);
          }
        }
      }
    }

    if (hasUpdates) {
      writeLocalProjects(localProjects);
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge Supabase data with local projects to ensure live metrics, commit hash & media are accurate
        const merged = data.map((sp) => {
          const lp = localProjects.find(
            (p) =>
              String(p.id) === String(sp.id) ||
              p.commit_hash === sp.commit_hash ||
              p.name === sp.name ||
              (p.github_url && sp.github_url && p.github_url.toLowerCase() === sp.github_url.toLowerCase())
          );
          return {
            ...sp,
            commit_hash: lp?.commit_hash || sp.commit_hash,
            status: sp.status || lp?.status || "completed",
            start_date: sp.start_date || lp?.start_date || "",
            end_date: sp.end_date || lp?.end_date || "",
            images: Array.isArray(sp.images) && sp.images.length > 0 ? sp.images : lp?.images || [],
            demo_video_url: sp.demo_video_url || lp?.demo_video_url || "",
            tracking_data:
              lp?.tracking_data && Object.keys(lp.tracking_data).length > 0
                ? lp.tracking_data
                : sp.tracking_data && Object.keys(sp.tracking_data).length > 0
                ? sp.tracking_data
                : {},
            contributors:
              Array.isArray(lp?.contributors) && lp.contributors.length > 0
                ? lp.contributors
                : Array.isArray(sp.contributors) && sp.contributors.length > 0
                ? sp.contributors
                : [],
            auto_sync_github:
              lp?.auto_sync_github !== undefined
                ? lp.auto_sync_github
                : sp.auto_sync_github !== undefined
                ? sp.auto_sync_github
                : false,
            is_published:
              lp?.is_published !== undefined
                ? lp.is_published
                : sp.is_published !== undefined
                ? sp.is_published
                : true,
            last_github_sync_at: lp?.last_github_sync_at || sp.last_github_sync_at || null,
          };
        });
        const showAll = req.query.all === "true" || Boolean(req.headers.authorization);
        const filteredMerged = showAll ? merged : merged.filter((p) => p.is_published !== false);
        return res.json({ success: true, data: filteredMerged });
      }
    } catch {
      // Supabase unavailable or table empty
    }

    const showAll = req.query.all === "true" || Boolean(req.headers.authorization);
    const filteredLocal = showAll ? localProjects : localProjects.filter((p) => p.is_published !== false);
    return res.json({
      success: true,
      data: filteredLocal,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new project (admin only)
 */
export async function createProject(req, res, next) {
  try {
    const {
      commit_hash,
      name,
      description,
      stack,
      github_url,
      demo_url,
      status,
      start_date,
      end_date,
      images,
      demo_video_url,
      tracking_data,
      contributors,
      sort_order,
      is_featured,
      is_published,
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: "Project name and description are required",
      });
    }

    const auto_sync_github = req.body.auto_sync_github !== undefined ? Boolean(req.body.auto_sync_github) : false;
    const isPublished = is_published !== undefined ? Boolean(is_published) : true;

    const newProject = {
      id: "p_" + Date.now(),
      commit_hash: commit_hash || Math.random().toString(16).substring(2, 8),
      name,
      description,
      stack: Array.isArray(stack) ? stack : [],
      github_url: github_url || "#",
      demo_url: demo_url || "#",
      status: status || "completed",
      start_date: start_date || "",
      end_date: end_date || "",
      images: Array.isArray(images) ? images : [],
      demo_video_url: demo_video_url || "",
      tracking_data: tracking_data || {},
      contributors: Array.isArray(contributors) ? contributors : [],
      auto_sync_github,
      is_published: isPublished,
      sort_order: sort_order ?? 0,
      is_featured: is_featured ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If auto_sync_github is enabled, immediately fetch latest GitHub metrics & commit hash
    if (newProject.auto_sync_github && newProject.github_url && newProject.github_url.includes("github.com/")) {
      try {
        await syncSingleProjectGithub(newProject);
      } catch (syncErr) {
        console.error("Initial auto-sync error:", syncErr.message);
      }
    }

    // Save to local file
    const currentList = readLocalProjects();
    currentList.push(newProject);
    writeLocalProjects(currentList);

    // Try saving to Supabase
    try {
      const payload = {
        commit_hash: newProject.commit_hash,
        name: newProject.name,
        description: newProject.description,
        stack: newProject.stack,
        github_url: newProject.github_url,
        demo_url: newProject.demo_url,
        status: newProject.status,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        images: newProject.images,
        demo_video_url: newProject.demo_video_url,
        tracking_data: newProject.tracking_data,
        contributors: newProject.contributors,
        auto_sync_github: newProject.auto_sync_github,
        sort_order: newProject.sort_order,
        is_featured: newProject.is_featured,
      };

      const { data, error } = await supabaseAdmin.from("projects").insert([payload]).select().single();
      if (error && (error.code === "42703" || error.message?.includes("column"))) {
        // Fallback for base columns if schema hasn't migrated yet
        const { data: baseData } = await supabaseAdmin
          .from("projects")
          .insert([
            {
              commit_hash: newProject.commit_hash,
              name: newProject.name,
              description: newProject.description,
              stack: newProject.stack,
              github_url: newProject.github_url,
              demo_url: newProject.demo_url,
              sort_order: newProject.sort_order,
              is_featured: newProject.is_featured,
            },
          ])
          .select()
          .single();
        if (baseData) newProject.id = baseData.id;
      } else if (data) {
        newProject.id = data.id;
      }
    } catch {
      // Supabase optional
    }

    return res.status(201).json({
      success: true,
      data: newProject,
      message: "Project created successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing project (admin only)
 */
export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const currentList = readLocalProjects();

    const updatedList = currentList.map((p) => {
      if (String(p.id) === String(id) || p.commit_hash === req.body.commit_hash) {
        const autoSync =
          req.body.auto_sync_github !== undefined
            ? Boolean(req.body.auto_sync_github)
            : (p.auto_sync_github || false);

        const isPublished =
          req.body.is_published !== undefined
            ? Boolean(req.body.is_published)
            : (p.is_published !== undefined ? p.is_published : true);

        return {
          ...p,
          ...req.body,
          auto_sync_github: autoSync,
          is_published: isPublished,
          stack: Array.isArray(req.body.stack) ? req.body.stack : p.stack,
          images: Array.isArray(req.body.images) ? req.body.images : p.images,
          tracking_data: req.body.tracking_data !== undefined ? req.body.tracking_data : p.tracking_data,
          contributors: Array.isArray(req.body.contributors) ? req.body.contributors : (p.contributors || []),
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    // If auto_sync_github is enabled and has a valid github_url, immediately sync fresh commit and metrics
    const updatedItem = updatedList.find((p) => String(p.id) === String(id)) || req.body;
    if (updatedItem?.auto_sync_github && updatedItem.github_url && updatedItem.github_url.includes("github.com/")) {
      try {
        await syncSingleProjectGithub(updatedItem);
      } catch (syncErr) {
        console.error("Auto-sync error during update:", syncErr.message);
      }
    }

    writeLocalProjects(updatedList);

    // Try updating Supabase
    try {
      const updates = {
        ...req.body,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from("projects").update(updates).eq("id", id);
      if (error && (error.code === "42703" || error.message?.includes("column"))) {
        // Fallback for base columns
        const baseUpdates = {
          name: req.body.name,
          description: req.body.description,
          stack: req.body.stack,
          github_url: req.body.github_url,
          demo_url: req.body.demo_url,
          sort_order: req.body.sort_order,
          updated_at: new Date().toISOString(),
        };
        await supabaseAdmin.from("projects").update(baseUpdates).eq("id", id);
      }
    } catch {
      // Ignore
    }

    return res.json({
      success: true,
      data: updatedItem,
      message: "Project updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle publish / unpublish status for a project (admin only)
 */
export async function togglePublishProject(req, res, next) {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    const currentList = readLocalProjects();
    let updatedItem = null;

    const updatedList = currentList.map((p) => {
      if (String(p.id) === String(id) || p.commit_hash === req.body.commit_hash) {
        const nextVal = is_published !== undefined ? Boolean(is_published) : !p.is_published;
        updatedItem = {
          ...p,
          is_published: nextVal,
          updated_at: new Date().toISOString(),
        };
        return updatedItem;
      }
      return p;
    });

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    writeLocalProjects(updatedList);

    try {
      await supabaseAdmin
        .from("projects")
        .update({ is_published: updatedItem.is_published, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // Supabase column optional
    }

    return res.json({
      success: true,
      data: updatedItem,
      message: `Project ${updatedItem.is_published ? "published" : "unpublished"} successfully`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a project (admin only)
 */
export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const currentList = readLocalProjects();
    const updatedList = currentList.filter((p) => String(p.id) !== String(id));
    writeLocalProjects(updatedList);

    try {
      await supabaseAdmin.from("projects").delete().eq("id", id);
    } catch {
      // Ignore
    }

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Auto-Sync GitHub metrics for a project
 */
export async function syncProjectGithub(req, res, next) {
  try {
    const { id } = req.params;
    const { github_url, end_date } = req.body;

    const currentList = readLocalProjects();
    const project = currentList.find((p) => String(p.id) === String(id));

    const repoUrl = github_url || project?.github_url;
    if (!repoUrl) {
      return res.status(400).json({ success: false, error: "GitHub URL is required to sync" });
    }

    const stats = await fetchGithubStats(repoUrl, end_date || project?.end_date);
    const contributors = await fetchGithubContributors(repoUrl);

    if (!stats && (!contributors || contributors.length === 0)) {
      return res.status(404).json({ success: false, error: "Could not fetch GitHub repository stats or contributors" });
    }

    if (project) {
      if (stats) project.tracking_data = stats;
      if (contributors && contributors.length > 0) project.contributors = contributors;
      project.updated_at = new Date().toISOString();
      writeLocalProjects(currentList);

      try {
        const updateObj = {};
        if (stats) updateObj.tracking_data = stats;
        if (contributors && contributors.length > 0) updateObj.contributors = contributors;
        await supabaseAdmin.from("projects").update(updateObj).eq("id", id);
      } catch {
        // ignore
      }
    }

    return res.json({
      success: true,
      data: {
        stats: stats || project?.tracking_data || {},
        contributors: contributors && contributors.length > 0 ? contributors : (project?.contributors || []),
      },
      message: "GitHub performance & contributors synced successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle incoming GitHub Push Webhook (instant auto-sync on commit)
 */
export async function handleGithubWebhook(req, res) {
  try {
    const { id } = req.params || {};
    const payload = req.body || {};

    const repoUrl = (payload.repository?.html_url || payload.repository?.url || "").toLowerCase().replace(/\.git$/, "");
    const repoFullName = (payload.repository?.full_name || "").toLowerCase();
    const commitHash = payload.after?.substring(0, 7) || payload.head_commit?.id?.substring(0, 7) || null;

    const list = readLocalProjects();
    let updatedCount = 0;

    for (const p of list) {
      const pRepo = (p.github_url || "").toLowerCase().replace(/\.git$/, "");
      const matchesId = id && String(p.id) === String(id);
      const matchesUrl = repoUrl && pRepo.includes(repoUrl);
      const matchesName = repoFullName && pRepo.includes(repoFullName);

      if (matchesId || matchesUrl || matchesName) {
        if (commitHash) {
          p.commit_hash = commitHash;
        }
        await syncSingleProjectGithub(p);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      writeLocalProjects(list);
      console.log(`[GitHub Webhook] Successfully auto-synced ${updatedCount} project(s) on push!`);
    }

    return res.json({
      success: true,
      synced_projects: updatedCount,
      commit_hash: commitHash,
      message: `GitHub webhook processed successfully. Updated ${updatedCount} project(s).`,
    });
  } catch (err) {
    console.error("Error handling GitHub webhook:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Background Auto-Sync Interval: keeps projects up to date every 3 minutes
if (!global.__githubSyncInterval) {
  global.__githubSyncInterval = setInterval(async () => {
    try {
      const list = readLocalProjects();
      let hasUpdates = false;
      const now = Date.now();
      for (const p of list) {
        if (p.auto_sync_github && p.github_url && p.github_url.includes("github.com/")) {
          const lastSync = p.last_github_sync_at ? new Date(p.last_github_sync_at).getTime() : 0;
          if (now - lastSync > 60 * 1000) {
            await syncSingleProjectGithub(p);
            hasUpdates = true;
          }
        }
      }
      if (hasUpdates) {
        writeLocalProjects(list);
      }
    } catch (err) {
      console.error("Background auto-sync failed:", err.message);
    }
  }, 3 * 60 * 1000);
}

