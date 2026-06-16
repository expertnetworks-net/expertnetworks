# Production Audit & Health Check — expertnetworks.net

Last run: 2026-06-16 · Branch: `claude/fix-compare-networks-4VuOG`

This is a static Astro site (`output: 'static'`) deployed on Cloudflare Pages.
There is no server, API, or runtime backend. That fact drives the entire
security assessment below.

---

## 1. Health Check — Status: PASS

| Check | Command | Result |
|---|---|---|
| Production build | `npm run build` | ✅ 58 pages built |
| Internal links | `npm run verify:links` | ✅ 0 broken across 8,923 refs / 58 files |
| Type / template check | `npm run check` | ✅ 0 errors, 0 warnings, 0 hints |
| Full gate | `npm run verify` | ✅ Pass end-to-end |
| Live site | `curl -I https://expertnetworks.net` | ✅ HTTP/200 via Cloudflare, HTTP/3 |

### Content integrity (not covered by the build — verified separately)
- 33 network files: no duplicate slugs, filename === slug everywhere.
- 57 news files: all `relatedNetworks` resolve to real provider slugs.
- `compare.json` presets, buyer pathways, and roster: all slug refs valid.
- News dates: none invalid, none future-dated past 2026-06-16.
- Required directory fields (`categoryBadge`, `lastUpdated`, `website`): complete on all 33.

---

## 2. Fixes Applied This Pass

1. **Security headers (`public/_headers`)** — the live site previously served no
   CSP, HSTS, X-Frame-Options, or Permissions-Policy. Added all of them plus
   `Cross-Origin-Opener-Policy` and `upgrade-insecure-requests`.
2. **Asset caching (`public/_headers`)** — `/_astro/*` fingerprinted bundles now
   carry `max-age=31536000, immutable`; images/icons get 30-day caching.
3. **Code hygiene** — removed dead `forceUnlockScroll()` (Header.astro) and unused
   `backLink` destructuring (VsComparison.astro); marked JSON data `<script>`
   blocks `is:inline`. `astro check` went from 4 hints to fully clean.
4. **Dependency patches** — `npm audit fix` resolved 8 vulnerabilities with no
   breaking changes (17 → 9).

### CSP rationale
`script-src`/`style-src` include `'unsafe-inline'` because Astro inlines small
page scripts and JSON data blocks, Tailwind injects styles, and a few elements
use inline `style` attributes. With no server and no user input, the injection
surface is minimal; the policy locks down `object-src`, `frame-ancestors`,
`base-uri`, and `form-action`, and pins fonts to Google's domains.

---

## 3. Remaining Vulnerabilities — Assessed, Not Exploitable in Production

`npm audit` reports 9 remaining advisories. Every one is build-time or editor
tooling. None ships in the static output or executes for a live visitor.

| Advisory chain | Where it lives | Production exposure |
|---|---|---|
| `astro` define:vars XSS | Build-time render | **None in practice** — used only on maintainer-authored network JSON (slug/name/logo), never user input. Exploit needs `</script>` injected into the repo's own content. |
| `astro` allowlist bypass / server-island replay | SSR/middleware features | **N/A** — pure static, no SSR, middleware, or server islands. |
| `esbuild` (RCE via registry, dev-server file read) | Build/dev server | **None** — not in static output; dev-server issue needs Windows + `astro dev`. |
| `vite` | Depends on esbuild | **None** — build tooling only. |
| `yaml` / `yaml-language-server` / `volar-service-yaml` | `@astrojs/check` editor LSP | **None** — runs only in editor/CI type-checking, never at build or runtime. |
| `@astrojs/tailwind` / `@astrojs/check` | Flagged via transitive deps above | **None** — dev tooling. |

**Why these are not force-fixed:** `npm audit fix --force` upgrades to Astro 6,
but `@astrojs/tailwind@6` peer-caps at Astro 5 — the Tailwind integration is
deprecated in the Astro 6 line. So the "fix" silently downgrades the Tailwind
integration to v2.1.3 and **breaks the build** (`Cannot read properties of
undefined (reading 'postcss')`). A real Astro 6 move is a Tailwind-stack
migration, not a version bump.

---

## 4. Recommended Next Steps (separate, tested workstream)

Priority order — none are blockers for the current production site:

1. **Astro 6 + Tailwind migration** — do on a dedicated branch. Replace the
   deprecated `@astrojs/tailwind` integration with the supported Tailwind+Vite
   setup, run full `npm run verify`, and manually exercise `/compare`,
   `/networks`, and `/news` (the most stateful pages). This clears the entire
   remaining advisory set.
2. **Verify headers post-deploy** — after the next Cloudflare Pages build,
   confirm CSP/HSTS appear via `curl -I` and that no inline script is blocked.
   Watch the browser console on `/compare` for CSP violations.
3. **HSTS preload** — once headers are confirmed stable in production, submit the
   domain to hstspreload.org.
4. **Cloudflare production branch** — CLAUDE.md notes the production branch is
   `claude/expert-network-sources-6oGs1`; confirm before assuming a push updates
   the live site.

---

## 5. Reproduce This Audit

```bash
npm install
npm run verify          # build + link check + type check
npm audit               # dependency advisories
curl -sI https://expertnetworks.net/   # live headers
```
