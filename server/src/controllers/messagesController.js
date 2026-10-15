import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabaseAdmin } from "../config/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MESSAGES_FILE = path.resolve(__dirname, "../../data/messages_data.json");

function readLocalMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error("Error reading local messages file:", err.message);
  }
  return [];
}

function writeLocalMessages(data) {
  try {
    const dir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local messages file:", err.message);
  }
}

/**
 * Submit a new contact message (public)
 */
export async function submitMessage(req, res, next) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and message are required fields",
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address",
      });
    }

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      status: "unread",
      created_at: new Date().toISOString(),
    };

    // 1. Always save locally immediately as a guaranteed fallback
    const local = readLocalMessages();
    local.unshift(newMsg);
    writeLocalMessages(local);

    // 2. Insert into Supabase using supabaseAdmin (uses service role key to bypass RLS)
    try {
      const { data, error } = await supabaseAdmin
        .from("messages")
        .insert([
          {
            name: newMsg.name,
            email: newMsg.email,
            message: newMsg.message,
            status: "unread",
          },
        ])
        .select()
        .single();

      if (!error && data) {
        // Update local record to use Supabase ID and timestamp
        const updatedLocal = readLocalMessages().map((m) =>
          m.id === newMsg.id ? { ...data } : m
        );
        writeLocalMessages(updatedLocal);

        return res.status(201).json({
          success: true,
          message: "Message received successfully",
          data,
        });
      }
    } catch (dbErr) {
      console.warn("Supabase insert notice (stored locally):", dbErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Message received successfully",
      data: newMsg,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all contact messages (admin only)
 */
export async function getMessages(req, res, next) {
  try {
    let supabaseMessages = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        supabaseMessages = data;
      }
    } catch (dbErr) {
      console.warn("Supabase messages fetch warning:", dbErr.message);
    }

    const localMessages = readLocalMessages();

    // Merge Supabase and local messages, deduplicating by ID or exact email + message match
    const combined = [...supabaseMessages];
    for (const lm of localMessages) {
      const exists = combined.some(
        (sm) => sm.id === lm.id || (sm.email === lm.email && sm.message === lm.message)
      );
      if (!exists) {
        combined.push(lm);
      }
    }

    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
      success: true,
      data: combined,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update message status (e.g., mark as read or archived) (admin only)
 */
export async function updateMessageStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["unread", "read", "archived"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be unread, read, or archived",
      });
    }

    // 1. Update in local storage
    const local = readLocalMessages();
    const updatedLocal = local.map((m) => (m.id === id ? { ...m, status } : m));
    writeLocalMessages(updatedLocal);

    // 2. Update in Supabase
    let updatedData = updatedLocal.find((m) => m.id === id);
    try {
      const { data, error } = await supabaseAdmin
        .from("messages")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        updatedData = data;
      }
    } catch (dbErr) {
      console.warn("Supabase status update warning:", dbErr.message);
    }

    return res.json({
      success: true,
      data: updatedData,
      message: `Message status updated to ${status}`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a message (admin only)
 */
export async function deleteMessage(req, res, next) {
  try {
    const { id } = req.params;

    // 1. Delete from local storage
    const local = readLocalMessages();
    const filteredLocal = local.filter((m) => m.id !== id);
    writeLocalMessages(filteredLocal);

    // 2. Delete from Supabase
    try {
      await supabaseAdmin.from("messages").delete().eq("id", id);
    } catch (dbErr) {
      console.warn("Supabase delete warning:", dbErr.message);
    }

    return res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
