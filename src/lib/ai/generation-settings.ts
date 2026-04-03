export interface AIGenerationSettings {
  /** 0-100 scale. Maps to Claude temperature 0.3–1.0. */
  creativity: number;
  /** Controls language register. */
  formality: "casual" | "balanced" | "formal";
  /** Controls output length / bullet count. */
  detailLevel: "concise" | "balanced" | "detailed";
}

export const DEFAULT_AI_SETTINGS: AIGenerationSettings = {
  creativity: 50,
  formality: "balanced",
  detailLevel: "balanced",
};

/** Map 0-100 creativity to Claude temperature (0.3–1.0). */
export function temperatureFromCreativity(creativity: number): number {
  const clamped = Math.max(0, Math.min(100, creativity));
  return 0.3 + (clamped / 100) * 0.7;
}

/** Merge request-level overrides → saved preferences → system defaults. */
export function mergeSettings(
  saved?: Partial<AIGenerationSettings> | null,
  overrides?: Partial<AIGenerationSettings> | null
): AIGenerationSettings {
  return {
    ...DEFAULT_AI_SETTINGS,
    ...(saved ?? {}),
    ...(overrides ?? {}),
  };
}

/** Validate and coerce raw JSON from the database into AIGenerationSettings. */
export function parsePreferences(
  raw: unknown
): Partial<AIGenerationSettings> | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const result: Partial<AIGenerationSettings> = {};

  if (typeof obj.creativity === "number") {
    result.creativity = Math.max(0, Math.min(100, obj.creativity));
  }
  if (
    obj.formality === "casual" ||
    obj.formality === "balanced" ||
    obj.formality === "formal"
  ) {
    result.formality = obj.formality;
  }
  if (
    obj.detailLevel === "concise" ||
    obj.detailLevel === "balanced" ||
    obj.detailLevel === "detailed"
  ) {
    result.detailLevel = obj.detailLevel;
  }

  return Object.keys(result).length > 0 ? result : null;
}
