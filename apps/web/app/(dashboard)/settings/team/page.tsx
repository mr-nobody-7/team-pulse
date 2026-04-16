import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamSettingsPage() {
  return (
    <PageContainer className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Setup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add members and organize teams to unlock planning views.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite your team</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/users">Invite members</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/teams">Manage teams</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
