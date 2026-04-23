import { Check, Kanban, Loader } from "lucide-react";
import Link from "next/link";

const freeFeatures = [
  "Up to 10 users",
  "Full leave management",
  "Team planning calendar",
  "Public holiday calendar",
  "Role-based access",
  "Email notifications",
  "Analytics & CSV export",
  "Audit logs",
];

const proFeatures = [
  "Everything in Free",
  "Unlimited users",
  "Sprint capacity view",
  "Slack sync",
  "API access",
  "Priority support",
];

export function PricingSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: static anchor id for in-page nav
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Pricing
        </span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          Simple, honest pricing
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Start free. Upgrade only when your team is ready.
        </p>
      </div>

      <div className="grid max-w-3xl gap-5 md:grid-cols-2">
        {/* Free Plan */}
        <article className="relative overflow-hidden rounded-2xl border border-violet-500/40 bg-gradient-to-b from-violet-500/10 via-violet-500/5 to-transparent p-7">
          {/* Top glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
            Free forever
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">$0</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="mt-2 mb-7 text-sm text-muted-foreground">
            Everything you need to get your team started.
          </p>

          <ul className="mb-8 space-y-2.5">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm">
                <Check className="h-4 w-4 flex-shrink-0 text-violet-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-px hover:from-violet-500 hover:to-indigo-500"
          >
            Get started free
          </Link>
        </article>

        {/* Pro Plan */}
        <article className="relative rounded-2xl border border-border bg-card/60 p-7">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Coming soon
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">₹99</span>
            <span className="text-sm text-muted-foreground">/user/month</span>
          </div>
          <p className="mt-2 mb-7 text-sm text-muted-foreground">
            For teams that need more power and scale.
          </p>

          <ul className="mb-8 space-y-2.5">
            {proFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <Kanban className="h-4 w-4 flex-shrink-0 opacity-40" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/60"
          >
            <Loader className="h-4 w-4" />
            Notify me when available
          </button>
        </article>
      </div>
    </section>
  );
}
