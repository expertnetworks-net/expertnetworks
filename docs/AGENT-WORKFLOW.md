# Agent workflow

This file owns: the multi-agent model, worker roles, the task spec format, worktrees, the swarm scripts, configuration, and operating surfaces. It is the reference.
Techniques, lessons, measurements, and the experiment log are in `ORCHESTRATION-PLAYBOOK.md`.
Rules that bind every agent are in `AGENTS.md`. Deploy rules are in `DEPLOYMENT.md`.

## 1. Model

| Layer | Who | Does | Does not |
|---|---|---|---|
| Owner | Project owner (anonymous) | Sets goals. Approves each deploy. | — |
| Orchestrator | Claude (Opus / Fable) in chat or Claude Code | Plans, writes task specs, dispatches, reads reports, reviews, integrates. | Large edits that a worker can do. Deploy without approval. |
| Workers | Codex CLI (`codex exec`), one process per task | Build, review, test, verify facts, monitor, design. | Commit, push, merge, deploy, edit outside Scope. |
| Gate | `scripts/agents/gate.sh` + CI | Decides if a branch can merge. | — |

Why this split: the orchestrator holds context and judgment; workers are cheap, parallel, and isolated. A worker's report is a claim. The gate and a review are the evidence.

## 2. Lifecycle of one task

```
task spec ──> swarm run ──> worktree agent/<id> ──> codex exec (role prompt + spec)
     │                                                     │
     │                                    result.json (schema) + auto-commit
     │                                                     │
     └────────── swarm review (codex review) ── swarm gate ── integrate ── /deploy (owner)
```

1. **Spec.** `scripts/agents/swarm.sh new <id> <role>` copies `.agents/tasks/_TEMPLATE.md`. Fill Goal, Scope, Acceptance criteria. Parallel tasks must have disjoint Scopes.
2. **Run.** `swarm.sh run <id>` checks `depends_on`, then creates worktree `$SWARM_WT_DIR/<id>` on branch `agent/<id>` from `origin/main`, clones `node_modules` into it (APFS clone; each worktree needs its own because Astro caches inside `node_modules/.astro`), and runs Codex with `.agents/roles/_common.md` + the role prompt + the spec.
3. **Report.** Codex ends with JSON that matches `.agents/schemas/result.schema.json`. The script writes it to `.agents/runs/<id>/result.json` and commits the worktree changes if `status` is `done` or `partial` **and** every changed file is inside Scope. Files outside Scope block the commit (`scope_violations.txt`).
4. **Review.** `swarm.sh claude-review <id>` (cross-vendor, for Codex-written work) and `swarm.sh review <id>` (Codex). Outputs: `.agents/runs/<id>/review-claude.md`, `review-codex.md`. A `VERDICT: BLOCK` or any legal-risk finding becomes a follow-up task spec before merge.
5. **Gate.** `swarm.sh gate <id>` runs `gate.sh` in the worktree.
6. **Integrate.** `swarm.sh integrate <id>...` merges agent branches with `--no-ff` into `integration/<date>` and runs the gate. It refuses `main`.
7. **Deploy.** The owner runs `/deploy integration/<date>`. See `DEPLOYMENT.md` section 5.
8. **Clean.** `swarm.sh clean <id>` or `clean --all` removes worktrees and deletes merged agent branches.

## 3. Roles

| Role | Prompt | Sandbox | Edits | Typical task |
|---|---|---|---|---|
| builder | `.agents/roles/builder.md` | workspace-write | Files in Scope | Feature, page, content, refactor, docs |
| reviewer | `.agents/roles/reviewer.md` | read-only | None | Second opinion on a diff before merge |
| tester | `.agents/roles/tester.md` | workspace-write | `scripts/`, `.github/scripts/` | Add a check; exercise built pages |
| verifier | `.agents/roles/verifier.md` | workspace-write | Content in Scope | Re-check facts in provider and news JSON |
| monitor | `.agents/roles/monitor.md` | workspace-write | None | Live-site health, headers, freshness |
| designer | `.agents/roles/designer.md` | workspace-write | `public/images/` and UI files in Scope | Generated images, visual polish |

All roles get network access in the sandbox (`sandbox_workspace_write.network_access=true`) so they can read sources and run `npm audit`.

## Commands

| Command | Function |
|---|---|
| `swarm.sh new <id> [role]` | Create `.agents/tasks/<id>.md` from the template. |
| `swarm.sh run <id\|file>` | Run one task in its worktree. Blocks until Codex ends. |
| `swarm.sh fanout <id>...` | Run several tasks in parallel, at most `SWARM_MAX_PAR` at a time. Prints status at the end. |
| `swarm.sh review <id> [base]` | Codex code review (`codex exec review --base`) of `agent/<id>`. Output: `review-codex.md`. |
| `swarm.sh claude-review <id> [base]` | Cross-vendor review by Claude Code (`claude -p`, read-only tools). Ends with `VERDICT: MERGE` or `VERDICT: BLOCK`. Output: `review-claude.md`. |
| `swarm.sh gate <id> [--quick]` | Run the merge gate inside the task's worktree. |
| `swarm.sh integrate <id>...` | Merge agent branches into `integration/<date>` and run the gate. |
| `swarm.sh metrics [id...]` | Time, tokens, pages opened, confirmed checks, and citations the worker never opened, per task. Writes `sources.json` in each run dir. |
| `swarm.sh status` | One line per task: role, report status, commits ahead, summary. |
| `swarm.sh clean <id>\|--all` | Remove worktrees; delete agent branches that are merged. |
| `gate.sh [--quick]` | Build, link check, astro check, slug check, npm audit. `--quick` skips the audit. |
| `monitor.sh [url]` | Live status codes, security headers vs `public/_headers`, news freshness. |

