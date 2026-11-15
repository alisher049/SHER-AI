# SHER AI

SHER AI is a mobile-first AI app builder with a React/Vite frontend, Supabase email/password sign-in, secure Google Gemini API routes, and an installable PWA.

## AI setup (Google Gemini)

SHER AI sends AI requests to its Vercel serverless API routes:

- `POST /api/chat` — AI assistant chat.
- `POST /api/generate` — starter source-project generation.
- `POST /api/image` — authenticated Gemini image generation; set `GEMINI_IMAGE_MODEL` to an image-capable Gemini model if needed.
- Shared server helpers: `lib/server/auth.js` and `lib/server/gemini.js` (kept outside `api/` so Vercel does not expose them as API routes).

Set `GEMINI_API_KEY` in Vercel → Project → Settings → Environment Variables. Keep it server-side: never add it to a `VITE_*` variable, frontend code, GitHub source, or the Android APK. The default model is `gemini-3.8-flash`; optionally set `GEMINI_MODEL` to another model enabled for your Google AI Studio project.

The API routes verify the user's Supabase access token before calling Gemini. They return clear errors if the key is missing, invalid, or over quota. Image generation uses `GEMINI_IMAGE_MODEL` (default `gemini-3.1-flash-image`) and the same server-only `GEMINI_API_KEY`; model access and Google usage charges/quotas depend on the Google AI account.

## Supabase sign-in

Supabase handles Gmail/password registration, six-digit email OTP verification, and login. The application and both server-side AI endpoints restrict access to the owner Gmail account configured in `src/App.jsx` and `lib/server/auth.js`; update both locations together if the owner account ever changes. The project URL and Publishable Key are public client settings, not AI credentials. The app contains its current public project configuration as a fallback. If you change projects, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the frontend build and `SUPABASE_URL` and `SUPABASE_ANON_KEY` for the Vercel API routes. Enable the Email provider in Supabase. To use the six-digit code screen, open Authentication → Email Templates → Confirm signup and use `{{ .Token }}` in the message body (not only `{{ .ConfirmationURL }}`); save the template and confirm SMTP/email delivery is configured. The app verifies the code with Supabase `verifyOtp` and supports resending it. Never use a service-role key in frontend code or the APK.

## Main features

1. Describe an app idea in Urdu, Hindi, or English.
2. Choose an app name and target platform.
3. Ask Gemini to generate a starter source project and download it as a ZIP.
4. Chat with SHER AI in Urdu or English.
5. Sign in with Gmail and a user-created password using Supabase.
6. Install the web app on supported mobile browsers as a PWA.

## Run locally

```bash
npm install
npm run dev
```

The AI API routes run on Vercel. For local API development, use the Vercel CLI and provide the environment variables above.

## Vercel deployment

The root `vercel.json` configures the Vite build output. Vercel automatically detects the serverless handlers in `api/chat.js`, `api/generate.js`, and `api/image.js`; do not add stale `functions` path patterns for files that do not exist.

After changing Environment Variables, redeploy the latest deployment so the serverless functions receive the updated values.

## Installable PWA

The project includes a web app manifest, app icon, and service worker. On supported Android browsers, open the deployed HTTPS website and choose **Install app** or **Add to Home screen**. The service worker checks the network first for page navigations, so deployed PWA updates load from Vercel. The Capacitor APK bundles its web assets; after frontend changes, build and install a new APK to update the native app.

## Android APK

The GitHub Actions workflow builds a debug APK for testing and configures the app to call the deployed Vercel API (override with the `VITE_API_BASE_URL` Actions variable if the deployment domain changes). After a successful run, download the `sher-ai-debug-apk` artifact from the workflow run. This is not a signed Play Store release.

## Important limitations

- Gemini free-tier quotas and rate limits depend on the model and Google's current policies; unlimited free use is not guaranteed.
- The generated ZIP is a starter source project, not a guaranteed production-ready app or an automatically compiled APK. Review and test generated code before publishing.
- Never place private AI API keys or Supabase service-role secrets in frontend code, Android assets, or source control.
