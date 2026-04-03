"use client";

import {
  useState,
  useCallback,
  useTransition,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Pencil,
  Eye,
} from "lucide-react";
import { SortableList } from "@/components/ui/sortable-list";
import { SectionToggle } from "@/components/resumes/section-toggle";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { TemplatePicker } from "@/components/resumes/template-picker";
import { MatchScore, calculateMatchScore } from "@/components/resumes/match-score";
import { ContentPicker } from "@/components/resumes/content-picker";
import { ResumeAIPanel } from "@/components/resumes/ai/resume-ai-panel";
import {
  updateResumeContent,
  updateResumeTemplate,
  updateResume,
} from "@/app/(app)/resumes/actions";
import { resolveResumeData } from "@/lib/resume-resolver";
import type { ProfileData, UserData } from "@/lib/resume-resolver";
import type {
  ResumeContent,
  ResumeSection,
  ResumeSectionType,
} from "@/types/resume";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
}

interface ResumeEditorProps {
  resume: {
    id: string;
    title: string;
    status: string;
    templateId: string | null;
    templateSlug: string;
    content: ResumeContent;
    jobListingId: string | null;
  };
  profile: ProfileData;
  user: UserData;
  templates: Template[];
  jobAnalysis: Record<string, unknown> | null;
  userSkills: string[];
}

type EditorTab = "edit" | "preview";

export function ResumeEditor({
  resume,
  profile,
  user,
  templates,
  jobAnalysis,
  userSkills,
}: ResumeEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<ResumeContent>(resume.content);
  const [templateId, setTemplateId] = useState(resume.templateId);
  const [title, setTitle] = useState(resume.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [mobileTab, setMobileTab] = useState<EditorTab>("edit");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Current template slug
  const currentTemplate = templates.find((t) => t.id === templateId);
  const templateSlug = currentTemplate?.slug ?? resume.templateSlug;

  // Resolved data for preview
  const resolvedData = useMemo(
    () => resolveResumeData(profile, content, user),
    [profile, content, user]
  );

  // Match score
  const matchScore = useMemo(
    () => calculateMatchScore(userSkills, jobAnalysis),
    [userSkills, jobAnalysis]
  );

  // Auto-save content changes
  const saveContent = useCallback(
    (newContent: ResumeContent) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        startTransition(async () => {
          await updateResumeContent(resume.id, newContent);
        });
      }, 800);
    },
    [resume.id]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Section toggle
  const handleToggleSection = useCallback(
    (type: ResumeSectionType) => {
      setContent((prev) => {
        const next = {
          ...prev,
          sections: prev.sections.map((s) =>
            s.type === type ? { ...s, enabled: !s.enabled } : s
          ),
        };
        saveContent(next);
        return next;
      });
    },
    [saveContent]
  );

  // Section reorder
  const handleReorderSections = useCallback(
    (orderedIds: string[]) => {
      setContent((prev) => {
        const sectionMap = new Map(prev.sections.map((s) => [s.type, s]));
        const reordered = orderedIds
          .map((id, index) => {
            const section = sectionMap.get(id as ResumeSectionType);
            return section ? { ...section, order: index } : null;
          })
          .filter((s): s is ResumeSection => s !== null);
        const next = { ...prev, sections: reordered };
        saveContent(next);
        return next;
      });
    },
    [saveContent]
  );

  // Template change
  const handleTemplateChange = useCallback(
    (newTemplateId: string) => {
      setTemplateId(newTemplateId);
      startTransition(async () => {
        await updateResumeTemplate(resume.id, newTemplateId);
      });
    },
    [resume.id]
  );

  // Title save
  const handleTitleSave = useCallback(() => {
    setEditingTitle(false);
    if (title.trim() && title !== resume.title) {
      const formData = new FormData();
      formData.set("id", resume.id);
      formData.set("title", title.trim());
      startTransition(async () => {
        await updateResume(formData);
      });
    }
  }, [title, resume.id, resume.title]);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  // Content update callback for AI tools
  const handleContentUpdate = useCallback(
    (updater: (prev: ResumeContent) => ResumeContent) => {
      setContent((prev) => {
        const next = updater(prev);
        saveContent(next);
        return next;
      });
    },
    [saveContent]
  );

  // Print
  const handlePrint = useCallback(() => {
    window.open(`/resumes/${resume.id}/print`, "_blank");
  }, [resume.id]);

  const sortedSections = [...content.sections].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/resumes")}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
            aria-label="Back to resumes"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setTitle(resume.title);
                  setEditingTitle(false);
                }
              }}
              className="rounded-md border border-input bg-background px-2 py-1 text-lg font-bold tracking-tight text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="group flex items-center gap-2"
            >
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity duration-(--dur-state) group-hover:opacity-100" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/resumes/${resume.id}/preview`)}
            className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-sm font-medium text-accent transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-accent/10"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Mobile tab switcher */}
      <div className="flex rounded-lg border border-border bg-muted p-0.5 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-(--dur-state) ease-(--ease-out-quart) ${
            mobileTab === "edit"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-(--dur-state) ease-(--ease-out-quart) ${
            mobileTab === "preview"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Split layout */}
      <div className="flex gap-6 animate-fade-up animate-delay-1">
        {/* Left panel — Editor controls */}
        <div
          className={`w-full lg:w-[38%] shrink-0 space-y-5 ${
            mobileTab !== "edit" ? "hidden lg:block" : ""
          }`}
        >
          {/* Match score */}
          {resume.jobListingId && jobAnalysis && matchScore > 0 && (
            <MatchScore score={matchScore} />
          )}

          {/* Template picker */}
          <TemplatePicker
            templates={templates.map((t) => ({
              ...t,
              slug: t.slug,
            }))}
            selectedId={templateId}
            onSelect={handleTemplateChange}
          />

          {/* Section toggles */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sections
            </p>
            <SortableList
              items={sortedSections}
              keyExtractor={(s) => s.type}
              onReorder={handleReorderSections}
              renderItem={(section) => (
                <SectionToggle
                  type={section.type}
                  enabled={section.enabled}
                  onToggle={handleToggleSection}
                />
              )}
            />
          </div>

          {/* Content picker — toggle individual items per section */}
          <ContentPicker
            profile={profile}
            content={content}
            onUpdateContent={handleContentUpdate}
          />

          {/* AI Assist panel */}
          <ResumeAIPanel
            resumeId={resume.id}
            content={content}
            profile={profile}
            resolvedData={resolvedData}
            jobAnalysis={jobAnalysis}
            userSkills={userSkills}
            onUpdateContent={handleContentUpdate}
          />

          {/* Save indicator */}
          {isPending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Saving...
            </div>
          )}
        </div>

        {/* Right panel — Preview */}
        <div
          className={`flex-1 min-w-0 min-h-[70vh] ${
            mobileTab !== "preview" ? "hidden lg:block" : ""
          }`}
        >
          <ResumePreview data={resolvedData} templateSlug={templateSlug} />
        </div>
      </div>
    </div>
  );
}
