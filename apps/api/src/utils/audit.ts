import { prisma } from "../lib/db.js";
import type { AuditAction, Prisma } from "../generated/prisma/client.js";

export interface AuditLogParams {
  action: AuditAction;
  /** Actor — omit for unauthenticated / failed-auth events */
  userId?: string;
  workspaceId?: string;
  /** Primary entity this action touched */
  targetId?: string;
  /** "User" | "LeaveRequest" | … */
  targetType?: string;
  ipAddress?: string;
  /** Any extra context that helps reconstruct the event */
  metadata?: Prisma.InputJsonValue;
}

/**
 * Fire-and-forget audit log writer.
 *
 * Deliberately returns `void` so callers never need to await it.
 * Failures are swallowed and printed to stderr so the main request
 * flow is never affected by audit-log infrastructure issues.
 */
export const createAuditLog = (params: AuditLogParams): void => {
  prisma.auditLog
    .create({ data: params })
    .catch((err: unknown) => console.error("[AuditLog] Failed to write:", err));
};
