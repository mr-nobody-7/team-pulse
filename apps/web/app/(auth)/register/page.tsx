"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { register } from "@/services/auth.service";

const registerSchema = z.object({
  workspace_name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      workspace_name: "",
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await register(values);
      toast.success("Workspace created successfully. Please sign in.");
      await refetch();
      router.push("/login");
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined;
      toast.error(message ?? "Could not create workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create Workspace</CardTitle>
          <CardDescription>Get started with Team Pulse</CardDescription>
        </CardHeader>

        <CardContent>
          <a
            href={googleAuthUrl}
            className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
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

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="workspace_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create workspace"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
