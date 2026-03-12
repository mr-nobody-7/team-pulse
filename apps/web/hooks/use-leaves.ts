import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse, ListLeaveParams, ListLeaveResponse } from "@/types/api";

async function fetchLeaves(params: ListLeaveParams): Promise<ListLeaveResponse> {
  const { data } = await api.get<ApiResponse<ListLeaveResponse>>("/leave", {
    params,
  });
  return data.data;
}

/**
 * Hook to fetch leave requests with optional filters.
 *
 * @example
 * const { data, isLoading } = useLeaves({ status: "PENDING", page: 1, limit: 10 });
 */
export function useLeaves(params: ListLeaveParams = {}) {
  return useQuery({
    queryKey: ["leaves", params],
    queryFn: () => fetchLeaves(params),
  });
}
