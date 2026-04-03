"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronDown } from "lucide-react";
import { GenerationSettingsPopover } from "@/components/ai/generation-settings-popover";
import { SummaryTool } from "./summary-tool";
import { BulletTool } from "./bullet-tool";
import { SkillsTool } from "./skills-tool";
import { InsightsTool } from "./insights-tool";
import { TailorTool } from "./tailor-tool";
import { appendPendingSuggestion } from "@/lib/preview-suggestions";
import type { AIGenerationSettings } from "@/lib/ai/generation-settings";
import type { ResumeContent } from "@/types/resume";
import type { ProfileData } from "@/lib/resume-resolver";
import type { ResolvedResumeData } from "@/types/resume";

interface ResumeAIPanelProps {
  resumeId: string;
  content: ResumeContent;
  profile: ProfileData;
  resolvedData: ResolvedResumeData;
  jobAnalysis: Record<string, unknown> | null;
  userSkills: string[];
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
}

export function ResumeAIPanel({
  resumeId,
  content,
  profile,
  resolvedData,
  jobAnalysis,
  userSkills,
  onUpdateContent,
}: ResumeAIPanelProps) {
  const router = useRouter();
  const [settingsOverrides, setSettingsOverrides] =
    useState<Partial<AIGenerationSettings> | null>(null);
  const [expanded, setExpanded] = useState(true);

  const handleSendToPreview = useCallback(
    (type: string, before: string, after: string, meta?: Record<string, unknown>) => {
      appendPendingSuggestion(resumeId, {
        id: crypto.randomUUID(),
        type: type as "summary" | "bullet" | "skill" | "tailor",
        label: type === "bullet" ? "Improved bullet" : type === "summary" ? "Updated summary" : "Tailoring suggestion",
        before,
        after,
        meta,
      });
      router.push(`/resumes/${resumeId}/preview`);
    },
    [resumeId, router]
  );

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-up">
      {/* Header */}
      <div className="flex w-full items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </span>
          <span className="flex-1 text-left text-sm font-semibold text-foreground">
            AI Assist
          </span>
        </button>
        <GenerationSettingsPopover
          value={settingsOverrides}
          onChange={setSettingsOverrides}
        />
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center"
        >
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-out-quart) ${
              expanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>
      </div>

      {/* Collapsible body */}
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {/* Summary Tool */}
          <ToolSection title="Summary" defaultOpen>
            <SummaryTool
              currentSummary={resolvedData.summary}
              profile={profile}
              jobAnalysis={jobAnalysis}
              settingsOverrides={settingsOverrides}
              onUpdateContent={onUpdateContent}
              onSendToPreview={handleSendToPreview}
            />
          </ToolSection>

          {/* Bullet Improver */}
          <ToolSection title="Experience Bullets">
            <BulletTool
              experiences={resolvedData.experiences}
              jobAnalysis={jobAnalysis}
              settingsOverrides={settingsOverrides}
              onUpdateContent={onUpdateContent}
              onSendToPreview={handleSendToPreview}
            />
          </ToolSection>

          {/* Skills Suggester */}
          <ToolSection title="Skills">
            <SkillsTool
              experiences={resolvedData.experiences}
              currentSkills={userSkills}
              content={content}
              jobAnalysis={jobAnalysis}
              settingsOverrides={settingsOverrides}
              onUpdateContent={onUpdateContent}
            />
          </ToolSection>

          {/* Resume Review */}
          <ToolSection title="Resume Review">
            <InsightsTool
              resolvedData={resolvedData}
              jobAnalysis={jobAnalysis}
              settingsOverrides={settingsOverrides}
            />
          </ToolSection>

          {/* Tailoring (only with linked job) */}
          {jobAnalysis && (
            <ToolSection title="Job Tailoring">
              <TailorTool
                resolvedData={resolvedData}
                jobAnalysis={jobAnalysis}
                settingsOverrides={settingsOverrides}
                onUpdateContent={onUpdateContent}
                onSendToPreview={handleSendToPreview}
              />
            </ToolSection>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible tool section
// ---------------------------------------------------------------------------

function ToolSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border/60 bg-background/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2"
      >
        <span className="text-xs font-medium text-foreground">{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-out-quart) ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
