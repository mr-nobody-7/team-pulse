import { format, isSameMonth, isToday } from "date-fns";

import { cn } from "@/lib/utils";
import type { LeaveRequest } from "@/types/api";

const LEAVE_TYPE_COLOR: Record<string, string> = {
  VACATION: "bg-blue-500",
  SICK: "bg-red-500",
  PERSONAL: "bg-purple-500",
  CASUAL: "bg-amber-500",
};

interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  leaves: LeaveRequest[];
  isSelected: boolean;
  onClick: (date: Date, leaves: LeaveRequest[]) => void;
}

export function CalendarDay({
  date,
  currentMonth,
  leaves,
  isSelected,
  onClick,
}: CalendarDayProps) {
  const today = isToday(date);
  const inMonth = isSameMonth(date, currentMonth);
  const hasLeaves = leaves.length > 0;

  // Determine density — colour the cell bg when many people are off
  const densityClass =
    leaves.length >= 5
      ? "bg-red-50 dark:bg-red-950/20"
      : leaves.length >= 3
        ? "bg-amber-50 dark:bg-amber-950/20"
        : leaves.length >= 1
          ? "bg-green-50/60 dark:bg-green-950/20"
          : "";

  return (
    <button
      type="button"
      onClick={() => onClick(date, leaves)}
      className={cn(
        "relative flex min-h-22 w-full flex-col rounded-lg border p-2 text-left transition-all",
        inMonth ? "bg-card" : "bg-muted/20",
        !inMonth && "opacity-50",
        densityClass,
        hasLeaves && "cursor-pointer hover:border-primary/60 hover:shadow-sm",
        !hasLeaves && "cursor-default",
        today && "border-primary/70 ring-1 ring-primary/25",
        isSelected && "border-primary ring-2 ring-primary/40",
      )}
      aria-label={`${format(date, "MMMM d")}${hasLeaves ? `, ${leaves.length} on leave` : ""}`}
    >
      {/* Day number */}
      <span
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium",
          today
            ? "bg-primary text-primary-foreground"
            : inMonth
              ? "text-foreground"
              : "text-muted-foreground",
        )}
      >
        {date.getDate()}
      </span>

      {/* Leave badges */}
      {hasLeaves && (
        <div className="mt-1.5 flex flex-col gap-0.5">
          {leaves.slice(0, 3).map((leave) => (
            <div
              key={leave.id}
              className={cn(
                "truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white",
                LEAVE_TYPE_COLOR[leave.type] ?? "bg-gray-500",
              )}
            >
              {leave.user.name.split(" ")[0]}
            </div>
          ))}
          {leaves.length > 3 && (
            <span className="text-[10px] font-medium text-muted-foreground">
              +{leaves.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Overlap warning dot */}
      {leaves.length >= 3 && (
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"
          aria-hidden
        />
      )}
    </button>
  );
}
