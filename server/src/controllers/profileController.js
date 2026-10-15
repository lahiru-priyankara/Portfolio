import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ABOUT_FILE = path.resolve(__dirname, "../../data/about_profile.json");

const CORE_PROFILE_COLUMNS = [
  "full_name",
  "headline",
  "sub_headline",
  "based_in",
  "is_available",
  "about_paragraphs",
  "tags",
  "email",
  "linkedin_url",
  "github_url",
];

const DEFAULT_ABOUT_DATA = {
  about_file_tab: "About.jsx",
  about_title_prefix: "A little",
  about_title_highlight: "about me",
  inspector_title: "inspector.profile",
  inspector_education: "BSc (Hons) in Information Technology",
  inspector_focus: "Full-Stack Web Engineering",
  inspector_experience: "Freelance & Academic Projects",
  inspector_items: [],
};

function readLocalAbout() {
  try {
    if (fs.existsSync(ABOUT_FILE)) {
      const raw = fs.readFileSync(ABOUT_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local about_profile file:", err.message);
  }
  return {};
}

function writeLocalAbout(data) {
  try {
    const dir = path.dirname(ABOUT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local about_profile file:", err.message);
  }
}

/**
 * Get profile & about data (public)
 */
export async function getProfile(req, res, next) {
  try {
    const local = readLocalAbout();
    let dbData = null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        dbData = data;
      }
    } catch {
      // Supabase unavailable or table empty
    }

    const merged = {
      ...DEFAULT_ABOUT_DATA,
      ...local,
      ...(dbData || {}),
    };

    return res.json({
      success: true,
      data: merged,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update profile & about data (admin only)
 */
export async function updateProfile(req, res, next) {
  try {
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    // Save full dataset locally for guaranteed persistence
    const currentLocal = readLocalAbout();
    const updatedLocal = {
      ...DEFAULT_ABOUT_DATA,
      ...currentLocal,
      ...updates,
    };
    writeLocalAbout(updatedLocal);

    // Sync to Supabase
    let supabaseResult = null;
    try {
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .limit(1)
        .single();

      let result;
      if (existing) {
        result = await supabaseAdmin
          .from("profiles")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        result = await supabaseAdmin
          .from("profiles")
          .insert([updates])
          .select()
          .single();
      }

      // If column doesn't exist (code 42703), retry with core columns only
      if (result.error && (result.error.code === "42703" || result.error.message?.includes("column"))) {
        console.warn("Supabase schema missing extended columns. Retrying with core profile columns...");
        const corePayload = {};
        for (const col of CORE_PROFILE_COLUMNS) {
          if (updates[col] !== undefined) {
            corePayload[col] = updates[col];
          }
        }
        corePayload.updated_at = updates.updated_at;

        if (existing) {
          result = await supabaseAdmin
            .from("profiles")
            .update(corePayload)
            .eq("id", existing.id)
            .select()
            .single();
        } else {
          result = await supabaseAdmin
            .from("profiles")
            .insert([corePayload])
            .select()
            .single();
        }
      }

      if (result.data) {
        supabaseResult = result.data;
      }
    } catch (dbErr) {
      console.warn("Supabase sync failed, local persistence succeeded:", dbErr.message);
    }

    return res.json({
      success: true,
      data: {
        ...updatedLocal,
        ...(supabaseResult || {}),
      },
      message: "About profile updated successfully",
    });
  } catch (err) {
    next(err);
  }
}
