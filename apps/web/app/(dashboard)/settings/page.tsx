"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LEAVE_TYPES = ["VACATION", "SICK", "PERSONAL", "CASUAL"];

export default function SettingsPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Workspace-level leave configuration overview.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {LEAVE_TYPES.map((type) => (
                <Badge key={type} variant="outline">
                  {type}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Leave type customization is planned for next milestone. Current
              types are fixed for v1.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conflict Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Current warning threshold: <strong>50%</strong> team overlap.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    </RoleGuard>
  );
}
