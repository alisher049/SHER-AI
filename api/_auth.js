import { createClient } from "@supabase/supabase-js";

// These are public Supabase project settings. Server environment variables can override them.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://hltlskzpwqrhiedmomfx.supabase.co";
const supabasePublishableKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_EKo3T3p1J7vVYqMQdTN2oQ__Ig0O8N6";

export async function requireUser(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  try {
    const client = createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(token);
    return error ? null : data.user || null;
  } catch {
    return null;
  }
}
