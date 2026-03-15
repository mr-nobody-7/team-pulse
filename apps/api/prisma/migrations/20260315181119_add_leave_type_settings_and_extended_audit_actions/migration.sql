-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'USER_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_DEACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE 'TEAM_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'TEAM_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'TEAM_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'LEAVE_TYPES_UPDATED';

-- CreateTable
CREATE TABLE "WorkspaceLeaveType" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceLeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceLeaveType_workspaceId_idx" ON "WorkspaceLeaveType"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceLeaveType_workspaceId_type_key" ON "WorkspaceLeaveType"("workspaceId", "type");

-- AddForeignKey
ALTER TABLE "WorkspaceLeaveType" ADD CONSTRAINT "WorkspaceLeaveType_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
