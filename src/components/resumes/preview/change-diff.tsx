"use client";

interface ChangeDiffProps {
  before: string;
  after: string;
  label?: string;
}

export function ChangeDiff({ before, after, label }: ChangeDiffProps) {
  const hasChange = before !== after;

  if (!hasChange) {
    return (
      <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
        <p className="text-[11px] text-muted-foreground italic">No changes</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      )}

      {/* Before */}
      {before && (
        <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-2.5">
          <p className="text-[10px] font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
            Current
          </p>
          <p className="text-[11px] text-foreground/70 leading-relaxed line-through decoration-red-400/40">
            {before}
          </p>
        </div>
      )}

      {/* After */}
      <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2.5">
        <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          Suggested
        </p>
        <p className="text-[11px] text-foreground leading-relaxed">{after}</p>
      </div>
    </div>
  );
}
