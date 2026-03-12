import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { ApiResponse, LeaveRequest, ListLeaveResponse } from "@/types/api";

/** Map keyed by "yyyy-MM-dd" → all leaves that cover that day */
export type CalendarLeavesMap = Record<string, LeaveRequest[]>;

async function fetchMonthLeaves(
  year: number,
  month: number,
): Promise<CalendarLeavesMap> {
  // The API has no date-range filter, so we fetch all approved leaves
  // in one call (high limit) and filter/expand client-side.
  const { data } = await api.get<ApiResponse<ListLeaveResponse>>("/leave", {
    params: { status: "APPROVED", page: 1, limit: 500 },
  });

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  // Include one week beyond the visible grid edges for padding cells
  const gridStart = addDays(monthStart, -7);
  const gridEnd = addDays(monthEnd, 7);

  const map: CalendarLeavesMap = {};

  for (const leave of data.data.leaves) {
    const leaveStart = parseISO(leave.startDate);
    const leaveEnd = parseISO(leave.endDate);

    // Skip leaves that don't touch the extended grid window at all
    if (leaveEnd < gridStart || leaveStart > gridEnd) continue;

    // Clamp to the grid window to avoid needlessly iterating far-future spans
    const start = leaveStart < gridStart ? gridStart : leaveStart;
    const end = leaveEnd > gridEnd ? gridEnd : leaveEnd;

    for (const day of eachDayOfInterval({ start, end })) {
      const key = format(day, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(leave);
    }
  }

  return map;
}

/**
 * Fetches approved leave requests and expands each multi-day span
 * into individual day-keyed entries for the calendar grid.
 *
 * @param year  Full year (e.g. 2026)
 * @param month 0-indexed month (0 = January)
 */
export function useCalendarLeaves(year: number, month: number) {
  return useQuery({
    queryKey: ["calendar-leaves", year, month],
    queryFn: () => fetchMonthLeaves(year, month),
  });
}
