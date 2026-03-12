"use client";

import {
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  ClipboardList,
  Users,
} from "lucide-react";
import { useMemo } from "react";

import { StatCard } from "@/components/ui/stat-card";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useRole } from "@/hooks/use-role";
import { useLeaves } from "@/hooks/use-leaves";
import type { LeaveRequest } from "@/types/api";

const STATUS_BADGE: Record<
  LeaveRequest["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pending", variant: "outline" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

function LeaveRow({ leave }: { leave: LeaveRequest }) {
  const badge = STATUS_BADGE[leave.status];
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{leave.user.name}</span>
        <span className="text-xs text-muted-foreground">
          {leave.startDate} → {leave.endDate} · {leave.type}
        </span>
      </div>
      <Badge variant={badge.variant}>{badge.label}</Badge>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { canApprove, isAdmin } = useRole();

  // Fetch my upcoming / active leaves
  const { data: myLeaves, isLoading: myLeavesLoading } = useLeaves({
    status: "APPROVED",
    page: 1,
    limit: 100,
  });

  // Fetch pending leaves (for approvers)
  const { data: pendingLeaves, isLoading: pendingLoading } = useLeaves({
    status: "PENDING",
    page: 1,
    limit: 10,
  });

  const upcomingCount = useMemo(() => {
    if (!myLeaves) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return myLeaves.leaves.filter((l) => l.endDate >= today && l.userId === user?.id).length;
  }, [myLeaves, user?.id]);

  const pendingCount = pendingLeaves?.total ?? 0;
  const teamOnLeaveToday = useMemo(() => {
    if (!myLeaves) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return myLeaves.leaves.filter(
      (l) => l.startDate <= today && l.endDate >= today,
    ).length;
  }, [myLeaves]);

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
          title="My Upcoming Leaves"
          value={upcomingCount}
          description="Approved leaves from today"
          icon={CalendarCheck2}
          isLoading={myLeavesLoading}
        />

        <StatCard
          title="On Leave Today"
          value={teamOnLeaveToday}
          description="Team members currently off"
          icon={Users}
        />

        {canApprove && (
          <StatCard
            title="Pending Approvals"
            value={pendingCount}
            description="Requests awaiting your action"
            icon={ClipboardList}
            isLoading={pendingLoading}
            iconClassName="bg-amber-100"
            className={pendingCount > 0 ? "border-amber-300" : undefined}
          />
        )}

        {isAdmin && (
          <StatCard
            title="Total Leave Requests"
            value={myLeaves?.total}
            description="Across all teams (approved)"
            icon={CalendarClock}
            isLoading={myLeavesLoading}
          />
        )}
      </div>

      {/* Recent activity — visible to approvers */}
      {canApprove && (
        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <CalendarX2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : !pendingLeaves?.leaves.length ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No pending requests 🎉
                </p>
              ) : (
                <div className="divide-y">
                  {pendingLeaves.leaves.map((leave, i) => (
                    <div key={leave.id}>
                      <LeaveRow leave={leave} />
                      {i < pendingLeaves.leaves.length - 1 && (
                        <Separator className="my-0" />
                      )}
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
