"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

const CONFIRM_PHRASE = "transfer ownership";

type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MANAGER" | "ADMIN" | "OWNER";
};

interface TransferOwnershipModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  currentUserId: string;
}

export function TransferOwnershipModal({
  open,
  onClose,
  workspaceId,
  currentUserId,
}: TransferOwnershipModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [confirmInput, setConfirmInput] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const confirmInputId = useId();

  const membersQuery = useQuery({
    queryKey: ["workspace-members", workspaceId],
    enabled: open,
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{ members: WorkspaceMember[] }>
      >(`/workspaces/${workspaceId}/members`);
      return response.data.data.members;
    },
  });

  const candidateMembers = useMemo(
    () =>
      (membersQuery.data ?? []).filter((member) => member.id !== currentUserId),
    [currentUserId, membersQuery.data],
  );

  const selectedMember = candidateMembers.find(
    (member) => member.id === selectedUserId,
  );
  const canConfirm = confirmInput.trim().toLowerCase() === CONFIRM_PHRASE;

  const transferMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/workspaces/${workspaceId}/transfer-ownership`, {
        newOwnerUserId: selectedUserId,
      });
    },
    onSuccess: () => {
      toast.success("Ownership transferred. You are now an Admin.");
      window.setTimeout(() => {
        window.location.reload();
      }, 250);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      setApiError(
        error.response?.data?.message ??
          "Something went wrong. Please try again or contact support.",
      );
    },
  });

  function resetState() {
    setStep(1);
    setSelectedUserId("");
    setConfirmInput("");
    setApiError(null);
  }

  function handleClose() {
    if (transferMutation.isPending) {
      return;
    }
    resetState();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="max-w-md">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Transfer workspace ownership</DialogTitle>
              <DialogDescription>
                The new owner will have full control of this workspace. You will
                become an Admin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor={`${confirmInputId}-member`}
                >
                  New owner
                </label>
                <Select
                  value={selectedUserId || undefined}
                  onValueChange={(value) => {
                    setSelectedUserId(value);
                    setApiError(null);
                  }}
                  disabled={membersQuery.isLoading}
                >
                  <SelectTrigger
                    id={`${confirmInputId}-member`}
                    className="w-full"
                  >
                    <SelectValue
                      placeholder={
                        membersQuery.isLoading
                          ? "Loading members..."
                          : "Select a member"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {candidateMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMember && (
                  <p className="text-sm text-muted-foreground">
                    {selectedMember.email}
                  </p>
                )}
                {membersQuery.isError && (
                  <p className="text-sm text-destructive">
                    Could not load workspace members.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedUserId || membersQuery.isLoading}
              >
                Transfer ownership
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Type to confirm</DialogTitle>
              <DialogDescription>
                Type &quot;transfer ownership&quot; to confirm.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                id={confirmInputId}
                autoComplete="off"
                name={`transfer-ownership-${confirmInputId}`}
                value={confirmInput}
                onChange={(event) => {
                  setConfirmInput(event.target.value);
                  setApiError(null);
                }}
                placeholder="transfer ownership"
                disabled={transferMutation.isPending}
              />
              {apiError && (
                <p className="text-sm text-destructive">{apiError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={transferMutation.isPending}
              >
                Back
              </Button>
              <Button
                onClick={() => transferMutation.mutate()}
                disabled={
                  !selectedUserId || !canConfirm || transferMutation.isPending
                }
              >
                {transferMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Transferring...
                  </span>
                ) : (
                  "Transfer ownership"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
