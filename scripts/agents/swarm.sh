#!/usr/bin/env bash
# Codex worker swarm for ExpertNetworks.net. macOS bash 3.2 compatible.
# Docs: docs/AGENT-WORKFLOW.md        Help: scripts/agents/swarm.sh help
set -u

ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$ROOT"
PROD_BRANCH="main"                                          # Cloudflare Pages production branch. See docs/DEPLOYMENT.md
BASE="${SWARM_BASE:-origin/$PROD_BRANCH}"                   # where agent branches start
MAX_PAR="${SWARM_MAX_PAR:-3}"                               # parallel workers (16 GB MacBook Air: keep <= 3)
WT_DIR="${SWARM_WT_DIR:-$HOME/.cache/expertnetworks/worktrees}"   # outside the repo so astro check ignores it
RUNS="$ROOT/.agents/runs"
SCHEMA="$ROOT/.agents/schemas/result.schema.json"
MODEL_ARGS=""; [ -n "${CODEX_MODEL:-}" ] && MODEL_ARGS="-m $CODEX_MODEL"
EFFORT_ARGS=""; [ -n "${CODEX_EFFORT:-}" ] && EFFORT_ARGS="-c model_reasoning_effort=\"$CODEX_EFFORT\""

die() { echo "swarm: $*" >&2; exit 1; }
fm() { sed -n '/^---$/,/^---$/p' "$1" | sed -n "s/^$2:[[:space:]]*\([^#[:space:]]*\).*/\1/p" | head -1; }  # front-matter field
jfield() { node -e 'const r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const v=r[process.argv[2]];console.log(Array.isArray(v)?v.join("\n"):(v??""))' "$1" "$2" 2>/dev/null; }

task_file() { [ -f "$1" ] && { echo "$1"; return; }; [ -f ".agents/tasks/$1.md" ] && { echo ".agents/tasks/$1.md"; return; }; die "no task spec: $1"; }

cmd_new() {
  local id="${1:-}" role="${2:-builder}"; [ -n "$id" ] || die "usage: new <id> [role]"
  local f=".agents/tasks/$id.md"; [ -e "$f" ] && die "$f exists"
  sed -e "s/^id: short-kebab-id /id: $id /" -e "s/^role: builder /role: $role /" .agents/tasks/_TEMPLATE.md > "$f"
  echo "$f"
}

prepare_worktree() {  # $1=id -> prints worktree path
  local id="$1" wt="$WT_DIR/$1" br="agent/$1"
  mkdir -p "$WT_DIR"
  if [ ! -d "$wt" ]; then
    git fetch -q origin "$PROD_BRANCH" 2>/dev/null || true
    if git show-ref -q --verify "refs/heads/$br"; then git worktree add -q "$wt" "$br" >&2
    else git worktree add -q -b "$br" "$wt" "$BASE" >&2; fi || die "worktree failed for $id"
  fi
  if [ ! -e "$wt/node_modules" ]; then
    if cmp -s "$ROOT/package-lock.json" "$wt/package-lock.json" && [ -d "$ROOT/node_modules" ]; then ln -s "$ROOT/node_modules" "$wt/node_modules"
    else (cd "$wt" && npm ci --no-audit --no-fund >/dev/null 2>&1) || echo "swarm: npm ci failed in $wt" >&2; fi
  fi
  echo "$wt"
}

cmd_run() {
  local tf; tf="$(task_file "${1:-}")" || exit 1
  local id role; id="$(fm "$tf" id)"; role="$(fm "$tf" role)"
  [ -n "$id" ] && [ "$id" != "short-kebab-id" ] || die "$tf: set id in front matter"
  [ -f ".agents/roles/$role.md" ] || die "$tf: unknown role '$role'"
  local wt run; wt="$(prepare_worktree "$id")"; run="$RUNS/$id"; mkdir -p "$run"
  cp "$tf" "$run/task.md"

  local sandbox="workspace-write"; [ "$role" = "reviewer" ] && sandbox="read-only"
  { cat .agents/roles/_common.md; echo; cat ".agents/roles/$role.md"; echo; echo "# Task spec (task_id=$id, role=$role)"; echo; cat "$tf";
    echo; echo "Working directory: $wt (branch agent/$id). Final message: JSON matching the result schema."; } > "$run/prompt.md"

  echo "[$(date +%H:%M:%S)] start  $id ($role) -> $wt"
  # shellcheck disable=SC2086
  codex exec -C "$wt" -s "$sandbox" $MODEL_ARGS $EFFORT_ARGS \
    -c sandbox_workspace_write.network_access=true \
    --output-schema "$SCHEMA" -o "$run/result.json" --json - < "$run/prompt.md" \
    > "$run/events.jsonl" 2> "$run/stderr.log"
  local rc=$?

  local status msg; status="$(jfield "$run/result.json" status)"; msg="$(jfield "$run/result.json" commit_message)"
  (cd "$wt" && git status --porcelain) > "$run/changes.txt"
  if [ -s "$run/changes.txt" ] && [ -n "$msg" ] && { [ "$status" = "done" ] || [ "$status" = "partial" ]; }; then
    (cd "$wt" && git add -A -- . ':!node_modules' && git commit -q -m "[agent:$id] $msg" -m "role=$role status=$status" ) \
      && echo "[$(date +%H:%M:%S)] commit $id: $msg"
  fi
  echo "[$(date +%H:%M:%S)] end    $id status=${status:-none} codex_exit=$rc  report=.agents/runs/$id/result.json"
}

