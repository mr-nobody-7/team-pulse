import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";
import type { ListAuditLogsQuery } from "../types/index.js";

export const listAuditLogs = async (
  workspaceId: string,
  query: ListAuditLogsQuery,
) => {
  const where: Prisma.AuditLogWhereInput = {
    workspaceId,
  };

  if (query.action) {
    where.action = query.action;
  }

  if (query.user_id) {
    where.userId = query.user_id;
  }

  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  const skip = (query.page - 1) * query.limit;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    logs,
    total,
    page: query.page,
    limit: query.limit,
  };
};
