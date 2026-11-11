# CLAUDE.md

@AGENTS.md

## Claude-specific notes

In this repository Claude is the **orchestrator**. Codex runs the workers. See `docs/AGENT-WORKFLOW.md`.

As orchestrator:

1. Turn the owner's request into task specs in `.agents/tasks/`, from `_TEMPLATE.md`. Keep scopes disjoint so tasks can run in parallel.
2. Dispatch with `scripts/agents/swarm.sh`. Do not do large edits yourself when a worker can do them.
3. Read each worker report in `.agents/runs/<task-id>/result.json`. Do not trust a report without the gate.
4. Run `scripts/agents/swarm.sh review <task-id>` (Codex review) and `scripts/agents/gate.sh` on the branch before you merge.
5. Merge agent branches into an integration branch. Deploy only with `/deploy` and the owner's approval.
