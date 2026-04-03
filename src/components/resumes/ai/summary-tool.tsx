"use client";

import { useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";
import { AISuggestionInline } from "@/components/profile/ai-suggestion-inline";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import type { ResumeContent } from "@/types/resume";
import type { ProfileData } from "@/lib/resume-resolver";

interface SummaryToolProps {
  currentSummary: string | undefined;
  profile: ProfileData;
  jobAnalysis: Record<string, unknown> | null;
  settingsOverrides: Partial<AIGenerationSettings> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  onSendToPreview?: (type: string, before: string, after: string) => void;
}

export function SummaryTool({
  currentSummary,
  profile,
  jobAnalysis,
  settingsOverrides,
  onUpdateContent,
  onSendToPreview,
}: SummaryToolProps) {
  const {
    suggestion,
    isStreaming,
    error,
    suggest: suggestGenerate,
    clear: clearGenerate,
  } = useAISuggestion("SUMMARY");

  const {
    suggestion: rewriteSuggestion,
    isStreaming: isRewriting,
    error: rewriteError,
    suggest: suggestRewrite,
    clear: clearRewrite,
  } = useAISuggestion("SUMMARY_REWRITE");

  const handleGenerate = useCallback(() => {
    clearRewrite();
    suggestGenerate(
      { profile },
      settingsOverrides ?? undefined
    );
  }, [suggestGenerate, clearRewrite, profile, settingsOverrides]);

  const handleRewrite = useCallback(() => {
    clearGenerate();
    suggestRewrite(
      {
        currentSummary: currentSummary ?? "",
        profile,
        jobAnalysis,
      },
      settingsOverrides ?? undefined
    );
  }, [suggestRewrite, clearGenerate, currentSummary, profile, jobAnalysis, settingsOverrides]);

  const handleAccept = useCallback(
    (text: string) => {
      onUpdateContent((prev) => ({
        ...prev,
        overrides: { ...prev.overrides, summary: text },
      }));
      clearGenerate();
      clearRewrite();
    },
    [onUpdateContent, clearGenerate, clearRewrite]
  );

  const handleDismiss = useCallback(() => {
    clearGenerate();
    clearRewrite();
  }, [clearGenerate, clearRewrite]);

  const activeSuggestion = suggestion || rewriteSuggestion;
  const activeStreaming = isStreaming || isRewriting;
  const activeError = error || rewriteError;

  return (
    <div className="space-y-2">
      {/* Current summary preview */}
      {currentSummary && (
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {currentSummary}
        </p>
      )}
      {!currentSummary && (
        <p className="text-xs text-muted-foreground/60 italic">
          No summary yet
        </p>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={activeStreaming}
          className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10 disabled:opacity-50"
        >
          <Sparkles className="h-3 w-3" />
          Generate
        </button>
        {jobAnalysis && (
          <button
            type="button"
            onClick={handleRewrite}
            disabled={activeStreaming}
            className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            Rewrite for Job
          </button>
        )}
      </div>

      {/* Error */}
      {activeError && (
        <p className="text-[11px] text-destructive">{activeError}</p>
      )}

      {/* Streaming output */}
      {(activeSuggestion || activeStreaming) && (
        <AISuggestionInline
          suggestion={activeSuggestion}
          isStreaming={activeStreaming}
          onAccept={handleAccept}
          onDismiss={handleDismiss}
          onSendToPreview={
            onSendToPreview
              ? (text) =>
                  onSendToPreview("summary", currentSummary ?? "", text)
              : undefined
          }
        />
      )}
    </div>
  );
}
