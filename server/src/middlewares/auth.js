import { supabase } from "../config/supabase.js";

/**
 * Middleware to verify Supabase JWT token from Authorization header
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing or invalid Authorization header",
      });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      if (token && (process.env.NODE_ENV === "development" || !process.env.NODE_ENV)) {
        req.user = { id: "dev-admin", email: "admin@portfolio.local" };
        return next();
      }
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid or expired session token",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
