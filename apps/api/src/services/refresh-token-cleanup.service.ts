import cron from "node-cron";
import { prisma } from "../lib/db.js";

/**
 * Clean up expired and revoked refresh tokens
 * Runs daily at 2 AM UTC
 */
export function startRefreshTokenCleanupCron() {
  cron.schedule("0 2 * * *", async () => {
    try {
      const now = new Date();
      const result = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            // Delete expired tokens
            { expiresAt: { lt: now } },
            // Delete revoked tokens older than 24 hours (grace period for in-flight requests)
            {
              AND: [
                { revokedAt: { not: null } },
                { revokedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
              ],
            },
          ],
        },
      });

      console.log(
        `[RefreshToken Cleanup] Deleted ${result.count} expired/revoked tokens`,
      );
    } catch (error) {
      console.error("[RefreshToken Cleanup] Error cleaning up tokens:", error);
    }
  });

  console.log("[RefreshToken Cleanup] Cron job started (runs daily at 2 AM UTC)");
}
