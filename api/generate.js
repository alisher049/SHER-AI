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

  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  if (overRateLimit(clientIp)) return json(res, 429, { error: "Too many generation requests. Please wait a minute and try again." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json(res, 503, { error: "AI generation is not configured. The server owner must add OPENAI_API_KEY." });

  const { idea, appName, platform } = req.body || {};
  if (typeof idea !== "string" || !idea.trim() || idea.length > MAX_IDEA_CHARS) {
    return json(res, 400, { error: "Describe your app in 1 to 6,000 characters." });
  }

  const safeName = typeof appName === "string" ? appName.trim().slice(0, 80) : "My New App";
  const safePlatform = typeof platform === "string" ? platform.slice(0, 40) : "Web app";

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        instructions: [
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
        input: `App name: ${safeName}\nTarget: ${safePlatform}\nUser idea:\n${idea.trim()}`,
        max_output_tokens: 6500
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json(res, upstream.status === 429 ? 429 : 502, {
        error: upstream.status === 429 ? "AI usage limit reached. Please try again later." : "The AI service could not generate this project. Check the API configuration."
      });
    }

    const outputText = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text || "")
      .join("\n")
      .trim();

    let parsed;
    try {
      const clean = outputText.replace(/^\u0060{3}(?:json)?\s*/i, "").replace(/\s*\u0060{3}$/i, "");
      parsed = JSON.parse(clean);
    } catch {
      return json(res, 502, { error: "AI returned an invalid project format. Please try again." });
    }

    if (!parsed.files || typeof parsed.files !== "object" || Array.isArray(parsed.files)) {
      return json(res, 502, { error: "AI did not return a valid set of project files." });
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

    if (!Object.keys(files).length) return json(res, 502, { error: "AI generated no usable source files. Please try a simpler idea." });
    return json(res, 200, { files });
  } catch {
    return json(res, 502, { error: "Could not connect to the AI generation service. Please try again." });
  }
}
