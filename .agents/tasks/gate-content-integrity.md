---
id: gate-content-integrity
role: tester
depends_on: []
---

# Goal
The merge gate fails when a content change would leave a visible hole or contradiction on the site, even though the build passes.

# Context
A verification wave corrected provider profiles and reviews found three failure types the gate did not catch: (1) a removed profile field left a blank cell in the compare matrix or a missing stat on a profile page; (2) a provider stayed in a `src/content/compare.json` preset whose criterion its profile no longer meets; (3) a badge field (`aiBadge`, `complianceBadge`, `categoryBadge`) no longer matched the profile's own comparison fields. Read `src/lib/compare-v2.ts`, `src/content/compare.json`, `src/pages/networks/[slug].astro`, `src/pages/networks/index.astro`, and `src/content.config.ts` to learn which fields the UI reads without a guard.

# Scope
- .github/scripts/check-content-integrity.mjs
- scripts/agents/gate.sh
- .github/workflows/verify.yml
- docs/DEPLOYMENT.md (section 4 only)

# Acceptance criteria
- [ ] `node .github/scripts/check-content-integrity.mjs` exits non-zero and names the provider and field when: a provider used in compare defaults or presets renders an empty matrix cell; a published profile lacks a field that a page renders without a guard; a profile's `lastUpdated` is in the future
- [ ] The script exits 0 on the current tree, or every existing defect it reports is listed in `risks` (do not edit content to make it pass)
- [ ] `gate.sh` and `verify.yml` run the script after the slug check; `gate.sh` stays executable (mode 755)
- [ ] No new dependency

# Out of scope
Editing any file under `src/`. Semantic judgments that need a model (the script is deterministic).
