---
id: fix-glg-claims
role: builder
depends_on: []
---

# Goal
The GLG profile states only what public sources support; every unsupported or overstated claim found by the verifier pilot is corrected, narrowed, labeled as editorial inference, or removed.

# Context
A verifier pass flagged the issues below. Re-read the cited sources yourself before you edit. Sourcing rule: `docs/CONTENT-GUIDE.md`. Schema: `src/content.config.ts`. Legal sensitivity: never state or imply wrongdoing by a named company without a primary source; describe allegations as allegations.

Flagged by the verifier:
1. history.timeline: London opened in 2003, not 2004.
2. compliance.regulatoryHistory and complianceExtended.regulatoryContext: an unverified 2004 SEC-investigation allegation. Remove it unless a primary source supports it.
3. Regulatory passages overstate the case documents: narrow the "no charges" statement to the specific case, call concealment an allegation, remove general exoneration and "safer incumbent" causation.
4. compliance.coolingOffPeriod: no verified period. Omit or describe the limited evidence.
5. pricingDetail: standalone per-call purchasing is unconfirmed today; subscriptions and projects have filing support (2021 S-1).
6. strengths: remove "broadest distribution" and "broadest client base" superlatives; label 2,700+ clients as a June 2021 figure; drop Bengaluru if not in the current official office list.
7. notableFacts: remove the "no publicly named clients" assertion.
8. Comparative judgments (relative pricing, opacity, small-project fit) must be labeled editorial inference or removed.
9. Update the profile's verification date field to today only for claims you verified; keep confidence labels honest.

# Scope
- src/content/networks/glg.json

# Acceptance criteria
- [ ] Each of the 9 items is resolved; each resolution is listed in `checks` with the source URL read in this task
- [ ] No remaining claim of an SEC investigation without a primary source
- [ ] `node .github/scripts/check-slugs.mjs` passes
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Other providers. compare.json. Style rewrites of copy that was verified.

# Sources
https://glginsights.com/gerson-lehrman-group · https://glg.com/about/contact-locations · https://glginsights.com/fact-sheet/ · https://www.sec.gov/Archives/edgar/data/1661123/000119312521301055/d161028ds1.htm · and the URLs already cited in the file.
