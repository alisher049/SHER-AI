# SHER AI

SHER AI is a mobile-first personal AI assistant and app-building workspace. It uses React/Vite, Supabase email OTP authentication, server-side Google Gemini API routes, and Capacitor for Android packaging.

## Owner-only Gmail sign-in

- The app is restricted to the owner Gmail account configured in `src/App.jsx` and `lib/server/auth.js`.
- Sign-in uses a Gmail address and a six-digit email verification code. No app password is requested.
- Supabase handles OTP delivery and verification. In Supabase, enable the Email provider and configure **Authentication → Email Templates → Confirm signup** to include `{{ .Token }}` (not only `{{ .ConfirmationURL }}`). Confirm that email delivery/SMTP is configured.
- The owner must verify the code in the app. Never share Gmail passwords, verification codes, service-role keys, or API secrets.
- If the owner email changes, update both frontend and server-side owner checks together.

## Features currently present in the source

1. Urdu/English sign-in interface and owner-only access check.
2. AI chat using the server-side `POST /api/chat` route.
3. Image and PDF attachment handling in chat (JPG, PNG, WEBP, PDF; 2.5 MB client-side limit).
4. Voice typing through browser speech recognition where supported.
5. Read-aloud using browser speech synthesis where supported.
6. Smart tools for arithmetic, translation, rewriting, and summarization.
7. AI image generation through `POST /api/image`.
8. Fast Studio for generated HTML/CSS/JavaScript, in-browser preview, code copy, and source ZIP export.
9. Three-step App Builder (Describe → Customize → Build) that generates a mobile-first starter source ZIP.
10. PWA manifest, app icon, service worker, and Capacitor Android build workflow.

## AI configuration

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

- `GEMINI_API_KEY` — server-only Google Gemini API key.
- `GEMINI_MODEL` — optional text model override (default: `gemini-3.8-flash`).
- `GEMINI_IMAGE_MODEL` — optional image model override (default: `gemini-nano-banana-2.1`).
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — server-side Supabase public project configuration.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — frontend Supabase public project configuration.
- `VITE_API_BASE_URL` — optional deployed API base URL for Android/web builds.

Keep `GEMINI_API_KEY` server-side. Never place it in a `VITE_*` variable, frontend bundle, APK, or source control. Do not use a Supabase service-role key in frontend code.

API routes:
- `POST /api/chat` — owner-authenticated AI assistant.
- `POST /api/generate` — owner-authenticated app/source generation.
- `POST /api/image` — owner-authenticated image generation.

## Three-step App Builder: important scope

The builder currently generates a **starter source-code ZIP**, not a compiled native APK. Fast Studio generates a browser-previewable website/app and source ZIP. These generated projects still need review, testing, and hosting before production use. The App Builder does not currently compile each generated project into an APK automatically.

## Video generation

A video-generation feature is not currently implemented in this source version.

## PWA and Android

- PWA installation requires a deployed HTTPS site and a supported Android browser.
- The GitHub Actions workflow builds a **debug APK** for testing. It is not a signed Play Store release.
- After a successful workflow run, download the `sher-ai-debug-apk` artifact from that run.
- Frontend changes require a fresh build and a new APK to update the installed native app.

## Build locally

```bash
npm install
npm run build
```

The Vercel API routes require the environment variables above. Local API development can use the Vercel CLI.

## Limitations and checks still required

- A successful GitHub Actions build confirms compilation and APK packaging, not successful real-world Gmail delivery, Gemini API access, image generation, or physical-phone behavior.
- Supabase six-digit OTP email template and SMTP delivery must be tested with the owner's Gmail account.
- Gemini quotas, model access, rate limits, and charges depend on the Google AI account and current Google policies. Unlimited free usage is not guaranteed.
- Voice input and read-aloud depend on Android browser/device support and permissions.
- Generated source code is a starting point, not a guarantee of production-ready software.
