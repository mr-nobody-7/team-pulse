# Setup Guide

## 1) Prerequisites

- Node.js 20+
- pnpm 10+

Verify:

```bash
node -v
pnpm -v
```

## 2) Install dependencies

From repository root:

```bash
pnpm install
```

## 3) Configure environment

Create API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Set at least:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (default `4000`)
- `TEAM_MIN_CAPACITY_WARNING_PERCENT` (optional, default `50`)

## 4) Start in development

From root (runs workspace apps):

```bash
pnpm dev
```

## 5) Quality checks

```bash
pnpm check
pnpm build
pnpm format
```

## 6) Useful scoped commands

```bash
pnpm -C apps/api dev
pnpm -C apps/api build
pnpm -C apps/web dev
pnpm -C apps/web build
```
