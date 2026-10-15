// Professional Vector SVG Icon definitions and helper resolution for Social & Contact links
export const SOCIAL_PLATFORMS = [
  { key: "github", label: "GitHub", keywords: ["github", "gh", "git", "repo"], defaultCategory: "developer" },
  { key: "linkedin", label: "LinkedIn", keywords: ["linkedin", "li", "in"], defaultCategory: "professional" },
  { key: "email", label: "Email", keywords: ["email", "mail", "gmail", "contact", "mailto"], defaultCategory: "direct" },
  { key: "twitter", label: "Twitter / X", keywords: ["twitter", "x", "tweet"], defaultCategory: "social" },
  { key: "discord", label: "Discord", keywords: ["discord", "community"], defaultCategory: "community" },
  { key: "instagram", label: "Instagram", keywords: ["instagram", "ig", "insta"], defaultCategory: "social" },
  { key: "youtube", label: "YouTube", keywords: ["youtube", "yt", "video"], defaultCategory: "media" },
  { key: "leetcode", label: "LeetCode", keywords: ["leetcode", "algo", "code"], defaultCategory: "developer" },
  { key: "facebook", label: "Facebook", keywords: ["facebook", "fb"], defaultCategory: "social" },
  { key: "telegram", label: "Telegram", keywords: ["telegram", "tg"], defaultCategory: "direct" },
  { key: "whatsapp", label: "WhatsApp", keywords: ["whatsapp", "wa"], defaultCategory: "direct" },
  { key: "phone", label: "Phone", keywords: ["phone", "tel", "call", "mobile"], defaultCategory: "direct" },
  { key: "medium", label: "Medium", keywords: ["medium", "blog", "articles"], defaultCategory: "content" },
  { key: "devto", label: "Dev.to", keywords: ["devto", "dev.to"], defaultCategory: "developer" },
  { key: "stackoverflow", label: "Stack Overflow", keywords: ["stackoverflow", "stack", "so"], defaultCategory: "developer" },
  { key: "dribbble", label: "Dribbble", keywords: ["dribbble", "design"], defaultCategory: "design" },
  { key: "behance", label: "Behance", keywords: ["behance", "portfolio"], defaultCategory: "design" },
  { key: "globe", label: "Website / Portfolio", keywords: ["globe", "web", "website", "site", "link"], defaultCategory: "web" },
];

export function resolveSocialIcon(platformStr = "", url = "", title = "") {
  const pRaw = String(platformStr || "").toLowerCase().trim();
  const urlRaw = String(url || "").toLowerCase().trim();
  const titleRaw = String(title || "").toLowerCase().trim();

  // 1. Direct platform key match
  for (const item of SOCIAL_PLATFORMS) {
    if (item.key === pRaw) return item.key;
  }

  // 2. Platform keyword match
  for (const item of SOCIAL_PLATFORMS) {
    if (item.keywords.some((k) => k === pRaw || pRaw.includes(k))) return item.key;
  }

  // 3. URL domain matching
  if (urlRaw.includes("github.com")) return "github";
  if (urlRaw.includes("linkedin.com")) return "linkedin";
  if (urlRaw.startsWith("mailto:") || urlRaw.includes("@")) return "email";
  if (urlRaw.includes("twitter.com") || urlRaw.includes("x.com")) return "twitter";
  if (urlRaw.includes("discord.com") || urlRaw.includes("discord.gg")) return "discord";
  if (urlRaw.includes("instagram.com")) return "instagram";
  if (urlRaw.includes("youtube.com") || urlRaw.includes("youtu.be")) return "youtube";
  if (urlRaw.includes("leetcode.com")) return "leetcode";
  if (urlRaw.includes("facebook.com")) return "facebook";
  if (urlRaw.includes("t.me") || urlRaw.includes("telegram.me")) return "telegram";
  if (urlRaw.includes("wa.me") || urlRaw.includes("whatsapp.com")) return "whatsapp";
  if (urlRaw.startsWith("tel:")) return "phone";
  if (urlRaw.includes("medium.com")) return "medium";
  if (urlRaw.includes("dev.to")) return "devto";
  if (urlRaw.includes("stackoverflow.com")) return "stackoverflow";
  if (urlRaw.includes("dribbble.com")) return "dribbble";
  if (urlRaw.includes("behance.net")) return "behance";

  // 4. Title keywords
  for (const item of SOCIAL_PLATFORMS) {
    if (item.keywords.some((k) => titleRaw.includes(k))) return item.key;
  }

  return "globe";
}
