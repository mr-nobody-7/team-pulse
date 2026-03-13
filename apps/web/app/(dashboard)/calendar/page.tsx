"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { LeaveDetailsPanel } from "@/components/calendar/leave-details-panel";
import { useCalendarLeaves } from "@/hooks/use-calendar-leaves";
import { useTeams } from "@/hooks/use-teams";
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

  // "" means "all teams"; any truthy string is a specific team id
  const [selectedTeamId, setSelectedTeamId] = useState("all");

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  const { data: leavesMap = {}, isLoading } = useCalendarLeaves(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    selectedTeamId === "all" ? undefined : selectedTeamId,
  );

  const { data: teams = [] } = useTeams();

  const handlePrev = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const handleNext = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const handleDayClick = (date: Date, leaves: LeaveRequest[]) => {
    if (leaves.length === 0) return;
    setSelectedDay({ date, leaves });
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
        teams={teams}
        selectedTeamId={selectedTeamId}
        onTeamChange={setSelectedTeamId}
      />

      <div
        key={monthKey}
        className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200"
      >
        <CalendarGrid
          currentDate={currentDate}
          leavesMap={leavesMap}
          isLoading={isLoading}
          onDayClick={handleDayClick}
          selectedDate={selectedDay?.date ?? null}
        />
      </div>

      <LeaveDetailsPanel
        open={selectedDay !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
        selectedDay={selectedDay}
      />
    </PageContainer>
  );
}
