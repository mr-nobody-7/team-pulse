"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/axios";

export default function PrivacyConsentPage() {
  const router = useRouter();
  const { user, isLoading, refetch } = useAuth();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    if (!isLoading && user?.privacyAcceptedAt) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  const handleContinue = async () => {
    if (!privacyAccepted) {
      toast.error("Accept the Privacy Policy and Terms of Service to continue");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.patch("/users/me/privacy-consent", { privacyAccepted: true });
      await refetch();
      toast.success("Privacy notice accepted");
      router.replace("/dashboard");
    } catch {
      toast.error("Could not save your consent");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || user.privacyAcceptedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center">
        <div className="w-full rounded-2xl border border-[--tf-border] bg-[--tf-surface-2] p-8 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-[--tf-text-3]">
              One last step
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Review TeamFore&apos;s privacy notice
            </h1>
            <p className="text-sm leading-6 text-[--tf-text-1]">
              Before entering your workspace, confirm that you have reviewed
              TeamFore&apos;s Privacy Policy and Terms of Service.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-[--tf-border-soft] bg-[--tf-surface] p-4 text-sm text-[--tf-text-1]">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-[--tf-border] bg-[--tf-surface-2]"
                checked={privacyAccepted}
                onChange={(event) =>
                  setPrivacyAccepted(event.currentTarget.checked)
                }
              />
              <span>
                I agree to TeamFore&apos;s{" "}
                <Link
                  href="/privacy"
                  className="text-[--tf-iris] hover:opacity-80"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="text-[--tf-iris] hover:opacity-80"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms of Service
                </Link>
                .
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[--tf-text-3]">
              You will only need to do this once.
            </p>
            <Button
              type="button"
              className="bg-linear-to-b from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] text-white shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.75)] hover:shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.9)]"
              onClick={() => {
                void handleContinue();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Continue to TeamFore"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
