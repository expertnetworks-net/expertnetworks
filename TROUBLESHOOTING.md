# Troubleshooting

Common issues and their solutions when working on ExpertNetworks Hub.

---

## Build Errors

### "InvalidContentEntryDataError: data does not match collection schema"

**What it means:** A JSON file in `src/content/networks/` or `src/content/news/` has a field that doesn't match the Zod schema in `src/content.config.ts`.

**How to fix:**
1. The error message tells you exactly which file and field is wrong
2. Either fix the JSON file to match the schema, or update the schema in `content.config.ts`
3. Common causes:
   - New field added to JSON but not to schema
   - Typo in enum value (e.g., `confidence` only accepts `verified`, `positioning`, `inference`, `partially-unverifiable`)
   - Wrong type (string where number expected, etc.)

**Example error:**
```
confidence.founderBackgrounds: Invalid enum value.
Expected 'verified' | 'positioning' | 'inference', received 'partially-unverifiable'
```
**Fix:** Add the new enum value to the schema in `content.config.ts`

---

### "Cannot find module '@astrojs/sitemap'"

**What it means:** The sitemap package isn't installed.

**How to fix:**
```bash
npm install @astrojs/sitemap
```

---

### Build succeeds but pages are missing

**What it means:** The content file exists but `published` is set to `false` (or missing).

**How to fix:** Set `"published": true` in the relevant JSON file.

---

## Runtime Issues

### Page appears "stuck" — can't scroll, clicks don't work

**What it means:** An overlay (search, menu, or mobile sidebar) set `overflow: hidden` on `<body>` and it wasn't cleared.

**This should be fixed now** — BaseLayout.astro resets `document.body.style.overflow = ''` on every page load. But if it happens again:

**Causes:**
1. A new overlay was added without a proper close handler
2. A link inside an overlay navigates without closing the overlay first
3. JavaScript error prevented the close function from running

**How to debug:**
1. Open browser DevTools → Elements tab
2. Check if `<body>` has `style="overflow: hidden"`
3. Run `document.body.style.overflow = ''` in the console to unstick it
4. Check the Console tab for JavaScript errors

**How to prevent:**
- Every overlay that sets `overflow: hidden` must:
  - Clear it in its close function
  - Have a click handler on links inside it that calls the close function
  - Respond to the Escape key
- BaseLayout.astro has a safety-net reset on page load

---

### Search overlay doesn't show results

**What it means:** The search data was not properly injected into the page.

**How to debug:**
1. Open DevTools Console
2. Check if `searchNetworks` variable exists in the inline script scope
3. Look for JavaScript errors

**Common cause:** The `define:vars` in Header.astro passes network data inline. If a network has unusual characters in its name, it could break the JSON serialization. All names are now escaped with `escapeHtml()`.

---

### Mobile sidebar doesn't close

**What it means:** The close handlers aren't attached or fired.

**How to debug:**
1. Check DevTools Console for errors
2. Verify the DOM IDs: `sidebarToggle`, `sidebarBackdrop`, `mobileSidebar`, `closeSidebar`
3. Ensure the [slug].astro script block is loading

**Fix:** The sidebar should close on: backdrop click, close button click, Escape key, or clicking any link inside it.

---

### Filters on networks/news page don't work

**What it means:** The client-side JavaScript for filtering isn't running.

**How to debug:**
1. Check DevTools Console for errors
2. Verify DOM IDs: `searchInput`, `filterType`, `filterPricing`, `filterRegion`, `sortBy`, `networkList`
3. Check that `.network-row` elements have the correct `data-*` attributes

---

## Content Issues

### Network logo not showing (gradient placeholder instead)

**What it means:** Either:
1. The `logo` field is missing or empty in the network's JSON file
2. The logo file doesn't exist at the path specified in the JSON
3. The file path is case-sensitive and doesn't match

**How to fix:**
1. Add a PNG logo to `public/images/networks/` (e.g., `my-network.png`)
2. Set `"logo": "/images/networks/my-network.png"` in the network's JSON file
3. Paths are case-sensitive on Linux — `GLG.png` and `glg.png` are different files

---

### Network not appearing in comparison table

**What it means:** The network's slug isn't listed in `src/content/compare.json`.

