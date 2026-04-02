"use client";

import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  FolderOpen,
  Award,
} from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { ExperienceForm } from "./experience-form";
import { EducationForm } from "./education-form";
import { SkillsManager } from "./skills-manager";
import { ProjectsForm } from "./projects-form";
import { CertificationsForm } from "./certifications-form";

interface ProfileSectionsProps {
  experiences: {
    id: string;
    company: string;
    title: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    description: string | null;
    bullets: string[] | null;
    order: number;
  }[];
  educations: {
    id: string;
    institution: string;
    degree: string;
    field: string | null;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    gpa: string | null;
    description: string | null;
    order: number;
  }[];
  skills: {
    id: string;
    name: string;
    category: string | null;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    order: number;
  }[];
  projects: {
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    startDate: Date | null;
    endDate: Date | null;
    bullets: string[] | null;
    order: number;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issueDate: Date | null;
    expiryDate: Date | null;
    url: string | null;
    order: number;
  }[];
}

export function ProfileSections({
  experiences,
  educations,
  skills,
  projects,
  certifications,
}: ProfileSectionsProps) {
  return (
    <>
      <div className="animate-fade-up animate-delay-2">
        <SectionCard
          icon={Briefcase}
          title="Experience"
          count={experiences.length}
        >
          <ExperienceForm experiences={experiences} />
        </SectionCard>
      </div>

      <div className="animate-fade-up animate-delay-3">
        <SectionCard
          icon={GraduationCap}
          title="Education"
          count={educations.length}
        >
          <EducationForm educations={educations} />
        </SectionCard>
      </div>

      <div className="animate-fade-up animate-delay-4">
        <SectionCard
          icon={Lightbulb}
          title="Skills"
          count={skills.length}
        >
          <SkillsManager skills={skills} />
        </SectionCard>
      </div>

      <div className="animate-fade-up animate-delay-5">
        <SectionCard
          icon={FolderOpen}
          title="Projects"
          count={projects.length}
        >
          <ProjectsForm projects={projects} />
        </SectionCard>
      </div>

      <div className="animate-fade-up">
        <SectionCard
          icon={Award}
          title="Certifications"
          count={certifications.length}
        >
          <CertificationsForm certifications={certifications} />
        </SectionCard>
      </div>
    </>
  );
}
