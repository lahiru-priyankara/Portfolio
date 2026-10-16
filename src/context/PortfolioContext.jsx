import { useEffect, useState } from "react";
import { PortfolioContext } from "./portfolioContextDef";
import { portfolioApi } from "../api/portfolioApi";

// Default settings for site branding and intro
const DEFAULT_SETTINGS = {
  site_name: "Lahiru.dev",
  browser_title: "Lahiru Priyankara | Full-Stack Developer",
  intro_file_tab: "intro.js",
  intro_greeting: "Hi, I'm",
  hero_name: "Lahiru Priyankara",
  hero_headline: "Full-Stack Developer & Project Manager.",
  hero_sub_headline:
    "I build clean, responsive web apps — from React front-ends to scalable Node, Python & SQL back-ends — and manage end-to-end software delivery with reliable, high-performance architectures.",
  code_window_title: "developer.js",
  developer_role: "Full-Stack Developer",
  developer_stack: ["React", "C++", "Sql", "Python", "Java"],
  based_in: "Sri Lanka",
  is_available: true,
  cta_primary_label: "View My Work",
  cta_secondary_label: "Contact Me",
  avatar_url: "/avatar.jpg",
  show_avatar: true,
  favicon_url: "/favicon.svg",
};

// Default fallback data (used if backend is not yet started or during initial setup)
const DEFAULT_PROFILE = {
  full_name: "Lahiru Priyankara",
  headline: "Full-Stack Developer & Project Manager.",
  sub_headline:
    "I build clean, responsive web apps — from React front-ends to scalable Node, Python & SQL back-ends — and manage end-to-end software delivery with reliable, high-performance architectures.",
  based_in: "Sri Lanka",
  is_available: true,
  about_paragraphs: [
    "I'm a Full-Stack Developer and Project Manager who enjoys turning complex ideas into scalable, production-ready software. I specialize in crafting clean, high-performance web applications and coordinating cross-functional teams to deliver projects on time.",
    "With strong foundations in React, modern JavaScript, Python, C++, and database architecture, I bridge the gap between technical engineering and strategic delivery. Whether leading development from scratch or collaborating in modern agile environments, I focus on clean code and reliable results.",
  ],
  tags: ["Full-Stack Developer", "Project Manager", "Sri Lanka", "Open to Opportunities"],
  email: "officiallahiru.p@gmail.com",
  linkedin_url: "www.linkedin.com/in/lahiru-priyankara-5972742ab",
  github_url: "https://github.com/lahiru-priyankara",
};

const DEFAULT_PROJECTS = [];

const DEFAULT_SKILLS = [
  // Frontend
  { id: "s1", category: "frontend/", name: "HTML5", icon: "html5", level: "Semantic Markup", sort_order: 1 },
  { id: "s2", category: "frontend/", name: "CSS3", icon: "css3", level: "Modern Flex/Grid", sort_order: 2 },
  { id: "s3", category: "frontend/", name: "JavaScript", icon: "javascript", level: "ES6+ Async", sort_order: 3 },
  { id: "s4", category: "frontend/", name: "React", icon: "react", level: "Hooks & Context", sort_order: 4 },

  // Backend
  { id: "s5", category: "backend/", name: "Node.js", icon: "nodejs", level: "REST Services", sort_order: 5 },
  { id: "s6", category: "backend/", name: "Express.js", icon: "express", level: "API Routing", sort_order: 6 },
  { id: "s7", category: "backend/", name: "Java", icon: "java", level: "OOP & Architecture", sort_order: 7 },
  { id: "s8", category: "backend/", name: "Kotlin", icon: "kotlin", level: "Modern JVM", sort_order: 8 },
  { id: "s9", category: "backend/", name: "PHP", icon: "php", level: "Web Backends", sort_order: 9 },

  // Database
  { id: "s10", category: "database/", name: "MongoDB", icon: "mongodb", level: "Document DB", sort_order: 10 },
  { id: "s11", category: "database/", name: "MySQL", icon: "mysql", level: "Relational SQL", sort_order: 11 },

  // Tools & DevOps
  { id: "s12", category: "tools/", name: "Git", icon: "git", level: "Version Control", sort_order: 12 },
  { id: "s13", category: "tools/", name: "Postman", icon: "postman", level: "API Testing", sort_order: 13 },
  { id: "s14", category: "tools/", name: "GitHub", icon: "github", level: "Collaboration", sort_order: 14 },

  // Design & Creative
  { id: "s15", category: "design/", name: "Figma", icon: "figma", level: "UI/UX Prototyping", sort_order: 15 },
  { id: "s16", category: "design/", name: "Adobe Photoshop", icon: "photoshop", level: "Asset Polish", sort_order: 16 },
  { id: "s17", category: "design/", name: "Adobe Illustrator", icon: "illustrator", level: "Vector Graphics", sort_order: 17 },
  { id: "s18", category: "design/", name: "Unity", icon: "unity", level: "3D & Game Engine", sort_order: 18 },
];

