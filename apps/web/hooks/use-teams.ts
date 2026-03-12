import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { ApiResponse, Team } from "@/types/api";

async function fetchTeams(): Promise<Team[]> {
  const { data } = await api.get<ApiResponse<Team[]>>("/teams");
  return data.data;
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    staleTime: 10 * 60_000, // teams rarely change — cache for 10 min
  });
}
