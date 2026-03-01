import { prisma } from "../lib/db.js";
import type { ApplyLeaveInput } from "../types/index.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/errors.js";

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
const TEAM_CONFLICT_THRESHOLD = 0.3; // 30 %

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
    const exStart = toStartSlot(existing.startDate, existing.startSession as SessionValue);
    const exEnd = toEndSlot(existing.endDate, existing.endSession as SessionValue);

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
  const warning =
    overlapFraction >= TEAM_CONFLICT_THRESHOLD
      ? `${overlappingTeamLeaves} other team member(s) (${Math.round(overlapFraction * 100)}% of your team) are already on leave during this period.`
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

  return { leaveRequest, warning };
};