"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JobStatus } from "@/generated/prisma/enums";
import { type ActionResult, getSessionUserId } from "@/lib/actions";

const VALID_STATUSES = new Set<string>(Object.values(JobStatus));

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createJobListing(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const title = formData.get("title") as string | null;
  const company = formData.get("company") as string | null;
  if (!title || !company) return { success: false, error: "Title and company are required" };

  const description = formData.get("description") as string | null;
  if (!description) return { success: false, error: "Job description is required" };

  const url = formData.get("url") as string | null;
  const location = formData.get("location") as string | null;
  const salary = formData.get("salary") as string | null;

  await prisma.jobListing.create({
    data: {
      userId,
      title,
      company,
      description,
      url,
      location,
      salary,
      status: "SAVED",
    },
  });

  revalidatePath("/jobs");
  return { success: true };
}

export async function updateJobListing(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Job listing ID is required" };

  const title = formData.get("title") as string | null;
  const company = formData.get("company") as string | null;
  if (!title || !company) return { success: false, error: "Title and company are required" };

  const description = formData.get("description") as string | null;
  if (!description) return { success: false, error: "Job description is required" };

  const url = formData.get("url") as string | null;
  const location = formData.get("location") as string | null;
  const salary = formData.get("salary") as string | null;

  await prisma.jobListing.update({
    where: { id },
    data: { title, company, description, url, location, salary },
  });

  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteJobListing(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.jobListing.delete({ where: { id } });

  revalidatePath("/jobs");
  return { success: true };
}

export async function updateJobStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  if (!VALID_STATUSES.has(status)) {
    return { success: false, error: "Invalid status" };
  }

  await prisma.jobListing.update({
    where: { id },
    data: { status: status as JobStatus },
  });

  revalidatePath("/jobs");
  return { success: true };
}

export async function saveJobAnalysis(
  id: string,
  analysis: Record<string, unknown>
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.jobListing.update({
    where: { id },
    data: { analysis: JSON.parse(JSON.stringify(analysis)) },
  });

  revalidatePath("/jobs");
  return { success: true };
}
