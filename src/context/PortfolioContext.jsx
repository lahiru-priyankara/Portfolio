import { useEffect, useState } from "react";
import { PortfolioContext } from "./portfolioContextDef";
import { portfolioApi } from "../api/portfolioApi";

// Default settings for site branding and intro
const DEFAULT_SETTINGS = {
  site_name: "yeshini.dev",
  browser_title: "Yeshini Wickramasinghe | Full-Stack Developer",
  intro_file_tab: "intro.js",
  intro_greeting: "Hi, I'm",
  hero_name: "Yeshini Wickramasinghe",
  hero_headline: "IT Undergraduate & Full-Stack Developer.",
  hero_sub_headline:
    "I build clean, responsive web apps — from React front-ends to Node & MongoDB back-ends — and I take on freelance projects for clients who need reliable, well-documented code.",
  code_window_title: "developer.js",
  developer_role: "Full-Stack Developer",
  developer_stack: ["React", "Node.js", "MongoDB", "Python", "Java"],
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
  full_name: "Yeshini Wickramasinghe",
  headline: "IT Undergraduate & Full-Stack Developer.",
  sub_headline:
    "I build clean, responsive web apps — from React front-ends to Node & MongoDB back-ends — and I take on freelance projects for clients who need reliable, well-documented code.",
  based_in: "Sri Lanka",
  is_available: true,
  about_paragraphs: [
    "I'm an IT undergraduate who enjoys turning ideas into working software — mostly web apps, mostly full-stack. I like the part of development where a messy requirement becomes a clean, usable interface, and I care about writing code that the next developer (often future me) can actually read.",
    "Outside coursework, I take on freelance and personal projects to keep building things end to end — from database design to the last pixel of the UI. I'm comfortable working solo with a client directly, or slotting into an existing codebase.",
  ],
  tags: ["IT Undergraduate", "Freelance Developer", "Sri Lanka", "Open to Work"],
  email: "yeshiniarchana@gmail.com",
  linkedin_url: "https://linkedin.com/in/yeshini",
  github_url: "https://github.com/YeshiniWckramasinghe",
};

