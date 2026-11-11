# Roadmap

This file owns: goals, phases, open decisions, and the research behind them.
How work is executed is in `AGENT-WORKFLOW.md`. How it ships is in `DEPLOYMENT.md`.
Written 2026-11-11. Re-verify any external fact older than 90 days before acting on it.

## 1. Goal

Make ExpertNetworks.net the primary, most-cited independent source on expert network providers, for buyers and for AI answer engines.

| Metric | Now | Source of truth |
|---|---|---|
| Visits per day | ~1,000–2,000 (owner estimate, not yet verified) | Cloudflare Web Analytics |
| Search clicks, impressions | Not tracked yet | Google Search Console, Bing Webmaster Tools (both free) |
| Citations in AI answers | Not tracked yet | Manual monthly probe: 20 fixed questions in ChatGPT, Perplexity, Google AI Mode |
| Content freshness | Newest news item age | `scripts/agents/monitor.sh` |

Constraints: the project is anonymous (no personal names, emails, or employers in the repo, commits, or site); it will be open source; no spend beyond the owner's Claude and ChatGPT subscriptions; Cloudflare is the only host; every change passes the gate.

## 2. What the research says, and what we do about it

### 2.1 Agent workflow

| Finding | Evidence | Our rule |
|---|---|---|
| Most multi-agent failures come from specification, coordination, and verification design, not model weakness. 14 failure modes in 3 groups. | Cemri et al., *Why Do Multi-Agent LLM Systems Fail?* (MAST), arXiv 2503.13657 | Task specs with Scope and checkable acceptance criteria; a gate that the worker cannot skip; explicit termination (JSON report). |
| Orchestrator-worker wins on breadth-first, parallelizable work, at roughly 15x the tokens of chat. Token spend explains most of the performance variance. | Anthropic, *How we built our multi-agent research system* | Fan out only independent tasks (provider refreshes, news batches, page audits). Keep coupled work (compare page) in one worker. |
| Good orchestration depends more on preserving information across dependent tasks than on agent count. | OrchBench, arXiv 2607.25656 | `depends_on` in specs; pass the previous task's `result.json` summary into the dependent spec. |
| Context files help only when they hold non-obvious rules; overviews do not help and raise cost ~20%. | Gloaguen et al., *Evaluating AGENTS.md*, arXiv 2602.11988 (ICLR 2026) | Keep `AGENTS.md` to rules and pitfalls. Move maps into `docs/`. Review it each quarter. |
| A model misses more bugs in its own code than in another model's. | Greptile cross-review study (Claude vs Codex) | Cross-vendor review: Codex builds → Claude reviews; Claude builds → `codex exec review`. |
| Parallel agents on separate git worktrees with a human orchestrator is the practical productivity pattern. | Industry synthesis, 2026 | Already implemented: `swarm.sh`. |

### 2.2 Search and AI-answer visibility

| Finding | Evidence | Our rule |
|---|---|---|
| Google's 2026 core updates hit thin comparison and affiliate pages hardest; pages with original data, first-hand evaluation, and visible ownership held up. | Industry tracking of the March 2026 core update; Google's own helpful-content questions | Every provider page must show: sources, last-verified date, methodology link, and something a competitor cannot copy (our own matrix scores, change history). No mass-generated pages. |
| Adding citations, statistics, and attributed quotations raised visibility in generative-engine answers by up to ~40%; keyword stuffing hurt. | Aggarwal et al., *GEO: Generative Engine Optimization*, KDD 2024, arXiv 2311.09735 | Each page opens with a sourced, quotable summary with numbers. No keyword padding. |
| Cloudflare now sorts AI crawlers into Search, Agent, and Training, with new blocking defaults for free plans (from 2026-09-15, on ad pages). Mixed crawlers like Googlebot follow the strictest rule. | Cloudflare announcement coverage, July 2026 | Explicit setting: allow Search and Agent (we want citations); decide Training. Verify with a crawler user-agent probe. |

### 2.3 Platform and security

| Finding | Evidence | Our rule |
|---|---|---|
| Pages free plan: unlimited static requests and bandwidth, 500 builds per month. Cloudflare points new work to Workers with static assets. | Cloudflare Pages limits docs | Stay on Pages while the site is static. Do not push every agent branch (each push is a build); push integration branches only. Migrate to Workers static assets when the first dynamic feature lands. |
| Astro's CSP API (hash-based) is stable since Astro 6 and works with static output; it is incompatible only with `<ClientRouter />`. We use native CSS view transitions, not `ClientRouter`. | Astro 6 release notes; Astro CSP docs | Phase 1: replace `'unsafe-inline'` with Astro-generated hashes. |
| Public repositories get code scanning, secret scanning, push protection, and rulesets free. | GitHub security features docs | Phase 1: enable all; ruleset on `main` requiring the `verify` check and a PR. |
| Supabase free: 2 projects, 500 MB, projects pause after 7 days without database activity. Over 16,000 Supabase databases were found readable because row-level security was missing or keys were misused. | Supabase pricing and pause FAQ; UpGuard study, Sept 2026 | See section 4. RLS on every table from the first migration, no service key outside server code, an advisor check in CI. |

