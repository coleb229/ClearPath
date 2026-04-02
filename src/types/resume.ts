export type ResumeSectionType =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications";

export interface ResumeSection {
  type: ResumeSectionType;
  enabled: boolean;
  order: number;
}

export interface ResumeOverrides {
  summary?: string;
  experienceIds?: string[];
  educationIds?: string[];
  skillIds?: string[];
  projectIds?: string[];
  certificationIds?: string[];
  bulletOverrides?: Record<string, string[]>;
}

export interface ResumeSettings {
  colorScheme?: string;
  fontSize?: "sm" | "base" | "lg";
  spacing?: "compact" | "normal" | "relaxed";
}

export interface ResumeContent {
  sections: ResumeSection[];
  overrides: ResumeOverrides;
  settings: ResumeSettings;
}

export const DEFAULT_SECTIONS: ResumeSection[] = [
  { type: "header", enabled: true, order: 0 },
  { type: "summary", enabled: true, order: 1 },
  { type: "experience", enabled: true, order: 2 },
  { type: "education", enabled: true, order: 3 },
  { type: "skills", enabled: true, order: 4 },
  { type: "projects", enabled: true, order: 5 },
  { type: "certifications", enabled: true, order: 6 },
];

export function createDefaultContent(): ResumeContent {
  return {
    sections: [...DEFAULT_SECTIONS],
    overrides: {},
    settings: { fontSize: "base", spacing: "normal" },
  };
}

// Resolved types for template rendering

export interface ResolvedContact {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ResolvedExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bullets: string[];
}

export interface ResolvedEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface ResolvedSkill {
  id: string;
  name: string;
  category?: string;
  level: string;
}

export interface ResolvedProject {
  id: string;
  name: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface ResolvedCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  url?: string;
}

export interface ResolvedResumeData {
  contact: ResolvedContact;
  summary?: string;
  experiences: ResolvedExperience[];
  educations: ResolvedEducation[];
  skills: ResolvedSkill[];
  projects: ResolvedProject[];
  certifications: ResolvedCertification[];
  sections: ResumeSection[];
  settings: ResumeSettings;
}
