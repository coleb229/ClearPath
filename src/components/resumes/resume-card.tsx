"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Copy,
  ArrowRight,
  Trash2,
  Briefcase,
  Clock,
  Layout,
} from "lucide-react";
import {
  DOC_STATUS_CONFIG as STATUS_CONFIG,
  ALL_DOC_STATUSES as ALL_STATUSES,
  timeAgo,
} from "@/lib/format";

interface ResumeCardProps {
  resume: {
    id: string;
    title: string;
    status: string;
    templateName: string | null;
    jobTitle: string | null;
    jobCompany: string | null;
    updatedAt: Date;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export function ResumeCard({
  resume,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
}: ResumeCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setStatusMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const status = STATUS_CONFIG[resume.status] ?? STATUS_CONFIG.DRAFT;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/resumes/${resume.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/resumes/${resume.id}`);
        }
      }}
      className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:shadow-sm hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Title */}
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="text-sm font-semibold text-foreground truncate">
              {resume.title}
            </span>
          </div>

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {resume.templateName && (
              <span className="flex items-center gap-1">
                <Layout className="h-3 w-3" />
                {resume.templateName}
              </span>
            )}
            {resume.jobTitle && resume.jobCompany && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <span className="truncate max-w-[180px]">
                  {resume.jobTitle} at {resume.jobCompany}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(resume.updatedAt)}
            </span>
          </div>
        </div>

        {/* Right side: status + menu */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="rounded-lg p-1 text-muted-foreground opacity-0 transition-all duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label="Resume actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(resume.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Title
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(resume.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusMenuOpen((v) => !v);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Change Status
                    <span className="ml-auto text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                  {statusMenuOpen && (
                    <div className="absolute left-full top-0 ml-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                      {ALL_STATUSES.map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(resume.id, s);
                              setMenuOpen(false);
                              setStatusMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted ${
                              resume.status === s
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${cfg.className}`}
                            />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(resume.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