const DEFAULT_SERVICES = [
  {
    id: "8adf1061-49ff-4574-a51a-b4de1b6b4a36",
    command: "run website-development",
    icon: "globe",
    title: "Website Development",
    description: "Full websites built from scratch — planning, structure, and code, ready to deploy.",
    deliverables: ["Custom Web Apps", "Performance & SEO", "Clean Codebase"],
    is_published: true,
    sort_order: 1,
  },
  {
    id: "068e2f6b-580c-4f38-80ec-e5700a3a3f23",
    command: "run frontend-development",
    icon: "code",
    title: "Frontend Development",
    description: "Interactive UIs in React or modern JavaScript, built from designs or prototypes with rich micro-animations.",
    deliverables: ["React & Modern JS", "Component Systems", "Micro-Interactions"],
    is_published: true,
    sort_order: 2,
  },
  {
    id: "335fc607-45df-401e-8b64-a546697cb851",
    command: "run bug-fixing",
    icon: "wrench",
    title: "Bug Fixing & Code QA",
    description: "Tracking down and fixing issues in existing codebases, with clear notes on the cause and prevention.",
    deliverables: ["Root Cause Analysis", "Code Refactoring", "Regression Testing"],
    is_published: true,
    sort_order: 3,
  },
  {
    id: "95c57961-f992-4cd7-9882-086867d90344",
    command: "run responsive-design",
    icon: "mobile",
    title: "Responsive Web Design",
    description: "Layouts that work cleanly on mobile, tablet, and desktop — no breakpoints left behind.",
    deliverables: ["Mobile-First Layouts", "Fluid Breakpoints", "Cross-Browser QA"],
    is_published: true,
    sort_order: 4,
  },
  {
    id: "55a6f9ea-ff84-4ae8-8f2f-5fe3275076a6",
    command: "run api-integration",
    icon: "api",
    title: "API & Backend Integration",
    description: "Connecting your app to third-party APIs, building RESTful endpoints, and handling secure data flows.",
    deliverables: ["REST & Webhooks", "Auth & JWT Tokens", "Schema Validation"],
    is_published: true,
    sort_order: 5,
  },
  {
    id: "7e850af0-9dd8-4d1d-beda-516cd097f860",
    command: "run database-architecture",
    icon: "database",
    title: "Database Architecture",
    description: "Designing efficient schemas, indexing strategies, and reliable database operations in MongoDB & SQL.",
    deliverables: ["Schema Architecture", "Query Optimization", "Data Integrity"],
    is_published: true,
    sort_order: 6,
  },
];

const DEFAULT_SOCIAL_LINKS = [
  {
    id: "35aa00ae-db43-4315-bbbc-365287522501",
    platform: "email",
    title: "Email",
    url: "mailto:officiallahiru.p@gmail.com",
    display_value: "officiallahiru.p@gmail.com",
    category: "direct",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "374f1ec5-0558-45ec-b44c-9f79e5647cba",
    platform: "linkedin",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/lahiru-priyankara-5972742ab",
    display_value: "linkedin.com/in/lahiru-priyankara",
    category: "professional",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "d8eb1a15-b778-439f-9fc6-fe6903f7d1bc",
    platform: "facebook",
    title: "Facebook",
    url: "https://facebook.com",
    display_value: "facebook.com",
    category: "social",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "efc8b824-00d9-43c2-9e19-f54f15d742fc",
    platform: "instagram",
    title: "Instagram",
    url: "https://instagram.com",
    display_value: "instagram.com",
    category: "social",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "8c3fe80a-9957-41a4-9463-547df1c08f43",
    platform: "github",
    title: "GitHub",
    url: "https://github.com/lahiru-priyankara",
    display_value: "github.com/lahiru-priyankara",
    category: "developer",
    sort_order: 5,
    is_active: true,
  },
];

