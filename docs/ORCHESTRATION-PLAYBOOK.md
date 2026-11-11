# Orchestration playbook

This file owns: how to orchestrate Claude and Codex well on this project — techniques, review rules, measurement, known pitfalls, and the experiment log.
The reference for commands and configuration is `AGENT-WORKFLOW.md`. Research behind these choices: `ROADMAP.md` section 2.

Rule for this file: a technique goes here only after it was tried on this repository. Each entry says what was observed.

## 1. Orchestrator checklist

Before dispatch:
1. One observable result per task. Scope lists files. Parallel tasks have disjoint Scopes.
2. Every acceptance criterion maps to a command or a visible result.
3. The spec carries the lessons of earlier runs (a line under Context), not a link to a log the worker cannot see.
4. Do not edit `swarm.sh` in place while a fanout runs; replace it atomically (write a new file, `mv` over it).

After a worker ends:
1. `swarm.sh metrics <id>`: `UNSEEN` must be 0; skim `SNIPPET`.
2. Read `risks` in `result.json` first. It is where workers put what they could not do.
3. `swarm.sh claude-review <id>` for Codex-written work. A `BLOCK`, or any legal-risk finding, becomes a follow-up spec (`depends_on` the first).
4. `swarm.sh integrate <ids>`; the gate must pass on the integration branch.
5. Show the owner the commit list. Merge to `main` only with approval.

## 2. Patterns that worked

| Pattern | Use it for | Observed |
|---|---|---|
| **Verify then fix, one worker** (role `verifier` with the research protocol) | Provider profiles | Opens 34–39 pages per profile, classifies each claim, edits in Scope, about 7.5 minutes. Simpler than two workers. |
| **Verify, then a separate fix task** | High-risk content, first run of a new protocol | Used for GLG. The flag-only pass gave the orchestrator a list to turn into explicit acceptance criteria. Costs two runs. |
| **Cross-vendor review loop** | Everything a worker wrote | Claude blocked a Codex change that Codex's own gate had passed (a hedged legal allegation). Codex then reviewed Claude's removal. |
| **Remove, do not hedge** | Legal, regulatory, ranking claims without a primary source | Two rounds of hedged wording were both blocked in review. Removal passed. |
| **Dependent follow-up task** (`depends_on`) | Review findings | The follow-up starts from the integration branch and inherits the first fix. |
| **Flag-first pilot** | Any new role or protocol | Run one task, read the event log, then fan out. The GLG pilot exposed the sandbox and symlink problems before 19 tasks ran. |

## 3. Patterns to avoid

| Anti-pattern | What happened |
|---|---|
| Trusting a worker's "gate passed" | The first verifier reported a failed gate caused by tooling, not content. Always run the gate from the orchestrator. |
| Trusting dated "confirmed" notes | A worker wrote "2026-11-11 check confirms" for pages the diff gave no evidence of. `metrics.mjs` now compares citations with the event log. |
| Trusting your own instrumentation without a spot-check | The first version of the citation check reported 27 of 28 citations as unopened. It was a parser gap (batched page opens), not fabrication. |
| One-file Scope for a fact that appears in many files | Verifier tasks scoped to one profile produced correct profiles that contradicted guide pages, `compare.json` presets, and badge fields. Follow each wave with a consistency task. |
| Wide Scope "just in case" | Not tried, on purpose: MAST lists specification failures as the main cause of multi-agent failure. |
| Pushing every agent branch | Each push is a Cloudflare Pages build (500 per month on Free). Agent branches stay local. |

## 4. Review rule: cross-vendor

A model misses more defects in its own output than in another model's (see `ROADMAP.md` 2.1).

- Code written by a Codex worker is reviewed by Claude (the orchestrator) **and** by `swarm.sh review`.
- Code written by Claude is reviewed by `codex exec review`.
- Content (provider facts, news) is checked by a `verifier` worker that did not write it.

## 5. Measurement and evidence

`scripts/agents/metrics.mjs` reads the Codex event log of each run. It needs no network and no model.

| Column | Meaning | Use |
|---|---|---|
| `SEC`, `UNCACHED`, `OUT` | Wall time, uncached input tokens, output tokens | Cost per task. Compare protocols and effort levels with these, not with impressions. |
| `PAGES` | Distinct pages the worker opened | Research depth. |
| `CONFIRMED` | Checks passed / checks reported | For a verifier, a low ratio means the profile needed work, not that the worker failed. |
| `CITED` / `SNIPPET` / `UNSEEN` | URLs cited in the report and in added lines; of those, seen only as a search snippet; never seen at all | `UNSEEN` > 0 blocks a merge until a human or a reviewer opens the page. `SNIPPET` is weak evidence: spot-check. |

`sources.json` in each run dir is the evidence ledger: every page opened and every query. Run dirs are local and git-ignored; the durable record is `sourceNotes` in the content file.

Baseline, first verifier wave (2026-11-11, effort `high`): about 7.5 minutes, ~200k uncached input tokens, 35–40 pages opened per profile. Re-measure after any protocol change.

## 6. Cost and speed levers

