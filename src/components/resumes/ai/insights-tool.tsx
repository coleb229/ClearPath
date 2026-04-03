"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, X, RotateCcw } from "lucide-react";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import type { ResolvedResumeData } from "@/types/resume";

interface SectionReview {
  rating: "strong" | "needs-work" | "weak";
  suggestions: string[];
}

interface ResumeReviewData {
  sections: Record<string, SectionReview>;
  overall: {
    strengths: string[];
    improvements: string[];
    keywordGaps: string[];
  };
  score: number;
}

/** Multi-pass JSON extraction that handles markdown code fences and raw JSON */
function extractReviewJSON(text: string): ResumeReviewData | null {
  // Strip markdown code fences if present
  let cleaned = text.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");

  // Try extracting the outermost JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    // Validate expected shape
    if (parsed.sections && parsed.overall && typeof parsed.score === "number") {
      return parsed as ResumeReviewData;
    }
  } catch {
    // Parsing failed
  }

  return null;
}

interface InsightsToolProps {
  resolvedData: ResolvedResumeData;
  jobAnalysis: Record<string, unknown> | null;
  settingsOverrides: Partial<AIGenerationSettings> | null;
}

const RATING_COLORS: Record<string, string> = {
  strong: "bg-emerald-500",
  "needs-work": "bg-amber-500",
  weak: "bg-red-500",
};

const RATING_LABELS: Record<string, string> = {
  strong: "Strong",
  "needs-work": "Needs work",
  weak: "Weak",
};

export function InsightsTool({
  resolvedData,
  jobAnalysis,
  settingsOverrides,
}: InsightsToolProps) {
  const { suggestion, isStreaming, error, suggest, clear } =
    useAISuggestion("RESUME_REVIEW");
  const [review, setReview] = useState<ResumeReviewData | null>(null);
  const [parseError, setParseError] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Parse JSON when streaming completes
  useEffect(() => {
    if (isStreaming || !suggestion) return;
    const parsed = extractReviewJSON(suggestion);
    if (parsed) {
      setReview(parsed);
      setParseError(false);
    } else {
      setParseError(true);
    }
  }, [suggestion, isStreaming]);

  const handleReview = useCallback(() => {
    setReview(null);
    setParseError(false);
    suggest(
      {
        resume: resolvedData,
        jobAnalysis,
      },
      settingsOverrides ?? undefined
    );
  }, [suggest, resolvedData, jobAnalysis, settingsOverrides]);

  const handleDismiss = useCallback(() => {
    clear();
    setReview(null);
    setParseError(false);
  }, [clear]);

  return (
    <div className="space-y-2.5">
      {/* Review button */}
      <button
        type="button"
        onClick={handleReview}
        disabled={isStreaming}
        className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10 disabled:opacity-50"
      >
        <Sparkles className="h-3 w-3" />
        {isStreaming ? "Reviewing..." : "Review Resume"}
      </button>

      {/* Error */}
      {error && <p className="text-[11px] text-destructive">{error}</p>}

      {/* Streaming indicator */}
      {isStreaming && !review && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Analyzing your resume...
        </div>
      )}

      {/* Parsed review results */}
      {review && (
        <div className="space-y-2.5">
          {/* Score */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted/40"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(review.score / 100) * 94.2} 94.2`}
                  strokeLinecap="round"
                  className={
                    review.score >= 70
                      ? "text-emerald-500"
                      : review.score >= 40
                        ? "text-amber-500"
                        : "text-red-500"
                  }
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                {review.score}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground">
                Resume Score
              </p>
              <p className="text-[10px] text-muted-foreground">
                {review.score >= 70
                  ? "Looking good"
                  : review.score >= 40
                    ? "Room to improve"
                    : "Needs attention"}
              </p>
            </div>
          </div>

          {/* Section ratings */}
          <div className="space-y-1">
            {Object.entries(review.sections).map(([key, section]) => (
              <div key={key} className="rounded-md border border-border/30 bg-muted/10">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection((prev) => (prev === key ? null : key))
                  }
                  className="flex w-full items-center gap-2 px-2.5 py-1.5"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${RATING_COLORS[section.rating] ?? "bg-muted"}`}
                  />
                  <span className="flex-1 text-left text-[11px] font-medium text-foreground capitalize">
                    {key}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {RATING_LABELS[section.rating] ?? section.rating}
                  </span>
                </button>

                {expandedSection === key && section.suggestions.length > 0 && (
                  <div className="border-t border-border/20 px-2.5 py-1.5 space-y-1">
                    {section.suggestions.map((s, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">
                        • {s}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall strengths */}
          {review.overall.strengths.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Strengths
              </p>
              {review.overall.strengths.map((s, i) => (
                <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">
                  • {s}
                </p>
              ))}
            </div>
          )}

          {/* Improvements */}
          {review.overall.improvements.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                To Improve
              </p>
              {review.overall.improvements.map((s, i) => (
                <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">
                  • {s}
                </p>
              ))}
            </div>
          )}

          {/* Keyword gaps */}
          {review.overall.keywordGaps.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Missing Keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {review.overall.keywordGaps.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dismiss */}
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors duration-(--dur-state) hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Dismiss
          </button>
        </div>
      )}

      {/* Friendly error if parsing failed */}
      {!isStreaming && parseError && !review && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
          <p className="text-[11px] text-foreground leading-relaxed">
            Couldn&apos;t parse the review results. This sometimes happens — try
            running it again.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReview}
              className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors duration-(--dur-state) hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
