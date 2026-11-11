#!/usr/bin/env node
// Per-task metrics and evidence ledger, built from Codex JSONL events. No network, no dependencies.
// Usage: node scripts/agents/metrics.mjs [task-id ...] [--json]
//   Writes .agents/runs/<id>/sources.json (every URL the worker opened or searched) and prints a table.
//   "unopened" = URLs the worker cites (report notes + lines it added) that it never opened: possible fabricated verification.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = execSync('git rev-parse --show-toplevel').toString().trim();
const runs = path.join(root, '.agents/runs');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const ids = args.filter(a => !a.startsWith('--'));
const wtDir = process.env.SWARM_WT_DIR || path.join(process.env.HOME, '.cache/expertnetworks/worktrees');

const norm = u => { try { const x = new URL(u.replace(/[.,;)\]]+$/, '')); return (x.host.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '')).toLowerCase(); } catch { return null; } };
const urlsIn = s => (s.match(/https?:\/\/[^\s"'<>\\)\]]+/g) || []);
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

function analyze(id) {
  const dir = path.join(runs, id);
  const evFile = path.join(dir, 'events.jsonl');
  if (!fs.existsSync(evFile)) return null;
  const ev = fs.readFileSync(evFile, 'utf8').split('\n').map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const m = { id, input: 0, cached: 0, output: 0, reasoning: 0, commands: 0, searches: 0, opened: [], searched: [], snippets: [] };
  for (const e of ev) {
    if (e.type === 'turn.completed' && e.usage) { m.input += e.usage.input_tokens || 0; m.cached += e.usage.cached_input_tokens || 0; m.output += e.usage.output_tokens || 0; m.reasoning += e.usage.reasoning_output_tokens || 0; }
    if (e.type !== 'item.completed' || !e.item) continue;
    const it = e.item;
    if (it.type === 'command_execution') { m.commands++; if (/\b(curl|wget|urlopen|requests\.|fetch\()/.test(it.command || '')) urlsIn(it.command).forEach(u => m.opened.push(u)); }
    if (it.type === 'web_search') {
      const a = it.action || {};
      if (a.url) m.opened.push(a.url);
      if (a.type === 'search') { m.searches++; (a.queries || [it.query]).filter(Boolean).forEach(q => m.searched.push(q)); }
      // Results with a "view" ref were opened (also in batches, action "other"); "search" refs are snippets only.
      for (const r of it.results || []) { if (!r.url) continue; (/view/.test(r.ref_id || '') ? m.opened : m.snippets).push(r.url); }
    }
  }
  const st = fs.statSync(evFile);
  m.seconds = Math.round((st.mtimeMs - st.birthtimeMs) / 1000);
  m.uncached = m.input - m.cached;
  const res = readJson(path.join(dir, 'result.json'));
  m.status = res?.status || 'none'; m.role = res?.role || '';
  m.checks = res?.checks?.length || 0; m.confirmed = res?.checks?.filter(c => c.passed).length || 0;
  // Evidence check: cited URLs vs opened URLs.
  let cited = [];
  if (res) cited = cited.concat(urlsIn(JSON.stringify(res.checks || [])));
  try {
    const wt = path.join(wtDir, id);
    const base = execSync('git merge-base HEAD origin/main', { cwd: wt, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const diff = execSync(`git diff ${base} -- .`, { cwd: wt, maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    cited = cited.concat(urlsIn(diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).join('\n')));
  } catch { /* worktree gone: report notes only */ }
  const openedSet = new Set(m.opened.map(norm).filter(Boolean));
  const citedSet = [...new Set(cited.map(norm).filter(Boolean))];
  m.cited = citedSet.length;
  const snipSet = new Set(m.snippets.map(norm).filter(Boolean));
  const missing = citedSet.filter(u => !openedSet.has(u));
  m.snippetOnlyList = missing.filter(u => snipSet.has(u));       // seen as a search snippet, page not opened: weak evidence
  m.unopenedList = missing.filter(u => !snipSet.has(u));          // never seen at all: possible fabricated verification
  m.snippetOnly = m.snippetOnlyList.length;
  m.unopened = m.unopenedList.length;
  m.pages = openedSet.size;
  fs.writeFileSync(path.join(dir, 'sources.json'), JSON.stringify({ task: id, generated: new Date().toISOString(), opened: [...new Set(m.opened)], search_queries: m.searched, cited_snippet_only: m.snippetOnlyList, cited_not_seen: m.unopenedList }, null, 2));
  return m;
}

const list = (ids.length ? ids : fs.readdirSync(runs)).map(analyze).filter(Boolean);
if (asJson) { console.log(JSON.stringify(list, null, 2)); process.exit(0); }
const k = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n);
const row = (...c) => console.log(c.map((x, i) => String(x).padEnd([24, 8, 5, 9, 6, 6, 5, 10, 6, 8, 6][i] || 8)).join(' '));
row('TASK', 'STATUS', 'SEC', 'UNCACHED', 'OUT', 'PAGES', 'CMDS', 'CONFIRMED', 'CITED', 'SNIPPET', 'UNSEEN');
for (const m of list) row(m.id, m.status, m.seconds, k(m.uncached), k(m.output), m.pages, m.commands, `${m.confirmed}/${m.checks}`, m.cited, m.snippetOnly, m.unopened);
const bad = list.filter(m => m.unopened > 0);
if (bad.length) { console.log('\nCited but never seen in the event log (check before merge):'); for (const m of bad) m.unopenedList.slice(0, 6).forEach(u => console.log(`  ${m.id}: ${u}`)); }
