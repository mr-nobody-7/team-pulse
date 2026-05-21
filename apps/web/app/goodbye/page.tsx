import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Deleted · TeamFore",
};

export default function GoodbyePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Your account has been deleted
        </h1>
        <p className="max-w-md text-muted-foreground">
          Your account and all associated personal data have been permanently
          removed. Thank you for using TeamFore.
        </p>
      </div>
      <Link
        href="/login"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Back to login
      </Link>
    </main>
  );
}
