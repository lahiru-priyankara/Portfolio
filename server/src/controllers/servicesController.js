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
            ...lp,
            ...sp,
            id: sp.id,
            title: sp.title || lp?.title || "",
            description: sp.description || lp?.description || "",
            icon: sp.icon || lp?.icon || "globe",
            deliverables:
              Array.isArray(sp.deliverables) && sp.deliverables.length > 0
                ? sp.deliverables
                : Array.isArray(lp?.deliverables) && lp.deliverables.length > 0
                ? lp.deliverables
                : typeof sp.deliverables === "string"
                ? sp.deliverables.split(",").map((t) => t.trim()).filter(Boolean)
                : typeof lp?.deliverables === "string"
                ? lp.deliverables.split(",").map((t) => t.trim()).filter(Boolean)
                : [],
            is_published:
              sp.is_published !== undefined && sp.is_published !== null
                ? Boolean(sp.is_published)
                : lp?.is_published !== undefined
                ? Boolean(lp.is_published)
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
      title: title.trim(),
      description: description.trim(),
      deliverables: parsedDeliverables,
      sort_order: Number(sort_order) || 0,
      is_published: is_published !== undefined ? Boolean(is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try persisting to Supabase first to obtain authoritative UUID
    try {
      const payload = {
        command: newService.command,
        icon: newService.icon,
        title: newService.title,
        description: newService.description,
        sort_order: newService.sort_order,
        deliverables: newService.deliverables,
        is_published: newService.is_published,
      };

      const { data, error } = await supabaseAdmin.from("services").insert([payload]).select().single();
      if (error && (error.code === "42703" || error.message?.includes("column"))) {
        delete payload.deliverables;
        delete payload.is_published;
        const { data: baseData } = await supabaseAdmin.from("services").insert([payload]).select().single();
        if (baseData?.id) newService.id = baseData.id;
      } else if (data?.id) {
        newService.id = data.id;
      }
    } catch (dbErr) {
      console.warn("Supabase service create notice:", dbErr.message);
    }

    const currentList = readLocalServices();
    currentList.push(newService);
    writeLocalServices(currentList);

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
      const isMatch =
        String(s.id) === String(id) ||
        (command && s.command === command) ||
        (title && s.title?.toLowerCase() === title.toLowerCase());

      if (isMatch) {
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
          id: s.id || id,
          command: command !== undefined ? command : s.command,
          icon: icon !== undefined ? icon : s.icon,
          title: title !== undefined ? title : s.title,
          description: description !== undefined ? description : s.description,
          deliverables: parsedDeliverables,
          sort_order: sort_order !== undefined ? Number(sort_order) : s.sort_order,
          is_published: is_published !== undefined ? Boolean(is_published) : s.is_published !== false,
          updated_at: new Date().toISOString(),
        };
        return updatedItem;
      }
      return s;
    });

    if (!updatedItem) {
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
      const payload = {
        command: updatedItem.command,
        icon: updatedItem.icon,
        title: updatedItem.title,
        description: updatedItem.description,
        sort_order: updatedItem.sort_order,
        deliverables: updatedItem.deliverables,
        is_published: updatedItem.is_published,
      };

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUUID) {
        let { error } = await supabaseAdmin.from("services").update(payload).eq("id", id);
        if (error && (error.code === "42703" || error.message?.includes("column"))) {
          delete payload.deliverables;
          delete payload.is_published;
          await supabaseAdmin.from("services").update(payload).eq("id", id);
        }
      } else {
        let { error, count } = await supabaseAdmin.from("services").update(payload).eq("command", updatedItem.command);
        if (error || count === 0) {
          delete payload.deliverables;
          delete payload.is_published;
          await supabaseAdmin.from("services").update(payload).eq("command", updatedItem.command);
        }
      }
    } catch (dbErr) {
      console.warn("Supabase service update notice:", dbErr.message);
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
      const isMatch =
        String(s.id) === String(id) ||
        s.command === id ||
        (req.body.command && s.command === req.body.command) ||
        (req.body.title && s.title?.toLowerCase() === req.body.title.toLowerCase());

      if (isMatch) {
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
      // Find in Supabase directly
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUUID) {
          const { data: dbSrv } = await supabaseAdmin.from("services").select("*").eq("id", id).maybeSingle();
          if (dbSrv) {
            const nextVal = is_published !== undefined ? Boolean(is_published) : false;
            updatedItem = {
              ...dbSrv,
              is_published: nextVal,
              updated_at: new Date().toISOString(),
            };
            updatedList.push(updatedItem);
          }
        }
      } catch {
        // ignore
      }
    }

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    writeLocalServices(updatedList);

    // Sync to Supabase
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await supabaseAdmin
          .from("services")
          .update({ is_published: updatedItem.is_published })
          .eq("id", id);
      } else {
        await supabaseAdmin
          .from("services")
          .update({ is_published: updatedItem.is_published })
          .eq("command", updatedItem.command);
      }
    } catch {
      // ignore if is_published column not migrated yet
    }

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
    const target = currentList.find(
      (s) => String(s.id) === String(id) || s.command === id
    );

    const updatedList = currentList.filter(
      (s) => String(s.id) !== String(id) && s.command !== id && (target ? s.title !== target.title : true)
    );
    writeLocalServices(updatedList);

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await supabaseAdmin.from("services").delete().eq("id", id);
      } else if (target?.command) {
        await supabaseAdmin.from("services").delete().eq("command", target.command);
      } else if (target?.title) {
        await supabaseAdmin.from("services").delete().eq("title", target.title);
      } else {
        await supabaseAdmin.from("services").delete().eq("command", id);
      }
    } catch (dbErr) {
      console.warn("Supabase delete service notice:", dbErr.message);
    }

    return res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
