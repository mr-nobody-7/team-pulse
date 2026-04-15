import {
  CalendarCheck,
  CalendarClock,
  CheckSquare,
  Clock3,
  Kanban,
  Loader,
  MessageSquare,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-medium text-muted-foreground">
            Team Pulse
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Know who&apos;s available before you plan the week
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Team Pulse gives dev teams a single place for leave requests,
            approvals, and team availability - so no one gets surprised
            mid-sprint.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Start free - no credit card
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-3">
          <article className="space-y-3 rounded-lg border border-border bg-background p-5">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">
              Leave tracked in WhatsApp groups
            </h2>
            <p className="text-sm text-muted-foreground">
              Requests get buried in chats and context disappears when planning
              starts.
            </p>
          </article>
          <article className="space-y-3 rounded-lg border border-border bg-background p-5">
            <Clock3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">
              Approvals lost in email threads
            </h2>
            <p className="text-sm text-muted-foreground">
              Managers miss requests because approvals live across scattered
              threads.
            </p>
          </article>
          <article className="space-y-3 rounded-lg border border-border bg-background p-5">
            <UserX className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">
              No idea who&apos;s free next sprint
            </h2>
            <p className="text-sm text-muted-foreground">
              Capacity decisions are made late when people are already away.
            </p>
          </article>
        </div>
      </section>

      {/* biome-ignore lint/correctness/useUniqueElementIds: static anchor id is required for in-page nav */}
      <section
        id="features"
        className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
      >
        <div className="mb-8 max-w-2xl space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Features
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Everything your team needs to coordinate leave and availability in
            one place.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <article className="space-y-3 rounded-lg border border-border p-5">
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              Leave requests &amp; approvals
            </h3>
            <p className="text-sm text-muted-foreground">
              Employees apply and managers approve with full team context.
              Half-day support is built in for real-world schedules.
            </p>
          </article>
          <article className="space-y-3 rounded-lg border border-border p-5">
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Team planning calendar</h3>
            <p className="text-sm text-muted-foreground">
              See everyone&apos;s leaves, public holidays, and availability in
              one heatmap calendar. Plan ahead without opening five different
              tools.
            </p>
          </article>
          <article className="space-y-3 rounded-lg border border-border p-5">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              Availability &amp; workload status
            </h3>
            <p className="text-sm text-muted-foreground">
              Daily standup visibility helps everyone see team load at a glance.
              Know who is heads-down and who can take more work.
            </p>
          </article>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-8 space-y-3">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Pricing
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Simple pricing for teams getting started, with clear upgrades when
              you are ready.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="space-y-4 rounded-lg border border-border p-5">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Free</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Up to 10 users. Full leave management, team calendar, approvals.
                Free forever.
              </p>
            </article>
            <article className="space-y-4 rounded-lg border border-border bg-muted/40 p-5 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Kanban className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Pro (coming soon)</h3>
              </div>
              <p className="text-sm">
                Unlimited users. Sprint capacity view, Slack sync, API access.
                Rs99/user/month.
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium"
              >
                <Loader className="mr-2 h-4 w-4" />
                Notify me
              </button>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Built by Vivekananda · Team Pulse · 2026</p>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Sign up
            </Link>
            <Link href="/changelog" className="hover:text-foreground">
              Changelog
            </Link>
            <a
              href="https://github.com/mr-nobody-7/team-pulse"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
