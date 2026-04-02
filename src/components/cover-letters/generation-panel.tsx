"use client";

import { useState, useCallback } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import {
  ToneSelector,
  type CoverLetterTone,
} from "@/components/cover-letters/tone-selector";
import { AISuggestionInline } from "@/components/profile/ai-suggestion-inline";
import { useAISuggestion } from "@/hooks/use-ai-suggestion";

interface GenerationPanelProps {
  profile: Record<string, unknown>;
  job: {
    title: string;
    company: string;
    description: string;
  } | null;
  onAcceptContent: (content: string) => void;
  disabled?: boolean;
}

export function GenerationPanel({
  profile,
  job,
  onAcceptContent,
  disabled = false,
}: GenerationPanelProps) {
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [hasGenerated, setHasGenerated] = useState(false);

  const {
    suggestion,
    isStreaming,
    error,
    suggest,
    clear,
  } = useAISuggestion("COVER_LETTER_DRAFT");

  const handleGenerate = useCallback(() => {
    if (!job) return;
    setHasGenerated(true);
    suggest({
      profile,
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
      tone,
    });
  }, [suggest, profile, job, tone]);

  const handleAccept = useCallback(
    (text: string) => {
      onAcceptContent(text);
      clear();
    },
    [onAcceptContent, clear]
  );

  const canGenerate = !!job && !disabled;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/50 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          AI Cover Letter Generator
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Choose a tone and generate a draft from your profile and job
          description.
        </p>
      </div>

      {/* Tone selector */}
      <ToneSelector value={tone} onChange={setTone} />

      {/* No job warning */}
      {!job && (
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Link a job listing to enable AI generation. Create the cover letter
            from the list page with a job selected.
          </p>
        </div>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || isStreaming}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {isStreaming
          ? "Generating..."
          : hasGenerated
            ? "Regenerate"
            : "Generate Cover Letter"}
      </button>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Streaming output */}
      {(suggestion || isStreaming) && (
        <AISuggestionInline
          suggestion={suggestion}
          isStreaming={isStreaming}
          onAccept={handleAccept}
          onDismiss={clear}
        />
      )}
    </div>
  );
}
