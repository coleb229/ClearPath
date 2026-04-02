import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ResumeEditor } from "@/components/resumes/resume-editor";
import type { ResumeContent } from "@/types/resume";
import { createDefaultContent } from "@/types/resume";
import { fetchProfileWithRelations, mapProfileData } from "@/lib/profile-data";

export default async function ResumeEditorPage({
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
    prisma.template.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!resume) notFound();

  const content = (resume.content as unknown as ResumeContent) ?? createDefaultContent();
  const jobAnalysis = resume.jobListing?.analysis as Record<
    string,
    unknown
  > | null;

  const profileData = mapProfileData(profile);
  const userSkills = (profile?.skills ?? []).map((s) => s.name);

  return (
    <ResumeEditor
      resume={{
        id: resume.id,
        title: resume.title,
        status: resume.status,
        templateId: resume.templateId,
        templateSlug: resume.template?.slug ?? "clean",
        content,
        jobListingId: resume.jobListingId,
      }}
      profile={profileData}
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
      }}
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        category: t.category,
      }))}
      jobAnalysis={jobAnalysis}
      userSkills={userSkills}
    />
  );
}
