"use client";

import { useState, useTransition } from "react";
import { Download, Database, Check } from "lucide-react";
import { exportUserData } from "@/app/(app)/settings/actions";

export function DataSection() {
  const [isPending, startTransition] = useTransition();
  const [exported, setExported] = useState(false);

  function handleExport() {
    startTransition(async () => {
      const result = await exportUserData();
      if (result.success) {
        const blob = new Blob([result.data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `clearpath-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExported(true);
        setTimeout(() => setExported(false), 3000);
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-up animate-delay-2">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Database className="h-4 w-4 text-primary" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">
          Data & Privacy
        </h2>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Export your data</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Download a JSON file containing your profile, resumes, cover
            letters, and job listings. Your data belongs to you.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted disabled:opacity-50"
        >
          {exported ? (
            <>
              <Check className="h-4 w-4 text-[oklch(0.55_0.15_145)]" />
              Downloaded
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {isPending ? "Preparing..." : "Export all data"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
