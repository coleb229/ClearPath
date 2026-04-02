"use client";

import { Target } from "lucide-react";

interface MatchScoreProps {
  score: number;
  className?: string;
}

export function MatchScore({ score, className = "" }: MatchScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const colorClass =
    clampedScore >= 70
      ? "text-[oklch(0.55_0.15_145)]"
      : clampedScore >= 40
        ? "text-primary"
        : "text-destructive";

  const bgClass =
    clampedScore >= 70
      ? "bg-[oklch(0.55_0.15_145/0.1)]"
      : clampedScore >= 40
        ? "bg-primary/10"
        : "bg-destructive/10";

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${bgClass} ${className}`}
    >
      <Target className={`h-4 w-4 ${colorClass}`} />
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${colorClass}`}>
          {clampedScore}% match
        </span>
        <span className="text-xs text-muted-foreground">
          {clampedScore >= 70
            ? "Strong fit"
            : clampedScore >= 40
              ? "Moderate fit"
              : "Needs tailoring"}
        </span>
      </div>
    </div>
  );
}

export function calculateMatchScore(
  skills: string[],
  analysis: Record<string, unknown> | null
): number {
  if (!analysis) return 0;

  const requiredSkills = (analysis.requiredSkills as string[]) ?? [];
  const keywords = (analysis.keywords as string[]) ?? [];
  const allTargets = [...requiredSkills, ...keywords].map((s) =>
    s.toLowerCase().trim()
  );

  if (allTargets.length === 0) return 0;

  const userSkills = new Set(skills.map((s) => s.toLowerCase().trim()));
  const matched = allTargets.filter((t) => userSkills.has(t)).length;

  return Math.round((matched / allTargets.length) * 100);
}
