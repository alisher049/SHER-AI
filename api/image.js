import { requireUser } from "../lib/server/auth.js";
import { applyCors } from "../lib/server/cors.js";

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
  if (!user?.id) return json(res, 401, { error: "براہِ کرم پہلے SHER AI میں لاگ اِن کریں۔" });

  const prompt = req.body?.prompt;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 3000) {
    return json(res, 400, { error: "تصویر کی تفصیل 1 سے 3000 حروف کے درمیان لکھیں۔" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(res, 503, { error: "تصویر بنانے کی سہولت فعال کرنے کے لیے Vercel میں GEMINI_API_KEY شامل کرکے دوبارہ Deploy کریں۔" });
  }

  // Use the documented generateContent image response path for reliable REST output parsing.
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Generate one high-quality image from this description. Return an image. Prompt: " + prompt.trim() }] }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
          }
        })
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || "Google image generation request failed.";
      return json(res, response.status === 429 ? 429 : 502, { error: message });
    }

    const parts = (data.candidates || []).flatMap(candidate => candidate.content?.parts || []);
    const imagePart = parts.find(part => part.inlineData?.data || part.inline_data?.data);
    const imageData = imagePart?.inlineData?.data || imagePart?.inline_data?.data;
    const mimeType = imagePart?.inlineData?.mimeType || imagePart?.inline_data?.mime_type || "image/jpeg";
    if (!imageData || !/^image\/(png|jpeg|webp)$/.test(mimeType)) {
      const reason = data.candidates?.[0]?.finishReason;
      return json(res, 502, { error: reason ? "Google نے تصویر مکمل نہیں کی (" + reason + ")۔ مختلف تفصیل کے ساتھ دوبارہ کوشش کریں۔" : "AI نے تصویر واپس نہیں کی۔ ماڈل، اکاؤنٹ کی دستیابی اور Google API کی حدود چیک کریں۔" });
    }

    return json(res, 200, { image: imageData, mimeType });
  } catch {
    return json(res, 502, { error: "تصویر بنانے والے سرور سے رابطہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔" });
  }
}
