-- CreateEnum
CREATE TYPE "WorkloadLevel" AS ENUM ('LIGHT', 'NORMAL', 'HEAVY');

-- CreateTable
CREATE TABLE "UserWorkloadStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "workload" "WorkloadLevel" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorkloadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWorkloadStatus_userId_date_key" ON "UserWorkloadStatus"("userId", "date");

-- CreateIndex
CREATE INDEX "UserWorkloadStatus_workspaceId_date_idx" ON "UserWorkloadStatus"("workspaceId", "date");

-- CreateIndex
CREATE INDEX "UserWorkloadStatus_userId_date_idx" ON "UserWorkloadStatus"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserWorkloadStatus" ADD CONSTRAINT "UserWorkloadStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkloadStatus" ADD CONSTRAINT "UserWorkloadStatus_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
