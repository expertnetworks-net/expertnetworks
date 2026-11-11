#!/usr/bin/env bash
# Anonymity guard. The project is anonymous (AGENTS.md rule 0).
# 1. Commit identities must use an allowlisted noreply email.
# 2. Optional private denylist (never committed): ~/.config/expertnetworks/private-terms, one term per line.
#    Staged changes and commit messages must not contain any of those terms.
# Usage: identity-check.sh staged | range <rev-range> | config
set -u
ALLOW='(@users\.noreply\.github\.com|^noreply@anthropic\.com|^noreply@github\.com)$'
DENY="${EXPERTNETWORKS_PRIVATE_TERMS:-$HOME/.config/expertnetworks/private-terms}"
fail=0; bad() { echo "identity-check: $*" >&2; fail=1; }

check_email() { echo "$1" | grep -Eq "$ALLOW" || bad "non-anonymous email in $2: $1"; }
check_text() {  # $1=label, stdin=text
  [ -s "$DENY" ] || { cat >/dev/null; return 0; }
  local hits; hits="$(grep -iFf <(grep -v '^[[:space:]]*$' "$DENY") || true)"
  [ -z "$hits" ] || bad "private term found in $1 (terms not printed)"
}

case "${1:-staged}" in
  config)
    check_email "$(git config user.email)" "git config user.email" ;;
  staged)
    check_email "$(git config user.email)" "git config user.email"
    git diff --cached -U0 | grep '^+' | check_text "staged changes" ;;
  range)
    r="${2:?usage: identity-check.sh range <rev-range>}"
    git log --format='%ae%n%ce' "$r" | sort -u | while read -r e; do [ -n "$e" ] && { echo "$e" | grep -Eq "$ALLOW" || echo "$e"; }; done > /tmp/en-idbad.$$
    [ -s /tmp/en-idbad.$$ ] && bad "commits in $r use non-anonymous emails ($(wc -l < /tmp/en-idbad.$$ | tr -d ' ') distinct)"; rm -f /tmp/en-idbad.$$
    git log --format='%B' "$r" | check_text "commit messages in $r" ;;
esac
exit $fail
