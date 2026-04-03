"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Settings2 } from "lucide-react";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import { DEFAULT_AI_SETTINGS } from "@/lib/ai/generation-settings";

interface GenerationSettingsPopoverProps {
  value: Partial<AIGenerationSettings> | null;
  onChange: (settings: Partial<AIGenerationSettings>) => void;
}

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

export function GenerationSettingsPopover({
  value,
  onChange,
}: GenerationSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const merged = { ...DEFAULT_AI_SETTINGS, ...value };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const update = useCallback(
    (patch: Partial<AIGenerationSettings>) => {
      onChange({ ...value, ...patch });
    },
    [value, onChange]
  );

  const hasOverrides = value !== null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-(--dur-state) ease-(--ease-out-quart) ${
          hasOverrides
            ? "text-accent hover:bg-accent/10"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        aria-label="Generation settings"
      >
        <Settings2 className="h-3 w-3" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-lg border border-border bg-card p-3 shadow-lg animate-fade-up"
        >
          <div className="space-y-4">
            {/* Creativity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  Creativity
                </p>
                <span className="tabular-nums text-[10px] text-muted-foreground">
                  {merged.creativity}
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="relative h-1 w-full rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-100"
                    style={{ width: `${merged.creativity}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={merged.creativity}
                  onChange={(e) =>
                    update({ creativity: Number(e.target.value) })
                  }
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Creativity"
                />
                <div
                  className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-card shadow-sm transition-[left] duration-100"
                  style={{ left: `${merged.creativity}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>Safe</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Formality */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Formality</p>
              <div className="inline-flex w-full rounded-md border border-border bg-muted/50 p-0.5 gap-0.5">
                {FORMALITY_OPTIONS.map(({ value: v, label }) => {
                  const active = merged.formality === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => update({ formality: v })}
                      className={`flex-1 rounded px-2 py-1 text-[11px] font-medium transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
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

            {/* Detail Level */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">
                Detail Level
              </p>
              <div className="inline-flex w-full rounded-md border border-border bg-muted/50 p-0.5 gap-0.5">
                {DETAIL_OPTIONS.map(({ value: v, label }) => {
                  const active = merged.detailLevel === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => update({ detailLevel: v })}
                      className={`flex-1 rounded px-2 py-1 text-[11px] font-medium transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
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

            {/* Reset */}
            {hasOverrides && (
              <button
                type="button"
                onClick={() => {
                  onChange({});
                  setOpen(false);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-(--dur-state)"
              >
                Reset to defaults
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