export function PortfolioProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("portfolio_site_settings");
      if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync settings with document title and localStorage
  useEffect(() => {
    try {
      localStorage.setItem("portfolio_site_settings", JSON.stringify(settings));
    } catch {
      // ignore
    }
    if (settings.browser_title) {
      document.title = settings.browser_title;
    } else if (settings.site_name) {
      document.title = `${settings.site_name} | Portfolio`;
    }

    if (settings.favicon_url) {
      let iconLink = document.querySelector("link[rel~='icon']");
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
        document.head.appendChild(iconLink);
      }
      iconLink.href = settings.favicon_url;
      if (settings.favicon_url.startsWith("data:image/svg+xml")) {
        iconLink.type = "image/svg+xml";
      } else if (settings.favicon_url.startsWith("data:image/png")) {
        iconLink.type = "image/png";
      } else if (settings.favicon_url.startsWith("data:image/x-icon")) {
        iconLink.type = "image/x-icon";
      } else if (settings.favicon_url.endsWith(".svg")) {
        iconLink.type = "image/svg+xml";
      } else if (settings.favicon_url.endsWith(".png")) {
        iconLink.type = "image/png";
      } else if (settings.favicon_url.endsWith(".ico")) {
        iconLink.type = "image/x-icon";
      }
    }
  }, [settings]);

  useEffect(() => {
    async function fetchDynamicData() {
      try {
        const [setRes, profRes, projRes, skillRes, servRes, socRes] = await Promise.allSettled([
          portfolioApi.getSettings(),
          portfolioApi.getProfile(),
          portfolioApi.getProjects(),
          portfolioApi.getSkills(),
          portfolioApi.getServices(),
          portfolioApi.getSocialLinks(),
        ]);

        if (setRes.status === "fulfilled" && setRes.value.data) {
          setSettings(setRes.value.data);
          setIsBackendConnected(true);
        }

        if (profRes.status === "fulfilled" && profRes.value.data) {
          setProfile(profRes.value.data);
          setIsBackendConnected(true);
        }

        if (projRes.status === "fulfilled" && Array.isArray(projRes.value.data)) {
          setProjects(projRes.value.data);
          setIsBackendConnected(true);
        }

        if (skillRes.status === "fulfilled" && Array.isArray(skillRes.value.data)) {
          setSkills(skillRes.value.data);
          setIsBackendConnected(true);
        }

        if (servRes.status === "fulfilled" && Array.isArray(servRes.value.data)) {
          setServices(servRes.value.data);
          setIsBackendConnected(true);
        }

        if (socRes.status === "fulfilled" && Array.isArray(socRes.value.data)) {
          setSocialLinks(socRes.value.data);
          setIsBackendConnected(true);
        }
      } catch {
        // Fallback data remains active
      }
    }

    fetchDynamicData();

    const fetchFocusProjects = async () => {
      try {
        const res = await portfolioApi.getProjects();
        if (res?.data) setProjects(res.data);
      } catch (err) {
        console.warn("Could not refresh projects:", err.message);
      }
    };

    // Auto-sync refresh: check for updated projects & GitHub commits when window gains focus
    const handleFocus = async () => {
      fetchFocusProjects();
    };

    window.addEventListener("focus", handleFocus);

    // Periodic sync interval (every 60s) to keep live GitHub commit metrics up-to-date
    const interval = setInterval(async () => {
      fetchFocusProjects();
    }, 60 * 1000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  const updateSettingsLocally = (newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem("portfolio_site_settings", JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
  };

  const refreshProjects = async () => {
    try {
      const res = await portfolioApi.getProjects();
      if (res?.data) setProjects(res.data);
    } catch (err) {
      console.warn("Could not refresh projects:", err.message);
    }
  };

  const refreshServices = async () => {
    try {
      const res = await portfolioApi.getServices();
      if (res?.data) setServices(res.data);
    } catch (err) {
      console.warn("Could not refresh services:", err.message);
    }
  };

  const refreshSkills = async () => {
    try {
      const res = await portfolioApi.getSkills();
      if (res?.data) setSkills(res.data);
    } catch (err) {
      console.warn("Could not refresh skills:", err.message);
    }
  };

  const refreshSocialLinks = async () => {
    try {
      const res = await portfolioApi.getSocialLinks();
      if (res?.data) setSocialLinks(res.data);
    } catch (err) {
      console.warn("Could not refresh social links:", err.message);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await portfolioApi.getProfile();
      if (res?.data) setProfile(res.data);
    } catch (err) {
      console.warn("Could not refresh profile:", err.message);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await portfolioApi.getSettings();
      if (res?.data) {
        setSettings(res.data);
        try {
          localStorage.setItem("portfolio_site_settings", JSON.stringify(res.data));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn("Could not refresh settings:", err.message);
    }
  };

  const refreshAll = async () => {
    await Promise.allSettled([
      refreshProjects(),
      refreshServices(),
      refreshSkills(),
      refreshSocialLinks(),
      refreshProfile(),
      refreshSettings(),
    ]);
  };

  return (
    <PortfolioContext.Provider
      value={{
        settings,
        setSettings,
        updateSettingsLocally,
        profile,
        projects,
        skills,
        services,
        socialLinks,
        setSocialLinks,
        isBackendConnected,
        refreshProjects,
        refreshServices,
        refreshSkills,
        refreshSocialLinks,
        refreshProfile,
        refreshSettings,
        refreshAll,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}
