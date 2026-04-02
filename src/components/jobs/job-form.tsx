"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface JobFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: {
    id: string;
    title: string;
    company: string;
    url: string | null;
    description: string;
    location: string | null;
    salary: string | null;
  } | null;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function JobForm({ open, onOpenChange, job, onSubmit }: JobFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formRef.current) return;
      setSubmitting(true);
      const formData = new FormData(formRef.current);
      if (job?.id) formData.set("id", job.id);
      await onSubmit(formData);
      setSubmitting(false);
      onOpenChange(false);
      formRef.current.reset();
    },
    [job, onSubmit, onOpenChange]
  );

  const isEdit = !!job;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto max-w-lg w-full bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95"
    >
      <div className="rounded-xl bg-card p-6 shadow-lg border border-border">
        <h2 className="text-base font-semibold text-foreground">
          {isEdit ? "Edit Job Listing" : "Add Job Listing"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit
            ? "Update the job listing details."
            : "Add a new job to track your application pipeline."}
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="job-title"
              className="block text-sm font-medium text-foreground"
            >
              Job Title <span className="text-destructive">*</span>
            </label>
            <input
              id="job-title"
              name="title"
              type="text"
              required
              defaultValue={job?.title ?? ""}
              placeholder="e.g. Senior Frontend Engineer"
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
            />
          </div>

          {/* Company */}
          <div>
            <label
              htmlFor="job-company"
              className="block text-sm font-medium text-foreground"
            >
              Company <span className="text-destructive">*</span>
            </label>
            <input
              id="job-company"
              name="company"
              type="text"
              required
              defaultValue={job?.company ?? ""}
              placeholder="e.g. Stripe"
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
            />
          </div>

          {/* URL + Location row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="job-url"
                className="block text-sm font-medium text-foreground"
              >
                Job URL
              </label>
              <input
                id="job-url"
                name="url"
                type="url"
                defaultValue={job?.url ?? ""}
                placeholder="https://..."
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
              />
            </div>
            <div>
              <label
                htmlFor="job-location"
                className="block text-sm font-medium text-foreground"
              >
                Location
              </label>
              <input
                id="job-location"
                name="location"
                type="text"
                defaultValue={job?.location ?? ""}
                placeholder="e.g. Remote, NYC"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
              />
            </div>
          </div>

          {/* Salary */}
          <div>
            <label
              htmlFor="job-salary"
              className="block text-sm font-medium text-foreground"
            >
              Salary Range
            </label>
            <input
              id="job-salary"
              name="salary"
              type="text"
              defaultValue={job?.salary ?? ""}
              placeholder="e.g. $150k - $200k"
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="job-description"
              className="block text-sm font-medium text-foreground"
            >
              Job Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="job-description"
              name="description"
              required
              rows={6}
              defaultValue={job?.description ?? ""}
              placeholder="Paste the full job description here..."
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart) resize-y"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Paste the full job description — our AI will analyze it for
              keywords and requirements.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
