import { useQuery } from "@tanstack/react-query";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";

import api from "@/lib/axios";
import type {
  ApiResponse,
  PublicHoliday,
  PublicHolidayListResponse,
} from "@/types/api";

export type CalendarHolidaysMap = Record<string, PublicHoliday[]>;

interface UsePublicHolidaysParams {
  year: number;
  month: number;
  region?: string;
}

function getCalendarRange(year: number, month: number) {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);
  const from = addDays(monthStart, -7);
  const to = addDays(monthEnd, 7);

  return {
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  };
}

async function fetchPublicHolidays({
  year,
  month,
  region,
}: UsePublicHolidaysParams): Promise<CalendarHolidaysMap> {
  const { from, to } = getCalendarRange(year, month);

  const { data } = await api.get<ApiResponse<PublicHolidayListResponse>>(
    "/holidays",
    {
      params: {
        from,
        to,
        ...(region ? { region } : {}),
      },
    },
  );

  const map: CalendarHolidaysMap = {};

  for (const holiday of data.data.holidays) {
    if (!map[holiday.date]) {
      map[holiday.date] = [];
    }
    map[holiday.date].push(holiday);
  }

  return map;
}

export function usePublicHolidays({
  year,
  month,
  region,
}: UsePublicHolidaysParams) {
  return useQuery({
    queryKey: ["public-holidays", year, month, region ?? ""],
    queryFn: () => fetchPublicHolidays({ year, month, region }),
    staleTime: 12 * 60 * 60_000,
  });
}
