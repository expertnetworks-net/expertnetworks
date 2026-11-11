#!/usr/bin/env bash
# Codex worker swarm for ExpertNetworks.net. macOS bash 3.2 compatible.
# Docs: docs/AGENT-WORKFLOW.md        Help: scripts/agents/swarm.sh help
set -u

ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$ROOT"
PROD_BRANCH="main"                                              # Cloudflare Pages production branch. See docs/DEPLOYMENT.md
BASE="${SWARM_BASE:-origin/$PROD_BRANCH}"                       # where agent branches start
MAX_PAR="${SWARM_MAX_PAR:-3}"                                   # parallel workers (16 GB MacBook Air: keep <= 3)
TIMEOUT="${SWARM_TIMEOUT:-1800}"                                # seconds per worker
WT_DIR="${SWARM_WT_DIR:-$HOME/.cache/expertnetworks/worktrees}" # outside the repo so astro check ignores it
RUNS="$ROOT/.agents/runs"
SCHEMA="$ROOT/.agents/schemas/result.schema.json"
MODEL_ARGS=""; [ -n "${CODEX_MODEL:-}" ] && MODEL_ARGS="-m $CODEX_MODEL"
RETRIES="${SWARM_RETRIES:-1}"                                   # automatic re-runs when a worker ends with no report
effort_for() {  # CODEX_EFFORT overrides; otherwise spend reasoning where it pays
  [ -n "${CODEX_EFFORT:-}" ] && { echo "$CODEX_EFFORT"; return; }
  case "$1" in monitor) echo low;; verifier|tester|designer) echo medium;; *) echo high;; esac
}

die()  { echo "swarm: $*" >&2; exit 1; }
ts()   { date +%H:%M:%S; }
fm()   { sed -n '/^---$/,/^---$/p' "$1" | sed -n "s/^$2:[[:space:]]*\([^#]*\).*/\1/p" | head -1 | sed 's/[[:space:]]*$//'; }
deps() { fm "$1" depends_on | tr -d '[],' | tr ' ' '\n' | sed '/^$/d'; }
scope(){ sed -n '/^# Scope/,/^# /p' "$1" | sed -n 's/^- \([^ (]*\).*/\1/p'; }   # "- path (note)" -> path
jfield() { node -e 'try{const r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const v=r[process.argv[2]];console.log(Array.isArray(v)?v.join("\n"):(v??""))}catch(e){}' "$1" "$2"; }
with_timeout() { perl -e 'alarm shift; exec @ARGV or die "exec: $!"' "$TIMEOUT" "$@"; }   # macOS has no timeout(1)

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
  if [ ! -d "$wt/node_modules" ]; then
    # Own copy per worktree: Astro caches in node_modules/.astro, so a shared symlink breaks parallel builds.
    # cp -c = APFS clone: instant, no extra disk until files change.
    if cmp -s "$ROOT/package-lock.json" "$wt/package-lock.json" && [ -d "$ROOT/node_modules" ]; then
      rm -f "$wt/node_modules"; cp -cR "$ROOT/node_modules" "$wt/node_modules" 2>/dev/null || cp -R "$ROOT/node_modules" "$wt/node_modules"
    else (cd "$wt" && npm ci --no-audit --no-fund >/dev/null 2>&1) || echo "swarm: npm ci failed in $wt" >&2; fi
  fi
  echo "$wt"
}

check_deps() {  # every depends_on task must be merged into BASE (or the integration branch, if set)
  local tf="$1" target="${INTEGRATION_BRANCH:-$BASE}" d
  for d in $(deps "$tf"); do
    git show-ref -q --verify "refs/heads/agent/$d" || die "$(fm "$tf" id): dependency '$d' has no branch yet; run it first"
    git merge-base --is-ancestor "agent/$d" "$target" 2>/dev/null || die "$(fm "$tf" id): dependency '$d' is not merged into $target (set INTEGRATION_BRANCH or SWARM_BASE)"
  done
}

