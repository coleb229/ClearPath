"use client";

import {
  useState,
  useCallback,
  useTransition,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  ClipboardCopy,
  Download,
  Check,
} from "lucide-react";
import { CoverLetterPreview } from "@/components/cover-letters/cover-letter-preview";
import { GenerationPanel } from "@/components/cover-letters/generation-panel";
import {
  updateCoverLetterContent,
  updateCoverLetter,
} from "@/app/(app)/cover-letters/actions";

interface CoverLetterEditorProps {
  coverLetter: {
    id: string;
    title: string;
    status: string;
    content: string | null;
    jobListingId: string | null;
  };
  profile: Record<string, unknown>;
  user: { name: string; email: string; phone?: string };
  job: {
    title: string;
    company: string;
    description: string;
  } | null;
}

type EditorTab = "edit" | "preview";

export function CoverLetterEditor({
  coverLetter,
  profile,
  user,
  job,
}: CoverLetterEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(coverLetter.content ?? "");
  const [title, setTitle] = useState(coverLetter.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [mobileTab, setMobileTab] = useState<EditorTab>("edit");
  const [copied, setCopied] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Word count
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  // Auto-save content changes
  const saveContent = useCallback(
    (newContent: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        startTransition(async () => {
          await updateCoverLetterContent(coverLetter.id, newContent);
        });
      }, 800);
    },
    [coverLetter.id]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      saveContent(newContent);
    },
    [saveContent]
  );

  // Accept AI generated content
  const handleAcceptContent = useCallback(
    (text: string) => {
      setContent(text);
      saveContent(text);
    },
    [saveContent]
  );

  // Title save
  const handleTitleSave = useCallback(() => {
    setEditingTitle(false);
    if (title.trim() && title !== coverLetter.title) {
      const formData = new FormData();
      formData.set("id", coverLetter.id);
      formData.set("title", title.trim());
      startTransition(async () => {
        await updateCoverLetter(formData);
      });
    }
  }, [title, coverLetter.id, coverLetter.title]);

  // Focus title input when editing
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  // Build full letter text for export
  const buildFullText = useCallback(() => {
    const greeting = job?.company ? `${job.company} Team` : "Hiring Manager";
    const contact = [user.email, user.phone].filter(Boolean).join("\n");
    return `Dear ${greeting},\n\n${content}\n\nSincerely,\n${user.name}\n${contact}`;
  }, [content, job, user]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!content) return;
    await navigator.clipboard.writeText(buildFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content, buildFullText]);

  // Download as .txt
  const handleDownload = useCallback(() => {
    if (!content) return;
    const blob = new Blob([buildFullText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${coverLetter.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, coverLetter.title, buildFullText]);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/cover-letters")}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
            aria-label="Back to cover letters"
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
                  setTitle(coverLetter.title);
                  setEditingTitle(false);
                }
              }}
              className="rounded-md border border-input bg-background px-2 py-1 text-lg font-bold tracking-tight text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted disabled:opacity-50"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[oklch(0.55_0.15_145)]" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!content}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download
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
        {/* Left panel — Editor */}
        <div
          className={`w-full lg:w-[45%] shrink-0 space-y-5 ${
            mobileTab !== "edit" ? "hidden lg:block" : ""
          }`}
        >
          {/* Textarea */}
          <div className="space-y-2">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your cover letter, or use AI to generate a draft..."
              className="w-full min-h-75 resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow duration-(--dur-state) ease-(--ease-out-quart)"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              {isPending && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  Saving...
                </div>
              )}
            </div>
          </div>

          {/* AI Generation Panel */}
          <GenerationPanel
            profile={profile}
            job={job}
            onAcceptContent={handleAcceptContent}
          />
        </div>

        {/* Right panel — Preview */}
        <div
          className={`flex-1 min-w-0 ${
            mobileTab !== "preview" ? "hidden lg:block" : ""
          }`}
        >
          <div className="sticky top-4">
            <CoverLetterPreview
              content={content}
              userName={user.name}
              userEmail={user.email}
              userPhone={user.phone}
              companyName={job?.company}
              jobTitle={job?.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
