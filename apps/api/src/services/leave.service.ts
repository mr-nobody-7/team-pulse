import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";
import type {
  ApplyLeaveInput,
  ListLeaveQuery,
  UpdateLeaveStatusInput,
} from "../types/index.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors.js";
import { isLeaveTypeEnabledForWorkspace } from "./settings.service.js";

// ── Session ordering helpers ──────────────────────────────────────────────────
// Map each leave period to a range of "half-day slots" so overlap detection
// works at session granularity, not just calendar-day granularity.
//
// Slot layout per day (d = days since epoch):
//   FIRST_HALF  → d*2      (morning only)
//   SECOND_HALF → d*2 + 1  (afternoon only)
//   FULL_DAY    → d*2 … d*2+1 (both halves)
//
// A period [startSlot, endSlot] overlaps [a, b] when startSlot <= b AND endSlot >= a.

type SessionValue = "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";

function toStartSlot(date: Date, session: SessionValue): number {
  const day = Math.floor(date.getTime() / 86_400_000);
  // SECOND_HALF starts in the afternoon
  return session === "SECOND_HALF" ? day * 2 + 1 : day * 2;
}

function toEndSlot(date: Date, session: SessionValue): number {
  const day = Math.floor(date.getTime() / 86_400_000);
  // FIRST_HALF ends in the morning
  return session === "FIRST_HALF" ? day * 2 : day * 2 + 1;
}

// ── Team conflict threshold (warn when ≥ this fraction of the team is off) ───
const TEAM_CONFLICT_THRESHOLD = 0.5; // 50 %

// ── Service ───────────────────────────────────────────────────────────────────

export const applyLeave = async (
  input: ApplyLeaveInput,
  userId: string,
  workspaceId: string,
  teamId: string | null,
) => {
  // ── Guard: user must belong to a team ───────────────────────────────────────
  if (!teamId) {
    throw new BadRequestError(
      "You must be assigned to a team to apply for leave",
    );
  }

  // ── Rule 1: Workspace isolation ─────────────────────────────────────────────
  // Verify the user record still exists, is active, and belongs to the same
  // workspace as the JWT claims. Prevents tampered tokens from acting across
  // workspace boundaries.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw new UnauthorizedError("User not found or inactive");
  }
  if (user.workspaceId !== workspaceId) {
    throw new ForbiddenError("Cross-workspace action not allowed");
  }

  const leaveTypeEnabled = await isLeaveTypeEnabledForWorkspace(
    workspaceId,
    input.type,
  );
  if (!leaveTypeEnabled) {
    throw new BadRequestError("Selected leave type is currently disabled");
  }

  // ── Rule 2: Date and session validity ───────────────────────────────────────
  const startDate = new Date(input.start_date);
  const endDate = new Date(input.end_date);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  if (endDate < startDate) {
    throw new BadRequestError("End date cannot be before start date");
  }

  // Same-day edge case: afternoon start with morning end is impossible
  if (
    startDate.getTime() === endDate.getTime() &&
    input.start_session === "SECOND_HALF" &&
    input.end_session === "FIRST_HALF"
  ) {
    throw new BadRequestError(
      "End session cannot be before start session on the same day",
    );
  }

  const newStartSlot = toStartSlot(startDate, input.start_session);
  const newEndSlot = toEndSlot(endDate, input.end_session);

  // ── Rule 3: No overlapping leaves (date + session level) ────────────────────
  // First narrow candidates with a fast DB date-range filter, then do precise
  // half-day slot comparison in memory.
  const candidateLeaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: { notIn: ["CANCELLED", "REJECTED"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });

  for (const existing of candidateLeaves) {
    const exStart = toStartSlot(
      existing.startDate,
      existing.startSession as SessionValue,
    );
    const exEnd = toEndSlot(
      existing.endDate,
      existing.endSession as SessionValue,
    );

    if (newStartSlot <= exEnd && newEndSlot >= exStart) {
      throw new ConflictError(
        `You already have a ${existing.status.toLowerCase()} leave request that overlaps with this period`,
      );
    }
  }

  // ── Conflict detection: team-level warning ──────────────────────────────────
  const [teamSize, overlappingTeamLeaves] = await Promise.all([
    prisma.user.count({ where: { teamId, isActive: true } }),
    prisma.leaveRequest.count({
      where: {
        teamId,
        userId: { not: userId },
        status: { notIn: ["CANCELLED", "REJECTED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    }),
  ]);

  const overlapFraction = teamSize > 0 ? overlappingTeamLeaves / teamSize : 0;
  const conflictDetected = overlapFraction >= TEAM_CONFLICT_THRESHOLD;
  const warningMessage = conflictDetected
    ? `High team overlap: ${overlappingTeamLeaves} of ${teamSize} team member(s) (${Math.round(overlapFraction * 100)}%) are already on leave during this period.`
    : undefined;

  // ── Create leave request ────────────────────────────────────────────────────
  // approverId and comment are intentionally omitted — set only by an approver.
  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId,
      teamId,
      startDate,
      startSession: input.start_session,
      endDate,
      endSession: input.end_session,
      type: input.type,
      reason: input.reason,
      status: "PENDING",
    },
  });

  return { leaveRequest, warning: conflictDetected, warningMessage };
};

// ── List leave requests ───────────────────────────────────────────────────────
// Builds a dynamic WHERE clause based on the caller's role, then runs a
// parallel count + paginated findMany so the client can render pagination UI.

export const listLeave = async (
  query: ListLeaveQuery,
  userId: string,
  workspaceId: string,
  role: string,
  callerTeamId: string | null,
) => {
  const { status, team_id, page, limit } = query;

  // ── Base: multi-tenant safety — always scope to caller's workspace ──────────
  // LeaveRequest has no direct workspaceId; we scope via the user relation.
  // This join is lightweight and guarantees cross-workspace data never leaks.
  const where: Prisma.LeaveRequestWhereInput = {
    user: { workspaceId },
  };

  // ── Role-based scoping ──────────────────────────────────────────────────────
  if (role === "USER") {
    // Employees see only their own requests; team_id param is ignored.
    where.userId = userId;
  } else if (role === "MANAGER") {
    // Managers see their own team; team_id param is silently ignored so a
    // manager can never peek at another team by passing a different team_id.
    if (!callerTeamId) {
      throw new BadRequestError(
        "Manager must be assigned to a team to view leave requests",
      );
    }
    where.teamId = callerTeamId;
  } else {
    // ADMIN — workspace-wide; optionally filter by team_id from query.
    if (team_id) {
      where.teamId = team_id;
    }
  }

  // ── Optional status filter ─────────────────────────────────────────────────
  if (status) {
    where.status = status;
  }

  // ── Pagination math ────────────────────────────────────────────────────────
  const skip = (page - 1) * limit;
  const take = limit;

  // ── Parallel DB calls ──────────────────────────────────────────────────────
  const [total, leaves] = await Promise.all([
    prisma.leaveRequest.count({ where }),
    prisma.leaveRequest.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true } },
      },
    }),
  ]);

  return { leaves, total, page, limit };
};

