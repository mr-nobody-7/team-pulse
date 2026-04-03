# Performance Optimization Checklist

Last Updated: 2026-04-03

## Frontend First

- [x] Audit rendering boundaries (`use client` usage) and avoid unnecessary client scope
- [x] Reduce context-driven rerenders in auth/query providers
- [x] Improve React Query defaults for fewer redundant network refetches
- [x] Stabilize query keys and pagination UX (`placeholderData` / keep previous data)
- [x] Reduce expensive recomputation in calendar/report screens
- [x] Keep SSR-friendly structure for shell/layout and use CSR where auth/session requires it

## Backend Next

- [x] Optimize report aggregation algorithms to reduce repeated array scans
- [x] Reduce avoidable sequential DB round-trips in user/team services
- [x] Keep heavy audit writes non-blocking and safe under failures
- [x] Preserve API response shapes and role/workspace access guarantees

## Validation

- [x] API typecheck passes
- [x] Web typecheck passes
- [x] Workspace check passes
- [x] Workspace build passes

## Commit Plan (>=5 commits)

- [x] Commit 1: checklist and baseline perf plan
- [x] Commit 2: frontend provider/query defaults optimization
- [x] Commit 3: frontend hooks/rerender reduction
- [x] Commit 4: backend reports aggregation optimization
- [x] Commit 5: backend service query/flow optimization + final validations
