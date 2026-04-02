"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { User, LogOut, Pencil, Check, X } from "lucide-react";
import { updateUserName } from "@/app/(app)/settings/actions";

interface AccountSectionProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
  };
}

export function AccountSection({ user }: AccountSectionProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [isPending, startTransition] = useTransition();

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function handleSave() {
    startTransition(async () => {
      const result = await updateUserName(name);
      if (result.success) {
        setEditing(false);
      }
    });
  }

  function handleCancel() {
    setName(user.name ?? "");
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-up">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">Account</h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Avatar + Name + Email */}
        <div className="flex items-start gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="h-14 w-14 rounded-full border-2 border-border object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {(user.name ?? "U")[0].toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            {/* Name — inline edit */}
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !name.trim()}
                  className="rounded-lg p-1.5 text-primary hover:bg-primary/5 transition-colors duration-(--dur-state) ease-(--ease-out-quart) disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors duration-(--dur-state) ease-(--ease-out-quart)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">
                  {user.name ?? "Unnamed"}
                </span>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-(--dur-state) ease-(--ease-out-quart)"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
