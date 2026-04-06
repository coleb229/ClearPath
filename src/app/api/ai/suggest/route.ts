import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { anthropic } from "@/lib/ai/client";
import { strategies, type SuggestionType } from "@/lib/ai/strategies";
import { buildSystemPrompt, coverLetterSystem } from "@/lib/ai/prompts";
import { prisma } from "@/lib/prisma";
import {
  type AIGenerationSettings,
  mergeSettings,
  parsePreferences,
  temperatureFromCreativity,
} from "@/lib/ai/generation-settings";
import { fetchProfileWithRelations } from "@/lib/profile-data";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, context, settings: requestSettings } = body as {
    type: SuggestionType;
    context: Record<string, unknown>;
    settings?: Partial<AIGenerationSettings>;
  };

  const strategy = strategies[type];
  if (!strategy) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Load saved preferences from DB and merge with request overrides
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { aiPreferences: true },
  });
  const saved = parsePreferences(user?.aiPreferences);
  const merged = mergeSettings(saved, requestSettings);

  // For SUMMARY requests, always fetch profile server-side for complete data
  if (type === "SUMMARY") {
    const profile = await fetchProfileWithRelations(session.user.id);
    if (profile) {
      context.profile = {
        headline: profile.headline,
        summary: profile.summary,
        phone: profile.phone,
        location: profile.location,
        website: profile.website,
        linkedin: profile.linkedin,
        github: profile.github,
        experiences: profile.experiences.map((e) => ({
          title: e.title,
          company: e.company,
          description: e.description,
          bullets: e.bullets,
        })),
        educations: profile.educations.map((e) => ({
          institution: e.institution,
          degree: e.degree,
          field: e.field,
        })),
        skills: profile.skills.map((s) => ({
          name: s.name,
          category: s.category,
          level: s.level,
        })),
        projects: profile.projects.map((p) => ({
          name: p.name,
          description: p.description,
          bullets: p.bullets,
        })),
      };
    }
  }

  // Build the system prompt — cover letters get special handling for tone
  let systemPrompt: string;
  if (type === "COVER_LETTER_DRAFT") {
    const tone = (context.tone as string) ?? "professional";
    systemPrompt = coverLetterSystem(tone, merged);
  } else {
    systemPrompt = buildSystemPrompt(strategy.system, merged, type);
  }

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: temperatureFromCreativity(merged.creativity),
      system: systemPrompt,
      messages: strategy.buildMessages(context),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("AI stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("AI suggest error:", err);
    const message =
      err instanceof Error ? err.message : "AI service unavailable";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
