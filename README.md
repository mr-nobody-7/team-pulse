# Team Pulse

Team Pulse is a workspace-based team availability and leave management platform.
It helps teams plan time off, understand daily capacity, and make better approval decisions.

## What this product does

- Centralized leave request lifecycle (apply, approve/reject, cancel, track)
- Team-wide daily availability and workload visibility
- Public holiday-aware planning
- Smart warning signals during leave approvals
- Capacity heatmap in calendar for manager/admin planning
- Reports and analytics for operational visibility
- Audit logs for important workspace actions

## Monorepo structure

- `apps/api` — Express + TypeScript REST API
- `apps/web` — Next.js + TypeScript frontend
- `packages` — shared packages (reserved)

## Tech stack

- Node.js + TypeScript
- Express 5, Prisma, PostgreSQL
- Next.js App Router + React Query
- Biome for linting/formatting
- pnpm workspaces

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Configure environment

API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Set required values in `apps/api/.env`.

### Run all apps

```bash
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

### Build and checks

```bash
pnpm build
pnpm check
pnpm format
```

## Deployment

### Production setup (Render + Vercel)

1. Deploy the API from `apps/api` to Render.
2. Confirm the API is healthy at `<render-api-url>/health`.
3. In Vercel project settings for `apps/web`, set `NEXT_PUBLIC_API_URL` to the Render API URL.
4. Deploy the web app from `apps/web` to Vercel.
5. Verify web routes and authenticated flows (`/login`, `/register`, `/dashboard`) in production.

### Required environment variables

#### API (`apps/api`)

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `JWT_SECRET`: Secret key used to sign and verify authentication JWTs.
- `CLIENT_URL`: Primary allowed frontend origin for CORS and OAuth redirects.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `GOOGLE_CALLBACK_URL`: OAuth callback URL served by the API (`/auth/google/callback`).
- `BREVO_API_KEY`: API key used to send transactional email notifications.
- `BREVO_SENDER_EMAIL`: Sender email address used for outbound emails.
- `BREVO_SENDER_NAME`: Sender display name used for outbound emails.

#### API optional but recommended (`apps/api`)

- `CLIENT_URLS`: Comma-separated list of additional allowed frontend origins (preview/staging domains).
- `NODE_ENV`: Runtime environment (`production` in deploy).
- `PORT`: HTTP port for the API process.
- `TEAM_MIN_CAPACITY_WARNING_PERCENT`: Threshold (0-100) for leave capacity warnings.

#### Web (`apps/web`)

- `NEXT_PUBLIC_API_URL`: Public API base URL for browser calls and Vercel `/api/*` rewrite destination (set this to the Render API URL in Vercel).

## Environment variables (API)

See `apps/api/.env.example`.
Notable variable:

- `TEAM_MIN_CAPACITY_WARNING_PERCENT` — integer threshold from `0` to `100` (default `50`)

## Documentation index

- [Product Overview](./PRODUCT_OVERVIEW.md)
- [Architecture](./ARCHITECTURE.md)
- [Features](./FEATURES.md)
- [Setup Guide](./SETUP.md)
- [Operations Guide](./OPERATIONS.md)

## License

Internal project / private workspace.
