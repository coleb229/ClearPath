"use client";

import { useState, useRef, useEffect } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Sparkles,
  Pencil,
  Trash2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  SAVED: {
    label: "Saved",
    className: "bg-muted text-muted-foreground",
  },
  APPLIED: {
    label: "Applied",
    className: "bg-primary/10 text-primary",
  },
  INTERVIEWING: {
    label: "Interviewing",
    className: "bg-accent/10 text-accent",
  },
  OFFER: {
    label: "Offer",
    className: "bg-[oklch(0.55_0.15_145/0.1)] text-[oklch(0.55_0.15_145)]",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground",
  },
};

const ALL_STATUSES = [
  "SAVED",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    salary: string | null;
    status: string;
    url: string | null;
    createdAt: Date;
    analysis: Record<string, unknown> | null;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onAnalyze: (id: string) => void;
  compact?: boolean;
}

export function JobCard({
  job,
  onEdit,
  onDelete,
  onStatusChange,
  onAnalyze,
  compact = false,
}: JobCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setStatusMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const status = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.SAVED;
  const matchScore = (job.analysis as Record<string, unknown>)?.matchScore as
    | number
    | undefined;

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:shadow-sm hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Company */}
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground truncate">
              {job.company}
            </span>
          </div>

          {/* Title */}
          <p className="mt-1 text-sm text-muted-foreground truncate">
            {job.title}
          </p>

          {/* Meta */}
          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {job.salary}
                </span>
              )}
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  View posting
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right side: status + match + menu */}
        <div className="flex items-center gap-2 shrink-0">
          {matchScore !== undefined && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                matchScore >= 70
                  ? "bg-[oklch(0.55_0.15_145/0.1)] text-[oklch(0.55_0.15_145)]"
                  : matchScore >= 40
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
              }`}
            >
              {matchScore}%
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-1 text-muted-foreground opacity-0 transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onEdit(job.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAnalyze(job.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Analyze with AI
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStatusMenuOpen((v) => !v)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Change Status
                    <span className="ml-auto text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                  {statusMenuOpen && (
                    <div className="absolute left-full top-0 ml-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                      {ALL_STATUSES.map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              onStatusChange(job.id, s);
                              setMenuOpen(false);
                              setStatusMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted ${
                              job.status === s
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${cfg.className}`}
                            />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => {
                    onDelete(job.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
