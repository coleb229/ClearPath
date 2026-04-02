import { auth } from "../../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CoverLetterEditor } from "@/components/cover-letters/cover-letter-editor";
import { fetchProfileWithRelations, mapProfileData } from "@/lib/profile-data";

export default async function CoverLetterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [coverLetter, profile] = await Promise.all([
    prisma.coverLetter.findFirst({
      where: { id, userId: session.user.id },
      include: { jobListing: true },
    }),
    fetchProfileWithRelations(session.user.id),
  ]);

  if (!coverLetter) notFound();

  const profileData = mapProfileData(profile) as unknown as Record<string, unknown>;

  const job = coverLetter.jobListing
    ? {
        title: coverLetter.jobListing.title,
        company: coverLetter.jobListing.company,
        description: coverLetter.jobListing.description ?? "",
      }
    : null;

  return (
    <CoverLetterEditor
      coverLetter={{
        id: coverLetter.id,
        title: coverLetter.title,
        status: coverLetter.status,
        content: coverLetter.content,
        jobListingId: coverLetter.jobListingId,
      }}
      profile={profileData}
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        phone: profile?.phone ?? undefined,
      }}
      job={job}
    />
  );
}
