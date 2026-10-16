import { supabase } from "../config/supabase.js";

/**
 * Handle Admin Login via Supabase Auth
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      user: data.user,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user details
 */
export async function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user,
  });
}

/**
 * Refresh expired session using refresh_token
 */
export async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: "refresh_token is required",
      });
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      user: data.user,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout
 */
export async function logout(req, res, next) {
  try {
    await supabase.auth.signOut();
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}
