-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'ON_LEAVE', 'WORKING_REMOTELY', 'HALF_DAY', 'BUSY', 'FOCUS_TIME');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'USER_AVAILABILITY_UPDATED';

-- CreateTable
CREATE TABLE "UserAvailabilityStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAvailabilityStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAvailabilityStatus_userId_date_key" ON "UserAvailabilityStatus"("userId", "date");

-- CreateIndex
CREATE INDEX "UserAvailabilityStatus_workspaceId_date_idx" ON "UserAvailabilityStatus"("workspaceId", "date");

-- CreateIndex
CREATE INDEX "UserAvailabilityStatus_userId_date_idx" ON "UserAvailabilityStatus"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserAvailabilityStatus" ADD CONSTRAINT "UserAvailabilityStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAvailabilityStatus" ADD CONSTRAINT "UserAvailabilityStatus_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
