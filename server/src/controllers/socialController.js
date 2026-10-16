import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabaseAdmin } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOCIAL_FILE = path.resolve(__dirname, "../../data/social_links.json");

function readLocalSocialLinks() {
  try {
    if (fs.existsSync(SOCIAL_FILE)) {
      const raw = fs.readFileSync(SOCIAL_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error("Error reading social links file:", err.message);
  }
  return [];
}

function writeLocalSocialLinks(data) {
  try {
    const dir = path.dirname(SOCIAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SOCIAL_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing social links file:", err.message);
  }
}

/**
 * Optional synchronization with Supabase profiles table for core contact fields
 */
async function syncToSupabaseProfile(platform, url, displayValue) {
  try {
    const cleanPlatform = String(platform || "").toLowerCase();
    const updatePayload = {};

    if (cleanPlatform === "github") {
      updatePayload.github_url = url;
    } else if (cleanPlatform === "linkedin") {
      updatePayload.linkedin_url = url;
    } else if (cleanPlatform === "email") {
      const emailClean = (displayValue || url || "").replace(/^mailto:/i, "").trim();
      if (emailClean) updatePayload.email = emailClean;
    }

    if (Object.keys(updatePayload).length > 0) {
      await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .neq("id", "00000000-0000-0000-0000-000000000000"); // update any existing profile record
    }
  } catch {
    // Non-blocking sync
  }
}

/**
 * Get all social links (public or ?all=true for admin)
 */
/**
 * Get all social links (public or ?all=true for admin)
 */
export async function getSocialLinks(req, res, next) {
  try {
    const localLinks = readLocalSocialLinks();
    const showAll = req.query.all === "true" || Boolean(req.headers.authorization);

    try {
      const { data, error } = await supabaseAdmin
        .from("social_links")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge Supabase with local data
        const merged = data.map((dbLink) => {
          const loc = localLinks.find(
            (l) => String(l.id) === String(dbLink.id) || l.platform === dbLink.platform
          );
          return {
            ...dbLink,
            id: dbLink.id,
            display_value: dbLink.display_value || loc?.display_value || dbLink.url,
            category: dbLink.category || loc?.category || "social",
            is_active:
              dbLink.is_active !== undefined
                ? Boolean(dbLink.is_active)
                : loc?.is_active !== undefined
                ? Boolean(loc.is_active)
                : true,
          };
        });

        // Add any local links not in Supabase yet
        for (const loc of localLinks) {
          if (!merged.some((m) => String(m.id) === String(loc.id) || m.platform === loc.platform)) {
            merged.push(loc);
          }
        }

        const filtered = showAll ? merged : merged.filter((l) => l.is_active !== false);
        filtered.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
        return res.json({ success: true, data: filtered });
      }
    } catch {
      // Supabase table not created yet, fall through to local
    }

    const filtered = showAll ? localLinks : localLinks.filter((l) => l.is_active !== false);
    filtered.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

    return res.json({
      success: true,
      data: filtered,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new social link (admin only)
 */
export async function createSocialLink(req, res, next) {
  try {
    const {
      platform,
      title,
      url,
      display_value,
      category,
      sort_order,
      is_active,
    } = req.body;

    if (!platform || !url) {
      return res.status(400).json({
        success: false,
        error: "Platform and URL are required",
      });
    }

    const currentList = readLocalSocialLinks();
    const newId = `soc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newItem = {
      id: newId,
      platform: String(platform).toLowerCase().trim(),
      title: title?.trim() || platform,
      url: url.trim(),
      display_value: display_value?.trim() || url.trim().replace(/^https?:\/\//i, ""),
      category: category?.trim() || "social",
      sort_order: sort_order !== undefined ? Number(sort_order) : currentList.length + 1,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      created_at: new Date().toISOString(),
    };

    // Try saving to Supabase if table exists
    try {
      const { data, error } = await supabaseAdmin
        .from("social_links")
        .insert([
          {
            platform: newItem.platform,
            title: newItem.title,
            url: newItem.url,
            display_value: newItem.display_value,
            category: newItem.category,
            sort_order: newItem.sort_order,
            is_active: newItem.is_active,
          },
        ])
        .select()
        .single();

      if (!error && data?.id) {
        newItem.id = data.id;
      }
    } catch {
      // Table may not exist yet, local fallback used
    }

    currentList.push(newItem);
    writeLocalSocialLinks(currentList);

    // Sync to profiles if core field
    syncToSupabaseProfile(newItem.platform, newItem.url, newItem.display_value);

    return res.status(201).json({
      success: true,
      data: newItem,
      message: "Social link created successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing social link (admin only)
 */
export async function updateSocialLink(req, res, next) {
  try {
    const { id } = req.params;
    const {
      platform,
      title,
      url,
      display_value,
      category,
      sort_order,
      is_active,
    } = req.body;

    const currentList = readLocalSocialLinks();
    let updatedItem = null;

    const updatedList = currentList.map((item) => {
      if (String(item.id) === String(id) || (platform && item.platform === String(platform).toLowerCase().trim())) {
        updatedItem = {
          ...item,
          id: item.id || id,
          platform: platform !== undefined ? String(platform).toLowerCase().trim() : item.platform,
          title: title !== undefined ? title.trim() : item.title,
          url: url !== undefined ? url.trim() : item.url,
          display_value:
            display_value !== undefined ? display_value.trim() : item.display_value,
          category: category !== undefined ? category.trim() : item.category,
          sort_order: sort_order !== undefined ? Number(sort_order) : item.sort_order,
          is_active: is_active !== undefined ? Boolean(is_active) : item.is_active,
          updated_at: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    });

    if (!updatedItem) {
      updatedItem = {
        id,
        platform: String(platform || "link").toLowerCase().trim(),
        title: title || platform || "Link",
        url: url || "#",
        display_value: display_value || url || "",
        category: category || "social",
        sort_order: Number(sort_order) || 0,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        updated_at: new Date().toISOString(),
      };
      updatedList.push(updatedItem);
    }

    writeLocalSocialLinks(updatedList);

    // Try updating Supabase
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const payload = {
        platform: updatedItem.platform,
        title: updatedItem.title,
        url: updatedItem.url,
        display_value: updatedItem.display_value,
        category: updatedItem.category,
        sort_order: updatedItem.sort_order,
        is_active: updatedItem.is_active,
      };

      if (isUUID) {
        await supabaseAdmin.from("social_links").update(payload).eq("id", id);
      } else {
        await supabaseAdmin.from("social_links").update(payload).eq("platform", updatedItem.platform);
      }
    } catch {
      // Table may not exist yet
    }

    // Sync to profiles if core field
    syncToSupabaseProfile(updatedItem.platform, updatedItem.url, updatedItem.display_value);

    return res.json({
      success: true,
      data: updatedItem,
      message: "Social link updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle active / hidden status of a social link (admin only)
 */
export async function toggleStatusSocialLink(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const currentList = readLocalSocialLinks();
    let updatedItem = null;

    const updatedList = currentList.map((item) => {
      if (String(item.id) === String(id)) {
        const nextVal = is_active !== undefined ? Boolean(is_active) : !item.is_active;
        updatedItem = {
          ...item,
          is_active: nextVal,
          updated_at: new Date().toISOString(),
        };
        return updatedItem;
      }
      return item;
    });

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: "Social link not found" });
    }

    writeLocalSocialLinks(updatedList);

    // Sync to Supabase
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await supabaseAdmin.from("social_links").update({ is_active: updatedItem.is_active }).eq("id", id);
      } else {
        await supabaseAdmin.from("social_links").update({ is_active: updatedItem.is_active }).eq("platform", updatedItem.platform);
      }
    } catch {
      // Table may not exist yet
    }

    return res.json({
      success: true,
      data: updatedItem,
      message: `Social link ${updatedItem.is_active ? "activated" : "hidden"} successfully`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a social link (admin only)
 */
export async function deleteSocialLink(req, res, next) {
  try {
    const { id } = req.params;
    const currentList = readLocalSocialLinks();
    const target = currentList.find((item) => String(item.id) === String(id));
    const updatedList = currentList.filter((item) => String(item.id) !== String(id));

    if (updatedList.length === currentList.length) {
      return res.status(404).json({ success: false, error: "Social link not found" });
    }

    writeLocalSocialLinks(updatedList);

    // Sync delete to Supabase
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await supabaseAdmin.from("social_links").delete().eq("id", id);
      } else if (target?.platform) {
        await supabaseAdmin.from("social_links").delete().eq("platform", target.platform);
      }
    } catch {
      // Table may not exist yet
    }

    return res.json({
      success: true,
      message: "Social link deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
