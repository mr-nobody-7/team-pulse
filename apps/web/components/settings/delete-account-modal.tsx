"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteAccount } from "@/hooks/use-delete-account";

const CONFIRM_PHRASE = "delete my account";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  /** True when the user authenticated via Google OAuth. */
  isGoogleUser: boolean;
  /** True when the user is the sole admin and only member — deletes entire workspace. */
  deletesWorkspace: boolean;
}

export function DeleteAccountModal({
  open,
  onClose,
  isGoogleUser,
  deletesWorkspace,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmInput, setConfirmInput] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const confirmInputId = useId();

  const mutation = useDeleteAccount();

  const canConfirm = confirmInput.toLowerCase() === CONFIRM_PHRASE;

  function handleClose() {
    if (mutation.isPending) return;
    setStep(1);
    setConfirmInput("");
    setApiError(null);
    onClose();
  }

  function handleDelete() {
    if (!canConfirm) return;
    setApiError(null);
    mutation.mutate(undefined, {
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message = (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message;

        if (status === 400 && message) {
          // Ownership-transfer block — close modal and show as toast
          handleClose();
          toast.error(message);
        } else {
          setApiError("Something went wrong. Please try again or contact support.");
        }
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">Are you sure?</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your leaves, availability history, and profile will be
                permanently deleted.
              </p>
              {deletesWorkspace && (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
                  Your entire workspace including all settings and leave history
                  will also be deleted.
                </p>
              )}
              {isGoogleUser && (
                <p>Your Google sign-in access will also be revoked.</p>
              )}
              <p className="font-medium text-foreground">
                This action cannot be undone.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep(2)}
              >
                Yes, continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                Type to confirm
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Type{" "}
                <span className="font-mono font-medium text-foreground">
                  &quot;delete my account&quot;
                </span>{" "}
                to confirm.
              </p>

              <div className="space-y-1.5">
                <label htmlFor={confirmInputId} className="sr-only">
                  Confirmation phrase
                </label>
                <Input
                  id={confirmInputId}
                  // Prevent password manager autofill
                  autoComplete="off"
                  name={`confirm-deletion-${confirmInputId}`}
                  value={confirmInput}
                  onChange={(e) => {
                    setConfirmInput(e.target.value);
                    setApiError(null);
                  }}
                  placeholder="delete my account"
                  disabled={mutation.isPending}
                />
              </div>

              {apiError && (
                <p className="text-sm text-destructive">{apiError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={mutation.isPending}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!canConfirm || mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Deleting...
                  </span>
                ) : (
                  "Delete permanently"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