const DEFAULT_PROJECTS = [
  {
    id: "p1",
    commit_hash: "c91a4f",
    name: "StudyFlow — Student Study Planner",
    description:
      "A full-stack app for managing academic subjects, assignments, and deadlines, with a real-time progress dashboard, a RESTful API on MongoDB, priority-based task management, and dark/light theming.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    github_url: "https://github.com/YeshiniWckramasinghe/studyflow",
    demo_url: "https://studyflow-preview.dev",
    status: "ongoing",
    start_date: "2024-06-01",
    end_date: "2024-11-30",
    images: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"
    ],
    demo_video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    tracking_data: {
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
    },
    contributors: [
      {
        username: "YeshiniWckramasinghe",
        name: "Yeshini W.",
        avatar_url: "https://avatars.githubusercontent.com/u/148785810?v=4",
        html_url: "https://github.com/YeshiniWckramasinghe",
        contributions: 42,
      },
      {
        username: "kasun-silva",
        name: "Kasun Silva",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        html_url: "https://github.com",
        contributions: 18,
      },
    ],
    is_featured: true,
    sort_order: 1,
  },
  {
    id: "p2",
    commit_hash: "a3f9c1",
    name: "Seagills Lanka — Food Delivery System",
    description:
      "A centralized platform to manage all parcel delivery operations — customers place delivery requests and track items in real time, while delivery staff and admins coordinate tasks for faster, accurate service.",
    stack: ["MongoDB", "Express", "Angular", "React", "Node.js"],
    github_url: "https://github.com/YeshiniWckramasinghe/Seagills-Lanka-foodDelivery-system",
    demo_url: "#",
    status: "ongoing",
    start_date: "2024-04-15",
    end_date: "2024-12-15",
    images: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&auto=format&fit=crop&q=80"
    ],
    demo_video_url: "",
    tracking_data: {
      milestone_title: "62 days until beta release",
      milestone_date: "Dec 15th",
      milestone_progress: 68,
      last_build: "Oct 10th",
      section_title: "Sprint 4 Delivery - 78%",
      total_tasks_label: "340 Tasks",
      changes_last_24h: "14 Changes in last 24hrs",
      items: [
        { name: "Frontend / UI", current: 88, total: 95, unit: "%", color: "slate" },
        { name: "Backend / API", current: 72, total: 80, unit: "%", color: "steel" },
        { name: "Database & Storage", current: 45, total: 45, unit: "%", color: "zinc" },
        { name: "Core Features & Code", current: 142, total: 190, unit: "%", color: "charcoal" },
        { name: "Testing & Bug Fixes", current: 3, total: 3, unit: "Fixed", color: "silver" },
      ],
    },
    contributors: [
      {
        username: "YeshiniWckramasinghe",
        name: "Yeshini W.",
        avatar_url: "https://avatars.githubusercontent.com/u/148785810?v=4",
        html_url: "https://github.com/YeshiniWckramasinghe",
        contributions: 35,
      },
      {
        username: "dineth-perera",
        name: "Dineth Perera",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        html_url: "https://github.com",
        contributions: 22,
      },
    ],
    is_featured: true,
    sort_order: 2,
  },
  {
    id: "p3",
    commit_hash: "7be201",
    name: "UniMart — Student Marketplace",
    description:
      "A marketplace where university students can buy and sell items within campus, with listings, search, and messaging between buyers and sellers.",
    stack: ["React", "Node.js", "MongoDB"],
    github_url: "https://github.com/YeshiniWckramasinghe/UniMart",
    demo_url: "#",
    status: "completed",
    start_date: "2023-09-01",
    end_date: "2024-02-28",
    images: [
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80"
    ],
    demo_video_url: "",
    tracking_data: {},
    contributors: [
      {
        username: "YeshiniWckramasinghe",
        name: "Yeshini W.",
        avatar_url: "https://avatars.githubusercontent.com/u/148785810?v=4",
        html_url: "https://github.com/YeshiniWckramasinghe",
        contributions: 28,
      },
    ],
    is_featured: true,
    sort_order: 3,
  },
  {
    id: "p4",
    commit_hash: "d418e7",
    name: "Wildlife Safari Management System",
    description:
      "Contributed to requirements analysis and system design — use case diagrams, CRC cards, and class diagrams — and helped build modules for user management, booking, payments, and notifications.",
    stack: ["HTML", "CSS", "PHP", "Git", "GitHub"],
    github_url: "https://github.com/YeshiniWckramasinghe/Jungle-Book-Safari-Tours",
    demo_url: "#",
    status: "completed",
    start_date: "2023-03-01",
    end_date: "2023-08-15",
    images: [
      "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80"
    ],
    demo_video_url: "",
    tracking_data: {},
    contributors: [
      {
        username: "YeshiniWckramasinghe",
        name: "Yeshini W.",
        avatar_url: "https://avatars.githubusercontent.com/u/148785810?v=4",
        html_url: "https://github.com/YeshiniWckramasinghe",
        contributions: 31,
      },
      {
        username: "sahan-fernando",
        name: "Sahan Fernando",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        html_url: "https://github.com",
        contributions: 26,
      },
    ],
    is_featured: true,
    sort_order: 4,
  },
  {
    id: "p5",
    commit_hash: "f02c56",
    name: "Rental Vehicle Management System",
    description:
      "Implemented booking management and vehicle maintenance scheduling features, and took part in system testing, debugging, and technical documentation to keep the system reliable.",
    stack: ["HTML", "CSS3", "JavaScript", "Java", "MySQL", "Git", "GitHub"],
    github_url: "https://github.com/YeshiniWckramasinghe/DriveSwift-Java-Online-Vehicle-Rental-System-",
    demo_url: "#",
    status: "completed",
    start_date: "2022-10-01",
    end_date: "2023-02-20",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80"
    ],
    demo_video_url: "",
    tracking_data: {},
    contributors: [
      {
        username: "YeshiniWckramasinghe",
        name: "Yeshini W.",
        avatar_url: "https://avatars.githubusercontent.com/u/148785810?v=4",
        html_url: "https://github.com/YeshiniWckramasinghe",
        contributions: 40,
      },
    ],
    is_featured: true,
    sort_order: 5,
  },
];

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
    id: "soc-github",
    platform: "github",
    title: "GitHub",
    url: "https://github.com/YeshiniWckramasinghe",
    display_value: "github.com/YeshiniWckramasinghe",
    category: "developer",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "soc-linkedin",
    platform: "linkedin",
    title: "LinkedIn",
    url: "https://linkedin.com/in/yeshini",
    display_value: "linkedin.com/in/yeshini",
    category: "professional",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "soc-email",
    platform: "email",
    title: "Email",
    url: "mailto:yeshiniarchana@gmail.com",
    display_value: "yeshiniarchana@gmail.com",
    category: "direct",
    sort_order: 3,
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

        if (projRes.status === "fulfilled" && projRes.value.data?.length > 0) {
          setProjects(projRes.value.data);
          setIsBackendConnected(true);
        }

        if (skillRes.status === "fulfilled" && skillRes.value.data?.length > 0) {
          setSkills(skillRes.value.data);
          setIsBackendConnected(true);
        }

        if (servRes.status === "fulfilled" && servRes.value.data?.length > 0) {
          setServices(servRes.value.data);
          setIsBackendConnected(true);
        }

        if (socRes.status === "fulfilled" && socRes.value.data?.length > 0) {
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
