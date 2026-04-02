"use client";

import Link from "next/link";
import { FileText, Mail, ArrowRight } from "lucide-react";
import { DOC_STATUS_CONFIG, timeAgo } from "@/lib/format";

interface RecentDocument {
  id: string;
  type: "resume" | "cover-letter";
  title: string;
  status: string;
  updatedAt: Date;
}

interface RecentDocumentsProps {
  documents: RecentDocument[];
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">
          Recent Documents
        </h3>
        <div className="mt-4 flex flex-col items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FileText className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No documents yet
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/resumes"
              className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Create a resume
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/cover-letters"
              className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Write a cover letter
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Recent Documents
        </h3>
      </div>

      <div className="mt-4 space-y-1">
        {documents.map((doc) => {
          const Icon = doc.type === "resume" ? FileText : Mail;
          const href =
            doc.type === "resume"
              ? `/resumes/${doc.id}`
              : `/cover-letters/${doc.id}`;
          const statusCfg =
            DOC_STATUS_CONFIG[doc.status] ?? DOC_STATUS_CONFIG.DRAFT;

          return (
            <Link
              key={`${doc.type}-${doc.id}`}
              href={href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors duration-(--dur-state)" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate block">
                  {doc.title}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}
              >
                {statusCfg.label}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {timeAgo(doc.updatedAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
