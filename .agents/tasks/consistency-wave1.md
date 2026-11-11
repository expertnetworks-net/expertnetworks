---
id: consistency-wave1
role: builder
depends_on: []
---

# Goal
After the profile verification wave, the whole site is consistent with the corrected profiles: no blank cell in the compare matrix or on a profile, no preset or badge that contradicts a profile, no guide page repeating a claim a profile dropped; and `node .github/scripts/check-content-integrity.mjs` exits 0.

# Context
This branch (`integration/profiles-1`) contains 14 verified profiles plus the new integrity check. Verifiers removed claims they could not source. That was right, but it left holes: run `node .github/scripts/check-content-integrity.mjs` now; it lists about 84 issues (about 45 existed before the wave). Three kinds:

1. **Missing matrix values** (for example `capvision: pricingModel`, `dialectica: compliance.mnpiPolicy`). A removed claim must not become a blank or a misleading "No". Make "unknown" a first-class state: the compare renderer (`src/lib/compare-v2.ts`), the compare page, and the directory show "Not disclosed" for a missing or null value, styled as muted text, never as an empty cell and never as a cross. Booleans are three-state: true, false, unknown. If the schema needs `nullable()` for that, change `src/content.config.ts`. Then update the integrity check so that an explicit unknown is valid and only a rendering hole fails. Do not put invented values into profiles to silence the check.
2. **Badges and presets that no longer hold** (for example `coleman-research: aiBadge: AI Matching requires comparison.aiMatching`; `alphasense-tegus` in `compare.presets.aiMatching`). Remove the badge or the preset membership; the verified profile wins. Do not re-add the claim.
3. **Other pages that still state dropped claims.** Search `src/pages/*.astro` (guides, "vs", "alternatives", pricing, best-of) and `src/content/compare.json` for figures and statements about the 14 providers below that their profile no longer supports (expert counts, pricing levels, rankings, superlatives, legal or regulatory statements). Align the page with the profile, or remove the statement. Where a page reads a value from the collection, prefer that over hard-coded text.

Providers verified in this wave: guidepoint, dialectica, alphasense-tegus, atheneum, capvision, coleman-research, prosapient, lynk, inex-one, techspert, arches, zintro, mosaic, stax (and glg earlier).

Rules: add no fact. Every change is a removal, an alignment with a profile field, or an explicit "Not disclosed". Legal and regulatory statements about a named company stay only if the profile carries them with a primary source. `src/pages/networks/[slug].astro` is being rebuilt by another task: do not edit it; if it has an unguarded field, list it in `followups`.

# Scope
- src/lib/compare-v2.ts
- src/scripts/compare-page.ts
- src/pages/compare.astro
- src/pages/networks/index.astro
- src/pages/
- src/components/VsComparison.astro
- src/content/compare.json
- src/content/networks/
- src/content.config.ts
- .github/scripts/check-content-integrity.mjs
- docs/CONTENT-GUIDE.md
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] `node .github/scripts/check-content-integrity.mjs` exits 0
- [ ] Built `/compare/` HTML for the default selection and for every preset has no empty matrix cell (state how you checked in `dist/`)
- [ ] `checks` lists every page statement you changed: file, old text, new text or "removed", and the profile field it now matches
- [ ] `docs/CONTENT-GUIDE.md` documents the unknown state and the rule "remove a claim, keep the field explicit"
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
`src/pages/networks/[slug].astro`, `src/components/profile/`, `src/content/ai/`, `src/content/news/`, visual redesign, new facts.
