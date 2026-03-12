import { format } from "date-fns";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { LeaveRequest } from "@/types/api";

interface LeaveDetailsPanelProps {
  selectedDay: { date: Date; leaves: LeaveRequest[] } | null;
  onClose: () => void;
}

const LEAVE_TYPE_COLOR: Record<string, string> = {
  VACATION: "bg-blue-500",
  SICK: "bg-red-500",
  PERSONAL: "bg-purple-500",
  CASUAL: "bg-amber-500",
};

const SESSION_LABEL: Record<string, string> = {
  FULL_DAY: "Full day",
  FIRST_HALF: "Morning",
  SECOND_HALF: "Afternoon",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function LeaveCard({ leave, day }: { leave: LeaveRequest; day: Date }) {
  const key = format(day, "yyyy-MM-dd");
  const isStart = leave.startDate === key;
  const isEnd = leave.endDate === key;
  const sessionLabel =
    isStart && isEnd
      ? SESSION_LABEL[leave.startSession] === SESSION_LABEL[leave.endSession]
        ? SESSION_LABEL[leave.startSession]
        : `${SESSION_LABEL[leave.startSession]} – ${SESSION_LABEL[leave.endSession]}`
      : isStart
        ? `From ${SESSION_LABEL[leave.startSession]}`
        : isEnd
          ? `Until ${SESSION_LABEL[leave.endSession]}`
          : "Full day";

  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold text-white",
            LEAVE_TYPE_COLOR[leave.type] ?? "bg-gray-500",
          )}
        >
          {getInitials(leave.user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{leave.user.name}</p>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {leave.type}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{sessionLabel}</p>
        {leave.reason && (
          <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">
            &ldquo;{leave.reason}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

export function LeaveDetailsPanel({
  selectedDay,
  onClose,
}: LeaveDetailsPanelProps) {
  if (!selectedDay) {
    return (
      <Card className="flex h-full min-h-48 flex-col items-center justify-center">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Click a day with leaves to see details.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { date, leaves } = selectedDay;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">
          {format(date, "EEEE, MMM d")}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {leaves.length} on leave
          </span>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="divide-y">
          {leaves.map((leave) => (
            <LeaveCard key={leave.id} leave={leave} day={date} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
