// SHER AI AI-source generation endpoint. API credentials remain server-side.
import { requireUser } from "./_auth.js";
import { generateWithGemini } from "./_gemini.js";
const MAX_IDEA_CHARS = 6000;
const requestLog = new Map();

function overRateLimit(key) {
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter(time => now - time < 60_000);
  if (recent.length >= 3) return true;
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Only POST requests are allowed." });
  }

  const user = await requireUser(req);
  if (!user) return json(res, 401, { error: "Please sign in with your email to generate projects." });
  const clientIp = user.id;
  if (overRateLimit(clientIp)) return json(res, 429, { error: "Too many generation requests. Please wait a minute and try again." });

  const { idea, appName, platform } = req.body || {};
  if (typeof idea !== "string" || !idea.trim() || idea.length > MAX_IDEA_CHARS) {
    return json(res, 400, { error: "Describe your app in 1 to 6,000 characters." });
  }

  const safeName = typeof appName === "string" ? appName.trim().slice(0, 80) : "My New App";
  const safePlatform = typeof platform === "string" ? platform.slice(0, 40) : "Web app";

  try {
    const outputText = await generateWithGemini({
      system: [
        "You are the senior engineer for SHER AI.",
        "Generate a useful, runnable starter project based on the user's app idea.",
        "Return ONLY a valid JSON object with one property named files. files must be an object mapping relative file paths to complete UTF-8 text file contents.",
        "Prefer a simple responsive HTML/CSS/JavaScript project unless the user explicitly requests a framework.",
        "Include index.html, styles.css, and app.js when suitable, plus a README.md with run instructions.",
        "Do not include binary files, secrets, API keys, absolute paths, or paths containing ..",
        "Keep the result compact: no more than 10 files and no more than about 18,000 total characters.",
        "Make buttons and core interactions functional; do not claim backend features exist when only a frontend mockup is provided.",
        "Use accessible labels, responsive mobile-first styling, and sensible empty/error states.",
        "Respect the requested platform and app name."
      ].join(" "),
      contents: [{ role: "user", parts: [{ text: `App name: ${safeName}\nTarget: ${safePlatform}\nUser idea:\n${idea.trim()}` }] }],
      maxOutputTokens: 6500,
      jsonMode: true
    });

