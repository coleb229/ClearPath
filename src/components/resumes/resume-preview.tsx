"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import type { ResolvedResumeData } from "@/types/resume";
import { templateComponents } from "@/components/resumes/templates";

interface ResumePreviewProps {
  data: ResolvedResumeData;
  templateSlug: string;
}

const PAPER_WIDTH = 816; // 8.5in at 96dpi
const PAPER_HEIGHT = 1056; // 11in at 96dpi

export function ResumePreview({ data, templateSlug }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32; // 16px padding each side
      const newScale = Math.min(containerWidth / PAPER_WIDTH, 1);
      setScale(newScale);
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const TemplateComponent = templateComponents[templateSlug] ?? templateComponents.clean;

  return (
    <div
      ref={containerRef}
      className="flex justify-center overflow-auto rounded-xl bg-muted/30 p-4"
    >
      <div
        style={{
          width: PAPER_WIDTH,
          minHeight: PAPER_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          marginBottom: `${-(PAPER_HEIGHT * (1 - scale))}px`,
        }}
        className="rounded-sm bg-white shadow-lg ring-1 ring-border/10"
      >
        <TemplateComponent data={data} />
      </div>
    </div>
  );
}
