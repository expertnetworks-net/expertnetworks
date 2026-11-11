---
id: ai-schema
role: builder
depends_on: []
---

# Goal
A new content collection `ai` exists, with a strict schema and a deterministic check, so that each provider's AI capabilities can be recorded as evidence-graded data in `src/content/ai/<slug>.json`.

# Context
The site's new focus is what expert networks actually do with AI: transcript libraries, AI search and summaries, AI-moderated calls, expert matching, MCP servers and APIs, agents, services for AI labs, and data-use policy. The aim is to separate what is documented from what is only claimed. This data lives in its own collection (not in `src/content/networks/`, which other tasks are editing). Read `src/content.config.ts` and `docs/CONTENT-GUIDE.md` first.

Schema (zod, strict; reject unknown keys):

```
slug: string                       // must equal an existing networks slug and the file name
lastChecked: YYYY-MM-DD
summary: string, max 320 chars     // what is real today, in plain words, no adjectives
capabilities: array, exactly one entry per id below, in this order
  id: 'transcript-library' | 'ai-search' | 'ai-summaries' | 'ai-moderated-calls' | 'expert-matching'
    | 'mcp-server' | 'api' | 'integrations' | 'agents' | 'ai-lab-services' | 'data-policy'
  status: 'shipped' | 'beta' | 'announced' | 'not-found'
  evidence: 'product-docs' | 'public-artifact' | 'press-release' | 'marketing-page' | 'third-party-report' | 'none'
  name: string optional            // product name as the provider writes it
  description: string, max 280 chars
  firstSeen: YYYY-MM-DD optional   // date of the earliest source
  caveat: string optional, max 200 chars
  sources: array of { url, title, dateRead: YYYY-MM-DD }   // required non-empty unless status is 'not-found'
library: optional object
  size: string optional, sizeAsOf: YYYY-MM-DD optional
  sizeEvidence: same enum as evidence
  access: string, max 200          // who can read it and how it is sold
  distribution: string[]           // e.g. Bloomberg, FactSet, AlphaSense, own platform
  sources: same shape, non-empty
realityCheck:
  claimed: string[]                // what the provider says, attributed
  evidenced: string[]              // what a document, changelog, or public artifact shows
  gaps: string[]                   // claims with no evidence beyond the provider's own marketing
```

Evidence ranks, strongest first: `product-docs` (help centre, developer docs, changelog), `public-artifact` (public MCP endpoint, repository, app listing, live demo), `third-party-report`, `press-release`, `marketing-page`, `none`.

Derived label, computed in one exported function `substantiation(capability)` in `src/lib/ai-evidence.ts` (pure, no I/O), used later by pages: `shipped|beta` + `product-docs|public-artifact` → "Documented"; `shipped|beta` + `third-party-report|press-release` → "Reported"; any status + `marketing-page` → "Claimed"; `announced` → "Announced"; `not-found` → "No public evidence".

# Scope
- src/content.config.ts
- src/content/ai/
- src/lib/ai-evidence.ts
- .github/scripts/check-ai-content.mjs
- scripts/agents/gate.sh
- .github/workflows/verify.yml
- docs/CONTENT-GUIDE.md
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] Collection `ai` is defined; `npm run build` validates it; an empty collection builds
- [ ] One real example, `src/content/ai/glg.json`, researched in this task from GLG's own pages and press releases (every source opened now)
- [ ] `check-ai-content.mjs` fails when: slug has no matching provider; a capability id is missing, duplicated, or out of order; a non-`not-found` capability has no source; a `dateRead` or `lastChecked` is in the future; status `shipped` has evidence `none`
- [ ] `gate.sh` (stays mode 755) and `verify.yml` run the check after the slug check
- [ ] `docs/CONTENT-GUIDE.md` has a section "AI capability records": field reference, the evidence ranks, the derived labels, and the wording rule below
- [ ] `scripts/agents/gate.sh --quick` passes

Wording rule (legal): never write that a provider lies, bluffs, or misleads. Write what was claimed, what was found, and the gap. "No public evidence found as of <date>" is the strongest negative statement allowed.

# Out of scope
Pages and UI. Files in `src/content/networks/`. Other providers' AI records.
