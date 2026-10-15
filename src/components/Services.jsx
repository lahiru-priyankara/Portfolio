import { usePortfolio } from "../context/usePortfolio";
import ServiceIcon from "./ServiceIcon";
import "./Services.css";

function ArrowUpRightIcon({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function CheckIcon({ size = 11 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Fallback deliverables tailored to common engineering services
const DEFAULT_DELIVERABLES_MAP = {
  website: ["Custom Web Apps", "Performance & SEO", "Clean Codebase"],
  frontend: ["React & Modern JS", "Component Systems", "Micro-Interactions"],
  bug: ["Root Cause Analysis", "Codebase Refactoring", "Regression Testing"],
  responsive: ["Mobile-First Layouts", "Fluid Breakpoints", "Cross-Browser QA"],
  api: ["REST & Webhooks", "Auth & JWT Tokens", "Schema Validation"],
  database: ["Schema Architecture", "Query Optimization", "Data Integrity"],
  backend: ["Microservices", "Scalable Routing", "Secure Server Logic"],
  design: ["Figma to Code", "Interactive Prototypes", "Design Systems"],
};

function getDeliverables(srv) {
  if (Array.isArray(srv.deliverables) && srv.deliverables.length > 0) {
    return srv.deliverables;
  }
  if (typeof srv.deliverables === "string" && srv.deliverables.trim()) {
    return srv.deliverables.split(",").map((t) => t.trim()).filter(Boolean);
  }

  // Derive smart default deliverables from title/command
  const text = `${srv.title} ${srv.command || ""}`.toLowerCase();
  for (const [key, list] of Object.entries(DEFAULT_DELIVERABLES_MAP)) {
    if (text.includes(key)) return list;
  }

  return ["Full-Cycle Delivery", "Well-Documented", "High Reliability"];
}

export default function Services() {
  const { services } = usePortfolio();

  // Filter out any explicitly unpublished services
  const publishedServices = (services || []).filter((s) => s.is_published !== false);

  return (
    <section id="services" className="section services">
      <div className="container">
        {/* Section Header */}
        <div className="services-header-wrap reveal-on-scroll">
          <div className="services-header-main">
            <span className="eyebrow">Services.jsx</span>
            <h2 className="section-title">
              Engineering <span className="accent">solutions &amp; services</span>
            </h2>
            <p className="services-subtitle">
              End-to-end web applications, modern interactive frontends, and reliable backend architectures built with clean code and dependable execution.
            </p>
          </div>
        </div>

        {/* Terminal Wrapper */}
        <div className="terminal services-terminal reveal-on-scroll reveal-popup delay-1">
          <div className="window-bar">
            <span className="dot dot-red" />
            <span className="dot dot-amber" />
            <span className="dot dot-green" />
            <span className="window-title">zsh — active_services.json</span>
            <div className="terminal-bar-right">
              <span className="term-cmd-preview">
                ➜ <span className="term-cmd-run">npm run list-services</span>
              </span>
            </div>
          </div>

          <div className="terminal-body services-grid">
            {publishedServices.map((s, index) => {
              const deliverables = getDeliverables(s);
              const cmdString = s.command || `run ${s.title.toLowerCase().replace(/\s+/g, "-")}`;
              const indexFormatted = String(index + 1).padStart(2, "0");
              const staggerClass = `delay-${(index % 4) + 1}`;

              return (
                <article className={`term-line service-card reveal-on-scroll reveal-popup ${staggerClass}`} key={s.id || cmdString}>
                  {/* Top Bar: Terminal Command + Index */}
                  <div className="service-card-top">
                    <div className="term-cmd service-cmd">
                      <span className="prompt">➜</span>
                      <span className="cmd-prefix">npm</span>
                      <span className="cmd-name">{cmdString}</span>
                    </div>
                    <span className="service-number" title={`Service #${indexFormatted}`}>
                      #{indexFormatted}
                    </span>
                  </div>

                  {/* Icon & Title Row */}
                  <div className="service-main-row">
                    <div className="service-icon-wrap" aria-hidden="true">
                      <ServiceIcon icon={s.icon} title={s.title} size={22} />
                    </div>
                    <div className="service-title-col">
                      <h3 className="output-title service-title">{s.title}</h3>
                      <span className="service-status-tag">ACTIVE CAPABILITY</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="output-desc service-desc">{s.description || s.desc}</p>

                  {/* Deliverables / Feature Tags */}
                  <div className="service-deliverables">
                    {deliverables.map((item) => (
                      <span key={item} className="deliverable-tag">
                        <span className="deliverable-bullet">›</span> {item}
                      </span>
                    ))}
                  </div>

                  {/* Footer Bar: Ready state + Contact inquiry */}
                  <div className="service-card-footer">
                    <span className="service-ready-badge">
                      <CheckIcon size={10} /> Production Ready
                    </span>
                    <a href="#contact" className="service-inquire-btn" title={`Inquire about ${s.title}`}>
                      <span>Discuss</span>
                      <ArrowUpRightIcon size={12} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
