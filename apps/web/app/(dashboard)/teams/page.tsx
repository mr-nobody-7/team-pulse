"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { RoleGuard } from "@/components/auth/role-guard";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTeams } from "@/hooks/use-teams";
import api from "@/lib/axios";

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const { data: teams = [], isLoading } = useTeams();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post("/teams", { name });
    },
    onSuccess: async () => {
      setName("");
      toast.success("Team created");
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => toast.error("Could not create team"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      teamId,
      teamName,
    }: {
      teamId: string;
      teamName: string;
    }) => {
      await api.patch(`/teams/${teamId}`, { name: teamName });
    },
    onSuccess: async () => {
      toast.success("Team updated");
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => toast.error("Could not update team"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      await api.delete(`/teams/${teamId}`);
    },
    onSuccess: async () => {
      toast.success("Team deleted");
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: () => toast.error("Could not delete team"),
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
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage workspace teams.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Team</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
              className="max-w-xs"
            />
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!name.trim() || createMutation.isPending}
            >
              Create
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading teams...</p>
            ) : teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teams yet.</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => {
                  const current = editing[team.id] ?? team.name;

                  return (
                    <div
                      key={team.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                    >
                      <Input
                        value={current}
                        onChange={(e) =>
                          setEditing((prev) => ({
                            ...prev,
                            [team.id]: e.target.value,
                          }))
                        }
                        className="max-w-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!current.trim() || updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            teamId: team.id,
                            teamName: current,
                          })
                        }
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(team.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </RoleGuard>
  );
}
