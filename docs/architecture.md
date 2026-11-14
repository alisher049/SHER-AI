# SHER AI — planned system architecture

## Product contract

The user-facing promise is **Build any app in 3 steps**:

1. Describe the app and its users.
2. Customize its name, branding, features, and target.
3. Generate a project, validate it, and request an APK build.

The three-step flow is a simple user experience; it does not mean every arbitrary app can be generated perfectly or instantly.

## System layers

- **Mobile-first client:** React UI for idea capture, project review, progress, and downloads.
- **API gateway:** the starter now includes a Vercel serverless `POST /api/chat` endpoint. It validates message count and size, calls the OpenAI Responses API, and reads the provider key from server environment variables. User authentication and durable per-user rate limiting remain to be implemented.
- **AI orchestration service:** converts the brief into a structured product specification, asks for missing requirements, generates code in bounded stages, and runs repair cycles.
- **Template and code-generation layer:** starts from vetted templates (for example, utility, catalog, booking, and chat apps) and applies generated modules.
- **Project storage:** private per-user source bundles, metadata, and generated assets with retention controls.
- **Build queue and isolated workers:** build Android packages in disposable jobs; do not execute untrusted generated code on the API server.
- **Artifact delivery:** short-lived download links and build logs with access checks.
- **Safety and abuse controls:** upload validation, rate limits, quotas, dependency allowlists, malware scanning, and audit events.

## Suggested request lifecycle

`POST /api/projects` creates a project from a validated brief. The orchestrator creates a specification and plan. A user confirms the plan before code generation. Generated source is tested and packaged in an isolated worker. The client receives job status and, on success, a protected APK artifact link.

## Security requirements

- Keep AI provider keys in server-side secret storage only.
- Authenticate users and enforce ownership checks on every project and artifact.
- Validate file type, size, and content for uploads.
- Apply per-user limits and transparent quotas; do not promise unlimited compute or storage.
- Use isolated, ephemeral build workers with restricted network access.
- Sign production APKs only with protected signing credentials; never commit keystores or passwords.
- Provide deletion and retention controls for prompts, source files, uploads, and outputs.

## MVP boundary

The current repository contains the first UI scaffold and a GitHub Actions debug-APK workflow. The AI orchestration backend, accounts, persistent storage, real uploads, image/video generation, isolated project builds, and production signing are **not implemented yet**. Implement and test these layers incrementally before public launch.
