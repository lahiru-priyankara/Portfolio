import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_FILE = path.resolve(__dirname, "../../data/skills_data.json");

const DEFAULT_SEEDED_SKILLS = [
  // Frontend
  { id: "s1", category: "frontend/", name: "HTML5", icon: "html5", sort_order: 1 },
  { id: "s2", category: "frontend/", name: "CSS3", icon: "css3", sort_order: 2 },
  { id: "s3", category: "frontend/", name: "JavaScript", icon: "javascript", sort_order: 3 },
  { id: "s4", category: "frontend/", name: "React", icon: "react", sort_order: 4 },

  // Backend
  { id: "s5", category: "backend/", name: "Node.js", icon: "nodejs", sort_order: 5 },
  { id: "s6", category: "backend/", name: "Express.js", icon: "express", sort_order: 6 },
  { id: "s7", category: "backend/", name: "Java", icon: "java", sort_order: 7 },
  { id: "s8", category: "backend/", name: "Kotlin", icon: "kotlin", sort_order: 8 },
  { id: "s9", category: "backend/", name: "PHP", icon: "php", sort_order: 9 },

  // Database
  { id: "s10", category: "database/", name: "MongoDB", icon: "mongodb", sort_order: 10 },
  { id: "s11", category: "database/", name: "MySQL", icon: "mysql", sort_order: 11 },

  // Tools & DevOps
  { id: "s12", category: "tools/", name: "Git", icon: "git", sort_order: 12 },
  { id: "s13", category: "tools/", name: "Postman", icon: "postman", sort_order: 13 },
  { id: "s14", category: "tools/", name: "GitHub", icon: "github", sort_order: 14 },

  // Design & Creative
  { id: "s15", category: "design/", name: "Figma", icon: "figma", sort_order: 15 },
  { id: "s16", category: "design/", name: "Adobe Photoshop", icon: "photoshop", sort_order: 16 },
  { id: "s17", category: "design/", name: "Adobe Illustrator", icon: "illustrator", sort_order: 17 },
  { id: "s18", category: "design/", name: "Unity", icon: "unity", sort_order: 18 },
];

