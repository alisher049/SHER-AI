# SHER AI

**Build an app in 3 steps.** SHER AI is a mobile-first app-builder starter.

## Current features

1. Describe an app idea in Urdu, Hindi, or English.
2. Choose an app name and target platform.
3. Download a ZIP containing an editable React + Vite starter project, a starter screen, CSS, README, and the original project brief.

## Run SHER AI

```bash
npm install
npm run dev
```

## Generated project

Extract the downloaded ZIP, open that folder in a development environment, then run `npm install` and `npm run dev`.

The current generator creates a usable starter scaffold and includes the user's description. It does **not** yet use a hosted AI model to implement every feature requested in the description. It also does not compile an APK from inside the app yet.

## Android APK for SHER AI

The GitHub Actions workflow attempts to build a debug APK. Run the workflow from the repository's Actions tab. If successful, download the `sher-ai-debug-apk` artifact from that run. A debug APK is for testing, not a signed Play Store release.

## Next engineering milestones

- Connect a secure server-side AI provider adapter (never expose API keys in frontend code).
- Turn generated app requirements into files using the AI backend.
- Add isolated cloud build jobs for generated Android projects.
- Add user accounts, private project storage, quotas, upload validation, and abuse protection.

## Cost and security

Unlimited AI usage, video generation, and file storage cannot be guaranteed on zero-cost infrastructure. Provider quotas, compute costs, storage, and rate limits must be handled before public launch. Keep all private API keys in server-side environment variables or repository secrets, never in browser code.
