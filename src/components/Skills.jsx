import { useState } from "react";
import { usePortfolio } from "../context/usePortfolio";
import TechIcon from "./TechIcon";
import "./Skills.css";

// Category colors for badges
const CATEGORY_BADGE_CLASS = {
  "frontend/": "cat-frontend",
  "backend/": "cat-backend",
  "database/": "cat-database",
  "tools/": "cat-tools",
  "design/": "cat-design",
};

export default function Skills() {
  const { skills } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Group skills by category folder for filter count badges
  const groupedFolders = skills.reduce((acc, skill) => {
    const cat = skill.category || "other/";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(skill);
    return acc;
  }, {});

  const allCategories = Object.keys(groupedFolders);

  // Filter skills based on selected category
  const filteredSkills =
    selectedCategory === "all"
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  // Distribute filtered skills into 2 rows (alternating for visual variety)
  const row1Source = filteredSkills.filter((_, idx) => idx % 2 === 0);
  const row2Source = filteredSkills.filter((_, idx) => idx % 2 === 1);

  // Fallback if a category filter has very few items
  const finalRow1Items = row1Source.length > 0 ? row1Source : filteredSkills;
  const finalRow2Items = row2Source.length > 0 ? row2Source : filteredSkills;

  // Build seamless infinite scrolling tracks:
  // Expands the set to at least 8 items, then duplicates [set, set]
  // so that translateX(0) to translateX(-50%) creates a seamless infinite loop.
  const buildInfiniteTrack = (items, minCount = 8) => {
    if (!items || items.length === 0) return [];
    let set = [...items];
    while (set.length < minCount) {
      set = [...set, ...items];
    }
    return [...set, ...set];
  };

  const row1Track = buildInfiniteTrack(finalRow1Items);
  const row2Track = buildInfiniteTrack(finalRow2Items);

  return (
    <section id="skills" className="section skills">
      <div className="container">
        <span className="eyebrow reveal-on-scroll">Skills.jsx</span>
        <h2 className="section-title reveal-on-scroll delay-1">
          What's in my <span className="accent">stack &amp; tools</span>
        </h2>

        {/* Clean Category Filter Pills */}
        <div className="skills-filter-bar reveal-on-scroll delay-2">
          <button
            type="button"
            className={`skills-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All Stack ({skills.length})
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`skills-filter-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({groupedFolders[cat]?.length || 0})
            </button>
          ))}
        </div>

        {/* 2-ROW RIGHT-TO-LEFT ANIMATED STREAM (Floating directly on page, no enclosing box) */}
        <div className="skills-marquee-wrapper reveal-on-scroll reveal-popup delay-3">
          <div className="skills-marquee-container" aria-label="Skills animated stream">
            {/* Row 1 - Right to Left */}
            <div className="marquee-row marquee-row-1">
              <div className="marquee-track track-speed-1">
                {row1Track.map((skill, idx) => (
                  <div
                    key={`r1-${skill.id || skill.name}-${idx}`}
                    className="marquee-card"
                    title={`${skill.name} • ${skill.level || skill.category || "Skill"}`}
                  >
                    <div className="marquee-card-icon">
                      <TechIcon icon={skill.icon} name={skill.name} size={44} />
                    </div>
                    <div className="marquee-card-info">
                      <div className="marquee-card-header">
                        <span className="marquee-card-name">{skill.name}</span>
                        <span
                          className={`marquee-card-badge ${
                            CATEGORY_BADGE_CLASS[skill.category] || "cat-other"
                          }`}
                        >
                          {skill.category || "stack"}
                        </span>
                      </div>
                      {skill.level && (
                        <span className="marquee-card-level">{skill.level}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 - Right to Left (Gentle Staggered Slow Speed) */}
            <div className="marquee-row marquee-row-2">
              <div className="marquee-track track-speed-2">
                {row2Track.map((skill, idx) => (
                  <div
                    key={`r2-${skill.id || skill.name}-${idx}`}
                    className="marquee-card"
                    title={`${skill.name} • ${skill.level || skill.category || "Skill"}`}
                  >
                    <div className="marquee-card-icon">
                      <TechIcon icon={skill.icon} name={skill.name} size={44} />
                    </div>
                    <div className="marquee-card-info">
                      <div className="marquee-card-header">
                        <span className="marquee-card-name">{skill.name}</span>
                        <span
                          className={`marquee-card-badge ${
                            CATEGORY_BADGE_CLASS[skill.category] || "cat-other"
                          }`}
                        >
                          {skill.category || "stack"}
                        </span>
                      </div>
                      {skill.level && (
                        <span className="marquee-card-level">{skill.level}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
