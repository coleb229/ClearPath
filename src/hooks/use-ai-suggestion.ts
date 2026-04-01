"use client";

import { useState, useCallback } from "react";
import type { SuggestionType } from "@/lib/ai/strategies";

interface UseAISuggestionReturn {
  suggestion: string;
  isStreaming: boolean;
  error: string | null;
  suggest: (context: Record<string, unknown>) => Promise<void>;
  clear: () => void;
}

export function useAISuggestion(
  type: SuggestionType
): UseAISuggestionReturn {
  const [suggestion, setSuggestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggest = useCallback(
    async (context: Record<string, unknown>) => {
      setSuggestion("");
      setError(null);
      setIsStreaming(true);

      try {
        const res = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, context }),
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setSuggestion(accumulated);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsStreaming(false);
      }
    },
    [type]
  );

  const clear = useCallback(() => {
    setSuggestion("");
    setError(null);
  }, []);

  return { suggestion, isStreaming, error, suggest, clear };
}
