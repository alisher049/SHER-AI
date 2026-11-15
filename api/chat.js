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
  if (!user?.id) return json(res, 401, { error: "Please sign in to use SHER AI." });

  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 12) {
    return json(res, 400, { error: "Send between 1 and 12 chat messages." });
  }

  const safeMessages = [];
  for (const message of messages) {
    if (!message || !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string" ||
        !message.content.trim() || message.content.length > 4000) {
      return json(res, 400, { error: "A message is invalid or too long (maximum 4,000 characters)." });
    }
    safeMessages.push({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim() }]
    });
  }

  try {
    const answer = await generateWithGemini({
      system: "You are SHER AI, a helpful AI assistant inside a mobile app builder. Help users plan and build apps. Reply in the language the user uses, especially Urdu or Roman Urdu when appropriate. Be accurate, concise, and honest. Never claim an app, APK, upload, or external action was completed unless it actually was. Never reveal API keys, secrets, or server configuration.",
      contents: safeMessages,
      maxOutputTokens: 1400
    });
    return json(res, 200, { answer });
  } catch (error) {
    return json(res, error.status || 502, { error: error.message || "Could not connect to Gemini. Please try again." });
  }
}
