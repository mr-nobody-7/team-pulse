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
