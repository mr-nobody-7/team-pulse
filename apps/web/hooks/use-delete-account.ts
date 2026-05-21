"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { posthog } from "@/lib/posthog";

async function deleteAccount(): Promise<void> {
  await api.delete("/users/me/account", {
    data: { confirmPhrase: "delete my account" },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // Reset PostHog tracking so the deleted user's session is not continued.
      try {
        if (posthog.__loaded) {
          posthog.reset();
        }
      } catch {
        // best-effort
      }

      queryClient.clear();

      // Full page redirect so all in-memory auth state is flushed.
      window.location.replace("/goodbye");
    },
  });
}