cmd_fanout() {
  [ $# -gt 0 ] || die "usage: fanout <task>..."
  for t in "$@"; do
    while [ "$(jobs -rp | wc -l | tr -d ' ')" -ge "$MAX_PAR" ]; do sleep 3; done
    cmd_run "$t" &
    sleep 2   # stagger git worktree operations
  done
  wait; cmd_status
}

cmd_review() {
  local id="${1:-}"; [ -n "$id" ] || die "usage: review <id> [base]"
  local wt="$WT_DIR/$id" base="${2:-$BASE}"; [ -d "$wt" ] || die "no worktree for $id"
  mkdir -p "$RUNS/$id"
  echo "[$(date +%H:%M:%S)] codex review agent/$id vs $base"
  # shellcheck disable=SC2086
  (cd "$wt" && codex exec review --base "$base" $MODEL_ARGS -o "$RUNS/$id/review.md" \
    "Review against AGENTS.md rules and the task spec in .agents/runs/$id/task.md. Report only real defects." ) > "$RUNS/$id/review.log" 2>&1
  cat "$RUNS/$id/review.md" 2>/dev/null || tail -20 "$RUNS/$id/review.log"
}

cmd_gate() { local id="${1:-}"; [ -n "$id" ] || die "usage: gate <id>"; (cd "$WT_DIR/$id" && "$ROOT/scripts/agents/gate.sh" "${2:-}"); }

cmd_integrate() {  # merge agent branches into an integration branch; never the production branch
  local name="${INTEGRATION_BRANCH:-integration/$(date +%Y%m%d)}"
  [ "$name" != "$PROD_BRANCH" ] || die "refusing to integrate into the production branch"
  [ -z "$(git status --porcelain --untracked-files=no)" ] || die "main checkout has uncommitted changes"
  if git show-ref -q --verify "refs/heads/$name"; then git checkout -q "$name"; else git checkout -q -b "$name" "$BASE"; fi
  for id in "$@"; do
    git merge -q --no-ff "agent/$id" -m "Merge agent/$id" || die "conflict merging agent/$id - resolve, then rerun"
    echo "merged agent/$id"
  done
  scripts/agents/gate.sh
}

cmd_status() {
  printf '%-28s %-9s %-8s %-6s %s\n' TASK ROLE STATUS AHEAD SUMMARY
  for tf in .agents/tasks/*.md; do
    case "$tf" in */_TEMPLATE.md) continue;; esac
    local id role st ahead sum; id="$(fm "$tf" id)"; role="$(fm "$tf" role)"
    st="$(jfield "$RUNS/$id/result.json" status)"; [ -n "$st" ] || st="-"
    ahead="$(git rev-list --count "$BASE..agent/$id" 2>/dev/null || echo -)"
    sum="$(jfield "$RUNS/$id/result.json" summary | head -1 | cut -c1-60)"
    printf '%-28s %-9s %-8s %-6s %s\n' "$id" "$role" "$st" "$ahead" "$sum"
  done
}

cmd_clean() {  # remove worktrees (and branches already merged into BASE or the integration branch)
  local id="${1:-}"; [ -n "$id" ] || die "usage: clean <id>|--all"
  local ids="$id"; [ "$id" = "--all" ] && ids="$(ls "$WT_DIR" 2>/dev/null)"
  for i in $ids; do
    git worktree remove --force "$WT_DIR/$i" 2>/dev/null && echo "removed worktree $i"
    git branch -d "agent/$i" 2>/dev/null && echo "deleted merged branch agent/$i"
  done
  git worktree prune
}

cmd_help() { sed -n '/^## Commands/,/^## /p' docs/AGENT-WORKFLOW.md | sed '$d'; }

case "${1:-help}" in
  new|run|fanout|review|gate|integrate|status|clean|help) c="$1"; shift; "cmd_$c" "$@";;
  *) die "unknown command '$1' (try: help)";;
esac
