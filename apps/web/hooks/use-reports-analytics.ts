import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { ApiResponse, ReportsAnalytics } from "@/types/api";

interface UseReportsAnalyticsParams {
  month: string; // YYYY-MM
  teamId?: string;
}

interface UseReportsAnalyticsOptions {
  enabled?: boolean;
}

async function fetchReportsAnalytics({
  month,
  teamId,
}: UseReportsAnalyticsParams): Promise<ReportsAnalytics> {
  const { data } = await api.get<ApiResponse<ReportsAnalytics>>(
    "/reports/analytics",
    {
      params: {
        month,
        ...(teamId ? { team_id: teamId } : {}),
      },
    },
  );

  return data.data;
}

export function useReportsAnalytics(
  { month, teamId }: UseReportsAnalyticsParams,
  options: UseReportsAnalyticsOptions = {},
) {
  return useQuery({
    queryKey: ["reports-analytics", month, teamId ?? "all"],
    queryFn: () => fetchReportsAnalytics({ month, teamId }),
    staleTime: 5 * 60_000,
    enabled: options.enabled ?? true,
  });
}
