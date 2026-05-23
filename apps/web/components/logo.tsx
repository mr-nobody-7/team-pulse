import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "horizontal" | "mark" | "mono-white" | "mono-iris";
type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}

const markSizes = { sm: 24, md: 32, lg: 48 };
const textSizes = { sm: "text-[15px]", md: "text-[17px]", lg: "text-[22px]" };
const markRx = {
  sm: "rounded-[6px]",
  md: "rounded-[8px]",
  lg: "rounded-[12px]",
};

function Mark({ size = "md" }: { size?: LogoSize }) {
  const px = markSizes[size];
  return (
    <div
      className={cn("grid place-items-center shrink-0", markRx[size])}
      style={{
        width: px,
        height: px,
        background:
          "linear-gradient(160deg, oklch(0.72 0.18 285), oklch(0.55 0.18 295))",
        boxShadow:
          "inset 0 1px 0 oklch(1 0 0 / 0.25), 0 6px 18px oklch(0.55 0.18 295 / 0.35)",
      }}
      aria-hidden="true"
    >
      <svg
        width={Math.round(px * 0.56)}
        height={Math.round(px * 0.56)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 12h10M4 17h6" />
      </svg>
    </div>
  );
}

/**
 * TeamFore logo — use variant prop to select the treatment.
 *
 * horizontal (default) — gradient mark + wordmark
 * mark                 — gradient mark only
 * mono-white           — lines-only mark + white wordmark (for dark banners)
 * mono-iris            — lines-only mark + iris wordmark (for tinted surfaces)
 */
export function Logo({
  variant = "horizontal",
  size = "md",
  className,
}: LogoProps) {
  if (variant === "mark") {
    return (
      <span
        role="img"
        aria-label="TeamFore"
        className={cn("inline-flex", className)}
      >
        <Mark size={size} />
      </span>
    );
  }

  if (variant === "mono-white" || variant === "mono-iris") {
    const strokeColor =
      variant === "mono-iris" ? "oklch(0.66 0.17 285)" : "white";
    const textColor = variant === "mono-iris" ? "text-iris" : "text-white";
    const px = markSizes[size];
    return (
      <span
        role="img"
        aria-label="TeamFore"
        className={cn("inline-flex items-center gap-3", className)}
      >
        <svg
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h10M4 17h6" />
        </svg>
        <span
          className={cn(
            "font-semibold tracking-tight",
            textSizes[size],
            textColor,
          )}
          style={{ letterSpacing: "-0.02em" }}
        >
          TeamFore
        </span>
      </span>
    );
  }

  /* horizontal — gradient mark (uses existing brand SVG) + wordmark */
  return (
    <span
      role="img"
      aria-label="TeamFore"
      className={cn("inline-flex items-center gap-3", className)}
    >
      <Image
        src="/brand/mark-64.svg"
        alt=""
        width={markSizes[size]}
        height={markSizes[size]}
        className="shrink-0"
        aria-hidden
        priority
      />
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          textSizes[size],
        )}
        style={{ letterSpacing: "-0.02em" }}
      >
        TeamFore
      </span>
    </span>
  );
}
