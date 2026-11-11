#!/usr/bin/env bash
# Live-site health check for https://expertnetworks.net. Read-only. Usage: scripts/agents/monitor.sh [base-url]
set -u
BASE="${1:-https://expertnetworks.net}"
cd "$(git rev-parse --show-toplevel)"
problems=0
note() { echo "PROBLEM  $*"; problems=$((problems+1)); }

echo "== Status codes ($BASE)"
for path in / /compare/ /news/ /networks/ /networks/glg/ /networks/alphasights/ /sources/ /llms.txt /robots.txt /sitemap-index.xml /.well-known/security.txt; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 20 "$BASE$path")
  printf '%s  %s\n' "$code" "$path"
  [ "$code" = "200" ] || note "$path returned $code"
done

echo; echo "== Security headers (expected from public/_headers, block /*)"
live=$(curl -sI -L --max-time 20 "$BASE/" | tr -d '\r' | tr 'A-Z' 'a-z')
awk '/^\/\*$/{f=1;next} /^[^ \t]/{f=0} f && /:/{sub(/^[ \t]+/,""); split($0,a,":"); print a[1]}' public/_headers | sort -u |
while read -r h; do
  [ -z "$h" ] && continue
  lh=$(echo "$h" | tr 'A-Z' 'a-z')
  if echo "$live" | grep -q "^$lh:"; then echo "ok       $h"; else echo "MISSING  $h"; fi
done | tee /tmp/en-monitor-headers.txt
grep -q '^MISSING' /tmp/en-monitor-headers.txt && note "live response lacks headers from public/_headers"

echo; echo "== Content freshness"
newest=$(grep -ho '"date": *"[0-9-]*"' src/content/news/*.json 2>/dev/null | grep -o '[0-9-]\{10\}' | sort | tail -1)
echo "newest news item in repo: ${newest:-unknown}"
if [ -n "$newest" ]; then
  age=$(( ( $(date +%s) - $(date -j -f %Y-%m-%d "$newest" +%s 2>/dev/null || date -d "$newest" +%s) ) / 86400 ))
  echo "age: $age days"; [ "$age" -le 45 ] || note "newest news item is $age days old"
fi

echo; echo "== MONITOR: $problems problem(s)"
[ $problems -eq 0 ]
