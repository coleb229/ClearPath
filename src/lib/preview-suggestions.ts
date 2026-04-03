export interface PendingSuggestion {
  id: string;
  type: "summary" | "bullet" | "skill" | "tailor";
  label: string;
  before: string;
  after: string;
  meta?: Record<string, unknown>;
}

const STORAGE_KEY = (resumeId: string) => `preview-suggestions-${resumeId}`;

export function savePendingSuggestions(
  resumeId: string,
  suggestions: PendingSuggestion[]
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY(resumeId), JSON.stringify(suggestions));
}

export function appendPendingSuggestion(
  resumeId: string,
  suggestion: PendingSuggestion
): void {
  const existing = peekPendingSuggestions(resumeId);
  savePendingSuggestions(resumeId, [...existing, suggestion]);
}

/** Read suggestions without clearing them */
function peekPendingSuggestions(resumeId: string): PendingSuggestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY(resumeId));
    return raw ? (JSON.parse(raw) as PendingSuggestion[]) : [];
  } catch {
    return [];
  }
}

/** Read and clear suggestions (consume-once) */
export function loadPendingSuggestions(
  resumeId: string
): PendingSuggestion[] {
  const suggestions = peekPendingSuggestions(resumeId);
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY(resumeId));
  }
  return suggestions;
}
