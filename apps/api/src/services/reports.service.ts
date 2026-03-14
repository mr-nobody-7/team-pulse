import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";
import { BadRequestError } from "../utils/errors.js";

interface GetDashboardSummaryParams {
  userId: string;
  workspaceId: string;
  role: string;
  teamId: string | null;
}

interface GetReportsAnalyticsParams {
  userId: string;
  workspaceId: string;
  role: string;
  teamId: string | null;
  month: string; // YYYY-MM
  teamFilterId?: string;
}

const LEAVE_TYPES = ["VACATION", "SICK", "PERSONAL", "CASUAL"] as const;

function startOfTodayUtc() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

function startOfMonthUtc(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (monthPart ?? 1) - 1, 1));
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function endOfMonthUtc(start: Date) {
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function overlapsRange(
  start: Date,
  end: Date,
  rangeStart: Date,
  rangeEnd: Date,
) {
  return start <= rangeEnd && end >= rangeStart;
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

export const getReportsAnalytics = async ({
  userId,
  workspaceId,
  role,
  teamId,
  month,
  teamFilterId,
}: GetReportsAnalyticsParams) => {
  const monthStart = startOfMonthUtc(month);
  const monthEnd = endOfMonthUtc(monthStart);

  const yearStart = new Date(
    Date.UTC(monthStart.getUTCFullYear(), 0, 1, 0, 0, 0, 0),
  );
  const yearEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), 11, 31, 23, 59, 59, 999),
  );

  const leaveScope: Prisma.LeaveRequestWhereInput = {
    user: { workspaceId },
    status: "APPROVED",
    startDate: { lte: yearEnd },
    endDate: { gte: yearStart },
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
  } else if (teamFilterId) {
    leaveScope.teamId = teamFilterId;
  }

  const [leaves, teams] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: leaveScope,
      select: {
        id: true,
        type: true,
        teamId: true,
        startDate: true,
        endDate: true,
      },
    }),
    prisma.team.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    }),
  ]);

  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));

  const usageByMonth = Array.from({ length: 12 }, (_, monthIndex) => {
    const start = new Date(Date.UTC(monthStart.getUTCFullYear(), monthIndex, 1));
    const end = endOfMonthUtc(start);

    const count = leaves.filter((leave) =>
      overlapsRange(leave.startDate, leave.endDate, start, end),
    ).length;

    return {
      month: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
      count,
    };
  });

  const monthScopedLeaves = leaves.filter((leave) =>
    overlapsRange(leave.startDate, leave.endDate, monthStart, monthEnd),
  );

  const leaveByType = LEAVE_TYPES.map((type) => ({
    type,
    count: monthScopedLeaves.filter((leave) => leave.type === type).length,
  }));

  const teamCounts = new Map<string, number>();
  for (const leave of monthScopedLeaves) {
    teamCounts.set(leave.teamId, (teamCounts.get(leave.teamId) ?? 0) + 1);
  }

  const leaveByTeam = Array.from(teamCounts.entries())
    .map(([teamKey, count]) => ({
      teamId: teamKey,
      teamName: teamNameById.get(teamKey) ?? "Unknown",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    month,
    leaveUsageByMonth: usageByMonth,
    leaveByType,
    leaveByTeam,
  };
};
