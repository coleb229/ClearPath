"use client";

import { useState, useCallback } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";
import { AISuggestionInline } from "@/components/profile/ai-suggestion-inline";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import type { ResumeContent } from "@/types/resume";
import type { ResolvedExperience } from "@/types/resume";

interface BulletToolProps {
  experiences: ResolvedExperience[];
  jobAnalysis: Record<string, unknown> | null;
  settingsOverrides: Partial<AIGenerationSettings> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  onSendToPreview?: (type: string, before: string, after: string, meta?: Record<string, unknown>) => void;
}

export function BulletTool({
  experiences,
  jobAnalysis,
  settingsOverrides,
  onUpdateContent,
  onSendToPreview,
}: BulletToolProps) {
  const [expandedExp, setExpandedExp] = useState<string | null>(null);

  if (experiences.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/60 italic">
        No experience entries to improve
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {experiences.map((exp) => (
        <ExperienceBlock
          key={exp.id}
          experience={exp}
          expanded={expandedExp === exp.id}
          onToggle={() =>
            setExpandedExp((prev) => (prev === exp.id ? null : exp.id))
          }
          jobAnalysis={jobAnalysis}
          settingsOverrides={settingsOverrides}
          onUpdateContent={onUpdateContent}
          onSendToPreview={onSendToPreview}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-experience block
// ---------------------------------------------------------------------------

function ExperienceBlock({
  experience,
  expanded,
  onToggle,
  jobAnalysis,
  settingsOverrides,
  onUpdateContent,
  onSendToPreview,
}: {
  experience: ResolvedExperience;
  expanded: boolean;
  onToggle: () => void;
  jobAnalysis: Record<string, unknown> | null;
  settingsOverrides: Partial<AIGenerationSettings> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  onSendToPreview?: (type: string, before: string, after: string, meta?: Record<string, unknown>) => void;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2.5 py-1.5"
      >
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[11px] font-medium text-foreground truncate">
            {experience.title}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {experience.company}
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
          {experience.bullets.length}
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-out-quart) ${
            expanded ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-border/30 px-2.5 py-2 space-y-1.5">
          {experience.bullets.length === 0 && (
            <p className="text-[10px] text-muted-foreground/60 italic">
              No bullets yet
            </p>
          )}
          {experience.bullets.map((bullet, index) => (
            <BulletRow
              key={index}
              bullet={bullet}
              index={index}
              experience={experience}
              jobAnalysis={jobAnalysis}
              settingsOverrides={settingsOverrides}
              onUpdateContent={onUpdateContent}
              onSendToPreview={onSendToPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual bullet row with improve
// ---------------------------------------------------------------------------

function BulletRow({
  bullet,
  index,
  experience,
  jobAnalysis,
  settingsOverrides,
  onUpdateContent,
  onSendToPreview,
}: {
  bullet: string;
  index: number;
  experience: ResolvedExperience;
  jobAnalysis: Record<string, unknown> | null;
  settingsOverrides: Partial<AIGenerationSettings> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  onSendToPreview?: (type: string, before: string, after: string, meta?: Record<string, unknown>) => void;
}) {
  const { suggestion, isStreaming, suggest, clear } =
    useAISuggestion("BULLET_IMPROVE");

  const handleImprove = useCallback(() => {
    const keywords = jobAnalysis
      ? ((jobAnalysis as Record<string, unknown>).keywords as string[] | undefined)
      : undefined;

    suggest(
      {
        bullet,
        title: experience.title,
        company: experience.company,
        keywords,
      },
      settingsOverrides ?? undefined
    );
  }, [suggest, bullet, experience.title, experience.company, jobAnalysis, settingsOverrides]);

  const handleAccept = useCallback(
    (text: string) => {
      onUpdateContent((prev) => {
        const existing = prev.overrides.bulletOverrides?.[experience.id] ?? [
          ...experience.bullets,
        ];
        const updated = [...existing];
        updated[index] = text;
        return {
          ...prev,
          overrides: {
            ...prev.overrides,
            bulletOverrides: {
              ...prev.overrides.bulletOverrides,
              [experience.id]: updated,
            },
          },
        };
      });
      clear();
    },
    [onUpdateContent, experience.id, experience.bullets, index, clear]
  );

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-1.5">
        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
        <p className="flex-1 text-[11px] text-foreground/80 leading-relaxed line-clamp-2">
          {bullet}
        </p>
        <button
          type="button"
          onClick={handleImprove}
          disabled={isStreaming}
          className="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-accent transition-colors duration-(--dur-state) hover:bg-accent/10 disabled:opacity-50"
        >
          <Sparkles className="h-2.5 w-2.5" />
          Improve
        </button>
      </div>

      {(suggestion || isStreaming) && (
        <div className="ml-2.5">
          <AISuggestionInline
            suggestion={suggestion}
            isStreaming={isStreaming}
            onAccept={handleAccept}
            onDismiss={clear}
            onSendToPreview={
              onSendToPreview
                ? (text) =>
                    onSendToPreview("bullet", bullet, text, {
                      experienceId: experience.id,
                      bulletIndex: index,
                    })
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
