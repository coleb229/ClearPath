"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { ResumeImportDialog } from "./resume-import-dialog";

export function ResumeImportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-(--dur-state) hover:bg-muted"
      >
        <Upload className="h-3.5 w-3.5" />
        Import Resume
      </button>
      <ResumeImportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}