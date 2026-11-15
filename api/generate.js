import { requireUser } from "../lib/server/auth.js";
import { applyCors } from "../lib/server/cors.js";
import { generateWithGemini } from "../lib/server/gemini.js";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Only POST requests are allowed." });
  }

  const user = await requireUser(req);
  if (!user?.id) return json(res, 401, { error: "Please sign in to generate projects." });

  const { idea, appName, platform } = req.body || {};
  if (typeof idea !== "string" || !idea.trim() || idea.length > 6000) {
    return json(res, 400, { error: "Describe your app in 1 to 6,000 characters." });
  }

  const safeName = typeof appName === "string" ? appName.trim().slice(0, 80) : "My New App";
  const safePlatform = typeof platform === "string" ? platform.slice(0, 40) : "Web app";

  try {
    const outputText = await generateWithGemini({
      system: [
        "You are the senior engineer for SHER AI.",
        "Generate a useful, runnable starter project based on the user's app idea.",
        "Return ONLY a valid JSON object with one property named files. files must map relative file paths to complete UTF-8 text file contents.",
        "Prefer a simple responsive HTML/CSS/JavaScript project unless the user explicitly requests a framework.",
        "Include index.html, styles.css, app.js, and README.md when suitable.",
        "Do not include binary files, secrets, API keys, absolute paths, or paths containing ..",
        "Keep the result compact: no more than 10 files and no more than about 18,000 total characters.",
        "Make buttons and core interactions functional. Do not pretend frontend mockups have real backend services.",
        "Use accessible labels, mobile-first styling, and sensible empty/error states."
      ].join(" "),
      contents: [{
        role: "user",
        parts: [{ text: `App name: ${safeName}\nTarget platform: ${safePlatform}\nUser idea:\n${idea.trim()}` }]
      }],
      maxOutputTokens: 6500,
      jsonMode: true
    });

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return json(res, 502, { error: "Gemini returned an invalid project format. Please try again." });
    }

    if (!parsed.files || typeof parsed.files !== "object" || Array.isArray(parsed.files)) {
      return json(res, 502, { error: "Gemini did not return a valid set of project files." });
    }

    const files = {};
    let totalChars = 0;
    for (const [path, value] of Object.entries(parsed.files).slice(0, 10)) {
      if (typeof path !== "string" || path.startsWith("/") || path.split("/").includes("..") ||
          typeof value !== "string" || value.length > 12000) continue;
      totalChars += value.length;
      if (totalChars > 18000) break;
      files[path] = value;
    }

    if (!Object.keys(files).length) {
      return json(res, 502, { error: "Gemini generated no usable source files. Please try a simpler idea." });
    }
    return json(res, 200, { files });
  } catch (error) {
    return json(res, error.status || 502, { error: error.message || "Could not connect to Gemini. Please try again." });
  }
}
