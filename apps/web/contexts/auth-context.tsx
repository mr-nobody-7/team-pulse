"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { MeData } from "@/services/auth.service";
import { getMe, logout as logoutApi } from "@/services/auth.service";

type MeUser = MeData["user"];

interface AuthContextValue {
  user: MeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    refetch: refetchAuth,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60_000, // 5 minutes — avoid redundant /me calls
  });

  const logout = useCallback(async () => {
    await logoutApi();
    queryClient.clear();
  }, [queryClient]);

  const refetch = useCallback(() => {
    void refetchAuth();
  }, [refetchAuth]);

  const value = useMemo(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      logout,
      refetch,
    }),
    [isLoading, logout, refetch, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
