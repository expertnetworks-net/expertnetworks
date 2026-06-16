# ExpertNetworks.net

Independent public-source research on expert network providers, market structure, and industry developments.

Live site: [https://expertnetworks.net](https://expertnetworks.net)

## What This Project Is

ExpertNetworks.net is a static research site that helps readers understand and compare expert networks.

Expert networks sit between organizations that need specialized knowledge and professionals who can provide it. Public information about this industry is often scattered, promotional, or hard to compare. This project turns that fragmented material into structured profiles, comparison tables, and curated news signals.

The repository itself is the publishing system. Provider profiles, news items, and compare definitions live in version-controlled JSON files under `src/content/`.

## Why It Exists

This site exists to make the expert network category easier to understand without requiring:

- sales calls
- marketplace sign-ups
- paid reports
- private access to provider materials

The goal is not to act as a broker or recommend a single vendor. The goal is to provide a clearer public research layer for a category that is usually opaque.

## What The Site Currently Includes

As verified in the current codebase on June 16, 2026, the site includes:

- 33 published provider profiles in `src/content/networks/`
- 63 published news signals in `src/content/news/`
- a compare experience with 6 default providers, 14 presets, 13 buyer pathways, explainable insights, and layered comparison views
- a network directory with search, filters, sort, compare selection, and grid/list views
- individual profile pages with shared summary structure and optional deep-dive sections
- an industry intelligence page with featured items, filters, and feed/signals views
- editorial pages including `about`, `sources`, `verification`, `privacy`, `disclaimer`, and category/buyer guides

## Who It Is For

- Researchers and analysts who want a structured view of the expert network market
- Buyers evaluating providers across pricing, compliance, coverage, and workflow fit
- Industry readers tracking product launches, partnerships, legal issues, and market signals
- Contributors and maintainers updating content or improving the site

## Trust Model And Limits

What the site does:

- compiles publicly available information
- labels information using explicit confidence and evidence framing
- links news items back to related providers
- organizes provider data into consistent fields for comparison

What the site does not do:

- broker expert calls
- sell placement in rankings
- operate a private CMS, dashboard, or backend workflow
- claim perfect completeness or real-time coverage
- replace legal, procurement, compliance, or investment advice

This repository is intentionally transparent about its limitations. Public-source research is useful, but some provider claims remain company-stated, estimated, or inferential.

## Tech Stack

- Astro 6
- Tailwind CSS 3, processed via PostCSS (`postcss.config.mjs`); the `@tailwind` directives live in `src/styles/global.css`
- Astro Content Collections with Zod validation in `src/content.config.ts` (`z` imported from `zod`)
- `@astrojs/sitemap` for sitemap generation
- plain browser JavaScript for interactive UI features, with compare logic shared in `src/lib/compare-v2.ts` and `src/scripts/compare-page.ts`

The current codebase does not use React components or Astro React islands.

## Architecture In Plain English

At build time, Astro reads JSON content from `src/content/`, validates it against the schemas in `src/content.config.ts`, renders pages from `src/pages/`, and outputs a static `dist/` directory.

At runtime, the site is just static HTML, CSS, images, and a small amount of page-specific JavaScript. There is no admin interface, no API layer, no request-time database, and no server-side editing workflow.

Most interactivity is page-local:

- `src/components/Header.astro` handles the global menu drawer and search overlay
- `src/pages/networks/index.astro` handles directory search, filters, sort, view toggle, and compare selection
- `src/pages/networks/[slug].astro` handles profile-side navigation and mobile drawer behavior
- `src/pages/compare.astro` server-renders the default Compare V2 state
- `src/lib/compare-v2.ts` is the shared compare view-model and HTML renderer
- `src/scripts/compare-page.ts` handles compare-page state, filters, URL sync, and modal interactions in the browser
- `src/pages/news/index.astro` handles intelligence filters and alternate view rendering

## Content Model

### Networks

Directory: `src/content/networks/*.json`

Each file represents one provider profile. These entries power:

- the homepage
- the directory page
- the individual profile page
- global search in the header
- compare-page provider data
- footer and marquee summaries

### News

Directory: `src/content/news/*.json`

Each file represents one curated signal or development. News entries power:

- the homepage news section
- the industry intelligence page
- related-news sections on provider profile pages

`relatedNetworks` creates the connection between a news item and one or more provider slugs.

### Compare Definitions

File: `src/content/compare.json`

This file defines:

- the default providers shown on `/compare`
- the preset comparison groups
- buyer pathways grouped by buyer type, workflow need, and regional/specialty use case
- explainable insights and recommendation-summary logic inputs
- the section and row structure for the compare matrix
- enriched compare-only fields such as provider type, substitute context, AI workflow capabilities, evidence labels, and tradeoff notes

## Local Development

Recommended local baseline: Node 22 (>=22.12.0), to match the GitHub Actions workflow and the Astro 6 engine requirement.

Install and run:

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run preview
npm run check
npm run verify:links
npm run verify
```

No environment variables are currently required for local development or static deployment.

## Validation And Verification

The main verification command is:

```bash
npm run verify
```

It runs:

1. `npm run build`
2. `npm run verify:links`
3. `npm run check`

What those checks cover:

- Astro build success
- content schema validation through Astro Content Collections
- internal `href` and `src` references in built `dist/` HTML via `scripts/verify-dist-links.mjs`
- Astro/TypeScript diagnostics through `astro check`

What they do not currently cover:

- cross-reference validation between `relatedNetworks` and network slugs beyond whatever the pages render
- editorial accuracy of content claims
- screenshot or visual regression testing

## Deployment Model

The site is built as static output in `dist/` and is suitable for static hosting.

This repository is currently wired to GitHub and Cloudflare Pages. The exact production branch should always be confirmed in Cloudflare Pages settings before assuming which branch push will update the live site.

Last verified operational state on June 16, 2026:

- GitHub default branch: `main`
- Cloudflare Pages preview branch: `main`
- Cloudflare Pages production branch: `claude/expert-network-sources-6oGs1`

The repo also includes a GitHub Actions workflow at `.github/workflows/verify.yml` (Node 22) that runs:

- `npm ci`
- `npm run build`
- `npm run verify:links`
- `npm run check`
- `npm audit --audit-level=high`

## Contribution Guidance

If you are updating content:

- keep slugs stable
- update `src/content.config.ts` before introducing new fields
- keep `relatedNetworks` aligned with real network slugs
- update `src/content/compare.json` if compare defaults or presets need to change
- run `npm run verify` before opening or merging a change

If you are updating code:

- preserve the static architecture unless there is an explicit decision to add runtime infrastructure
- do not reintroduce admin, API, or dashboard language unless the implementation actually exists
- keep compare rendering logic centralized in `src/lib/compare-v2.ts` and `src/scripts/compare-page.ts` instead of duplicating it back into `src/pages/compare.astro`
- be careful with browser-script selectors and `data-*` attributes, since much of the UI depends on them

## Repository Structure

```text
src/
  components/         Shared UI pieces such as header, footer, particle hero
  content/            Version-controlled JSON content
    compare.json      Compare defaults, presets, sections, enriched fields
    networks/         One JSON file per provider
    news/             One JSON file per signal
  content.config.ts   Zod-backed collection schemas
  lib/                Shared build-time helpers such as compare rendering
  layouts/            Shared page layout and metadata handling
  pages/              Public Astro routes
  scripts/            Bundled browser controllers such as compare-page.ts
scripts/
  verify-dist-links.mjs
.github/workflows/
  verify.yml
public/
  favicons, OG assets, robots.txt
```

## Troubleshooting

See `TROUBLESHOOTING.md` for concrete failure modes and fixes, including:

- content schema errors
- slug mismatches
- broken internal link checks
- static asset path issues
- Cloudflare Pages branch confusion

## Current State Of The Project

The current repository state is a static-only public site.

- There is no admin panel.
- There are no API endpoints.
- The compare page now uses a shared render helper plus a smaller client controller instead of one giant inline script.
- Query-string-specific compare selections still finalize client-side after load because the site is static and query params are not available at build time.
- The repo acts as the CMS.
- The compare, directory, news, and profile experiences all run on top of build-time JSON content plus page-local JavaScript.
- The docs and config in this repo were audited against the actual codebase on June 16, 2026.

## License And Attribution

No license file is currently included in this repository.

That means the repo is public, but it is not currently licensed as open source in the legal sense. If the intent is open-source collaboration, an explicit license should be added.
