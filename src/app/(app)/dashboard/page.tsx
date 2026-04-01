import { auth } from "../../../../auth";
import Link from "next/link";
import {
  User,
  FileText,
  Mail,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick up where you left off, or start something new.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            href: "/profile",
            icon: User,
            label: "Build Profile",
            desc: "Add your experience & skills",
          },
          {
            href: "/resumes",
            icon: FileText,
            label: "Create Resume",
            desc: "Start a new tailored resume",
          },
          {
            href: "/cover-letters",
            icon: Mail,
            label: "Write Cover Letter",
            desc: "Draft a personalized letter",
          },
          {
            href: "/jobs",
            icon: Briefcase,
            label: "Add Job Listing",
            desc: "Paste a job description",
          },
        ].map((action, i) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-[var(--dur-state)] hover:shadow-sm hover:border-primary/20 active:translate-y-px animate-fade-up animate-delay-${i + 1}`}
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <action.icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                {action.label}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-[var(--dur-state)] group-hover:opacity-100 group-hover:translate-x-0" />
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {action.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Tip */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 animate-fade-up animate-delay-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              AI Tip
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Start by building your profile with at least 2 work experiences.
              The more detail you add, the better AI can tailor your resumes to
              specific job opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
