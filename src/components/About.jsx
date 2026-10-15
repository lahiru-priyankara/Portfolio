import { usePortfolio } from "../context/usePortfolio";
import "./About.css";

const FALLBACK_PARAGRAPHS = [
  "I'm an IT undergraduate who enjoys turning ideas into working software — mostly web apps, mostly full-stack. I like the part of development where a messy requirement becomes a clean, usable interface, and I care about writing code that the next developer (often future me) can actually read.",
  "Outside coursework, I take on freelance and personal projects to keep building things end to end — from database design to the last pixel of the UI. I'm comfortable working solo with a client directly, or slotting into an existing codebase.",
];

const FALLBACK_TAGS = ["IT Undergraduate", "Freelance Developer", "Sri Lanka", "Open to Work"];

export default function About() {
  const { profile } = usePortfolio();

  const fileTab = profile?.about_file_tab || "About.jsx";
  const titlePrefix = profile?.about_title_prefix || "A little";
  const titleHighlight = profile?.about_title_highlight || "about me";
  const paragraphs =
    profile?.about_paragraphs?.length > 0 ? profile.about_paragraphs : FALLBACK_PARAGRAPHS;
  const tags = profile?.tags?.length > 0 ? profile.tags : FALLBACK_TAGS;
  const isAvailable = profile?.is_available ?? true;
  const basedIn = profile?.based_in || "Sri Lanka";

  const inspectorTitle = profile?.inspector_title || "inspector.profile";
  const education = profile?.inspector_education || "BSc (Hons) in Information Technology";
  const focus = profile?.inspector_focus || "Full-Stack Web Engineering";
  const experience = profile?.inspector_experience || "Freelance & Academic Projects";
  const customItems = Array.isArray(profile?.inspector_items) ? profile.inspector_items : [];

  return (
    <section id="about" className="section about">
      <div className="container">
        <span className="eyebrow reveal-on-scroll">{fileTab}</span>
        <h2 className="section-title reveal-on-scroll delay-1">
          {titlePrefix} <span className="accent">{titleHighlight}</span>
        </h2>

        <div className="about-layout">
          {/* Main Code Editor Bio */}
          <div className="code-block reveal-on-scroll reveal-popup delay-2">
            {paragraphs.map((p, idx) => (
              <div className="code-row" key={idx}>
                <span className="line-no">{String(idx + 1).padStart(2, "0")}</span>
                <p>{p}</p>
              </div>
            ))}

            <div className="code-row tag-code-row">
              <div className="tag-row">
                {tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* IDE Inspector Profile Summary */}
          <aside className="about-inspector reveal-on-scroll reveal-popup delay-3">
            <div className="inspector-header">
              <span className="dot dot-red" />
              <span className="dot dot-amber" />
              <span className="dot dot-green" />
              <span className="inspector-title">{inspectorTitle}</span>
            </div>
            <div className="inspector-body">
              <div className="inspector-item">
                <span className="inspector-key">status:</span>
                <span className={`inspector-status-val ${isAvailable ? "available" : "busy"}`}>
                  <span className="status-indicator" />
                  {isAvailable ? "Available for hire" : "Busy on projects"}
                </span>
              </div>
              <div className="inspector-item">
                <span className="inspector-key">location:</span>
                <span className="inspector-val">{basedIn}</span>
              </div>
              <div className="inspector-item">
                <span className="inspector-key">education:</span>
                <span className="inspector-val">{education}</span>
              </div>
              <div className="inspector-item">
                <span className="inspector-key">focus:</span>
                <span className="inspector-val">{focus}</span>
              </div>
              <div className="inspector-item">
                <span className="inspector-key">experience:</span>
                <span className="inspector-val">{experience}</span>
              </div>

              {/* Dynamic Custom Inspector Items */}
              {customItems.map((item, idx) => (
                <div className="inspector-item" key={idx}>
                  <span className="inspector-key">{item.key}:</span>
                  <span className="inspector-val">{item.val}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
