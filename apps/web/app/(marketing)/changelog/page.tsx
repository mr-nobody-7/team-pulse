import { ArrowLeft, CalendarClock } from "lucide-react";
import Link from "next/link";

const launchChanges = [
  "Leave requests, approvals, and half-day support",
  "Team planning calendar with public holidays",
  "Daily availability and workload status",
  "Role-based access: employee, manager, admin",
  "Multi-workspace support with tenant isolation",
  "Audit logs for all key actions",
  "Analytics and CSV export",
  "Google OAuth sign-in",
  "Email notifications via Brevo",
  "Mobile-responsive dashboard",
  "Feedback button (in-app)",
];

export default function ChangelogPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="mx-auto w-full max-w-4xl px-6 py-16 md:py-20">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[--tf-text-2] hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Changelog
        </h1>
        <p className="mt-2 text-sm text-[--tf-text-2]">
          Latest updates and features added to TeamFore
        </p>

        <div className="mt-8 space-y-6">
          <article className="rounded-2xl border border-[--tf-border-soft] bg-linear-to-b from-[--tf-surface-2] to-[--tf-surface] p-6 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-[--tf-border-soft] bg-[--tf-surface-2] px-3 py-1 text-xs font-medium text-[--tf-text-1]">
                April 2026
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CalendarClock className="h-4 w-4 text-[--tf-iris]" />
                <span>v1.0 Launch</span>
              </div>
            </div>

            <ul className="list-disc space-y-2 pl-5 text-sm text-[--tf-text-1]">
              {launchChanges.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
