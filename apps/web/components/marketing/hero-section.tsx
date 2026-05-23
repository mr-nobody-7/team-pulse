import { ArrowRight, CheckCircle2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

function PreviewCard() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="relative rounded-3xl border border-[--tf-border] bg-linear-to-b from-[--tf-surface-3] to-[--tf-surface-2] p-2.5 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:-translate-y-0.5 sm:p-3">
      <div className="mb-2.5 flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 rounded-full border border-[--tf-border-soft] bg-[--tf-surface] px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-[--tf-text-3] uppercase">
          app.teamfore.io
        </span>
      </div>

      <div className="grid gap-4 rounded-2xl border border-[--tf-border-soft] bg-[--tf-bg] p-3.5 sm:grid-cols-[120px_1fr] sm:p-4">
        <div className="space-y-1.5 text-[11px] text-[--tf-text-2]">
          {[
            "Dashboard",
            "My Leave",
            "Team Calendar",
            "Requests",
            "Reports",
          ].map((item) => (
            <div
              key={item}
              className={
                item === "Team Calendar"
                  ? "rounded-md bg-[--tf-iris-bg] px-2.5 py-1.5 text-foreground"
                  : "rounded-md px-2.5 py-1.5"
              }
            >
              {item}
            </div>
          ))}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-display text-2xl leading-none text-foreground">
                Team Calendar
              </p>
              <p className="mt-1 text-[11px] text-[--tf-text-3]">
                May 2026 · 4 members · 3 on leave
              </p>
            </div>
            <span className="rounded-full border border-[--tf-border] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-[--tf-text-3] uppercase">
              This week
            </span>
          </div>

          <div className="grid grid-cols-[38px_repeat(5,1fr)] gap-1 text-[9px]">
            <div />
            {days.map((day) => (
              <p
                key={day}
                className="py-1 text-center font-mono tracking-[0.12em] text-[--tf-text-3] uppercase"
              >
                {day}
              </p>
            ))}

            {[
              {
                id: "PS",
                name: "Priya",
                color: "from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)]",
                cells: ["wfh", "", "", "", ""],
              },
              {
                id: "AK",
                name: "Arjun",
                color: "from-[--tf-rose] to-[oklch(0.60_0.20_10)]",
                cells: ["", "wfh", "", "off", "off"],
              },
              {
                id: "MR",
                name: "Meera",
                color: "from-[--tf-mint] to-[oklch(0.60_0.14_160)]",
                cells: ["off", "", "", "", "wfh"],
              },
              {
                id: "DP",
                name: "Dev",
                color: "from-[--tf-amber] to-[oklch(0.68_0.16_55)]",
                cells: ["", "", "wfh", "", "off"],
              },
            ].map((member) => (
              <Fragment key={member.id}>
                <div className="flex items-center gap-1 text-[--tf-text-2]">
                  <span
                    className={`grid h-4.5 w-4.5 place-items-center rounded-full bg-linear-to-br ${member.color} text-[7px] font-semibold text-white`}
                  >
                    {member.id}
                  </span>
                  <span className="truncate">{member.name}</span>
                </div>
                {member.cells.map((cell, idx) => (
                  <div
                    key={`${member.id}-${idx}`}
                    className={
                      cell === "wfh"
                        ? "grid h-5 place-items-center rounded bg-[--tf-sky-bg] text-[8px] font-semibold text-[--tf-sky]"
                        : cell === "off"
                          ? "grid h-5 place-items-center rounded bg-[--tf-iris-bg] text-[8px] font-semibold text-foreground"
                          : "h-5 rounded bg-[--tf-surface-2]"
                    }
                  >
                    {cell === "wfh" ? "WFH" : cell === "off" ? "OFF" : ""}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[--tf-border-soft] pt-2 text-[10px] text-[--tf-text-3]">
            <div className="flex items-center gap-3">
              <span>
                <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[--tf-iris]" />
                Vacation
              </span>
              <span>
                <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[--tf-sky]" />
                WFH
              </span>
            </div>
            <span>Live · syncing</span>
          </div>
        </div>
      </div>

      <div className="absolute -left-6 -top-5 hidden items-center gap-2 rounded-xl border border-[--tf-border] bg-[--tf-surface-2] px-3 py-2 text-xs shadow-2xl lg:flex">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-[--tf-mint-bg] text-[--tf-mint]">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
        <p>
          <b className="font-medium text-foreground">Approved</b>
          <span className="text-[--tf-text-3]">
            {" "}
            · Priya&apos;s vacation, May 18-22
          </span>
        </p>
      </div>

      <div className="absolute -bottom-6 -right-6 hidden items-center gap-2 rounded-xl border border-[--tf-border] bg-[--tf-surface-2] px-3 py-2 text-xs shadow-2xl lg:flex">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-[--tf-amber-bg] text-[--tf-amber]">
          <TriangleAlert className="h-3.5 w-3.5" />
        </span>
        <p>
          <b className="font-medium text-foreground">Capacity warning</b>
          <span className="text-[--tf-text-3]"> · 60% out on May 23</span>
        </p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <header className="relative overflow-hidden px-4 pb-16 pt-30 sm:px-6 sm:pb-20 sm:pt-36">
      <div className="pointer-events-none absolute -top-28 right-[-10%] h-140 w-190 rounded-full bg-radial-[at_40%_40%] from-[oklch(0.55_0.18_295_/_0.28)] to-transparent" />
      <div className="pointer-events-none absolute -bottom-52 left-[-20%] h-105 w-155 rounded-full bg-radial-[at_60%_40%] from-[oklch(0.55_0.18_285_/_0.18)] to-transparent" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 sm:gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[--tf-border] bg-[--tf-surface-2] px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-[--tf-text-2] uppercase sm:text-[11px]">
            <i className="h-1.5 w-1.5 rounded-full bg-[--tf-mint] shadow-[0_0_0_4px_oklch(0.72_0.14_165_/_0.2)]" />
            v1.0 - live for early teams
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-7xl lg:text-8xl">
            Know who&apos;s <em className="text-[--tf-iris]">actually</em>
            <br />
            available before
            <br />
            you plan the week.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[--tf-text-2] sm:mt-7 sm:text-lg">
            TeamFore is team availability intelligence for engineering managers.
            Leave requests, approvals, public holidays, and daily availability
            in one calm surface that your team will actually open on Monday.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5 sm:mt-10 sm:gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-b from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.75)] transition-transform hover:-translate-y-0.5 sm:px-5 sm:py-3"
            >
              Start free - no credit card
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center rounded-xl border border-[--tf-border] px-4 py-2.5 text-sm font-medium text-[--tf-text-1] transition-colors hover:bg-[--tf-surface-2] sm:px-5 sm:py-3"
            >
              See how it works
            </a>
          </div>

          <div className="mt-7 flex items-center gap-3 text-sm text-[--tf-text-2] sm:mt-8">
            <div className="flex -space-x-2">
              {[
                "from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)]",
                "from-[--tf-rose] to-[oklch(0.60_0.20_10)]",
                "from-[--tf-mint] to-[oklch(0.60_0.14_160)]",
                "from-[--tf-amber] to-[oklch(0.68_0.16_55)]",
              ].map((tone) => (
                <span
                  key={tone}
                  className={`inline-block h-7 w-7 rounded-full border-2 border-[--tf-bg] bg-linear-to-br ${tone}`}
                />
              ))}
            </div>
            <p>50+ engineering teams already planning smarter</p>
          </div>
        </div>

        <PreviewCard />
      </div>
    </header>
  );
}
