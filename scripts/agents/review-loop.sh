#!/usr/bin/env bash
# Review -> fix -> re-review for a set of tasks, bounded parallelism. See docs/ORCHESTRATION-PLAYBOOK.md.
# Usage: scripts/agents/review-loop.sh [--skip-first-review] <task-id>...
set -u
cd "$(git rev-parse --show-toplevel)"
PAR="${SWARM_MAX_PAR:-3}"; skip=0; [ "${1:-}" = "--skip-first-review" ] && { skip=1; shift; }
[ $# -gt 0 ] || { echo "usage: review-loop.sh [--skip-first-review] <task-id>..." >&2; exit 1; }
stage() { local c="$1" id; shift; for id in "$@"; do while [ "$(jobs -rp | wc -l | tr -d ' ')" -ge "$PAR" ]; do sleep 3; done; scripts/agents/swarm.sh "$c" "$id" > ".agents/runs/$id/loop-$c.log" 2>&1 & sleep 2; done; wait; }
[ $skip -eq 1 ] || { echo "== review"; stage claude-review "$@"; }
echo "== fix";       stage fix "$@"
echo "== re-review"; stage claude-review "$@"
echo "== verdicts"
for id in "$@"; do printf '%-28s %s\n' "$id" "$(grep '^VERDICT' ".agents/runs/$id/review-claude.md" | tail -1)"; done
scripts/agents/swarm.sh metrics "$@"
