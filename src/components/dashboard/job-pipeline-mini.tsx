"use client";

import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

interface JobPipelineMiniProps {
  counts: Record<string, number>;
}

const PIPELINE_STAGES = [
  {
    status: "SAVED",
    label: "Saved",
    barClass: "bg-muted-foreground/40",
    dotClass: "bg-muted-foreground/40",
  },
  {
    status: "APPLIED",
    label: "Applied",
    barClass: "bg-primary",
    dotClass: "bg-primary",
  },
  {
    status: "INTERVIEWING",
    label: "Interviewing",
    barClass: "bg-accent",
    dotClass: "bg-accent",
  },
  {
    status: "OFFER",
    label: "Offer",
    barClass: "bg-[oklch(0.55_0.15_145)]",
    dotClass: "bg-[oklch(0.55_0.15_145)]",
  },
] as const;

export function JobPipelineMini({ counts }: JobPipelineMiniProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const mainTotal = PIPELINE_STAGES.reduce(
    (sum, s) => sum + (counts[s.status] ?? 0),
    0
  );
  const rejected = counts["REJECTED"] ?? 0;
  const withdrawn = counts["WITHDRAWN"] ?? 0;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">Job Pipeline</h3>
        <div className="mt-4 flex flex-col items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No jobs tracked yet</p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            Add a job listing
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Job Pipeline</h3>
        <Link
          href="/jobs"
          className="rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-(--dur-state) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          View all
        </Link>
      </div>

      {/* Segmented bar */}
      {mainTotal > 0 && (
        <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
          {PIPELINE_STAGES.map((stage) => {
            const count = counts[stage.status] ?? 0;
            if (count === 0) return null;
            const pct = (count / mainTotal) * 100;
            return (
              <div
                key={stage.status}
                className={`${stage.barClass} transition-all duration-(--dur-layout)`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Stage labels */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = counts[stage.status] ?? 0;
          return (
            <div key={stage.status} className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${stage.dotClass}`}
                />
                <span className="text-lg font-bold text-foreground">
                  {count}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{stage.label}</p>
            </div>
          );
        })}
      </div>

      {/* Rejected/Withdrawn */}
      {(rejected > 0 || withdrawn > 0) && (
        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {rejected > 0 && <span>{rejected} rejected</span>}
          {withdrawn > 0 && <span>{withdrawn} withdrawn</span>}
        </div>
      )}
    </div>
  );
}
