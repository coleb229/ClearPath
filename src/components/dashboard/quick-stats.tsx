"use client";

import { Briefcase, FileText, Mail, User } from "lucide-react";

interface QuickStatsProps {
  jobCount: number;
  resumeCount: number;
  coverLetterCount: number;
  profileCompleteness: number;
}

const DELAY_CLASSES = [
  "animate-delay-1",
  "animate-delay-2",
  "animate-delay-3",
  "animate-delay-4",
] as const;

const STATS = [
  {
    key: "jobs",
    label: "Jobs Tracked",
    icon: Briefcase,
    colorClass: "bg-primary/10 text-primary",
    countKey: "jobCount" as const,
  },
  {
    key: "resumes",
    label: "Resumes",
    icon: FileText,
    colorClass: "bg-primary/10 text-primary",
    countKey: "resumeCount" as const,
  },
  {
    key: "coverLetters",
    label: "Cover Letters",
    icon: Mail,
    colorClass: "bg-accent/10 text-accent",
    countKey: "coverLetterCount" as const,
  },
  {
    key: "profile",
    label: "Profile Score",
    icon: User,
    colorClass: "bg-primary/10 text-primary",
    countKey: "profileCompleteness" as const,
    suffix: "%",
  },
] as const;

export function QuickStats(props: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        const value = props[stat.countKey];
        return (
          <div
            key={stat.key}
            className={`rounded-xl border border-border bg-card p-4 animate-fade-up ${DELAY_CLASSES[i]}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.colorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {value}
                  {"suffix" in stat ? stat.suffix : ""}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
