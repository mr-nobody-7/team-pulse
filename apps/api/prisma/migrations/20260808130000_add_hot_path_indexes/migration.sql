-- Indexes for the hottest query paths.
--
-- Postgres does not create indexes on foreign key columns and Prisma does not
-- add them, so several high-frequency queries were doing sequential scans.
--
-- NOTE: these are plain CREATE INDEX statements, which take a write lock for
-- the duration of the build. That is fine at current table sizes. If these
-- tables have grown large by the time this runs, build them with
-- CREATE INDEX CONCURRENTLY outside a migration transaction instead.

-- LeaveRequest: session-granularity overlap detection filters by userId plus a
-- date range and runs on every leave application.
CREATE INDEX "LeaveRequest_userId_startDate_endDate_idx" ON "LeaveRequest"("userId", "startDate", "endDate");

-- LeaveRequest: approvals queue and team calendar. Supersedes the single-column
-- teamId index, since a composite serves leading-column lookups too.
CREATE INDEX "LeaveRequest_teamId_status_startDate_idx" ON "LeaveRequest"("teamId", "status", "startDate");
DROP INDEX "LeaveRequest_teamId_idx";

-- LeaveRequest: approver lookups on the approvals list.
CREATE INDEX "LeaveRequest_approverId_idx" ON "LeaveRequest"("approverId");

-- User: workspace and team scoping had no index at all.
CREATE INDEX "User_workspaceId_idx" ON "User"("workspaceId");
CREATE INDEX "User_teamId_idx" ON "User"("teamId");

-- AuditLog: always read workspace-scoped and newest-first. The composite
-- replaces the two single-column indexes it subsumes.
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");
DROP INDEX "AuditLog_workspaceId_idx";
DROP INDEX "AuditLog_createdAt_idx";

-- RefreshToken: tokenHash is already @unique, which creates its own index.
-- This duplicate was being maintained on the write path of every token rotation.
DROP INDEX "RefreshToken_tokenHash_idx";
