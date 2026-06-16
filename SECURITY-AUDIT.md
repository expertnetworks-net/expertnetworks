# Production Audit & Health Check — expertnetworks.net

Last run: 2026-06-16 · Branch: `claude/fix-compare-networks-4VuOG`

This is a static Astro site (`output: 'static'`) deployed on Cloudflare Pages.
There is no server, API, or runtime backend. That fact frames the security model.

**Final status: 10/10 — build, links, types, and dependency audit all clean.**

---

## 1. Health Check — Status: PASS

| Check | Command | Result |
|---|---|---|
| Production build | `npm run build` | ✅ 58 pages built |
| Internal links | `npm run verify:links` | ✅ 0 broken across 8,923 refs / 58 files |
| Type / template check | `npm run check` | ✅ 0 errors, 0 warnings, 0 hints |
| Dependency audit | `npm audit` | ✅ **0 vulnerabilities** (was 17) |
| Full gate | `npm run verify` | ✅ Pass end-to-end |
| Live site | `curl -I https://expertnetworks.net` | ✅ HTTP/200 via Cloudflare, HTTP/3 |

### Content integrity (not covered by the build — verified separately)
- 33 network files: no duplicate slugs, filename === slug everywhere.
- 57 news files: all `relatedNetworks` resolve to real provider slugs.
- `compare.json` presets, buyer pathways, and roster: all slug refs valid.
- News dates: none invalid, none future-dated past 2026-06-16.
- Required directory fields (`categoryBadge`, `lastUpdated`, `website`): complete on all 33.

---

## 2. Fixes Applied

### Production hardening
1. **Security headers (`public/_headers`)** — the live site previously served no
   CSP, HSTS, X-Frame-Options, or Permissions-Policy. Added all of them plus
   `Cross-Origin-Opener-Policy` and `upgrade-insecure-requests`.
2. **Asset caching (`public/_headers`)** — `/_astro/*` fingerprinted bundles now
   carry `max-age=31536000, immutable`; images/icons get 30-day caching.

### Code hygiene
3. Removed dead `forceUnlockScroll()` (Header.astro) and unused `backLink`
   destructuring (VsComparison.astro); marked JSON data `<script>` blocks
   `is:inline`. `astro check` is fully clean.

### Dependency remediation — all 17 advisories cleared
4. `npm audit fix` resolved 8 with no breaking changes.
5. **Astro 5.18.2 → 6.4.7.** Because `@astrojs/tailwind@6` peer-caps at Astro 5
   (the integration is deprecated in the Astro 6 line), migrated Tailwind v3 to
   run through PostCSS instead:
   - Added `postcss.config.mjs` (`tailwindcss` + `autoprefixer`).
   - Removed the `@astrojs/tailwind` integration from `astro.config.mjs`.
   - The `@tailwind` directives already lived in `src/styles/global.css`.
   - **Visual output unchanged** — custom theme colors (`#0071e3`, `#1d1d1f`,
     `#30d158`) and autoprefixer vendor prefixes verified in the built CSS.
6. Fixed Astro 6 type changes: `z.record()` now requires an explicit key type;
   typed the confidence-badge accessor in `[slug].astro`; `z` now imported from
   `zod` (the `astro:content` re-export is deprecated). `zod` added as an
   explicit dependency.
7. `package.json` `overrides` force the patched transitive dev-chain packages
   `esbuild@^0.28.1` and `yaml@^2.9.0`, clearing the last esbuild and
   yaml-language-server advisories. Build and verify confirmed unaffected.

### CSP rationale
`script-src`/`style-src` include `'unsafe-inline'` because Astro inlines small
page scripts and JSON data blocks, Tailwind injects styles, and a few elements
use inline `style` attributes. With no server and no user input, the injection
surface is minimal; the policy locks down `object-src`, `frame-ancestors`,
`base-uri`, and `form-action`, and pins fonts to Google's domains. If you add
external scripts, styles, fonts, or embeds, update the CSP in `public/_headers`.

---

## 3. Post-Deploy Verification Checklist

After the next Cloudflare Pages build of the production branch:

1. `curl -sI https://expertnetworks.net/` — confirm CSP, HSTS, X-Frame-Options,
   Permissions-Policy headers are present.
2. Load `/compare`, `/networks`, `/news` and watch the browser console for CSP
   violations (the most likely breakage point is an inline script being blocked).
3. Confirm `/_astro/*` responses carry `cache-control: ...immutable`.
4. Once headers are stable in production, submit the domain to hstspreload.org.

---

## 4. Reproduce This Audit

```bash
npm install
npm run verify          # build + link check + type check
npm audit               # dependency advisories (expect: 0)
curl -sI https://expertnetworks.net/   # live headers
```
