import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { JobsView } from "@/components/jobs/jobs-view";

export default async function JobsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [jobListings, profile] = await Promise.all([
    prisma.jobListing.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { skills: true },
    }),
  ]);

  const jobs = jobListings.map((j: typeof jobListings[number]) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    description: j.description,
    location: j.location,
    salary: j.salary,
    status: j.status,
    url: j.url,
    createdAt: j.createdAt,
    analysis: j.analysis as Record<string, unknown> | null,
  }));

  const userSkills = (profile?.skills ?? []).map((s: { name: string }) => s.name);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Job Tracker
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your job applications and let AI analyze job descriptions to help
          tailor your resumes.
        </p>
      </div>

      <JobsView jobs={jobs} userSkills={userSkills} />
    </div>
  );
}
