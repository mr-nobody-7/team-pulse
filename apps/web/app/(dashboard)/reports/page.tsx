"use client";

import { format, parse } from "date-fns";
import { Download } from "lucide-react";
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

import { RoleGuard } from "@/components/auth/role-guard";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
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
import { useRole } from "@/hooks/use-role";
import { useTeams } from "@/hooks/use-teams";

const TYPE_COLORS: Record<string, string> = {
  VACATION: "#3b82f6",
  SICK: "#ef4444",
  PERSONAL: "#a855f7",
  CASUAL: "#f59e0b",
};

function toCsv(
  rows: Array<Record<string, string | number>>,
  headers: string[],
) {
  const escapeCsv = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`;

  const headerLine = headers.map((key) => escapeCsv(key)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((key) => escapeCsv(row[key] ?? "")).join(","),
  );

  return [headerLine, ...dataLines].join("\n");
}

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
  const { isManager, isWorkspaceAdmin } = useRole();
  const canAccessReports = isWorkspaceAdmin || isManager;
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [teamId, setTeamId] = useState("all");

  const { data: teams = [] } = useTeams();
  const { data, isLoading, isError, refetch } = useReportsAnalytics(
    {
      month,
      teamId: teamId === "all" ? undefined : teamId,
    },
    { enabled: canAccessReports },
  );

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
  const hasAnyData =
    usageByMonth.some((item) => item.count > 0) ||
    leaveByTeam.length > 0 ||
    leaveByType.some((item) => item.count > 0);

  const exportCsv = () => {
    if (!hasAnyData) return;

    const sections = [
      "Leave Usage by Month",
      toCsv(
        usageByMonth.map((item) => ({ month: item.month, count: item.count })),
        ["month", "count"],
      ),
      "",
      "Leave by Type",
      toCsv(
        leaveByType.map((item) => ({ type: item.type, count: item.count })),
        ["type", "count"],
      ),
      "",
      "Leave by Team",
      toCsv(
        leaveByTeam.map((item) => ({
          teamId: item.teamId,
          teamName: item.teamName,
          count: item.count,
        })),
        ["teamId", "teamName", "count"],
      ),
    ];

    const blob = new Blob([sections.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reports-${month}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <RoleGuard
      allowedRoles={["ADMIN", "MANAGER"]}
      fallback={
        <PageContainer className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This section is available to managers and admins only.
            </p>
          </div>
        </PageContainer>
      }
    >
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

          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={exportCsv}
            disabled={isLoading || !hasAnyData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {isLoading ? (
          <ReportsLoadingSkeleton />
        ) : isError ? (
          <Card>
            <CardHeader>
              <CardTitle>Unable to load reports</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                Something went wrong while fetching analytics.
              </p>
              <Button size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : !hasAnyData ? (
          <Card>
            <CardHeader>
              <CardTitle>No data for selected filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Try selecting a different month or team.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leave Usage per Month</CardTitle>
              </CardHeader>
              <CardContent>
                {usageByMonth.some((item) => item.count > 0) ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usageByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No month usage data available.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave by Type ({month})</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveByType.some((item) => item.count > 0) ? (
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
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No leave type data for selected month.
                  </p>
                )}
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
    </RoleGuard>
  );
}
