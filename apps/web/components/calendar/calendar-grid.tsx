import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subDays,
} from "date-fns";

import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDay } from "./calendar-day";
import type { CalendarLeavesMap } from "@/hooks/use-calendar-leaves";
import type { LeaveRequest } from "@/types/api";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Convert JS getDay() (0=Sun) → Monday-first index (0=Mon, 6=Sun) */
function toMondayFirst(day: number): number {
  return day === 0 ? 6 : day - 1;
}

interface CalendarGridProps {
  currentDate: Date;
  leavesMap: CalendarLeavesMap;
  isLoading: boolean;
  selectedDate: Date | null;
  onDayClick: (date: Date, leaves: LeaveRequest[]) => void;
}

export function CalendarGrid({
  currentDate,
  leavesMap,
  isLoading,
  selectedDate,
  onDayClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Leading padding: days from the previous month to fill the first row
  const leadingEmpty = toMondayFirst(getDay(monthStart));
  const leadingDays = Array.from({ length: leadingEmpty }, (_, i) =>
    subDays(monthStart, leadingEmpty - i),
  );

  // All days in the current month
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Trailing padding: days from the next month to complete the last row
  const total = leadingEmpty + monthDays.length;
  const trailingEmpty = total % 7 === 0 ? 0 : 7 - (total % 7);
  const trailingDays = Array.from({ length: trailingEmpty }, (_, i) =>
    addDays(monthEnd, i + 1),
  );

  const allDays = [...leadingDays, ...monthDays, ...trailingDays];
  const showSkeleton = isLoading && Object.keys(leavesMap).length === 0;

  return (
    <div className="relative rounded-xl border bg-card">
      {/* Loading overlay for background refetches */}
      {isLoading && !showSkeleton && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-lg border bg-background/85 p-2 shadow-sm backdrop-blur-sm">
            <Spinner size="lg" />
          </div>
        </div>
      )}

      {/* Weekday header row */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid — gap-px with bg-border gives thin borders between cells */}
      <div className="grid grid-cols-7 gap-px bg-border p-px">
        {showSkeleton
          ? Array.from({ length: 42 }, (_, idx) => (
              <div
                key={`skeleton-${idx + 1}`}
                className="flex min-h-22 flex-col rounded-lg bg-card p-2"
              >
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="mt-2 space-y-1">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            ))
          : allDays.map((date) => {
              const key = format(date, "yyyy-MM-dd");
              return (
                <CalendarDay
                  key={key}
                  date={date}
                  currentMonth={currentDate}
                  leaves={leavesMap[key] ?? []}
                  isSelected={
                    selectedDate !== null &&
                    date.toDateString() === selectedDate.toDateString()
                  }
                  onClick={onDayClick}
                />
              );
            })}
      </div>
    </div>
  );
}
