"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { AvailabilityBoard } from "@/components/calendar/availability-board";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { LeaveDetailsPanel } from "@/components/calendar/leave-details-panel";
import { PageContainer } from "@/components/layout/page-container";
import { useAuth } from "@/contexts/auth-context";
import { useAvailabilityBoard } from "@/hooks/use-availability-board";
import { useCalendarLeaves } from "@/hooks/use-calendar-leaves";
import { usePublicHolidays } from "@/hooks/use-public-holidays";
import { useTeams } from "@/hooks/use-teams";
import api from "@/lib/axios";
import type {
  AvailabilityStatus,
  LeaveRequest,
  PublicHoliday,
  WorkloadLevel,
} from "@/types/api";

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<{
    date: Date;
    leaves: LeaveRequest[];
    holidays: PublicHoliday[];
  } | null>(null);

  // "" means "all teams"; any truthy string is a specific team id
  const [selectedTeamId, setSelectedTeamId] = useState("all");

  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  const { data: leavesMap = {}, isLoading } = useCalendarLeaves(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    selectedTeamId === "all" ? undefined : selectedTeamId,
  );

  const { data: holidaysMap = {}, isLoading: isHolidayLoading } =
    usePublicHolidays({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
    });

  const { data: teams = [] } = useTeams();

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");

  const { data: availabilityBoard, isLoading: isAvailabilityLoading } =
    useAvailabilityBoard({
      date: selectedDateKey,
      teamId: selectedTeamId === "all" ? undefined : selectedTeamId,
    });

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: {
      status?: AvailabilityStatus;
      workload?: WorkloadLevel;
    }) => {
      await api.put("/availability/me", {
        ...payload,
        date: selectedDateKey,
      });
    },
    onSuccess: async () => {
      toast.success("Availability updated");
      await queryClient.invalidateQueries({ queryKey: ["availability-board"] });
    },
    onError: () => {
      toast.error("Could not update availability");
    },
  });

  const handlePrev = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const handleNext = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const handleDayClick = (
    date: Date,
    leaves: LeaveRequest[],
    holidays: PublicHoliday[],
  ) => {
    setSelectedDate(date);
    if (leaves.length > 0 || holidays.length > 0) {
      setSelectedDay({ date, leaves, holidays });
    } else {
      setSelectedDay(null);
    }
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
          holidaysMap={holidaysMap}
          isLoading={isLoading || isHolidayLoading}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />
      </div>

      <AvailabilityBoard
        date={selectedDateKey}
        board={availabilityBoard}
        isLoading={isAvailabilityLoading}
        currentUserId={user?.id}
        isUpdating={updateStatusMutation.isPending}
        onStatusChange={(status) => updateStatusMutation.mutate({ status })}
        onWorkloadChange={(workload) =>
          updateStatusMutation.mutate({ workload })
        }
      />

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