## 3. Phases

### Phase 0 — Foundation (now)
- [x] One production branch: `main`. Old production branch merged and frozen.
- [x] Agent swarm: roles, task specs, schema, `swarm.sh`, `gate.sh`, `monitor.sh`.
- [ ] Cloudflare Pages: production branch → `main`; `NODE_VERSION` on Preview; confirm AI crawler and bot settings. (Owner: dashboard sign-in.)
- [ ] GitHub: ruleset on `main`, secret scanning + push protection, CodeQL default setup.
- [ ] Measurement: Search Console + Bing Webmaster verified via Cloudflare DNS; baseline traffic from Web Analytics.
- [ ] Mobile control: Codex Cloud environment for the repo; `@codex review` on PRs; Codex mobile pairing.

### Phase 1 — Trust and quality (weeks 1–4)
- [ ] Editorial policy page: independence, no paid placement, sourcing hierarchy, corrections process. The project stays anonymous; trust comes from method and evidence, not from a named author.
- [ ] Methodology page made concrete: scoring rubric, source hierarchy, update cadence.
- [ ] Per-profile "last verified" date and change log, generated from git history at build time.
- [ ] Verifier swarm: re-verify all provider profiles (one task per provider, max 3 parallel).
- [ ] News pipeline: weekly batch of sourced items via `add-news`, reviewed cross-vendor.
- [ ] CSP without `'unsafe-inline'`; Lighthouse/Web Vitals budget in CI.
- [ ] Structured data: `Organization`, `Dataset` for the compare matrix, `NewsArticle` for news, `BreadcrumbList`.

### Phase 2 — Data layer (Supabase)
- [ ] Decision record (5.1). Then one Supabase project, migrations in `supabase/migrations/`, RLS on every table.
- [ ] Write side only at first: newsletter/alerts signups and "suggest a correction" form, through a Cloudflare Worker with Turnstile (free) — the browser never talks to tables directly.
- [ ] Source monitor: a scheduled GitHub Action (free on public repos) checks provider press pages and stores candidates for the news queue. This daily activity also keeps the free project from pausing.
- [ ] Build reads published content from git JSON as today. Supabase holds queues and submissions, not the published truth, until there is a reason to change that.

### Phase 3 — Growth (after measurement exists)
- [ ] Original data the market lacks: e.g. a pricing and terms survey, a compliance-feature matrix verified against public documents.
- [ ] Interactive tools: shortlist builder, cost estimator.
- [ ] Media: video and voice through OpenRouter and ElevenLabs (paid APIs; needs owner approval under the budget rule).

## 4. Supabase: what it is for

The site works without a database. Supabase earns its place only for things a static site cannot do: accept input, run a queue, keep history.

| Use | Why a database | Risk control |
|---|---|---|
| Newsletter / alerts | Store opt-ins | Worker + Turnstile; RLS insert-only; no public select |
| Correction submissions | Readers report errors; editors triage | Same; personal data minimized |
| News and source queue | Candidates found by the monitor, reviewed before publish | Service key only in the Action's secrets |
| Event log of verifications | Evidence for "last verified" | Append-only table |

Alternative to weigh in 5.1: Cloudflare D1 (same vendor, free tier, no pause). Supabase gives Postgres, auth, and a dashboard; D1 keeps one vendor and no pause risk.

## 5. Open decisions (owner)

### 5.1 Supabase vs D1 for the data layer
Criteria: pause risk, security surface, one vendor vs two, SQL features needed. Record the decision in this file before the first migration.

### 5.2 AI training crawlers
Allow (more model familiarity, possibly more citations) or block (protect original data). Search and Agent stay allowed either way.

## 6. References

- Cemri et al. *Why Do Multi-Agent LLM Systems Fail?* https://arxiv.org/abs/2503.13657
- Anthropic. *How we built our multi-agent research system.* https://www.anthropic.com/engineering/multi-agent-research-system
- *OrchBench.* https://arxiv.org/pdf/2607.25656
- Gloaguen et al. *Evaluating AGENTS.md.* https://arxiv.org/abs/2602.11988
- Lulla et al. *On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents.* https://arxiv.org/abs/2601.20404
- Greptile. *Model inversion* (cross-model review). https://www.greptile.com/blog/model-inversion
- Aggarwal et al. *GEO: Generative Engine Optimization.* https://arxiv.org/abs/2311.09735
- Astro 6 CSP. https://astro.build/blog/astro-6
- Cloudflare Pages limits. https://developers.cloudflare.com/pages/platform/limits/
- Supabase free-project pausing. https://supabase.com/kb/faqs/platform/free-project-pausing
- UpGuard / BleepingComputer on 16,000 exposed Supabase databases. https://www.bleepingcomputer.com/news/security/misconfigured-supabase-apps-expose-data-in-over-16-000-databases
- GitHub security features. https://docs.github.com/en/code-security/getting-started/github-security-features
- OpenAI Codex help (plans, cloud, code review). https://help.openai.com/en/articles/11369540
