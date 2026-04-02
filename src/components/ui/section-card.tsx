"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  count?: number;
  onAdd?: () => void;
  addLabel?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionCard({
  icon: Icon,
  title,
  count,
  onAdd,
  addLabel = "Add",
  defaultOpen = true,
  children,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </span>

        <span className="text-sm font-semibold text-foreground">{title}</span>

        {count !== undefined && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}

        <span className="flex-1" />

        {onAdd && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onAdd();
              }
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-primary transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </span>
        )}

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-(--dur-layout) ease-(--ease-out-quart) ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-(--dur-layout) ease-(--ease-out-quart) ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
