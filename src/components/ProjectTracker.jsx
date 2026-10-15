import "./ProjectTracker.css";

// Professional Grayscale Matrix Spectrum
const COLOR_MAP = {
  slate: {
    fill: "linear-gradient(90deg, #475569 0%, #64748b 100%)",
    solid: "#64748b",
    bg: "rgba(30, 41, 59, 0.88)",
    border: "rgba(100, 116, 139, 0.35)",
  },
  zinc: {
    fill: "linear-gradient(90deg, #3f3f46 0%, #52525b 100%)",
    solid: "#71717a",
    bg: "rgba(39, 39, 42, 0.88)",
    border: "rgba(113, 113, 122, 0.35)",
  },
  steel: {
    fill: "linear-gradient(90deg, #334155 0%, #475569 100%)",
    solid: "#475569",
    bg: "rgba(30, 41, 59, 0.88)",
    border: "rgba(71, 85, 105, 0.35)",
  },
  charcoal: {
    fill: "linear-gradient(90deg, #1e293b 0%, #334155 100%)",
    solid: "#334155",
    bg: "rgba(15, 23, 42, 0.88)",
    border: "rgba(51, 65, 85, 0.38)",
  },
  silver: {
    fill: "linear-gradient(90deg, #52525b 0%, #71717a 100%)",
    solid: "#71717a",
    bg: "rgba(39, 39, 42, 0.85)",
    border: "rgba(113, 113, 122, 0.32)",
  },
};

// Aliases to seamlessly convert legacy color keys to professional gray spectrum
COLOR_MAP.green = COLOR_MAP.slate;
COLOR_MAP.blue = COLOR_MAP.steel;
COLOR_MAP.coral = COLOR_MAP.charcoal;
COLOR_MAP.yellow = COLOR_MAP.zinc;
COLOR_MAP.gray = COLOR_MAP.slate;
COLOR_MAP.neutral = COLOR_MAP.silver;

const COMPLETED_FALLBACK = {
  milestone_title: "Release v1.0",
  milestone_date: "Shipped",
  milestone_progress: 100,
  last_build: "Stable Build",
  section_title: "Project Delivery - 100%",
  total_tasks_label: "Completed",
  changes_last_24h: "Production Deployed",
  items: [
    { name: "Frontend / UI", current: 100, total: 100, unit: "%", color: "slate" },
    { name: "Backend / API", current: 100, total: 100, unit: "%", color: "steel" },
    { name: "Database", current: 100, total: 100, unit: "%", color: "zinc" },
    { name: "Architecture", current: 100, total: 100, unit: "%", color: "charcoal" },
    { name: "Tests & QA", current: 0, total: 0, unit: "Fixed", color: "silver" },
  ],
};

export default function ProjectTracker({
  tracking = {},
  className = "",
  compact = false,
  isOngoing = true,
}) {
  const hasCustomItems =
    tracking &&
    Object.keys(tracking).length > 0 &&
    Array.isArray(tracking.items) &&
    tracking.items.length > 0;

  const data = hasCustomItems ? tracking : COMPLETED_FALLBACK;

  const milestoneTitle = data.milestone_title || (isOngoing ? "Sprint in progress" : "Release v1.0");
  const milestoneDate = data.milestone_date || (isOngoing ? "Target Date" : "100% Shipped");
  const milestoneProgress = Math.min(Math.max(Number(data.milestone_progress) || (isOngoing ? 60 : 100), 0), 100);
  const lastBuild = data.last_build || (isOngoing ? "Recent build" : "Production Ready");
  const sectionTitle = data.section_title || (isOngoing ? "Sprint Progress" : "Delivery - 100%");
  const totalTasksLabel = data.total_tasks_label || (isOngoing ? "Active Tasks" : "Completed");
  const changes24h = data.changes_last_24h || (isOngoing ? "Live GitHub Tracking" : "Verified Stable Build");
  const items = Array.isArray(data.items) && data.items.length > 0 ? data.items : COMPLETED_FALLBACK.items;

  return (
    <div className={`project-tracker-widget ${compact ? "is-compact" : ""} ${className}`}>
      {/* Top Milestone Banner */}
      <div className="tracker-milestone-header">
        <span className="tracker-milestone-title">{milestoneTitle}</span>
        <span className="tracker-milestone-date">{milestoneDate}</span>
      </div>

      <div className="tracker-milestone-bar-wrap">
        <div
          className="tracker-milestone-bar-fill"
          style={{ width: `${milestoneProgress}%` }}
        />
      </div>

      <div className="tracker-last-build">Last build: {lastBuild}</div>

      {/* Tech / Task Breakdown Section */}
      <div className="tracker-section-header">
        <span className="tracker-section-title">{sectionTitle}</span>
        <span className="tracker-tasks-label">{totalTasksLabel}</span>
      </div>

      {/* Progress Bars Stack with Professional Theme Colors */}
      <div className="tracker-bars-box">
        {items.map((item, idx) => {
          const colorKey = item.color || (idx === 0 ? "slate" : idx === 1 ? "steel" : idx === 2 ? "zinc" : idx === 3 ? "charcoal" : "silver");
          const scheme = COLOR_MAP[colorKey] || COLOR_MAP.slate;
          const curr = Number(item.current) || 0;
          const tot = Number(item.total) || 0;
          const pct = tot > 0 ? Math.min(Math.round((curr / tot) * 100), 100) : item.unit === "Fixed" ? 100 : 0;
          const fractionText = tot > 0 ? `[${curr}/${tot}]` : `[${curr}/${tot}]`;
          const statusText = item.unit === "Fixed" ? `${fractionText} Fixed` : `${fractionText} ${pct}%`;

          return (
            <div
              key={item.name || idx}
              className={`tracker-category-row color-${colorKey}`}
              style={{
                backgroundColor: scheme.bg,
                borderColor: scheme.border,
              }}
            >
              <div
                className="tracker-category-fill"
                style={{
                  width: `${pct}%`,
                  background: scheme.fill,
                }}
              />
              <div className="tracker-category-content">
                <span className="tracker-category-name">{item.name}</span>
                <span className="tracker-category-stats">{statusText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Activity Footer */}
      <div className="tracker-footer-activity">
        <span className="tracker-live-pulse" />
        <span className="tracker-footer-text">{changes24h}</span>
      </div>
    </div>
  );
}
