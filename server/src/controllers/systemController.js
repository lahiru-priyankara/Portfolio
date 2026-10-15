import { supabaseAdmin } from "../config/supabase.js";

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export async function getSystemHealth(req, res) {
  const startTime = Date.now();
  let dbStatus = "operational";
  let dbLatencyMs = 0;
  const tableCounts = {
    projects: 0,
    skills: 0,
    services: 0,
    social_links: 0,
    messages: 0,
    settings: 1,
  };

  try {
    const dbPingStart = Date.now();
    const { count: projCount, error: projErr } = await supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true });
    dbLatencyMs = Date.now() - dbPingStart;

    if (projErr) {
      dbStatus = "degraded";
    } else {
      tableCounts.projects = projCount || 0;
    }

    // Query other table counts in parallel
    const [skillRes, servRes, socRes, msgRes] = await Promise.allSettled([
      supabaseAdmin.from("skills").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("services").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("social_links").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("messages").select("*", { count: "exact", head: true }),
    ]);

    if (skillRes.status === "fulfilled" && !skillRes.value.error) {
      tableCounts.skills = skillRes.value.count || 0;
    }
    if (servRes.status === "fulfilled" && !servRes.value.error) {
      tableCounts.services = servRes.value.count || 0;
    }
    if (socRes.status === "fulfilled" && !socRes.value.error) {
      tableCounts.social_links = socRes.value.count || 0;
    }
    if (msgRes.status === "fulfilled" && !msgRes.value.error) {
      tableCounts.messages = msgRes.value.count || 0;
    }
  } catch (err) {
    console.error("System health check db probe error:", err);
    dbStatus = "offline";
    dbLatencyMs = -1;
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const responseTimeMs = Date.now() - startTime;

  res.json({
    success: true,
    data: {
      status: dbStatus === "offline" ? "degraded" : "healthy",
      timestamp: new Date().toISOString(),
      responseTimeMs,
      server: {
        status: "operational",
        uptimeSeconds,
        uptimeFormatted: formatUptime(uptimeSeconds),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || "development",
        port: Number(process.env.PORT) || 5000,
        memory: {
          heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        },
      },
      database: {
        provider: "Supabase PostgreSQL",
        status: dbStatus,
        latencyMs: dbLatencyMs,
        tables: tableCounts,
        ssl: true,
      },
      security: {
        cors: "active",
        auth: "Supabase JWT",
        rateLimit: "enabled",
      },
    },
  });
}
