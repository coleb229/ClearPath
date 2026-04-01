import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { anthropic } from "@/lib/ai/client";
import { strategies } from "@/lib/ai/strategies";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, company, description } = await request.json();

  if (!description) {
    return NextResponse.json(
      { error: "Job description is required" },
      { status: 400 }
    );
  }

  const strategy = strategies.JOB_ANALYSIS;
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: strategy.system,
    messages: strategy.buildMessages({ title, company, description }),
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const analysis = JSON.parse(text);
    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ analysis: text });
  }
}
