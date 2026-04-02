"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/(app)/settings/actions";

interface DangerZoneProps {
  userEmail: string | null;
}

export function DangerZone({ userEmail }: DangerZoneProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const confirmPhrase = "DELETE";
  const canDelete = confirmText === confirmPhrase;

  function handleDelete() {
    if (!canDelete) return;
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.success) {
        await signOut({ callbackUrl: "/" });
      }
    });
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-card animate-fade-up animate-delay-3">
      <div className="flex items-center gap-3 border-b border-destructive/20 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">Danger Zone</h2>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Delete your account
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently remove your account and all associated data — profile,
            resumes, cover letters, and job listings. This action cannot be
            undone.
          </p>
        </div>

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-destructive/5"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        ) : (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm text-foreground">
              This will permanently delete your account
              {userEmail ? (
                <>
                  {" "}
                  (<span className="font-medium">{userEmail}</span>)
                </>
              ) : null}
              . Type{" "}
              <span className="font-mono font-semibold text-destructive">
                {confirmPhrase}
              </span>{" "}
              to confirm.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirmPhrase}
              autoFocus
              className="h-9 w-full rounded-lg border border-destructive/30 bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-destructive/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart) placeholder:text-muted-foreground/50"
              disabled={isPending}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete || isPending}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "Deleting..." : "Permanently delete"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
