import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Idempotency of scheduled jobs across replicas.
 *
 * node-cron runs in-process with no coordination, so without a claim the
 * monthly accrual would run once per replica and silently double every user's
 * leave balance, compounding through carry-forward. These assertions are the
 * regression test for that.
 */

const create = vi.fn();
const update = vi.fn();
const del = vi.fn();

vi.mock("../lib/db.js", () => ({
  prisma: {
    scheduledJobRun: {
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
      delete: (...args: unknown[]) => del(...args),
    },
  },
}));

const { periodKeys, runScheduledJobOnce } = await import("./scheduled-job.js");

/** What Prisma throws when the (jobName, periodKey) unique constraint trips. */
function uniqueViolation() {
  return Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
}

beforeEach(() => {
  create.mockReset();
  update.mockReset();
  del.mockReset();
  // Prisma returns thenables; the production code chains .catch() on delete.
  update.mockResolvedValue({});
  del.mockResolvedValue({});
});

describe("runScheduledJobOnce", () => {
  it("runs the job when it wins the claim", async () => {
    create.mockResolvedValue({});
    const job = vi.fn().mockResolvedValue(undefined);

    const ran = await runScheduledJobOnce("monthly-accrual", "2026-08", job);

    expect(ran).toBe(true);
    expect(job).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("does not run the job when another replica already claimed the period", async () => {
    create.mockRejectedValue(uniqueViolation());
    const job = vi.fn().mockResolvedValue(undefined);

    const ran = await runScheduledJobOnce("monthly-accrual", "2026-08", job);

    expect(ran).toBe(false);
    expect(job).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("accrues once when two replicas fire the same period concurrently", async () => {
    // First claim wins, every subsequent claim for the period collides.
    let claimed = false;
    create.mockImplementation(async () => {
      if (claimed) throw uniqueViolation();
      claimed = true;
      return {};
    });

    const accrue = vi.fn().mockResolvedValue(undefined);
    const results = await Promise.all([
      runScheduledJobOnce("monthly-accrual", "2026-08", accrue),
      runScheduledJobOnce("monthly-accrual", "2026-08", accrue),
      runScheduledJobOnce("monthly-accrual", "2026-08", accrue),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(accrue).toHaveBeenCalledTimes(1);
  });

  it("releases the claim when the job throws, so the period can retry", async () => {
    create.mockResolvedValue({});
    const job = vi.fn().mockRejectedValue(new Error("accrual exploded"));

    await expect(
      runScheduledJobOnce("monthly-accrual", "2026-08", job),
    ).rejects.toThrow("accrual exploded");

    expect(del).toHaveBeenCalledTimes(1);
    expect(update).not.toHaveBeenCalled();
  });

  it("propagates non-unique-constraint failures instead of silently skipping", async () => {
    create.mockRejectedValue(
      Object.assign(new Error("connection lost"), { code: "P1001" }),
    );
    const job = vi.fn();

    await expect(
      runScheduledJobOnce("monthly-accrual", "2026-08", job),
    ).rejects.toThrow("connection lost");
    expect(job).not.toHaveBeenCalled();
  });

  it("treats different periods as separate claims", async () => {
    const claims = new Set<string>();
    create.mockImplementation(async ({ data }: { data: { periodKey: string } }) => {
      if (claims.has(data.periodKey)) throw uniqueViolation();
      claims.add(data.periodKey);
      return {};
    });

    const job = vi.fn().mockResolvedValue(undefined);

    expect(await runScheduledJobOnce("monthly-accrual", "2026-08", job)).toBe(true);
    expect(await runScheduledJobOnce("monthly-accrual", "2026-09", job)).toBe(true);
    expect(await runScheduledJobOnce("monthly-accrual", "2026-09", job)).toBe(false);
    expect(job).toHaveBeenCalledTimes(2);
  });
});

describe("periodKeys", () => {
  const at = new Date("2026-08-08T09:30:45.123Z");

  it("buckets by UTC so replicas in any region agree", () => {
    expect(periodKeys.month(at)).toBe("2026-08");
    expect(periodKeys.year(at)).toBe("2026");
    expect(periodKeys.day(at)).toBe("2026-08-08");
    expect(periodKeys.minute(at)).toBe("2026-08-08T09:30");
  });

  it("gives the digest a distinct key per minute", () => {
    expect(periodKeys.minute(new Date("2026-08-08T09:30:00Z"))).not.toBe(
      periodKeys.minute(new Date("2026-08-08T09:31:00Z")),
    );
  });
});
