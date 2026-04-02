export const DOC_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
  },
  COMPLETE: {
    label: "Complete",
    className:
      "bg-[oklch(0.55_0.15_145/0.1)] text-[oklch(0.55_0.15_145)]",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted/60 text-muted-foreground/70",
  },
};

export const ALL_DOC_STATUSES = ["DRAFT", "COMPLETE", "ARCHIVED"] as const;

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
