const heatCells = [
  "",
  "l1",
  "l2",
  "l1",
  "",
  "l3",
  "l4",
  "l2",
  "l1",
  "",
  "l2",
  "l3",
  "l1",
  "",
  "l1",
  "l4",
  "l3",
  "l1",
  "",
  "l2",
  "l1",
  "",
  "l2",
  "l3",
  "l4",
  "l2",
  "l1",
  "",
  "l3",
  "l1",
].map((tone, idx) => ({ id: `h${idx + 1}`, tone }));

function Card({
  className,
  tag,
  badge,
  title,
  body,
  children,
}: {
  className?: string;
  tag: string;
  badge?: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[--tf-border] bg-[--tf-surface-2] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[--tf-border-soft] sm:p-7 ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] tracking-[0.16em] text-[--tf-iris] uppercase">
          {tag}
        </p>
        {badge ? (
          <span className="rounded-full border border-[--tf-border] bg-[--tf-surface] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-[--tf-text-3] uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-3xl leading-[1.05] tracking-tight text-foreground sm:text-4xl">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[--tf-text-2]">{body}</p>
      {children ? <div className="mt-auto pt-6">{children}</div> : null}
    </article>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 pb-18 pt-3 sm:px-6 sm:pb-24 sm:pt-4">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 grid gap-6 sm:mb-14 sm:gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-[--tf-text-3] uppercase">
              What&apos;s inside
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Everything your team
              <br />
              needs. <em className="text-[--tf-iris]">Nothing</em> it does not.
            </h2>
          </div>
          <p className="max-w-3xl text-lg leading-relaxed text-[--tf-text-2]">
            Built for dev teams that want to coordinate availability without
            ceremony. Eight features, each earning its place.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <Card
            className="lg:col-span-4"
            tag="01 - Team planning calendar"
            title="See everyone&apos;s week in one heatmap."
            body="Vacations, public holidays, half-days, remote days, and team availability laid out across the week."
          >
            <div>
              <div className="grid grid-cols-10 gap-1">
                {heatCells.map((cell) => (
                  <i
                    key={cell.id}
                    className={
                      cell.tone === "l4"
                        ? "h-4 rounded-sm bg-[--tf-iris]"
                        : cell.tone === "l3"
                          ? "h-4 rounded-sm bg-[oklch(0.66_0.17_285_/_0.85)]"
                          : cell.tone === "l2"
                            ? "h-4 rounded-sm bg-[oklch(0.66_0.17_285_/_0.60)]"
                            : cell.tone === "l1"
                              ? "h-4 rounded-sm bg-[oklch(0.66_0.17_285_/_0.35)]"
                              : "h-4 rounded-sm bg-[--tf-surface-3]"
                    }
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] tracking-widest text-[--tf-text-3] uppercase">
                <span>Week 19</span>
                <span>Week 20</span>
                <span>Week 21</span>
              </div>
            </div>
          </Card>

          <Card
            className="lg:col-span-2"
            tag="02 - Approvals"
            title="One-click approve. Full audit trail."
            body="Managers approve in-app, while Slack and email keep everyone informed with a complete event history."
          >
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="rounded-full border border-[--tf-mint-border] bg-[--tf-mint-bg] px-3 py-1 text-[--tf-mint]">
                Submitted
              </span>
              <span className="text-[--tf-text-3]">-&gt;</span>
              <span className="rounded-full border border-[--tf-iris-border] bg-[--tf-iris-bg] px-3 py-1 text-foreground">
                In review
              </span>
              <span className="text-[--tf-text-3]">-&gt;</span>
              <span className="rounded-full border border-[--tf-border] px-3 py-1 text-[--tf-text-2]">
                Approved
              </span>
            </div>
          </Card>

          <Card
            className="lg:col-span-3"
            tag="03 - Standup board"
            title="Daily availability, no questions asked."
            body="See who is available, remote, or off without posting another morning Slack question."
          >
            <div className="space-y-2 text-sm text-[--tf-text-1]">
              {[
                {
                  n: "PS",
                  name: "Priya",
                  status: "Available",
                  c: "text-[--tf-mint]",
                },
                {
                  n: "AK",
                  name: "Arjun",
                  status: "Remote",
                  c: "text-[--tf-sky]",
                },
                {
                  n: "MR",
                  name: "Meera",
                  status: "Sick",
                  c: "text-[--tf-rose]",
                },
              ].map((row) => (
                <div
                  key={row.n}
                  className="flex items-center justify-between border-t border-[--tf-border-soft] pt-2 first:border-none first:pt-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[--tf-surface-3] text-[10px] font-semibold text-foreground">
                      {row.n}
                    </span>
                    {row.name}
                  </div>
                  <span
                    className={`font-mono text-[10px] tracking-widest uppercase ${row.c}`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            className="lg:col-span-3"
            tag="04 - Role-based access"
            title="Three roles. Real isolation."
            body="Multi-workspace from day one. Users, managers, and admins only see what they should."
          >
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              {[
                ["Admin", "Org", "Settings & teams"],
                ["Manager", "Team", "Approvals & reports"],
                ["User", "Self", "Apply & view"],
              ].map(([role, level, desc]) => (
                <div
                  key={role}
                  className="rounded-xl border border-[--tf-border-soft] bg-[--tf-surface] p-2.5"
                >
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[--tf-iris] uppercase">
                    {role}
                  </p>
                  <p className="mt-1 font-display text-2xl text-foreground">
                    {level}
                  </p>
                  <p className="text-[11px] text-[--tf-text-3]">{desc}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            className="lg:col-span-2"
            tag="05 - Custom leave types"
            title="Sick. Casual. WFH."
            body="Configure leave categories that match your policy, language, and reporting needs."
          >
            <div className="flex flex-wrap gap-2 text-xs text-[--tf-text-2]">
              {["Casual", "Sick", "Earned", "Comp Off", "WFH", "+ Custom"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[--tf-border-soft] bg-[--tf-surface] px-3 py-1"
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
          </Card>

          <Card
            className="lg:col-span-2"
            tag="06 - Slack and Email"
            title="Approve from where your team already is."
            body="Send leave updates, daily digests, and quick status lookups without losing the thread."
          >
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-[--tf-iris-border] bg-[--tf-iris-bg] px-3 py-1 text-[--tf-iris]">
                /whos-out
              </span>
              <span className="rounded-full border border-[--tf-mint-border] bg-[--tf-mint-bg] px-3 py-1 text-[--tf-mint]">
                /my-leaves
              </span>
            </div>
          </Card>

          <Card
            className="lg:col-span-2"
            tag="07 - Reports and analytics"
            badge="CSV export coming soon"
            title="Patterns, trends, and team visibility."
            body="Track leave behavior, workload, and approvals in one reporting view."
          >
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-[--tf-border-soft] bg-[--tf-surface] p-3">
                <p className="font-mono text-[10px] tracking-[0.14em] text-[--tf-text-3] uppercase">
                  Avg days / qtr
                </p>
                <p className="mt-1 font-display text-4xl text-foreground">
                  4.2
                </p>
              </div>
              <div className="rounded-xl border border-[--tf-border-soft] bg-[--tf-surface] p-3">
                <p className="font-mono text-[10px] tracking-[0.14em] text-[--tf-text-3] uppercase">
                  Approval SLA
                </p>
                <p className="mt-1 font-display text-4xl text-foreground">
                  3.6h
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="lg:col-span-2"
            tag="08 - Audit logs"
            title="Every action, recorded honestly."
            body="Authentication, user changes, leave events, and policy edits in one immutable trail."
          >
            <div className="space-y-1 font-mono text-[10px] tracking-[0.08em] text-[--tf-text-3]">
              <p>10 May 11:20 - login - 43.204.x</p>
              <p>09 May 18:02 - approved - MR-219</p>
              <p>08 May 09:47 - settings - ...</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
