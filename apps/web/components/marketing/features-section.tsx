import {
  BarChart3,
  BellRing,
  CalendarCheck,
  CheckSquare,
  Shield,
  Users,
} from "lucide-react";

const features = [
  {
    icon: CheckSquare,
    gradient: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/25",
    iconColor: "text-violet-400",
    title: "Leave requests & approvals",
    body: "Employees apply and managers approve with full team context. Half-day support built in.",
  },
  {
    icon: CalendarCheck,
    gradient: "from-indigo-500/20 to-indigo-600/10",
    border: "border-indigo-500/25",
    iconColor: "text-indigo-400",
    title: "Team planning calendar",
    body: "See everyone's leaves, public holidays, and availability in one heatmap. No more tab-switching.",
  },
  {
    icon: Users,
    gradient: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/25",
    iconColor: "text-purple-400",
    title: "Availability & workload",
    body: "Daily standup visibility. Know who's heads-down and who can take on more work this sprint.",
  },
  {
    icon: Shield,
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/25",
    iconColor: "text-blue-400",
    title: "Role-based access",
    body: "Employee, manager, and admin roles with full tenant isolation. Your data stays yours.",
  },
  {
    icon: BarChart3,
    gradient: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/25",
    iconColor: "text-cyan-400",
    title: "Analytics & CSV export",
    body: "Usage trends, team summaries, and export for HR and payroll integration.",
  },
  {
    icon: BellRing,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/25",
    iconColor: "text-emerald-400",
    title: "Email notifications",
    body: "Automatic alerts for request updates, approvals, and rejections — no more manual follow-ups.",
  },
];

export function FeaturesSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: static anchor id for in-page nav
    <section id="features" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Features
        </span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          Everything your team needs
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Built for dev teams who want to coordinate leave and availability
          without the chaos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <article
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-border/80 hover:shadow-xl hover:shadow-black/25"
            >
              {/* Subtle top gradient */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br border ${f.gradient} ${f.border} ${f.iconColor}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold leading-snug">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
