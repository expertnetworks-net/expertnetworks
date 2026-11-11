---
id: verify-mainstreet-research
role: verifier
depends_on: []
---

# Goal
Every claim in the Mainstreet Research profile is confirmed against a public source read in this task, corrected, dated, attributed, or removed; and the profile includes the provider's material developments of the last 12 months.

# Context
Follow the research protocol in your role prompt. Sourcing rule and field reference: `docs/CONTENT-GUIDE.md`. Schema: `src/content.config.ts`. Lesson from the GLG pilot: a profile labeled "verified" had 9 unsupported claims, including a regulatory allegation with no source naming the company.

# Scope
- src/content/networks/mainstreet-research.json

# Acceptance criteria
- [ ] `checks` lists each claim group with its classification and source URL
- [ ] No legal or regulatory claim remains without a primary source naming the company
- [ ] No unattributed superlative or comparison remains
- [ ] `sourceNotes` lists only URLs read in this task, with today's date
- [ ] `node .github/scripts/check-slugs.mjs` and `scripts/agents/gate.sh --quick` pass

# Out of scope
Other providers, `compare.json`, news items, style rewrites of confirmed copy, new schema fields.
