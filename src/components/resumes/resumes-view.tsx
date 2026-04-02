"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Search } from "lucide-react";
import { ResumeCard } from "@/components/resumes/resume-card";
import { ResumeForm } from "@/components/resumes/resume-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  createResume,
  deleteResume,
  duplicateResume,
  updateResume,
} from "@/app/(app)/resumes/actions";

interface Resume {
  id: string;
  title: string;
  status: string;
  templateName: string | null;
  jobTitle: string | null;
  jobCompany: string | null;
  updatedAt: Date;
}

interface ResumesViewProps {
  resumes: Resume[];
  jobs: Array<{ id: string; title: string; company: string }>;
  templates: Array<{ id: string; name: string; description: string | null }>;
}

export function ResumesView({ resumes, jobs, templates }: ResumesViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredResumes = searchQuery
    ? resumes.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resumes;

  const handleCreate = useCallback(
    async (formData: FormData) => {
      startTransition(async () => {
        const result = await createResume(formData);
        if (result.success) {
          router.push(`/resumes/${result.id}`);
        }
      });
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      setEditingId(id);
      setFormOpen(true);
    },
    []
  );

  const handleEditSubmit = useCallback(
    async (formData: FormData) => {
      if (!editingId) return;
      formData.set("id", editingId);
      startTransition(async () => {
        await updateResume(formData);
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
      await deleteResume(deleteTarget);
      setDeleteTarget(null);
    });
  }, [deleteTarget]);

  const handleDuplicate = useCallback((id: string) => {
    startTransition(async () => {
      await duplicateResume(id);
    });
  }, []);

  const handleStatusChange = useCallback(
    (id: string, status: string) => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("status", status);
      startTransition(async () => {
        await updateResume(formData);
      });
    },
    []
  );

  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setFormOpen(true);
  }, []);

  const editingResume = editingId
    ? resumes.find((r) => r.id === editingId)
    : null;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up animate-delay-1">
        {resumes.length > 0 && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resumes..."
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
          New Resume
        </button>
      </div>

      {/* Content */}
      {filteredResumes.length === 0 && !searchQuery ? (
        <EmptyState
          icon={FileText}
          title="Create your first resume"
          description="Build a professional resume from your profile. Pick a template, link a job listing, and let AI help you tailor it."
          action={{ label: "Create Resume", onClick: handleOpenCreate }}
        />
      ) : filteredResumes.length === 0 && searchQuery ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No resumes match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-up animate-delay-2">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
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
        <ResumeForm
          open={formOpen && !editingId}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingId(null);
          }}
          jobs={jobs}
          templates={templates}
          onSubmit={handleCreate}
        />
      )}

      {/* Edit title dialog */}
      {editingId && (
        <ResumeForm
          open={formOpen && !!editingId}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingId(null);
          }}
          jobs={[]}
          templates={[]}
          onSubmit={handleEditSubmit}
          defaultTitle={editingResume?.title ?? ""}
          editMode
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete resume?"
        description="This will permanently remove this resume. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  );
}
