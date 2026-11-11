---
id: short-kebab-id            # becomes branch agent/<id> and run dir .agents/runs/<id>
role: builder                 # builder | reviewer | tester | verifier | monitor | designer
depends_on: []                # task ids that must be merged first
---

# Goal
One sentence. The observable result when the task is done.

# Context
What the worker needs to know that is not in AGENTS.md. Link docs; do not copy them.

# Scope
Files and folders the worker may change. Everything else is read-only.
- src/...

# Acceptance criteria
Checkable statements. Each one maps to a command or a visible result.
- [ ] `scripts/agents/gate.sh` passes
- [ ] ...

# Out of scope
What the worker must not do, even if it looks useful.

# Sources (content tasks only)
Public URLs the worker must read. No fact without a source read in this session.
