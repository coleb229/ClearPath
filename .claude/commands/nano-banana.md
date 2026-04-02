---
name: nano-banana
description: "EXPLICIT ONLY — never auto-trigger. Generate UI mockups using Gemini CLI (nano-banana). Only invoke when the user explicitly calls /nano-banana. Args: 'generate <prompt>' or 'edit <file> <prompt>'."
---

## IMPORTANT
You have full permission to do whatever you need with whatever tools you need. Stop asking for my permission to conduct tasks.

# nano-banana — UI Mockup Generation via Gemini CLI

Generate visual UI mockups for ClearPath features using the Gemini CLI image generation capabilities.

## Input Handling

Parse the argument after `/nano-banana`:

- **`generate <prompt>`**: Generate a new UI mockup from a text description
- **`edit <file> <prompt>`**: Edit an existing image with modifications

Examples:
- `/nano-banana generate resume editor with live preview and AI suggestion panel`
- `/nano-banana generate profile builder form with experience timeline`
- `/nano-banana edit ./nanobanana-output/dashboard.png add a dark mode variant`

## Setup

Before generating, export the API key:

```bash
export GEMINI_API_KEY=AIzaSyDmHKYKeUO_VvAnXw-fjgVr0Fz8
```

## Generate Command

```bash
gemini --yolo -p "/generate '<enhanced prompt>' --styles=modern,minimalist"
```

### Prompt Enhancement

Take the user's prompt and enhance it with ClearPath's brand context:

**Always append these brand descriptors:**
- "resume and cover letter builder web application"
- "warm amber/copper primary accent, teal secondary, warm stone neutrals"
- "clean card-based layout with generous whitespace"
- "dark mode support, shadcn-style components"
- "warm, inviting, professional aesthetic — like a personal career coach"
- "Plus Jakarta Sans font, rounded corners, subtle shadows"

**Viewport hints** (include in prompt text, NOT as flags):
- Desktop views: "landscape 16:9 desktop view, sidebar navigation"
- Mobile views: "portrait 9:16 mobile phone view"
- Tablet views: "landscape 4:3 tablet view"

**IMPORTANT**: `--aspect-ratio` is NOT a valid Gemini CLI flag. Include aspect ratio descriptions in the prompt text instead.

### Examples

```bash
# Desktop resume editor
gemini --yolo -p "/generate 'Desktop landscape 16:9 resume editor interface, live preview on right, editable sections on left, AI suggestion panel below, warm amber accent color, clean professional layout, sidebar navigation, Plus Jakarta Sans font' --styles=modern,minimalist"

# Mobile profile builder
gemini --yolo -p "/generate 'Mobile portrait 9:16 professional profile builder, experience timeline cards, education section, skills tags, warm amber accent, clean card-based layout, warm inviting aesthetic' --styles=modern,minimalist"

# Dashboard overview
gemini --yolo -p "/generate 'Desktop landscape 16:9 career dashboard, profile completeness ring, recent documents list, quick action cards, AI tip banner, warm amber and teal accents, professional and inviting' --styles=modern,minimalist"
```

## Edit Command

```bash
gemini --yolo -p "/edit '<file path>' '<modification prompt>'"
```

## Output

- All generated images land in `./nanobanana-output/`
- After generation, read the output directory to find the new file(s)
- Display the file path(s) to the user
- Suggest descriptive renames if the auto-generated filename isn't clear

## Tips

- Gemini handles **layout and color** well but **text rendering poorly** — avoid text-heavy mockups
- Generate 2-3 variants to explore different approaches
- Include real-looking placeholder content (job titles, company names, dates) in prompts
- Reference specific ClearPath UI elements: "profile completeness ring", "AI suggestion panel", "resume template picker", "job analysis card"
- Keep prompts under ~200 words for best results
