import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.resolve(__dirname, "../../data/system_settings.json");

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

function readLocalSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local settings file:", err.message);
  }
  return {};
}

function writeLocalSettings(data) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local settings file:", err.message);
  }
}

/**
 * Get system & intro settings (public)
 */
export async function getSettings(req, res, next) {
  try {
    const local = readLocalSettings();
    const dbSettings = {};

    // Check if site_settings table exists in Supabase
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();
      if (!error && data) {
        Object.assign(dbSettings, data);
      }
    } catch {
      // site_settings table not yet created
    }

    // Also check profiles table to sync core profile values
    try {
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();
      if (!profErr && prof) {
        if (prof.full_name) dbSettings.hero_name = prof.full_name;
        if (prof.headline) dbSettings.hero_headline = prof.headline;
        if (prof.sub_headline) dbSettings.hero_sub_headline = prof.sub_headline;
        if (prof.based_in) dbSettings.based_in = prof.based_in;
        if (prof.is_available !== undefined) dbSettings.is_available = prof.is_available;
        if (prof.site_name) dbSettings.site_name = prof.site_name;
      }
    } catch {
      // ignore
    }

    const merged = {
      ...DEFAULT_SETTINGS,
      ...local,
      ...dbSettings,
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
 * Update system & intro settings (admin only)
 */
export async function updateSettings(req, res, next) {
  try {
    const incoming = req.body || {};
    const local = readLocalSettings();

    const updated = {
      ...DEFAULT_SETTINGS,
      ...local,
      ...incoming,
      updated_at: new Date().toISOString(),
    };

    // 1. Save to local JSON storage for instant persistence
    writeLocalSettings(updated);

    // 2. Attempt to save to Supabase site_settings table if it exists
    try {
      const { data: existingSite } = await supabaseAdmin
        .from("site_settings")
        .select("id")
        .limit(1)
        .single();

      if (existingSite) {
        await supabaseAdmin
          .from("site_settings")
          .update(updated)
          .eq("id", existingSite.id);
      } else {
        await supabaseAdmin.from("site_settings").insert([updated]);
      }
    } catch {
      // Table might not exist yet, which is fine
    }

    // 3. Sync hero fields back to profiles table
    try {
      const profileUpdates = {
        full_name: updated.hero_name || updated.full_name,
        headline: updated.hero_headline || updated.headline,
        sub_headline: updated.hero_sub_headline || updated.sub_headline,
        based_in: updated.based_in,
        is_available: updated.is_available,
        updated_at: new Date().toISOString(),
      };

      // If site_name column was added to profiles, include it
      if (updated.site_name) {
        profileUpdates.site_name = updated.site_name;
      }

      const { data: existingProf } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .limit(1)
        .single();

      if (existingProf) {
        const { error: profUpdateErr } = await supabaseAdmin
          .from("profiles")
          .update(profileUpdates)
          .eq("id", existingProf.id);

        // If site_name was not recognized in profiles, retry without it
        if (profUpdateErr && profUpdateErr.code === "42703") {
          delete profileUpdates.site_name;
          await supabaseAdmin
            .from("profiles")
            .update(profileUpdates)
            .eq("id", existingProf.id);
        }
      }
    } catch (profErr) {
      console.warn("Could not sync settings to profiles:", profErr.message);
    }

    return res.json({
      success: true,
      data: updated,
      message: "System settings updated successfully",
    });
  } catch (err) {
    next(err);
  }
}
