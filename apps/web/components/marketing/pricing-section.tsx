import { Check, X } from "lucide-react";
import Link from "next/link";

const freeFeatures = [
  { label: "Up to 10 users", comingSoon: false },
  { label: "Full leave management and approvals", comingSoon: false },
  { label: "Half-day leave support", comingSoon: false },
  { label: "Team calendar with public holidays", comingSoon: false },
  { label: "Role-based access (3 roles)", comingSoon: false },
  {
    label: "Slack notifications, digest, and slash commands",
    comingSoon: false,
  },
  { label: "Email notifications", comingSoon: false },
  { label: "Reports and analytics", comingSoon: false },
  { label: "CSV export", comingSoon: true },
  { label: "Audit logs", comingSoon: false },
];

const proFeatures = [
  { label: "Everything in Free", comingSoon: false },
  { label: "Unlimited users", comingSoon: true },
  { label: "Sprint capacity view", comingSoon: true },
  { label: "Public REST API", comingSoon: true },
  { label: "SSO (Google + SAML)", comingSoon: true },
  { label: "Priority support", comingSoon: true },
  { label: "Custom approval chains", comingSoon: true },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-18 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 grid gap-6 sm:mb-14 sm:gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-[--tf-text-3] uppercase">
              Pricing
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Simple. <em className="text-[--tf-iris]">Honest.</em>
              <br />
              Free to start.
            </h2>
          </div>
          <p className="max-w-3xl text-lg leading-relaxed text-[--tf-text-2]">
            Start free for your whole team. Upgrade when you outgrow it. No
            contact-sales gate, no hidden seat math.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-[--tf-border] bg-[--tf-surface-2] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[--tf-border-soft] sm:p-8">
            <p className="font-mono text-[11px] tracking-[0.16em] text-[--tf-text-3] uppercase">
              Free forever
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-7xl leading-none text-foreground">
                $0
              </span>
              <span className="pb-2 text-sm text-[--tf-text-2]">/ month</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[--tf-text-2]">
              Everything a small team needs to coordinate availability without
              chaos.
            </p>

            <ul className="mt-6 space-y-2.5">
              {freeFeatures.map((feature) => (
                <li
                  key={feature.label}
                  className={`flex items-start gap-2.5 text-sm ${
                    feature.comingSoon
                      ? "text-[--tf-text-3]"
                      : "text-[--tf-text-1]"
                  }`}
                >
                  {feature.comingSoon ? (
                    <X className="mt-0.5 h-4 w-4 text-[--tf-text-3]" />
                  ) : (
                    <Check className="mt-0.5 h-4 w-4 text-[--tf-iris]" />
                  )}
                  <span>
                    {feature.label}
                    {feature.comingSoon ? (
                      <span className="ml-2 text-[--tf-text-3]">
                        Coming soon
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-[--tf-border] px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[--tf-surface-3]"
            >
              Get started free
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-[--tf-iris-border] bg-[--tf-surface-2] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[oklch(0.66_0.17_285_/_0.65)] sm:p-8">
            <span className="absolute right-6 top-6 rounded-full border border-[--tf-iris-border] px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-[--tf-iris] uppercase">
              Coming soon
            </span>
            <p className="font-mono text-[11px] tracking-[0.16em] text-[--tf-text-3] uppercase">
              Pro
            </p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-7xl leading-none text-foreground">
                INR99
              </span>
              <span className="pb-2 text-sm text-[--tf-text-2]">
                / user / month
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[--tf-text-2]">
              For teams needing deeper integrations, richer controls, and
              priority support.
            </p>

            <ul className="mt-6 space-y-2.5">
              {proFeatures.map((feature) => (
                <li
                  key={feature.label}
                  className={`flex items-start gap-2.5 text-sm ${
                    feature.comingSoon
                      ? "text-[--tf-text-3]"
                      : "text-[--tf-text-1]"
                  }`}
                >
                  {feature.comingSoon ? (
                    <X className="mt-0.5 h-4 w-4 text-[--tf-text-3]" />
                  ) : (
                    <Check className="mt-0.5 h-4 w-4 text-[--tf-iris]" />
                  )}
                  <span>
                    {feature.label}
                    {feature.comingSoon ? (
                      <span className="ml-2 text-[--tf-text-3]">
                        Coming soon
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-linear-to-b from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.75)]"
            >
              Notify me when available
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
