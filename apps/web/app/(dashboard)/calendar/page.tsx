"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { LeaveDetailsPanel } from "@/components/calendar/leave-details-panel";
import { useCalendarLeaves } from "@/hooks/use-calendar-leaves";
import type { LeaveRequest } from "@/types/api";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<{
    date: Date;
    leaves: LeaveRequest[];
  } | null>(null);

  const { data: leavesMap = {}, isLoading } = useCalendarLeaves(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );

  const handlePrev = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const handleNext = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const handleDayClick = (date: Date, leaves: LeaveRequest[]) => {
    setSelectedDay((prev) =>
      prev?.date.toDateString() === date.toDateString() ? null : { date, leaves },
    );
  };

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View team availability and leave schedule.
        </p>
      </div>

      <CalendarHeader
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <CalendarGrid
          currentDate={currentDate}
          leavesMap={leavesMap}
          isLoading={isLoading}
          onDayClick={handleDayClick}
          selectedDate={selectedDay?.date ?? null}
        />

        <LeaveDetailsPanel
          selectedDay={selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      </div>
    </PageContainer>
  );
}
