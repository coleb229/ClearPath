# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Vision

ClearPath is an AI-assisted resume and cover letter building tool. Users build a comprehensive professional profile once, then generate tailored resumes and cover letters for specific job opportunities. The AI helps at every step — writing bullet points, analyzing job descriptions, suggesting improvements, and drafting cover letters.

Core principles:
- **Warm and empowering**: Job seekers need confidence, not complexity. The UX should feel like working with a supportive career coach.
- **Profile-first**: The user's profile is the single source of truth. Resumes and cover letters are views of that profile, tailored for specific jobs.
- **AI as assistant, not author**: AI suggests and improves, but the user controls the final output. Every suggestion is reviewable and editable.
- **Professional quality output**: Generated documents should be indistinguishable from those crafted by a professional resume writer.

## Commands

```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # Production build (runs prisma generate via prebuild)
npm run lint         # ESLint
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema to database
npm run db:studio    # Prisma Studio GUI
```

No test runner is configured yet.

## Stack

Next.js 16 (App Router) | React 19 | TypeScript | Tailwind CSS v4 | NextAuth v5 (Google OAuth, JWT) | Prisma 6 + PostgreSQL (Supabase) | Anthropic Claude API | Vercel

## Architecture

### Auth (NextAuth v5 split pattern)

- `auth.ts` — full config with Google provider, Prisma adapter, JWT callbacks. Use `auth()` to get session in server components and API routes.
- `auth.config.ts` — edge-safe config (no Prisma, empty providers). Used by middleware only. **Never import Prisma here.**
- `middleware.ts` — edge-safe auth check using auth.config.ts.
- Roles: `ADMIN`, `USER`. Default role is USER. Check via `session.user.role`.
- Session shape: `{ user: { id, email, name, image, role } }`

### Tailwind v4

- Uses `@import "tailwindcss"` syntax, not `@tailwind` directives
- Colors defined as OKLCH values in CSS custom properties (`src/app/globals.css`)
- Primary: warm amber (hue ~55), Accent: teal (hue ~195)
- Neutral base: warm stone tones (hue ~60) — no pure black or white
- Use `bg-linear-to-br` **not** `bg-gradient-to-br`
- `@custom-variant dark (&:is(.dark *))` — dark mode via class
- `@theme inline { }` maps CSS vars to Tailwind tokens
- Motion tokens: `--ease-out-quart`, `--ease-out-expo`, `--dur-feedback/state/layout/entrance`
- Spacing: 4pt grid via `--space-*` custom properties

### Pages

- Server components by default — can call `auth()` and use Prisma directly
- Public pages under `src/app/(public)/` — no auth required
- Auth-gated app under `src/app/(app)/` — layout checks auth, redirects to `/login`
- Login under `src/app/(auth)/login/`

### Prisma Conventions

- IDs: `@id @default(cuid())`
- Timestamps: `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt`
- Cascade: `onDelete: Cascade` for children, `onDelete: SetNull` for optional refs
- Datasource config in `prisma.config.ts` (not schema.prisma) — Prisma v6 pattern
- After schema edits: run `npx prisma generate` then `npx prisma db push`

### Key Models

User → Profile → Experience, Education, Skill, Project, Certification
User → Resume (tailored via JobListing, styled via Template)
User → CoverLetter (tailored via JobListing)
User → JobListing (analyzed by AI)
User → AISuggestion (history of AI interactions)

### AI Architecture

- Anthropic Claude API via `@anthropic-ai/sdk` (`src/lib/ai/client.ts`)
- Strategy pattern in `src/lib/ai/strategies.ts` — each SuggestionType has its own system prompt and message builder
- API routes in `src/app/api/ai/` with streaming responses for suggestions and cover letters
- Client hook: `useAISuggestion(type)` in `src/hooks/use-ai-suggestion.ts` for streaming UI integration
- Suggestion types: BULLET_POINT, SUMMARY, SKILL_DESCRIPTION, COVER_LETTER_DRAFT, RESUME_TAILORING, JOB_ANALYSIS

### Icons & Design

- Lucide React for icons
- Warm color palette with amber primary and teal accent
- OKLCH color space throughout — tint neutrals toward brand hue
- Dark mode via `next-themes`
- Plus Jakarta Sans (body), Geist Mono (monospace)
- Sidebar is always dark (oklch 0.17 background)
- Design context documented in `.impeccable.md`

### Design Skills

21 design skills available in `.agents/skills/`:
`/audit`, `/normalize`, `/harden`, `/clarify`, `/adapt`, `/polish`, `/typeset`, `/arrange`, `/animate`, `/delight`, `/bolder`, `/quieter`, `/colorize`, `/distill`, `/extract`, `/onboard`, `/optimize`, `/overdrive`, `/critique`, `/frontend-design`, `/teach-impeccable`

Use `/frontend-design` for ALL frontend/UI work. Design context lives in `.impeccable.md` — run `/teach-impeccable` if it needs updating.
