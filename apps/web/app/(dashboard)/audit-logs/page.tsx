"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";

import { RoleGuard } from "@/components/auth/role-guard";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import type { ApiResponse, ListAuditLogsResponse } from "@/types/api";

const ACTIONS = [
  "ALL",
  "USER_REGISTERED",
  "USER_LOGIN",
  "USER_LOGIN_FAILED",
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DEACTIVATED",
  "TEAM_CREATED",
  "TEAM_UPDATED",
  "TEAM_DELETED",
  "LEAVE_TYPES_UPDATED",
  "USER_AVAILABILITY_UPDATED",
  "LEAVE_APPLIED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "LEAVE_CANCELLED",
] as const;

export default function AuditLogsPage() {
  const [action, setAction] = useState<(typeof ACTIONS)[number]>("ALL");
  const [userId, setUserId] = useState("");

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      ...(action !== "ALL" ? { action } : {}),
      ...(userId.trim() ? { user_id: userId.trim() } : {}),
    }),
    [action, userId],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", queryParams],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ListAuditLogsResponse>>(
        "/audit-logs",
        { params: queryParams },
      );
      return response.data.data;
    },
  });

  return (
    <RoleGuard
      allowedRoles={["ADMIN"]}
      fallback={
        <PageContainer>
          <p className="text-sm text-muted-foreground">Access denied.</p>
        </PageContainer>
      }
    >
      <PageContainer className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track authentication, user/team administration, availability, and
            leave workflow events.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={action}
            onValueChange={(value) =>
              setAction(value as (typeof ACTIONS)[number])
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter action" />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "ALL" ? "All actions" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="max-w-xs"
            placeholder="Filter by actor user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading audit logs...
              </p>
            ) : !(data?.logs.length ?? 0) ? (
              <p className="text-sm text-muted-foreground">No events found.</p>
            ) : (
              <div className="space-y-2">
                {data?.logs.map((log) => (
                  <div key={log.id} className="rounded-lg border p-3">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge>{log.action}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(log.createdAt), "PPpp")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Actor: {log.userId ?? "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Target: {log.targetType ?? "N/A"} ({log.targetId ?? "N/A"}
                      )
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </RoleGuard>
  );
}
