---
name: research
description: "EXPLICIT ONLY — never auto-trigger. Research how other resume/cover letter builders handle a specific feature area using Tavily web search and extraction. Only invoke when the user explicitly calls /research. Accepts a topic description."
---

## IMPORTANT
You have full permission to do whatever you need with whatever tools you need. Stop asking for my permission to conduct tasks.

# Resume Builder Competitive Research

Research how leading resume and cover letter builders handle a specific feature area using Tavily web search and content extraction. Synthesizes findings into a structured comparison saved to `.claude/research/`.

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

### Step 1: Search for relevant content

For each app relevant to the topic, use Tavily search to find relevant pages:

```
mcp__tavily__tavily-search query="<app name> <topic keywords>" search_depth="advanced" include_domains=["<app domain>"]
```

Focus on:
- Feature pages (e.g., `/features`, `/ai-resume-builder`)
- Help/support articles about the feature
- Blog posts explaining the feature
- Pricing pages (to understand feature tiers)

### Step 2: Extract detailed content

For the most relevant URLs discovered, extract full page content:

```
mcp__tavily__tavily-extract urls=["<page-url-1>", "<page-url-2>"]
```

Extract:
- Feature descriptions and capabilities
- Screenshots or image descriptions
- UX flow descriptions
- Pricing/tier gating for the feature
- Any unique differentiators

### Step 3: Broader web search for context

```
mcp__tavily__tavily-search query="best <topic> resume builder features 2025" search_depth="advanced"
mcp__tavily__tavily-search query="<app name> <topic> review" search_depth="advanced"
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
