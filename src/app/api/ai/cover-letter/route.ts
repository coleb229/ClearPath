import { auth } from "../../../../../auth";
import { anthropic } from "@/lib/ai/client";
import { strategies } from "@/lib/ai/strategies";
import { coverLetterSystem } from "@/lib/ai/prompts";
import { prisma } from "@/lib/prisma";
import {
  type AIGenerationSettings,
  mergeSettings,
  parsePreferences,
  temperatureFromCreativity,
} from "@/lib/ai/generation-settings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profile, jobTitle, company, jobDescription, tone, settings: requestSettings } =
    await request.json();

  if (!profile || !jobDescription) {
    return NextResponse.json(
      { error: "Profile and job description are required" },
      { status: 400 }
    );
  }

  // Load saved preferences and merge with request overrides
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { aiPreferences: true },
  });
  const saved = parsePreferences(user?.aiPreferences);
  const merged = mergeSettings(saved, requestSettings as Partial<AIGenerationSettings> | undefined);

  const strategy = strategies.COVER_LETTER_DRAFT;
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    temperature: temperatureFromCreativity(merged.creativity),
    system: coverLetterSystem(tone, merged),
    messages: strategy.buildMessages({
      profile,
      jobTitle,
      company,
      jobDescription,
      tone,
    }),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
