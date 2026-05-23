import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[--tf-border] bg-linear-to-b from-[--tf-surface-3] to-[--tf-surface-2] px-5 py-12 text-center sm:px-14 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-radial-[at_50%_-10%] from-[oklch(0.55_0.18_295_/_0.28)] to-transparent" />
          <div className="relative">
            <p className="font-mono text-[11px] tracking-[0.16em] text-[--tf-text-2] uppercase">
              Ready when you are
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-tight text-foreground sm:text-5xl md:text-7xl">
              Your team is coordinating
              <br />
              time off <em className="text-[--tf-iris]">right now</em>.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-[--tf-text-2]">
              Do not let leave chaos derail next week&apos;s plan. Get TeamFore
              set up in minutes, completely free.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-b from-[oklch(0.72_0.17_285)] to-[oklch(0.55_0.18_295)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_oklch(0.55_0.18_295_/_0.75)] transition-transform hover:-translate-y-0.5"
              >
                Start free today
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center rounded-xl border border-[--tf-border] px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[--tf-surface-3]"
              >
                Tour the product
              </a>
            </div>

            <p className="mt-7 font-mono text-[11px] tracking-[0.14em] text-[--tf-text-3] uppercase">
              No credit card required · Free up to 10 users · Self-serve setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
