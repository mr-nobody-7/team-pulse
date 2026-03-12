"use client";

import { isAxiosError } from "axios";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError(error) {
        // 401s are handled by the axios interceptor / AuthGuard
        if (isAxiosError(error) && error.response?.status === 401) return;
        const message = isAxiosError(error)
          ? (error.response?.data as { message?: string })?.message
          : undefined;
        toast.error(message ?? "Something went wrong. Please try again.");
      },
    }),
    mutationCache: new MutationCache({
      onError(error) {
        if (isAxiosError(error) && error.response?.status === 401) return;
        const message = isAxiosError(error)
          ? (error.response?.data as { message?: string })?.message
          : undefined;
        toast.error(message ?? "Operation failed. Please try again.");
      },
    }),
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
