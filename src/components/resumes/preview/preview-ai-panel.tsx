"use client";

import { useState, useCallback } from "react";
import {
  Sparkles,
  Check,
  X,
  ChevronDown,
  Send,
  Wand2,
  CheckCheck,
  FileText,
  Zap,
} from "lucide-react";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";
import { ChangeDiff } from "./change-diff";
import { InsightsTool } from "@/components/resumes/ai/insights-tool";
import type { PendingSuggestion } from "@/lib/preview-suggestions";
import type { ProfileData } from "@/lib/resume-resolver";
import type { ResumeContent, ResolvedResumeData } from "@/types/resume";

interface PreviewAIPanelProps {
  resumeId: string;
  content: ResumeContent;
  profile: ProfileData;
  resolvedData: ResolvedResumeData;
  jobAnalysis: Record<string, unknown> | null;
  userSkills: string[];
  pendingSuggestions: PendingSuggestion[];
  onDismissSuggestion: (id: string) => void;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}

export function PreviewAIPanel({
  resumeId,
  content,
  profile,
  resolvedData,
  jobAnalysis,
  userSkills,
  pendingSuggestions,
  onDismissSuggestion,
  onUpdateContent,
}: PreviewAIPanelProps) {
  return (
    <div className="px-4 py-3 space-y-3">
      {/* Pending suggestions from editor */}
      {pendingSuggestions.length > 0 && (
        <PendingSection
          suggestions={pendingSuggestions}
          resolvedData={resolvedData}
          content={content}
          onDismiss={onDismissSuggestion}
          onUpdateContent={onUpdateContent}
        />
      )}

      {/* Quick AI adjustments */}
      <CollapsibleSection title="Quick Adjustments" icon={Zap} defaultOpen>
        <QuickAdjustments
          resolvedData={resolvedData}
          profile={profile}
          jobAnalysis={jobAnalysis}
          content={content}
          onUpdateContent={onUpdateContent}
        />
      </CollapsibleSection>

      {/* Resume Review */}
      <CollapsibleSection title="Resume Review" icon={FileText}>
        <InsightsTool
          resolvedData={resolvedData}
          jobAnalysis={jobAnalysis}
          settingsOverrides={null}
        />
      </CollapsibleSection>

      {/* Custom AI request */}
      <CollapsibleSection title="Custom Request" icon={Wand2}>
        <CustomAdjustment
          resolvedData={resolvedData}
          onUpdateContent={onUpdateContent}
        />
      </CollapsibleSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pending Suggestions Section
// ---------------------------------------------------------------------------

function PendingSection({
  suggestions,
  resolvedData,
  content,
  onDismiss,
  onUpdateContent,
}: {
  suggestions: PendingSuggestion[];
  resolvedData: ResolvedResumeData;
  content: ResumeContent;
  onDismiss: (id: string) => void;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}) {
  const handleApply = useCallback(
    (suggestion: PendingSuggestion) => {
      if (suggestion.type === "summary") {
        onUpdateContent((prev) => ({
          ...prev,
          overrides: { ...prev.overrides, summary: suggestion.after },
        }));
      } else if (suggestion.type === "bullet" && suggestion.meta) {
        const expId = suggestion.meta.experienceId as string;
        const bulletIndex = suggestion.meta.bulletIndex as number;
        onUpdateContent((prev) => {
          const existing = prev.overrides.bulletOverrides ?? {};
          const bullets = [...(existing[expId] ?? [])];
          // Ensure the array is long enough
          const exp = resolvedData.experiences.find((e) => e.id === expId);
          if (exp) {
            while (bullets.length < exp.bullets.length) {
              bullets.push(exp.bullets[bullets.length]);
            }
          }
          bullets[bulletIndex] = suggestion.after;
          return {
            ...prev,
            overrides: {
              ...prev.overrides,
              bulletOverrides: { ...existing, [expId]: bullets },
            },
          };
        });
      }
      onDismiss(suggestion.id);
    },
    [onUpdateContent, onDismiss, resolvedData.experiences]
  );

  const handleApplyAll = useCallback(() => {
    suggestions.forEach((s) => handleApply(s));
  }, [suggestions, handleApply]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">
          Pending Suggestions
        </p>
        {suggestions.length > 1 && (
          <button
            type="button"
            onClick={handleApplyAll}
            className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent transition-colors hover:bg-accent/20"
          >
            <CheckCheck className="h-3 w-3" />
            Apply All
          </button>
        )}
      </div>

      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent capitalize">
              {suggestion.type}
            </span>
            <span className="text-[10px] text-muted-foreground truncate flex-1">
              {suggestion.label}
            </span>
          </div>

          <ChangeDiff before={suggestion.before} after={suggestion.after} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApply(suggestion)}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <Check className="h-3 w-3" />
              Apply
            </button>
            <button
              type="button"
              onClick={() => onDismiss(suggestion.id)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Adjustments
// ---------------------------------------------------------------------------

function QuickAdjustments({
  resolvedData,
  profile,
  jobAnalysis,
  content,
  onUpdateContent,
}: {
  resolvedData: ResolvedResumeData;
  profile: ProfileData;
  jobAnalysis: Record<string, unknown> | null;
  content: ResumeContent;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}) {
  return (
    <div className="space-y-2.5">
      {/* Polish Summary */}
      <PolishSummary
        resolvedData={resolvedData}
        profile={profile}
        jobAnalysis={jobAnalysis}
        onUpdateContent={onUpdateContent}
      />

      {/* Strengthen Bullets */}
      {resolvedData.experiences.length > 0 && (
        <StrengthenBullets
          resolvedData={resolvedData}
          jobAnalysis={jobAnalysis}
          onUpdateContent={onUpdateContent}
        />
      )}
    </div>
  );
}

function PolishSummary({
  resolvedData,
  profile,
  jobAnalysis,
  onUpdateContent,
}: {
  resolvedData: ResolvedResumeData;
  profile: ProfileData;
  jobAnalysis: Record<string, unknown> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}) {
  const { suggestion, isStreaming, error, suggest, clear } =
    useAISuggestion("SUMMARY_REWRITE");
  const [accepted, setAccepted] = useState(false);

  const handlePolish = useCallback(() => {
    setAccepted(false);
    suggest(
      {
        currentSummary: resolvedData.summary ?? "",
        profile,
        jobAnalysis,
      },
      undefined
    );
  }, [suggest, resolvedData.summary, profile, jobAnalysis]);

  const handleAccept = useCallback(() => {
    if (!suggestion) return;
    onUpdateContent((prev) => ({
      ...prev,
      overrides: { ...prev.overrides, summary: suggestion },
    }));
    setAccepted(true);
    clear();
  }, [suggestion, onUpdateContent, clear]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-foreground">
          Polish Summary
        </p>
        <button
          type="button"
          onClick={handlePolish}
          disabled={isStreaming}
          className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10 disabled:opacity-50"
        >
          <Sparkles className="h-2.5 w-2.5" />
          {isStreaming ? "Polishing..." : "Polish"}
        </button>
      </div>

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      {isStreaming && !suggestion && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Rewriting summary...
        </div>
      )}

      {suggestion && !accepted && (
        <div className="space-y-2">
          <ChangeDiff
            before={resolvedData.summary ?? ""}
            after={suggestion}
            label="Summary"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isStreaming}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => {
                clear();
                setAccepted(false);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Dismiss
            </button>
          </div>
        </div>
      )}

      {accepted && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
          Summary updated
        </p>
      )}
    </div>
  );
}

function StrengthenBullets({
  resolvedData,
  jobAnalysis,
  onUpdateContent,
}: {
  resolvedData: ResolvedResumeData;
  jobAnalysis: Record<string, unknown> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}) {
  const { suggestion, isStreaming, error, suggest, clear } =
    useAISuggestion("BULLET_IMPROVE");
  const [currentBullet, setCurrentBullet] = useState<{
    expId: string;
    index: number;
    original: string;
    expTitle: string;
    expCompany: string;
  } | null>(null);

  const handleImprove = useCallback(
    (
      expId: string,
      bulletIndex: number,
      bullet: string,
      title: string,
      company: string
    ) => {
      setCurrentBullet({
        expId,
        index: bulletIndex,
        original: bullet,
        expTitle: title,
        expCompany: company,
      });
      const keywords = jobAnalysis
        ? ((jobAnalysis as Record<string, unknown>).keywords as string[]) ?? []
        : [];
      suggest(
        {
          bullet,
          title,
          company,
          keywords,
        },
        undefined
      );
    },
    [suggest, jobAnalysis]
  );

  const handleAccept = useCallback(() => {
    if (!suggestion || !currentBullet) return;
    const { expId, index } = currentBullet;
    onUpdateContent((prev) => {
      const existing = prev.overrides.bulletOverrides ?? {};
      const exp = resolvedData.experiences.find((e) => e.id === expId);
      const bullets = [...(existing[expId] ?? [])];
      if (exp) {
        while (bullets.length < exp.bullets.length) {
          bullets.push(exp.bullets[bullets.length]);
        }
      }
      bullets[index] = suggestion;
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          bulletOverrides: { ...existing, [expId]: bullets },
        },
      };
    });
    clear();
    setCurrentBullet(null);
  }, [suggestion, currentBullet, onUpdateContent, resolvedData.experiences, clear]);

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-foreground">
        Strengthen Bullets
      </p>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Click any bullet to get an AI-improved version.
      </p>

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {resolvedData.experiences.map((exp) =>
          exp.bullets.map((bullet, i) => (
            <button
              key={`${exp.id}-${i}`}
              type="button"
              onClick={() =>
                handleImprove(exp.id, i, bullet, exp.title, exp.company)
              }
              disabled={isStreaming}
              className="w-full text-left rounded-md border border-border/30 bg-muted/10 px-2.5 py-1.5 text-[10px] text-muted-foreground leading-relaxed transition-colors hover:bg-muted/20 hover:text-foreground disabled:opacity-50"
            >
              <span className="text-[9px] font-medium text-foreground/60 block mb-0.5">
                {exp.company} — {exp.title}
              </span>
              • {bullet}
            </button>
          ))
        )}
      </div>

      {/* Show diff when suggestion is ready */}
      {currentBullet && (suggestion || isStreaming) && (
        <div className="space-y-2 mt-2">
          {isStreaming && !suggestion && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Improving bullet...
            </div>
          )}

          {suggestion && (
            <>
              <ChangeDiff
                before={currentBullet.original}
                after={suggestion}
                label={`${currentBullet.expCompany} — ${currentBullet.expTitle}`}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isStreaming}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setCurrentBullet(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom AI Request
// ---------------------------------------------------------------------------

function CustomAdjustment({
  resolvedData,
  onUpdateContent,
}: {
  resolvedData: ResolvedResumeData;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}) {
  const { suggestion, isStreaming, error, suggest, clear } =
    useAISuggestion("RESUME_ADJUSTMENT");
  const [instruction, setInstruction] = useState("");

  const handleSubmit = useCallback(() => {
    if (!instruction.trim()) return;
    suggest(
      {
        resume: resolvedData,
        instruction: instruction.trim(),
      },
      undefined
    );
  }, [suggest, resolvedData, instruction]);

  const handleAccept = useCallback(() => {
    if (!suggestion) return;
    // Apply as summary override (most common custom request target)
    onUpdateContent((prev) => ({
      ...prev,
      overrides: { ...prev.overrides, summary: suggestion },
    }));
    clear();
    setInstruction("");
  }, [suggestion, onUpdateContent, clear]);

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Describe what you&apos;d like to change and the AI will adjust your
        resume.
      </p>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="e.g. Make the summary more concise"
          disabled={isStreaming}
          className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isStreaming || !instruction.trim()}
          className="rounded-md bg-accent/10 p-1.5 text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      {isStreaming && !suggestion && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Adjusting...
        </div>
      )}

      {suggestion && (
        <div className="space-y-2">
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2.5">
            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Result
            </p>
            <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap">
              {suggestion}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isStreaming}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              Apply to Summary
            </button>
            <button
              type="button"
              onClick={() => {
                clear();
                setInstruction("");
              }}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
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

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border/60 bg-background/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 justify-between px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{title}</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-out-quart) ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
