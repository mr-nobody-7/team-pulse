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

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

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

  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const status = params.status ?? "ALL";
  const teamId = params.team_id ?? "all";

  return useQuery({
    queryKey: ["leaves", status, teamId, page, limit],
    queryFn: () =>
      fetchLeaves({
        ...(params.status ? { status: params.status } : {}),
        ...(params.team_id ? { team_id: params.team_id } : {}),
        page,
        limit,
      }),
    enabled: normalized.enabled ?? true,
    staleTime: normalized.staleTime ?? 60_000,
    gcTime: 15 * 60_000,
    placeholderData: (previousData) => previousData,
  });
}
