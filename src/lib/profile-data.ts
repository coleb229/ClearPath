import { prisma } from "./prisma";
import type { ProfileData } from "./resume-resolver";

// ---------------------------------------------------------------------------
// Shared Prisma include for profile with ordered relations
// ---------------------------------------------------------------------------

export const PROFILE_WITH_RELATIONS = {
  experiences: { orderBy: { order: "asc" as const } },
  educations: { orderBy: { order: "asc" as const } },
  skills: { orderBy: { order: "asc" as const } },
  projects: { orderBy: { order: "asc" as const } },
  certifications: { orderBy: { order: "asc" as const } },
};

// ---------------------------------------------------------------------------
// Fetch a user's profile with all ordered relations
// ---------------------------------------------------------------------------

export async function fetchProfileWithRelations(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    include: PROFILE_WITH_RELATIONS,
  });
}

// ---------------------------------------------------------------------------
// Map Prisma profile result to ProfileData (for resume-resolver)
// ---------------------------------------------------------------------------

type ProfileWithRelations = NonNullable<
  Awaited<ReturnType<typeof fetchProfileWithRelations>>
>;

export function mapProfileData(
  profile: ProfileWithRelations | null | undefined
): ProfileData {
  return {
    headline: profile?.headline,
    summary: profile?.summary,
    phone: profile?.phone,
    location: profile?.location,
    website: profile?.website,
    linkedin: profile?.linkedin,
    github: profile?.github,
    experiences: (profile?.experiences ?? []).map((e) => ({
      id: e.id,
      company: e.company,
      title: e.title,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      bullets: e.bullets,
      order: e.order,
    })),
    educations: (profile?.educations ?? []).map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      gpa: e.gpa,
      description: e.description,
      order: e.order,
    })),
    skills: (profile?.skills ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      level: s.level,
      order: s.order,
    })),
    projects: (profile?.projects ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      url: p.url,
      startDate: p.startDate,
      endDate: p.endDate,
      bullets: p.bullets,
      order: p.order,
    })),
    certifications: (profile?.certifications ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      url: c.url,
      order: c.order,
    })),
  };
}
