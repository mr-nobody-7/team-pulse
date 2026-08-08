# TeamFore — Current State Brief

Verified: 2026-08-04 against `main` @ `062dcde`
Supersedes the status sections of `PROJECT_AUDIT.md` (2026-05-13) and
`SECURITY_AUDIT_TEAMFORE_2026-05-18.md`, both of which pre-date later work.

## 1. What the product is

Workspace-based leave and availability platform. Multi-tenant, workspace-scoped.
Three roles plus owner: `OWNER`, `ADMIN`, `MANAGER`, `USER`.

Core domains: leave lifecycle (half-day session granularity), approvals with
capacity warnings, team calendar with holiday overlay and capacity heatmap,
availability/standup board, reports + CSV export, audit logs, leave accrual
and balances, Slack integration, Google Calendar sync, push notifications.

## 2. Shape of the repo

pnpm monorepo (`pnpm@10.28.1`), Node 20+, TypeScript, Biome, Husky.

- `apps/api` — Express 5 + Prisma 7 + PostgreSQL (Neon). ESM, NodeNext,
  `.js` extensions required in TS imports.
- `apps/web` — Next.js 16 (App Router) + React 19, TanStack Query, Axios,
  React Hook Form + Zod, Radix/shadcn primitives, PostHog, Sentry, Serwist PWA.
- `packages/` — declared in the workspace but empty.

Deploy: API on Railway, web on Vercel, DB on Neon. `render.yaml` also present
(legacy/alternate target).

## 3. Backend surface

13 mounted route groups in `apps/api/src/app.ts`:
`/auth`, `/leave`, `/availability`, `/feedback`, `/holidays`, `/reports`,
`/settings`, `/slack`, `/teams`, `/users`, `/workspaces`, `/audit-logs`, `/push`.

Plus app-level: `GET /health`, `GET /openapi.json`, `GET /reference` (Scalar),
`GET /debug-sentry` (non-production only).

`/workspaces` and `/push` are newer than the May audit's endpoint catalog, so
the "50 mounted endpoints" figure in `PROJECT_AUDIT.md` undercounts.

Layering: routes → controllers → services, with middleware for
`authenticate`, `authorize` (RBAC), `validate` (Zod), `csrf` (double-submit),
`plan.middleware` (plan gating with TTL cache), `security` (rate limits),
`errorHandler`.

Prisma: 24 models / 8 enums. Notable additions since the May audit:
`RefreshToken`, `PushSubscription`, owner role, `privacyAcceptedAt` on `User`,
audit actor display fields. 23 migrations, latest `20260522010000`.

## 4. Frontend surface

19 page routes: 4 marketing (`/`, changelog, privacy, terms), 2 auth,
12 dashboard, plus `/privacy-consent`, `/goodbye`, `/offline`.
~55 component files, 13 hooks, 2 client services.

PWA is implemented (`app/manifest.ts`, `app/sw.ts`, `/offline`,
`components/pwa/*`) — the May audit listed this as not started.

## 5. Status: what is done

- Auth: email/password + Google OAuth, JWT httpOnly cookie, refresh token
  rotation, CSRF protection, privacy consent gate on signup and Google auth.
- Leave: apply with session-slot overlap detection, capacity warning,
  holiday conflict surfacing, approve/reject, owner-only cancel while `PENDING`.
- Accrual engine: monthly/quarterly/annual, cron jobs, carry-forward,
  balances and admin policy APIs (plan-gated).
- Slack: OAuth install, encrypted tokens, HMAC signature verification,
  slash commands, notifications, daily digest.
- Google Calendar: connect/disconnect/status, event insert on approval,
  removal on reject/cancel, event id persisted on `LeaveRequest`.
- Holidays: country sync from nager.date with upsert + stale cleanup.
- Governance: audit logs, analytics + CSV export, dashboard summaries.
- Privacy/GDPR: account deletion with workspace cascade, ownership transfer,
  personal data export.
- Observability: Sentry wired in both apps, PostHog analytics.
- Design system: TF token system in `apps/web/app/globals.css` (OKLCH,
  dark-first), brand assets, `Logo`, icon barrel + `TFIcon`. Source of truth
  for the design lives in the untracked `teamfore-designs/` directory.
- `pnpm typecheck` passes clean across both apps (verified 2026-08-04).

## 6. Status: what is open

**No automated tests anywhere.** Zero `*.test.ts` / `*.spec.ts` files in the
repo. This is the single largest risk — the leave-overlap and accrual logic are
the most intricate code in the project and are unguarded.

