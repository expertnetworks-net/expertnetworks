---
id: fix-glg-sec-link
role: builder
depends_on: [fix-glg-claims]
---

# Goal
The GLG profile does not imply that GLG is the unnamed "expert network firm" in the SEC v. Martoma complaint unless a primary or court source names GLG.

# Context
Cross-vendor review of `fix-glg-claims` (`.agents/runs/fix-glg-claims/review-claude.md`, finding 1 and 2) found:
1. `compliance.regulatoryHistory` and `complianceExtended.regulatoryContext` place the complaint's concealment allegation on GLG's profile with no cited source that names GLG as the firm.
2. Unverified replacements: "Gurugram, Mumbai" offices, "paragraph 30" of the complaint, and two URLs (`glg.com/compliance`, the Library page) that were not in the original source list.
3. `history` is still labeled verified, but "Mid-2000s: Builds major compliance systems" has no source.

# Scope
- src/content/networks/glg.json

# Acceptance criteria
- [ ] Either a primary/court source that names GLG is cited, or the text states only what the complaint says without linking it to GLG
- [ ] Each item in finding 2 is confirmed with the URL read in this task, or removed
- [ ] The `history` confidence label matches its weakest unsourced item, or that item is sourced/removed
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Any other field or provider.
