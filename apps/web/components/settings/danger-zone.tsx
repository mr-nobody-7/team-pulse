"use client";

import { useState } from "react";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export function DangerZone() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (!user) return null;

  const isOwner = user.isOwner ?? false;
  const memberCount = user.workspaceMemberCount ?? 1;
  const isGoogleUser = user.authMethod === "google";

  const isBlocked = isOwner && memberCount > 1;

  const deletesWorkspace = isOwner && memberCount === 1;

  return (
    <>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBlocked ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You are the workspace owner. Transfer ownership or remove all
                members before deleting your account.
              </p>
              <Button variant="destructive" disabled>
                Delete account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This
                  cannot be undone.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setModalOpen(true)}>
                Delete account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        isGoogleUser={isGoogleUser}
        deletesWorkspace={deletesWorkspace}
      />
    </>
  );
}
