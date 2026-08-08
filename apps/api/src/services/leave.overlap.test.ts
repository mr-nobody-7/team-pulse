import { describe, expect, it } from "vitest";
import {
  type LeavePeriod,
  leavePeriodsOverlap,
  toEndSlot,
  toStartSlot,
} from "./leave.service.js";

/**
 * Session-granularity overlap detection is the most intricate logic in the
 * product and runs on every leave application. A false negative double-books
 * someone; a false positive rejects a valid request.
 */

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

function period(
  start: string,
  startSession: LeavePeriod["startSession"],
  end: string,
  endSession: LeavePeriod["endSession"],
): LeavePeriod {
  return {
    startDate: day(start),
    startSession,
    endDate: day(end),
    endSession,
  };
}

/** Single-day helper: one date, one session. */
function oneDay(date: string, session: LeavePeriod["startSession"]) {
  return period(date, session, date, session);
}

describe("half-day slot mapping", () => {
  it("places FIRST_HALF in the morning slot and SECOND_HALF in the afternoon", () => {
    const d = day("2026-08-10");

    expect(toStartSlot(d, "FIRST_HALF")).toBe(toStartSlot(d, "FULL_DAY"));
    expect(toStartSlot(d, "SECOND_HALF")).toBe(toStartSlot(d, "FULL_DAY") + 1);
    expect(toEndSlot(d, "FIRST_HALF")).toBe(toEndSlot(d, "FULL_DAY") - 1);
    expect(toEndSlot(d, "SECOND_HALF")).toBe(toEndSlot(d, "FULL_DAY"));
  });

  it("orders slots consecutively across day boundaries", () => {
    // Afternoon of day N and morning of day N+1 must be adjacent, not equal.
    expect(toEndSlot(day("2026-08-10"), "SECOND_HALF") + 1).toBe(
      toStartSlot(day("2026-08-11"), "FIRST_HALF"),
    );
  });
});

describe("leavePeriodsOverlap", () => {
  const cases: Array<[string, LeavePeriod, LeavePeriod, boolean]> = [
    [
      "same day, morning vs afternoon — no overlap",
      oneDay("2026-08-10", "FIRST_HALF"),
      oneDay("2026-08-10", "SECOND_HALF"),
      false,
    ],
    [
      "same day, morning vs full day — overlap",
      oneDay("2026-08-10", "FIRST_HALF"),
      oneDay("2026-08-10", "FULL_DAY"),
      true,
    ],
    [
      "same day, afternoon vs full day — overlap",
      oneDay("2026-08-10", "SECOND_HALF"),
      oneDay("2026-08-10", "FULL_DAY"),
      true,
    ],
    [
      "same day, identical half — overlap",
      oneDay("2026-08-10", "SECOND_HALF"),
      oneDay("2026-08-10", "SECOND_HALF"),
      true,
    ],
    [
      "adjacent days, PM then next-day AM — no overlap",
      oneDay("2026-08-10", "SECOND_HALF"),
      oneDay("2026-08-11", "FIRST_HALF"),
      false,
    ],
    [
      "adjacent days, full days back to back — no overlap",
      oneDay("2026-08-10", "FULL_DAY"),
      oneDay("2026-08-11", "FULL_DAY"),
      false,
    ],
    [
      "multi-day spans sharing one endpoint day — overlap",
      period("2026-08-10", "FULL_DAY", "2026-08-12", "FULL_DAY"),
      period("2026-08-12", "FULL_DAY", "2026-08-14", "FULL_DAY"),
      true,
    ],
    [
      "multi-day span ending AM vs next span starting PM same day — no overlap",
      period("2026-08-10", "FULL_DAY", "2026-08-12", "FIRST_HALF"),
      period("2026-08-12", "SECOND_HALF", "2026-08-14", "FULL_DAY"),
      false,
    ],
    [
      "multi-day span ending PM vs next span starting AM same day — overlap",
      period("2026-08-10", "FULL_DAY", "2026-08-12", "SECOND_HALF"),
      period("2026-08-12", "FIRST_HALF", "2026-08-14", "FULL_DAY"),
      true,
    ],
    [
      "fully contained span — overlap",
      period("2026-08-10", "FULL_DAY", "2026-08-20", "FULL_DAY"),
      period("2026-08-14", "FIRST_HALF", "2026-08-15", "SECOND_HALF"),
      true,
    ],
    [
      "disjoint months — no overlap",
      period("2026-08-10", "FULL_DAY", "2026-08-12", "FULL_DAY"),
      period("2026-09-10", "FULL_DAY", "2026-09-12", "FULL_DAY"),
      false,
    ],
  ];

  for (const [name, a, b, expected] of cases) {
    it(name, () => {
      expect(leavePeriodsOverlap(a, b)).toBe(expected);
    });

    it(`${name} (order reversed)`, () => {
      // Overlap must be symmetric regardless of which period is "existing".
      expect(leavePeriodsOverlap(b, a)).toBe(expected);
    });
  }
});
