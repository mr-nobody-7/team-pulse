import { prisma } from "../lib/db.js";
import type { TransferOwnershipInput } from "../types/index.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors.js";
import { sendMail } from "./mail.service.js";

export async function listWorkspaceMembers(workspaceId: string) {
  return prisma.user.findMany({
    where: {
      workspaceId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: [{ role: "desc" }, { name: "asc" }],
  });
}

export async function transferWorkspaceOwnership(
  actorUserId: string,
  workspaceId: string,
  input: TransferOwnershipInput,
  ipAddress?: string,
) {
  const currentOwner = await prisma.user.findUnique({
    where: { id: actorUserId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      workspaceId: true,
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!currentOwner || currentOwner.workspaceId !== workspaceId) {
    throw new NotFoundError("Workspace not found");
  }

  if (currentOwner.role !== "OWNER") {
    throw new ForbiddenError("Only the current workspace owner can transfer ownership");
  }

  if (input.newOwnerUserId === actorUserId) {
    throw new BadRequestError("You cannot transfer ownership to yourself");
  }

  const newOwner = await prisma.user.findFirst({
    where: {
      id: input.newOwnerUserId,
      workspaceId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!newOwner) {
    throw new BadRequestError("The selected user must be an active member of this workspace");
  }

  if (newOwner.role === "USER") {
    throw new BadRequestError(
      "The new owner must already be a Manager or Admin before ownership can be transferred.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: currentOwner.id },
      data: { role: "ADMIN" },
    });

    await tx.user.update({
      where: { id: newOwner.id },
      data: { role: "OWNER" },
    });

    await tx.auditLog.create({
      data: {
        action: "USER_UPDATED",
        userId: currentOwner.id,
        actorDisplay: currentOwner.email,
        workspaceId,
        targetId: currentOwner.id,
        targetType: "User",
        ipAddress: ipAddress ?? null,
        metadata: {
          change: "ownership_transfer_demotion",
          previousRole: "OWNER",
          newRole: "ADMIN",
          transferredToUserId: newOwner.id,
        },
      },
    });

    await tx.auditLog.create({
      data: {
        action: "USER_UPDATED",
        userId: currentOwner.id,
        actorDisplay: currentOwner.email,
        workspaceId,
        targetId: newOwner.id,
        targetType: "User",
        ipAddress: ipAddress ?? null,
        metadata: {
          change: "ownership_transfer_promotion",
          previousRole: newOwner.role,
          newRole: "OWNER",
          transferredFromUserId: currentOwner.id,
        },
      },
    });
  });

  void sendMail(
    newOwner.email,
    `You are now the workspace owner of ${currentOwner.workspace.name}`,
    `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Workspace ownership transferred</h2>
        <p>Hi ${newOwner.name},</p>
        <p>You are now the workspace owner of <strong>${currentOwner.workspace.name}</strong>.</p>
        <p>You now have full control of this workspace.</p>
      </div>
    `,
    newOwner.name,
  ).catch((error: unknown) => {
    console.error("[WorkspaceOwnership] Failed to send transfer email", {
      workspaceId,
      newOwnerUserId: newOwner.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}
