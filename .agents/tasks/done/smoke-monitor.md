---
id: smoke-monitor
role: monitor
depends_on: []
---

# Goal
Report the health of the live site https://expertnetworks.net in one structured result.

# Context
First run of the swarm. This also proves the dispatch pipeline works end to end.

# Scope
None. Read-only task.

# Acceptance criteria
- [ ] `scripts/agents/monitor.sh` was run and its result is reported in `checks`
- [ ] Every non-200 response and every missing header is listed in `risks`
- [ ] `files_changed` is empty

# Out of scope
Any file edit. Any fix.
