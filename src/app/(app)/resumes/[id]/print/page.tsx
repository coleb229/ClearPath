import { auth } from "../../../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { resolveResumeData } from "@/lib/resume-resolver";
import type { ResumeContent } from "@/types/resume";
import { createDefaultContent } from "@/types/resume";
import { PrintView } from "./print-view";
import { fetchProfileWithRelations, mapProfileData } from "@/lib/profile-data";

export default async function ResumePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [resume, profile] = await Promise.all([
    prisma.resume.findFirst({
      where: { id, userId: session.user.id },
      include: { template: true },
    }),
    fetchProfileWithRelations(session.user.id),
  ]);

  if (!resume) notFound();

  const content =
    (resume.content as unknown as ResumeContent) ?? createDefaultContent();

  const profileData = mapProfileData(profile);

  const resolvedData = resolveResumeData(profileData, content, {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
  });

  const templateSlug = resume.template?.slug ?? "clean";

  return <PrintView data={resolvedData} templateSlug={templateSlug} />;
}
