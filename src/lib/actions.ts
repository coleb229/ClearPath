"use server";

import { auth } from "../../auth";

// ---------------------------------------------------------------------------
// Shared types and helpers for server actions
// ---------------------------------------------------------------------------

export type ActionResult = { success: true } | { success: false; error: string };
export type ActionResultWithId =
  | { success: true; id: string }
  | { success: false; error: string };

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
