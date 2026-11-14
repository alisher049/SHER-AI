# SHER AI

A mobile-first AI assistant project. The first milestone establishes the app shell, a provider-agnostic AI service boundary, and a GitHub Actions Android APK build.

## Current status
- [x] Responsive chat interface foundation
- [x] AI service interface (backend endpoint placeholder)
- [x] Capacitor Android packaging configuration
- [x] GitHub Actions debug APK workflow
- [ ] Secure AI backend and real model provider
- [ ] Image understanding/generation
- [ ] Video upload/analysis/generation provider
- [ ] Voice, accounts, and cloud chat history

## Stack
React + TypeScript + Vite, Capacitor for Android, GitHub Actions for cloud builds.

## Run
```bash
npm install
npm run dev
```

## Build APK
Open the repository's Actions tab, run **Build Android APK**, then download the `sher-ai-debug-apk` artifact from the completed workflow.

## Security
Never put AI provider keys in frontend code, Vite variables, or the APK. Store provider secrets on a backend and call that backend from the app. The chat service currently displays a setup notice until the backend is configured.

## Cost and limits
GitHub and third-party free tiers have usage limits. AI inference, image/video generation, storage, and bandwidth cannot be promised unlimited or free.
