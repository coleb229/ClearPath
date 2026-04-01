import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { anthropic } from "@/lib/ai/client";
import { strategies, type SuggestionType } from "@/lib/ai/strategies";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, context } = body as {
    type: SuggestionType;
    context: Record<string, unknown>;
  };

  const strategy = strategies[type];
  if (!strategy) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: strategy.system,
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
