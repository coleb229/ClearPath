import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProfileCompleteness } from "@/components/profile/profile-completeness";
import { getCompleteness } from "@/lib/profile-completeness";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { JobPipelineMini } from "@/components/dashboard/job-pipeline-mini";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { AiTip } from "@/components/dashboard/ai-tip";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const [
    profile,
    resumeCount,
    recentResumes,
    coverLetterCount,
    recentCoverLetters,
    jobStatusGroups,
  ] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      include: {
        experiences: { select: { id: true } },
        educations: { select: { id: true } },
        skills: { select: { id: true } },
        projects: { select: { id: true } },
      },
    }),
    prisma.resume.count({ where: { userId } }),
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.coverLetter.count({ where: { userId } }),
    prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
    prisma.jobListing.groupBy({
      by: ["status"],
      _count: true,
      where: { userId },
    }),
  ]);

  // Profile completeness
  const profileProps = {
    profile: profile
      ? {
          headline: profile.headline,
          summary: profile.summary,
          phone: profile.phone,
          location: profile.location,
          website: profile.website,
          linkedin: profile.linkedin,
        }
      : null,
    experienceCount: profile?.experiences.length ?? 0,
    educationCount: profile?.educations.length ?? 0,
    skillCount: profile?.skills.length ?? 0,
    projectCount: profile?.projects.length ?? 0,
  };
  const completeness = getCompleteness(profileProps);

  // Job pipeline counts
  const jobCounts: Record<string, number> = {};
  for (const group of jobStatusGroups) {
    jobCounts[group.status] = group._count;
  }
  const totalJobs = Object.values(jobCounts).reduce((a, b) => a + b, 0);

  // Merge recent documents
  const recentDocs = [
    ...recentResumes.map((r: typeof recentResumes[number]) => ({
      id: r.id,
      type: "resume" as const,
      title: r.title,
      status: r.status,
      updatedAt: r.updatedAt,
    })),
    ...recentCoverLetters.map((cl: typeof recentCoverLetters[number]) => ({
      id: cl.id,
      type: "cover-letter" as const,
      title: cl.title,
      status: cl.status,
      updatedAt: cl.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

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

      {/* Quick Stats */}
      <QuickStats
        jobCount={totalJobs}
        resumeCount={resumeCount}
        coverLetterCount={coverLetterCount}
        profileCompleteness={completeness}
      />

      {/* Two-column: Profile Completeness + Job Pipeline */}
      <div className="grid md:grid-cols-2 gap-6 animate-fade-up">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-4">
          <h3 className="self-start text-sm font-semibold text-foreground">
            Profile Completeness
          </h3>
          <ProfileCompleteness
            {...profileProps}
            size={112}
            strokeWidth={8}
          />
          {completeness < 100 && (
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Complete your profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        <JobPipelineMini counts={jobCounts} />
      </div>

      {/* Recent Documents */}
      <div className="animate-fade-up">
        <RecentDocuments documents={recentDocs} />
      </div>

      {/* AI Tip */}
      <div className="animate-fade-up">
        <AiTip
          hasProfile={!!profile}
          completeness={completeness}
          jobCount={totalJobs}
          resumeCount={resumeCount}
          coverLetterCount={coverLetterCount}
        />
      </div>
    </div>
  );
}
