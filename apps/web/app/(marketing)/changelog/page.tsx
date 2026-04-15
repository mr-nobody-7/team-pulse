import { CalendarClock } from "lucide-react";

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
    <main className="bg-background text-foreground">
      <section className="mx-auto w-full max-w-4xl px-6 py-16 md:py-20">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Changelog
        </h1>

        <div className="mt-8 space-y-6">
          <article className="rounded-lg border border-border p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                April 2026
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span>v1.0 Launch</span>
              </div>
            </div>

            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
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
