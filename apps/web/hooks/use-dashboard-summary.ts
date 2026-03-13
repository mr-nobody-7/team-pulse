import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { ApiResponse, DashboardSummary } from "@/types/api";

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<ApiResponse<DashboardSummary>>(
    "/reports/summary",
  );

  return data.data;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 60_000,
  });
}
