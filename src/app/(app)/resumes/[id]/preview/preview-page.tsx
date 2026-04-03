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
  Download,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { PreviewAIPanel } from "@/components/resumes/preview/preview-ai-panel";
import { updateResumeContent } from "@/app/(app)/resumes/actions";
import { resolveResumeData } from "@/lib/resume-resolver";
import { loadPendingSuggestions } from "@/lib/preview-suggestions";
import type { PendingSuggestion } from "@/lib/preview-suggestions";
import type { ProfileData, UserData } from "@/lib/resume-resolver";
import type { ResumeContent, ResolvedResumeData } from "@/types/resume";
import { templateComponents } from "@/components/resumes/templates";

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
}

interface PreviewPageProps {
  resume: {
    id: string;
    title: string;
    templateSlug: string;
    templateId: string | null;
    content: ResumeContent;
    jobListingId: string | null;
  };
  profile: ProfileData;
  user: UserData;
  initialResolvedData: ResolvedResumeData;
  jobAnalysis: Record<string, unknown> | null;
  userSkills: string[];
  templates: Template[];
}

type MobileTab = "preview" | "adjust";

export function PreviewPage({
  resume,
  profile,
  user,
  initialResolvedData,
  jobAnalysis,
  userSkills,
  templates,
}: PreviewPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState<ResumeContent>(resume.content);
  const [mobileTab, setMobileTab] = useState<MobileTab>("preview");
  const [aiPanelOpen, setAIPanelOpen] = useState(true);
  const [pendingSuggestions, setPendingSuggestions] = useState<
    PendingSuggestion[]
  >([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const templateSlug = resume.templateSlug;

  // Resolved data for preview
  const resolvedData = useMemo(
    () => resolveResumeData(profile, content, user),
    [profile, content, user]
  );

  // Load pending suggestions from sessionStorage on mount
  useEffect(() => {
    const suggestions = loadPendingSuggestions(resume.id);
    if (suggestions.length > 0) {
      setPendingSuggestions(suggestions);
    }
  }, [resume.id]);

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

  // Content update callback
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

  // Remove a pending suggestion
  const handleDismissSuggestion = useCallback((id: string) => {
    setPendingSuggestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Print
  const handlePrint = useCallback(() => {
    window.open(`/resumes/${resume.id}/print`, "_blank");
  }, [resume.id]);

  // PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin: 0,
      filename: `${resume.title}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: "in" as const,
        format: "letter" as const,
        orientation: "portrait" as const,
      },
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  }, [resume.title]);

  const TemplateComponent =
    templateComponents[templateSlug] ?? templateComponents.clean;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/resumes/${resume.id}`)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
            aria-label="Back to editor"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {resume.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Preview &amp; adjust before downloading
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save indicator */}
          {isPending && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Saving...
            </div>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Mobile tab switcher */}
      <div className="flex rounded-lg border border-border bg-muted p-0.5 lg:hidden">
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
        <button
          type="button"
          onClick={() => setMobileTab("adjust")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-(--dur-state) ease-(--ease-out-quart) ${
            mobileTab === "adjust"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          AI Adjust
        </button>
      </div>

      {/* Split layout */}
      <div className="flex gap-6 animate-fade-up animate-delay-1">
        {/* Left panel — Large preview */}
        <div
          className={`flex-1 min-w-0 min-h-[80vh] ${
            mobileTab !== "preview" ? "hidden lg:block" : ""
          }`}
        >
          <ResumePreview data={resolvedData} templateSlug={templateSlug} />
        </div>

        {/* Right panel — AI Adjustment sidebar */}
        <div
          className={`w-full lg:w-[32%] shrink-0 ${
            mobileTab !== "adjust" ? "hidden lg:block" : ""
          }`}
        >
          <div className="rounded-xl border border-border bg-card animate-fade-up">
            {/* Panel header */}
            <button
              type="button"
              onClick={() => setAIPanelOpen(!aiPanelOpen)}
              className="flex w-full items-center gap-3 px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              </span>
              <span className="flex-1 text-left text-sm font-semibold text-foreground">
                AI Adjustments
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-out-quart) ${
                  aiPanelOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {aiPanelOpen && (
              <div className="border-t border-border">
                <PreviewAIPanel
                  resumeId={resume.id}
                  content={content}
                  profile={profile}
                  resolvedData={resolvedData}
                  jobAnalysis={jobAnalysis}
                  userSkills={userSkills}
                  pendingSuggestions={pendingSuggestions}
                  onDismissSuggestion={handleDismissSuggestion}
                  onUpdateContent={handleContentUpdate}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden full-size container for PDF capture */}
      <div
        className="fixed -left-[9999px] top-0"
        aria-hidden="true"
      >
        <div
          ref={pdfRef}
          style={{
            width: "8.5in",
            minHeight: "11in",
            backgroundColor: "#ffffff",
          }}
        >
          <TemplateComponent data={resolvedData} />
        </div>
      </div>
    </div>
  );
}
