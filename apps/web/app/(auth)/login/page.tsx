"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

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
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="text-lg font-bold text-primary-foreground">T</span>
          </div>
          <CardTitle className="text-2xl font-bold">Team Pulse</CardTitle>
          <CardDescription>Sign in to your workspace</CardDescription>
        </CardHeader>

        <CardContent>
          <a
            href={googleAuthUrl}
            className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.5 12.24c0-.77-.07-1.5-.2-2.21H12v4.18h5.9a5.05 5.05 0 0 1-2.2 3.31v2.75h3.56c2.08-1.9 3.24-4.72 3.24-8.03Z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.93 0 5.39-.97 7.18-2.63l-3.56-2.75c-.99.66-2.26 1.05-3.62 1.05-2.78 0-5.13-1.87-5.97-4.39H2.35v2.84A10.98 10.98 0 0 0 12 23Z"
                fill="#34A853"
              />
              <path
                d="M6.03 14.28A6.61 6.61 0 0 1 5.7 12c0-.79.14-1.56.33-2.28V6.88H2.35A11 11 0 0 0 1 12c0 1.77.42 3.45 1.35 5.12l3.68-2.84Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.33c1.59 0 3.01.55 4.14 1.62l3.1-3.1C17.39 2.11 14.93 1 12 1A10.98 10.98 0 0 0 2.35 6.88l3.68 2.84c.84-2.52 3.19-4.39 5.97-4.39Z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </a>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        autoComplete="email"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            New workspace?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
