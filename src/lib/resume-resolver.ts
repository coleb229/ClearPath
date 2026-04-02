import type {
  ResumeContent,
  ResolvedResumeData,
  ResolvedContact,
  ResolvedExperience,
  ResolvedEducation,
  ResolvedSkill,
  ResolvedProject,
  ResolvedCertification,
} from "@/types/resume";

function formatDate(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function parseBullets(bullets: unknown): string[] {
  if (Array.isArray(bullets)) return bullets.filter((b): b is string => typeof b === "string");
  return [];
}

export interface ProfileData {
  headline?: string | null;
  summary?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  experiences: Array<{
    id: string;
    company: string;
    title: string;
    location?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    current: boolean;
    bullets?: unknown;
    order: number;
  }>;
  educations: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string | null;
    startDate: Date | string;
    endDate?: Date | string | null;
    current: boolean;
    gpa?: string | null;
    description?: string | null;
    order: number;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category?: string | null;
    level: string;
    order: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description?: string | null;
    url?: string | null;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    bullets?: unknown;
    order: number;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate?: Date | string | null;
    expiryDate?: Date | string | null;
    url?: string | null;
    order: number;
  }>;
}

export interface UserData {
  name: string;
  email: string;
}

export function resolveResumeData(
  profile: ProfileData,
  content: ResumeContent,
  user: UserData
): ResolvedResumeData {
  const { overrides, sections, settings } = content;

  const contact: ResolvedContact = {
    name: user.name,
    email: user.email,
    phone: profile.phone ?? undefined,
    location: profile.location ?? undefined,
    website: profile.website ?? undefined,
    linkedin: profile.linkedin ?? undefined,
    github: profile.github ?? undefined,
  };

  const summary = overrides.summary ?? profile.summary ?? undefined;

  // Filter and resolve experiences
  let exps = [...profile.experiences].sort((a, b) => a.order - b.order);
  if (overrides.experienceIds) {
    const idSet = new Set(overrides.experienceIds);
    exps = exps.filter((e) => idSet.has(e.id));
  }
  const experiences: ResolvedExperience[] = exps.map((e) => ({
    id: e.id,
    company: e.company,
    title: e.title,
    location: e.location ?? undefined,
    startDate: formatDate(e.startDate)!,
    endDate: formatDate(e.endDate),
    current: e.current,
    bullets: overrides.bulletOverrides?.[e.id] ?? parseBullets(e.bullets),
  }));

  // Filter and resolve educations
  let edus = [...profile.educations].sort((a, b) => a.order - b.order);
  if (overrides.educationIds) {
    const idSet = new Set(overrides.educationIds);
    edus = edus.filter((e) => idSet.has(e.id));
  }
  const educations: ResolvedEducation[] = edus.map((e) => ({
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    field: e.field ?? undefined,
    startDate: formatDate(e.startDate)!,
    endDate: formatDate(e.endDate),
    current: e.current,
    gpa: e.gpa ?? undefined,
    description: e.description ?? undefined,
  }));

  // Filter and resolve skills
  let sks = [...profile.skills].sort((a, b) => a.order - b.order);
  if (overrides.skillIds) {
    const idSet = new Set(overrides.skillIds);
    sks = sks.filter((s) => idSet.has(s.id));
  }
  const skills: ResolvedSkill[] = sks.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category ?? undefined,
    level: s.level,
  }));

  // Filter and resolve projects
  let projs = [...profile.projects].sort((a, b) => a.order - b.order);
  if (overrides.projectIds) {
    const idSet = new Set(overrides.projectIds);
    projs = projs.filter((p) => idSet.has(p.id));
  }
  const projects: ResolvedProject[] = projs.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    url: p.url ?? undefined,
    startDate: formatDate(p.startDate),
    endDate: formatDate(p.endDate),
    bullets: parseBullets(p.bullets),
  }));

  // Filter and resolve certifications
  let certs = [...profile.certifications].sort((a, b) => a.order - b.order);
  if (overrides.certificationIds) {
    const idSet = new Set(overrides.certificationIds);
    certs = certs.filter((c) => idSet.has(c.id));
  }
  const certifications: ResolvedCertification[] = certs.map((c) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    issueDate: formatDate(c.issueDate),
    expiryDate: formatDate(c.expiryDate),
    url: c.url ?? undefined,
  }));

  const enabledSections = sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return {
    contact,
    summary,
    experiences,
    educations,
    skills,
    projects,
    certifications,
    sections: enabledSections,
    settings,
  };
}
