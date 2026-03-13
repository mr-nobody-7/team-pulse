import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";
import { BadRequestError } from "../utils/errors.js";

interface GetDashboardSummaryParams {
  userId: string;
  workspaceId: string;
  role: string;
  teamId: string | null;
}

const LEAVE_TYPES = ["VACATION", "SICK", "PERSONAL", "CASUAL"] as const;

function startOfTodayUtc() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

export const getDashboardSummary = async ({
  userId,
  workspaceId,
  role,
  teamId,
}: GetDashboardSummaryParams) => {
  const today = startOfTodayUtc();
  const next7Days = new Date(today);
  next7Days.setUTCDate(next7Days.getUTCDate() + 7);

  const leaveScope: Prisma.LeaveRequestWhereInput = {
    user: { workspaceId },
  };

  if (role === "USER") {
    if (teamId) {
      leaveScope.teamId = teamId;
    } else {
      leaveScope.userId = userId;
    }
  } else if (role === "MANAGER") {
    if (!teamId) {
      throw new BadRequestError("Manager must be assigned to a team");
    }
    leaveScope.teamId = teamId;
  }

  const userCountWhere: Prisma.UserWhereInput =
    role === "ADMIN"
      ? { workspaceId, isActive: true }
      : teamId
        ? { workspaceId, teamId, isActive: true }
        : { id: userId, isActive: true };

  const canApprove = role === "ADMIN" || role === "MANAGER";

  const pendingWhere: Prisma.LeaveRequestWhereInput = {
    ...leaveScope,
    status: "PENDING",
  };

  const approvedWhere: Prisma.LeaveRequestWhereInput = {
    ...leaveScope,
    status: "APPROVED",
  };

  const availabilityRangeStart = new Date(today);
  const availabilityRangeEnd = new Date(next7Days);

  const distributionRowsPromise = prisma.leaveRequest.groupBy({
    by: ["type"],
    where: approvedWhere,
    _count: { _all: true },
  });

  const overlappingApprovedLeavesPromise = prisma.leaveRequest.findMany({
    where: {
      ...approvedWhere,
      startDate: { lte: availabilityRangeEnd },
      endDate: { gte: availabilityRangeStart },
    },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  const [
    totalUsers,
    pendingApprovals,
    todayLeaves,
    upcomingLeaves,
    distributionRows,
    overlappingApprovedLeaves,
  ] =
    await Promise.all([
      prisma.user.count({ where: userCountWhere }),
      canApprove ? prisma.leaveRequest.count({ where: pendingWhere }) : 0,
      prisma.leaveRequest.count({
        where: {
          ...approvedWhere,
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
      prisma.leaveRequest.findMany({
        where: {
          ...approvedWhere,
          startDate: { gte: today, lte: next7Days },
        },
        orderBy: [{ startDate: "asc" }, { created_at: "desc" }],
        take: 10,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      distributionRowsPromise,
      overlappingApprovedLeavesPromise,
    ]);

  const leaveDistribution = LEAVE_TYPES.map((type) => ({
    type,
    count: distributionRows.find((row) => row.type === type)?._count._all ?? 0,
  }));

  const availabilityByDay = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + offset);
    date.setUTCHours(0, 0, 0, 0);

    const onLeaveCount = overlappingApprovedLeaves.filter((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(0, 0, 0, 0);
      return start <= date && end >= date;
    }).length;

    return {
      date: date.toISOString(),
      available: Math.max(totalUsers - onLeaveCount, 0),
      onLeave: onLeaveCount,
      total: totalUsers,
    };
  });

  return {
    totalUsers,
    pendingApprovals,
    todayLeaves,
    upcomingLeaves,
    leaveDistribution,
    availabilityByDay,
  };
};
