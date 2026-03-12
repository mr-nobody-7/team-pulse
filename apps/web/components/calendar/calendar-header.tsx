"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Team } from "@/types/api";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  teams?: Team[];
  selectedTeamId: string;
  onTeamChange: (teamId: string) => void;
}

export function CalendarHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
  teams = [],
  selectedTeamId,
  onTeamChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
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
        {/* Team filter */}
        <Select value={selectedTeamId} onValueChange={onTeamChange}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="All teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
