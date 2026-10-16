import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://lgacksaciawxmqzxpnxv.supabase.co";

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_izWvgQfrVZxLZ_i-d9A3IA_S4FLj2qV";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "sb_secret_gRYkuJ71ma_UnGdZ6oUM1w_XVRgwZfP";

// Client for public operations (respects public RLS)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Admin client for backend administration (uses service role key to manage tables and bypass public restrictions)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
