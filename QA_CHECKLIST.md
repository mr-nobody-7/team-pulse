# Team Pulse QA Checklist

Last Updated: 2026-03-19

## 1) Baseline Quality Gates

- [x] API type check passes (`apps/api`)
- [x] Web type check passes (`apps/web`)
- [x] Workspace check passes (`pnpm check`)
- [x] Workspace lint passes (`pnpm lint`)
- [x] Workspace build passes (`pnpm build`)

## 2) Core Product Use-Case Checklist

| # | Use-Case | Backend Verified | Frontend Verified | E2E/Manual Verified | Status |
|---|---|---|---|---|---|
| 1 | User registration | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 2 | User login/logout session | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 3 | Role-based access (USER/MANAGER/ADMIN) | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 4 | Apply leave request | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 5 | Leave overlap detection | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 6 | Team capacity warning | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 7 | Manager leave approvals/rejections | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 8 | Leave history and filtering | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 9 | Team calendar rendering | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 10 | Public holiday display | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 11 | Daily availability status | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 12 | Workload status tracking | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 13 | Standup/availability board | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 14 | Dashboard summary metrics | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 15 | Reports and analytics | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 16 | Audit logging visibility | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 17 | Workspace leave-type settings | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 18 | User management (admin) | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 19 | Team management (admin) | [x] | [x] | [ ] | 🟡 Code verified; manual pending |
| 20 | Workspace isolation | [x] | [x] | [ ] | 🟡 Code verified; manual pending |

## 3) Known Gaps / Improvements Tracker

| Item | Severity | Owner | Status | Notes |
|---|---|---|---|---|
| Holiday CRUD UI for admins | Medium | Product/Engineering | ⏳ Pending | API list exists; CRUD UI to be added |
| Live capacity preview on leave apply form | Low | Engineering | ⏳ Pending | Warning currently shown after submission |
| Inline overlap pre-validation in leave form | Low | Engineering | ⏳ Pending | Server-side validation exists |
| Audit retention policy | Medium | Engineering/Ops | ⏳ Pending | Long-term operational control |
| Approval notifications (email/in-app) | High | Product/Engineering | ⏳ Pending | Workflow enhancement |

## 4) Fix Log (Incremental)

| Step | Change | Validation | Commit |
|---|---|---|---|
| 1 | Checklist created | N/A | _pending_ |
| 2 | Biome autofix pass in `apps/web` + spinner a11y semantic fix | `pnpm check`, `pnpm lint`, `pnpm build`, API/Web `tsc --noEmit` | _pending_ |
