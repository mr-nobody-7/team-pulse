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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { posthog } from "@/lib/posthog";
import { registerWorkspace } from "@/services/auth.service";
import type { LeaveType } from "@/types/api";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z
    .string()
    .min(3, "Workspace name must be at least 3 characters"),
  leaveTypes: z.array(z.enum(["VACATION", "SICK", "PERSONAL", "CASUAL"])),
});

type RegisterForm = z.infer<typeof registerSchema>;

const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  "CASUAL",
  "SICK",
  "VACATION",
  "PERSONAL",
];

const LEAVE_TYPE_OPTIONS: Array<{ value: LeaveType; label: string }> = [
  { value: "CASUAL", label: "Casual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "VACATION", label: "Earned Leave" },
  { value: "PERSONAL", label: "Comp Off" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      workspaceName: "",
      leaveTypes: DEFAULT_LEAVE_TYPES,
    },
  });

  const leaveTypes = form.watch("leaveTypes");

  const getErrorMessage = (error: unknown): string | undefined => {
    if (!isAxiosError(error)) {
      return undefined;
    }

    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;

    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim().length > 0) {
      return data.error;
    }

    if (error.response?.status === 409) {
      return "Email already in use";
    }

    return undefined;
  };

  const handleNext = async () => {
    const fieldsByStep: Record<1 | 2 | 3, Array<keyof RegisterForm>> = {
      1: ["name", "email", "password"],
      2: ["workspaceName"],
      3: [],
    };

    const isValid = await form.trigger(fieldsByStep[step]);
    if (!isValid) return;

    if (step < 3) {
      setStep((step + 1) as 2 | 3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2);
    }
  };

  const onSubmit = async (values: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerWorkspace({
        name: values.name,
        email: values.email,
        password: values.password,
        workspaceName: values.workspaceName,
        leaveTypes: values.leaveTypes,
      });

      posthog.capture("user_signed_up");
      toast.success("Workspace created successfully.");
      await refetch();
      router.push("/dashboard");
    } catch (error) {
      const message = getErrorMessage(error);
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Step {step} of 3</span>
                  <span>{Math.round((step / 3) * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {step === 1 && (
                <>
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
                </>
              )}

              {step === 2 && (
                <FormField
                  control={form.control}
                  name="workspaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your team&apos;s space. You can invite others
                        after setup.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {step === 3 && (
                <FormField
                  control={form.control}
                  name="leaveTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Leave types</FormLabel>
                      <div className="space-y-3 rounded-md border p-3">
                        {LEAVE_TYPE_OPTIONS.map((option) => {
                          const checked = leaveTypes.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-3 text-sm"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-input"
                                checked={checked}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    form.setValue("leaveTypes", [
                                      ...leaveTypes,
                                      option.value,
                                    ]);
                                    return;
                                  }

                                  form.setValue(
                                    "leaveTypes",
                                    leaveTypes.filter(
                                      (type) => type !== option.value,
                                    ),
                                  );
                                }}
                              />
                              <span>{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || isSubmitting}
                >
                  Back
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Finishing..." : "Finish"}
                  </Button>
                )}
              </div>
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
