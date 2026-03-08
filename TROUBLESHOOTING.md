# Troubleshooting

> Note: parts of this document predate the March 2026 static-only cleanup. Any troubleshooting steps that mention `/admin`, `/api/*`, or `ADMIN_PASSWORD` no longer apply to the current production architecture.

Common issues and their solutions when working on ExpertNetworks Hub.

Last verified against codebase: March 8, 2026

---

## Build Errors

### "InvalidContentEntryDataError: data does not match collection schema"

**What it means:** A JSON file in `src/content/networks/` or `src/content/news/` has a field that doesn't match the Zod schema in `src/content.config.ts`.

**How to fix:**
1. The error message tells you exactly which file and field is wrong
2. Either fix the JSON file to match the schema, or update the schema in `content.config.ts`
3. Common causes:
   - New field added to JSON but not to schema
   - Typo in enum value
   - Wrong type (string where number expected, etc.)

**Valid enum values (verified from `content.config.ts`):**

| Field | Valid Values |
|---|---|
| `confidence.*` | `verified`, `positioning`, `inference`, `partially-unverifiable` |
| `sourceType` (news) | `Press Release`, `Industry Report`, `News Coverage`, `Regulatory`, `Product Update` |
| `significance` (news) | `major`, `standard`, `brief` |
| `categoryBadge` (network) | `Global Leader`, `Major Provider`, `Fast-Growing`, `Asia Specialist`, `Research Platform`, `Technology-First`, `Marketplace`, `Boutique Specialist` |
| `deliveryModel` (network) | `Concierge`, `Hybrid`, `Self-Serve`, `Marketplace`, `Platform-Led` |
| `regionStrength` (network) | `Global`, `North America`, `Europe`, `Asia-Pacific`, `Greater China`, `India`, `Emerging Markets` |
| `complianceBadge` (network) | `Strong Compliance`, `Standard Compliance`, `Compliance Tools`, `Limited Public Detail` |
| `aiBadge` (network) | `AI-Native`, `AI Research`, `AI Matching`, `AI Moderation`, `Limited AI Detail` |

---

### "Cannot find module '@astrojs/sitemap'"

**Fix:**
```bash
npm install @astrojs/sitemap
```

---

### Build succeeds but pages are missing

**Cause:** The content file has `published` set to `false` or missing.

**Fix:** Set `"published": true` in the relevant JSON file.

---

### Build succeeds but news signal not in "What Matters Now"

**Cause:** The featured signals section requires all of:
1. `"featured": true`
2. `"significance": "major"`
3. `"whyItMatters": "..."` (for the editorial context display)
4. `"sourceType"` set to a valid enum value

If any are missing, the signal appears in the main feed but not the featured section.

---

## Runtime Issues

### Page appears "stuck" — can't scroll, clicks don't work

**What it means:** An overlay set `overflow: hidden` on `<body>` and didn't clear it.

**Quick fix:** DevTools Console → `document.body.style.overflow = ''`

**This should not recur** — `BaseLayout.astro` resets overflow on every page load. If it does:

1. A new overlay was added without a close handler
2. A link inside an overlay navigates without closing the overlay first
3. A JavaScript error prevented the close function from running

**Prevention:** Every overlay must:
- Clear `overflow` in its close function
- Have click handlers on internal links that call close before navigation
- Respond to the Escape key

---

### Search overlay doesn't show results

**Debug:**
1. DevTools Console — check for JavaScript errors
2. `define:vars` in `Header.astro` injects network data inline
3. If a network has unusual characters, it could break JSON serialization
4. All names are escaped with `escapeHtml()` (XSS fix applied)

---

### Mobile sidebar doesn't close

**Debug:**
1. DevTools Console for errors
2. Verify DOM IDs: `sidebarToggle`, `sidebarBackdrop`, `mobileSidebar`, `closeSidebar`
3. Should close on: backdrop click, close button, Escape, or link click inside sidebar

---

### News page filters don't work

**Debug:**
1. DevTools Console for errors
2. The news page has 5 filter controls: category, network, source type, time range, significance
3. Check that news signal elements have correct `data-*` attributes
4. The trending sidebar computes 90-day counts from `impactTags` — missing tags = wrong counts

---

### Network directory filters don't work

**Debug:**
1. DevTools Console for errors
2. Verify DOM IDs: `searchInput`, `filterType`, `filterPricing`, `filterRegion`, `sortBy`, `networkList`
3. Check that `.network-row` elements have correct `data-*` attributes

---

## Content Issues

### Network logo not showing (gradient placeholder instead)

