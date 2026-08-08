import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../lib/db.js";
import { listAuditLogs } from "./audit.service.js";
import { getAvailabilityBoard } from "./availability.service.js";
import { listLeave } from "./leave.service.js";

/**
 * Workspace isolation is the invariant that matters most in this product, and
 * the schema does not enforce it: LeaveRequest has no workspaceId column, so
 * tenancy is carried transitively through the user relation. One forgotten join
 * in one service leaks another tenant's data and nothing in the database stops
 * it. These tests seed two workspaces and assert that querying as a member of
 * one never returns anything belonging to the other.
 *
 * Requires a real database. Run with:
 *   DATABASE_URL=... pnpm test:integration
 */

const hasDatabase = Boolean(process.env.DATABASE_URL);
const suite = hasDatabase ? describe : describe.skip;

const RUN = `iso-${Date.now()}`;

type Seeded = {
  workspaceId: string;
  teamId: string;
  userId: string;
  leaveId: string;
};

async function seedWorkspace(label: string): Promise<Seeded> {
  const workspace = await prisma.workspace.create({
    data: { name: `${RUN}-${label}` },
  });

  const team = await prisma.team.create({
    data: { name: `${RUN}-${label}-team`, workspaceId: workspace.id },
  });

  const user = await prisma.user.create({
    data: {
      name: `${RUN}-${label}-user`,
      email: `${RUN}-${label}@example.test`,
      passwordHash: "not-a-real-hash",
      role: "ADMIN",
      workspaceId: workspace.id,
      teamId: team.id,
    },
  });

  const leave = await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      teamId: team.id,
      startDate: new Date("2026-08-10T00:00:00.000Z"),
      endDate: new Date("2026-08-12T00:00:00.000Z"),
      type: "ANNUAL",
      status: "APPROVED",
      reason: `${label}-secret-reason`,
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      action: "LEAVE_APPROVED",
      metadata: { marker: `${label}-secret-audit` },
    },
  });

  await prisma.userAvailabilityStatus.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      date: new Date("2026-08-10T00:00:00.000Z"),
      status: "ON_LEAVE",
    },
  });

  return {
    workspaceId: workspace.id,
    teamId: team.id,
    userId: user.id,
    leaveId: leave.id,
  };
}

suite("workspace isolation", () => {
  let alpha: Seeded;
  let beta: Seeded;

  beforeAll(async () => {
    alpha = await seedWorkspace("alpha");
    beta = await seedWorkspace("beta");
  });

  afterAll(async () => {
    // Delete children before parents; AuditLog has no FK by design.
    await prisma.userAvailabilityStatus.deleteMany({
      where: { workspaceId: { in: [alpha.workspaceId, beta.workspaceId] } },
    });
    await prisma.leaveRequest.deleteMany({
      where: { userId: { in: [alpha.userId, beta.userId] } },
    });
    await prisma.auditLog.deleteMany({
      where: { workspaceId: { in: [alpha.workspaceId, beta.workspaceId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [alpha.userId, beta.userId] } },
    });
    await prisma.team.deleteMany({
      where: { id: { in: [alpha.teamId, beta.teamId] } },
    });
    await prisma.workspace.deleteMany({
      where: { id: { in: [alpha.workspaceId, beta.workspaceId] } },
    });
    await prisma.$disconnect();
  });

  it("listLeave never returns another workspace's leave", async () => {
    const result = await listLeave(
      { page: 1, limit: 100 } as Parameters<typeof listLeave>[0],
      alpha.userId,
      alpha.workspaceId,
      "ADMIN",
      alpha.teamId,
    );

    const ids = result.leaves.map((leave: { id: string }) => leave.id);
    expect(ids).toContain(alpha.leaveId);
    expect(ids).not.toContain(beta.leaveId);
  });

  it("listAuditLogs never returns another workspace's audit trail", async () => {
    const result = await listAuditLogs(alpha.workspaceId, {
      page: 1,
      limit: 100,
    } as Parameters<typeof listAuditLogs>[1]);

    const serialized = JSON.stringify(result);
    expect(serialized).toContain("alpha-secret-audit");
    expect(serialized).not.toContain("beta-secret-audit");
  });

  it("availability board never returns another workspace's members", async () => {
    const board = await getAvailabilityBoard({
      userId: alpha.userId,
      workspaceId: alpha.workspaceId,
      role: "ADMIN",
      teamId: alpha.teamId,
      query: { date: "2026-08-10" },
    } as Parameters<typeof getAvailabilityBoard>[0]);

    const serialized = JSON.stringify(board);
    expect(serialized).not.toContain(`${RUN}-beta-user`);
  });

  it("a leave id from another workspace is not readable cross-tenant", async () => {
    const result = await listLeave(
      { page: 1, limit: 100 } as Parameters<typeof listLeave>[0],
      beta.userId,
      beta.workspaceId,
      "ADMIN",
      beta.teamId,
    );

    const reasons = result.leaves.map(
      (leave: { reason: string | null }) => leave.reason,
    );
    expect(reasons).not.toContain("alpha-secret-reason");
  });
});

if (!hasDatabase) {
  describe("workspace isolation", () => {
    it.skip("skipped: set DATABASE_URL to run integration tests", () => {
      expect(true).toBe(true);
    });
  });
}
