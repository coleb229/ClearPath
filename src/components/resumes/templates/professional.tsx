"use client";

import type { ResolvedResumeData, ResumeSection } from "@/types/resume";

interface ProfessionalTemplateProps {
  data: ResolvedResumeData;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <h2
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#1a1a1a",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          margin: 0,
          paddingBottom: "4px",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: "1.5px",
          background: "linear-gradient(to right, #1a1a1a, transparent)",
        }}
      />
    </div>
  );
}

function renderSection(section: ResumeSection, data: ResolvedResumeData) {
  switch (section.type) {
    case "header":
      return (
        <div
          key="header"
          style={{
            textAlign: "center",
            marginBottom: "16px",
            paddingBottom: "12px",
            borderBottom: "2px solid #1a1a1a",
          }}
        >
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
              letterSpacing: "0.02em",
              lineHeight: 1.2,
            }}
          >
            {data.contact.name}
          </h1>
          <div
            style={{
              marginTop: "8px",
              fontSize: "10px",
              color: "#555555",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "4px 14px",
              lineHeight: 1.6,
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

    case "summary":
      if (!data.summary) return null;
      return (
        <div key="summary" style={{ marginBottom: "16px" }}>
          <SectionHeading>Professional Summary</SectionHeading>
          <p
            style={{
              fontSize: "10px",
              lineHeight: 1.6,
              color: "#333333",
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
          <SectionHeading>Professional Experience</SectionHeading>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {data.experiences.map((exp) => (
              <div key={exp.id} style={{ pageBreakInside: "avoid" }}>
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
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      {exp.company}
                    </span>
                    {exp.location && (
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#777777",
                          marginLeft: "8px",
                        }}
                      >
                        {exp.location}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#777777",
                      whiteSpace: "nowrap",
                      marginLeft: "12px",
                    }}
                  >
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "10.5px",
                    fontStyle: "italic",
                    color: "#444444",
                    margin: "1px 0 0",
                  }}
                >
                  {exp.title}
                </p>
                {exp.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0",
                      paddingLeft: "16px",
                      fontSize: "10px",
                      lineHeight: 1.55,
                      color: "#333333",
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
          <SectionHeading>Education</SectionHeading>
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
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      {edu.institution}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#777777",
                      whiteSpace: "nowrap",
                      marginLeft: "12px",
                    }}
                  >
                    {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#444444",
                    margin: "1px 0 0",
                  }}
                >
                  {edu.degree}
                  {edu.field ? ` in ${edu.field}` : ""}
                  {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                </p>
                {edu.description && (
                  <p
                    style={{
                      fontSize: "9.5px",
                      color: "#555555",
                      margin: "2px 0 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "skills":
      if (data.skills.length === 0) return null;
      return (
        <div key="skills" style={{ marginBottom: "16px" }}>
          <SectionHeading>Technical Skills</SectionHeading>
          {(() => {
            const grouped = new Map<string, string[]>();
            for (const s of data.skills) {
              const cat = s.category || "General";
              if (!grouped.has(cat)) grouped.set(cat, []);
              grouped.get(cat)!.push(s.name);
            }
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  fontSize: "10px",
                  color: "#333333",
                  lineHeight: 1.6,
                }}
              >
                {Array.from(grouped.entries()).map(([cat, names]) => (
                  <div key={cat}>
                    <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {cat}:
                    </span>{" "}
                    {names.join(", ")}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      );

    case "projects":
      if (data.projects.length === 0) return null;
      return (
        <div key="projects" style={{ marginBottom: "16px" }}>
          <SectionHeading>Projects</SectionHeading>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {data.projects.map((p) => (
              <div key={p.id}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                  }}
                >
                  {p.name}
                </span>
                {p.description && (
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#333333",
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
                      lineHeight: 1.55,
                      color: "#333333",
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
        <div key="certifications" style={{ marginBottom: "16px" }}>
          <SectionHeading>Certifications</SectionHeading>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            {data.certifications.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontSize: "10px",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "#1a1a1a" }}>
                    {c.name}
                  </span>
                  <span style={{ color: "#777777", marginLeft: "6px" }}>
                    — {c.issuer}
                  </span>
                </div>
                {c.issueDate && (
                  <span
                    style={{
                      color: "#777777",
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

export function ProfessionalTemplate({ data }: ProfessionalTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "44px 52px",
        color: "#1a1a1a",
        lineHeight: 1.4,
        backgroundColor: "#ffffff",
        minHeight: "100%",
      }}
    >
      {data.sections.map((section) => renderSection(section, data))}
    </div>
  );
}
