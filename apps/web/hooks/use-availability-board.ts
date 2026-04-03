import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { ApiResponse, AvailabilityBoardResponse } from "@/types/api";

interface UseAvailabilityBoardParams {
  date?: string;
  teamId?: string;
}

interface UseAvailabilityBoardOptions {
  enabled?: boolean;
}

async function fetchAvailabilityBoard({
  date,
  teamId,
}: UseAvailabilityBoardParams): Promise<AvailabilityBoardResponse> {
  const { data } = await api.get<ApiResponse<AvailabilityBoardResponse>>(
    "/availability/board",
    {
      params: {
        ...(date ? { date } : {}),
        ...(teamId ? { team_id: teamId } : {}),
      },
    },
  );

  return data.data;
}

export function useAvailabilityBoard(
  { date, teamId }: UseAvailabilityBoardParams,
  options: UseAvailabilityBoardOptions = {},
) {
  const normalizedDate = date ?? "";
  const normalizedTeamId = teamId ?? "all";

  return useQuery({
    queryKey: ["availability-board", normalizedDate, normalizedTeamId],
    queryFn: () => fetchAvailabilityBoard({ date, teamId }),
    enabled: options.enabled ?? true,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (previousData) => previousData,
  });
}
