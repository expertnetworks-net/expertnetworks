---
id: ai-hub
role: builder
depends_on: []
---

# Goal
A new `/ai/` hub, "AI in expert networks", is the site's flagship page: an evidence-graded view of what every provider actually does with AI, built entirely from `src/content/ai/`.

# Context
Read `docs/DESIGN.md` fully (the top of this page is Showcase; the data part is Workbench), `docs/CONTENT-GUIDE.md` section "AI capability records", and `src/lib/ai-evidence.ts`. Never hard-code a fact or a count: read the collection at build time. Wording rule: report what is claimed, what is found, and the gap; never say a provider lies or bluffs.

Sections:
1. **Hero (Showcase)**: headline and one-sentence thesis ("What is documented, what is only claimed."). A scroll-driven scene: the evidence ladder (No public evidence → Announced → Claimed → Reported → Documented) with real counts per rung across all records, counting up.
2. **Capability matrix (Workbench)**: rows = providers with a record, columns = the eleven capabilities; each cell is the derived label as a compact coloured chip with a tooltip (status, evidence, date, first source link). Sticky first column and header; sortable by "number of Documented capabilities"; filter chips by capability. Mobile: one card per provider.
3. **MCP and API tracker**: every provider whose `mcp-server` or `api` is not `not-found`, with status, name, what it exposes, and source.
4. **Transcript libraries**: a table of `library` blocks: provider, size with as-of date, evidence, access, distribution channels.
5. **Launch timeline**: all capabilities with `firstSeen`, newest first, as a vertical timeline that draws on scroll.
6. **Method**: how records are built (evidence ranks, derived labels, monthly re-check), link to `/verification` and to each profile's AI section (`/networks/<slug>/#ai`).
7. Add `/ai/` to the sitemap and to `llms.txt` with a one-line description.

# Scope
- src/pages/ai/
- src/components/ai/
- src/pages/llms.txt.ts
- src/styles/global.css
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] `/ai/` builds from the collection only; every number on the page is computed
- [ ] Every cell and row links to a source or to the provider's profile
- [ ] Showcase effects follow DESIGN section 5 (CSS scroll-driven, compositor-only, reduced-motion final state); matrix has no motion except hover
- [ ] No horizontal overflow at 375 px except inside the matrix's own scroll container
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Editing records in `src/content/ai/`, the site header, profile components.