## 4. Configuration

| Variable | Default | Meaning |
|---|---|---|
| `SWARM_MAX_PAR` | `5` | Parallel Codex workers. Lower it if memory pressure rises. |
| `SWARM_BASE` | `origin/main` | Start point of new agent branches. |
| `SWARM_TIMEOUT` | `1800` | Seconds before a worker is killed. |
| `SWARM_SKIP_DEPS` | `0` | `1` skips the `depends_on` check. |
| `SWARM_WT_DIR` | `~/.cache/expertnetworks/worktrees` | Worktree location. Outside the repo so `astro check` and Astro do not scan it. |
| `CODEX_MODEL` | `gpt-6.1-sol` | Model for workers. |
| `CODEX_FAST` | `1` | Fast service tier (about 2x speed, more usage). `0` for the default tier. |
| `CODEX_EFFORT` | by role | `model_reasoning_effort`. Default: builder `max`; verifier, designer, reviewer `xhigh`; tester `high`; monitor `medium`. Set it to override. |
| `SWARM_RETRIES` | `1` | Automatic re-runs when a worker ends with no report (crash, timeout). A worker that reports `failed` or `blocked` is not retried. The worktree is reset before a retry. |
| `INTEGRATION_BRANCH` | `integration/<YYYYMMDD>` | Target of `integrate`. |

Run logs are in `.agents/runs/<id>/` (git-ignored): `prompt.md`, `events.jsonl`, `stderr.log`, `result.json`, `changes.txt`, `review.md`.

## 5. Task spec rules

- One observable result per task. If the Goal needs "and", split it.
- Scope lists paths. Disjoint Scopes for tasks that run together. Two tasks that both touch `src/content/compare.json` or `src/lib/compare-v2.ts` must run one after the other (`depends_on`).
- Every acceptance criterion maps to a command or a visible result.
- Content tasks list their sources. The worker reads them in the task.
- Good sizes: one provider refresh, one news batch of up to 5 items, one page, one component.

## 6. Image generation

- Codex has the `image_generation` feature and the global `imagegen` skill. Use the **designer** role.
- Raw images go to `.agents/runs/<id>/images/`. Only the chosen, optimized file goes into `public/images/`.
- No generated provider logos, real people, or trademarks. Alt text for every image.

## 7. Failure handling

| Symptom | Action |
|---|---|
| `result.json` missing or empty | Read `.agents/runs/<id>/stderr.log` and the end of `events.jsonl`. Usually auth, model, or sandbox. |
| `status: blocked` | The Scope was too small or a dependency is missing. Fix the spec, then `run` again; the worktree and branch are reused. |
| `out_of_scope` not empty | Do not merge. Revert the extra files in the worktree or widen the spec on purpose. |
| Gate fails after `integrate` | `git merge --abort` is not possible after the merge commit; `git reset --hard <previous sha>` on the integration branch, then integrate the branches one by one. |
| Worktree locked | `git worktree prune`, then `swarm.sh clean <id>`. |

## 8. Operating surfaces (Mac and phone)

All options below cost nothing beyond the owner's Claude and ChatGPT subscriptions.

| Where the owner is | Orchestrator | Workers | How |
|---|---|---|---|
| At the Mac | Claude (desktop app or Claude Code in `~/Expertnetworks.net`) | `swarm.sh` → local `codex exec` | Default. Full control, worktrees, gate. |
| Phone, Mac awake | Claude app, this chat linked to the Mac (desktop app must be open) | Same local swarm | Claude drives the Mac through the device bridge. |
| Phone, Mac awake | ChatGPT app → Codex (paired to Codex on the Mac by QR) | Local Codex sessions | Approve commands, read diffs, start tasks. |
| Phone, Mac asleep | ChatGPT app → Codex Cloud | Codex Cloud tasks on GitHub | Each task opens a PR. Then `@codex review` or Claude review, then gate in CI. |
| Anywhere, on a PR | — | `@codex review` (Codex GitHub integration) | Free review pass on every PR. Optional: Claude Code Action with `CLAUDE_CODE_OAUTH_TOKEN` (subscription, not API key). |

## 9. Build budget

Cloudflare Pages Free allows 500 builds per month. Every pushed branch triggers a preview build.

- Do not push `agent/*` branches. They stay local; `integrate` combines them.
- Push `integration/*` branches only when a preview URL is needed.
- Codex Cloud PR branches count too: batch small changes into one task.
