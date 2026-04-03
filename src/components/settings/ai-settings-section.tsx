"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import {
  type AIGenerationSettings,
  DEFAULT_AI_SETTINGS,
} from "@/lib/ai/generation-settings";
import { updateAIPreferences } from "@/app/(app)/settings/actions";

// ---------------------------------------------------------------------------
// Segmented options
// ---------------------------------------------------------------------------

const FORMALITY_OPTIONS: Array<{
  value: AIGenerationSettings["formality"];
  label: string;
}> = [
  { value: "casual", label: "Casual" },
  { value: "balanced", label: "Balanced" },
  { value: "formal", label: "Formal" },
];

const DETAIL_OPTIONS: Array<{
  value: AIGenerationSettings["detailLevel"];
  label: string;
}> = [
  { value: "concise", label: "Concise" },
  { value: "balanced", label: "Balanced" },
  { value: "detailed", label: "Detailed" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AISettingsSectionProps {
  initialPreferences: AIGenerationSettings | null;
}

export function AISettingsSection({
  initialPreferences,
}: AISettingsSectionProps) {
  const [settings, setSettings] = useState<AIGenerationSettings>(
    initialPreferences ?? DEFAULT_AI_SETTINGS
  );
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Optimistic save — update local state immediately, persist in background
  const save = useCallback(
    (next: AIGenerationSettings) => {
      setSettings(next);
      // Debounce the slider to avoid hammering the server
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startTransition(() => {
          updateAIPreferences(next);
        });
      }, 400);
    },
    [startTransition]
  );

  const setCreativity = (creativity: number) =>
    save({ ...settings, creativity });
  const setFormality = (formality: AIGenerationSettings["formality"]) =>
    save({ ...settings, formality });
  const setDetailLevel = (detailLevel: AIGenerationSettings["detailLevel"]) =>
    save({ ...settings, detailLevel });

  const sliderPercent = settings.creativity;

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-up animate-delay-2">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </span>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            AI Generation
          </h2>
          {isPending && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          )}
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* ---- Creativity slider ---- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Creativity</p>
              <p className="text-xs text-muted-foreground">
                How much the AI varies its output
              </p>
            </div>
            <span className="tabular-nums text-xs font-medium text-muted-foreground">
              {settings.creativity}
            </span>
          </div>

          {/* Custom range track */}
          <div className="relative flex items-center">
            <div className="relative h-1.5 w-full rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-100"
                style={{ width: `${sliderPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={settings.creativity}
              onChange={(e) => setCreativity(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Creativity"
            />
            {/* Thumb indicator */}
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-card shadow-sm transition-[left] duration-100"
              style={{ left: `${sliderPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground/70">
            <span>Conservative</span>
            <span>Creative</span>
          </div>
        </div>

        {/* ---- Formality ---- */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Formality</p>
            <p className="text-xs text-muted-foreground">
              Language register and tone
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 gap-1">
            {FORMALITY_OPTIONS.map(({ value, label }) => {
              const active = settings.formality === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormality(value)}
                  className={`flex items-center rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Detail level ---- */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Detail Level</p>
            <p className="text-xs text-muted-foreground">
              How long and detailed the output is
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 gap-1">
            {DETAIL_OPTIONS.map(({ value, label }) => {
              const active = settings.detailLevel === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDetailLevel(value)}
                  className={`flex items-center rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
