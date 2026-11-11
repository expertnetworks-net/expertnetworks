# Architecture

This file owns: the build pipeline, page and component responsibilities, browser scripts, and the compare page design.

Related owners:

- Content fields and edit procedures: [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md)
- Branches, hosting, and CI: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- Headers and CSP: [`SECURITY.md`](SECURITY.md)

The docs use the term "provider" for a profiled company. The code uses "network" for the same entity.

## 1. System summary

The site is static. Astro builds all pages into HTML at build time. A static host serves the files.

```text
src/content/**/*.json
        |  validated by src/content.config.ts (Zod)
        v
src/pages/*.astro + src/layouts + src/components + src/lib
        |  npm run build  (astro build)
        v
dist/   HTML, CSS, JS, images, sitemap
        |  public/ is copied into dist/ unchanged (includes _headers and robots.txt)
        v
Cloudflare Pages serves dist/
```

Consequences:

- A content edit is a Git commit.
- Build-time validation is the primary safety mechanism.
- The browser gets HTML, CSS, images, and page-specific JavaScript. There is no client-side router.

## 2. Stack

| Part | Where it is configured |
|---|---|
| Astro, static output, site URL, sitemap | `astro.config.mjs` |
| Dependency versions and the Node requirement | `package.json` |
| Tailwind CSS v3 through PostCSS | `postcss.config.mjs`, `tailwind.config.mjs` |
| `@tailwind` directives and global styles | `src/styles/global.css` |
| Content schemas (Zod, imported from `zod`) | `src/content.config.ts` |
| TypeScript strict preset | `tsconfig.json` |

There is no `@astrojs/tailwind` integration. `BaseLayout.astro` imports `src/styles/global.css`.

## 3. Data sources

| Source | Loaded by | Validated by schema |
|---|---|---|
| `src/content/networks/*.json` | `getCollection('networks')` | Yes |
| `src/content/news/*.json` | `getCollection('news')` | Yes |
| `src/content/compare.json` | A direct JSON import in `src/pages/compare.astro` | No |

Important limits of validation:

- The schema checks field types and enum values.
- The schema does not check cross-file references: `relatedNetworks` slugs and slugs in `compare.json`.
- `compare.json` has no schema. A structure error shows as a build error or as a wrong page.
- `node .github/scripts/check-slugs.mjs` checks the cross-file references. It is not part of `npm run verify`.

Pages show a provider or a news item only if `published` is `true`.
Pages sort providers by `priority` (ascending) and news items by `date` (newest first).

## 4. Pages

### 4.1 Data-driven pages

| Route | File | Function |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero, top providers, recent news, provider marquee. |
| `/networks` | `src/pages/networks/index.astro` | Provider directory: search, filters, sort, grid view, list view, compare selection. |
| `/networks/<slug>` | `src/pages/networks/[slug].astro` | One page for each published provider. Shows related news through `relatedNetworks`. |
| `/compare` | `src/pages/compare.astro` | Compare matrix. See section 6. |
| `/news` | `src/pages/news/index.astro` | News feed, filters, and an alternative "signals" view. |

`getStaticPaths()` in `src/pages/networks/[slug].astro` uses the `slug` field of each provider as the URL.

### 4.2 Editorial pages

Each of these routes is one `.astro` file in `src/pages/` with the same name as the route.

| Group | Routes |
|---|---|
| Trust and legal | `/about`, `/sources`, `/verification`, `/privacy`, `/disclaimer` |
| Guides | `/what-is-an-expert-network`, `/best-expert-networks`, `/expert-network-pricing` |
| Buyer guides | `/expert-networks-for-consulting`, `/expert-networks-for-hedge-funds`, `/expert-networks-for-private-equity` |
| Alternatives | `/glg-alternatives`, `/alphasights-alternatives`, `/third-bridge-alternatives` |
| Head-to-head | `/glg-vs-alphasights`, `/glg-vs-guidepoint`, `/glg-vs-third-bridge`, `/alphasights-vs-dialectica`, `/alphasights-vs-third-bridge`, `/third-bridge-vs-guidepoint` |
| Error | `src/pages/404.astro` (excluded from the sitemap) |

Notes:

- Most editorial pages read the `networks` collection for provider data.
- Editorial pages also contain text that is written in the `.astro` file. A provider update does not change that text.
- Five head-to-head pages use `src/components/VsComparison.astro`. `/glg-vs-alphasights` has its own layout.

To list all routes after a build:

```bash
npm run build && find dist -name '*.html' | sort
```

## 5. Layout and components

| File | Function |
|---|---|
| `src/layouts/BaseLayout.astro` | `<head>` metadata, canonical URL, Open Graph and Twitter tags, favicons, fonts, JSON-LD, header, footer. Also a small shared script: fade-in observer and a reset of the scroll lock on `body`. |
| `src/components/Header.astro` | Fixed navigation, menu drawer, search overlay. Reads the `networks` collection for search data. Stores the drawer section state in `localStorage`. |
| `src/components/Footer.astro` | Footer links and provider shortcuts. Reads the `networks` collection. |
| `src/components/ParticleHero.astro` | Dark hero with a canvas particle animation. Obeys the reduced-motion setting. |
| `src/components/TrackedNetworksMarquee.astro` | Provider marquee on the homepage. |
| `src/components/VsComparison.astro` | Shared layout for head-to-head pages. |

