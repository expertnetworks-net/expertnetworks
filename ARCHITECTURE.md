# Architecture

Last verified against the codebase: June 16, 2026

## System Summary

ExpertNetworks.net is a static Astro site.

At build time, Astro reads JSON content from `src/content/`, validates it through `src/content.config.ts`, renders Astro pages from `src/pages/`, and writes static output to `dist/`.

At runtime, the browser receives static HTML, CSS, images, and page-specific JavaScript. There is no backend service, no API layer, no request-time database, and no admin workflow in the current repository.

## Runtime Model

```text
src/content/*.json
        |
        v
src/content.config.ts
  Astro Content Collections
  Zod validation
        |
        v
src/pages/*.astro + src/components/*.astro
        |
        v
astro build
        |
        v
dist/ static HTML, CSS, JS, images, sitemap, robots.txt
```

Key implications:

- production hosting only needs to serve static files
- publishing is Git-based
- content edits are code changes
- build-time validation is the main safety net

## What Data Lives Where

### Provider profiles

Directory: `src/content/networks/`

Each JSON file describes one provider. These entries feed:

- homepage summaries
- the directory page
- provider profile pages
- global search in the header
- compare-page provider cards and matrix values
- footer counts and marquee items

Important fields include:

- identity and branding: `name`, `shortName`, `slug`, `logo`, gradients
- commercial data: `pricingModel`, `pricingDetail`, `deliveryModel`
- classification data: `type`, `categoryBadge`, `regionStrength`, `aiBadge`, `complianceBadge`
- compare-facing fields: `comparison`, `bestFor`, `keyDifferentiators`
- profile-page deep-dive fields: `overview`, `history`, `servicesDetailed`, `aiPlatform`, `complianceExtended`, `clientFit`, `strengths`, `caveats`, `sourceNotes`, `confidence`

### News signals

Directory: `src/content/news/`

Each JSON file is one published signal or development. These entries feed:

- the homepage news section
- `/news`
- related-news sections on provider pages

Important fields include:

- `title`, `slug`, `date`, `source`, `sourceUrl`
- `category`, `sourceType`, `significance`
- `summary`, `whyItMatters`
- `relatedNetworks`
- `impactTags`

### Compare configuration

File: `src/content/compare.json`

This file drives the structure of `/compare`:

- default provider set
- preset groups
- section layout
- row definitions
- enriched compare-only metadata such as provider type, evidence labels, AI workflow capabilities, and tradeoff notes

## Content Validation

`src/content.config.ts` defines two Astro content collections:

- `networks`
- `news`

Both use Zod schemas. Invalid content fails the build.

This is the main content integrity layer. It validates field shape and allowed enum values, but it does not fully enforce cross-file relationships such as:

- whether every `relatedNetworks` slug points to a real provider
- whether every compare preset slug points to a published provider

Those relationships still need maintainer attention.

## How Pages Are Generated

### Homepage

File: `src/pages/index.astro`

Uses `getCollection('networks')` and `getCollection('news')` to render:

- hero content
- top provider summaries
- curated recent news
- tracked-network marquee

The page also contains inline JavaScript for the homepage-specific hero animation.

### Directory

File: `src/pages/networks/index.astro`

Reads all published network entries and renders:

- searchable/filterable provider directory
- compare selection tray
- grid view
- client-rendered list view

The page serializes a directory dataset into the HTML so the alternate list view can be built client-side without shipping two full SSR views.

### Provider pages

File: `src/pages/networks/[slug].astro`

Uses `getStaticPaths()` to create one static page per published provider slug.

Each page combines:

- the provider’s own content
- a global provider list for sidebar navigation
- related news pulled from the news collection via `relatedNetworks`

The page supports both summary-only and deeper profiles through one shared schema and conditional rendering.

### Compare page

File: `src/pages/compare.astro`

Builds a provider comparison matrix from:

- published network entries
- `src/content/compare.json`

The compare implementation is split across:

- `src/pages/compare.astro`
- `src/lib/compare-v2.ts`
- `src/scripts/compare-page.ts`

`src/pages/compare.astro` pre-renders the default Compare V2 state at build time. `src/lib/compare-v2.ts` is the shared compare renderer used for both the initial HTML and client-side rerenders. `src/scripts/compare-page.ts` owns browser state and interaction wiring.

The page currently supports:

- buyer pathways
- recommendation summary cards
- explainable insights
- provider snapshot cards
- layered comparison tables
- contextual disclaimers
- differences-only, high-confidence, and evidence-note filters
- provider add/remove and URL synchronization

Client-side behavior is still required for:

- preset switching
- buyer-pathway switching
- provider add/remove
- URL synchronization
- differences-only filtering
- high-confidence filtering
- evidence-note expansion state
- section progress navigation

Because the site is static, query-string-specific selections are not known at build time. The default compare state is server-rendered, while URL-specific compare state is finalized client-side after load.

### News page

File: `src/pages/news/index.astro`

Builds the intelligence desk from:

- the news collection
- published provider data for related-network labels, logos, and gradients

It renders the main feed server-side and uses a smaller serialized client dataset to build the alternate signals view in the browser.

