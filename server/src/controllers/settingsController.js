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

const STORAGE_BUCKET = "site-assets";

/**
 * Upload a base64 data URL to Supabase Storage and return the permanent public URL.
 * If the value is not a data URL, returns it as-is.
 */
async function uploadBase64ToStorage(base64DataUrl, fileName) {
  if (!base64DataUrl || !base64DataUrl.startsWith("data:")) {
    return base64DataUrl; // Not a data URL, return as-is (already a URL or path)
  }

  try {
    // Parse the data URL: data:image/png;base64,iVBOR...
    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return base64DataUrl;

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine file extension from mime type
    const extMap = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/svg+xml": "svg",
      "image/x-icon": "ico",
      "image/vnd.microsoft.icon": "ico",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = extMap[mimeType] || "png";
    const storagePath = `${fileName}-${Date.now()}.${ext}`;

    // Ensure the storage bucket exists
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);
      if (!bucketExists) {
        await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
          public: true,
          allowedMimeTypes: ["image/*"],
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        });
      }
    } catch {
      // Bucket may already exist, continue
    }

    // Delete any previous favicon files to keep storage clean
    try {
      const { data: existingFiles } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .list("", { search: fileName });
      if (existingFiles?.length) {
        const filesToRemove = existingFiles
          .filter((f) => f.name.startsWith(fileName))
          .map((f) => f.name);
        if (filesToRemove.length) {
          await supabaseAdmin.storage.from(STORAGE_BUCKET).remove(filesToRemove);
        }
      }
    } catch {
      // Ignore cleanup errors
    }

    // Upload the file
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Failed to upload to Supabase Storage:", uploadError.message);
      return base64DataUrl; // Fallback to base64
    }

    // Get the public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    if (publicUrlData?.publicUrl) {
      console.log(`✅ Uploaded ${fileName} to Supabase Storage: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    }

    return base64DataUrl; // Fallback
  } catch (err) {
    console.warn("Storage upload error:", err.message);
    return base64DataUrl; // Fallback to base64
  }
}

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
    const siteSettings = {};

    // Check if site_settings table exists in Supabase (highest priority for settings like favicon)
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();
      if (!error && data) {
        Object.assign(siteSettings, data);
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
        if (prof.browser_title) dbSettings.browser_title = prof.browser_title;
        if (prof.intro_file_tab) dbSettings.intro_file_tab = prof.intro_file_tab;
        if (prof.intro_greeting) dbSettings.intro_greeting = prof.intro_greeting;
        if (prof.code_window_title) dbSettings.code_window_title = prof.code_window_title;
        if (prof.developer_role) dbSettings.developer_role = prof.developer_role;
        if (prof.developer_stack && Array.isArray(prof.developer_stack)) dbSettings.developer_stack = prof.developer_stack;
        if (prof.cta_primary_label) dbSettings.cta_primary_label = prof.cta_primary_label;
        if (prof.cta_secondary_label) dbSettings.cta_secondary_label = prof.cta_secondary_label;
      }
    } catch {
      // ignore
    }

    // Merge order: defaults → local file → profiles → site_settings (highest priority)
    // site_settings is last so uploaded favicon_url always wins
    const merged = {
      ...DEFAULT_SETTINGS,
      ...local,
      ...dbSettings,
      ...siteSettings,
    };

    // Clean up: remove Supabase internal fields from response
    delete merged.id;
    delete merged.created_at;

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

    // Upload base64 images to Supabase Storage for permanent URLs
    if (incoming.favicon_url && incoming.favicon_url.startsWith("data:")) {
      incoming.favicon_url = await uploadBase64ToStorage(incoming.favicon_url, "favicon");
    }
    if (incoming.avatar_url && incoming.avatar_url.startsWith("data:")) {
      incoming.avatar_url = await uploadBase64ToStorage(incoming.avatar_url, "avatar");
    }

    const updated = {
      ...DEFAULT_SETTINGS,
      ...local,
      ...incoming,
      updated_at: new Date().toISOString(),
    };

    // 1. Save to local JSON storage for instant persistence
    writeLocalSettings(updated);

    // 2. Attempt to save to Supabase site_settings table if it exists
    // Prepare a clean payload without internal Supabase fields
    const siteSettingsPayload = { ...updated };
    delete siteSettingsPayload.id;
    delete siteSettingsPayload.created_at;

    try {
      const { data: existingSite } = await supabaseAdmin
        .from("site_settings")
        .select("id")
        .limit(1)
        .single();

      if (existingSite) {
        await supabaseAdmin
          .from("site_settings")
          .update(siteSettingsPayload)
          .eq("id", existingSite.id);
      } else {
        await supabaseAdmin.from("site_settings").insert([siteSettingsPayload]);
      }
    } catch {
      // Table might not exist yet, which is fine
    }

    // 3. Sync hero & system fields back to profiles table
    try {
      const profileUpdates = {
        full_name: updated.hero_name || updated.full_name,
        headline: updated.hero_headline || updated.headline,
        sub_headline: updated.hero_sub_headline || updated.sub_headline,
        based_in: updated.based_in,
        is_available: updated.is_available,
        site_name: updated.site_name,
        browser_title: updated.browser_title,
        intro_file_tab: updated.intro_file_tab,
        intro_greeting: updated.intro_greeting,
        code_window_title: updated.code_window_title,
        developer_role: updated.developer_role,
        developer_stack: updated.developer_stack,
        cta_primary_label: updated.cta_primary_label,
        cta_secondary_label: updated.cta_secondary_label,
        updated_at: new Date().toISOString(),
      };

      const { data: existingProf } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .limit(1)
        .single();

      if (existingProf) {
        let { error: profUpdateErr } = await supabaseAdmin
          .from("profiles")
          .update(profileUpdates)
          .eq("id", existingProf.id);

        // If some columns were not recognized in profiles, retry with base columns
        if (profUpdateErr && profUpdateErr.code === "42703") {
          const fallbackCols = ["full_name", "headline", "sub_headline", "based_in", "is_available", "updated_at"];
          const baseUpdates = {};
          for (const col of fallbackCols) {
            if (profileUpdates[col] !== undefined) baseUpdates[col] = profileUpdates[col];
          }
          await supabaseAdmin
            .from("profiles")
            .update(baseUpdates)
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
