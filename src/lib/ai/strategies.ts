import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import {
  BULLET_POINT_SYSTEM,
  SUMMARY_SYSTEM,
  JOB_ANALYSIS_SYSTEM,
  RESUME_TAILORING_SYSTEM,
  SKILL_DESCRIPTION_SYSTEM,
  SUMMARY_REWRITE_SYSTEM,
  BULLET_IMPROVE_SYSTEM,
  SKILLS_SUGGEST_SYSTEM,
  RESUME_REVIEW_SYSTEM,
  RESUME_ADJUSTMENT_SYSTEM,
  coverLetterSystem,
} from "./prompts";

export type SuggestionType =
  | "BULLET_POINT"
  | "SUMMARY"
  | "SKILL_DESCRIPTION"
  | "COVER_LETTER_DRAFT"
  | "RESUME_TAILORING"
  | "JOB_ANALYSIS"
  | "SUMMARY_REWRITE"
  | "BULLET_IMPROVE"
  | "SKILLS_SUGGEST"
  | "RESUME_REVIEW"
  | "RESUME_ADJUSTMENT";

export interface AIStrategy {
  type: SuggestionType;
  system: string;
  buildMessages(context: Record<string, unknown>): MessageParam[];
}

export const strategies: Record<SuggestionType, AIStrategy> = {
  BULLET_POINT: {
    type: "BULLET_POINT",
    system: BULLET_POINT_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Job Title: ${ctx.title}\nCompany: ${ctx.company}\nDescription: ${ctx.description}`,
        },
      ];
    },
  },

  SUMMARY: {
    type: "SUMMARY",
    system: SUMMARY_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Professional Profile:\n${JSON.stringify(ctx.profile, null, 2)}`,
        },
      ];
    },
  },

  SKILL_DESCRIPTION: {
    type: "SKILL_DESCRIPTION",
    system: SKILL_DESCRIPTION_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Skill: ${ctx.skill}\nContext: ${ctx.context ?? "General professional context"}`,
        },
      ];
    },
  },

  JOB_ANALYSIS: {
    type: "JOB_ANALYSIS",
    system: JOB_ANALYSIS_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Job Title: ${ctx.title}\nCompany: ${ctx.company}\n\nJob Description:\n${ctx.description}`,
        },
      ];
    },
  },

  RESUME_TAILORING: {
    type: "RESUME_TAILORING",
    system: RESUME_TAILORING_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Resume Content:\n${JSON.stringify(ctx.resume, null, 2)}\n\nJob Analysis:\n${JSON.stringify(ctx.analysis, null, 2)}`,
        },
      ];
    },
  },

  COVER_LETTER_DRAFT: {
    type: "COVER_LETTER_DRAFT",
    system: coverLetterSystem(),
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Profile:\n${JSON.stringify(ctx.profile, null, 2)}\n\nJob Listing:\nTitle: ${ctx.jobTitle}\nCompany: ${ctx.company}\nDescription: ${ctx.jobDescription}`,
        },
      ];
    },
  },

  SUMMARY_REWRITE: {
    type: "SUMMARY_REWRITE",
    system: SUMMARY_REWRITE_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Current Summary:\n${ctx.currentSummary ?? "(none)"}\n\nProfile:\n${JSON.stringify(ctx.profile, null, 2)}${ctx.jobAnalysis ? `\n\nJob Analysis:\n${JSON.stringify(ctx.jobAnalysis, null, 2)}` : ""}`,
        },
      ];
    },
  },

  BULLET_IMPROVE: {
    type: "BULLET_IMPROVE",
    system: BULLET_IMPROVE_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Bullet point: ${ctx.bullet}\nJob Title: ${ctx.title}\nCompany: ${ctx.company}${ctx.keywords ? `\nTarget keywords: ${(ctx.keywords as string[]).join(", ")}` : ""}`,
        },
      ];
    },
  },

  SKILLS_SUGGEST: {
    type: "SKILLS_SUGGEST",
    system: SKILLS_SUGGEST_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Work Experience:\n${JSON.stringify(ctx.experiences, null, 2)}\n\nCurrent Skills: ${(ctx.currentSkills as string[]).join(", ")}${ctx.jobAnalysis ? `\n\nJob Analysis:\n${JSON.stringify(ctx.jobAnalysis, null, 2)}` : ""}`,
        },
      ];
    },
  },

  RESUME_REVIEW: {
    type: "RESUME_REVIEW",
    system: RESUME_REVIEW_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Resume:\n${JSON.stringify(ctx.resume, null, 2)}${ctx.jobAnalysis ? `\n\nJob Analysis:\n${JSON.stringify(ctx.jobAnalysis, null, 2)}` : ""}`,
        },
      ];
    },
  },

  RESUME_ADJUSTMENT: {
    type: "RESUME_ADJUSTMENT",
    system: RESUME_ADJUSTMENT_SYSTEM,
    buildMessages(ctx) {
      return [
        {
          role: "user",
          content: `Current Resume:\n${JSON.stringify(ctx.resume, null, 2)}\n\nAdjustment Request:\n${ctx.instruction}`,
        },
      ];
    },
  },
};
