"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, Plus, X } from "lucide-react";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import type { ResumeContent } from "@/types/resume";
import type { ResolvedExperience } from "@/types/resume";

interface SuggestedSkill {
  name: string;
  category: string;
  reason: string;
}

interface SkillsToolProps {
  experiences: ResolvedExperience[];
  currentSkills: string[];
  content: ResumeContent;
  jobAnalysis: Record<string, unknown> | null;
  settingsOverrides: Partial<AIGenerationSettings> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}

export function SkillsTool({
  experiences,
  currentSkills,
  jobAnalysis,
  settingsOverrides,
}: SkillsToolProps) {
  const { suggestion, isStreaming, error, suggest, clear } =
    useAISuggestion("SKILLS_SUGGEST");
  const [parsedSkills, setParsedSkills] = useState<SuggestedSkill[]>([]);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  // Parse streaming JSON as it comes in
  useEffect(() => {
    if (!suggestion) {
      setParsedSkills([]);
      return;
    }
    try {
      // Try to extract JSON array from the response
      const jsonMatch = suggestion.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as SuggestedSkill[];
        setParsedSkills(parsed);
      }
    } catch {
      // Still streaming, JSON incomplete — that's fine
    }
  }, [suggestion]);

  const handleSuggest = useCallback(() => {
    setParsedSkills([]);
    setAddedSkills(new Set());
    suggest(
      {
        experiences,
        currentSkills,
        jobAnalysis,
      },
      settingsOverrides ?? undefined
    );
  }, [suggest, experiences, currentSkills, jobAnalysis, settingsOverrides]);

  const handleDismiss = useCallback(() => {
    clear();
    setParsedSkills([]);
  }, [clear]);

  // Mark a skill as "noted" (visual feedback — actual profile skill creation
  // would require a server action, so for now we just track it visually)
  const handleAddSkill = useCallback((name: string) => {
    setAddedSkills((prev) => new Set(prev).add(name));
  }, []);

  // Keyword match chips (when job is linked)
  const jobKeywords = jobAnalysis
    ? ((jobAnalysis as Record<string, unknown>).keywords as string[] | undefined) ?? []
    : [];
  const matchedKeywords = jobKeywords.filter((kw) =>
    currentSkills.some((s) => s.toLowerCase().includes(kw.toLowerCase()))
  );
  const missingKeywords = jobKeywords.filter(
    (kw) =>
      !currentSkills.some((s) => s.toLowerCase().includes(kw.toLowerCase()))
  );

  return (
    <div className="space-y-2.5">
      {/* Keyword match overview (job-linked only) */}
      {jobKeywords.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Keyword Match
          </p>
          <div className="flex flex-wrap gap-1">
            {matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
              >
                {kw}
              </span>
            ))}
            {missingKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
              >
                {kw}
              </span>
            ))}
          </div>
          {missingKeywords.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500/60 mr-1" />
              {missingKeywords.length} missing keyword{missingKeywords.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Suggest button */}
      <button
        type="button"
        onClick={handleSuggest}
        disabled={isStreaming}
        className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10 disabled:opacity-50"
      >
        <Sparkles className="h-3 w-3" />
        {isStreaming ? "Analyzing..." : "Suggest Skills"}
      </button>

      {/* Error */}
      {error && <p className="text-[11px] text-destructive">{error}</p>}

      {/* Streaming indicator */}
      {isStreaming && parsedSkills.length === 0 && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Analyzing your experience...
        </div>
      )}

      {/* Suggested skills */}
      {parsedSkills.length > 0 && (
        <div className="space-y-1.5">
          {parsedSkills.map((skill) => {
            const isAdded = addedSkills.has(skill.name);
            return (
              <div
                key={skill.name}
                className="flex items-start gap-2 rounded-md border border-border/40 bg-muted/20 px-2.5 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-foreground">
                      {skill.name}
                    </span>
                    <span className="rounded-full bg-muted px-1.5 py-px text-[9px] text-muted-foreground">
                      {skill.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed">
                    {skill.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSkill(skill.name)}
                  disabled={isAdded}
                  className={`shrink-0 rounded p-1 transition-colors duration-(--dur-state) ${
                    isAdded
                      ? "text-emerald-500"
                      : "text-muted-foreground hover:text-accent hover:bg-accent/10"
                  }`}
                  title={isAdded ? "Noted" : "Note skill"}
                >
                  {isAdded ? (
                    <span className="text-[10px] font-medium">Added</span>
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </button>
              </div>
            );
          })}

          {/* Dismiss */}
          {!isStreaming && (
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors duration-(--dur-state) hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
