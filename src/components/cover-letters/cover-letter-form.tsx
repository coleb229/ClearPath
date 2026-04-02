"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface CoverLetterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: Array<{ id: string; title: string; company: string }>;
  onSubmit: (formData: FormData) => Promise<void>;
  defaultTitle?: string;
  editMode?: boolean;
}

export function CoverLetterForm({
  open,
  onOpenChange,
  jobs,
  onSubmit,
  defaultTitle = "",
  editMode = false,
}: CoverLetterFormProps) {
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
      await onSubmit(formData);
      setSubmitting(false);
      onOpenChange(false);
      formRef.current.reset();
    },
    [onSubmit, onOpenChange]
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto max-w-md w-full bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95"
    >
      <div className="rounded-xl bg-card p-6 shadow-lg border border-border">
        <h2 className="text-base font-semibold text-foreground">
          {editMode ? "Edit Cover Letter" : "Create Cover Letter"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {editMode
            ? "Update cover letter details."
            : "Write a personalized cover letter for a job application."}
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="cl-title"
              className="block text-sm font-medium text-foreground"
            >
              Title
            </label>
            <input
              id="cl-title"
              name="title"
              type="text"
              defaultValue={defaultTitle}
              placeholder="e.g. Google Software Engineer Cover Letter"
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
            />
          </div>

          {/* Link to Job */}
          {!editMode && jobs.length > 0 && (
            <div>
              <label
                htmlFor="cl-job"
                className="block text-sm font-medium text-foreground"
              >
                Link to Job
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (recommended)
                </span>
              </label>
              <select
                id="cl-job"
                name="jobListingId"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
              >
                <option value="">No job selected</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} at {j.company}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Link a job to let AI generate a tailored cover letter.
              </p>
            </div>
          )}

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
                ? "Creating..."
                : editMode
                  ? "Save Changes"
                  : "Create Cover Letter"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
