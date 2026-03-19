import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";

import api from "@/lib/axios";
import type { ApiResponse, LeaveRequest, ListLeaveResponse } from "@/types/api";

/** Map keyed by "yyyy-MM-dd" → all leaves that cover that day */
export type CalendarLeavesMap = Record<string, LeaveRequest[]>;

const LEAVE_PAGE_SIZE = 50;

async function fetchApprovedLeaves(teamId?: string): Promise<LeaveRequest[]> {
  const leaves: LeaveRequest[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const { data } = await api.get<ApiResponse<ListLeaveResponse>>("/leave", {
      params: {
        status: "APPROVED",
        page,
        limit: LEAVE_PAGE_SIZE,
        ...(teamId ? { team_id: teamId } : {}),
      },
    });

    const payload = data.data;
    leaves.push(...payload.leaves);

    const safeLimit = payload.limit > 0 ? payload.limit : LEAVE_PAGE_SIZE;
    totalPages = Math.max(1, Math.ceil(payload.total / safeLimit));

    if (payload.leaves.length === 0) {
      break;
    }

    page += 1;
  }

  return leaves;
}

async function fetchMonthLeaves(
  year: number,
  month: number,
  teamId?: string,
): Promise<CalendarLeavesMap> {
  // The API has no date-range filter, so we fetch approved leaves across pages
  // and filter/expand client-side for the visible grid window.
  const leaves = await fetchApprovedLeaves(teamId);

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  // Include one week beyond the visible grid edges for padding cells
  const gridStart = addDays(monthStart, -7);
  const gridEnd = addDays(monthEnd, 7);

  const map: CalendarLeavesMap = {};

  for (const leave of leaves) {
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
 * @param teamId Optional team ID to filter leaves; omit for all teams
 */
export function useCalendarLeaves(
  year: number,
  month: number,
  teamId?: string,
) {
  return useQuery({
    queryKey: ["calendar-leaves", year, month, teamId ?? ""],
    queryFn: () => fetchMonthLeaves(year, month, teamId),
  });
}
