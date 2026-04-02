"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, FileText, Loader2, X, Check, AlertCircle } from "lucide-react";
import { importResumeData } from "@/app/(app)/profile/actions";

interface ResumeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStep = "upload" | "parsing" | "preview" | "importing" | "done" | "error";

export function ResumeImportDialog({ open, onOpenChange }: ResumeImportDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync dialog open state
  const prevOpenRef = useRef(open);
  if (open !== prevOpenRef.current) {
    prevOpenRef.current = open;
    if (open && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    } else if (!open && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }

  function reset() {
    setStep("upload");
    setFile(null);
    setParsedData(null);
    setError(null);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selected.size > maxSize) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setFile(selected);
    setError(null);
    handleParse(selected);
  }

  async function handleParse(fileToparse: File) {
    setStep("parsing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileToparse);

      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to parse resume");
      }

      const { data } = await res.json();
      setParsedData(data);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  function handleImport() {
    if (!parsedData) return;

    setStep("importing");
    startTransition(async () => {
      const result = await importResumeData(parsedData as Parameters<typeof importResumeData>[0]);
      if (result.success) {
        setStep("done");
        setTimeout(() => handleClose(), 1500);
      } else {
        setError(result.error);
        setStep("error");
      }
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setError(null);
      handleParse(dropped);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = parsedData as Record<string, any> | null;
  const headline = data?.headline as string | undefined;
  const experienceCount = (data?.experiences as unknown[] | undefined)?.length ?? 0;
  const educationCount = (data?.educations as unknown[] | undefined)?.length ?? 0;
  const skillCount = (data?.skills as unknown[] | undefined)?.length ?? 0;
  const projectCount = (data?.projects as unknown[] | undefined)?.length ?? 0;
  const certificationCount = (data?.certifications as unknown[] | undefined)?.length ?? 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => { if (e.target === dialogRef.current) handleClose(); }}
      className="fixed inset-0 m-auto max-w-lg w-full bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="rounded-xl bg-card border border-border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Import Resume</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors duration-(--dur-state) hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Upload step */}
          {step === "upload" && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors duration-(--dur-state) hover:border-primary/30 hover:bg-muted/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                Drop your resume here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOCX, or TXT — up to 10MB
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) hover:bg-primary/90"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Parsing step */}
          {step === "parsing" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-foreground">
                Analyzing your resume...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI is extracting your experience, education, and skills
              </p>
            </div>
          )}

          {/* Preview step */}
          {step === "preview" && data && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Here&apos;s what we found in your resume. This will be added to your profile.
              </p>

              <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                {headline && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Headline</span>
                    <p className="text-sm text-foreground">{headline}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {experienceCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-lg font-semibold text-primary">{experienceCount}</span>
                      <span className="text-xs text-muted-foreground">Experience{experienceCount !== 1 && "s"}</span>
                    </div>
                  )}
                  {educationCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-lg font-semibold text-primary">{educationCount}</span>
                      <span className="text-xs text-muted-foreground">Education{educationCount !== 1 && "s"}</span>
                    </div>
                  )}
                  {skillCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-lg font-semibold text-primary">{skillCount}</span>
                      <span className="text-xs text-muted-foreground">Skill{skillCount !== 1 && "s"}</span>
                    </div>
                  )}
                  {projectCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-lg font-semibold text-primary">{projectCount}</span>
                      <span className="text-xs text-muted-foreground">Project{projectCount !== 1 && "s"}</span>
                    </div>
                  )}
                  {certificationCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-lg font-semibold text-primary">{certificationCount}</span>
                      <span className="text-xs text-muted-foreground">Certification{certificationCount !== 1 && "s"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-(--dur-state) hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) hover:bg-primary/90 disabled:opacity-50"
                >
                  Import to Profile
                </button>
              </div>
            </div>
          )}

          {/* Importing step */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-foreground">
                Importing to your profile...
              </p>
            </div>
          )}

          {/* Done step */}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Check className="h-6 w-6 text-accent" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                Resume imported successfully!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your profile has been updated with the extracted data.
              </p>
            </div>
          )}

          {/* Error step */}
          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                Something went wrong
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {error || "Failed to parse resume. Please try again."}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}