import "dotenv/config";
import "./instrument.js";
import { app } from "./app.js";
import { prisma } from "./lib/db.js";
import { startAccrualCronJobs } from "./services/accrual.service.js";
import { startSlackDigestCron } from "./integrations/slack/slack.digest.js";
import { startRefreshTokenCleanupCron } from "./services/refresh-token-cleanup.service.js";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  startSlackDigestCron();
  startAccrualCronJobs();
  startRefreshTokenCleanupCron();
});

server.on("error", (error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

/**
 * Railway sends SIGTERM on every deploy. Without this the process is killed
 * while requests are still in flight, cutting transactions mid-write and
 * leaving pooled Postgres connections to time out rather than close.
 */
let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);

  // Force-exit if connections refuse to drain in time.
  const forceExit = setTimeout(() => {
    console.error("Shutdown timed out, exiting");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async (error) => {
    if (error) {
      console.error("Error closing server", error);
    }

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting Prisma", disconnectError);
    }

    process.exit(error ? 1 : 0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  process.exit(1);
});
