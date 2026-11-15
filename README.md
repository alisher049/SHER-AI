# SHER AI

SHER AI is a mobile-first Urdu/English AI workspace for Web and Android, built with React, Vite, Supabase Auth, Vercel serverless functions, Gemini, and Capacitor.

## Current modules

- Owner-only Email + Password account creation and sign-in (no OTP or magic-link UI).
- Urdu/English AI chat through the server-side Gemini API.
- Image and PDF understanding through Gemini multimodal input.
- Browser speech recognition and speech synthesis where supported by the device/browser.
- AI image generation through the configured Gemini image model.
- Fast Studio: generated HTML/CSS/JS, live preview, copyable source, and ZIP export.
- App Builder: generates a mobile-first starter project ZIP. It does not compile arbitrary generated projects into native APKs.
- Smart tools for arithmetic, translation, rewriting, and summarization.
- PWA install support and Capacitor Android packaging.
- GitHub Actions debug APK artifact and GitHub release upload.

## Environment variables

### Vercel project

Set the following in Vercel → Project → Settings → Environment Variables:

- `GEMINI_API_KEY` — server-only Google Gemini key. Never prefix this with `VITE_`.
- `GEMINI_MODEL` — optional model override; default is `gemini-3.8-flash`.
- `GEMINI_IMAGE_MODEL` — optional image model override.
- `VITE_SUPABASE_URL` — Supabase project URL, available to the frontend build.
- `VITE_SUPABASE_ANON_KEY` — Supabase publishable/anon key, available to the frontend build.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — optional server-side aliases; the API falls back to the VITE-prefixed public values when these are not set.
- `VITE_API_BASE_URL` — optional API base URL for Android builds; defaults to the deployed SHER AI Vercel URL.

Never put a Gemini key or Supabase service-role/secret key in frontend code, GitHub source, or APK files.

## Supabase authentication configuration

1. Enable the Email provider.
2. Use email + password authentication.
3. Disable **Confirm email** under Authentication settings if signup must create a session immediately without sending an email confirmation link.
4. Do not enable OTP or magic-link login flows for this app.
5. The UI restricts account creation and sign-in to the owner address configured in `src/App.jsx` and server-side API authorization in `lib/server/auth.js`.

Supabase's built-in email sender has strict rate limits. With email confirmation disabled, account creation and password sign-in do not require OTP or a magic link.

## Android APK build

The workflow at `.github/workflows/android-apk.yml` runs on pushes to `main` when app source/configuration changes, and can also be started manually from GitHub → Actions.

It builds a **debug APK** and uploads it as the `sher-ai-debug-apk` artifact. The workflow also publishes the APK to a versioned GitHub Release. A debug APK is for testing/sideloading, not a signed Play Store release.

For reliable Android builds, configure GitHub Actions repository variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL` to match the Vercel project. Public Supabase URL and publishable/anon key are not secrets, but should still match the project used by the web app.

## Local development

```bash
npm install
npm run dev
npm run build
```

Vercel API routes can be run locally with the Vercel CLI after environment variables are configured.

## Free-tier and capability notes

- Gemini has a free tier for selected models, but quotas, rate limits, model availability, and eligibility can change. Unlimited usage is not guaranteed.
- Gemini image generation requires an image-capable model enabled for the account and may have different availability/limits from text generation.
- Web Speech APIs depend on browser/device support, language packs, microphone permission, and sometimes network services; they are not guaranteed to be unlimited or offline.
- Supabase and Vercel free plans have quotas and fair-use limits.
- Generated project ZIPs are starter source code. Review and test generated code before production use.
- GitHub Actions debug builds prove packaging, not successful real-device behavior, live authentication, or API quota availability.
