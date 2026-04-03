"use client";

import { useState, useTransition } from "react";
import { Briefcase, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { SortableList, DragHandle } from "@/components/ui/sortable-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { AISuggestionInline } from "./ai-suggestion-inline";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";
import { GenerationSettingsPopover } from "@/components/ai/generation-settings-popover";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
} from "@/app/(app)/profile/actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Experience {
  id: string;
  company: string;
  title: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  description: string | null;
  bullets: string[] | null;
  order: number;
}

interface ExperienceFormProps {
  experiences: Experience[];
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

export function ExperienceForm({ experiences }: ExperienceFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReorder(orderedIds: string[]) {
    startTransition(() => {
      reorderExperiences(orderedIds);
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteExperience(deleteId);
      setDeleteId(null);
    });
  }

  // Empty state
  if (experiences.length === 0 && editingId !== "new") {
    return (
      <EmptyState
        icon={Briefcase}
        title="No experience yet"
        description="Add your work history to build a stronger profile"
        action={{
          label: "Add Experience",
          onClick: () => setEditingId("new"),
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SortableList
        items={experiences}
        keyExtractor={(exp) => exp.id}
        onReorder={handleReorder}
        renderItem={(exp) =>
          editingId === exp.id ? (
            <ExperienceEditForm
              experience={exp}
              onCancel={() => setEditingId(null)}
              onSaved={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
              <DragHandle />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {exp.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {exp.company}
                  <span className="mx-1.5 opacity-40">&middot;</span>
                  {formatDate(exp.startDate)} &ndash;{" "}
                  {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(exp.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors duration-(--dur-state) hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(exp.id)}
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
        <ExperienceEditForm
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
          Add Experience
        </button>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete experience"
        description="This experience entry will be permanently removed. This action cannot be undone."
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

function ExperienceEditForm({
  experience,
  onCancel,
  onSaved,
}: {
  experience?: Experience;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [bullets, setBullets] = useState<string[]>(
    experience?.bullets?.length ? experience.bullets : [""]
  );
  const [activeBulletIndex, setActiveBulletIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { suggestion, isStreaming, suggest, clear } = useAISuggestion("BULLET_POINT");
  const [settingsOverrides, setSettingsOverrides] = useState<Partial<AIGenerationSettings> | null>(null);

  function handleImprove(index: number, bulletText: string, title: string, company: string) {
    setActiveBulletIndex(index);
    clear();
    suggest({ title, company, description: bulletText }, settingsOverrides ?? undefined);
  }

  function handleAcceptSuggestion(text: string) {
    if (activeBulletIndex !== null) {
      setBullets((prev) => {
        const next = [...prev];
        next[activeBulletIndex] = text;
        return next;
      });
    }
    setActiveBulletIndex(null);
    clear();
  }

  function handleDismissSuggestion() {
    setActiveBulletIndex(null);
    clear();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Filter out empty bullets
    const nonEmpty = bullets.filter((b) => b.trim() !== "");
    if (nonEmpty.length > 0) {
      formData.set("bullets", JSON.stringify(nonEmpty));
    }

    if (experience) {
      formData.set("id", experience.id);
    }

    startTransition(async () => {
      const action = experience ? updateExperience : createExperience;
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
        {/* Row 1: Title + Company */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">
              Job Title *
            </label>
            <input
              name="title"
              required
              defaultValue={experience?.title ?? ""}
              placeholder="Software Engineer"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-muted-foreground mb-1">
              Company *
            </label>
            <input
              name="company"
              required
              defaultValue={experience?.company ?? ""}
              placeholder="Acme Inc."
              className={inputClasses}
            />
          </div>
        </div>

        {/* Row 2: Location */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-muted-foreground mb-1">
            Location
          </label>
          <input
            name="location"
            defaultValue={experience?.location ?? ""}
            placeholder="San Francisco, CA"
            className={inputClasses}
          />
        </div>

        {/* Row 3: Date Range */}
        <DateRangePicker
          startDate={formatMonthValue(experience?.startDate)}
          endDate={formatMonthValue(experience?.endDate)}
          current={experience?.current ?? false}
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
            defaultValue={experience?.description ?? ""}
            placeholder="Brief overview of your role..."
            className={inputClasses + " resize-none"}
          />
        </div>

        {/* Row 5: Bullets */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Key Achievements
            </label>
            <GenerationSettingsPopover
              value={settingsOverrides}
              onChange={setSettingsOverrides}
            />
          </div>
          {bullets.map((bullet, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  value={bullet}
                  onChange={(e) => {
                    const next = [...bullets];
                    next[index] = e.target.value;
                    setBullets(next);
                  }}
                  placeholder="Describe an achievement or responsibility..."
                  className={inputClasses + " flex-1"}
                />
                <button
                  type="button"
                  onClick={() => {
                    const form = document.querySelector("form") as HTMLFormElement;
                    const title =
                      (form?.querySelector("[name=title]") as HTMLInputElement)?.value ?? "";
                    const company =
                      (form?.querySelector("[name=company]") as HTMLInputElement)?.value ?? "";
                    handleImprove(index, bullet, title, company);
                  }}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-accent transition-colors duration-(--dur-state) hover:bg-accent/10"
                >
                  <Sparkles className="h-3 w-3" />
                  Improve
                </button>
                {bullets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setBullets((prev) => prev.filter((_, i) => i !== index))}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors duration-(--dur-state) hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              {activeBulletIndex === index && (suggestion || isStreaming) && (
                <AISuggestionInline
                  suggestion={suggestion}
                  isStreaming={isStreaming}
                  onAccept={handleAcceptSuggestion}
                  onDismiss={handleDismissSuggestion}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBullets((prev) => [...prev, ""])}
            className="flex items-center gap-1 self-start text-sm text-primary transition-colors duration-(--dur-state) hover:text-primary/80"
          >
            <Plus className="h-3.5 w-3.5" />
            Add bullet
          </button>
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
