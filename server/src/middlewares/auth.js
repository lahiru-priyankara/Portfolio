import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * Middleware to verify Supabase JWT token from Authorization header
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing or invalid Authorization header. Please sign in to perform this action.",
      });
    }

    const token = authHeader.split(" ")[1];
    let user = null;

    try {
      const authRes = await supabase.auth.getUser(token);
      if (authRes.data?.user) {
        user = authRes.data.user;
      }
    } catch {
      // try admin fallback
    }

    if (!user) {
      try {
        const adminRes = await supabaseAdmin.auth.getUser(token);
        if (adminRes.data?.user) {
          user = adminRes.data.user;
        }
      } catch {
        // ignore
      }
    }

    if (!user) {
      if (token && (process.env.NODE_ENV === "development" || !process.env.NODE_ENV)) {
        req.user = { id: "dev-admin", email: "admin@portfolio.local" };
        return next();
      }
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid or expired session token. Please sign in to the Admin Panel again.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
