import { prisma } from "../lib/db.js";

export const listTeams = async (workspaceId: string) => {
  return prisma.team.findMany({
    where: { workspaceId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
};