| Lever | Setting | Why |
|---|---|---|
| Reasoning effort | By role: builders `max`, verifiers/designers/reviewers `xhigh`, tester `high`, monitor `medium`; fast tier on (`CODEX_FAST=1`) | Owner's quota allows it (2026-11-11). Effort is cheaper than an extra review round. `ultra` (auto-delegation) not used: it would nest swarms inside the swarm. |
| Worker context | Workers read `AGENTS.md` and the docs the spec links, nothing else | Orchestrator docs in a worker's context are paid for on every turn. |
| Parallel width | 5 | Model calls are remote; the RAM cost is concurrent builds. Watch `memory_pressure`; drop to 3 if free memory falls under 20%. |
| Retries | 1, only when there is no report | A retry on `failed` repeats a real answer and doubles cost. |
| Orchestrator | Plans, reviews, integrates; does not do bulk edits | The orchestrator's context is the scarce resource. |

## 7. Experiment log

One row per experiment. Record the question, the setup, the numbers, and the decision.

| Date | Question | Setup | Result | Decision |
|---|---|---|---|---|
| 2026-11-11 | Does the dispatch pipeline work end to end? | 1 `monitor` task, effort `low` | Schema-valid report in 81 s | Keep. |
| 2026-11-11 | Can a verifier audit a profile from public sources? | GLG, flag-only, effort `high` | 60 claims checked, 37 confirmed, 15 issues; 402 s; 40 pages | Role is viable. Write the research protocol. |
| 2026-11-11 | Does cross-vendor review add value? | Claude reviews Codex fixes on GLG | 1 MERGE with 3 findings, 1 BLOCK with 4 findings; a legal-risk passage caught | Mandatory for content. |
| 2026-11-11 | Verify-and-fix in one worker, effort `high` | AlphaSights, Third Bridge, Guidepoint | 425–458 s, 184k–227k uncached input tokens, 34–39 pages, 0–1 unseen citations; 5–16 of ~40 claims confirmed as written | Works. Next: same protocol at `medium` on 13 profiles and compare pages opened, unseen citations, review verdicts. |
| 2026-11-11 | Does cross-vendor review hold on the full wave, and does effort `medium` keep quality? | Claude review of 6 `high` profiles; 6 more profiles at `medium` | Review: 3 MERGE, 3 BLOCK. Main cause of BLOCK: a profile fix that contradicts other pages, `compare.json` presets, or badge fields the worker left untouched; removed fields that blank a compare cell or a profile stat. `medium` vs `high`: ~3.8 min vs ~8 min, ~120k vs ~193k uncached tokens, 17–28 vs 32–53 pages, 19–36 vs 37–46 claims checked. | Profile verification needs a second, cross-file pass: one `builder` task per wave for consistency (pages, compare, badges). `medium` is cheaper but shallower; judge it by review verdicts before adopting. Do not deploy a wave before the consistency pass. |
| 2026-11-11 | Codex at `max` + fast tier for builders, `xhigh` for verifiers and reviewers | 7 design tasks fanned out at width 5 on an integration branch (`integration/design`) holding the accepted profile, AI schema and records, logos, illustrations | Two tasks stopped in under a minute with `blocked`: the specs referenced a page another parallel task was creating, and assets not on the base branch. Cost ~50 s each. | Good failure mode: workers obey Scope instead of improvising. Orchestrator rule: before a parallel fan-out, put every shared asset on the base branch and list planned cross-task destinations in each spec. |
| 2026-11-11 | Orchestrator visual review of builder output | Build the worktree, serve `dist/` with `python3 -m http.server` (astro preview failed outside the project root), inspect at 1440 and 375 px in a real browser | Found defects no gate catches: truncated summary, wrong fact label, blank animated sections (base `opacity: 0`), hidden mobile headline | Mandatory for any UI task before merge. |


## 8. Known pitfalls of the tooling

Found while testing the swarm on 2026-11-11. Each one is fixed in `swarm.sh` or guarded by `gate.sh`.

| Pitfall | Guard |
|---|---|
| Editing a script from a Linux VM or with `sed -i` can drop its executable bit. | `gate.sh` step "agent scripts executable". Fix: `chmod 755 scripts/agents/*.sh .githooks/*`. |
| A shared `node_modules` symlink breaks the sandbox (Vite writes its cache outside the writable worktree) and parallel builds. | Per-worktree APFS clone. |
| `codex exec review` rejects a custom prompt together with `--base`. | `swarm.sh review` passes no prompt; Codex reads `AGENTS.md`. |
| `claude -p --allowedTools A B C "prompt"` treats the prompt as another tool name. | Prompt goes through stdin. |
| `claude -p --permission-mode plan` returns only a plan stub. | Normal mode; the read-only tool allowlist denies everything else. |
| Rewriting `swarm.sh` while a `fanout` is running makes bash execute the new file from an old byte offset. | Do not edit `swarm.sh` while a fanout runs. |
| The Claude Code login on the Mac expires (warning seen: ends by 2026-11-14). | For unattended runs use `claude setup-token` (subscription token, no API cost). |
