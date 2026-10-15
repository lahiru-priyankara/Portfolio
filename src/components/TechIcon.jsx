import { detectTechIcon } from "../utils/techIconsData.js";


export default function TechIcon({ icon, name, size = 32, style = {} }) {
  const iconKey = (icon || detectTechIcon(name) || "").toLowerCase().trim();

  // If icon is a direct image URL (e.g. https:// or /...)
  if (iconKey.startsWith("http://") || iconKey.startsWith("https://") || iconKey.startsWith("/")) {
    return (
      <img
        src={iconKey}
        alt={name || "skill"}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          objectFit: "contain",
          background: "var(--surface-2)",
          ...style,
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  // Pre-configured crisp badge components
  switch (iconKey) {
    case "html5":
    case "html":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#E34F26" />
          <path d="M9 7L11.7 33L20 35.3L28.3 33L31 7H9Z" fill="#E34F26" />
          <path d="M20 9.2V33.1L26.5 31.3L28.8 9.2H20Z" fill="#EF652A" />
          <path d="M20 14.8H14.8L15.3 19.5H20V24.1L15.7 22.9L15.5 20.3H12.9L13.3 25.7L20 27.6V14.8Z" fill="#EBEBEB" />
          <path d="M20 14.8V19.5H24.7L24.3 24.1L20 25.3V27.6L26.7 25.7L27.2 20.3L27.3 19.5L27.7 14.8H20Z" fill="#FFFFFF" />
        </svg>
      );

    case "css3":
    case "css":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1572B6" />
          <path d="M9 7L11.7 33L20 35.3L28.3 33L31 7H9Z" fill="#1572B6" />
          <path d="M20 9.2V33.1L26.5 31.3L28.8 9.2H20Z" fill="#33A9DC" />
          <path d="M20 14.8H14.8L15.3 19.5H20V14.8ZM20 24.1L15.7 22.9L15.5 20.3H12.9L13.3 25.7L20 27.6V24.1Z" fill="#EBEBEB" />
          <path d="M20 14.8V19.5H24.7L24.3 24.1L20 25.3V27.6L26.7 25.7L27.2 20.3L27.7 14.8H20Z" fill="#FFFFFF" />
        </svg>
      );

    case "javascript":
    case "js":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#F7DF1E" />
          <path d="M14.5 31.5C16.2 31.5 17.5 30.6 18.2 29.3L16.1 28C15.6 28.8 15 29.3 14.2 29.3C13.2 29.3 12.6 28.6 12.6 27V18H10V27.2C10 30 11.7 31.5 14.5 31.5ZM23.4 31.5C26.5 31.5 28.5 29.8 28.5 27.2C28.5 24.7 26.9 23.6 24.4 22.5L23.5 22.1C22.1 21.5 21.4 20.9 21.4 19.9C21.4 18.8 22.3 18.1 23.5 18.1C24.7 18.1 25.4 18.7 25.8 19.7L28 18.5C27.2 16.9 25.6 16 23.5 16C20.6 16 18.8 17.7 18.8 20.2C18.8 22.7 20.3 23.8 22.6 24.8L23.5 25.2C25.1 25.9 25.9 26.6 25.9 27.6C25.9 28.8 24.8 29.5 23.4 29.5C21.8 29.5 20.9 28.6 20.3 27.2L18.1 28.4C18.9 30.3 20.9 31.5 23.4 31.5Z" fill="#000000" />
        </svg>
      );

    case "react":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#20232A" />
          <ellipse cx="20" cy="20" rx="4" ry="4" fill="#61DAFB" />
          <g stroke="#61DAFB" strokeWidth="1.6" fill="none">
            <ellipse cx="20" cy="20" rx="14" ry="5.3" />
            <ellipse cx="20" cy="20" rx="14" ry="5.3" transform="rotate(60 20 20)" />
            <ellipse cx="20" cy="20" rx="14" ry="5.3" transform="rotate(120 20 20)" />
          </g>
        </svg>
      );

    case "nodejs":
    case "node":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1C2D22" />
          <path d="M20 8L31 14.4V27.2L20 33.6L9 27.2V14.4L20 8Z" fill="#339933" />
          <path d="M20 10.5L28.8 15.6V25.8L20 30.9L11.2 25.8V15.6L20 10.5Z" fill="#1C2D22" />
          <path d="M17.5 17.5H19.8V25H17.5V17.5ZM21.5 17.5H23.8V22C23.8 23 24.4 23.5 25.2 23.5C25.8 23.5 26.3 23.2 26.3 23.2V25C26.3 25 25.5 25.3 24.6 25.3C23 25.3 21.5 24.3 21.5 22.4V17.5Z" fill="#68A063" />
        </svg>
      );

    case "express":
    case "ex":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#18181B" />
          <text x="20" y="26" fill="#FFFFFF" fontSize="19" fontFamily="monospace" fontWeight="700" textAnchor="middle">
            ex
          </text>
        </svg>
      );

    case "mongodb":
    case "mongo":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#10241A" />
          <path d="M20 6C20 6 13.5 14.5 13.5 22.2C13.5 27.5 16.5 31.8 20 34C23.5 31.8 26.5 27.5 26.5 22.2C26.5 14.5 20 6 20 6Z" fill="#13AA52" />
          <path d="M20 6V34C20 34 26 29 26 22.2C26 15 20 6 20 6Z" fill="#47A248" />
          <path d="M20 34V35.5L19.5 34.5L20 34Z" fill="#999999" />
        </svg>
      );

    case "mysql":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1A2D3F" />
          {/* Dolphin silhouette */}
          <path d="M28 14C24 11 17 12 14 16C12 19 11 23 12 26C12.5 28 14 29 16 28C18 27 18.5 24 20 22C22 19 25 18 28 19C29 17 30 15 28 14Z" fill="#00758F" />
          <path d="M26 15C22 13 17 14 15 17C14 19 13.5 21 14 23C15 21 17 20 19 21C22 22 25 21 27 19C27.5 17.5 27 16 26 15Z" fill="#F29111" />
        </svg>
      );

    case "java":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1E293B" />
          {/* Coffee cup with steam */}
          <path d="M19.5 9C17 12 21 13 19 16" stroke="#EA2D2E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M23 8C20.5 11 24.5 12 22.5 15" stroke="#007396" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M14 18H26C26 24 23 27 20 27C17 27 14 24 14 18Z" fill="#007396" />
          <path d="M26 20C28 20 29 21 29 22.5C29 24 28 25 26 25" stroke="#007396" strokeWidth="1.6" fill="none" />
          <path d="M12 29C17 31 23 31 28 29" stroke="#EA2D2E" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case "kotlin":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1E1E2E" />
          <defs>
            <linearGradient id="kg" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7F52FF" />
              <stop offset="50%" stopColor="#C711E1" />
              <stop offset="100%" stopColor="#E4485D" />
            </linearGradient>
          </defs>
          <path d="M10 10H30L20 20L30 30H10V10Z" fill="url(#kg)" />
          <path d="M10 10H20L10 20V10Z" fill="#7F52FF" />
        </svg>
      );

    case "php":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#2E3440" />
          <text x="20" y="26" fill="#8892BF" fontSize="16" fontFamily="sans-serif" fontStyle="italic" fontWeight="bold" textAnchor="middle">
            php
          </text>
        </svg>
      );

    case "git":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#F05032" />
          <g transform="translate(10, 10)">
            <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" transform="rotate(45 10 10)" fill="#F05032" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="7" cy="10" r="2.2" fill="#FFFFFF" />
            <circle cx="13" cy="7" r="2.2" fill="#FFFFFF" />
            <circle cx="13" cy="13" r="2.2" fill="#FFFFFF" />
            <path d="M7 10H10C11.5 10 13 9 13 7M10 10V13" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </svg>
      );

    case "postman":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#FF6C37" />
          {/* Postman astronaut flyer */}
          <circle cx="20" cy="15" r="5" fill="#FFFFFF" />
          <path d="M13 22C13 19 16 18 20 18C24 18 27 19 27 22L29 27H11L13 22Z" fill="#FFFFFF" />
          <path d="M20 23L27 29M20 23L13 29" stroke="#FF6C37" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "github":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#181717" />
          <path d="M20 8C13.4 8 8 13.4 8 20C8 25.3 11.4 29.8 16.2 31.4C16.8 31.5 17 31.1 17 30.8V28.7C13.7 29.4 13 27.1 13 27.1C12.5 25.7 11.7 25.3 11.7 25.3C10.6 24.5 11.8 24.5 11.8 24.5C13 24.6 13.7 25.8 13.7 25.8C14.8 27.7 16.5 27.2 17.2 26.8C17.3 26 17.6 25.4 18 25C15.3 24.7 12.5 23.7 12.5 19.1C12.5 17.8 13 16.7 13.8 15.8C13.7 15.5 13.3 14.3 14 12.6C14 12.6 15 12.3 17.3 13.8C18.3 13.5 19.3 13.4 20.3 13.4C21.3 13.4 22.3 13.5 23.3 13.8C25.6 12.3 26.6 12.6 26.6 12.6C27.3 14.3 26.9 15.5 26.8 15.8C27.6 16.7 28.1 17.8 28.1 19.1C28.1 23.7 25.3 24.7 22.6 25C23.1 25.4 23.5 26.3 23.5 27.6V30.8C23.5 31.1 23.7 31.5 24.3 31.4C29.1 29.8 32.5 25.3 32.5 20C32.5 13.4 27.1 8 20 8Z" fill="#FFFFFF" />
        </svg>
      );

    case "figma":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1E1E1E" />
          <g transform="translate(12, 8)">
            <path d="M8 0H4C1.8 0 0 1.8 0 4C0 6.2 1.8 8 4 8H8V0Z" fill="#F24E1E" />
            <path d="M16 4C16 1.8 14.2 0 12 0H8V8H12C14.2 8 16 6.2 16 4Z" fill="#FF7262" />
            <path d="M8 8H4C1.8 8 0 9.8 0 12C0 14.2 1.8 16 4 16H8V8Z" fill="#A259FF" />
            <path d="M16 12C16 9.8 14.2 8 12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12Z" fill="#1ABCFE" />
            <path d="M0 20C0 22.2 1.8 24 4 24C6.2 24 8 22.2 8 20V16H4C1.8 16 0 17.8 0 20Z" fill="#0ACF83" />
          </g>
        </svg>
      );

    case "photoshop":
    case "ps":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#001E36" />
          <text x="20" y="27" fill="#31A8FF" fontSize="18" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
            Ps
          </text>
        </svg>
      );

    case "illustrator":
    case "ai":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#330000" />
          <text x="20" y="27" fill="#FF9A00" fontSize="18" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
            Ai
          </text>
        </svg>
      );

    case "unity":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#222C37" />
          {/* 3D Cube */}
          <path d="M20 9L29 14.5V25.5L20 31L11 25.5V14.5L20 9Z" fill="#FFFFFF" />
          <path d="M20 12L26 15.5L20 19L14 15.5L20 12Z" fill="#E2E8F0" />
          <path d="M13 18L19 21.5V28L13 24.5V18Z" fill="#94A3B8" />
          <path d="M27 18V24.5L21 28V21.5L27 18Z" fill="#64748B" />
        </svg>
      );

    case "python":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1E293B" />
          <path d="M19.6 9C14.7 9 15 11.1 15 11.1L15.1 13.3H20.2V14H13.2C11.3 14 9.8 15.2 9.8 17.5C9.8 19.8 11.4 20.9 13.2 20.9H14.7V19.4C14.7 17.7 16.1 16.3 17.8 16.3H22.9C24.4 16.3 25.6 15 25.6 13.6V11.4C25.6 9.8 24.1 9 19.6 9ZM17.3 10.4C17.9 10.4 18.4 10.9 18.4 11.5C18.4 12.1 17.9 12.6 17.3 12.6C16.7 12.6 16.2 12.1 16.2 11.5C16.2 10.9 16.7 10.4 17.3 10.4Z" fill="#3776AB" />
          <path d="M20.4 31C25.3 31 25 28.9 25 28.9L24.9 26.7H19.8V26H26.8C28.7 26 30.2 24.8 30.2 22.5C30.2 20.2 28.6 19.1 26.8 19.1H25.3V20.6C25.3 22.3 23.9 23.7 22.2 23.7H17.1C15.6 23.7 14.4 25 14.4 26.4V28.6C14.4 30.2 15.9 31 20.4 31ZM22.7 29.6C22.1 29.6 21.6 29.1 21.6 28.5C21.6 27.9 22.1 27.4 22.7 27.4C23.3 27.4 23.8 27.9 23.8 28.5C23.8 29.1 23.3 29.6 22.7 29.6Z" fill="#FFD43B" />
        </svg>
      );

    case "docker":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#1D272B" />
          <path d="M12 18H15V21H12V18ZM16 18H19V21H16V18ZM20 18H23V21H20V18ZM16 14H19V17H16V14ZM20 14H23V17H20V14ZM24 14H27V17H24V14ZM20 10H23V13H20V10Z" fill="#2496ED" />
          <path d="M32 20C31 20 29.5 21 29 21.8C27 21 24.5 21 22 22H10C9.5 22 9 22.5 9 23C9 26.5 12 30 18 30C25 30 28.5 26.5 29.5 22.5C31.5 22.5 33 21 33 20H32Z" fill="#2496ED" />
        </svg>
      );

    case "tailwind":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#0F172A" />
          <path d="M15 15C16.5 12 19 10.5 22.5 10.5C27 10.5 28.5 14 30.5 14.5C32 15 33 14 34 13C32.5 16 30 17.5 26.5 17.5C22 17.5 20.5 14 18.5 13.5C17 13 16 14 15 15ZM8 23C9.5 20 12 18.5 15.5 18.5C20 18.5 21.5 22 23.5 22.5C25 23 26 22 27 21C25.5 24 23 25.5 19.5 25.5C15 25.5 13.5 22 11.5 21.5C10 21 9 22 8 23Z" fill="#38BDF8" />
        </svg>
      );

    case "typescript":
    case "ts":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
          <rect width="40" height="40" rx="8" fill="#3178C6" />
          <text x="20" y="27" fill="#FFFFFF" fontSize="17" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
            TS
          </text>
        </svg>
      );

    default:
      // Fallback: elegant dark badge with initials
      {
        const initials = (name || "SK")
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: size * 0.42,
              fontWeight: 700,
              color: "var(--accent-teal)",
              ...style,
            }}
          >
            {initials}
          </div>
        );
      }
  }
}
