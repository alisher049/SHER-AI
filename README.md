# SHER AI

**Build any app in 3 steps.** SHER AI is a mobile-first app-builder starter with a ChatGPT-powered assistant connection.

## Current status

The repository contains a React/Vite frontend, a server-side ChatGPT API route, a Vercel deployment configuration, and a GitHub Actions workflow that attempts to package the web app as a debug Android APK.

### Three-step product flow

1. **Describe** — enter the app idea in Urdu, Hindi, or English.
2. **Customize** — choose the app name and export target.
3. **Build & export** — ask AI to generate a starter source project and download the files as a ZIP. The generated source still needs review and a separate build step to become an APK.

### ChatGPT assistant

The app includes a **ChatGPT** screen at `/api/chat` and an **AI source generator** at `/api/generate`. The generator returns a starter project file set which the app packages into a ZIP in the browser. The OpenAI API key is read only from the server environment variable `OPENAI_API_KEY`; it is never placed in frontend JavaScript or the Android app.

Default model: `gpt-6-luna`. Override it with the server environment variable `OPENAI_MODEL` if needed.

## Deploy the ChatGPT service

1. Import this GitHub repository into Vercel and deploy it.
2. In the Vercel project settings, add the environment variable `OPENAI_API_KEY` with your OpenAI API key. Optionally add `OPENAI_MODEL`.
3. Redeploy after adding the environment variable.
4. Open the deployed website and select **ChatGPT** to test the assistant.

For an Android APK, set the GitHub Actions repository variable `VITE_API_BASE_URL` to the deployed Vercel origin (for example, `https://your-project.vercel.app`) before building. This tells the installed APK where the server-side chat endpoint lives. The URL is not a secret; the API key remains on Vercel.

**Important:** OpenAI API usage is billed separately from a ChatGPT subscription and may have usage limits. Keep billing limits enabled. This first endpoint is a starter and is not yet protected by user accounts or durable per-user rate limiting; do not publish it widely until authentication and abuse protection are added.

## Run locally

```bash
npm install
npm run dev
```

The Vercel API route requires a Vercel-compatible runtime for local testing (for example, the Vercel CLI). A plain Vite dev server serves the frontend but does not itself execute `api/chat.js`.

## Android APK

Run the **Build SHER AI Android APK** workflow from the Actions tab, or push a change to configured paths on `main`. When successful, download the `sher-ai-debug-apk` artifact from the workflow run.

The workflow currently produces a **debug APK** for testing, not a signed Play Store release. For ChatGPT to work in that APK, set the `VITE_API_BASE_URL` Actions variable as described above and trigger a fresh build.

## Technology

- React + Vite frontend
- Capacitor Android wrapper
- OpenAI Responses API through a server-side Vercel Function
- GitHub Actions cloud APK build workflow

## Important limitations

- ChatGPT assistant requests are implemented, but they require a deployed server and a valid OpenAI API key.
- The AI source generator creates a starter project ZIP, not a production-ready application. It does not automatically compile arbitrary user ideas into APKs yet. Generated source code must be reviewed, tested, and may need backend services or further development.
- APK builds require GitHub Actions runner availability and may be subject to account usage limits.
- Truly unlimited chats, uploads, image generation, or video generation cannot be promised on a zero-cost infrastructure plan. Provider quotas, storage, and compute have costs.
- Never put private AI API keys in frontend code, Android assets, or source control.


## Email sign-in (OTP)

The app uses Supabase Auth email OTP. Users enter an email address and the 6-digit code sent to that inbox; no password is requested. Both `/api/chat` and `/api/generate` verify the Supabase access token before accepting requests.

Required configuration:
1. Create a Supabase project and enable the Email provider under Authentication → Providers.
2. In Authentication → Email Templates, configure the email template to display the numeric token using `{{ .Token }}`. The app expects a 6-digit code.
3. Add Vercel environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the existing `OPENAI_API_KEY`.
4. Add GitHub Actions repository **Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These are public client settings; never put a Supabase service-role key in the app.
5. Redeploy Vercel and rebuild the APK after setting the variables.

Without these settings, sign-in stays locked and AI endpoints reject unauthenticated requests. Supabase email delivery may require custom SMTP for reliable production delivery.