import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/auth.service";

/**
 * Hook to fetch the authenticated user.
 * Prefer useAuth() for reading the cached user already loaded at app start.
 * Use this hook when you need fine-grained loading/error control for the /me call.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });
}
