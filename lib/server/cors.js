const ALLOWED_ORIGINS = new Set([
  "https://sher-ai-swart.vercel.app",
  "capacitor://localhost",
  "http://localhost",
  process.env.APP_ORIGIN
].filter(Boolean));

export function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}
