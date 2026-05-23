import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[--tf-border-soft] bg-[--tf-surface] px-4 pb-10 pt-12 sm:px-6 sm:pt-14">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/mark-64.svg"
                alt="TeamFore"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="font-display text-3xl leading-none tracking-tight text-foreground">
                TeamFore
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[--tf-text-2]">
              Leave management, approvals, team calendars, and daily
              availability for engineering teams that want a calmer planning
              surface.
            </p>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[0.16em] text-[--tf-text-3] uppercase">
              Product
            </h5>
            <ul className="mt-4 space-y-2.5 text-sm text-[--tf-text-2]">
              <li>
                <a
                  href="#features"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#how"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  Product tour
                </a>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[0.16em] text-[--tf-text-3] uppercase">
              Company
            </h5>
            <ul className="mt-4 space-y-2.5 text-sm text-[--tf-text-2]">
              <li>
                <Link
                  href="/login"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  Sign up
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/mr-nobody-7/teamfore"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[11px] tracking-[0.16em] text-[--tf-text-3] uppercase">
              Legal
            </h5>
            <ul className="mt-4 space-y-2.5 text-sm text-[--tf-text-2]">
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-foreground"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[--tf-border-soft] pt-8 text-xs text-[--tf-text-3] md:flex-row md:items-center md:justify-between">
          <p>© 2026 TeamFore · Built by Vivekananda</p>
          <p className="font-mono tracking-[0.12em] uppercase">
            Built for engineering teams · From Bengaluru
          </p>
        </div>
      </div>
    </footer>
  );
}
