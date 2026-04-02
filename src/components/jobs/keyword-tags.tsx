"use client";

interface KeywordTagsProps {
  keywords: string[];
  matchedSkills?: string[];
  label?: string;
  variant?: "hard" | "soft" | "default";
}

export function KeywordTags({
  keywords,
  matchedSkills = [],
  label,
  variant = "default",
}: KeywordTagsProps) {
  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));

  const variantStyles = {
    hard: "bg-primary/10 text-primary border-primary/20",
    soft: "bg-accent/10 text-accent border-accent/20",
    default: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div>
      {label && (
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((keyword) => {
          const isMatched = matchedSet.has(keyword.toLowerCase());
          return (
            <span
              key={keyword}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-(--dur-state) ease-(--ease-out-quart) ${
                isMatched
                  ? "bg-accent/15 text-accent border-accent/30 ring-1 ring-accent/20"
                  : variantStyles[variant]
              }`}
            >
              {isMatched && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
              {keyword}
            </span>
          );
        })}
      </div>
    </div>
  );
}
