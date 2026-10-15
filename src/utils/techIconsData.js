export const TECH_ICON_PRESETS = [
  // Frontend
  { key: "html5", name: "HTML5", category: "frontend/", bg: "#E34F26" },
  { key: "css3", name: "CSS3", category: "frontend/", bg: "#1572B6" },
  { key: "javascript", name: "JavaScript", category: "frontend/", bg: "#F7DF1E", textColor: "#000" },
  { key: "react", name: "React", category: "frontend/", bg: "#20232A" },
  { key: "typescript", name: "TypeScript", category: "frontend/", bg: "#3178C6" },
  { key: "tailwind", name: "Tailwind CSS", category: "frontend/", bg: "#0F172A" },

  // Backend
  { key: "nodejs", name: "Node.js", category: "backend/", bg: "#215732" },
  { key: "express", name: "Express.js", category: "backend/", bg: "#18181B" },
  { key: "java", name: "Java", category: "backend/", bg: "#1E293B" },
  { key: "kotlin", name: "Kotlin", category: "backend/", bg: "#1E1E2E" },
  { key: "php", name: "PHP", category: "backend/", bg: "#4F5D95" },
  { key: "python", name: "Python", category: "backend/", bg: "#1E293B" },

  // Database
  { key: "mongodb", name: "MongoDB", category: "database/", bg: "#112211" },
  { key: "mysql", name: "MySQL", category: "database/", bg: "#00546B" },
  { key: "postgresql", name: "PostgreSQL", category: "database/", bg: "#336791" },
  { key: "firebase", name: "Firebase", category: "database/", bg: "#1A1C23" },

  // Tools & DevOps
  { key: "git", name: "Git", category: "tools/", bg: "#F05032" },
  { key: "github", name: "GitHub", category: "tools/", bg: "#181717" },
  { key: "postman", name: "Postman", category: "tools/", bg: "#FF6C37" },
  { key: "docker", name: "Docker", category: "tools/", bg: "#1D272B" },

  // Design & Creative
  { key: "figma", name: "Figma", category: "design/", bg: "#1E1E1E" },
  { key: "photoshop", name: "Photoshop", category: "design/", bg: "#001E36" },
  { key: "illustrator", name: "Illustrator", category: "design/", bg: "#330000" },
  { key: "unity", name: "Unity", category: "design/", bg: "#222C37" },
];

export function detectTechIcon(rawName = "") {
  const s = rawName.toLowerCase();
  if (s.includes("html")) return "html5";
  if (s.includes("css") && !s.includes("tailwind")) return "css3";
  if (s.includes("javascript") || (s.includes("js") && !s.includes("node") && !s.includes("express") && !s.includes("react"))) return "javascript";
  if (s.includes("react")) return "react";
  if (s.includes("tailwind")) return "tailwind";
  if (s.includes("typescript") || s.includes(".ts")) return "typescript";
  if (s.includes("node")) return "nodejs";
  if (s.includes("express") || s.includes("ex")) return "express";
  if (s.includes("mongo")) return "mongodb";
  if (s.includes("mysql") || (s.includes("sql") && !s.includes("postgre"))) return "mysql";
  if (s.includes("postgres")) return "postgresql";
  if (s.includes("firebase")) return "firebase";
  if (s.includes("java") && !s.includes("script")) return "java";
  if (s.includes("kotlin")) return "kotlin";
  if (s.includes("php")) return "php";
  if (s.includes("python") || s.includes(".py")) return "python";
  if (s.includes("github")) return "github";
  if (s.includes("git") && !s.includes("github")) return "git";
  if (s.includes("postman")) return "postman";
  if (s.includes("docker")) return "docker";
  if (s.includes("figma")) return "figma";
  if (s.includes("photoshop") || s.includes("ps")) return "photoshop";
  if (s.includes("illustrator") || s.includes("ai")) return "illustrator";
  if (s.includes("unity")) return "unity";
  return "";
}