**Causes:**
1. `logo` field missing or empty in the network's JSON
2. Logo file doesn't exist at the specified path in `public/images/networks/`
3. Path case mismatch — Linux is case-sensitive (`GLG.png` ≠ `glg.png`)

**Fix:**
1. Add a PNG to `public/images/networks/`
2. Set `"logo": "/images/networks/my-network.png"` in the JSON
3. Currently 11 of 33 networks have logos; 22 use gradient placeholders

---

### Network not appearing in comparison table

**Fix:** Edit `src/content/compare.json`:
- `networks` array: controls the default comparison set
- `presets` object: controls the 7 preset tabs (leaders, consulting, pe, enterprise, asia, ai, library)
- Slugs must match filenames in `src/content/networks/` (without `.json`)

---

### News signal not linking to correct network

**Fix:** Ensure `relatedNetworks` slugs match network filenames. Example: if the file is `src/content/networks/alphasense-tegus.json`, the slug is `"alphasense-tegus"`.

---

### Rich profile sections not showing (no accordion)

**Detection logic in `[slug].astro`:**
```js
const isRich = !!(d.overview || d.history || d.servicesDetailed?.length || d.aiPlatform || d.strengths?.length);
```

If none present → basic layout. Add at least one rich field to trigger accordions.

Currently 5 networks have rich profiles: GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica.

---

## SEO Issues

### Page not indexed by Google

1. In sitemap? Check `dist/sitemap-0.xml` after building
2. `published: true` set?
3. `robots.txt` blocking? Only `/admin/` and `/api/` are blocked
4. Sitemap submitted in Google Search Console?
5. Canonical URL correct? Check `<link rel="canonical">`

---

### Social share preview shows no image

**Cause:** `og:image` points to `/og-default.svg`. Facebook and LinkedIn don't render SVG.

**Fix:** Convert to 1200x630 PNG, save as `public/og-default.png`, update `src/layouts/BaseLayout.astro` to reference the PNG.

---

## Admin Panel

### Admin panel forms don't work

**Cause:** API endpoints only work in dev/preview mode (SSR). Static build has no server for POST requests.

**Fix:**
```bash
npm run dev
# Visit http://localhost:4321/admin/login
```

---

### "Unauthorized" error

**Fix:**
1. Go to `/admin/login`
2. Enter password from `.env` (`ADMIN_PASSWORD`)
3. Retry

---

### No .env file / password not working

**Cause:** `.env` is gitignored and not included in the repo.

**Fix:**
```bash
cp .env.example .env
# Edit .env: ADMIN_PASSWORD=your_password_here
```

Auth checks `import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD` in `src/pages/api/auth.ts`.

---

## Development Environment

### Port already in use

```bash
lsof -i :4321 | grep LISTEN | awk '{print $2}' | xargs kill
# Or: npm run dev -- --port 4322
```

---

### Changes not reflecting

| What you edited | Expected behavior |
|---|---|
| JSON content file | Hot-reload. If not, restart `npm run dev` |
| `content.config.ts` | **Must restart** dev server |
| `tailwind.config.mjs` | **Must restart** dev server |
| `.astro` file | Hot-reload automatically |

---

### TypeScript errors in .astro files

- `Property 'X' does not exist on type` → field not in Zod schema (`content.config.ts`)
- `Type 'X' is not assignable to type 'Y'` → wrong type in function argument

---

### `npm run fetch-news` fails

**Cause:** `scripts/fetch-news.ts` does not exist. The npm script is defined in `package.json` but the file was never created.

**Fix:** Either create the script or remove the entry from `package.json`.

---

## Quick Reference: Debug Locations

| Issue | File to check |
|---|---|
| Build errors | `src/content.config.ts` (Zod schemas) |
| Auth issues | `src/middleware.ts` + `src/pages/api/auth.ts` |
| Search bugs | `src/components/Header.astro` (inline script) |
| Sidebar bugs | `src/pages/networks/[slug].astro` (inline script) |
| Network filter bugs | `src/pages/networks/index.astro` (inline script) |
| News filter bugs | `src/pages/news/index.astro` (inline script) |
| SEO tags | `src/layouts/BaseLayout.astro` |
| Stuck page / overflow | `src/layouts/BaseLayout.astro` (safety-net reset) |
| Sitemap config | `astro.config.mjs` (sitemap filter) |
| Crawl rules | `public/robots.txt` |
| Comparison table | `src/content/compare.json` + `src/components/CompareTable.astro` |
| Env var usage | `src/pages/api/auth.ts` (line 14) |