scope_violations() {  # $1=task file $2=worktree -> changed paths outside Scope
  local tf="$1" wt="$2" f s ok
  (cd "$wt" && git status --porcelain | cut -c4- | sed 's/.* -> //') | while read -r f; do
    [ -z "$f" ] && continue; ok=0
    for s in $(scope "$tf"); do case "$f" in "$s"|"$s"*|"${s%/}"/*) ok=1;; esac; done
    [ $ok -eq 1 ] || echo "$f"
  done
}

cmd_run() {
  local tf; tf="$(task_file "${1:-}")" || exit 1
  local id role; id="$(fm "$tf" id)"; role="$(fm "$tf" role)"
  [ -n "$id" ] && [ "$id" != "short-kebab-id" ] || die "$tf: set id in front matter"
  [ -f ".agents/roles/$role.md" ] || die "$tf: unknown role '$role'"
  [ "${SWARM_SKIP_DEPS:-0}" = 1 ] || check_deps "$tf"
  local wt run; wt="$(prepare_worktree "$id")"; run="$RUNS/$id"; mkdir -p "$run"
  rm -f "$run/result.json" "$run/changes.txt" "$run/scope_violations.txt"   # never report a stale result
  cp "$tf" "$run/task.md"

  local sandbox="workspace-write"; [ "$role" = "reviewer" ] && sandbox="read-only"
  { cat .agents/roles/_common.md; echo; cat ".agents/roles/$role.md"; echo; echo "# Task spec (task_id=$id, role=$role)"; echo; cat "$tf";
    echo; echo "Working directory: $wt (branch agent/$id). Final message: JSON matching the result schema."; } > "$run/prompt.md"

  local effort attempt=0 rc=0; effort="$(effort_for "$role")"
  echo "[$(ts)] start  $id ($role, effort=$effort) -> $wt"
  while :; do
    # shellcheck disable=SC2086
    with_timeout codex exec -C "$wt" -s "$sandbox" $MODEL_ARGS -c model_reasoning_effort="$effort" \
      -c sandbox_workspace_write.network_access=true \
      --output-schema "$SCHEMA" -o "$run/result.json" --json - < "$run/prompt.md" \
      > "$run/events.jsonl" 2> "$run/stderr.log"
    rc=$?
    [ -n "$(jfield "$run/result.json" status)" ] && break          # got a report: never retry on a real answer
    attempt=$((attempt+1)); [ "$attempt" -gt "$RETRIES" ] && break
    echo "[$(ts)] retry  $id (no report, exit=$rc, attempt $attempt/$RETRIES)"; cp "$run/events.jsonl" "$run/events.attempt$attempt.jsonl" 2>/dev/null
    (cd "$wt" && git checkout -q -- . && git clean -qfd -e node_modules)     # a half-finished edit must not leak into the retry
    sleep $((attempt*20))
  done

  local status msg; status="$(jfield "$run/result.json" status)"; msg="$(jfield "$run/result.json" commit_message)"
  (cd "$wt" && git status --porcelain) > "$run/changes.txt"
  scope_violations "$tf" "$wt" > "$run/scope_violations.txt"
  if [ -s "$run/scope_violations.txt" ]; then
    echo "[$(ts)] SCOPE  $id touched files outside Scope - not committed:"; sed 's/^/         /' "$run/scope_violations.txt"
  elif [ -s "$run/changes.txt" ] && [ -n "$msg" ] && { [ "$status" = "done" ] || [ "$status" = "partial" ]; }; then
    (cd "$wt" && git add -A && git commit -q -m "[agent:$id] $msg" -m "role=$role status=$status") \
      && echo "[$(ts)] commit $id: $msg" || echo "[$(ts)] COMMIT FAILED $id (see git output above)"
  fi
  [ $rc -eq 142 ] && echo "[$(ts)] TIMEOUT $id after ${TIMEOUT}s"
  node "$ROOT/scripts/agents/metrics.mjs" "$id" 2>/dev/null | sed -n '2p;/never opened/,$p' | sed "s/^/         /"
  echo "[$(ts)] end    $id status=${status:-none} codex_exit=$rc  report=.agents/runs/$id/result.json"
}

cmd_fanout() {
  [ $# -gt 0 ] || die "usage: fanout <task>..."
  local t
  for t in "$@"; do
    while [ "$(jobs -rp | wc -l | tr -d ' ')" -ge "$MAX_PAR" ]; do sleep 3; done
    ( cmd_run "$t" ) &
    sleep 2   # stagger git worktree operations
  done
  wait; cmd_status
}

cmd_review() {  # Codex review of an agent branch
  local id="${1:-}"; [ -n "$id" ] || die "usage: review <id> [base]"
  local wt="$WT_DIR/$id" base="${2:-$BASE}"; [ -d "$wt" ] || die "no worktree for $id"
  base="$(git rev-parse --verify "$base^{commit}")" || die "bad base"   # pass a SHA: codex may resolve a bare 'main' to a remote ref
  mkdir -p "$RUNS/$id"
  echo "[$(ts)] codex review agent/$id vs $base"
  # shellcheck disable=SC2086
  # codex exec review cannot take a custom prompt together with --base; it reads AGENTS.md itself.
  (cd "$wt" && with_timeout codex exec review --base "$base" $MODEL_ARGS -o "$RUNS/$id/review-codex.md") > "$RUNS/$id/review-codex.log" 2>&1
  cat "$RUNS/$id/review-codex.md" 2>/dev/null || tail -20 "$RUNS/$id/review-codex.log"
}

cmd_claude_review() {  # cross-vendor review: Claude Code (subscription login) reviews a Codex-written branch, read-only
  local id="${1:-}"; [ -n "$id" ] || die "usage: claude-review <id> [base]"
  local wt="$WT_DIR/$id" base="${2:-$BASE}"; [ -d "$wt" ] || die "no worktree for $id"
  command -v claude >/dev/null || die "claude CLI not found"
  mkdir -p "$RUNS/$id"
  echo "[$(ts)] claude review agent/$id vs $base"
  (cd "$wt" && git diff "$base"...HEAD) > "$RUNS/$id/diff.patch"
  cat > "$RUNS/$id/review-claude.prompt" <<PROMPT
You review a diff written by another AI model (Codex). Read AGENTS.md and the task spec at $RUNS/$id/task.md.
The diff is in $RUNS/$id/diff.patch (base: $base). You may read any file in the repository.
Report only real defects: correctness, scope violations, unsourced or legally risky claims, security, missing doc updates.
Most severe first; each with file, line, and a concrete failure. No style nits.
End with exactly one line: VERDICT: MERGE or VERDICT: BLOCK
PROMPT
  # Prompt goes through stdin: --allowedTools is variadic and would swallow a positional prompt.
  # No plan mode: in -p it returns only a plan stub. Read-only comes from the tool allowlist (other tools are denied in -p).
  (cd "$wt" && with_timeout claude -p --add-dir "$RUNS/$id" --allowedTools Read Grep Glob < "$RUNS/$id/review-claude.prompt") \
    > "$RUNS/$id/review-claude.md" 2> "$RUNS/$id/review-claude.log"
  cat "$RUNS/$id/review-claude.md"
}

cmd_gate() { local id="${1:-}"; [ -n "$id" ] || die "usage: gate <id> [--quick]"; (cd "$WT_DIR/$id" && "$ROOT/scripts/agents/gate.sh" "${2:-}"); }

cmd_integrate() {  # merge agent branches into an integration branch, in its own worktree; never main
  local name="${INTEGRATION_BRANCH:-integration/$(date +%Y%m%d)}" wt="$WT_DIR/_integration" id
  [ "$name" != "$PROD_BRANCH" ] || die "refusing to integrate into $PROD_BRANCH"
  if [ ! -d "$wt" ]; then
    if git show-ref -q --verify "refs/heads/$name"; then git worktree add -q "$wt" "$name"
    else git worktree add -q -b "$name" "$wt" "$BASE"; fi || die "integration worktree failed"
  fi
  (cd "$wt" && [ "$(git branch --show-current)" = "$name" ]) || die "$wt is on another branch; run: swarm.sh clean _integration"
  for id in "$@"; do
    (cd "$wt" && git merge -q --no-ff "agent/$id" -m "Merge agent/$id") || die "conflict merging agent/$id in $wt - resolve there, then rerun"
    echo "merged agent/$id -> $name"
  done
  [ -d "$wt/node_modules" ] || cp -cR "$ROOT/node_modules" "$wt/node_modules"
  (cd "$wt" && "$ROOT/scripts/agents/gate.sh")
}

cmd_status() {
  printf '%-24s %-9s %-8s %-6s %-5s %s\n' TASK ROLE STATUS AHEAD SCOPE SUMMARY
  local tf id role st ahead sc sum
  for tf in .agents/tasks/*.md; do
    case "$tf" in */_TEMPLATE.md) continue;; esac
    id="$(fm "$tf" id)"; role="$(fm "$tf" role)"
    st="$(jfield "$RUNS/$id/result.json" status)"; [ -n "$st" ] || st="-"
    ahead="$(git rev-list --count "$BASE..agent/$id" 2>/dev/null || echo -)"
    sc="ok"; [ -s "$RUNS/$id/scope_violations.txt" ] && sc="OUT"
    sum="$(jfield "$RUNS/$id/result.json" summary | head -1 | cut -c1-60)"
    printf '%-24s %-9s %-8s %-6s %-5s %s\n' "$id" "$role" "$st" "$ahead" "$sc" "$sum"
  done
}

cmd_clean() {  # remove worktrees; delete agent branches only if merged
  local id="${1:-}"; [ -n "$id" ] || die "usage: clean <id>|--all"
  local ids="$id" i; [ "$id" = "--all" ] && ids="$(ls "$WT_DIR" 2>/dev/null)"
  for i in $ids; do
    git worktree remove --force "$WT_DIR/$i" 2>/dev/null && echo "removed worktree $i"
    git branch -d "agent/$i" 2>/dev/null && echo "deleted merged branch agent/$i"
  done
  git worktree prune
}

cmd_metrics() { node "$ROOT/scripts/agents/metrics.mjs" "$@"; }

cmd_help() { sed -n '/^## Commands/,/^## /p' docs/AGENT-WORKFLOW.md | sed '$d'; }

case "${1:-help}" in
  new|run|fanout|review|gate|integrate|status|metrics|clean|help) c="$1"; shift; "cmd_$c" "$@";;
  claude-review) shift; cmd_claude_review "$@";;
  *) die "unknown command '$1' (try: help)";;
esac
