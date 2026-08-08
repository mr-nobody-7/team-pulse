import { prisma } from "../lib/db.js";

/** Prisma unique-constraint violation. */
function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: unknown } | null)?.code === "P2002";
}

/**
 * Runs `job` at most once for a given (jobName, periodKey) across every API
 * replica.
 *
 * The cron jobs in this service run in-process, and node-cron has no
 * coordination between instances. Without this, scaling the API to two replicas
 * would accrue every user's leave balance twice per period — a silent
 * data-integrity bug that compounds through carry-forward.
 *
 * Coordination is a durable claim row rather than a Postgres session advisory
 * lock, because Neon pools connections through pgbouncer: session-scoped locks
 * are not reliably held across pooled connections, and holding a transaction
 * open for the length of a job that calls out to Slack would be worse.
 *
 * @returns true if this process ran the job, false if another replica had
 *          already claimed the period.
 */
export async function runScheduledJobOnce(
  jobName: string,
  periodKey: string,
  job: () => Promise<void>,
): Promise<boolean> {
  try {
    await prisma.scheduledJobRun.create({ data: { jobName, periodKey } });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return false;
    }
    throw error;
  }

  try {
    await job();
    await prisma.scheduledJobRun.update({
      where: { jobName_periodKey: { jobName, periodKey } },
      data: { completedAt: new Date() },
    });
    return true;
  } catch (error) {
    // Release the claim so a later tick can retry this period.
    await prisma.scheduledJobRun
      .delete({ where: { jobName_periodKey: { jobName, periodKey } } })
      .catch(() => undefined);
    throw error;
  }
}

/** UTC period keys, so replicas in any region agree on the same bucket. */
export const periodKeys = {
  /** e.g. 2026-08 */
  month(date = new Date()): string {
    return date.toISOString().slice(0, 7);
  },
  /** e.g. 2026 */
  year(date = new Date()): string {
    return date.toISOString().slice(0, 4);
  },
  /** e.g. 2026-08-08 */
  day(date = new Date()): string {
    return date.toISOString().slice(0, 10);
  },
  /** e.g. 2026-08-08T09:30 */
  minute(date = new Date()): string {
    return date.toISOString().slice(0, 16);
  },
};
