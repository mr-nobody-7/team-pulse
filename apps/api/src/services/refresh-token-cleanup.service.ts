import cron from "node-cron";
import { prisma } from "../lib/db.js";
import { periodKeys, runScheduledJobOnce } from "../utils/scheduled-job.js";

/**
 * Delete expired refresh tokens, and revoked ones past a 24h grace period that
 * covers in-flight requests still holding the old token.
 */
async function cleanupRefreshTokens(): Promise<void> {
  const now = new Date();
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        {
          AND: [
            { revokedAt: { not: null } },
            {
              revokedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
            },
          ],
        },
      ],
    },
  });

  console.log(
    `[RefreshToken Cleanup] Deleted ${result.count} expired/revoked tokens`,
  );
}

/** Runs daily at 2 AM UTC, once across all replicas. */
export function startRefreshTokenCleanupCron() {
  cron.schedule("0 2 * * *", () => {
    void runScheduledJobOnce(
      "refresh-token-cleanup",
      periodKeys.day(),
      cleanupRefreshTokens,
    ).catch((error: unknown) => {
      console.error("[RefreshToken Cleanup] Error cleaning up tokens:", error);
    });
  });

  console.log(
    "[RefreshToken Cleanup] Cron job started (runs daily at 2 AM UTC)",
  );
}
