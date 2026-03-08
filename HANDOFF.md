# Handoff

Last verified against the repository: March 8, 2026

## Project Snapshot

ExpertNetworks.net is a static Astro site that publishes expert network research from JSON content stored in Git.

Current verified scope:

- 33 published provider profiles
- 52 published news signals
- compare page with 6 default providers, 14 presets, 13 buyer pathways, explainable insights, and layered compare views
- public editorial pages for methodology, verification, privacy, disclaimer, and category guides

There is no admin panel, no API layer, and no runtime editing workflow in the current codebase.

## The Files That Matter Most

### Content and schemas

- `src/content.config.ts`
  Source of truth for content schema validation.
- `src/content/networks/*.json`
  One file per provider profile.
- `src/content/news/*.json`
  One file per news signal.
- `src/content/compare.json`
  Compare defaults, presets, sections, and enriched compare metadata.

### Public pages

- `src/pages/index.astro`
- `src/pages/networks/index.astro`
- `src/pages/networks/[slug].astro`
- `src/pages/compare.astro`
- `src/pages/news/index.astro`
- `src/lib/compare-v2.ts`
- `src/scripts/compare-page.ts`

### Shared site chrome

- `src/layouts/BaseLayout.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/ParticleHero.astro`
- `src/components/TrackedNetworksMarquee.astro`

### Verification and deploy-related files

- `scripts/verify-dist-links.mjs`
- `.github/workflows/verify.yml`
- `astro.config.mjs`
- `public/robots.txt`

## How To Safely Update Content

### Update a provider profile

1. Edit the matching file in `src/content/networks/`.
2. Keep the slug stable unless you are prepared to update every reference to it.
3. If you add a new field, update `src/content.config.ts` first.
4. If the provider is part of compare defaults or presets, check `src/content/compare.json`.
5. Run `npm run verify`.

### Add a new provider

1. Create a new JSON file in `src/content/networks/`.
2. Add every required schema field.
3. Confirm the slug is unique.
4. Decide whether the provider should appear in compare presets, homepage treatments, or footer shortcuts.
5. Run `npm run verify`.

### Update a news signal

1. Edit or create a JSON file in `src/content/news/`.
2. Keep `relatedNetworks` aligned with real provider slugs.
3. Confirm date formatting and enum values match the schema.
4. Run `npm run verify`.

### Update compare behavior

1. Edit `src/content/compare.json`.
2. Keep all referenced slugs aligned with published provider files.
3. If the change affects rendering or interaction logic, update `src/lib/compare-v2.ts` and `src/scripts/compare-page.ts` instead of re-adding large inline logic to `src/pages/compare.astro`.
4. Check presets, buyer pathways, explainable insights, and section rows after the change.
5. Run `npm run verify`.

## High-Risk Areas

### Slug relationships

The most failure-prone relationship in the repo is slug consistency across:

- `src/content/networks/*.json`
- `src/content/news/*.json` via `relatedNetworks`
- `src/content/compare.json`

Schema validation will not catch every bad cross-reference.

### Inline page scripts

Large parts of the public UI rely on inline browser scripts inside:

- `src/pages/networks/index.astro`
- `src/pages/networks/[slug].astro`
- `src/pages/compare.astro`
- `src/pages/news/index.astro`
- `src/components/Header.astro`

Small DOM or ID changes can break runtime behavior even if the build still passes.

### Compare page

The compare experience is split across:

- `src/pages/compare.astro`
- `src/lib/compare-v2.ts`
- `src/scripts/compare-page.ts`
- `src/content/compare.json`

Changes to:

- URL parameter handling
- presets
- buyer pathways
- explainable insights
- section structure
- enriched compare fields
- server-rendered default compare state
- scroll-nav behavior

need careful regression testing.

### Base layout and metadata

`src/layouts/BaseLayout.astro` controls global metadata, canonical URLs, JSON-LD, and shared page behavior. Regressions here affect the whole site.

## Validation Workflow

Standard maintainer check:

```bash
npm install
npm run verify
```

What `npm run verify` covers:

- static build success
- content schema validation
- internal link and asset reference checks against `dist/`
- Astro/TypeScript diagnostics

What it does not cover:

- editorial correctness
- visual regressions
- all cross-file slug relationships

If compare changed, also do a quick browser pass on `/compare` covering:

- preset or pathway switching
- `Differences only`
- `High-confidence rows`
- add/remove provider flow
- a single-provider URL such as `/compare?networks=alphasights`

## What To Check Before Publishing

- Build passes with `npm run verify`
- New or changed slugs are reflected wherever referenced
- Compare presets still point to real published providers
- News items link to the correct provider pages
- New logo or image paths exist under `public/`
- Page titles and descriptions still make sense if a core page changed
- Cloudflare Pages is watching the branch you expect

## Deployment Expectations

This project is deployed as a static site.

Current operational reality, verified on March 8, 2026:

- GitHub default branch is `main`
- Cloudflare Pages preview branch is `main`
- Cloudflare Pages production branch is `claude/expert-network-sources-6oGs1`

Do not assume that changing the GitHub default branch automatically changes Cloudflare production.

Always verify:

1. which branch Cloudflare Pages treats as production
2. whether the latest commit on that branch has deployed

## Known Constraints

- No environment variables are required for the current site
- No admin or dashboard workflow exists
- No request-time data mutations are possible in production
- No license file is currently present in the repo
- The site uses static hosting assumptions everywhere

## What Not To Break

- `src/content.config.ts` alignment with JSON content
- slug consistency across content files
- compare presets and compare section structure
- compare render consistency between `compare.astro`, `compare-v2.ts`, and `compare-page.ts`
- header search and menu behavior
- provider-directory filtering and compare selection
- provider-page sidebar navigation
- news filters and related-provider links
- metadata generation in `BaseLayout`

## How Networks, News, And Compare Interrelate

### Networks

The network collection is the anchor dataset. Other systems reference provider slugs from it.

### News

News signals attach to provider pages through `relatedNetworks`. If a slug is wrong, the article will not surface where expected.

### Compare

Compare uses both:

- base provider fields from the network JSON files
- compare-specific enriched metadata from `src/content/compare.json`
- a shared render helper in `src/lib/compare-v2.ts`

Adding a provider to compare often means touching both datasets.

## Recommended Maintainer Habits

- Prefer small content diffs over sweeping schema changes
- Keep docs aligned with code when architecture changes
- Avoid adding aspirational workflow language that the repo does not implement
- If a change adds runtime assumptions, call that out explicitly as an architecture change
