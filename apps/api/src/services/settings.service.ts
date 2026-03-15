import { prisma } from "../lib/db.js";
import type { LeaveTypeValue, UpdateLeaveTypesInput } from "../types/index.js";

const ALL_LEAVE_TYPES: LeaveTypeValue[] = [
  "VACATION",
  "SICK",
  "PERSONAL",
  "CASUAL",
];

async function ensureLeaveTypeRows(workspaceId: string) {
  const existing = await prisma.workspaceLeaveType.findMany({
    where: { workspaceId },
    select: { type: true },
  });

  const existingTypes = new Set(existing.map((row) => row.type));
  const missing = ALL_LEAVE_TYPES.filter((type) => !existingTypes.has(type));

  if (missing.length > 0) {
    await prisma.workspaceLeaveType.createMany({
      data: missing.map((type) => ({ workspaceId, type, isActive: true })),
      skipDuplicates: true,
    });
  }
}

export const listWorkspaceLeaveTypes = async (workspaceId: string) => {
  await ensureLeaveTypeRows(workspaceId);

  const rows = await prisma.workspaceLeaveType.findMany({
    where: { workspaceId },
    orderBy: { type: "asc" },
    select: {
      id: true,
      type: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return {
    leaveTypes: rows,
    enabledTypes: rows.filter((row) => row.isActive).map((row) => row.type),
  };
};

export const updateWorkspaceLeaveTypes = async (
  workspaceId: string,
  input: UpdateLeaveTypesInput,
) => {
  await ensureLeaveTypeRows(workspaceId);

  const enabled = new Set(input.enabled_types);

  await prisma.$transaction([
    prisma.workspaceLeaveType.updateMany({
      where: { workspaceId },
      data: { isActive: false },
    }),
    prisma.workspaceLeaveType.updateMany({
      where: { workspaceId, type: { in: Array.from(enabled) } },
      data: { isActive: true },
    }),
  ]);

  return listWorkspaceLeaveTypes(workspaceId);
};

export const isLeaveTypeEnabledForWorkspace = async (
  workspaceId: string,
  type: LeaveTypeValue,
) => {
  await ensureLeaveTypeRows(workspaceId);

  const row = await prisma.workspaceLeaveType.findUnique({
    where: {
      workspaceId_type: {
        workspaceId,
        type,
      },
    },
    select: { isActive: true },
  });

  return row?.isActive ?? true;
};
