import { useRef, useState, useEffect } from "react";
import { usePortfolio } from "../context/usePortfolio";
import ProjectTracker from "./ProjectTracker";
import "./Projects.css";

/* Professional Vector Icons (No Emojis) */
function VideoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="15" height="16" rx="2" />
      <path d="m22 7-5 5 5 5V7z" />
    </svg>
  );
}

function PhotosIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 2 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronLeftIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CloseIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowRightIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: "middle", marginLeft: 4 }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function Projects() {
  const { projects: allProjects } = usePortfolio();
  const projects = (allProjects || []).filter((p) => p.is_published !== false);
  const trackRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);

  // Active media tab per project { [projectId]: 'video' | 'gallery' }
  const [activeMediaTabs, setActiveMediaTabs] = useState({});
  // Active image index per project { [projectId]: number }
  const [activeImageIndexes, setActiveImageIndexes] = useState({});
  // Lightbox / Video modal state: { title, type: 'video' | 'gallery', videoUrl, images, activeIndex }
  const [activeModal, setActiveModal] = useState(null);

  // Responsive calculation of currently visible cards (2 rows x 2 columns = 4 on desktop)
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 720) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(4); // 2 rows x 2 cards = 4 visible
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateScrollState = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
    setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [projects]);

  // Escape key handler to close media modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveModal(null);
    };
    if (activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeModal]);

  // Single column step scrolling
  const scrollPrev = () => {
    if (trackRef.current) {
      const card = trackRef.current.querySelector(".project-card-h");
      const gap = 18;
      const step = card ? card.offsetWidth + gap : 450;
      trackRef.current.scrollBy({ left: -step, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (trackRef.current) {
      const card = trackRef.current.querySelector(".project-card-h");
      const gap = 18;
      const step = card ? card.offsetWidth + gap : 450;
      trackRef.current.scrollBy({ left: step, behavior: "smooth" });
    }
  };

  const getActiveTab = (p) => {
    if (activeMediaTabs[p.id]) return activeMediaTabs[p.id];
    if (p.demo_video_url) return "video";
    if (p.images && p.images.length > 0) return "gallery";
    return "gallery";
  };

  const setActiveTab = (pId, tab, e) => {
    if (e) e.stopPropagation();
    setActiveMediaTabs((prev) => ({ ...prev, [pId]: tab }));
  };

  const getImageIndex = (pId) => activeImageIndexes[pId] || 0;

  const nextImage = (pId, max, e) => {
    if (e) e.stopPropagation();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [pId]: ((prev[pId] || 0) + 1) % max,
    }));
  };

  const prevImage = (pId, max, e) => {
    if (e) e.stopPropagation();
    setActiveImageIndexes((prev) => ({
      ...prev,
      [pId]: ((prev[pId] || 0) - 1 + max) % max,
    }));
  };

  const formatDates = (start, end, status) => {
    if (!start && !end) return "";
    if (start && !end) return `${start} – ${status === "ongoing" ? "Present" : "Done"}`;
    if (!start && end) return `Target: ${end}`;
    return `${start} – ${end}`;
  };

  const isVideoDirect = (url = "") => {
    return Boolean(url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || url.includes("commondatastorage"));
  };

  const getEmbedVideoUrl = (url = "") => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  return (
    <section id="projects" className="section projects">
      <div className="container">
        {/* Header Row: Title & Navigation Controls */}
        <div className="projects-header-row reveal-on-scroll">
          <div>
            <span className="eyebrow">Projects.jsx</span>
            <h2 className="section-title">
              Featured <span className="accent">projects &amp; code</span>
            </h2>
          </div>

          {/* Left to Right Scroll Controls */}
          <div className="projects-nav-controls">
            <span className="projects-count-badge">
              <span className="badge-dot" />
              <span>
                {Math.min(visibleCount, projects.length)} of {projects.length} displayed (2 rows)
              </span>
              <span className="badge-hint">
                • Scroll to explore <ArrowRightIcon size={11} />
              </span>
            </span>
            <button
              type="button"
              className="projects-nav-btn"
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              title="Scroll left"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              type="button"
              className="projects-nav-btn"
              onClick={scrollNext}
              disabled={!canScrollRight}
              title="Scroll right"
              aria-label="Scroll right"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>

        {/* Scroll Progress Indicator Line */}
        <div className="projects-scroll-indicator-wrap reveal-on-scroll delay-1">
          <div
            className="projects-scroll-indicator-bar"
            style={{ width: `${Math.max(scrollProgress, 10)}%` }}
          />
        </div>

        {/* 2-ROW HORIZONTAL SCROLLING CONTAINER: Each row has 2 cards visible (4 cards total) */}
        <div className="projects-scroll-container reveal-on-scroll reveal-popup delay-2">
          <div className="projects-horizontal-track" ref={trackRef}>
            {projects.map((p, i) => {
              const hash = p.commit_hash || "latest";
              const githubUrl = p.github_url || "#";
              const demoUrl = p.demo_url || "#";
              const stack = Array.isArray(p.stack) ? p.stack : [];
              const images = Array.isArray(p.images) ? p.images : [];
              const hasVideo = Boolean(p.demo_video_url);
              const hasImages = images.length > 0;
              const currentTab = getActiveTab(p);
              const activeImgIdx = getImageIndex(p.id);
              const isOngoing = p.status === "ongoing";
              const dateRange = formatDates(p.start_date, p.end_date, p.status);

              // 2 rows x 2 columns page reading order:
              // i=0 -> Row 1, Col 1 (Top Left)
              // i=1 -> Row 1, Col 2 (Top Right)
              // i=2 -> Row 2, Col 1 (Bottom Left)
              // i=3 -> Row 2, Col 2 (Bottom Right)
              // i=4 -> Row 1, Col 3 (Next Page Top Left)...
              const pageIndex = Math.floor(i / 4);
              const posInPage = i % 4;
              const gridRow = posInPage < 2 ? 1 : 2;
              const gridColumn = pageIndex * 2 + (posInPage % 2 === 0 ? 1 : 2);
              const staggerClass = `delay-${(i % 4) + 1}`;

              return (
                <article
                  className={`project-card-h reveal-on-scroll reveal-popup ${staggerClass}`}
                  key={p.id || hash}
                  style={{ gridRow, gridColumn }}
                >
                  {/* Top Bar: Status, Dates, Hash */}
                  <div className="project-h-top">
                    <div className="project-h-status-wrap">
                      <span className={`project-status-pill ${isOngoing ? "ongoing" : "completed"}`}>
                        {isOngoing ? (
                          <>
                            <span className="live-dot" /> ONGOING
                          </>
                        ) : (
                          <>
                            <CheckIcon /> COMPLETED
                          </>
                        )}
                      </span>
                      {dateRange && <span className="project-dates-pill">{dateRange}</span>}
                    </div>
                    <span className="commit-hash">#{hash}</span>
                  </div>

                  {/* Project Title */}
                  <h3 className="project-name" title={p.name}>
                    {p.name}
                  </h3>

                  {/* SIDE-BY-SIDE ROW: Media Section (Left) and Matrix Section (Right) */}
                  <div className="project-media-matrix-row">
                    {/* LEFT COLUMN: Media (Image Gallery / Video Preview) */}
                    <div
                      className="project-media-col"
                      onClick={() => {
                        if (currentTab === "video" && hasVideo) {
                          setActiveModal({
                            title: p.name,
                            type: "video",
                            videoUrl: p.demo_video_url,
                          });
                        } else if (hasImages) {
                          setActiveModal({
                            title: p.name,
                            type: "gallery",
                            images,
                            activeIndex: activeImgIdx,
                          });
                        }
                      }}
                      title="Click to expand media"
                    >
                      {/* Compact tab toggle if both video and photos exist */}
                      {hasVideo && hasImages && (
                        <div
                          className="compact-media-tabs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className={`c-tab-btn ${currentTab === "video" ? "active" : ""}`}
                            onClick={(e) => setActiveTab(p.id, "video", e)}
                            title="Switch to Demo Video"
                          >
                            <span className="tab-icon"><VideoIcon /></span> Video
                          </button>
                          <button
                            type="button"
                            className={`c-tab-btn ${currentTab === "gallery" ? "active" : ""}`}
                            onClick={(e) => setActiveTab(p.id, "gallery", e)}
                            title="Switch to Photos"
                          >
                            <span className="tab-icon"><PhotosIcon /></span> Photos ({images.length})
                          </button>
                        </div>
                      )}

                      {/* Video Preview with Play Button */}
                      {hasVideo && currentTab === "video" ? (
                        <div className="compact-video-preview">
                          <img
                            src={
                              images[0] ||
                              "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
                            }
                            alt={`${p.name} video poster`}
                            className="compact-media-img"
                            loading="lazy"
                          />
                          <div className="compact-play-overlay">
                            <span className="compact-play-circle">
                              <PlayIcon />
                            </span>
                            <span className="compact-play-text">Demo Video</span>
                          </div>
                        </div>
                      ) : hasImages ? (
                        /* Image Preview with Gallery Nav */
                        <div className="compact-image-preview">
                          <img
                            src={images[activeImgIdx]}
                            alt={`${p.name} screenshot ${activeImgIdx + 1}`}
                            className="compact-media-img"
                            loading="lazy"
                          />
                          {images.length > 1 && (
                            <>
                              <button
                                type="button"
                                className="c-arrow c-arrow-left"
                                onClick={(e) => prevImage(p.id, images.length, e)}
                                aria-label="Previous screenshot"
                              >
                                <ChevronLeftIcon size={12} />
                              </button>
                              <button
                                type="button"
                                className="c-arrow c-arrow-right"
                                onClick={(e) => nextImage(p.id, images.length, e)}
                                aria-label="Next screenshot"
                              >
                                <ChevronRightIcon size={12} />
                              </button>
                              <span className="c-image-counter">
                                {activeImgIdx + 1}/{images.length}
                              </span>
                            </>
                          )}
                          <span className="c-zoom-hint" title="Expand view">
                            <ZoomIcon />
                          </span>
                        </div>
                      ) : (
                        /* Fallback Code Mockup if no media */
                        <div className="compact-media-placeholder">
                          <span className="placeholder-icon">{"{ ; }"}</span>
                          <span className="placeholder-text">Preview</span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Matrix (Sprint & GitHub Performance Tracker) */}
                    <div className="project-matrix-col">
                      <ProjectTracker
                        tracking={p.tracking_data}
                        isOngoing={isOngoing}
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* AFTER: Raw Description and Stack Tags */}
                  <div className="project-desc-wrap">
                    <p className="project-desc" title={p.description || p.desc}>
                      {p.description || p.desc}
                    </p>
                    <div className="project-stack">
                      {stack.map((s) => (
                        <span key={s} className="stack-tag">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AFTER TAGS ROW: Contributor Mentions */}
                  {Array.isArray(p.contributors) && p.contributors.length > 0 && (
                    <div className="project-contributors-row">
                      <span className="contributors-label">
                        <span className="contrib-icon"><UsersIcon /></span> Contributors:
                      </span>
                      <div className="contributors-list">
                        {p.contributors.map((c, i) => {
                          const username = c.username || c.login || "";
                          const displayName = c.name || username;
                          const avatar =
                            c.avatar_url ||
                            (username ? `https://avatars.githubusercontent.com/${username}` : "");
                          const profileUrl =
                            c.html_url ||
                            (username ? `https://github.com/${username}` : "#");

                          return (
                            <a
                              key={username || i}
                              href={profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contributor-badge"
                              title={`${displayName}${c.contributions ? ` (${c.contributions} contributions)` : ""}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={displayName}
                                  className="contributor-avatar"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="contributor-avatar-fallback">
                                  {displayName.charAt(0).toUpperCase()}
                                </span>
                              )}
                              <span className="contributor-name">{displayName}</span>
                              {c.contributions ? (
                                <span className="contributor-commits" title={`${c.contributions} contributions`}>
                                  {c.contributions}
                                </span>
                              ) : null}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AFTER: GitHub & Action Buttons */}
                  <div className="project-actions-footer">
                    {githubUrl && githubUrl !== "#" && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-project-link code"
                      >
                        <span className="link-icon"><GithubIcon /></span> GitHub Repo
                      </a>
                    )}
                    {demoUrl && demoUrl !== "#" && (
                      <a
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-project-link demo"
                      >
                        <span className="link-icon"><ExternalLinkIcon /></span> Live Demo
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* FULLSCREEN / LIGHTBOX MEDIA MODAL */}
        {activeModal && (
          <div
            className="project-lightbox-backdrop"
            onClick={() => setActiveModal(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="project-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="project-lightbox-header">
                <span className="project-lightbox-title">
                  {activeModal.title} {activeModal.type === "video" ? "— Demo Video" : "— Screenshots"}
                </span>
                <button
                  type="button"
                  className="project-lightbox-close"
                  onClick={() => setActiveModal(null)}
                  aria-label="Close modal"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <div className="project-lightbox-body">
                {activeModal.type === "video" ? (
                  isVideoDirect(activeModal.videoUrl) ? (
                    <video controls autoPlay className="project-modal-video">
                      <source src={activeModal.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={getEmbedVideoUrl(activeModal.videoUrl)}
                      title={`${activeModal.title} video`}
                      className="project-modal-iframe"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <div className="project-modal-gallery-wrap">
                    <img
                      src={activeModal.images[activeModal.activeIndex || 0]}
                      alt={`${activeModal.title} view`}
                      className="project-modal-img"
                    />
                    {activeModal.images?.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="modal-gallery-nav modal-nav-prev"
                          onClick={() =>
                            setActiveModal((prev) => ({
                              ...prev,
                              activeIndex:
                                ((prev.activeIndex || 0) - 1 + prev.images.length) %
                                prev.images.length,
                            }))
                          }
                          aria-label="Previous image"
                        >
                          <ChevronLeftIcon size={20} />
                        </button>
                        <button
                          type="button"
                          className="modal-gallery-nav modal-nav-next"
                          onClick={() =>
                            setActiveModal((prev) => ({
                              ...prev,
                              activeIndex: ((prev.activeIndex || 0) + 1) % prev.images.length,
                            }))
                          }
                          aria-label="Next image"
                        >
                          <ChevronRightIcon size={20} />
                        </button>
                        <div className="project-modal-counter">
                          {(activeModal.activeIndex || 0) + 1} / {activeModal.images.length}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}