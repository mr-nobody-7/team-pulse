import type { CalendarLeavesMap } from "@/hooks/use-calendar-leaves";

export type CapacityHeatmapLevel = "FULL" | "MEDIUM" | "LOW";

export interface CapacityHeatmapCell {
  availableCount: number;
  onLeaveCount: number;
  totalCount: number;
  capacityPercent: number;
  level: CapacityHeatmapLevel;
}

export function toCapacityHeatmapCell(
  onLeaveCount: number,
  totalMembers: number,
): CapacityHeatmapCell {
  const safeTotal = Math.max(totalMembers, 1);
  const clampedOnLeave = Math.min(Math.max(onLeaveCount, 0), safeTotal);
  const availableCount = Math.max(safeTotal - clampedOnLeave, 0);
  const capacityPercent = Math.round((availableCount / safeTotal) * 100);

  const level: CapacityHeatmapLevel =
    clampedOnLeave === 0 ? "FULL" : capacityPercent > 50 ? "MEDIUM" : "LOW";

  return {
    availableCount,
    onLeaveCount: clampedOnLeave,
    totalCount: safeTotal,
    capacityPercent,
    level,
  };
}

/**
 * Build daily capacity metrics from leave occupancy and scoped team size.
 *
 * - FULL: nobody on leave (100% capacity)
 * - MEDIUM: capacity above 50%
 * - LOW: capacity at or below 50%
 */
export function buildCapacityHeatmap(
  leavesMap: CalendarLeavesMap,
  totalMembers: number,
): Record<string, CapacityHeatmapCell> {
  if (totalMembers <= 0) {
    return {};
  }

  const entries = Object.entries(leavesMap).map(([date, leaves]) => {
    return [date, toCapacityHeatmapCell(leaves.length, totalMembers)] as const;
  });

  return Object.fromEntries(entries);
}
