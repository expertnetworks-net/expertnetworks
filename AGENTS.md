# AGENTS.md

Instructions for every AI agent that works in this repository: Codex, Claude Code, and any other tool.
Codex loads this file automatically. `CLAUDE.md` imports it for Claude Code.
Keep it short. Put details in `docs/`.

## What this repository is

- A static Astro site for <https://expertnetworks.net>.
- The repository is the CMS. Content is JSON in `src/content/`.
- There is no server, no API, no database, no admin panel, and no React.
- A push or merge to `main` deploys the live site through Cloudflare Pages. See `docs/DEPLOYMENT.md`.

## Terms

| Term | Meaning |
|---|---|
| provider | A company that the site profiles. This is the only term for the entity in the docs. |
| network | The name for a provider in code and URLs: `src/content/networks/`, `relatedNetworks`, `/networks`. |
| slug | The identifier of a provider or news item. It is the `slug` field and the file name without `.json`. |
| production branch | `main`. Cloudflare Pages deploys it to the live site. |

## Rules

0. **The project is anonymous.** Never write a personal name, personal email, employer, or location of the owner in code, content, docs, commit messages, or PRs. Commits use the repository-local identity `ExpertNetworks.net Editors <editors@expertnetworks.net>`. Merge locally and push; do not merge in the GitHub web UI (it records the merger's personal identity). `scripts/agents/identity-check.sh`, the git hooks, `gate.sh`, and the `Anonymity` CI workflow enforce this.

1. `src/content.config.ts` is the source of truth for content shape. Change the schema before you add a field.
2. Do not write a fact that you did not read in a public source in this session. See `docs/CONTENT-GUIDE.md`.
3. Do not push or merge to `main` without the explicit approval of the owner. Get approval for each deploy.
4. Run `npm run verify` after each change to code or content.
5. Run `node .github/scripts/check-slugs.mjs` after each change in `src/content/`.
6. Describe only what the code does now. Do not describe the site as SSR, API-driven, or CMS-backed.
7. Keep the site static. A server, an adapter, or a runtime service is an architecture change. Ask the owner first.
8. Keep each fact in one doc. Link to the doc that owns the fact. See the doc map below.
9. When you change behavior, update the doc that owns that behavior in the same commit.

## Doc map

Each fact has one owner. Read the owner before you work on that topic.

| File | Owns |
|---|---|
| `README.md` | Purpose of the project, quick start, links. For human readers. |
| `AGENTS.md` | Agent rules, terms, repository map, commands, pitfalls. Shared by all agent tools. |
| `CLAUDE.md` | Imports `AGENTS.md`. Adds only Claude-specific notes (orchestrator role). |
| `docs/ROADMAP.md` | Goals, phases, decisions, and the research behind them. |
| `docs/AGENT-WORKFLOW.md` | Multi-agent model: orchestrator, Codex worker roles, task specs, worktrees, swarm scripts, merge gates, image generation. |
| `docs/ARCHITECTURE.md` | Build pipeline, page and component responsibilities, client scripts, compare page design. |
| `docs/CONTENT-GUIDE.md` | Sourcing rule, schema field reference, procedures for providers, news items, and compare config. |
| `docs/DEPLOYMENT.md` | Branches, Cloudflare Pages, Node version, CI, deploy procedure, dependency updates, known issues. |
| `docs/SECURITY.md` | Security posture, header policy rules, audit history. |
| `docs/TROUBLESHOOTING.md` | Symptoms, causes, and corrections. |
| `docs/archive/` | Historical files. Not maintained. Do not use them as a source of current facts. |

## Repository map

| Path | Content |
|---|---|
| `src/content.config.ts` | Zod schemas for the `networks` and `news` collections. |
| `src/content/networks/*.json` | One file for each provider. |
| `src/content/news/*.json` | One file for each news item. |
| `src/content/compare.json` | Compare page defaults, presets, matrix rows, and compare-only provider data. |
| `src/pages/` | Routes. One `.astro` file for each page. `networks/[slug].astro` makes one page for each provider. |
| `src/layouts/BaseLayout.astro` | Metadata, JSON-LD, header, footer, shared browser script. |
| `src/components/` | `Header`, `Footer`, `ParticleHero`, `TrackedNetworksMarquee`, `VsComparison`. |
| `src/lib/compare-v2.ts` | Compare view-model and HTML renderer. Used at build time and in the browser. |
| `src/scripts/compare-page.ts` | Compare page browser controller. |
| `public/_headers` | Security headers, CSP, and cache rules for Cloudflare Pages. |
| `scripts/verify-dist-links.mjs` | Internal link check on `dist/`. |
| `.github/scripts/check-slugs.mjs` | Cross-file slug check on `src/content/`. |
| `.github/workflows/verify.yml` | CI workflow. |
| `.claude/skills/` | Project skills: `add-news`, `refresh-provider`, `deploy`. `.agents/skills` links here for Codex. |
| `.agents/roles/` | Role prompts for Codex workers: builder, reviewer, tester, verifier, monitor, designer. |
| `.agents/tasks/` | Task specs. `_TEMPLATE.md` is the format. One file for each unit of work. |
| `.agents/schemas/` | JSON Schema for the final report of each worker. |
| `scripts/agents/` | `swarm.sh` (dispatch, fan-out, review, status, clean), `gate.sh` (all checks in one command). |

## Commands

| Command | Function |
|---|---|
| `npm ci` | Installs the locked dependencies. |
| `npm run dev` | Starts the local dev server. |
| `npm run build` | Builds the site into `dist/`. Validates all content against the schema. |
| `npm run verify:links` | Checks internal `href` and `src` values in `dist/`. Needs a build first. |
| `npm run check` | Runs `astro check` (TypeScript and template diagnostics). |
| `npm run verify` | Runs build, link check, and `astro check` in sequence. Default check before each merge. |
| `node .github/scripts/check-slugs.mjs` | Checks slugs, `relatedNetworks`, compare references, and logo paths. |
| `npm audit --audit-level=high` | Reports the advisories that make CI fail. |
| `scripts/agents/gate.sh` | Runs verify, slug check, and audit. The merge gate for every agent branch. |
| `scripts/agents/swarm.sh help` | Lists the swarm commands. See `docs/AGENT-WORKFLOW.md`. |

The required Node version is in `package.json` (`engines`). `.node-version` selects it for CI and Cloudflare Pages.

## Agent work

- One task = one task spec in `.agents/tasks/` = one branch `agent/<task-id>` = one worktree.
- Workers do not commit, push, merge, or deploy. `scripts/agents/swarm.sh` commits. The orchestrator merges. The owner approves deploys.
- Workers stay inside the files that their task spec lists under **Scope**. A change outside the scope is a failure, not initiative.
- Each worker ends with a JSON report that matches `.agents/schemas/result.schema.json`.
- Details: `docs/AGENT-WORKFLOW.md`.

## Skills

| Skill | Use it to |
|---|---|
| `/add-news` | Add one news item from a public source. |
| `/refresh-provider` | Verify a provider profile again and update it. |
| `/deploy` | Deploy a verified branch to production. Only the owner starts this skill. |

## Pitfalls

1. **A push to `main` deploys.** Work on `agent/<id>` or feature branches. Only the `/deploy` procedure touches `main`. See `docs/DEPLOYMENT.md`.
2. **A build can pass with a wrong slug.** The schema does not check `relatedNetworks` or `src/content/compare.json` references. Run the slug check.
3. **A build can pass with a broken UI.** Browser scripts find elements by `id`, class, and `data-*` attributes. If you rename one, update each selector that uses it.
4. **The compare page has three code files and one config file.** Keep `src/pages/compare.astro`, `src/lib/compare-v2.ts`, `src/scripts/compare-page.ts`, and `src/content/compare.json` aligned. Put render logic in `src/lib/compare-v2.ts` only.
5. **`public/_headers` contains the CSP.** A new external script, style, font, or embed needs a CSP change in the same commit. Do not remove the Cloudflare Web Analytics entries.
6. **File names in `public/` are case-sensitive in CI and on Cloudflare Pages.**
7. **CI fails on new high-severity advisories.** This can occur without a code change. See `docs/DEPLOYMENT.md`.
8. **Counts go stale.** Do not write the number of providers, news items, or pages in a doc. Give the command that produces the number.
