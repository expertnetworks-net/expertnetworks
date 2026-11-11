#!/usr/bin/env bash
# Merge gate: every check an agent branch must pass. Usage: scripts/agents/gate.sh [--quick]
#   --quick  skip npm audit (offline / sandbox without network)
set -u
cd "$(git rev-parse --show-toplevel)"
[ -d node_modules ] || npm ci --no-audit --no-fund || exit 1

fail=0
step() {
  local name="$1"; shift
  printf '\n== %s\n' "$name"
  if "$@"; then echo "PASS  $name"; else echo "FAIL  $name"; fail=1; fi
}
step "build + links + astro check" npm run verify --silent
step "slug check" node .github/scripts/check-slugs.mjs
step "anonymity (identity + private terms)" scripts/agents/identity-check.sh range "$(git merge-base HEAD origin/main 2>/dev/null || echo HEAD~1)..HEAD"
[ "${1:-}" = "--quick" ] || step "npm audit (high)" npm audit --audit-level=high

printf '\n== GATE %s\n' "$([ $fail -eq 0 ] && echo PASSED || echo FAILED)"
exit $fail
