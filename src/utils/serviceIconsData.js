// Professional Vector SVG Icon definitions and helper resolution for Services
export const SERVICE_ICONS = [
  { key: "globe", label: "Web / Full-Stack", keywords: ["globe", "web", "website", "🌐"] },
  { key: "code", label: "Frontend / React", keywords: ["code", "frontend", "react", "ui", "💻"] },
  { key: "wrench", label: "Bug Fixing & QA", keywords: ["wrench", "bug", "fix", "tools", "🔧"] },
  { key: "mobile", label: "Responsive Design", keywords: ["mobile", "responsive", "devices", "📱"] },
  { key: "api", label: "API & Webhooks", keywords: ["api", "integration", "link", "connect", "🔗"] },
  { key: "database", label: "Database / Storage", keywords: ["database", "storage", "sql", "mongo", "db"] },
  { key: "server", label: "Backend & Cloud", keywords: ["server", "backend", "cloud", "node"] },
  { key: "palette", label: "UI/UX Prototyping", keywords: ["palette", "design", "figma", "art"] },
  { key: "terminal", label: "DevOps & Terminal", keywords: ["terminal", "devops", "git", "bash", "cli"] },
  { key: "shield", label: "Security & Auth", keywords: ["shield", "security", "auth", "lock"] },
  { key: "zap", label: "Speed & Optimization", keywords: ["zap", "performance", "speed", "fast", "⚡"] },
  { key: "book", label: "Docs & Architecture", keywords: ["book", "docs", "documentation", "guide"] },
];

export function resolveServiceIcon(iconStr, title = "") {
  if (!iconStr && !title) return "globe";
  const raw = String(iconStr || "").toLowerCase().trim();
  const rawTitle = String(title || "").toLowerCase();

  for (const item of SERVICE_ICONS) {
    if (item.key === raw) return item.key;
    if (item.keywords.some((k) => k.toLowerCase() === raw)) return item.key;
  }

  // Fallback to title matching
  for (const item of SERVICE_ICONS) {
    if (item.keywords.some((k) => rawTitle.includes(k.toLowerCase()))) return item.key;
  }

  return "globe";
}
