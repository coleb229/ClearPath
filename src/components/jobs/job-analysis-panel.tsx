"use client";

import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  AlertTriangle,
  Briefcase,
  Target,
  Users,
  Loader2,
} from "lucide-react";
import { KeywordTags } from "@/components/jobs/keyword-tags";

interface JobAnalysis {
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  responsibilities?: string[];
  keywords?: string[];
  cultureSignals?: string[];
  experienceLevel?: string;
  redFlags?: string[];
}

interface JobAnalysisPanelProps {
  analysis: JobAnalysis | null;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  userSkills?: string[];
}

export function JobAnalysisPanel({
  analysis,
  isAnalyzing = false,
  onAnalyze,
  userSkills = [],
}: JobAnalysisPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["skills", "keywords"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  if (!analysis && !isAnalyzing) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
          <Sparkles className="h-4.5 w-4.5 text-accent" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">
          AI-powered analysis available
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Let AI extract key requirements, skills, and culture signals from this
          job description.
        </p>
        {onAnalyze && (
          <button
            type="button"
            onClick={onAnalyze}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze Job Description
          </button>
        )}
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Analyzing job description...
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          AI is extracting requirements, keywords, and culture signals.
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  const sections = [
    {
      id: "skills",
      icon: Target,
      title: "Required Skills",
      content: (
        <div className="space-y-3">
          {analysis.requiredSkills?.length ? (
            <KeywordTags
              keywords={analysis.requiredSkills}
              matchedSkills={userSkills}
              variant="hard"
              label="Required"
            />
          ) : null}
          {analysis.niceToHaveSkills?.length ? (
            <KeywordTags
              keywords={analysis.niceToHaveSkills}
              matchedSkills={userSkills}
              variant="soft"
              label="Nice to Have"
            />
          ) : null}
        </div>
      ),
    },
    {
      id: "keywords",
      icon: Sparkles,
      title: "Resume Keywords",
      content: analysis.keywords?.length ? (
        <KeywordTags
          keywords={analysis.keywords}
          matchedSkills={userSkills}
        />
      ) : (
        <p className="text-xs text-muted-foreground">No keywords extracted.</p>
      ),
    },
    {
      id: "responsibilities",
      icon: Briefcase,
      title: "Key Responsibilities",
      content: analysis.responsibilities?.length ? (
        <ul className="space-y-1.5">
          {analysis.responsibilities.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
              {r}
            </li>
          ))}
        </ul>
      ) : null,
    },
    {
      id: "culture",
      icon: Users,
      title: "Culture Signals",
      content: analysis.cultureSignals?.length ? (
        <ul className="space-y-1.5">
          {analysis.cultureSignals.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
              {s}
            </li>
          ))}
        </ul>
      ) : null,
    },
    ...(analysis.redFlags?.length
      ? [
          {
            id: "redflags",
            icon: AlertTriangle,
            title: "Red Flags",
            content: (
              <ul className="space-y-1.5">
                {analysis.redFlags!.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-destructive"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/50" />
                    {f}
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
  ];

  // Calculate match score
  const matchedCount = userSkills.filter((s) =>
    [...(analysis.requiredSkills ?? []), ...(analysis.keywords ?? [])].some(
      (k) => k.toLowerCase() === s.toLowerCase()
    )
  ).length;
  const totalRequired =
    (analysis.requiredSkills?.length ?? 0) + (analysis.keywords?.length ?? 0);
  const matchScore =
    totalRequired > 0 ? Math.round((matchedCount / totalRequired) * 100) : null;

  return (
    <div className="space-y-3">
      {/* Header with match score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">
            AI Analysis
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {analysis.experienceLevel && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {analysis.experienceLevel}
            </span>
          )}
          {matchScore !== null && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                matchScore >= 70
                  ? "bg-[oklch(0.55_0.15_145/0.1)] text-[oklch(0.55_0.15_145)]"
                  : matchScore >= 40
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
              }`}
            >
              {matchScore}% match
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) =>
        section.content ? (
          <div
            key={section.id}
            className="rounded-lg border border-border bg-card"
          >
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
            >
              <section.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {section.title}
              </span>
              <span className="flex-1" />
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-(--dur-layout) ease-(--ease-out-quart) ${
                  expandedSections.has(section.id) ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-(--dur-layout) ease-(--ease-out-quart) ${
                expandedSections.has(section.id)
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-3 pb-3">{section.content}</div>
              </div>
            </div>
          </div>
        ) : null
      )}

      {/* Re-analyze button */}
      {onAnalyze && (
        <button
          type="button"
          onClick={onAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
        >
          <Sparkles className="h-3 w-3" />
          Re-analyze
        </button>
      )}
    </div>
  );
}
