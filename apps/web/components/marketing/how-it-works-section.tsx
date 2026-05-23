const steps = [
  {
    id: "01",
    title: "Sign up your workspace.",
    body: "Start with email or Google OAuth, then create a tenant-isolated workspace for your team.",
    time: "~ 30 sec",
  },
  {
    id: "02",
    title: "Invite the team.",
    body: "Add teammates, assign them to teams, and set user, manager, or admin access.",
    time: "~ 1 min",
  },
  {
    id: "03",
    title: "Apply and approve.",
    body: "Employees apply for leave while managers review in-app and everyone gets updates in Slack and email.",
    time: "always-on",
  },
  {
    id: "04",
    title: "Plan with confidence.",
    body: "Open the team calendar before weekly planning to spot holidays, leave conflicts, and capacity warnings.",
    time: "every Monday",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="px-4 pb-18 pt-4 sm:px-6 sm:pb-24 sm:pt-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 grid gap-6 sm:mb-14 sm:gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-[--tf-text-3] uppercase">
              How it works
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Up and running
              <br />
              in <em className="text-[--tf-iris]">minutes</em>, not months.
            </h2>
          </div>
          <p className="max-w-3xl text-lg leading-relaxed text-[--tf-text-2]">
            No onboarding calls. No heavy setup. Sign up, invite your team, and
            plan your week before your coffee gets cold.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-[--tf-border] bg-[--tf-surface-2] md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.id}
              className={`border-[--tf-border-soft] p-6 transition-colors duration-300 hover:bg-[--tf-surface-3] sm:p-8 ${
                index < steps.length - 1
                  ? "border-b xl:border-b-0 xl:border-r"
                  : ""
              } ${index === 1 ? "md:border-r" : ""}`}
            >
              <p className="font-mono text-[11px] tracking-[0.18em] text-[--tf-iris] uppercase">
                {step.id}
              </p>
              <h3 className="mt-3 font-display text-4xl leading-[1.05] text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[--tf-text-2]">
                {step.body}
              </p>
              <p className="mt-5 font-mono text-[11px] tracking-widest text-[--tf-text-3] uppercase">
                {step.time}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
