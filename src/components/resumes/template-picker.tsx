"use client";

import { Layout, Check } from "lucide-react";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
}

interface TemplatePickerProps {
  templates: Template[];
  selectedId: string | null;
  onSelect: (templateId: string) => void;
}

const TEMPLATE_PREVIEWS: Record<string, { icon: string; accent: string }> = {
  clean: { icon: "Single column", accent: "bg-muted" },
  modern: { icon: "Two column", accent: "bg-[oklch(0.25_0.02_240)]" },
  professional: { icon: "Traditional", accent: "bg-muted" },
};

export function TemplatePicker({
  templates,
  selectedId,
  onSelect,
}: TemplatePickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Template
      </p>
      <div className="grid grid-cols-3 gap-2">
        {templates.map((t) => {
          const isSelected = t.id === selectedId;
          const preview = TEMPLATE_PREVIEWS[t.slug];

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className={`group relative flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all duration-(--dur-state) ease-(--ease-out-quart) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
              }`}
            >
              {/* Mini preview */}
              <div
                className={`relative w-full aspect-[8.5/11] rounded overflow-hidden ${
                  preview?.accent ?? "bg-muted"
                }`}
              >
                {t.slug === "clean" && (
                  <div className="p-1.5 flex flex-col items-center">
                    <div className="w-6 h-0.5 bg-foreground/20 rounded mb-1" />
                    <div className="w-full space-y-0.5">
                      <div className="h-0.5 bg-foreground/10 rounded w-full" />
                      <div className="h-0.5 bg-foreground/10 rounded w-3/4" />
                      <div className="h-0.5 bg-foreground/10 rounded w-5/6" />
                      <div className="h-0.5 bg-foreground/10 rounded w-2/3" />
                    </div>
                  </div>
                )}
                {t.slug === "modern" && (
                  <div className="flex h-full">
                    <div className="w-[30%] bg-[oklch(0.2_0.02_240)] p-1">
                      <div className="space-y-0.5">
                        <div className="h-0.5 bg-white/20 rounded w-full" />
                        <div className="h-0.5 bg-white/10 rounded w-3/4" />
                      </div>
                    </div>
                    <div className="flex-1 p-1">
                      <div className="space-y-0.5">
                        <div className="h-0.5 bg-foreground/10 rounded w-full" />
                        <div className="h-0.5 bg-foreground/10 rounded w-3/4" />
                        <div className="h-0.5 bg-foreground/10 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                )}
                {t.slug === "professional" && (
                  <div className="p-1.5 flex flex-col items-center">
                    <div className="w-8 h-0.5 bg-foreground/25 rounded mb-0.5" />
                    <div className="w-full h-px bg-foreground/15 mb-1" />
                    <div className="w-full space-y-0.5">
                      <div className="h-0.5 bg-foreground/10 rounded w-full" />
                      <div className="h-0.5 bg-foreground/10 rounded w-4/5" />
                      <div className="w-full h-px bg-foreground/10 my-0.5" />
                      <div className="h-0.5 bg-foreground/10 rounded w-full" />
                      <div className="h-0.5 bg-foreground/10 rounded w-3/4" />
                    </div>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>

              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
