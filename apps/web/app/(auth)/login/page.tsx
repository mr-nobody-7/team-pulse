"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/axios";
import { posthog } from "@/lib/posthog";
import type { ApiResponse, SafeUser } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, refetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  // Already logged in → skip to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setIsLoading(true);
    try {
      const { data } = await api.post<ApiResponse<{ user: SafeUser }>>(
        "/auth/login",
        values,
      );
      posthog.capture("user_logged_in");
      toast.success(`Welcome back, ${data.data.user.name}!`);
      refetch();
      router.push("/dashboard");
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message
        : undefined;
      toast.error(message ?? "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4">
      <div className="flex min-h-screen flex-col items-center justify-center">
        {/* Brand section */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image
              src="/brand/mark-64.svg"
              alt="TeamFore"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-display text-xl tracking-tight text-foreground">
              TeamFore
            </span>
          </Link>
          <p className="text-sm text-[--tf-text-3]">
            Workforce Control Surface
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm rounded-2xl border border-[--tf-border] bg-[--tf-surface-2] p-8 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
          <div className="mb-8 space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="text-sm text-[--tf-text-2]">
              Access your workspace and manage your team
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[--tf-text-1]">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
                        className="border-[--tf-border] bg-[--tf-surface] text-foreground placeholder:text-[--tf-text-3]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-[--tf-text-1]">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="border-[--tf-border] bg-[--tf-surface] text-foreground placeholder:text-[--tf-text-3]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-linear-to-b from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] text-white shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.75)] hover:shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.9)] transition-all hover:-translate-y-px"
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[--tf-border-soft]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[--tf-surface-2] px-2 text-[--tf-text-3]">
                    Or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-[--tf-border] bg-[--tf-surface] text-foreground hover:bg-[--tf-surface-2] hover:text-foreground disabled:opacity-60"
                onClick={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-[--tf-text-2]">
            New workspace?{" "}
            <Link
              href="/register"
              className="text-[--tf-iris] hover:opacity-80 transition-opacity font-medium"
            >
              Create account
            </Link>
          </p>

          {/* Footer links */}
          <div className="mt-8 border-t border-[--tf-border-soft] pt-6 flex gap-4 justify-center text-xs text-[--tf-text-3]">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
