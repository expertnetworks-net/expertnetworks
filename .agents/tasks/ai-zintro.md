---
id: ai-zintro
role: verifier
depends_on: [ai-schema]
---

# Goal
`src/content/ai/zintro.json` records what Zintro actually does with AI today, each capability graded by the strength of its public evidence.

# Context
Read the section "AI capability records" in `docs/CONTENT-GUIDE.md` (schema, evidence ranks, wording rule) and the example `src/content/ai/glg.json`. Your role prompt's research protocol applies, with this order of sources for AI claims:
1. Product documentation: help centre, developer docs, API reference, changelog, release notes, status page.
2. Public artifacts: an MCP endpoint or its listing (for example in a Claude or ChatGPT connector directory), a public repository, an app-marketplace listing (Bloomberg, FactSet, Salesforce, Slack, Teams), a recorded product demo.
3. Third-party reporting and partner announcements (the partner's page counts as independent of the provider).
4. The provider's press releases, then marketing pages.

Questions to answer for every capability id: Does it exist? Since when? Is it generally available, beta, or announced? Who can use it? What exactly does it do (inputs, outputs)? What does it not do? For `transcript-library`: size and date of the figure, how it is sold, where it is distributed. For `mcp-server` and `api`: is there a public endpoint or docs, which clients, which data is exposed. For `data-policy`: does the provider say whether client calls or transcripts are used to train models, and is expert consent described. For `ai-lab-services`: does it sell expert work to AI developers (evaluation, data labelling, red teaming).

Fill `realityCheck` carefully: `claimed` is the provider's own wording, attributed; `evidenced` is what a document or artifact shows; `gaps` lists claims you could not support beyond marketing. A capability you cannot find is `not-found` with evidence `none`; do not guess.

# Scope
- src/content/ai/zintro.json

# Acceptance criteria
- [ ] All eleven capability ids present, in schema order
- [ ] Every source URL was opened in this task; `dateRead` is today
- [ ] No statement that the provider lies or misleads; negative findings use "No public evidence found as of <date>"
- [ ] `node .github/scripts/check-ai-content.mjs` and `scripts/agents/gate.sh --quick` pass

# Out of scope
`src/content/networks/`, pages, other providers.
