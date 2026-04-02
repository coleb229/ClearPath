"use client";

import type { ResolvedResumeData, ResumeSection } from "@/types/resume";

interface CleanTemplateProps {
  data: ResolvedResumeData;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#374151",
        borderBottom: "1px solid #d1d5db",
        paddingBottom: "3px",
        marginBottom: "8px",
      }}
    >
      {children}
    </h2>
  );
}

function renderSection(section: ResumeSection, data: ResolvedResumeData) {
  switch (section.type) {
    case "header":
      return (
        <div key="header" style={{ textAlign: "center", marginBottom: "16px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {data.contact.name}
          </h1>
          <div
            style={{
              marginTop: "6px",
              fontSize: "10px",
              color: "#6b7280",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {data.contact.email && <span>{data.contact.email}</span>}
            {data.contact.phone && (
              <>
                <span style={{ color: "#d1d5db" }}>|</span>
                <span>{data.contact.phone}</span>
              </>
            )}
            {data.contact.location && (
              <>
                <span style={{ color: "#d1d5db" }}>|</span>
                <span>{data.contact.location}</span>
              </>
            )}
            {data.contact.linkedin && (
              <>
                <span style={{ color: "#d1d5db" }}>|</span>
                <span>{data.contact.linkedin}</span>
              </>
            )}
            {data.contact.website && (
              <>
                <span style={{ color: "#d1d5db" }}>|</span>
                <span>{data.contact.website}</span>
              </>
            )}
          </div>
        </div>
      );

    case "summary":
      if (!data.summary) return null;
      return (
        <div key="summary" style={{ marginBottom: "14px" }}>
          <SectionHeading>Summary</SectionHeading>
          <p
            style={{
              fontSize: "10px",
              lineHeight: 1.5,
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
        <div key="experience" style={{ marginBottom: "14px" }}>
          <SectionHeading>Experience</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.experiences.map((exp) => (
              <div key={exp.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <div>
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
                        fontSize: "11px",
                        color: "#6b7280",
                        marginLeft: "6px",
                      }}
                    >
                      {exp.company}
                      {exp.location ? `, ${exp.location}` : ""}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                      marginLeft: "12px",
                    }}
                  >
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0",
                      paddingLeft: "16px",
                      fontSize: "10px",
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
        <div key="education" style={{ marginBottom: "14px" }}>
          <SectionHeading>Education</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.educations.map((edu) => (
              <div
                key={edu.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
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
                      fontSize: "11px",
                      color: "#6b7280",
                      marginLeft: "6px",
                    }}
                  >
                    {edu.institution}
                  </span>
                  {edu.gpa && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        marginLeft: "6px",
                      }}
                    >
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#9ca3af",
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                  }}
                >
                  {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case "skills":
      if (data.skills.length === 0) return null;
      return (
        <div key="skills" style={{ marginBottom: "14px" }}>
          <SectionHeading>Skills</SectionHeading>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 12px",
              fontSize: "10px",
              color: "#374151",
              lineHeight: 1.6,
            }}
          >
            {data.skills.map((s) => (
              <span key={s.id}>{s.name}</span>
            ))}
          </div>
        </div>
      );

    case "projects":
      if (data.projects.length === 0) return null;
      return (
        <div key="projects" style={{ marginBottom: "14px" }}>
          <SectionHeading>Projects</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.projects.map((p) => (
              <div key={p.id}>
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
                    {p.name}
                  </span>
                  {p.startDate && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        whiteSpace: "nowrap",
                        marginLeft: "12px",
                      }}
                    >
                      {p.startDate}
                      {p.endDate ? ` – ${p.endDate}` : ""}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p
                    style={{
                      fontSize: "10px",
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
                      paddingLeft: "16px",
                      fontSize: "10px",
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

    case "certifications":
      if (data.certifications.length === 0) return null;
      return (
        <div key="certifications" style={{ marginBottom: "14px" }}>
          <SectionHeading>Certifications</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {data.certifications.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginLeft: "6px",
                    }}
                  >
                    {c.issuer}
                  </span>
                </div>
                {c.issueDate && (
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.issueDate}
                  </span>
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

export function CleanTemplate({ data }: CleanTemplateProps) {
  return (
    <div
      style={{
        fontFamily:
          "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif",
        padding: "40px 48px",
        color: "#111827",
        lineHeight: 1.4,
        backgroundColor: "#ffffff",
        minHeight: "100%",
      }}
    >
      {data.sections.map((section) => renderSection(section, data))}
    </div>
  );
}
