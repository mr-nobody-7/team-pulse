# Performance Optimization Checklist

Last Updated: 2026-04-03

## Frontend First

- [ ] Audit rendering boundaries (`use client` usage) and avoid unnecessary client scope
- [ ] Reduce context-driven rerenders in auth/query providers
- [ ] Improve React Query defaults for fewer redundant network refetches
- [ ] Stabilize query keys and pagination UX (`placeholderData` / keep previous data)
- [ ] Reduce expensive recomputation in calendar/report screens
- [ ] Keep SSR-friendly structure for shell/layout and use CSR where auth/session requires it

## Backend Next

- [ ] Optimize report aggregation algorithms to reduce repeated array scans
- [ ] Reduce avoidable sequential DB round-trips in user/team services
- [ ] Keep heavy audit writes non-blocking and safe under failures
- [ ] Preserve API response shapes and role/workspace access guarantees

## Validation

- [ ] API typecheck passes
- [ ] Web typecheck passes
- [ ] Workspace check passes
- [ ] Workspace build passes

## Commit Plan (>=5 commits)

- [ ] Commit 1: checklist and baseline perf plan
- [ ] Commit 2: frontend provider/query defaults optimization
- [ ] Commit 3: frontend hooks/rerender reduction
- [ ] Commit 4: backend reports aggregation optimization
- [ ] Commit 5: backend service query/flow optimization + final validations
