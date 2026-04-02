import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { fetchProfileWithRelations } from "@/lib/profile-data";

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileCompleteness } from "@/components/profile/profile-completeness";
import { ProfileSections } from "@/components/profile/profile-sections";
import { ResumeImportButton } from "@/components/profile/resume-import-button";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await fetchProfileWithRelations(session.user.id);

  const experiences = (profile?.experiences ?? []).map((e) => ({
    id: e.id,
    company: e.company,
    title: e.title,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate,
    current: e.current,
    description: e.description,
    bullets: e.bullets as string[] | null,
    order: e.order,
  }));

  const educations = (profile?.educations ?? []).map((e) => ({
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
  }));

  const skills = (profile?.skills ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    level: s.level,
    order: s.order,
  }));

  const projects = (profile?.projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    url: p.url,
    startDate: p.startDate,
    endDate: p.endDate,
    bullets: p.bullets as string[] | null,
    order: p.order,
  }));

  const certifications = (profile?.certifications ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    issueDate: c.issueDate,
    expiryDate: c.expiryDate,
    url: c.url,
    order: c.order,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="animate-fade-up flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your professional profile is the foundation for all your resumes and
            cover letters.
          </p>
        </div>
        <ResumeImportButton />
      </div>

      {/* Completeness + Header */}
      <div className="flex flex-col sm:flex-row gap-6 animate-fade-up animate-delay-1">
        <div className="shrink-0">
          <ProfileCompleteness
            profile={profile}
            experienceCount={experiences.length}
            educationCount={educations.length}
            skillCount={skills.length}
            projectCount={projects.length}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ProfileHeader profile={profile} />
        </div>
      </div>

      {/* Sections */}
      <ProfileSections
        experiences={experiences}
        educations={educations}
        skills={skills}
        projects={projects}
        certifications={certifications}
      />
    </div>
  );
}
