"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z
    .string()
    .min(3, "Workspace name must be at least 3 characters"),
  privacyAccepted: z.boolean().refine((value) => value === true, {
    message: "You must accept the Privacy Policy and Terms of Service",
  }),
  leaveTypes: z.array(z.string().min(1)),
});

type RegisterForm = z.infer<typeof registerSchema>;

const DEFAULT_LEAVE_TYPES: string[] = [
  "CASUAL",
  "SICK",
  "VACATION",
  "PERSONAL",
];

const LEAVE_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
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

  const handleGoogleSignIn = async () => {
    const isValid = await form.trigger("privacyAccepted");
    if (!isValid) {
      toast.error("Accept the Privacy Policy and Terms of Service to continue");
      return;
    }

    window.location.href = "/api/auth/google";
  };

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      workspaceName: "",
      privacyAccepted: false,
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
        privacyAccepted: values.privacyAccepted,
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
          <p className="text-sm text-[--tf-text-3]">Create your workspace</p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm rounded-2xl border border-[--tf-border] bg-[--tf-surface-2] p-8 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
          <div className="mb-8 space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Get started</h1>
            <p className="text-sm text-[--tf-text-2]">
              Set up your workspace in 3 easy steps
            </p>
          </div>

          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[--tf-text-3]">
                  <span>Step {step} of 3</span>
                  <span>{Math.round((step / 3) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[--tf-surface-3]">
                  <div
                    className="h-full bg-linear-to-r from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step 1: Account Info */}
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-[--tf-text-1]">
                          Your name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Doe"
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
                            className="border-[--tf-border] bg-[--tf-surface] text-foreground placeholder:text-[--tf-text-3]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 2: Workspace Info */}
              {step === 2 && (
                <FormField
                  control={form.control}
                  name="workspaceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[--tf-text-1]">
                        Workspace name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Inc"
                          className="border-[--tf-border] bg-[--tf-surface] text-foreground placeholder:text-[--tf-text-3]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[--tf-text-3]">
                        This is your team's space. You can invite others after
                        setup.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 3: Leave Types */}
              {step === 3 && (
                <FormField
                  control={form.control}
                  name="leaveTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[--tf-text-1]">
                        Leave types
                      </FormLabel>
                      <div className="space-y-3 rounded-lg border border-[--tf-border-soft] bg-[--tf-surface] p-4">
                        {LEAVE_TYPE_OPTIONS.map((option) => {
                          const checked = leaveTypes.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-3 text-sm text-[--tf-text-1] hover:text-foreground transition-colors"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-[--tf-border] bg-[--tf-surface-2] checked:bg-[--tf-iris] checked:border-[--tf-iris]"
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

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[--tf-border] bg-[--tf-surface] text-foreground hover:bg-[--tf-surface-2] disabled:opacity-60"
                  onClick={handleBack}
                  disabled={step === 1 || isSubmitting}
                >
                  Back
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    className="flex-1 bg-linear-to-b from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] text-white shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.75)] hover:shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.9)] transition-all hover:-translate-y-px"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-linear-to-b from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] text-white shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.75)] hover:shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.9)] transition-all hover:-translate-y-px"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Finishing..." : "Finish"}
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name="privacyAccepted"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-[--tf-border-soft] bg-[--tf-surface] p-4">
                    <label className="flex items-start gap-3 text-sm text-[--tf-text-1]">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-[--tf-border] bg-[--tf-surface-2]"
                          checked={field.value}
                          onChange={(event) =>
                            field.onChange(event.currentTarget.checked)
                          }
                        />
                      </FormControl>
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
                    <FormDescription className="text-xs text-[--tf-text-3]">
                      Required to create a workspace or continue with Google.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="relative my-6 py-2">
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
            className="w-full border-[--tf-border] bg-[--tf-surface] text-foreground hover:bg-[--tf-surface-2] disabled:opacity-60"
            onClick={() => {
              void handleGoogleSignIn();
            }}
            disabled={isSubmitting}
          >
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-[--tf-text-2]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[--tf-iris] hover:opacity-80 transition-opacity font-medium"
            >
              Sign in
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
