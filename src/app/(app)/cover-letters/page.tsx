import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CoverLettersView } from "@/components/cover-letters/cover-letters-view";

export default async function CoverLettersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [coverLetters, jobListings] = await Promise.all([
    prisma.coverLetter.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { jobListing: true },
    }),
    prisma.jobListing.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, company: true },
    }),
  ]);

  const mappedCoverLetters = coverLetters.map((cl: typeof coverLetters[number]) => ({
    id: cl.id,
    title: cl.title,
    status: cl.status,
    jobTitle: cl.jobListing?.title ?? null,
    jobCompany: cl.jobListing?.company ?? null,
    hasContent: !!cl.content,
    updatedAt: cl.updatedAt,
  }));

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Cover Letters
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write personalized cover letters for each application.
        </p>
      </div>

      <CoverLettersView
        coverLetters={mappedCoverLetters}
        jobs={jobListings}
      />
    </div>
  );
}
