"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        {/* Leave type legend */}
        <div className="hidden items-center gap-3 sm:flex">
          {[
            { label: "Vacation", color: "bg-blue-400" },
            { label: "Sick", color: "bg-red-400" },
            { label: "Personal", color: "bg-purple-400" },
            { label: "Casual", color: "bg-amber-400" },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