**No CI.** `.github/` contains only `copilot-instructions.md`; there are no
workflows. Quality gates exist only as Husky hooks locally
(pre-commit: format/check/typecheck; pre-push: check/typecheck/build).

**Design-system migration is ~95% done.** ~16 legacy Tailwind color classes
remain. Real inconsistencies on the dark-first theme:
- `text-blue-600` in the section headings of `users`, `teams`, `settings`,
  `reports`, `audit-logs` pages — should be `tf-iris`.
- `text-amber-700` / `text-amber-600` in `calendar`, `leaves`,
  `leaves/apply`, `teams` — should be `tf-amber`.
- `bg-red-400/70`, `bg-amber-400/70`, `bg-emerald-400/70` in
  `components/marketing/hero-section.tsx` are the fake window-chrome dots and
  are arguably intentional.

**Orphan directory.** `apps/web/src/components/settings/google-calendar-connect.tsx`
is unreferenced — the live component is
`apps/web/components/settings/google-calendar-connect-card.tsx`. The stray
`apps/web/src/` tree should go.

**Doc drift.** `README.md` documents the web env var as `BACKEND_URL` (which
matches `next.config.ts`), while `apps/web/.env.example` ships
`NEXT_PUBLIC_BACKEND_URL`. One of the two is wrong; the code reads
`process.env.BACKEND_URL`.

**Untracked work.** `teamfore-designs/` (design system HTML, `tokens.css`,
`tokens.json`, `tailwind.config.js`) is not committed.

**Stale docs.** `PROJECT_AUDIT.md` and `CODEBASE_AUDIT.json` still list as
open several things now fixed: users endpoint mismatch, teams CRUD wiring,
Google token encryption, CSP headers, refresh tokens, PWA.

## 7. Security posture

Every CRITICAL and HIGH finding from the 2026-05-18 audit is resolved:
- Google/Slack tokens encrypted at rest, now **AES-256-GCM** (was CBC), with
  `decryptLegacy` retained for migration.
- CSP and security headers present in `apps/web/next.config.ts`.
- CSRF double-submit protection mounted.
- Sentry DSN fallback removed — Sentry no-ops without `SENTRY_DSN`.
- Refresh token rotation implemented.
- Account state disclosure on login and timing attacks addressed.

Still implemented well: bcrypt password hashing, no stack traces to clients,
global + auth rate limiting, httpOnly cookies, no `dangerouslySetInnerHTML`.

Not re-audited since May: runtime/hosting configuration, and the LOW findings
(auth error text differentiation, implicit CORS methods).

## 8. Timeline

270 commits. First migration 2026-02-25, last commit 2026-05-24 — roughly
2.5 months idle as of 2026-08-04. The final active workstream was the design
system token migration.

## 9. Working rules for this codebase

1. Never query or mutate across workspaces — `workspaceId` scoping is the
   core tenancy boundary.
2. Keep NodeNext import style in the API: `.js` extension on TS imports.
3. pnpm only, run from repo root unless deliberately scoping with `--filter`.
4. Verify with `pnpm check` then `pnpm typecheck` before pushing; pre-push
   also runs `build`.
5. Keep `.env.example` in sync when adding env vars.
6. Small commits grouped by domain (api / web / docs), conventional prefixes.

## 10. Environment variables

API required: `DATABASE_URL`, `JWT_SECRET`, `CSRF_SECRET`, `ENCRYPTION_KEY`
(64-char hex), `CLIENT_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_CALLBACK_URL`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`,
`BREVO_SENDER_NAME`.

API optional: `NODE_ENV`, `PORT`, `HOST`, `CLIENT_URLS`, `PUBLIC_API_URL`,
`API_URL`, `TEAM_MIN_CAPACITY_WARNING_PERCENT` (0–100, default 50),
`SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`,
`SLACK_SIGNING_SECRET`, `SLACK_REDIRECT_URI`, `GOOGLE_CALENDAR_ENABLED`,
`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL`.

Web: `BACKEND_URL` (required, rewrite target), `NEXT_PUBLIC_POSTHOG_KEY`,
`NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`,
`SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

## 11. Suggested next moves

1. Fix the doc/env drift and delete the orphan `apps/web/src/` tree — minutes.
2. Finish the last ~16 legacy color classes.
3. Commit or discard `teamfore-designs/`.
4. Add CI (`.github/workflows`) running `check` + `typecheck` + `build`.
5. Add the first tests: leave overlap at session granularity, workspace
   isolation, accrual carry-forward.
6. Refresh `PROJECT_AUDIT.md` / `CODEBASE_AUDIT.json`, or retire them in
   favor of this file.
