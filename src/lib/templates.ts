import { prisma } from "./prisma";

const SYSTEM_TEMPLATES = [
  {
    slug: "clean",
    name: "Clean",
    description: "Single-column ATS-friendly layout. Simple, readable, and optimized for applicant tracking systems.",
    category: "professional",
    layout: {
      columns: 1,
      headerPosition: "top",
      sectionSeparator: "space",
      skillsPosition: "main",
    },
  },
  {
    slug: "modern",
    name: "Modern",
    description: "Two-column layout with a sidebar for contact info and skills. Clean and contemporary.",
    category: "creative",
    layout: {
      columns: 2,
      headerPosition: "top",
      sectionSeparator: "none",
      skillsPosition: "sidebar",
      sidebarSections: ["contact", "skills", "certifications"],
      mainSections: ["summary", "experience", "education", "projects"],
    },
  },
  {
    slug: "professional",
    name: "Professional",
    description: "Traditional single-column format with horizontal rules between sections. Classic and authoritative.",
    category: "professional",
    layout: {
      columns: 1,
      headerPosition: "center",
      sectionSeparator: "rule",
      skillsPosition: "main",
    },
  },
];

let seeded = false;

export async function ensureSystemTemplates() {
  if (seeded) return;
  await Promise.all(
    SYSTEM_TEMPLATES.map((t) =>
      prisma.template.upsert({
        where: { slug: t.slug },
        create: {
          name: t.name,
          slug: t.slug,
          description: t.description,
          category: t.category,
          layout: t.layout,
          isSystem: true,
        },
        update: {},
      })
    )
  );
  seeded = true;
}
