import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { ApiResponse, ReportsAnalytics } from "@/types/api";

interface UseReportsAnalyticsParams {
  month?: string;
  from?: string;
  to?: string;
  teamId?: string;
}

interface UseReportsAnalyticsOptions {
  enabled?: boolean;
}

async function fetchReportsAnalytics({
  month,
  from,
  to,
  teamId,
}: UseReportsAnalyticsParams): Promise<ReportsAnalytics> {
  const { data } = await api.get<ApiResponse<ReportsAnalytics>>(
    "/reports/analytics",
    {
      params: {
        ...(month ? { month } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(teamId ? { team_id: teamId } : {}),
      },
    },
  );

  return data.data;
}

export function useReportsAnalytics(
  { month, from, to, teamId }: UseReportsAnalyticsParams,
  options: UseReportsAnalyticsOptions = {},
) {
  return useQuery({
    queryKey: [
      "reports-analytics",
      month ?? "",
      from ?? "",
      to ?? "",
      teamId ?? "all",
    ],
    queryFn: () => fetchReportsAnalytics({ month, from, to, teamId }),
    staleTime: 5 * 60_000,
    enabled: options.enabled ?? true,
  });
}
