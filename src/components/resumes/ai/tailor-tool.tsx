"use client";

import { useCallback } from "react";
import { Sparkles } from "lucide-react";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";
import { AISuggestionInline } from "@/components/profile/ai-suggestion-inline";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import type { ResumeContent, ResolvedResumeData } from "@/types/resume";

interface TailorToolProps {
  resolvedData: ResolvedResumeData;
  jobAnalysis: Record<string, unknown>;
  settingsOverrides: Partial<AIGenerationSettings> | null;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  onSendToPreview?: (type: string, before: string, after: string) => void;
}

export function TailorTool({
  resolvedData,
  jobAnalysis,
  settingsOverrides,
  onUpdateContent,
  onSendToPreview,
}: TailorToolProps) {
  const { suggestion, isStreaming, error, suggest, clear } =
    useAISuggestion("RESUME_TAILORING");

  const handleTailor = useCallback(() => {
    suggest(
      {
        resume: resolvedData,
        analysis: jobAnalysis,
      },
      settingsOverrides ?? undefined
    );
  }, [suggest, resolvedData, jobAnalysis, settingsOverrides]);

  const handleAccept = useCallback(
    (text: string) => {
      // Store tailoring suggestions as summary override
      onUpdateContent((prev) => ({
        ...prev,
        overrides: { ...prev.overrides, summary: text },
      }));
      clear();
    },
    [onUpdateContent, clear]
  );

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Get AI suggestions to better align your resume with the linked job
        description.
      </p>

      <button
        type="button"
        onClick={handleTailor}
        disabled={isStreaming}
        className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10 disabled:opacity-50"
      >
        <Sparkles className="h-3 w-3" />
        {isStreaming ? "Tailoring..." : "Tailor Resume"}
      </button>

      {/* Error */}
      {error && <p className="text-[11px] text-destructive">{error}</p>}

      {/* Streaming output */}
      {(suggestion || isStreaming) && (
        <AISuggestionInline
          suggestion={suggestion}
          isStreaming={isStreaming}
          onAccept={handleAccept}
          onDismiss={clear}
          onSendToPreview={
            onSendToPreview
              ? (text) =>
                  onSendToPreview(
                    "tailor",
                    resolvedData.summary ?? "",
                    text
                  )
              : undefined
          }
        />
      )}
    </div>
  );
}
