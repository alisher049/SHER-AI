# SHER AI

SHER AI is a mobile-first AI app builder with a React/Vite frontend, Supabase email/password sign-in, Puter.js AI, and an installable PWA.

## AI without a developer API key

SHER AI loads the official Puter.js browser SDK from `https://js.puter.com/v2/`. Both the AI chat and app source generator call `puter.ai.chat()` directly in the browser.

- No OpenAI API key is required.
- No Gemini API key is required.
- No Puter developer API key is required.
- Users may be asked to authorize/sign in to Puter before using AI.
- Puter usage is subject to its current user-pays model, limits, availability, and any charges or consent screens shown by Puter. This is not a promise of unlimited free AI.

AI needs an internet connection. If Puter is unavailable or the user has not authorized it, the AI feature will show an error rather than pretending it worked.

## Main features

1. Describe an app idea in Urdu, Hindi, or English.
2. Choose an app name and target platform.
3. Ask AI to generate a starter source project and download it as a ZIP.
4. Use the SHER AI assistant for questions and app planning.
5. Sign in with Gmail and a user-created password using Supabase.
6. Install the web app on supported mobile browsers as a PWA.

## Supabase configuration

Supabase is only used for SHER AI account sign-in; it is not an AI key.

The app currently includes its public Supabase project URL and Publishable Key as client configuration. Public/publishable settings may be used in the browser. Never put a Supabase service-role key or other secret in frontend code, the Android APK, or GitHub.

If changing the Supabase project, configure the public project URL and Publishable Key in the frontend environment as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Enable the Email provider and configure email confirmation/SMTP in Supabase as appropriate.

## Run locally

```bash
npm install
npm run dev
```

Puter.js requires an internet connection. Supabase handles SHER AI account registration and login.

## Installable PWA

The project includes a web app manifest, app icon, and service worker. On supported Android browsers, open the deployed HTTPS website and choose **Install app** or **Add to Home screen**. Some browsers may show an in-app install prompt.

The service worker uses network-first navigation so new deployed web versions can load without requiring a new APK. Web changes still need to be committed and deployed by the hosting provider. Native Android changes require a new APK build.

## Android APK

The GitHub Actions workflow builds a debug APK for testing. After a successful run, download the `sher-ai-debug-apk` artifact from the workflow run. This is not a signed Play Store release.

## Important limitations

- Puter.js requires internet access and may require user authorization.
- Puter controls its own quotas, availability, pricing, and user-pays behavior; SHER AI cannot promise unlimited free use.
- The generated ZIP is a starter source project, not a guaranteed production-ready app or an automatically compiled APK. Review and test generated code before publishing.
- A PWA can receive deployed web updates without rebuilding the APK, but the app still needs a successful hosting deployment.
- Never place private API keys or service-role secrets in frontend code, Android assets, or source control.
