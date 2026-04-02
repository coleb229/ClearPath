"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Mail, Search } from "lucide-react";
import { CoverLetterCard } from "@/components/cover-letters/cover-letter-card";
import { CoverLetterForm } from "@/components/cover-letters/cover-letter-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  createCoverLetter,
  deleteCoverLetter,
  duplicateCoverLetter,
  updateCoverLetter,
} from "@/app/(app)/cover-letters/actions";

interface CoverLetter {
  id: string;
  title: string;
  status: string;
  jobTitle: string | null;
  jobCompany: string | null;
  hasContent: boolean;
  updatedAt: Date;
}

interface CoverLettersViewProps {
  coverLetters: CoverLetter[];
  jobs: Array<{ id: string; title: string; company: string }>;
}

export function CoverLettersView({
  coverLetters,
  jobs,
}: CoverLettersViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredCoverLetters = searchQuery
    ? coverLetters.filter((cl) =>
        cl.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coverLetters;

  const handleCreate = useCallback(
    async (formData: FormData) => {
      startTransition(async () => {
        const result = await createCoverLetter(formData);
        if (result.success) {
          router.push(`/cover-letters/${result.id}`);
        }
      });
    },
    [router]
  );

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setFormOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (formData: FormData) => {
      if (!editingId) return;
      formData.set("id", editingId);
      startTransition(async () => {
        await updateCoverLetter(formData);
        setEditingId(null);
      });
    },
    [editingId]
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteCoverLetter(deleteTarget);
      setDeleteTarget(null);
    });
  }, [deleteTarget]);

  const handleDuplicate = useCallback((id: string) => {
    startTransition(async () => {
      await duplicateCoverLetter(id);
    });
  }, []);

  const handleStatusChange = useCallback((id: string, status: string) => {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("status", status);
    startTransition(async () => {
      await updateCoverLetter(formData);
    });
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setFormOpen(true);
  }, []);

  const editingCoverLetter = editingId
    ? coverLetters.find((cl) => cl.id === editingId)
    : null;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up animate-delay-1">
        {coverLetters.length > 0 && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cover letters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-primary/90 disabled:opacity-50 ml-auto"
        >
          <Plus className="h-4 w-4" />
          New Cover Letter
        </button>
      </div>

      {/* Content */}
      {filteredCoverLetters.length === 0 && !searchQuery ? (
        <EmptyState
          icon={Mail}
          title="Create your first cover letter"
          description="Write a personalized cover letter from your profile. Link a job listing and let AI draft it for you."
          action={{ label: "Create Cover Letter", onClick: handleOpenCreate }}
        />
      ) : filteredCoverLetters.length === 0 && searchQuery ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No cover letters match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-up animate-delay-2">
          {filteredCoverLetters.map((cl) => (
            <CoverLetterCard
              key={cl.id}
              coverLetter={cl}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Create form dialog */}
      {!editingId && (
        <CoverLetterForm
          open={formOpen && !editingId}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingId(null);
          }}
          jobs={jobs}
          onSubmit={handleCreate}
        />
      )}

      {/* Edit title dialog */}
      {editingId && (
        <CoverLetterForm
          open={formOpen && !!editingId}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingId(null);
          }}
          jobs={[]}
          onSubmit={handleEditSubmit}
          defaultTitle={editingCoverLetter?.title ?? ""}
          editMode
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete cover letter?"
        description="This will permanently remove this cover letter. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  );
}
