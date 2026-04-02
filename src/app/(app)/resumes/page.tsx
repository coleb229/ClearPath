import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ensureSystemTemplates } from "@/lib/templates";
import { ResumesView } from "@/components/resumes/resumes-view";

export default async function ResumesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await ensureSystemTemplates();

  const [resumes, jobListings, templates] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { template: true, jobListing: true },
    }),
    prisma.jobListing.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, company: true },
    }),
    prisma.template.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
    }),
  ]);

  const mappedResumes = resumes.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    templateName: r.template?.name ?? null,
    jobTitle: r.jobListing?.title ?? null,
    jobCompany: r.jobListing?.company ?? null,
    updatedAt: r.updatedAt,
  }));

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Resumes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage tailored resumes for different job applications.
        </p>
      </div>

      <ResumesView
        resumes={mappedResumes}
        jobs={jobListings}
        templates={templates}
      />
    </div>
  );
}
