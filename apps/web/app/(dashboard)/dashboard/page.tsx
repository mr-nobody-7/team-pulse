"use client";

import {
  CalendarDays,
  CalendarCheck2,
  ClipboardList,
  PieChart,
  Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/contexts/auth-context";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { useLeaves } from "@/hooks/use-leaves";
import { useRole } from "@/hooks/use-role";
import api from "@/lib/axios";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { canApprove, isManager } = useRole();
  const { data: summary, isLoading } = useDashboardSummary();
  const {
    data: pendingLeaves,
    isLoading: pendingLoading,
  } = useLeaves(
    {
      status: "PENDING",
      page: 1,
      limit: 5,
    },
    isManager,
  );

  const decisionMutation = useMutation({
    mutationFn: async ({
      leaveId,
      status,
    }: {
      leaveId: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      await api.patch(`/leave/${leaveId}/status`, { status });
    },
    onSuccess: async (_data, variables) => {
      toast.success(
        variables.status === "APPROVED"
          ? "Leave approved"
          : "Leave rejected",
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["leaves"] }),
      ]);
    },
    onError: () => {
      toast.error("Could not update leave status");
    },
  });

  const upcomingLeaves = summary?.upcomingLeaves ?? [];
  const leaveDistribution = summary?.leaveDistribution ?? [];
  const availabilityByDay = summary?.availabilityByDay ?? [];

  const DISTRIBUTION_COLOR: Record<string, string> = {
    VACATION: "#3b82f6",
    SICK: "#ef4444",
    PERSONAL: "#a855f7",
    CASUAL: "#f59e0b",
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={summary?.totalUsers}
          description="Active users in scope"
          icon={Users}
          isLoading={isLoading}
        />

        <StatCard
          title="Leaves Today"
          value={summary?.todayLeaves}
          description="People currently on leave"
          icon={CalendarCheck2}
          isLoading={isLoading}
        />

        {canApprove && (
          <StatCard
            title="Pending Approvals"
            value={summary?.pendingApprovals}
            description="Requests awaiting your action"
            icon={ClipboardList}
            isLoading={isLoading}
            iconClassName="bg-amber-100"
            className={
              (summary?.pendingApprovals ?? 0) > 0 ? "border-amber-300" : undefined
            }
          />
        )}

        <StatCard
          title="Upcoming Leaves"
          value={upcomingLeaves.length}
          description="Starting in next 7 days"
          icon={CalendarDays}
          isLoading={isLoading}
        />
      </div>

      {/* Pending approvals widget — manager only */}
      {isManager && (
        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !(pendingLeaves?.leaves.length ?? 0) ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No pending requests 🎉
                </p>
              ) : (
                <div className="divide-y">
                  {pendingLeaves?.leaves.map((leave, idx) => {
                    const isBusy =
                      decisionMutation.isPending &&
                      decisionMutation.variables?.leaveId === leave.id;

                    return (
                      <div key={leave.id} className="py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">{leave.user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(leave.startDate), "MMM d")} → {format(parseISO(leave.endDate), "MMM d")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{leave.type}</Badge>
                            <Button
                              size="xs"
                              onClick={() =>
                                decisionMutation.mutate({
                                  leaveId: leave.id,
                                  status: "APPROVED",
                                })
                              }
                              disabled={isBusy}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() =>
                                decisionMutation.mutate({
                                  leaveId: leave.id,
                                  status: "REJECTED",
                                })
                              }
                              disabled={isBusy}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>

                        {idx < (pendingLeaves?.leaves.length ?? 0) - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">
              Upcoming Leaves (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : upcomingLeaves.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No upcoming leaves in the next 7 days.
              </p>
            ) : (
              <div className="divide-y">
                {upcomingLeaves.map((leave, i) => (
                  <div key={leave.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{leave.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(leave.startDate), "MMM d")} → {format(parseISO(leave.endDate), "MMM d")}
                        </span>
                      </div>
                      <Badge variant="outline">{leave.type}</Badge>
                    </div>
                    {i < upcomingLeaves.length - 1 && <Separator className="my-0" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution + availability insights */}
      {canApprove && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <PieChart className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Leave Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={leaveDistribution}
                        dataKey="count"
                        nameKey="type"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {leaveDistribution.map((entry) => (
                          <Cell
                            key={entry.type}
                            fill={DISTRIBUTION_COLOR[entry.type] ?? "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Next 7 Days Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div className="divide-y">
                  {availabilityByDay.map((day) => (
                    <div key={day.date} className="flex items-center justify-between py-3">
                      <div className="text-sm font-medium">
                        {format(parseISO(day.date), "MMM d")}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{day.available} available</p>
                        <p className="text-xs text-muted-foreground">
                          {day.onLeave} on leave / {day.total} total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
