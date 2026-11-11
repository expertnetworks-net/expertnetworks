---
id: verify-glg
role: verifier
depends_on: []
---

# Goal
Every factual claim in the GLG provider profile is confirmed by a public source read in this task, or flagged.

# Context
Sourcing rule and field reference: `docs/CONTENT-GUIDE.md`. Schema: `src/content.config.ts`. This is a pilot of the verifier role; prefer flagging over editing.

# Scope
- src/content/networks/glg.json

# Acceptance criteria
- [ ] Each checked claim appears in `checks` with the source URL in `note`
- [ ] A claim that fails verification is corrected with its source, or listed in `risks`
- [ ] `node .github/scripts/check-slugs.mjs` and `scripts/agents/gate.sh --quick` pass

# Out of scope
Other providers. Rewriting copy for style. Adding new fields.

# Sources
Start from the URLs already cited in the file, then the provider's own site (glginsights.com) and its press releases.
