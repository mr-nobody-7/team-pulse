import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/db.js";
import type {
  AvailabilityBoardQuery,
  AvailabilityStatusValue,
  SetMyAvailabilityInput,
} from "../types/index.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

const ALL_AVAILABILITY_STATUSES: AvailabilityStatusValue[] = [
  "AVAILABLE",
  "ON_LEAVE",
  "WORKING_REMOTELY",
  "HALF_DAY",
  "BUSY",
  "FOCUS_TIME",
];

function normalizeDate(date?: string) {
  const dateKey = date ?? new Date().toISOString().slice(0, 10);
  const normalized = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(normalized.getTime())) {
    throw new BadRequestError("Invalid date");
  }

  return {
    date: normalized,
    dateKey,
    dayEnd: new Date(`${dateKey}T23:59:59.999Z`),
  };
}

interface GetAvailabilityBoardParams {
  userId: string;
  workspaceId: string;
  role: string;
  teamId: string | null;
  query: AvailabilityBoardQuery;
}

export const getAvailabilityBoard = async ({
  userId,
  workspaceId,
  role,
  teamId,
  query,
}: GetAvailabilityBoardParams) => {
  const { date, dateKey, dayEnd } = normalizeDate(query.date);

  const userWhere: Prisma.UserWhereInput = {
    workspaceId,
    isActive: true,
  };

  if (role === "USER") {
    if (teamId) {
      userWhere.teamId = teamId;
    } else {
      userWhere.id = userId;
    }
  } else if (role === "MANAGER") {
    if (!teamId) {
      throw new BadRequestError("Manager must be assigned to a team");
    }
    userWhere.teamId = teamId;
  } else if (query.team_id) {
    userWhere.teamId = query.team_id;
  }

  const users = await prisma.user.findMany({
    where: userWhere,
    select: {
      id: true,
      name: true,
      email: true,
      teamId: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  if (users.length === 0) {
    return {
      date: dateKey,
      total: 0,
      byStatus: ALL_AVAILABILITY_STATUSES.map((status) => ({ status, count: 0 })),
      members: [],
    };
  }

  const userIds = users.map((user) => user.id);

  const [statusRows, leaveRows] = await Promise.all([
    prisma.userAvailabilityStatus.findMany({
      where: {
        workspaceId,
        date,
        userId: { in: userIds },
      },
      select: {
        userId: true,
        status: true,
      },
    }),
    prisma.leaveRequest.findMany({
      where: {
        userId: { in: userIds },
        status: "APPROVED",
        startDate: { lte: dayEnd },
        endDate: { gte: date },
      },
      select: {
        userId: true,
      },
    }),
  ]);

  const savedStatusByUser = new Map(statusRows.map((row) => [row.userId, row.status]));
  const onLeaveUserIds = new Set(leaveRows.map((row) => row.userId));

  const members = users.map((user) => {
    const status: AvailabilityStatusValue = onLeaveUserIds.has(user.id)
      ? "ON_LEAVE"
      : (savedStatusByUser.get(user.id) ?? "AVAILABLE");

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      teamId: user.teamId,
      teamName: user.team?.name ?? null,
      status,
      isOnLeave: onLeaveUserIds.has(user.id),
    };
  });

  const countByStatus = members.reduce<Record<AvailabilityStatusValue, number>>(
    (acc, member) => {
      acc[member.status] += 1;
      return acc;
    },
    {
      AVAILABLE: 0,
      ON_LEAVE: 0,
      WORKING_REMOTELY: 0,
      HALF_DAY: 0,
      BUSY: 0,
      FOCUS_TIME: 0,
    },
  );

  return {
    date: dateKey,
    total: members.length,
    byStatus: ALL_AVAILABILITY_STATUSES.map((status) => ({
      status,
      count: countByStatus[status],
    })),
    members,
  };
};

export const setMyAvailability = async (
  userId: string,
  workspaceId: string,
  input: SetMyAvailabilityInput,
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      workspaceId,
      isActive: true,
    },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const { date, dateKey, dayEnd } = normalizeDate(input.date);

  const saved = await prisma.userAvailabilityStatus.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    create: {
      userId,
      workspaceId,
      date,
      status: input.status,
    },
    update: {
      status: input.status,
    },
    select: {
      status: true,
    },
  });

  const onLeaveCount = await prisma.leaveRequest.count({
    where: {
      userId,
      status: "APPROVED",
      startDate: { lte: dayEnd },
      endDate: { gte: date },
    },
  });

  return {
    date: dateKey,
    status: onLeaveCount > 0 ? "ON_LEAVE" : saved.status,
    savedStatus: saved.status,
    isOnLeave: onLeaveCount > 0,
  };
};
