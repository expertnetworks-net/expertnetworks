# .agents

Working files for the agent swarm. How to use them: `docs/AGENT-WORKFLOW.md`. Techniques: `docs/ORCHESTRATION-PLAYBOOK.md`.

| Path | Content | In git |
|---|---|---|
| `roles/` | Role prompts. `_common.md` is prepended to every worker. | Yes |
| `tasks/` | Open task specs. `_TEMPLATE.md` is the format. | Yes |
| `tasks/done/` | Specs of merged tasks, kept as examples and history. | Yes |
| `schemas/` | JSON Schema of the worker report. | Yes |
| `skills/` | Link to `.claude/skills/` so Codex sees the same skills. | Yes |
| `runs/<id>/` | Per-run prompt, event log, report, reviews, `sources.json`. | No (local) |
