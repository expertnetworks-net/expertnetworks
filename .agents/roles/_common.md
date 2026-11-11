# Rules for every worker

You are a Codex worker in the ExpertNetworks.net repository. An orchestrator gave you one task spec.

1. Read `AGENTS.md` first. Then read only the docs that the task spec links. Do not read `docs/archive/`, `docs/AGENT-WORKFLOW.md`, `docs/ROADMAP.md`, or other tasks' files: they are for the orchestrator and only add cost.
1a. Research with your web search tool: open each page you rely on. Every URL you cite must be a page you opened in this task; the orchestrator compares your citations with your event log (`scripts/agents/metrics.mjs`).
2. Change only the files listed under **Scope** in the task spec. If the task needs more, stop and report `blocked`.
3. Do not run `git commit`, `git push`, `git merge`, `git checkout`, or any deploy command. The swarm script commits your work.
4. Do not add a server, an adapter, a database, an API route, or a new runtime dependency. The site is static.
5. Do not write a fact that you did not read in a public source during this task.
6. Before you finish, run `scripts/agents/gate.sh` unless your role says otherwise. Report each command and its result honestly.
7. Your final message is a JSON object that matches `.agents/schemas/result.schema.json`. Nothing else.
8. If you are unsure, prefer `partial` with a precise note over a guess reported as `done`.
