"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SkillLevel } from "@/generated/prisma/enums";
import { type ActionResult, getSessionUserId } from "@/lib/actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseMonthDate(value: string | null): Date | null {
  if (!value) return null;
  return new Date(`${value}-01T00:00:00Z`);
}

async function ensureProfile(userId: string) {
  return prisma.profile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

const VALID_SKILL_LEVELS = new Set<string>(Object.values(SkillLevel));

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const headline = formData.get("headline") as string | null;
  const summary = formData.get("summary") as string | null;
  const phone = formData.get("phone") as string | null;
  const location = formData.get("location") as string | null;
  const website = formData.get("website") as string | null;
  const linkedin = formData.get("linkedin") as string | null;
  const github = formData.get("github") as string | null;

  await prisma.profile.upsert({
    where: { userId },
    create: { userId, headline, summary, phone, location, website, linkedin, github },
    update: { headline, summary, phone, location, website, linkedin, github },
  });

  revalidatePath("/profile");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export async function createExperience(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const profile = await ensureProfile(userId);

  const company = formData.get("company") as string | null;
  const title = formData.get("title") as string | null;
  if (!company || !title) return { success: false, error: "Company and title are required" };

  const location = formData.get("location") as string | null;
  const startDate = parseMonthDate(formData.get("startDate") as string | null);
  if (!startDate) return { success: false, error: "Start date is required" };

  const endDate = parseMonthDate(formData.get("endDate") as string | null);
  const current = formData.get("current") === "on";
  const description = formData.get("description") as string | null;

  const bulletsRaw = formData.get("bullets") as string | null;
  const bullets = bulletsRaw ? JSON.parse(bulletsRaw) : null;

  const count = await prisma.experience.count({ where: { profileId: profile.id } });

  await prisma.experience.create({
    data: {
      profileId: profile.id,
      company,
      title,
      location,
      startDate,
      endDate,
      current,
      description,
      bullets,
      order: count,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateExperience(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await ensureProfile(userId);

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Experience ID is required" };

  const company = formData.get("company") as string | null;
  const title = formData.get("title") as string | null;
  if (!company || !title) return { success: false, error: "Company and title are required" };

  const location = formData.get("location") as string | null;
  const startDate = parseMonthDate(formData.get("startDate") as string | null);
  if (!startDate) return { success: false, error: "Start date is required" };

  const endDate = parseMonthDate(formData.get("endDate") as string | null);
  const current = formData.get("current") === "on";
  const description = formData.get("description") as string | null;

  const bulletsRaw = formData.get("bullets") as string | null;
  const bullets = bulletsRaw ? JSON.parse(bulletsRaw) : null;

  await prisma.experience.update({
    where: { id },
    data: {
      company,
      title,
      location,
      startDate,
      endDate,
      current,
      description,
      bullets,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.experience.delete({ where: { id } });

  revalidatePath("/profile");
  return { success: true };
}

export async function reorderExperiences(orderedIds: string[]): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.experience.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/profile");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export async function createEducation(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const profile = await ensureProfile(userId);

  const institution = formData.get("institution") as string | null;
  const degree = formData.get("degree") as string | null;
  if (!institution || !degree) return { success: false, error: "Institution and degree are required" };

  const field = formData.get("field") as string | null;
  const startDate = parseMonthDate(formData.get("startDate") as string | null);
  if (!startDate) return { success: false, error: "Start date is required" };

  const endDate = parseMonthDate(formData.get("endDate") as string | null);
  const current = formData.get("current") === "on";
  const gpa = formData.get("gpa") as string | null;
  const description = formData.get("description") as string | null;

  const count = await prisma.education.count({ where: { profileId: profile.id } });

  await prisma.education.create({
    data: {
      profileId: profile.id,
      institution,
      degree,
      field,
      startDate,
      endDate,
      current,
      gpa,
      description,
      order: count,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateEducation(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await ensureProfile(userId);

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Education ID is required" };

  const institution = formData.get("institution") as string | null;
  const degree = formData.get("degree") as string | null;
  if (!institution || !degree) return { success: false, error: "Institution and degree are required" };

  const field = formData.get("field") as string | null;
  const startDate = parseMonthDate(formData.get("startDate") as string | null);
  if (!startDate) return { success: false, error: "Start date is required" };

  const endDate = parseMonthDate(formData.get("endDate") as string | null);
  const current = formData.get("current") === "on";
  const gpa = formData.get("gpa") as string | null;
  const description = formData.get("description") as string | null;

  await prisma.education.update({
    where: { id },
    data: {
      institution,
      degree,
      field,
      startDate,
      endDate,
      current,
      gpa,
      description,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.education.delete({ where: { id } });

  revalidatePath("/profile");
  return { success: true };
}

export async function reorderEducations(orderedIds: string[]): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.education.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/profile");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Skill
// ---------------------------------------------------------------------------

export async function createSkill(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const profile = await ensureProfile(userId);

  const name = formData.get("name") as string | null;
  if (!name) return { success: false, error: "Skill name is required" };

  const category = formData.get("category") as string | null;
  const levelRaw = (formData.get("level") as string | null) ?? "INTERMEDIATE";
  const level = VALID_SKILL_LEVELS.has(levelRaw) ? (levelRaw as SkillLevel) : "INTERMEDIATE";

  const count = await prisma.skill.count({ where: { profileId: profile.id } });

  await prisma.skill.create({
    data: {
      profileId: profile.id,
      name,
      category,
      level,
      order: count,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateSkill(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await ensureProfile(userId);

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Skill ID is required" };

  const name = formData.get("name") as string | null;
  if (!name) return { success: false, error: "Skill name is required" };

  const category = formData.get("category") as string | null;
  const levelRaw = (formData.get("level") as string | null) ?? "INTERMEDIATE";
  const level = VALID_SKILL_LEVELS.has(levelRaw) ? (levelRaw as SkillLevel) : "INTERMEDIATE";

  await prisma.skill.update({
    where: { id },
    data: { name, category, level },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.skill.delete({ where: { id } });

  revalidatePath("/profile");
  return { success: true };
}

export async function reorderSkills(orderedIds: string[]): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.skill.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/profile");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export async function createProject(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const profile = await ensureProfile(userId);

  const name = formData.get("name") as string | null;
  if (!name) return { success: false, error: "Project name is required" };

  const description = formData.get("description") as string | null;
  const url = formData.get("url") as string | null;
  const startDate = parseMonthDate(formData.get("startDate") as string | null);
  const endDate = parseMonthDate(formData.get("endDate") as string | null);

  const bulletsRaw = formData.get("bullets") as string | null;
  const bullets = bulletsRaw ? JSON.parse(bulletsRaw) : null;

  const count = await prisma.project.count({ where: { profileId: profile.id } });

  await prisma.project.create({
    data: {
      profileId: profile.id,
      name,
      description,
      url,
      startDate,
      endDate,
      bullets,
      order: count,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await ensureProfile(userId);

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Project ID is required" };

  const name = formData.get("name") as string | null;
  if (!name) return { success: false, error: "Project name is required" };

  const description = formData.get("description") as string | null;
  const url = formData.get("url") as string | null;
  const startDate = parseMonthDate(formData.get("startDate") as string | null);
  const endDate = parseMonthDate(formData.get("endDate") as string | null);

  const bulletsRaw = formData.get("bullets") as string | null;
  const bullets = bulletsRaw ? JSON.parse(bulletsRaw) : null;

  await prisma.project.update({
    where: { id },
    data: { name, description, url, startDate, endDate, bullets },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.project.delete({ where: { id } });

  revalidatePath("/profile");
  return { success: true };
}

export async function reorderProjects(orderedIds: string[]): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.project.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/profile");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Certification
// ---------------------------------------------------------------------------

export async function createCertification(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const profile = await ensureProfile(userId);

  const name = formData.get("name") as string | null;
  const issuer = formData.get("issuer") as string | null;
  if (!name || !issuer) return { success: false, error: "Name and issuer are required" };

  const issueDate = parseMonthDate(formData.get("issueDate") as string | null);
  const expiryDate = parseMonthDate(formData.get("expiryDate") as string | null);
  const url = formData.get("url") as string | null;

  const count = await prisma.certification.count({ where: { profileId: profile.id } });

  await prisma.certification.create({
    data: {
      profileId: profile.id,
      name,
      issuer,
      issueDate,
      expiryDate,
      url,
      order: count,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateCertification(formData: FormData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await ensureProfile(userId);

  const id = formData.get("id") as string | null;
  if (!id) return { success: false, error: "Certification ID is required" };

  const name = formData.get("name") as string | null;
  const issuer = formData.get("issuer") as string | null;
  if (!name || !issuer) return { success: false, error: "Name and issuer are required" };

  const issueDate = parseMonthDate(formData.get("issueDate") as string | null);
  const expiryDate = parseMonthDate(formData.get("expiryDate") as string | null);
  const url = formData.get("url") as string | null;

  await prisma.certification.update({
    where: { id },
    data: { name, issuer, issueDate, expiryDate, url },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.certification.delete({ where: { id } });

  revalidatePath("/profile");
  return { success: true };
}

export async function reorderCertifications(orderedIds: string[]): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.certification.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/profile");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Resume Import
// ---------------------------------------------------------------------------

interface ResumeImportData {
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  experiences?: {
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string | null;
    current?: boolean;
    description?: string;
    bullets?: string[];
  }[];
  educations?: {
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string | null;
    current?: boolean;
    gpa?: string;
    description?: string;
  }[];
  skills?: {
    name: string;
    category?: string;
    level?: string;
  }[];
  projects?: {
    name: string;
    description?: string;
    url?: string;
    startDate?: string | null;
    endDate?: string | null;
    bullets?: string[];
  }[];
  certifications?: {
    name: string;
    issuer: string;
    issueDate?: string | null;
    expiryDate?: string | null;
    url?: string;
  }[];
}

export async function importResumeData(data: ResumeImportData): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  const profile = await ensureProfile(userId);

  // Update profile fields
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      headline: data.headline || profile.headline,
      summary: data.summary || profile.summary,
      phone: data.phone || profile.phone,
      location: data.location || profile.location,
      website: data.website || profile.website,
      linkedin: data.linkedin || profile.linkedin,
      github: data.github || profile.github,
    },
  });

  // Import experiences
  if (data.experiences?.length) {
    const existingCount = await prisma.experience.count({ where: { profileId: profile.id } });
    await prisma.experience.createMany({
      data: data.experiences.map((exp, i) => ({
        profileId: profile.id,
        company: exp.company,
        title: exp.title,
        location: exp.location || null,
        startDate: parseMonthDate(exp.startDate) ?? new Date(),
        endDate: parseMonthDate(exp.endDate ?? null),
        current: exp.current ?? false,
        description: exp.description || null,
        bullets: exp.bullets?.length ? exp.bullets : undefined,
        order: existingCount + i,
      })),
    });
  }

  // Import educations
  if (data.educations?.length) {
    const existingCount = await prisma.education.count({ where: { profileId: profile.id } });
    await prisma.education.createMany({
      data: data.educations.map((edu, i) => ({
        profileId: profile.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field || null,
        startDate: parseMonthDate(edu.startDate) ?? new Date(),
        endDate: parseMonthDate(edu.endDate ?? null),
        current: edu.current ?? false,
        gpa: edu.gpa || null,
        description: edu.description || null,
        order: existingCount + i,
      })),
    });
  }

  // Import skills
  if (data.skills?.length) {
    const existingCount = await prisma.skill.count({ where: { profileId: profile.id } });
    await prisma.skill.createMany({
      data: data.skills.map((skill, i) => ({
        profileId: profile.id,
        name: skill.name,
        category: skill.category || null,
        level: VALID_SKILL_LEVELS.has(skill.level ?? "") ? (skill.level as SkillLevel) : "INTERMEDIATE",
        order: existingCount + i,
      })),
    });
  }

  // Import projects
  if (data.projects?.length) {
    const existingCount = await prisma.project.count({ where: { profileId: profile.id } });
    await prisma.project.createMany({
      data: data.projects.map((proj, i) => ({
        profileId: profile.id,
        name: proj.name,
        description: proj.description || null,
        url: proj.url || null,
        startDate: parseMonthDate(proj.startDate ?? null),
        endDate: parseMonthDate(proj.endDate ?? null),
        bullets: proj.bullets?.length ? proj.bullets : undefined,
        order: existingCount + i,
      })),
    });
  }

  // Import certifications
  if (data.certifications?.length) {
    const existingCount = await prisma.certification.count({ where: { profileId: profile.id } });
    await prisma.certification.createMany({
      data: data.certifications.map((cert, i) => ({
        profileId: profile.id,
        name: cert.name,
        issuer: cert.issuer || '',
        issueDate: parseMonthDate(cert.issueDate ?? null),
        expiryDate: parseMonthDate(cert.expiryDate ?? null),
        url: cert.url || null,
        order: existingCount + i,
      })),
    });
  }

  revalidatePath("/profile");
  return { success: true };
}
