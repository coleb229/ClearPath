"use client";

import { Briefcase, Sparkles, MessageCircle, Zap } from "lucide-react";

export type CoverLetterTone =
  | "professional"
  | "enthusiastic"
  | "conversational"
  | "bold";

const TONES: Array<{
  value: CoverLetterTone;
  label: string;
  icon: React.ElementType;
}> = [
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "enthusiastic", label: "Enthusiastic", icon: Sparkles },
  { value: "conversational", label: "Conversational", icon: MessageCircle },
  { value: "bold", label: "Bold", icon: Zap },
];

interface ToneSelectorProps {
  value: CoverLetterTone;
  onChange: (tone: CoverLetterTone) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cover letter tone">
      {TONES.map(({ value: tone, label, icon: Icon }) => {
        const isSelected = value === tone;
        return (
          <button
            key={tone}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(tone)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-(--dur-state) ease-(--ease-out-quart) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
              isSelected
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
