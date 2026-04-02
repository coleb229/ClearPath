"use client";

import {
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
} from "lucide-react";
import { DragHandle } from "@/components/ui/sortable-list";
import type { ResumeSectionType } from "@/types/resume";

const SECTION_META: Record<
  ResumeSectionType,
  { label: string; icon: React.ElementType }
> = {
  header: { label: "Header", icon: User },
  summary: { label: "Summary", icon: AlignLeft },
  experience: { label: "Experience", icon: Briefcase },
  education: { label: "Education", icon: GraduationCap },
  skills: { label: "Skills", icon: Wrench },
  projects: { label: "Projects", icon: FolderOpen },
  certifications: { label: "Certifications", icon: Award },
};

interface SectionToggleProps {
  type: ResumeSectionType;
  enabled: boolean;
  onToggle: (type: ResumeSectionType) => void;
}

export function SectionToggle({ type, enabled, onToggle }: SectionToggleProps) {
  const meta = SECTION_META[type];
  const Icon = meta.icon;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
        enabled
          ? "border-border bg-card"
          : "border-transparent bg-muted/40 opacity-50"
      }`}
    >
      <DragHandle />

      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <span className="flex-1 text-sm font-medium text-foreground">
        {meta.label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(type)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-(--dur-state) ease-(--ease-out-quart) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-(--dur-state) ease-(--ease-out-quart) ${
            enabled ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
