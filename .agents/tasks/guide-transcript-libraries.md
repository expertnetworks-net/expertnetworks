---
id: guide-transcript-libraries
role: builder
depends_on: []
---

# Goal
A guide page "How to evaluate an expert transcript library" exists at `/guides/transcript-libraries/`, built from the AI capability records and sources read in this task, useful to a buyer at an investment or consulting firm.

# Context
Read `docs/CONTENT-GUIDE.md` (sourcing rule and the section "AI capability records") and `docs/DESIGN.md` (guides: one reading column, hero illustration from `public/images/editorial/`, "Key takeaways" box with sourced numbers at the top; the top of a guide is Showcase register, the body is calm). Relevant capability ids: transcript-library, ai-search, ai-summaries. Cover: library size and its as-of date, how content is sourced and compliance-reviewed, access model and pricing, distribution channels (Bloomberg, FactSet, AlphaSense), search and summary tools, what to verify in a trial.

Rules: every factual sentence about a provider either reads from `src/content/ai/` at build time (preferred: provider lists, counts, statuses) or cites a public source you opened in this task; open each source; no fact without one. Wording rule: report claims, findings, and gaps; never say a provider lies or bluffs. No filler. 1,200–2,000 words of body. End with a "Questions to ask a provider" checklist and a "Sources" list.

# Scope
- src/pages/guides/transcript-libraries.astro
- src/components/guides/

# Acceptance criteria
- [ ] Provider lists and counts come from the collection, not hard-coded
- [ ] Every other factual claim links a source opened in this task (listed in `checks`)
- [ ] Page has `Article` JSON-LD with `dateModified`, a canonical URL, and a meta description under 160 characters
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Content collections, the header (another task adds the menu link), other pages.
