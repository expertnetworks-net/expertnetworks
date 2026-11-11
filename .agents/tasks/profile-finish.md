---
id: profile-finish
role: builder
depends_on: []
---

# Goal
The redesigned provider profile is complete: it shows the provider's AI capabilities from `src/content/ai/`, has the Workbench signature moments, and displays every official logo correctly.

# Context
Read `docs/DESIGN.md` (sections 2–5 binding; "Two registers": profiles are Workbench) and `docs/CONTENT-GUIDE.md` section "AI capability records". The profile components are in `src/components/profile/`; the AI records and `substantiation()` in `src/lib/ai-evidence.ts` already exist on this branch.

Build:
1. **AI capabilities section** (`AICapabilities.astro`), placed after Overview, before Services, id `ai`, added to the section nav. Top: the record's `summary` and `lastChecked`. Then the eleven capabilities as a compact table: name, status, derived label from `substantiation()` (styled as an evidence chip: Documented = Sourced style, Reported = neutral, Claimed = Company-stated style, Announced = outline, No public evidence = Unconfirmed style), product name, one-line description, and numbered source links that join the page's Sources list. Then the reality check in three short columns: "What they say", "What we found", "Gaps". If the provider has no record, show "AI capabilities not yet reviewed" and no table.
2. **Library facts**: if `library` exists, a small fact row (size with as-of date, access, distribution) under the table.
3. **Signature moments** (DESIGN section 5): fact values count up once on first view (`@property` integer + `counter()`, only for values that start with a number; text values do not animate); the history timeline spine draws with `stroke-dashoffset` on a `view()` timeline; the section-nav indicator slides with `transform`. All inside `@supports (animation-timeline: view())` and off under reduced motion.
4. **Logos**: `docs/LOGO-SOURCES.md` lists logos with white lettering (guidepoint, capvision, coleman-research, newtonx, techspert). Give the logo tile a dark surface (`#111`) for those slugs and a white surface for the rest, from a small map in the profile model; never alter the image.
5. Add the Compare page's "AI" row values only if `src/content/compare.json` already reads them; otherwise list that as a followup. Do not edit compare files.

# Scope
- src/components/profile/
- src/pages/networks/[slug].astro
- src/lib/ai-evidence.ts
- src/styles/global.css
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] Built pages for glg, alphasights, dialectica, zintro, and a provider without an AI record render without errors; the AI section shows all eleven capabilities with correct derived labels for the four with records
- [ ] Only `transform`, `opacity`, `stroke-dashoffset`, and registered custom properties animate; reduced motion shows final values
- [ ] White-lettered logos sit on a dark tile; no logo is cropped or recoloured
- [ ] `scripts/agents/gate.sh --quick` passes (it runs the AI content check too)

# Out of scope
`src/content/`, compare and directory pages, the site header, `src/components/ui/`.
