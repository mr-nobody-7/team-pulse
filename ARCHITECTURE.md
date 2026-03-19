# Architecture

## High-level overview

Team Pulse is a pnpm monorepo with two runtime applications:

- **API** (`apps/api`): Express REST API handling auth, business logic, persistence.
- **Web** (`apps/web`): Next.js frontend consuming API endpoints.

## Backend architecture (`apps/api`)

### Layers

- **Routes**: endpoint registration and middleware chaining
- **Controllers**: request parsing, validation handling, response shaping
- **Services**: business logic and Prisma data access
- **Utils/Middleware**: auth, RBAC, validation, error handling, security, audit helpers

### Data and persistence

- Prisma ORM with PostgreSQL
- Core models include workspace, team, user, leave request, availability/workload status, holidays, and audit log

### Security model

- JWT-based authentication
- Role-based authorization (`USER`, `MANAGER`, `ADMIN`)
- Workspace-level isolation in service queries
- API and auth rate limiting + Helmet + CORS controls

## Frontend architecture (`apps/web`)

- Next.js App Router + client components for interactive dashboards
- React Query for API state and cache invalidation
- Role-aware routing/navigation and page-level guards
- Reusable UI primitives and feature-focused components

## Request flow example (leave approval)

1. Web calls API endpoint.
2. API authenticates user and applies role guard.
3. Controller validates input and invokes service.
4. Service enforces business rules and persists updates.
5. Audit event is written asynchronously.
6. Web invalidates affected queries and refreshes views.

## Scalability considerations

- Pagination for leave listings and calendar data aggregation
- Server-side scoping by workspace/team/role
- Cached frontend query state with targeted invalidation