A change in `BaseLayout.astro`, `Header.astro`, or `Footer.astro` changes all pages.

## 6. Compare page

The compare page has the most state. It is the page that is easiest to break.

### 6.1 Files

| File | Function |
|---|---|
| `src/content/compare.json` | Default providers, presets, matrix sections and rows, compare-only provider data, disclaimers. |
| `src/lib/compare-v2.ts` | Makes the view-model and the HTML strings. Exports `buildCompareRender`, `projectCompareNetwork`, and `compareGoals`. |
| `src/pages/compare.astro` | Page shell and styles. Calls `buildCompareRender` at build time for the default providers. Puts the dataset in the page as JSON (`#compare-client-data`). |
| `src/scripts/compare-page.ts` | Browser controller. Exports `bootComparePage`. Holds the state, calls `buildCompareRender` again after each change, and updates the URL. |

Rule: all HTML for the compare tables comes from `src/lib/compare-v2.ts`.
The same function runs at build time and in the browser. Thus the two outputs cannot differ.

### 6.2 Behavior

- The build renders the default providers (`networks` in `compare.json`).
- The browser reads the query string after page load and renders again if it selects other providers.
- The maximum number of providers in one comparison is 5. This limit is in `src/scripts/compare-page.ts`.
- If the user adds a sixth provider, the script removes the first provider and shows a message.
- The minimum number of providers is 2. The script does not remove a provider below this number.
- Known defect: a `?preset=<name>` URL does not apply the limit of 5. The presets in `compare.json` have 6 slugs, thus such a URL shows 6 providers.
- The script writes the current selection to the URL with `history.replaceState`.

| Query parameter | Effect |
|---|---|
| `networks=a,b,c` | Two or more valid slugs: shows these providers. One valid slug: adds it to the default providers. |
| `preset=<name>` | Shows the providers of that preset. Ignored if `networks` is present. |
| `add=<slug>` | Adds one provider to the default providers. The script removes this parameter from the URL. |

The script ignores slugs that are not published providers.

### 6.3 Parts of the page

- Provider chips, with add and remove controls. The add control opens a modal dialog with a focus trap.
- Goal buttons. Each button selects a preset. The list of goals is `compareGoals` in `src/lib/compare-v2.ts`.
- Sections: critical differences, AI workflow, commercial, compliance, full evidence matrix, methodology.
- A section navigation rail for wide screens.

### 6.4 Code and config that are not connected to the UI

These items exist, but the page does not use them now. Do not describe them as features.

| Item | Status |
|---|---|
| `buyerPathwayGroups`, `explainableInsights`, `presetMeta` in `compare.json` | No code reads these keys. |
| `diffMode` ("Differences only") in `compare-v2.ts` and `compare-page.ts` | The renderer supports it. No control changes it. Its value is always `false`. |
| `highConfidenceOnly` in `compare-v2.ts` | The renderer supports it. The controller always sends `false`. |
| `critical` in the rows of `compare.json` | No code reads this field. |
| `showEvidenceNotes` in `compare-v2.ts` and `compare-page.ts` | The renderer supports it. No control changes it. Its value is always `false`. |

## 7. Browser scripts

Most scripts are inline `<script>` blocks in `.astro` files. Astro bundles them.
The compare page is the exception: it imports `src/scripts/compare-page.ts`.

| Area | File |
|---|---|
| Search overlay, menu drawer | `src/components/Header.astro` |
| Hero effects | `src/pages/index.astro`, `src/components/ParticleHero.astro` |
| Marquee | `src/components/TrackedNetworksMarquee.astro` |
| Directory filters, list view, compare selection, `?q=` search parameter | `src/pages/networks/index.astro` |
| Provider page side navigation and mobile panel | `src/pages/networks/[slug].astro` |
| Compare page | `src/scripts/compare-page.ts` |
| News filters and signals view | `src/pages/news/index.astro` |

Two patterns to know:

- **Embedded JSON.** Some pages put a dataset in a `<script type="application/json">` element. The page script reads it to render a second view. Examples: `#directoryData`, `#newsClientData`, `#compare-client-data`.
- **Selectors.** Scripts find elements by `id`, class name, and `data-*` attributes. The build does not check these names.

## 8. Verification

| Step | Tool | What it finds |
|---|---|---|
| Build | `astro build` | Schema errors in content, template errors. |
| Link check | `scripts/verify-dist-links.mjs` | Internal `href` and `src` values in `dist/*.html` that do not resolve to a file. It ignores external URLs and `<script>` content. |
| Type check | `astro check` | TypeScript and template diagnostics. |
| Slug check | `.github/scripts/check-slugs.mjs` | Slug and file name mismatches, duplicate slugs, unknown `relatedNetworks` and compare slugs, logo paths that do not exist. |

`npm run verify` runs the first three steps. CI runs the first three steps and `npm audit`. See [`DEPLOYMENT.md`](DEPLOYMENT.md).

No automated step checks these items:

- Editorial accuracy.
- Visual appearance.
- Browser script behavior.

## 9. What is intentionally absent

- Server routes, API endpoints, and server adapters
- A database or a headless CMS
- Authentication, cookies, and sessions
- React or other UI framework islands
- Environment variables

If a change needs one of these, it is an architecture change. Get the approval of the owner first.
