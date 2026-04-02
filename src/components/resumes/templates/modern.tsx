"use client";

import type { ResolvedResumeData, ResumeSection } from "@/types/resume";

interface ModernTemplateProps {
  data: ResolvedResumeData;
}

const SIDEBAR_SECTIONS = new Set(["skills", "certifications"]);
const MAIN_SECTIONS = new Set([
  "summary",
  "experience",
  "education",
  "projects",
]);

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "9px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.6)",
        marginBottom: "8px",
      }}
    >
      {children}
    </h2>
  );
}

function MainHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#92622a",
        marginBottom: "8px",
      }}
    >
      {children}
    </h2>
  );
}

function renderSidebar(data: ResolvedResumeData) {
  const parts: React.ReactNode[] = [];

  // Contact info always in sidebar
  parts.push(
    <div key="contact" style={{ marginBottom: "20px" }}>
      <SidebarHeading>Contact</SidebarHeading>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          fontSize: "9px",
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.5,
        }}
      >
        {data.contact.email && <span>{data.contact.email}</span>}
        {data.contact.phone && <span>{data.contact.phone}</span>}
        {data.contact.location && <span>{data.contact.location}</span>}
        {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
        {data.contact.github && <span>{data.contact.github}</span>}
        {data.contact.website && <span>{data.contact.website}</span>}
      </div>
    </div>
  );

  // Skills in sidebar
  const skillsSection = data.sections.find(
    (s) => s.type === "skills" && s.enabled
  );
  if (skillsSection && data.skills.length > 0) {
    // Group by category
    const grouped = new Map<string, string[]>();
    for (const s of data.skills) {
      const cat = s.category || "General";
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(s.name);
    }

    parts.push(
      <div key="skills" style={{ marginBottom: "20px" }}>
        <SidebarHeading>Skills</SidebarHeading>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {Array.from(grouped.entries()).map(([cat, names]) => (
            <div key={cat}>
              {grouped.size > 1 && (
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "4px",
                  }}
                >
                  {cat}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                {names.map((name) => (
                  <span
                    key={name}
                    style={{
                      fontSize: "8.5px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Certifications in sidebar
  const certsSection = data.sections.find(
    (s) => s.type === "certifications" && s.enabled
  );
  if (certsSection && data.certifications.length > 0) {
    parts.push(
      <div key="certs" style={{ marginBottom: "20px" }}>
        <SidebarHeading>Certifications</SidebarHeading>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {data.certifications.map((c) => (
            <div key={c.id}>
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  margin: 0,
                }}
              >
                {c.name}
              </p>
              <p
                style={{
                  fontSize: "8.5px",
                  color: "rgba(255,255,255,0.5)",
                  margin: "1px 0 0",
                }}
              >
                {c.issuer}
                {c.issueDate ? ` · ${c.issueDate}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return parts;
}

function renderMainSection(
  section: ResumeSection,
  data: ResolvedResumeData
) {
  switch (section.type) {
    case "summary":
      if (!data.summary) return null;
      return (
        <div key="summary" style={{ marginBottom: "16px" }}>
          <MainHeading>Summary</MainHeading>
          <p
            style={{
              fontSize: "10px",
              lineHeight: 1.6,
              color: "#374151",
              margin: 0,
            }}
          >
            {data.summary}
          </p>
        </div>
      );

    case "experience":
      if (data.experiences.length === 0) return null;
      return (
        <div key="experience" style={{ marginBottom: "16px" }}>
          <MainHeading>Experience</MainHeading>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {data.experiences.map((exp) => (
              <div key={exp.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {exp.title}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                      marginLeft: "8px",
                    }}
                  >
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    margin: "1px 0 0",
                  }}
                >
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ""}
                </p>
                {exp.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0",
                      paddingLeft: "14px",
                      fontSize: "9.5px",
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    {exp.bullets.map((b, i) => (
                      <li key={i} style={{ marginBottom: "2px" }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "education":
      if (data.educations.length === 0) return null;
      return (
        <div key="education" style={{ marginBottom: "16px" }}>
          <MainHeading>Education</MainHeading>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            {data.educations.map((edu) => (
              <div key={edu.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                      marginLeft: "8px",
                    }}
                  >
                    {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    margin: "1px 0 0",
                  }}
                >
                  {edu.institution}
                  {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "projects":
      if (data.projects.length === 0) return null;
      return (
        <div key="projects" style={{ marginBottom: "16px" }}>
          <MainHeading>Projects</MainHeading>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {data.projects.map((p) => (
              <div key={p.id}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {p.name}
                </span>
                {p.description && (
                  <p
                    style={{
                      fontSize: "9.5px",
                      color: "#374151",
                      margin: "2px 0 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {p.description}
                  </p>
                )}
                {p.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0",
                      paddingLeft: "14px",
                      fontSize: "9.5px",
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    {p.bullets.map((b, i) => (
                      <li key={i} style={{ marginBottom: "2px" }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function ModernTemplate({ data }: ModernTemplateProps) {
  const mainSections = data.sections.filter(
    (s) => MAIN_SECTIONS.has(s.type) && s.enabled
  );

  return (
    <div
      style={{
        fontFamily:
          "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif",
        display: "flex",
        minHeight: "100%",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "30%",
          backgroundColor: "#1e293b",
          padding: "36px 20px",
          color: "#ffffff",
        }}
      >
        {/* Name */}
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 4px",
            lineHeight: 1.2,
          }}
        >
          {data.contact.name}
        </h1>
        <div
          style={{
            width: "24px",
            height: "2px",
            backgroundColor: "#d97706",
            marginBottom: "20px",
          }}
        />

        {renderSidebar(data)}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "36px 32px" }}>
        {mainSections.map((section) => renderMainSection(section, data))}
      </div>
    </div>
  );
}