function readLocalSkills() {
  try {
    if (fs.existsSync(SKILLS_FILE)) {
      const raw = fs.readFileSync(SKILLS_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (err) {
    console.warn("Could not read local skills file:", err.message);
  }
  return DEFAULT_SEEDED_SKILLS;
}

function writeLocalSkills(list) {
  try {
    const dir = path.dirname(SKILLS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SKILLS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local skills file:", err.message);
  }
}

/**
 * Get all skills (public)
 */
export async function getSkills(req, res, next) {
  try {
    const local = readLocalSkills();
    let dbSkills = null;

    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        dbSkills = data;
      }
    } catch {
      // Supabase unavailable or table empty
    }

    // Merge: if db has skills, enrich them with local icon/level if missing
    let combined = dbSkills || local;
    if (dbSkills && local.length > 0) {
      const localMap = new Map(local.map((s) => [s.name.toLowerCase(), s]));
      combined = dbSkills.map((s) => {
        const loc = localMap.get(s.name.toLowerCase());
        return {
          ...s,
          icon: s.icon || loc?.icon || "",
          level: s.level || loc?.level || "",
        };
      });
    }

    return res.json({
      success: true,
      data: combined,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new skill (admin only)
 */
export async function createSkill(req, res, next) {
  try {
    const { category, name, sort_order, icon, level } = req.body;

    if (!category || !name) {
      return res.status(400).json({
        success: false,
        error: "Skill category and name are required",
      });
    }

    const newSkill = {
      id: "s_" + Date.now(),
      category: category.trim(),
      name: name.trim(),
      icon: (icon || "").trim(),
      level: (level || "").trim(),
      sort_order: Number(sort_order) || 0,
      created_at: new Date().toISOString(),
    };

    // Sync to Supabase first to obtain authoritative UUID
    try {
      const { data, error } = await supabaseAdmin
        .from("skills")
        .insert([
          {
            category: newSkill.category,
            name: newSkill.name,
            icon: newSkill.icon,
            level: newSkill.level,
            sort_order: newSkill.sort_order,
          },
        ])
        .select()
        .single();

      if (error && (error.code === "42703" || error.message?.includes("column"))) {
        // Fallback without icon / level column if older schema
        const { data: fbData } = await supabaseAdmin
          .from("skills")
          .insert([
            {
              category: newSkill.category,
              name: newSkill.name,
              sort_order: newSkill.sort_order,
            },
          ])
          .select()
          .single();
        if (fbData?.id) {
          newSkill.id = fbData.id;
        }
      } else if (data?.id) {
        newSkill.id = data.id;
      }
    } catch (dbErr) {
      console.warn("Supabase skill create failed, local saved:", dbErr.message);
    }

    // Save locally with matching ID
    const currentList = readLocalSkills();
    const updatedList = [...currentList, newSkill];
    writeLocalSkills(updatedList);

    return res.status(201).json({
      success: true,
      data: newSkill,
      message: "Skill created successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a skill (admin only)
 */
export async function updateSkill(req, res, next) {
  try {
    const { id } = req.params;
    const { category, name, sort_order, icon, level } = req.body;

    const currentList = readLocalSkills();
    let updatedSkill = null;

    const updatedList = currentList.map((s) => {
      if (String(s.id) === String(id) || (name && s.name.toLowerCase() === name.toLowerCase())) {
        updatedSkill = {
          ...s,
          id: s.id || id,
          category: category ? category.trim() : s.category,
          name: name ? name.trim() : s.name,
          icon: icon !== undefined ? icon.trim() : s.icon,
          level: level !== undefined ? level.trim() : s.level,
          sort_order: sort_order !== undefined ? Number(sort_order) : s.sort_order,
        };
        return updatedSkill;
      }
      return s;
    });

    if (!updatedSkill) {
      updatedSkill = {
        id,
        category: (category || "tools/").trim(),
        name: (name || "").trim(),
        icon: (icon || "").trim(),
        level: (level || "").trim(),
        sort_order: Number(sort_order) || 0,
      };
      updatedList.push(updatedSkill);
    }

    writeLocalSkills(updatedList);

    // Sync to Supabase
    try {
      const payload = {
        category: updatedSkill.category,
        name: updatedSkill.name,
        icon: updatedSkill.icon,
        level: updatedSkill.level,
        sort_order: Number(updatedSkill.sort_order) || 0,
      };

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUUID) {
        const { error } = await supabaseAdmin.from("skills").update(payload).eq("id", id);
        if (error && (error.code === "42703" || error.message?.includes("column"))) {
          delete payload.level;
          await supabaseAdmin.from("skills").update(payload).eq("id", id);
        }
      } else {
        const { error, count } = await supabaseAdmin.from("skills").update(payload).eq("name", updatedSkill.name);
        if (error || count === 0) {
          const { data: inserted } = await supabaseAdmin.from("skills").insert([payload]).select().single();
          if (inserted?.id) {
            updatedSkill.id = inserted.id;
            const idx = updatedList.findIndex((s) => s.name === updatedSkill.name);
            if (idx >= 0) updatedList[idx].id = inserted.id;
            writeLocalSkills(updatedList);
          }
        }
      }
    } catch (dbErr) {
      console.warn("Supabase skill update notice:", dbErr.message);
    }

    return res.json({
      success: true,
      data: updatedSkill,
      message: "Skill updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a skill (admin only)
 */
export async function deleteSkill(req, res, next) {
  try {
    const { id } = req.params;

    const currentList = readLocalSkills();
    const target = currentList.find((s) => String(s.id) === String(id));
    const updatedList = currentList.filter(
      (s) => String(s.id) !== String(id) && (target ? s.name !== target.name : true)
    );
    writeLocalSkills(updatedList);

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await supabaseAdmin.from("skills").delete().eq("id", id);
      } else if (target?.name) {
        await supabaseAdmin.from("skills").delete().eq("name", target.name);
      }
    } catch (dbErr) {
      console.warn("Supabase delete skill notice:", dbErr.message);
    }

    return res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}

