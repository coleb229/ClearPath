"use client";

import { useState, useCallback } from "react";
import {
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import type { ResumeContent, ResumeSectionType } from "@/types/resume";
import type { ProfileData } from "@/lib/resume-resolver";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentPickerProps {
  profile: ProfileData;
  content: ResumeContent;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}

interface PickableItem {
  id: string;
  primary: string;
  secondary?: string;
}

interface SectionPickerConfig {
  sectionType: ResumeSectionType;
  label: string;
  icon: React.ElementType;
  overrideKey: keyof Pick<
    ResumeContent["overrides"],
    "experienceIds" | "educationIds" | "skillIds" | "projectIds" | "certificationIds"
  >;
  items: PickableItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContentPicker({
  profile,
  content,
  onUpdateContent,
}: ContentPickerProps) {
  const sections = buildSections(profile);

  // Only show sections that are enabled in the resume
  const enabledTypes = new Set(
    content.sections.filter((s) => s.enabled).map((s) => s.type)
  );

  const visibleSections = sections.filter(
    (s) => enabledTypes.has(s.sectionType) && s.items.length > 1
  );

  if (visibleSections.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Content
      </p>
      <div className="space-y-1.5">
        {visibleSections.map((section) => (
          <SectionPicker
            key={section.sectionType}
            config={section}
            content={content}
            onUpdateContent={onUpdateContent}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-section picker
// ---------------------------------------------------------------------------

function SectionPicker({
  config,
  content,
  onUpdateContent,
}: {
  config: SectionPickerConfig;
  content: ResumeContent;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = config.icon;

  const activeIds: string[] | undefined =
    content.overrides[config.overrideKey] as string[] | undefined;

  // If no override set, all items are included
  const allIds = config.items.map((i) => i.id);
  const includedIds = new Set(activeIds ?? allIds);
  const hiddenCount = config.items.length - includedIds.size;

  const toggleItem = useCallback(
    (itemId: string) => {
      onUpdateContent((prev) => {
        const currentIds: string[] | undefined =
          prev.overrides[config.overrideKey] as string[] | undefined;
        const current = new Set(currentIds ?? allIds);

        if (current.has(itemId)) {
          current.delete(itemId);
        } else {
          current.add(itemId);
        }

        // If all items are selected, remove the override entirely (show all)
        const newIds =
          current.size === allIds.length ? undefined : Array.from(current);

        return {
          ...prev,
          overrides: {
            ...prev.overrides,
            [config.overrideKey]: newIds,
          },
        };
      });
    },
    [onUpdateContent, config.overrideKey, allIds]
  );

  const showAll = useCallback(() => {
    onUpdateContent((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [config.overrideKey]: undefined,
      },
    }));
  }, [onUpdateContent, config.overrideKey]);

  return (
    <div className="rounded-lg border border-border/60 bg-card/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 px-3 py-2"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left text-xs font-medium text-foreground">
          {config.label}
        </span>
        {hiddenCount > 0 && (
          <span className="rounded-full bg-amber-500/10 px-1.5 py-px text-[10px] font-medium text-amber-600 dark:text-amber-400 tabular-nums">
            {hiddenCount} hidden
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-out-quart) ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-border/40 px-2 py-1.5 space-y-0.5">
          {config.items.map((item) => {
            const included = includedIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
                  included
                    ? "bg-transparent hover:bg-muted/50"
                    : "bg-muted/30 opacity-50 hover:opacity-70"
                }`}
              >
                {included ? (
                  <Eye className="h-3 w-3 shrink-0 text-accent" />
                ) : (
                  <EyeOff className="h-3 w-3 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[11px] font-medium truncate ${
                      included ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.primary}
                  </p>
                  {item.secondary && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {item.secondary}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          {/* Show all shortcut */}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={showAll}
              className="mt-1 text-[10px] font-medium text-accent transition-colors duration-(--dur-state) hover:text-accent/80 px-2"
            >
              Show all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Build section configs from profile data
// ---------------------------------------------------------------------------

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function buildSections(profile: ProfileData): SectionPickerConfig[] {
  const sections: SectionPickerConfig[] = [];

  if (profile.experiences.length > 0) {
    sections.push({
      sectionType: "experience",
      label: "Experience",
      icon: Briefcase,
      overrideKey: "experienceIds",
      items: [...profile.experiences]
        .sort((a, b) => a.order - b.order)
        .map((e) => ({
          id: e.id,
          primary: e.title,
          secondary: `${e.company} · ${formatDate(e.startDate)}–${e.current ? "Present" : formatDate(e.endDate)}`,
        })),
    });
  }

  if (profile.educations.length > 0) {
    sections.push({
      sectionType: "education",
      label: "Education",
      icon: GraduationCap,
      overrideKey: "educationIds",
      items: [...profile.educations]
        .sort((a, b) => a.order - b.order)
        .map((e) => ({
          id: e.id,
          primary: `${e.degree}${e.field ? ` in ${e.field}` : ""}`,
          secondary: e.institution,
        })),
    });
  }

  if (profile.skills.length > 0) {
    sections.push({
      sectionType: "skills",
      label: "Skills",
      icon: Wrench,
      overrideKey: "skillIds",
      items: [...profile.skills]
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: s.id,
          primary: s.name,
          secondary: s.category ?? undefined,
        })),
    });
  }

  if (profile.projects.length > 0) {
    sections.push({
      sectionType: "projects",
      label: "Projects",
      icon: FolderOpen,
      overrideKey: "projectIds",
      items: [...profile.projects]
        .sort((a, b) => a.order - b.order)
        .map((p) => ({
          id: p.id,
          primary: p.name,
          secondary: p.description ?? undefined,
        })),
    });
  }

  if (profile.certifications.length > 0) {
    sections.push({
      sectionType: "certifications",
      label: "Certifications",
      icon: Award,
      overrideKey: "certificationIds",
      items: [...profile.certifications]
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          id: c.id,
          primary: c.name,
          secondary: c.issuer,
        })),
    });
  }

  return sections;
}
