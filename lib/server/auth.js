const SUPABASE_URL = process.env.SUPABASE_URL || "https://hltlskzpwqrhiedmomfx.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_EKo3T3p1J7vVYqMQdTN2oQ__Ig0O8N6";
const OWNER_EMAIL = "alishermeo049@gmail.com";

export async function requireUser(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) return null;
  const user = await response.json();
  if (user.email?.toLowerCase() !== OWNER_EMAIL) return null;
  return user;
}
