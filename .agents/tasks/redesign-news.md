---
id: redesign-news
role: builder
depends_on: []
---

# Goal
The news page follows `docs/DESIGN.md` (Workbench register, section 6 "Other pages"): a fast, dated, source-forward feed instead of a 380 KB single page.

# Context
Current page: `src/pages/news/index.astro` (~850 lines) and its browser script. Read `docs/DESIGN.md` and `docs/ARCHITECTURE.md`. Keep existing filters working or replace them with the same capability.

Build:
- Items grouped by month (sticky month headers), newest first. Each row: date (tabular), category chip, provider logo tile (24 px) and name, title, source domain in monospace, "why it matters" collapsed to one line with expand.
- Filter chips: category, provider, significance; URL reflects filters (shareable); counts per chip computed at build time.
- Pagination: static pages of 30 items (`/news/`, `/news/page/2/`, …) with prev/next; the first page HTML under 120 KB.
- A compact "AI" filter that selects items whose category or provider record relates to AI.
- Staggered entrance for rows (DESIGN section 5, compositor-only), off under reduced motion.

# Scope
- src/pages/news/
- src/components/news/
- src/scripts/
- src/styles/global.css
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] `dist/news/index.html` under 120 KB; all items reachable through pagination; each item links to its source
- [ ] Filters work with JavaScript and the unfiltered list works without it
- [ ] No horizontal overflow at 375 px
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
`src/content/news/` (no content edits), the header, other pages.
