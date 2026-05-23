import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconSize = "xs" | "sm" | "md" | "lg";

interface TFIconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
  "aria-label"?: string;
}

const sizePx: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
};

/* Stroke widths per size — matches design system spec:
   nav icons = 1.7, inline = 2.0, status badges = 2.4 */
const defaultStroke: Record<IconSize, number> = {
  xs: 2.4,
  sm: 2.0,
  md: 1.7,
  lg: 1.7,
};

export function TFIcon({
  icon: Icon,
  size = "md",
  className,
  strokeWidth,
  "aria-label": label,
}: TFIconProps) {
  return (
    <Icon
      width={sizePx[size]}
      height={sizePx[size]}
      strokeWidth={strokeWidth ?? defaultStroke[size]}
      className={cn("shrink-0", className)}
      aria-label={label}
      aria-hidden={!label}
    />
  );
}
