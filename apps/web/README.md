# Team Pulse Web App

Team Pulse is a workspace-based leave and availability planning app for teams. This frontend provides role-aware dashboards for leave workflows, calendar visibility, reporting, and team operations.

## Who this app is for

- Team members who apply for leave and manage daily availability
- Managers and admins who approve requests, monitor capacity, and review reports

## Local development setup

1. Clone the repository.
2. Open the repository root in your terminal.
3. Install dependencies:

```bash
pnpm install
```

4. Create web environment file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

5. Ensure the API is available locally (default: http://localhost:4000).
6. Start the web app:

```bash
pnpm -C apps/web dev
```

7. Open http://localhost:3000 in your browser.

## Required environment variables

- NEXT_PUBLIC_API_URL: Base URL of the API used by the web app. In production on Vercel, set this to your Render backend URL.

## More documentation

For full architecture, deployment, and workspace-level docs, see the root README:

- ../README.md
