import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { anthropic } from "@/lib/ai/client";

const SYSTEM_PROMPT = `You are an expert resume parser. Extract structured data from the provided resume document and return it as valid JSON.

Return ONLY a JSON object with this exact structure (omit fields that aren't present):
{
  "headline": "Professional headline/title",
  "summary": "Professional summary paragraph",
  "phone": "Phone number",
  "location": "City, State/Country",
  "website": "Personal website URL",
  "linkedin": "LinkedIn URL",
  "github": "GitHub URL",
  "experiences": [
    {
      "company": "Company name",
      "title": "Job title",
      "location": "City, State",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null if current",
      "current": true/false,
      "description": "Brief role description",
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "educations": [
    {
      "institution": "School name",
      "degree": "Degree type (e.g., B.S., M.A., Ph.D.)",
      "field": "Field of study",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or null if current",
      "current": true/false,
      "gpa": "GPA if listed",
      "description": "Additional details"
    }
  ],
  "skills": [
    {
      "name": "Skill name",
      "category": "Category (e.g., Programming Languages, Frameworks, Tools, Soft Skills)",
      "level": "BEGINNER | INTERMEDIATE | ADVANCED | EXPERT"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "url": "Project URL if available",
      "startDate": "YYYY-MM or null",
      "endDate": "YYYY-MM or null",
      "bullets": ["Detail 1", "Detail 2"]
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "issueDate": "YYYY-MM or null",
      "expiryDate": "YYYY-MM or null",
      "url": "Verification URL if available"
    }
  ]
}

Important:
- Dates should be in "YYYY-MM" format. If only a year is given, use "YYYY-01".
- For skills, infer the level from context (years of experience, how prominently featured). Default to INTERMEDIATE if unclear.
- Group skills into logical categories.
- Extract bullet points as separate items in the bullets array.
- Return ONLY the JSON object, no markdown formatting or explanation.`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  try {
    let response;

    if (file.type === "application/pdf") {
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64,
                },
              },
              {
                type: "text",
                text: "Parse this resume and extract all professional information into the structured JSON format.",
              },
            ],
          },
        ],
      });
    } else {
      // For text/DOCX, send as text content
      const textContent = file.type === "text/plain"
        ? new TextDecoder().decode(bytes)
        : `[Document content - base64 encoded DOCX]\n${base64}`;

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Parse this resume and extract all professional information into the structured JSON format.\n\n${textContent}`,
          },
        ],
      });
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Failed to parse resume" },
        { status: 500 }
      );
    }

    // Strip any markdown code fences if present
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);
    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume. Please try again." },
      { status: 500 }
    );
  }
}