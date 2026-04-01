---
name: research
description: "EXPLICIT ONLY — never auto-trigger. Research how other resume/cover letter builders handle a specific feature area using firecrawl web scraping. Only invoke when the user explicitly calls /research. Accepts a topic description."
---

# Resume Builder Competitive Research

Research how leading resume and cover letter builders handle a specific feature area by scraping their public web pages, feature descriptions, and marketing content. Synthesizes findings into a structured comparison saved to `.claude/research/`.

## Input Handling

Parse the text after `/research` as the **research topic**:
- `/research AI-assisted bullet point writing`
- `/research resume template systems`
- `/research job description analysis features`
- `/research cover letter generation UX`

## Target Apps

| App | Primary URL | Focus Area |
|---|---|---|
| Teal | tealhq.com | AI resume builder, job tracking, career tools |
| Rezi | rezi.ai | AI-powered resume optimization, ATS scoring |
| Novoresume | novoresume.com | Templates, cover letters, career resources |
| Resume.io | resume.io | Clean templates, ease of use, global focus |
| Kickresume | kickresume.com | AI writer, templates, website builder |
| Zety | zety.com | Resume + cover letter builder, career advice |
| Enhancv | enhancv.com | Modern templates, content suggestions, analytics |
| FlowCV | flowcv.com | Free builder, clean UX, real-time preview |
| Standard Resume | standardresume.co | Minimal, developer-focused, clean output |
| Reactive Resume | rxresu.me | Open source, self-hostable, privacy-focused |

## Research Methodology

### Step 1: Discover relevant pages

For each app relevant to the topic, map their site structure:

```bash
firecrawl map <url> --search "<topic keywords>"
```

Focus on:
- Feature pages (e.g., `/features`, `/ai-resume-builder`)
- Help/support articles about the feature
- Blog posts explaining the feature
- Pricing pages (to understand feature tiers)

### Step 2: Scrape feature content

For the most relevant pages discovered:

```bash
firecrawl scrape <page-url>
```

Extract:
- Feature descriptions and capabilities
- Screenshots or image descriptions
- UX flow descriptions
- Pricing/tier gating for the feature
- Any unique differentiators

### Step 3: Search for additional context

```bash
firecrawl search "best <topic> resume builder features 2025"
firecrawl search "<app name> <topic> review"
```

### Step 4: Synthesize findings

Create a structured research summary at `.claude/research/<topic-slug>.md`:

```markdown
# Competitive Research: <Topic>
Date: <YYYY-MM-DD>

## Summary
<2-3 sentence overview of the competitive landscape for this feature>

## App-by-App Analysis

### <App Name>
- **What they do well**: ...
- **What they do poorly**: ...
- **Key features**: ...
- **Screenshots/visuals**: <descriptions of notable UI patterns>
- **Pricing tier**: Free / Premium ($X/mo)

## Common Patterns
<What most apps get right — table stakes features ClearPath must have>

## Differentiation Opportunities
<Where apps fall short — areas where ClearPath can stand out>

## Recommendations for ClearPath
<Specific, actionable suggestions based on the research>
```

## Research Scope Guidelines

- **DO** scrape public marketing pages, feature descriptions, help articles, and blog posts
- **DO** note App Store ratings and common user complaints (from review summaries on marketing pages)
- **DO** compare pricing tiers and which features are gated
- **DO NOT** attempt to log into any app or access authenticated content
- **DO NOT** scrape user-generated content, forums, or private data
- **DO NOT** download or cache copyrighted images — describe them instead
- **Keep it focused**: Research 3-5 most relevant apps per topic, not all 10

## Output

- Research summary saved to `.claude/research/<topic-slug>.md`
- Print a brief summary to the user with key findings and recommendations
- Reference the saved file for full details