### Editorial pages

Files such as:

- `src/pages/about.astro`
- `src/pages/sources.astro`
- `src/pages/verification.astro`
- `src/pages/privacy.astro`
- `src/pages/disclaimer.astro`
- `src/pages/what-is-an-expert-network.astro`
- `src/pages/best-expert-networks.astro`
- `src/pages/expert-network-pricing.astro`
- `src/pages/expert-networks-for-private-equity.astro`
- `src/pages/glg-vs-alphasights.astro`

These are static Astro pages with shared layout chrome and light page-specific scripting where needed.

## Shared Layout And Components

### `src/layouts/BaseLayout.astro`

Responsible for:

- global metadata
- canonical tags
- Open Graph and Twitter tags
- JSON-LD injection
- font loading
- shared header and footer
- a small amount of global browser behavior such as fade-in observation and `body` overflow reset

### `src/components/Header.astro`

Responsible for:

- fixed site navigation
- menu drawer
- search overlay
- top-network shortcuts inside the drawer

The search overlay is fed by build-time network data passed into an inline script.

### `src/components/Footer.astro`

Responsible for:

- footer navigation
- legal/methodology links
- top profile shortcuts
- published network count summary

### `src/components/ParticleHero.astro`

Reusable dark hero/header component with:

- canvas-based particle animation
- responsive sizing
- reduced-motion handling
- visibility and cleanup logic

### `src/components/TrackedNetworksMarquee.astro`

Homepage component that renders:

- a desktop marquee of tracked providers
- a mobile horizontal scroll row
- hover-card metadata derived from provider content

## Client-Side Interactivity

The site is not a SPA. There is no client-side router and no state library.

Interactivity is implemented with a mix of inline scripts inside `.astro` files and small bundled browser modules. Current interactive areas include:

- global search and menu drawer
- homepage hero effects
- directory filtering and compare selection
- profile-page sidebar toggles and search
- compare-page presets, pathways, add/remove flow, layered compare rerendering, and URL state
- news filters and feed/signals view switching

This keeps the project easy to host statically, but UI logic is still distributed across multiple page files and helper modules rather than one shared client application.

## Build And Verification Path

Package scripts from `package.json`:

```bash
npm run dev
npm run build
npm run preview
npm run check
npm run verify:links
npm run verify
```

Current verification flow:

1. `astro build`
2. `scripts/verify-dist-links.mjs` scans built `dist/` HTML for broken internal `href` and `src` references
3. `astro check`

GitHub Actions mirrors that same flow in `.github/workflows/verify.yml`.

## Static Hosting And Deployment

`astro.config.mjs` sets:

- `output: 'static'`
- `site: 'https://expertnetworks.net'`
- sitemap integration

Tailwind CSS v3 is processed through PostCSS (`postcss.config.mjs` with `tailwindcss` and `autoprefixer`); the `@tailwind` directives live in `src/styles/global.css`, which `BaseLayout.astro` imports. The deprecated `@astrojs/tailwind` integration was removed during the Astro 6 upgrade.

The resulting `dist/` output is appropriate for static hosts such as Cloudflare Pages.

`public/_headers` ships security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy, Cross-Origin-Opener-Policy) and long-lived caching for fingerprinted `/_astro/*` assets. Cloudflare Pages applies this file automatically; it has no effect during local `astro build`.

The repo is currently connected to GitHub Actions and Cloudflare Pages.

Last verified operational state on June 16, 2026:

- GitHub default branch: `main`
- Cloudflare Pages preview branch: `main`
- Cloudflare Pages production branch: `claude/expert-network-sources-6oGs1`

The GitHub default branch and the Cloudflare production branch should still be treated as separate settings and verified independently.

## What Is Intentionally Absent

The current architecture does not include:

- admin routes
- API endpoints
- request-time auth
- file uploads
- cookies or session-based editing workflows
- a database
- a headless CMS
- React islands
- server adapters

If any future change depends on those concepts, it should be treated as an architecture change, not a small feature addition.

## Maintainability Notes

- Content lives in JSON files and is easy to diff, review, and revert.
- Schema enforcement is strong for field types but weaker for cross-file relationships.
- The heaviest client logic lives in `networks/index.astro`, `news/index.astro`, and the compare stack across `compare.astro`, `compare-v2.ts`, and `compare-page.ts`.
- Compare rendering is now centralized enough to avoid duplicating HTML-generation logic between server and browser.
- Many UI behaviors rely on inline scripts, so regressions often show up as browser issues rather than compile failures.
- `public/` asset paths must stay accurate because broken asset links only surface during build verification or manual review.

## Concise Repo Map

```text
.
├── .github/workflows/verify.yml
├── public/
├── scripts/verify-dist-links.mjs
├── src/
│   ├── components/
│   ├── content/
│   │   ├── compare.json
│   │   ├── networks/
│   │   └── news/
│   ├── content.config.ts
│   ├── lib/
│   │   └── compare-v2.ts
│   ├── layouts/
│   ├── pages/
│   └── scripts/
│       └── compare-page.ts
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs
└── tsconfig.json
```
