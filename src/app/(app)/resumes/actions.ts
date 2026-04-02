"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DocStatus } from "@/generated/prisma/enums";
import { createDefaultContent } from "@/types/resume";
import type { ResumeContent } from "@/types/resume";
import { type ActionResult, type ActionResultWithId, getSessionUserId } from "@/lib/actions";

const VALID_STATUSES = new Set<string>(Object.values(DocStatus));

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createResume(
  formData: FormData
): Promise<ActionResultWithId> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const title =
    (formData.get("title") as string | null)?.trim() || "Untitled Resume";
  const jobListingId = (formData.get("jobListingId") as string | null) || null;
  const templateId = (formData.get("templateId") as string | null) || null;

  if (jobListingId) {
    const job = await prisma.jobListing.findFirst({
      where: { id: jobListingId, userId },
    });
    if (!job) return { success: false, error: "Job listing not found" };
  }

  if (templateId) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });
    if (!template) return { success: false, error: "Template not found" };
  }

  const resume = await prisma.resume.create({
    data: {
      userId,
      title,
      content: JSON.parse(JSON.stringify(createDefaultContent())),
      templateId,
      jobListingId,
    },
  });

  revalidatePath("/resumes");
  return { success: true, id: resume.id };
}

export async function updateResume(
  formData: FormData
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Resume ID is required" };

  const title = (formData.get("title") as string | null)?.trim();
  const status = formData.get("status") as string | null;

  const data: Record<string, unknown> = {};
  if (title) data.title = title;
  if (status && VALID_STATUSES.has(status)) data.status = status as DocStatus;

  if (Object.keys(data).length === 0) {
    return { success: false, error: "No fields to update" };
  }

  await prisma.resume.update({
    where: { id, userId },
    data,
  });

  revalidatePath("/resumes");
  return { success: true };
}

export async function deleteResume(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.resume.delete({ where: { id, userId } });

  revalidatePath("/resumes");
  return { success: true };
}

export async function duplicateResume(
  id: string
): Promise<ActionResultWithId> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const original = await prisma.resume.findFirst({
    where: { id, userId },
  });
  if (!original) return { success: false, error: "Resume not found" };

  const copy = await prisma.resume.create({
    data: {
      userId,
      title: `Copy of ${original.title}`,
      content: original.content ?? JSON.parse(JSON.stringify(createDefaultContent())),
      templateId: original.templateId,
      status: "DRAFT",
    },
  });

  revalidatePath("/resumes");
  return { success: true, id: copy.id };
}

export async function updateResumeContent(
  id: string,
  content: ResumeContent
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.resume.update({
    where: { id, userId },
    data: { content: JSON.parse(JSON.stringify(content)) },
  });

  revalidatePath(`/resumes/${id}`);
  return { success: true };
}

export async function updateResumeTemplate(
  id: string,
  templateId: string
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });
  if (!template) return { success: false, error: "Template not found" };

  await prisma.resume.update({
    where: { id, userId },
    data: { templateId },
  });

  revalidatePath(`/resumes/${id}`);
  return { success: true };
}
