"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface AiTipProps {
  hasProfile: boolean;
  completeness: number;
  jobCount: number;
  resumeCount: number;
  coverLetterCount: number;
}

interface Tip {
  message: string;
  linkText: string;
  href: string;
}

const GENERAL_TIPS: Tip[] = [
  {
    message:
      "Tailor each resume to the specific job listing. AI can highlight which skills to emphasize based on the job description.",
    linkText: "View your resumes",
    href: "/resumes",
  },
  {
    message:
      "Quantify your achievements whenever possible. Numbers like revenue, percentages, or team sizes make your experience more compelling.",
    linkText: "Edit your profile",
    href: "/profile",
  },
  {
    message:
      "Keep your cover letters concise — aim for 3-4 paragraphs that connect your experience to the specific role.",
    linkText: "View cover letters",
    href: "/cover-letters",
  },
  {
    message:
      "Review job descriptions carefully for keywords. Including relevant terms helps your resume pass applicant tracking systems.",
    linkText: "Track a job",
    href: "/jobs",
  },
  {
    message:
      "Update your profile regularly with new skills and accomplishments. The more complete your profile, the better AI can tailor your documents.",
    linkText: "Update profile",
    href: "/profile",
  },
];

function getTip(props: AiTipProps): Tip {
  if (!props.hasProfile) {
    return {
      message:
        "Start by building your profile — it's the foundation for all your resumes and cover letters. Add your experience, skills, and education to unlock AI-powered tailoring.",
      linkText: "Build your profile",
      href: "/profile",
    };
  }

  if (props.completeness < 50) {
    return {
      message:
        "Your profile is off to a great start! Add more experience and skills to help AI generate better tailored documents. Aim for at least 50% completion.",
      linkText: "Complete your profile",
      href: "/profile",
    };
  }

  if (props.jobCount === 0) {
    return {
      message:
        "Track your first job listing to start tailoring resumes to specific opportunities. Paste a job description and AI will analyze it for you.",
      linkText: "Add a job listing",
      href: "/jobs",
    };
  }

  if (props.resumeCount === 0) {
    return {
      message:
        "Create your first resume! AI will help you tailor it to any job listing using your profile data.",
      linkText: "Create a resume",
      href: "/resumes",
    };
  }

  if (props.coverLetterCount === 0) {
    return {
      message:
        "Write a cover letter to complement your resume. AI can draft one based on your profile and target job in seconds.",
      linkText: "Write a cover letter",
      href: "/cover-letters",
    };
  }

  // Rotate through general tips based on the day
  const dayIndex = new Date().getDate() % GENERAL_TIPS.length;
  return GENERAL_TIPS[dayIndex];
}

export function AiTip(props: AiTipProps) {
  const tip = getTip(props);

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">AI Tip</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {tip.message}
          </p>
          <Link
            href={tip.href}
            className="mt-2 inline-flex items-center gap-1.5 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {tip.linkText}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
