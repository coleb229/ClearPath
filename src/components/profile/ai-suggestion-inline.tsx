"use client"

import { Check, X } from "lucide-react"

interface AISuggestionInlineProps {
  suggestion: string
  isStreaming: boolean
  onAccept: (text: string) => void
  onDismiss: () => void
}

export function AISuggestionInline({
  suggestion,
  isStreaming,
  onAccept,
  onDismiss,
}: AISuggestionInlineProps) {
  if (!suggestion && !isStreaming) return null

  return (
    <div className="animate-fade-up rounded-lg border-l-2 border-accent bg-accent/5 p-3">
      <p className="text-sm text-foreground whitespace-pre-wrap">
        {suggestion}
        {isStreaming && (
          <span className="inline-block animate-pulse text-muted-foreground">
            ...
          </span>
        )}
      </p>

      {!isStreaming && suggestion && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAccept(suggestion)}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors duration-(--dur-state) hover:text-accent/80"
          >
            <Check className="h-4 w-4" />
            Accept
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-(--dur-state) hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
