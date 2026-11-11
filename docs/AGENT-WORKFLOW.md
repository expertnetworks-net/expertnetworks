# Agent workflow

This file owns: the multi-agent model, worker roles, the task spec format, worktrees, the swarm scripts, merge gates, and image generation.
Rules that bind every agent are in `AGENTS.md`. Deploy rules are in `DEPLOYMENT.md`.

## 1. Model

| Layer | Who | Does | Does not |
|---|---|---|---|
| Owner | Daniel | Sets goals. Approves each deploy. | — |
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
2. **Run.** `swarm.sh run <id>` creates worktree `$SWARM_WT_DIR/<id>` on branch `agent/<id>` from the production branch, links `node_modules`, and runs Codex with `.agents/roles/_common.md` + the role prompt + the spec.
3. **Report.** Codex ends with JSON that matches `.agents/schemas/result.schema.json`. The script writes it to `.agents/runs/<id>/result.json` and commits the worktree changes if `status` is `done` or `partial`.
4. **Review.** `swarm.sh review <id>` runs `codex exec review --base <production branch>` in the worktree. Output: `.agents/runs/<id>/review.md`.
5. **Gate.** `swarm.sh gate <id>` runs `gate.sh` in the worktree.
6. **Integrate.** `swarm.sh integrate <id>...` merges agent branches with `--no-ff` into `integration/<date>` and runs the gate. It refuses the production branch.
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
| `swarm.sh review <id> [base]` | Codex code review of `agent/<id>` against the production branch. |
| `swarm.sh gate <id> [--quick]` | Run the merge gate inside the task's worktree. |
| `swarm.sh integrate <id>...` | Merge agent branches into `integration/<date>` and run the gate. |
| `swarm.sh status` | One line per task: role, report status, commits ahead, summary. |
| `swarm.sh clean <id>\|--all` | Remove worktrees; delete agent branches that are merged. |
| `gate.sh [--quick]` | Build, link check, astro check, slug check, npm audit. `--quick` skips the audit. |
| `monitor.sh [url]` | Live status codes, security headers vs `public/_headers`, news freshness. |

## 5. Configuration

| Variable | Default | Meaning |
|---|---|---|
| `SWARM_MAX_PAR` | `3` | Parallel Codex workers. 3 is the safe limit on the 16 GB MacBook Air. |
| `SWARM_BASE` | `origin/<production branch>` | Start point of new agent branches. |
| `SWARM_WT_DIR` | `~/.cache/expertnetworks/worktrees` | Worktree location. Outside the repo so `astro check` and Astro do not scan it. |
| `CODEX_MODEL` | Codex default (`~/.codex/config.toml`) | Model for workers. |
| `CODEX_EFFORT` | Codex default | `model_reasoning_effort` for workers. Use `low` for monitor, `high` for builder and reviewer. |
| `INTEGRATION_BRANCH` | `integration/<YYYYMMDD>` | Target of `integrate`. |

Run logs are in `.agents/runs/<id>/` (git-ignored): `prompt.md`, `events.jsonl`, `stderr.log`, `result.json`, `changes.txt`, `review.md`.

## 6. Task spec rules

- One observable result per task. If the Goal needs "and", split it.
- Scope lists paths. Disjoint Scopes for tasks that run together. Two tasks that both touch `src/content/compare.json` or `src/lib/compare-v2.ts` must run one after the other (`depends_on`).
- Every acceptance criterion maps to a command or a visible result.
- Content tasks list their sources. The worker reads them in the task.
- Good sizes: one provider refresh, one news batch of up to 5 items, one page, one component.

## 7. Image generation

- Codex has the `image_generation` feature and the global `imagegen` skill. Use the **designer** role.
- Raw images go to `.agents/runs/<id>/images/`. Only the chosen, optimized file goes into `public/images/`.
- No generated provider logos, real people, or trademarks. Alt text for every image.

## 8. Failure handling

| Symptom | Action |
|---|---|
| `result.json` missing or empty | Read `.agents/runs/<id>/stderr.log` and the end of `events.jsonl`. Usually auth, model, or sandbox. |
| `status: blocked` | The Scope was too small or a dependency is missing. Fix the spec, then `run` again; the worktree and branch are reused. |
| `out_of_scope` not empty | Do not merge. Revert the extra files in the worktree or widen the spec on purpose. |
| Gate fails after `integrate` | `git merge --abort` is not possible after the merge commit; `git reset --hard <previous sha>` on the integration branch, then integrate the branches one by one. |
| Worktree locked | `git worktree prune`, then `swarm.sh clean <id>`. |
