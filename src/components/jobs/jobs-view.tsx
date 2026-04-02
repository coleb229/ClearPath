"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { JobPipeline } from "@/components/jobs/job-pipeline";
import { JobCard } from "@/components/jobs/job-card";
import { JobForm } from "@/components/jobs/job-form";
import { JobAnalysisPanel } from "@/components/jobs/job-analysis-panel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  createJobListing,
  updateJobListing,
  deleteJobListing,
  updateJobStatus,
  saveJobAnalysis,
} from "@/app/(app)/jobs/actions";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  salary: string | null;
  status: string;
  url: string | null;
  createdAt: Date;
  analysis: Record<string, unknown> | null;
}

interface JobsViewProps {
  jobs: Job[];
  userSkills: string[];
}

type ViewMode = "pipeline" | "list";

export function JobsView({ jobs, userSkills }: JobsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;

  const filteredJobs = searchQuery
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs;

  const handleCreate = useCallback(
    async (formData: FormData) => {
      startTransition(async () => {
        await createJobListing(formData);
      });
    },
    []
  );

  const handleUpdate = useCallback(
    async (formData: FormData) => {
      startTransition(async () => {
        await updateJobListing(formData);
        setEditingJob(null);
      });
    },
    []
  );

  const handleEdit = useCallback(
    (id: string) => {
      const job = jobs.find((j) => j.id === id);
      if (job) {
        setEditingJob(job);
        setFormOpen(true);
      }
    },
    [jobs]
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteJobListing(deleteTarget);
      setDeleteTarget(null);
      if (selectedJobId === deleteTarget) setSelectedJobId(null);
    });
  }, [deleteTarget, selectedJobId]);

  const handleStatusChange = useCallback(
    (id: string, status: string) => {
      startTransition(async () => {
        await updateJobStatus(id, status);
      });
    },
    []
  );

  const handleAnalyze = useCallback(
    async (id: string) => {
      const job = jobs.find((j) => j.id === id);
      if (!job) return;

      setSelectedJobId(id);
      setAnalyzingId(id);

      try {
        const res = await fetch("/api/ai/analyze-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: job.title,
            company: job.company,
            description: job.description,
          }),
        });

        if (!res.ok) throw new Error("Analysis failed");

        const data = await res.json();
        startTransition(async () => {
          await saveJobAnalysis(id, data.analysis);
        });
      } catch {
        // Error handled silently — user can retry
      } finally {
        setAnalyzingId(null);
      }
    },
    [jobs]
  );

  const handleOpenCreate = useCallback(() => {
    setEditingJob(null);
    setFormOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up animate-delay-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-(--dur-state) ease-(--ease-out-quart) ${
                viewMode === "pipeline"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-(--dur-state) ease-(--ease-out-quart) ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Job
          </button>
        </div>
      </div>

      {/* Main content */}
      {filteredJobs.length === 0 && !searchQuery ? (
        <EmptyState
          icon={() => (
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          )}
          title="Start tracking your job search"
          description="Add job listings to organize your applications and let AI analyze them for you. We'll help you find the best matches for your skills."
          action={{ label: "Add Your First Job", onClick: handleOpenCreate }}
        />
      ) : filteredJobs.length === 0 && searchQuery ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No jobs match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Main area */}
          <div className="min-w-0 flex-1">
            {viewMode === "pipeline" ? (
              <JobPipeline
                jobs={filteredJobs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onAnalyze={handleAnalyze}
              />
            ) : (
              <div className="space-y-3 animate-fade-up animate-delay-2">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`cursor-pointer rounded-xl transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
                      selectedJobId === job.id
                        ? "ring-2 ring-primary/30"
                        : ""
                    }`}
                  >
                    <JobCard
                      job={job}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      onAnalyze={handleAnalyze}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis sidebar (list view only) */}
          {viewMode === "list" && selectedJob && (
            <div className="hidden lg:block w-80 shrink-0 animate-fade-up">
              <div className="sticky top-8 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedJob.company}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedJob.title}
                  </p>
                </div>
                <JobAnalysisPanel
                  analysis={selectedJob.analysis as Record<string, unknown> | null}
                  isAnalyzing={analyzingId === selectedJob.id}
                  onAnalyze={() => handleAnalyze(selectedJob.id)}
                  userSkills={userSkills}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form dialog */}
      <JobForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingJob(null);
        }}
        job={editingJob}
        onSubmit={editingJob ? handleUpdate : handleCreate}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete job listing?"
        description="This will permanently remove the job listing and any associated analysis. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  );
}
