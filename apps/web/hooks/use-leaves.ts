import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  ApiResponse,
  ListLeaveParams,
  ListLeaveResponse,
} from "@/types/api";

interface UseLeavesOptions {
  enabled?: boolean;
  staleTime?: number;
}

async function fetchLeaves(
  params: ListLeaveParams,
): Promise<ListLeaveResponse> {
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
export function useLeaves(
  params: ListLeaveParams = {},
  options: UseLeavesOptions | boolean = true,
) {
  const normalized: UseLeavesOptions =
    typeof options === "boolean" ? { enabled: options } : options;

  return useQuery({
    queryKey: ["leaves", params],
    queryFn: () => fetchLeaves(params),
    enabled: normalized.enabled ?? true,
    staleTime: normalized.staleTime ?? 60_000,
  });
}
