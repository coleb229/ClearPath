import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { resolveResumeData } from "@/lib/resume-resolver";
import type { ResumeContent } from "@/types/resume";
import { createDefaultContent } from "@/types/resume";
import { fetchProfileWithRelations, mapProfileData } from "@/lib/profile-data";
import { PreviewPage } from "./preview-page";

export default async function ResumePreviewRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [resume, profile, templates] = await Promise.all([
    prisma.resume.findFirst({
      where: { id, userId: session.user.id },
      include: { template: true, jobListing: true },
    }),
    fetchProfileWithRelations(session.user.id),
    prisma.template.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!resume) notFound();

  const content =
    (resume.content as unknown as ResumeContent) ?? createDefaultContent();
  const jobAnalysis = resume.jobListing?.analysis as Record<
    string,
    unknown
  > | null;
  const profileData = mapProfileData(profile);
  const userSkills = (profile?.skills ?? []).map((s) => s.name);

  const resolvedData = resolveResumeData(profileData, content, {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
  });

  return (
    <PreviewPage
      resume={{
        id: resume.id,
        title: resume.title,
        templateSlug: resume.template?.slug ?? "clean",
        templateId: resume.templateId,
        content,
        jobListingId: resume.jobListingId,
      }}
      profile={profileData}
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
      }}
      initialResolvedData={resolvedData}
      jobAnalysis={jobAnalysis}
      userSkills={userSkills}
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        category: t.category,
      }))}
    />
  );
}
