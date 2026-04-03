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

  // Build the system prompt — cover letters get special handling for tone
  let systemPrompt: string;
  if (type === "COVER_LETTER_DRAFT") {
    const tone = (context.tone as string) ?? "professional";
    systemPrompt = coverLetterSystem(tone, merged);
  } else {
    systemPrompt = buildSystemPrompt(strategy.system, merged, type);
  }

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
