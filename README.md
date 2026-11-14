# SHER AI

**Build any app in 3 steps.** SHER AI is a mobile-first app-builder starter: describe an idea, customize the project, and prepare a build.

## Current status

This repository now contains an early **frontend MVP scaffold** and a GitHub Actions workflow that attempts to package the web app as a debug Android APK. It is not yet a complete AI app generator.

### Three-step product flow

1. **Describe** — enter the app idea in Urdu, Hindi, or English.
2. **Customize** — choose the app name and export target.
3. **Build & export** — prepare a project and, after the AI generation service is connected, create an Android APK.

## Technology

- React + Vite frontend
- Capacitor Android wrapper
- GitHub Actions cloud build workflow
- Planned backend: authenticated API, AI provider adapter, project generator, file storage, and build-job service

## Run locally

```bash
npm install
npm run dev
```

## Android APK

Run the **Build SHER AI Android APK** workflow from the Actions tab, or push a change to the configured paths on `main`. When successful, download the `sher-ai-debug-apk` artifact from the workflow run.

The workflow currently produces a **debug APK** for testing, not a signed Play Store release.

## Important limitations

- AI-powered source-code generation is not connected yet. The current UI collects a project brief only.
- APK builds require GitHub Actions runner availability and may be subject to account usage limits.
- Truly unlimited chats, uploads, image generation, or video generation cannot be promised on a zero-cost infrastructure plan. Provider quotas, storage, compute, and abuse protection must be designed explicitly.
- Never put private AI API keys in frontend code or commit them to this repository. Add them as repository Actions secrets or server-side environment variables when the backend is implemented.

## Security principles

Use server-side secrets, authenticated sessions, per-user project isolation, upload validation, rate limits, and explicit retention controls before launching publicly.
