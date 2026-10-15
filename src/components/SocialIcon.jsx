import { resolveSocialIcon } from "../utils/socialIconsData";

/**
 * Professional SVG Vector Icons for Social Platforms & Contact Channels
 */
export default function SocialIcon({
  platform,
  url = "",
  title = "",
  size = 18,
  className = "",
  style = {},
}) {
  const iconKey = resolveSocialIcon(platform, url, title);

  const baseProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    style,
    "aria-hidden": "true",
  };

  switch (iconKey) {
    case "github":
      return (
        <svg {...baseProps}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      );

    case "linkedin":
      return (
        <svg {...baseProps}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );

    case "email":
      return (
        <svg {...baseProps}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );

    case "twitter":
      return (
        <svg {...baseProps}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      );

    case "discord":
      return (
        <svg {...baseProps}>
          <path d="M18 6h0c-1.2-.6-2.5-1-3.9-1.2a14.2 14.2 0 0 0-.6 1.3 12.8 12.8 0 0 0-3 0 14.2 14.2 0 0 0-.6-1.3A14 14 0 0 0 6 6C3.8 9.3 3.2 12.6 3.5 15.8a14.4 14.4 0 0 0 4.4 2.2c.4-.5.7-1.1 1-1.7-1.5-.6-1.9-1.3-1.9-1.3s.2.1.4.3c2.7 1.2 5.5 1.2 8.2 0 .3-.2.4-.3.4-.3s-.4.7-1.9 1.3c.3.6.6 1.2 1 1.7a14.4 14.4 0 0 0 4.4-2.2c.4-3.8-.7-7.1-3-9.8z" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );

    case "instagram":
      return (
        <svg {...baseProps}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );

    case "youtube":
      return (
        <svg {...baseProps}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
        </svg>
      );

    case "leetcode":
      return (
        <svg {...baseProps}>
          <path d="M16 18l4-4-4-4" />
          <path d="M8 6L4 10l4 4" />
          <path d="M12 2v20" />
        </svg>
      );

    case "facebook":
      return (
        <svg {...baseProps}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );

    case "telegram":
      return (
        <svg {...baseProps}>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );

    case "whatsapp":
      return (
        <svg {...baseProps}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );

    case "phone":
      return (
        <svg {...baseProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );

    case "medium":
      return (
        <svg {...baseProps}>
          <circle cx="6" cy="12" r="4" fill="currentColor" stroke="none" />
          <ellipse cx="15" cy="12" rx="2.5" ry="4" fill="currentColor" stroke="none" />
          <ellipse cx="20" cy="12" rx="1" ry="3.5" fill="currentColor" stroke="none" />
        </svg>
      );

    case "devto":
      return (
        <svg {...baseProps}>
          <rect x="2" y="4" width="20" height="16" rx="3" />
          <path d="M7 8v8h2a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3H7z" />
          <line x1="16" y1="8" x2="18" y2="16" />
        </svg>
      );

    case "stackoverflow":
      return (
        <svg {...baseProps}>
          <path d="M4 17v4h16v-4" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <line x1="8.5" y1="13.5" x2="16" y2="15" />
          <line x1="10" y1="10" x2="16.5" y2="13.5" />
          <line x1="12" y1="7" x2="18" y2="11.5" />
        </svg>
      );

    case "dribbble":
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
          <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
          <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
        </svg>
      );

    case "behance":
      return (
        <svg {...baseProps}>
          <path d="M3 8h5a2.5 2.5 0 0 1 0 5H3V8z" />
          <path d="M3 13h5.5a2.5 2.5 0 0 1 0 5H3v-5z" />
          <path d="M14 14.5a3.5 3.5 0 1 0 6.5-1.5H14z" />
          <line x1="15" y1="8" x2="20" y2="8" />
        </svg>
      );

    case "globe":
    default:
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}
