-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_DELETION_INITIATED';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN "actorDisplay" TEXT;