**How to fix:** Add the network's slug to the `networks` array in `compare.json`:
```json
{
  "networks": ["glg", "alphasights", "third-bridge", "dialectica", "guidepoint", "alphasense-tegus", "your-new-slug"]
}
```

---

### News article not linking to correct network

**What it means:** The `relatedNetworks` array in the news JSON has the wrong slug.

**How to fix:** Make sure the slug matches an existing network file. For example, if the network file is `src/content/networks/alphasense-tegus.json`, the slug is `alphasense-tegus`.

---

### News signal not appearing in "What Matters Now" section

**What it means:** The news article needs `"featured": true` and `"significance": "major"` to appear in the featured signals section of the news page.

**How to fix:**
1. Set `"featured": true` in the news JSON file
2. Set `"significance": "major"`
3. Add a `"whyItMatters"` string to display editorial context
4. Ensure `"sourceType"` is set (Press Release, Industry Report, News Coverage, Regulatory, or Product Update)

---

### News V2 field enum validation error

**What it means:** A news JSON file has an invalid value for `sourceType` or `significance`.

**Valid values:**
- `sourceType`: `Press Release`, `Industry Report`, `News Coverage`, `Regulatory`, `Product Update`
- `significance`: `major`, `standard`, `brief`

---

### Rich profile sections not showing (no accordion)

**What it means:** The profile page detects whether to show the accordion deep-dive based on this check:

```js
const isRich = !!(d.overview || d.history || d.servicesDetailed?.length || d.aiPlatform || d.strengths?.length);
```

If none of these fields are present, the page falls back to the basic "legacy" layout.

**How to fix:** Add at least one rich field (`overview`, `history`, `servicesDetailed`, `aiPlatform`, or `strengths`) to the network's JSON file.

---

## SEO Issues

### Page not indexed by Google

**Checklist:**
1. Is the page in the sitemap? Check `dist/sitemap-0.xml` after building
2. Is `published: true` set in the content JSON?
3. Is `robots.txt` blocking the path? It should only block `/admin/` and `/api/`
4. Has the sitemap been submitted in Google Search Console?
5. Is the canonical URL correct? Check the `<link rel="canonical">` tag

---

### Social share preview shows no image

**What it means:** The `og:image` tag points to `/og-default.svg`. Some platforms (Facebook, LinkedIn) don't render SVG images.

**How to fix:** Convert `public/og-default.svg` to a 1200x630 PNG, save as `public/og-default.png`, and update `src/layouts/BaseLayout.astro` line 18 from `'/og-default.svg'` to `'/og-default.png'`.

---

## Admin Panel

### Admin panel pages load but forms don't work

**What it means:** The admin panel's API endpoints (`/api/*`) only work in dev/SSR mode. In the static build, POST requests have no server to handle them.

**How to fix:** Run the site in dev mode to use the admin panel:
```bash
npm run dev
# Then visit http://localhost:4321/admin/login
```

---

### "Unauthorized" error when using admin API

**What it means:** The `admin_session` cookie is missing or invalid.

**How to fix:**
1. Go to `/admin/login`
2. Enter the password from `.env` (`ADMIN_PASSWORD`)
3. Try the API call again

---

## Development Environment

### `npm run dev` shows port already in use

**How to fix:**
```bash
# Kill the process on port 4321
lsof -i :4321 | grep LISTEN | awk '{print $2}' | xargs kill

# Or use a different port
npm run dev -- --port 4322
```

---

### Changes not reflecting after edit

**What to check:**
1. If you edited a JSON file, the dev server should hot-reload. If not, restart with `npm run dev`
2. If you edited `content.config.ts`, you must restart the dev server
3. If you edited `tailwind.config.mjs`, you must restart the dev server
4. If you edited an `.astro` file, it should hot-reload automatically

---

### TypeScript errors in .astro files

**What it means:** Astro uses TypeScript for type checking in the frontmatter (the code between `---` markers). Common errors include:
- `Property 'X' does not exist on type` — the field isn't in the Zod schema
- `Type 'X' is not assignable to type 'Y'` — wrong type in a function argument

**How to fix:** Update the schema in `content.config.ts` to match your data, or fix the type in your code.
