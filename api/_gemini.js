const DEFAULT_MODEL = "gemini-3.8-flash";

export async function generateWithGemini({ system, contents, maxOutputTokens = 1200, jsonMode = false }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("Gemini is not configured. Add GEMINI_API_KEY to Vercel environment variables.");
    error.status = 503;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          maxOutputTokens,
          ...(jsonMode ? { responseMimeType: "application/json" } : {})
        }
      })
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(response.status === 429
      ? "Gemini free-tier limit reached. Please wait and try again."
      : "Gemini could not complete this request. Check the server configuration.");
    error.status = response.status === 429 ? 429 : 502;
    throw error;
  }

  const text = (data.candidates?.[0]?.content?.parts || [])
    .map(part => part.text || "")
    .join("\n")
    .trim();

  if (!text) {
    const error = new Error("Gemini returned an empty response. Please try again.");
    error.status = 502;
    throw error;
  }
  return text;
}
