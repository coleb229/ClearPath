## Design Context

### Users

- **Primary**: Job seekers building resumes and cover letters — ranging from recent graduates to career changers to experienced professionals
- **Context**: Users are often stressed, uncertain, and need confidence. The tool should feel like a supportive coach, not a bureaucratic form-filler. They open the app when preparing for a job application, often under time pressure.

### Brand Personality

- **3 words**: Warm, trustworthy, empowering
- **Voice**: Encouraging personal coach with professional expertise — like a career counselor who genuinely cares
- **Emotional goals**:
  - **Confidence** — users should feel their materials are strong and compelling
  - **Clarity** — complex career histories become clear, coherent narratives
  - **Calm** — the process feels manageable, not overwhelming
  - **Pride** — users are proud of what they produce

### Aesthetic Direction

- **Visual tone**: Warm minimalism — clean and professional but never cold or corporate
- **References**: Notion (polish, fluid UX), Calm app (warm, inviting), Linear (clean density), Readwise (warm tones, reading comfort)
- **Anti-references**: LinkedIn (cluttered, corporate), generic resume builders (template-heavy, impersonal), cold SaaS dashboards (sterile, intimidating)
- **Theme**: Light + dark mode. OKLCH color space throughout. Primary warm amber (hue ~55), accent teal (hue ~195). Plus Jakarta Sans (body), Geist Mono (code). Warm stone neutrals — no pure black or pure white.

### Design Principles

1. **Warm confidence** — The interface feels like a trusted advisor. Warm tones, generous whitespace, encouraging micro-copy. Never sterile or intimidating.
2. **Progressive disclosure** — Start simple, reveal complexity as needed. First-time users see guidance; power users see efficiency.
3. **Purposeful motion** — Animations provide feedback and continuity, never distract. Smooth transitions between editing states. Use ease-out-quart/expo, never bounce or elastic.
4. **Content-first** — The user's words are the hero. UI elements support the content, never compete with it.
5. **Accessible by default** — WCAG 2.1 AA. High contrast, keyboard navigation, reduced motion support, semantic HTML.

### Technical Design Tokens

**Color System**: OKLCH-based with CSS custom properties. Light and dark modes. Primary amber (hue ~55), accent teal (hue ~195).

**Spacing**: Tailwind 4px base unit. Page containers: `max-w-5xl` with responsive padding (`px-4 sm:px-6 lg:px-8`).

**Border Radius**: Base `--radius: 0.625rem` (10px) with proportional scale from `sm` (6px) to `4xl` (26px). Cards use `rounded-xl`, buttons use `rounded-lg`.

**Animation**: Subtle fade-up entrances (0.4s ease-out-quart), button micro-interactions (hover scale 1.02, active translateY 1px). Respect `prefers-reduced-motion`.

**Typography**: Plus Jakarta Sans (body — warm, friendly, professional), Geist Mono (code/data). Modular type scale with fluid sizing.

### Accessibility

- **Target**: WCAG 2.1 AA
- **Contrast**: 4.5:1 minimum for normal text, 3:1 for large text and UI components
- **Keyboard**: Full navigation support, visible `focus-visible` indicators on all interactive elements
- **Motion**: Respect `prefers-reduced-motion` globally
- **Screen readers**: Semantic HTML structure, ARIA attributes where native semantics are insufficient
