import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AvailabilityBoardResponse,
  AvailabilityStatus,
  WorkloadLevel,
} from "@/types/api";

const STATUS_LABEL: Record<AvailabilityStatus, string> = {
  AVAILABLE: "Available",
  ON_LEAVE: "On Leave",
  WORKING_REMOTELY: "Working Remotely",
  HALF_DAY: "Half Day",
  BUSY: "Busy",
  FOCUS_TIME: "Focus Time",
};

const STATUS_BADGE_CLASS: Record<AvailabilityStatus, string> = {
  AVAILABLE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  ON_LEAVE: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  WORKING_REMOTELY:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  HALF_DAY: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  BUSY: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  FOCUS_TIME:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

const WORKLOAD_LABEL: Record<WorkloadLevel, string> = {
  LIGHT: "Light workload",
  NORMAL: "Normal workload",
  HEAVY: "Heavy workload",
};

const WORKLOAD_BADGE_CLASS: Record<WorkloadLevel, string> = {
  LIGHT:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  NORMAL: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  HEAVY: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

interface AvailabilityBoardProps {
  date: string;
  board: AvailabilityBoardResponse | undefined;
  isLoading: boolean;
  currentUserId?: string;
  isUpdating: boolean;
  onStatusChange: (status: AvailabilityStatus) => void;
  onWorkloadChange: (workload: WorkloadLevel) => void;
}

export function AvailabilityBoard({
  date,
  board,
  isLoading,
  currentUserId,
  isUpdating,
  onStatusChange,
  onWorkloadChange,
}: AvailabilityBoardProps) {
  const currentUser = board?.members.find(
    (member) => member.userId === currentUserId,
  );
  const selectedStatus = currentUser?.status ?? "AVAILABLE";
  const selectedWorkload = currentUser?.workload ?? "NORMAL";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>
            Team Availability ·{" "}
            {format(parseISO(`${date}T00:00:00Z`), "EEE, MMM d")}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Live board of who is available, remote, busy, or on leave.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:w-104 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              My status
            </p>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                onStatusChange(value as AvailabilityStatus)
              }
              disabled={isLoading || isUpdating || currentUser?.isOnLeave}
            >
              <SelectTrigger>
                <SelectValue placeholder="Set my status" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as AvailabilityStatus[]).map(
                  (status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              My workload
            </p>
            <Select
              value={selectedWorkload}
              onValueChange={(value) =>
                onWorkloadChange(value as WorkloadLevel)
              }
              disabled={isLoading || isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Set my workload" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(WORKLOAD_LABEL) as WorkloadLevel[]).map(
                  (workload) => (
                    <SelectItem key={workload} value={workload}>
                      {WORKLOAD_LABEL[workload]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          {currentUser?.isOnLeave && (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              You are on approved leave for this day.
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-56" />
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton
                key={`availability-row-${index + 1}`}
                className="h-10 w-full"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {board?.byStatus
                .filter((entry) => entry.count > 0)
                .map((entry) => (
                  <Badge
                    key={entry.status}
                    variant="secondary"
                    className={STATUS_BADGE_CLASS[entry.status]}
                  >
                    {STATUS_LABEL[entry.status]} · {entry.count}
                  </Badge>
                ))}
              {board?.byWorkload
                .filter((entry) => entry.count > 0)
                .map((entry) => (
                  <Badge
                    key={entry.workload}
                    variant="secondary"
                    className={WORKLOAD_BADGE_CLASS[entry.workload]}
                  >
                    {WORKLOAD_LABEL[entry.workload]} · {entry.count}
                  </Badge>
                ))}
            </div>

            {!board?.members.length ? (
              <p className="text-sm text-muted-foreground">
                No active users for this scope.
              </p>
            ) : (
              <div className="divide-y rounded-lg border">
                {board.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.teamName ?? "No team"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge
                        variant="secondary"
                        className={STATUS_BADGE_CLASS[member.status]}
                      >
                        {STATUS_LABEL[member.status]}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={WORKLOAD_BADGE_CLASS[member.workload]}
                      >
                        {WORKLOAD_LABEL[member.workload]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
