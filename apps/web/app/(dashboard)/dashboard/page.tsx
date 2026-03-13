"use client";

import {
  CalendarDays,
  CalendarCheck2,
  ClipboardList,
  Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/contexts/auth-context";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { useRole } from "@/hooks/use-role";

export default function DashboardPage() {
  const { user } = useAuth();
  const { canApprove } = useRole();
  const { data: summary, isLoading } = useDashboardSummary();

  const upcomingLeaves = summary?.upcomingLeaves ?? [];

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
    </PageContainer>
  );
}
