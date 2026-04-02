"use client";

import { useEffect } from "react";
import type { ResolvedResumeData } from "@/types/resume";
import { templateComponents } from "@/components/resumes/templates";

interface PrintViewProps {
  data: ResolvedResumeData;
  templateSlug: string;
}

export function PrintView({ data, templateSlug }: PrintViewProps) {
  const TemplateComponent =
    templateComponents[templateSlug] ?? templateComponents.clean;

  useEffect(() => {
    // Auto-trigger print dialog after a short delay for rendering
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: letter;
          }
          body {
            margin: 0;
            padding: 0;
          }
          nav, header, aside, .no-print {
            display: none !important;
          }
        }
        @media screen {
          body {
            background: #f3f4f6;
          }
        }
      `}</style>
      <div
        style={{
          width: "8.5in",
          minHeight: "11in",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <TemplateComponent data={data} />
      </div>
    </>
  );
}