// ── Approve / Reject leave ────────────────────────────────────────────────────
// Only PENDING leaves can transition. Managers are locked to their own team.

export const updateLeaveStatus = async (
  leaveId: string,
  input: UpdateLeaveStatusInput,
  actorId: string,
  workspaceId: string,
  role: string,
  callerTeamId: string | null,
) => {
  // Fetch leave + user's workspaceId for isolation check in one query
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { user: { select: { workspaceId: true } } },
  });

  // 404 for not-found AND for cross-workspace requests (don't leak existence)
  if (!leave || leave.user.workspaceId !== workspaceId) {
    throw new NotFoundError("Leave request not found");
  }

  // ── State transition guard ─────────────────────────────────────────────────
  // Only PENDING → APPROVED/REJECTED is allowed.
  if (leave.status !== "PENDING") {
    throw new ConflictError("Leave request has already been processed");
  }

  // ── Manager scope guard ────────────────────────────────────────────────────
  // A manager can only action leave requests that belong to their own team.
  if (role === "MANAGER") {
    if (!callerTeamId || leave.teamId !== callerTeamId) {
      throw new ForbiddenError(
        "You can only manage leave requests for your own team",
      );
    }
  }

  // ── Persist update ─────────────────────────────────────────────────────────
  const updated = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: input.status,
      approverId: actorId,
      comment: input.comment ?? null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      approver: { select: { id: true, name: true } },
    },
  });

  return updated;
};

// ── Cancel leave ──────────────────────────────────────────────────────────────
// Only the owner can cancel, and only while the request is still PENDING.

export const cancelLeave = async (
  leaveId: string,
  userId: string,
  workspaceId: string,
) => {
  // Fetch with workspace isolation via user relation
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { user: { select: { workspaceId: true } } },
  });

  // 404 for not-found AND for cross-workspace (don't leak existence)
  if (!leave || leave.user.workspaceId !== workspaceId) {
    throw new NotFoundError("Leave request not found");
  }

  // ── Ownership guard ────────────────────────────────────────────────────────
  if (leave.userId !== userId) {
    throw new ForbiddenError("You can only cancel your own leave requests");
  }

  // ── State guard ────────────────────────────────────────────────────────────
  if (leave.status !== "PENDING") {
    throw new ConflictError("Only pending leave requests can be cancelled");
  }

  const cancelled = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: "CANCELLED" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      approver: { select: { id: true, name: true } },
    },
  });

  return cancelled;
};
