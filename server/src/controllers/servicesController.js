import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVICES_FILE = path.resolve(__dirname, "../../data/services_data.json");

function readLocalServices() {
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const raw = fs.readFileSync(SERVICES_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (err) {
    console.error("Error reading local services file:", err.message);
  }
  return [];
}

function writeLocalServices(data) {
  try {
    const dir = path.dirname(SERVICES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local services file:", err.message);
  }
}

/**
 * Get all services (public or ?all=true for admin)
 */
export async function getServices(req, res, next) {
  try {
    const localServices = readLocalServices();
    const showAll = req.query.all === "true" || Boolean(req.headers.authorization);

    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge Supabase data with rich local data (deliverables, vector icons, is_published)
        const merged = data.map((sp) => {
          const lp = localServices.find(
            (s) =>
              String(s.id) === String(sp.id) ||
              s.title?.toLowerCase() === sp.title?.toLowerCase() ||
              (s.command && sp.command && s.command.trim() === sp.command.trim())
          );
          return {
            ...sp,
            title: lp?.title || sp.title,
            description: lp?.description || sp.description,
            icon: lp?.icon || sp.icon || "globe",
            deliverables:
              Array.isArray(lp?.deliverables) && lp.deliverables.length > 0
                ? lp.deliverables
                : Array.isArray(sp.deliverables)
                ? sp.deliverables
                : typeof lp?.deliverables === "string"
                ? lp.deliverables.split(",").map((t) => t.trim()).filter(Boolean)
                : [],
            is_published:
              lp?.is_published !== undefined
                ? lp.is_published
                : sp.is_published !== undefined
                ? sp.is_published
                : true,
          };
        });

        // Also append any new local services not in Supabase yet
        for (const ls of localServices) {
          const alreadyExists = merged.some(
            (m) =>
              String(m.id) === String(ls.id) ||
              m.title?.toLowerCase() === ls.title?.toLowerCase() ||
              (m.command && ls.command && m.command.trim() === ls.command.trim())
          );
          if (!alreadyExists) {
            merged.push(ls);
          }
        }

        merged.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

        const filtered = showAll ? merged : merged.filter((s) => s.is_published !== false);
        return res.json({ success: true, data: filtered });
      }
    } catch {
      // Supabase unavailable or table empty
    }

    const filteredLocal = showAll
      ? localServices
      : localServices.filter((s) => s.is_published !== false);

    return res.json({
      success: true,
      data: filteredLocal,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new service (admin only)
 */
export async function createService(req, res, next) {
  try {
    const { command, icon, title, description, deliverables, sort_order, is_published } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "Service title and description are required",
      });
    }

    const parsedDeliverables = Array.isArray(deliverables)
      ? deliverables
      : typeof deliverables === "string"
      ? deliverables.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const newService = {
      id: "srv_" + Date.now(),
      command: command || `run ${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      icon: icon || "globe",
      title,
      description,
      deliverables: parsedDeliverables,
      sort_order: Number(sort_order) || 0,
      is_published: is_published !== undefined ? Boolean(is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const currentList = readLocalServices();
    currentList.push(newService);
    writeLocalServices(currentList);

    // Try persisting to Supabase
    try {
      const payload = {
        command: newService.command,
        icon: newService.icon,
        title: newService.title,
        description: newService.description,
        sort_order: newService.sort_order,
      };
      const { data } = await supabaseAdmin.from("services").insert([payload]).select().single();
      if (data?.id) newService.id = data.id;
    } catch {
      // Supabase optional
    }

    return res.status(201).json({
      success: true,
      data: newService,
      message: "Service created successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing service (admin only)
 */
export async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const { command, icon, title, description, deliverables, sort_order, is_published } = req.body;

    const currentList = readLocalServices();
    let updatedItem = null;

    const updatedList = currentList.map((s) => {
      if (String(s.id) === String(id)) {
        const parsedDeliverables =
          deliverables !== undefined
            ? Array.isArray(deliverables)
              ? deliverables
              : typeof deliverables === "string"
              ? deliverables.split(",").map((x) => x.trim()).filter(Boolean)
              : []
            : s.deliverables || [];

        updatedItem = {
          ...s,
          ...req.body,
          command: command !== undefined ? command : s.command,
          icon: icon !== undefined ? icon : s.icon,
          title: title !== undefined ? title : s.title,
          description: description !== undefined ? description : s.description,
          deliverables: parsedDeliverables,
          sort_order: sort_order !== undefined ? Number(sort_order) : s.sort_order,
          is_published: is_published !== undefined ? Boolean(is_published) : s.is_published,
          updated_at: new Date().toISOString(),
        };
        return updatedItem;
      }
      return s;
    });

    if (!updatedItem) {
      // If not in local file yet, add it
      updatedItem = {
        id,
        command: command || "run service",
        icon: icon || "globe",
        title: title || "Service",
        description: description || "",
        deliverables: Array.isArray(deliverables) ? deliverables : [],
        sort_order: Number(sort_order) || 0,
        is_published: is_published !== undefined ? Boolean(is_published) : true,
        updated_at: new Date().toISOString(),
      };
      updatedList.push(updatedItem);
    }

    writeLocalServices(updatedList);

    // Try updating Supabase
    try {
      await supabaseAdmin
        .from("services")
        .update({
          command: updatedItem.command,
          icon: updatedItem.icon,
          title: updatedItem.title,
          description: updatedItem.description,
          sort_order: updatedItem.sort_order,
        })
        .eq("id", id);
    } catch {
      // ignore
    }

    return res.json({
      success: true,
      data: updatedItem,
      message: "Service updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle publish / unpublish status for a service (admin only)
 */
export async function togglePublishService(req, res, next) {
  try {
    const { id } = req.params;
    const { is_published } = req.body;
    const currentList = readLocalServices();
    let updatedItem = null;

    const updatedList = currentList.map((s) => {
      if (String(s.id) === String(id) || s.command === id) {
        const nextVal = is_published !== undefined ? Boolean(is_published) : !s.is_published;
        updatedItem = {
          ...s,
          is_published: nextVal,
          updated_at: new Date().toISOString(),
        };
        return updatedItem;
      }
      return s;
    });

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    writeLocalServices(updatedList);

    return res.json({
      success: true,
      data: updatedItem,
      message: `Service ${updatedItem.is_published ? "published" : "unpublished"} successfully`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a service (admin only)
 */
export async function deleteService(req, res, next) {
  try {
    const { id } = req.params;
    const currentList = readLocalServices();
    const updatedList = currentList.filter(
      (s) => String(s.id) !== String(id) && s.command !== id
    );
    writeLocalServices(updatedList);

    try {
      await supabaseAdmin.from("services").delete().eq("id", id);
    } catch {
      // Ignore
    }

    return res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
