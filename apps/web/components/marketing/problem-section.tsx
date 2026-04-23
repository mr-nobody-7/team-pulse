import { Clock3, MessageSquare, UserX } from "lucide-react";

const problems = [
  {
    icon: MessageSquare,
    iconClass: "text-red-400 bg-red-500/10 border-red-500/20",
    title: "Leave tracked in WhatsApp groups",
    body: "Requests get buried in chats and context disappears the moment sprint planning starts.",
  },
  {
    icon: Clock3,
    iconClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    title: "Approvals lost in email threads",
    body: "Managers miss requests because approvals live across a dozen scattered threads.",
  },
  {
    icon: UserX,
    iconClass: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    title: "No idea who's free next sprint",
    body: "Capacity decisions are made too late — after people are already away.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-y border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            The problem
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Sound familiar?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Most teams manage leave with tools that were never built for it.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="group relative space-y-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:bg-card/70 hover:shadow-lg hover:shadow-black/20"
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${p.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-snug">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
