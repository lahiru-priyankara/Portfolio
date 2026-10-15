import { resolveServiceIcon } from "../utils/serviceIconsData";

export default function ServiceIcon({
  icon,
  title = "",
  size = 24,
  className = "",
  style = {},
}) {
  const iconKey = resolveServiceIcon(icon, title);

  const baseSvgProps = {
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
    case "globe":
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );

    case "code":
      return (
        <svg {...baseSvgProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <polyline points="7 8 5 10 7 12" />
          <polyline points="17 8 19 10 17 12" />
          <line x1="13" y1="8" x2="11" y2="12" />
        </svg>
      );

    case "wrench":
      return (
        <svg {...baseSvgProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );

    case "mobile":
      return (
        <svg {...baseSvgProps}>
          <rect x="2" y="4" width="14" height="16" rx="2" ry="2" />
          <rect x="14" y="8" width="8" height="12" rx="1.5" ry="1.5" />
          <line x1="9" y1="17" x2="9" y2="17.01" />
          <line x1="18" y1="17" x2="18" y2="17.01" />
        </svg>
      );

    case "api":
      return (
        <svg {...baseSvgProps}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
          <circle cx="18" cy="6" r="3" />
          <path d="M15.5 8.5L8.5 15.5" />
          <circle cx="6" cy="18" r="3" />
        </svg>
      );

    case "database":
      return (
        <svg {...baseSvgProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );

    case "server":
      return (
        <svg {...baseSvgProps}>
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
          <line x1="10" y1="6" x2="14" y2="6" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
      );

    case "palette":
      return (
        <svg {...baseSvgProps}>
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
        </svg>
      );

    case "terminal":
      return (
        <svg {...baseSvgProps}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );

    case "shield":
      return (
        <svg {...baseSvgProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );

    case "zap":
      return (
        <svg {...baseSvgProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );

    case "book":
      return (
        <svg {...baseSvgProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      );

    default:
      return (
        <svg {...baseSvgProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}
