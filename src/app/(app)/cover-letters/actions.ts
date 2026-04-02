"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DocStatus } from "@/generated/prisma/enums";
import { type ActionResult, type ActionResultWithId, getSessionUserId } from "@/lib/actions";

const VALID_STATUSES = new Set<string>(Object.values(DocStatus));

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createCoverLetter(
  formData: FormData
): Promise<ActionResultWithId> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const title =
    (formData.get("title") as string | null)?.trim() ||
    "Untitled Cover Letter";
  const jobListingId = (formData.get("jobListingId") as string | null) || null;

  if (jobListingId) {
    const job = await prisma.jobListing.findFirst({
      where: { id: jobListingId, userId },
    });
    if (!job) return { success: false, error: "Job listing not found" };
  }

  const coverLetter = await prisma.coverLetter.create({
    data: {
      userId,
      title,
      jobListingId,
    },
  });

  revalidatePath("/cover-letters");
  return { success: true, id: coverLetter.id };
}

export async function updateCoverLetter(
  formData: FormData
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Cover letter ID is required" };

  const title = (formData.get("title") as string | null)?.trim();
  const status = formData.get("status") as string | null;

  const data: Record<string, unknown> = {};
  if (title) data.title = title;
  if (status && VALID_STATUSES.has(status)) data.status = status as DocStatus;

  if (Object.keys(data).length === 0) {
    return { success: false, error: "No fields to update" };
  }

  await prisma.coverLetter.update({
    where: { id, userId },
    data,
  });

  revalidatePath("/cover-letters");
  return { success: true };
}

export async function deleteCoverLetter(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.coverLetter.delete({ where: { id, userId } });

  revalidatePath("/cover-letters");
  return { success: true };
}

export async function duplicateCoverLetter(
  id: string
): Promise<ActionResultWithId> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const original = await prisma.coverLetter.findFirst({
    where: { id, userId },
  });
  if (!original) return { success: false, error: "Cover letter not found" };

  const copy = await prisma.coverLetter.create({
    data: {
      userId,
      title: `Copy of ${original.title}`,
      content: original.content,
      jobListingId: original.jobListingId,
      status: "DRAFT",
    },
  });

  revalidatePath("/cover-letters");
  return { success: true, id: copy.id };
}

export async function updateCoverLetterContent(
  id: string,
  content: string
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.coverLetter.update({
    where: { id, userId },
    data: { content },
  });

  revalidatePath(`/cover-letters/${id}`);
  return { success: true };
}
