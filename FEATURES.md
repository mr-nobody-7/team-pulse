# Features

## Authentication & access

- Workspace-based registration and login
- JWT session handling
- Role-based permissions: `USER`, `MANAGER`, `ADMIN`

## Leave management

- Apply leave with session granularity (`FULL_DAY`, `FIRST_HALF`, `SECOND_HALF`)
- Overlap prevention and status lifecycle (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`)
- Self-service leave history and filtering
- Manager/Admin approvals workflow

## Smart warning system

- Capacity warning generated from projected team availability impact
- Warning surfaced at apply time and manager/admin review flows
- Configurable threshold via `TEAM_MIN_CAPACITY_WARNING_PERCENT`

## Calendar and planning

- Team calendar with approved leaves
- Public holiday integration
- Capacity heatmap (green/yellow/red planning signal)
- Role-aware team scope behavior in calendar views

## Availability & workload

- Daily status updates (available/on leave/remote/half day/busy/focus)
- Workload tracking (`LIGHT`, `NORMAL`, `HEAVY`)
- Standup board view for quick team sync

## Reporting & governance

- Dashboard summary metrics
- Reports analytics by date range/team/type
- Admin audit logs for key actions
- Team and user administration
- Workspace leave type settings
