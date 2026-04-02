"use client";

import { useState } from "react";
import { ChevronDown, Briefcase } from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";

const PIPELINE_COLUMNS = [
  {
    status: "SAVED",
    label: "Saved",
    accentColor: "bg-muted-foreground/40",
  },
  {
    status: "APPLIED",
    label: "Applied",
    accentColor: "bg-primary",
  },
  {
    status: "INTERVIEWING",
    label: "Interviewing",
    accentColor: "bg-accent",
  },
  {
    status: "OFFER",
    label: "Offer",
    accentColor: "bg-[oklch(0.55_0.15_145)]",
  },
] as const;

const ARCHIVE_STATUSES = [
  { status: "REJECTED", label: "Rejected" },
  { status: "WITHDRAWN", label: "Withdrawn" },
] as const;

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  status: string;
  url: string | null;
  createdAt: Date;
  analysis: Record<string, unknown> | null;
}

interface JobPipelineProps {
  jobs: Job[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onAnalyze: (id: string) => void;
}

export function JobPipeline({
  jobs,
  onEdit,
  onDelete,
  onStatusChange,
  onAnalyze,
}: JobPipelineProps) {
  const [archiveExpanded, setArchiveExpanded] = useState(false);

  const jobsByStatus = (status: string) =>
    jobs.filter((j) => j.status === status);

  const archivedCount =
    jobsByStatus("REJECTED").length + jobsByStatus("WITHDRAWN").length;

  return (
    <div className="space-y-4">
      {/* Pipeline columns */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {PIPELINE_COLUMNS.map((col, i) => {
          const columnJobs = jobsByStatus(col.status);
          return (
            <div
              key={col.status}
              className={`min-w-[280px] flex-1 rounded-xl border border-border bg-card/50 p-4 animate-fade-up animate-delay-${i + 1}`}
            >
              {/* Column accent bar */}
              <div className={`h-0.5 rounded-full ${col.accentColor} mb-3`} />

              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {col.label}
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {columnJobs.length}
                </span>
              </div>

              {/* Cards */}
              {columnJobs.length > 0 ? (
                <div className="space-y-3">
                  {columnJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      onAnalyze={onAnalyze}
                      compact
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <Briefcase className="mx-auto h-4 w-4 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    No jobs here yet
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Archived section */}
      {archivedCount > 0 && (
        <div className="rounded-xl border border-border bg-card/50">
          <button
            type="button"
            onClick={() => setArchiveExpanded((v) => !v)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-muted-foreground">
              Archived
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {archivedCount}
            </span>
            <span className="flex-1" />
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-(--dur-layout) ease-(--ease-out-quart) ${
                archiveExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-(--dur-layout) ease-(--ease-out-quart) ${
              archiveExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3">
                {ARCHIVE_STATUSES.flatMap(({ status }) =>
                  jobsByStatus(status).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      onAnalyze={onAnalyze}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
