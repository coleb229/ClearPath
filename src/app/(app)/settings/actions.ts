"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { type ActionResult, getSessionUserId } from "@/lib/actions";
import { PROFILE_WITH_RELATIONS } from "@/lib/profile-data";

export async function updateUserName(name: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name cannot be empty" };

  await prisma.user.update({
    where: { id: userId },
    data: { name: trimmed },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function exportUserData(): Promise<
  { success: true; data: string } | { success: false; error: string }
> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: PROFILE_WITH_RELATIONS,
      },
      resumes: {
        include: {
          template: { select: { name: true, slug: true } },
          jobListing: { select: { title: true, company: true } },
        },
      },
      coverLetters: {
        include: {
          jobListing: { select: { title: true, company: true } },
        },
      },
      jobListings: true,
    },
  });

  if (!user) return { success: false, error: "User not found" };

  // Strip internal IDs and sensitive fields
  const exportData = {
    exportedAt: new Date().toISOString(),
    account: {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    profile: user.profile
      ? {
          headline: user.profile.headline,
          summary: user.profile.summary,
          phone: user.profile.phone,
          location: user.profile.location,
          website: user.profile.website,
          linkedin: user.profile.linkedin,
          github: user.profile.github,
          experiences: user.profile.experiences.map((e) => ({
            company: e.company,
            title: e.title,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,
            current: e.current,
            description: e.description,
            bullets: e.bullets,
          })),
          educations: user.profile.educations.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            field: e.field,
            startDate: e.startDate,
            endDate: e.endDate,
            current: e.current,
            gpa: e.gpa,
            description: e.description,
          })),
          skills: user.profile.skills.map((s) => ({
            name: s.name,
            category: s.category,
            level: s.level,
          })),
          projects: user.profile.projects.map((p) => ({
            name: p.name,
            description: p.description,
            url: p.url,
            startDate: p.startDate,
            endDate: p.endDate,
            bullets: p.bullets,
          })),
          certifications: user.profile.certifications.map((c) => ({
            name: c.name,
            issuer: c.issuer,
            issueDate: c.issueDate,
            expiryDate: c.expiryDate,
            url: c.url,
          })),
        }
      : null,
    resumes: user.resumes.map((r) => ({
      title: r.title,
      status: r.status,
      template: r.template?.name ?? null,
      linkedJob: r.jobListing
        ? `${r.jobListing.title} at ${r.jobListing.company}`
        : null,
      content: r.content,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    coverLetters: user.coverLetters.map((cl) => ({
      title: cl.title,
      status: cl.status,
      linkedJob: cl.jobListing
        ? `${cl.jobListing.title} at ${cl.jobListing.company}`
        : null,
      content: cl.content,
      createdAt: cl.createdAt,
      updatedAt: cl.updatedAt,
    })),
    jobListings: user.jobListings.map((j) => ({
      title: j.title,
      company: j.company,
      url: j.url,
      location: j.location,
      salary: j.salary,
      status: j.status,
      description: j.description,
      analysis: j.analysis,
      createdAt: j.createdAt,
    })),
  };

  return { success: true, data: JSON.stringify(exportData, null, 2) };
}

export async function deleteAccount(): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.user.delete({ where: { id: userId } });

  return { success: true };
}
