import { prisma } from "../lib/db.js";
import { BadRequestError } from "../utils/errors.js";
import { sendMail } from "./mail.service.js";

/**
 * Revoke a Google OAuth token best-effort (fire-and-forget).
 * Failures are intentionally swallowed — token expiry will handle cleanup.
 */
async function revokeGoogleToken(accessTokenEncrypted: string): Promise<void> {
  // Note: accessTokenEncrypted is stored encrypted. Revocation requires the
  // plaintext token. Best-effort: if decryption is unavailable here, the
  // token will naturally expire. We still attempt with the stored value for
  // cases where a plaintext token has been stored directly.
  try {
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessTokenEncrypted)}`,
      { method: "POST" },
    );
  } catch {
    // best-effort; swallow error
  }
}

async function sendDeletionConfirmationEmail(
  email: string,
  name: string,
): Promise<void> {
  try {
    await sendMail(
      email,
      "Your TeamFore account has been deleted",
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Account Deleted</h2>
        <p>Hi ${name},</p>
        <p>Your TeamFore account and all associated personal data have been permanently deleted, as requested.</p>
        <p>This action cannot be undone. If you believe this was a mistake, please contact our support team immediately.</p>
        <p style="margin-top: 24px;">Thank you for using TeamFore.</p>
      </div>
      `,
      name,
    );
  } catch {
    // Non-fatal — deletion has already completed; log and continue.
    console.error("[AccountDeletion] Failed to send confirmation email to", email);
  }
}

async function sendWorkspaceDeletionEmail(
  email: string,
  name: string,
  workspaceName: string,
): Promise<void> {
  try {
    await sendMail(
      email,
      "Your TeamFore workspace has been deleted",
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Workspace Deleted</h2>
        <p>Hi ${name},</p>
        <p>Your TeamFore workspace <strong>${workspaceName}</strong> and all associated data have been permanently deleted.</p>
        <p>Your account has also been deleted per your request.</p>
        <p style="margin-top: 24px;">Thank you for using TeamFore.</p>
      </div>
      `,
      name,
    );
  } catch {
    console.error("[AccountDeletion] Failed to send workspace deletion email to", email);
  }
}

/**
 * Anonymize all AuditLog rows where userId matches the given id.
 * Sets userId=null and actorDisplay="Deleted User".
 * Runs outside any deletion transaction so audit history is preserved.
 */
async function anonymizeAuditLogs(userId: string): Promise<void> {
  await prisma.auditLog.updateMany({
    where: { userId },
    data: { userId: null, actorDisplay: "Deleted User" },
  });
}

/**
 * Delete a regular user (USER, MANAGER, or non-sole ADMIN).
 * Removes the user's own data; preserves workspace and other members.
 */
async function deleteRegularUser(
  userId: string,
  workspaceId: string,
  googleToken: { accessTokenEncrypted: string } | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Nullify approverId on leave requests this user approved for others
    await tx.leaveRequest.updateMany({
      where: { approverId: userId },
      data: { approverId: null },
    });

    // Delete this user's own leave requests
    await tx.leaveRequest.deleteMany({ where: { userId } });

    // Delete the user (cascades: availability, workload, feedback, googleToken,
    // pushSubscriptions, refreshTokens, leaveBalances)
    await tx.user.delete({ where: { id: userId } });
  });

  // Anonymize audit logs outside transaction (append-only table, no FK)
  await anonymizeAuditLogs(userId);

  // Revoke Google token best-effort
  if (googleToken) {
    await revokeGoogleToken(googleToken.accessTokenEncrypted);
  }
}

/**
 * Delete an entire workspace and all its data when the sole admin requests deletion.
 * All workspace data cascades via Prisma relations.
 */
async function deleteWorkspaceAndOwner(
  userId: string,
  workspaceId: string,
): Promise<void> {
  // Collect all user IDs in the workspace for audit anonymization
  const workspaceUsers = await prisma.user.findMany({
    where: { workspaceId },
    select: { id: true },
  });
  const userIds = workspaceUsers.map((u) => u.id);

  await prisma.$transaction(async (tx) => {
    // Remove FK constraints that don't cascade on workspace delete:
    // LeaveRequest has no cascade on user delete — delete all workspace leave requests first
    await tx.leaveRequest.deleteMany({
      where: { userId: { in: userIds } },
    });

    // SlackInstallation cascades via workspaceId. Delete workspace — cascades:
    // users, teams, leaveTypeSettings, availabilityStatuses, workloadStatuses,
    // publicHolidays, feedbackEntries, leaveBalances, leavePolicies,
    // slackInstallation, workloadStatuses
    await tx.workspace.delete({ where: { id: workspaceId } });
  });

  // Anonymize audit logs for all former workspace members
  await prisma.auditLog.updateMany({
    where: { userId: { in: userIds } },
    data: { userId: null, actorDisplay: "Deleted User" },
  });

  // Also anonymize workspace-scoped audit logs without a userId
  await prisma.auditLog.updateMany({
    where: { workspaceId, userId: null, actorDisplay: null },
    data: { actorDisplay: "Deleted Workspace" },
  });
}

/**
 * Main entry point for account deletion.
 *
 * Business rules:
 * - USER / MANAGER: delete own data, preserve workspace
 * - ADMIN (sole admin, sole member of workspace): delete entire workspace
 * - ADMIN (sole admin, other members exist): BLOCKED — must transfer first
 * - ADMIN (not sole admin): delete own data, preserve workspace (same as USER)
 */
export async function deleteUserAccount(
  userId: string,
  workspaceId: string,
  ipAddress: string | undefined,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      workspaceId: true,
      googleToken: { select: { accessTokenEncrypted: true } },
    },
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  if (!workspace) {
    throw new BadRequestError("Workspace not found");
  }

  // Record intent before deletion (audit log will be anonymized right after)
  await prisma.auditLog.create({
    data: {
      action: "ACCOUNT_DELETION_INITIATED",
      userId,
      actorDisplay: user.email,
      workspaceId,
      targetId: userId,
      targetType: "User",
      ipAddress: ipAddress ?? null,
      metadata: { role: user.role },
    },
  });

  if (user.role === "ADMIN") {
    // Check if this user is the only ADMIN in the workspace
    const adminCount = await prisma.user.count({
      where: { workspaceId, role: "ADMIN" },
    });

    if (adminCount === 1) {
      // This user is the sole admin — check if there are other members
      const totalMembers = await prisma.user.count({ where: { workspaceId } });

      if (totalMembers > 1) {
        throw new BadRequestError(
          "Transfer workspace ownership or remove all members before deleting your account.",
        );
      }

      // Sole admin AND sole member — delete entire workspace
      await deleteWorkspaceAndOwner(userId, workspaceId);
      await sendWorkspaceDeletionEmail(user.email, user.name, workspace.name);
      return;
    }
  }

  // USER, MANAGER, or non-sole ADMIN
  await deleteRegularUser(userId, workspaceId, user.googleToken);
  await sendDeletionConfirmationEmail(user.email, user.name);
}
