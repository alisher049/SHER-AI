# SHER AI

**Build any app in 3 steps.** SHER AI is a mobile-first app-builder starter with a keyless Puter.js AI assistant connection.

## Current status

The repository contains a React/Vite frontend, a server-side ChatGPT API route, a Vercel deployment configuration, and a GitHub Actions workflow that attempts to package the web app as a debug Android APK.

### Three-step product flow

1. **Describe** — enter the app idea in Urdu, Hindi, or English.
2. **Customize** — choose the app name and export target.
3. **Build & export** — ask AI to generate a starter source project and download the files as a ZIP. The generated source still needs review and a separate build step to become an APK.

### ChatGPT assistant

The app includes a **SHER AI** chat screen and an **AI source generator**. Both now call Puter.js directly from the browser using `puter.ai.chat()`; no OpenAI, Gemini, or other developer API key is required. The source generator packages the AI-generated starter files into a ZIP in the browser.

## Keyless AI connection (Puter.js)

SHER AI loads the official Puter.js browser SDK from `https://js.puter.com/v2/`. Users may be asked by Puter to authorize/sign in so that Puter can provide AI access. Under Puter's User-Pays model, the app developer does not add an API key or pay for each user's AI requests; each user is responsible for their own Puter usage and any limits or paid overages shown by Puter. This is not unlimited free AI for every user.

No `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `PUTER_AUTH_TOKEN` is required in Vercel, GitHub Actions, frontend variables, or the APK. Keep Supabase only for SHER AI's existing Gmail/password sign-in.

## Run locally

```bash
npm install
npm run dev
```

Puter.js AI requires an internet connection and the Puter SDK to load. The AI chat and project generator work from the browser; Supabase remains responsible for SHER AI account sign-in.

## Android APK

Run the **Build SHER AI Android APK** workflow from the Actions tab, or push a change to configured paths on `main`. When successful, download the `sher-ai-debug-apk` artifact from the workflow run.

The workflow currently produces a **debug APK** for testing, not a signed Play Store release. For Puter.js AI to work in that APK, the device needs internet access and the embedded browser must be able to load the Puter.js SDK.

## Technology

- React + Vite frontend
- Capacitor Android wrapper
- Puter.js AI through the browser SDK (no developer API key)
- GitHub Actions cloud APK build workflow

## Important limitations

- AI requests use Puter.js and require internet access plus any Puter user authorization/usage limits.
- The AI source generator creates a starter project ZIP, not a production-ready application. It does not automatically compile arbitrary user ideas into APKs yet. Generated source code must be reviewed, tested, and may need backend services or further development.
- APK builds require GitHub Actions runner availability and may be subject to account usage limits.
- Truly unlimited chats, uploads, image generation, or video generation cannot be promised on a zero-cost infrastructure plan. Provider quotas, storage, and compute have costs.
- Never put private AI API keys in frontend code, Android assets, or source control.


## Email and password sign-in

SHER AI uses Supabase Auth with user-created passwords. Users sign up with a Gmail address, choose a password (minimum 8 characters), confirm it, and later log in with the same Gmail and password. The password is never sent by email. If Supabase email confirmation is enabled, Supabase may send a confirmation link; that email does not contain the user's password. Both `/api/chat` and `/api/generate` verify the Supabase access token before accepting requests.

Required configuration:
1. Supabase project is connected: `https://hltlskzpwqrhiedmomfx.supabase.co`. The frontend has this project URL and its Publishable Key configured as public client settings. Confirm the Email provider is enabled under Authentication → Providers.
2. Configure the Supabase Email provider's confirmation setting according to the desired account-verification policy. Password sign-up and login are handled by Supabase Auth.
3. In Vercel, add `SUPABASE_URL=https://hltlskzpwqrhiedmomfx.supabase.co`, `SUPABASE_ANON_KEY` with the Supabase Publishable Key, and the existing `OPENAI_API_KEY`. These Supabase values are public project settings; never use a service-role or secret key here.
4. GitHub Actions already has safe fallback values for the SHER AI Supabase project. You may override them with repository Variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never put a Supabase service-role key in the app.
5. Redeploy Vercel and rebuild the APK after setting the variables.

Without these settings, sign-in stays locked and AI endpoints reject unauthenticated requests. Supabase email delivery may require custom SMTP for reliable production delivery.

## Installable PWA

SHER AI now includes a Progressive Web App manifest, an app icon, and a service worker. On supported mobile browsers, open the deployed HTTPS site and choose **Install app** or **Add to Home screen**. When the browser exposes its install prompt, SHER AI also shows an in-app install button on the sign-in screen.

The service worker caches the app shell for basic offline launch and checks the network first for page navigations so newly deployed versions can be loaded. Browser-managed service-worker updates take effect as the browser refreshes or revisits the app. This PWA update path does not require users to download a new APK for web changes.

**Important:** PWA installation does not itself deploy code. New features still need to be committed to this repository and successfully deployed by the hosting provider. The PWA can use those web updates without rebuilding the Android APK. Native Android-only changes still require a new APK build. The current Android workflow remains a debug APK workflow, not a signed Play Store release.


## Free AI provider (Gemini)

SHER AI chat and app generation use Google's Gemini API through server-side Vercel functions. The default model is `gemini-3.8-flash`. Create a key in [Google AI Studio](https://aistudio.google.com/apikey), then add it in Vercel → Project → Settings → Environment Variables as `GEMINI_API_KEY` and redeploy. Optionally set `GEMINI_MODEL` to a model available to your AI Studio project.

The Gemini key must remain server-side: do not add it to `VITE_*` variables, frontend code, GitHub source, or the Android APK. The free tier has model-specific quotas and rate limits; requests may pause when those limits are reached. Review Google's current [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) before production use.

Supabase remains responsible for sign-in and user authentication. Its Project URL and Publishable Key are not AI provider credentials.
