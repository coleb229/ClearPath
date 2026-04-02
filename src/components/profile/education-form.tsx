"use client";

import { useState, useTransition } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { SortableList, DragHandle } from "@/components/ui/sortable-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducations,
} from "@/app/(app)/profile/actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  gpa: string | null;
  description: string | null;
  order: number;
}

interface EducationFormProps {
  educations: Education[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMonthValue(date: Date | null | undefined): string {
  if (!date) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

const inputClasses =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors duration-(--dur-state)";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EducationForm({ educations }: EducationFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReorder(orderedIds: string[]) {
    startTransition(() => {
      reorderEducations(orderedIds);
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteEducation(deleteId);
      setDeleteId(null);
    });
  }

  // Empty state
  if (educations.length === 0 && editingId !== "new") {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No education yet"
        description="Add your educational background"
        action={{
          label: "Add Education",
          onClick: () => setEditingId("new"),
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SortableList
        items={educations}
        keyExtractor={(edu) => edu.id}
        onReorder={handleReorder}
        renderItem={(edu) =>
          editingId === edu.id ? (
            <EducationEditForm
              education={edu}
              onCancel={() => setEditingId(null)}
              onSaved={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
              <DragHandle />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {edu.degree}
                  {edu.field ? ` ${edu.field}` : ""}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {edu.institution}
                  <span className="mx-1.5 opacity-40">&middot;</span>
                  {formatDate(edu.startDate)} &ndash;{" "}
                  {edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(edu.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors duration-(--dur-state) hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(edu.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors duration-(--dur-state) hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        }
      />

      {editingId === "new" && (
        <EducationEditForm
          onCancel={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      )}

      {editingId !== "new" && (
        <button
          type="button"
          onClick={() => setEditingId("new")}
          className="flex items-center gap-1.5 self-start text-sm font-medium text-primary transition-colors duration-(--dur-state) hover:text-primary/80"
        >
          <Plus className="h-4 w-4" />
          Add Education
        </button>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete education"
        description="This education entry will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit / Add form
// ---------------------------------------------------------------------------

function EducationEditForm({
  education,
  onCancel,
  onSaved,
}: {
  education?: Education;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (education) {
      formData.set("id", education.id);
    }

    startTransition(async () => {
      const action = education ? updateEducation : createEducation;
      const result = await action(formData);
      if (result.success) {
        onSaved();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-background p-4"
    >
      <div className="flex flex-col gap-4">
        {/* Row 1: Institution + Degree */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">
              Institution *
            </label>
            <input
              name="institution"
              required
              defaultValue={education?.institution ?? ""}
              placeholder="University of California"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">
              Degree *
            </label>
            <input
              name="degree"
              required
              defaultValue={education?.degree ?? ""}
              placeholder="B.S."
              className={inputClasses}
            />
          </div>
        </div>

        {/* Row 2: Field of Study + GPA */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">
              Field of Study
            </label>
            <input
              name="field"
              defaultValue={education?.field ?? ""}
              placeholder="Computer Science"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">
              GPA
            </label>
            <input
              name="gpa"
              defaultValue={education?.gpa ?? ""}
              placeholder="3.8"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Row 3: Date Range */}
        <DateRangePicker
          startDate={formatMonthValue(education?.startDate)}
          endDate={formatMonthValue(education?.endDate)}
          current={education?.current ?? false}
          startName="startDate"
          endName="endDate"
          currentName="current"
        />

        {/* Row 4: Description */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-muted-foreground mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            defaultValue={education?.description ?? ""}
            placeholder="Relevant coursework, honors, activities..."
            className={inputClasses + " resize-none"}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-(--dur-state) hover:bg-secondary/80"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
