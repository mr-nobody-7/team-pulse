"use client";

import { format, parse } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportsAnalytics } from "@/hooks/use-reports-analytics";
import { useTeams } from "@/hooks/use-teams";

const TYPE_COLORS: Record<string, string> = {
  VACATION: "#3b82f6",
  SICK: "#ef4444",
  PERSONAL: "#a855f7",
  CASUAL: "#f59e0b",
};

function ReportsLoadingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Leave Usage per Month</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leave by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Leave by Team (Selected Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [teamId, setTeamId] = useState("all");

  const { data: teams = [] } = useTeams();
  const { data, isLoading } = useReportsAnalytics({
    month,
    teamId: teamId === "all" ? undefined : teamId,
  });

  const usageByMonth = useMemo(
    () =>
      (data?.leaveUsageByMonth ?? []).map((item) => ({
        ...item,
        label: format(
          parse(`${item.month}-01`, "yyyy-MM-dd", new Date()),
          "MMM",
        ),
      })),
    [data?.leaveUsageByMonth],
  );

  const leaveByTeam = data?.leaveByTeam ?? [];
  const leaveByType = data?.leaveByType ?? [];

  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze leave trends by month, team, and type.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          aria-label="Month filter"
        />

        <Select value={teamId} onValueChange={setTeamId}>
          <SelectTrigger className="w-44" size="sm">
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
      </div>

      {isLoading ? (
        <ReportsLoadingSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leave Usage per Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave by Type ({month})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leaveByType}
                      dataKey="count"
                      nameKey="type"
                      innerRadius={40}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {leaveByType.map((entry) => (
                        <Cell
                          key={entry.type}
                          fill={TYPE_COLORS[entry.type] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Leave by Team ({month})</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveByTeam.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No leave data for selected filters.
                </p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaveByTeam}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="teamName" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
