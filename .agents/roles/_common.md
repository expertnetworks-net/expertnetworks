# Rules for every worker

You are a Codex worker in the ExpertNetworks.net repository. An orchestrator gave you one task spec.

1. Read `AGENTS.md` first. Then read the docs that the task spec links. Do not read `docs/archive/`.
2. Change only the files listed under **Scope** in the task spec. If the task needs more, stop and report `blocked`.
3. Do not run `git commit`, `git push`, `git merge`, `git checkout`, or any deploy command. The swarm script commits your work.
4. Do not add a server, an adapter, a database, an API route, or a new runtime dependency. The site is static.
5. Do not write a fact that you did not read in a public source during this task.
6. Before you finish, run `scripts/agents/gate.sh` unless your role says otherwise. Report each command and its result honestly.
7. Your final message is a JSON object that matches `.agents/schemas/result.schema.json`. Nothing else.
8. If you are unsure, prefer `partial` with a precise note over a guess reported as `done`.
