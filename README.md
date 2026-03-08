# ExpertNetworks.net

Independent, public-source research on expert networks.

Live site: [https://expertnetworks.net](https://expertnetworks.net)

## Overview

This repo powers a fully static Astro site that tracks expert network providers and industry developments. The repo is the CMS: network profiles, news signals, and comparison settings all live in version-controlled JSON under `src/content/`.

Current site scope:

- 33 provider profiles
- 52 curated news signals
- side-by-side compare experience with presets and diff mode
- supporting editorial pages such as methodology, privacy, disclaimer, and category explainers

## Stack

- Astro 5
- Tailwind CSS 3
- React 19 dependencies installed, but the public site is Astro-first and shipped as static HTML/CSS/JS
- Astro Content Collections with Zod validation
- `@astrojs/sitemap` for sitemap generation

## Architecture

- `src/content/networks/*.json`
  One file per provider profile.
- `src/content/news/*.json`
  One file per news signal.
- `src/content/compare.json`
  Compare defaults, presets, and section/row definitions.
- `src/content.config.ts`
  Schema validation for content collections.
- `src/pages/networks/index.astro`
  Directory with search, filters, sort, compare tray, and grid/list views.
- `src/pages/networks/[slug].astro`
  Individual profile pages.
- `src/pages/news/index.astro`
  Industry intelligence feed.
- `src/pages/compare.astro`
  Interactive comparison matrix.
- `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ParticleHero.astro`
  Shared site chrome and hero behavior.

There is no admin panel or API layer anymore. The production site is intentionally static.

## Local Development

```bash
npm install
npm run dev
```

Common commands:

- `npm run build`
  Build the static site into `dist/`.
- `npm run preview`
  Preview the production build locally.
- `npm run check`
  Run `astro check`.
- `npm run verify:links`
  Validate internal links in the built `dist/` output.
- `npm run verify`
  Run build, internal link verification, and Astro checks end to end.

No environment variables are currently required for the static site build.

## Content Workflow

### Add or update a network

1. Edit or create a JSON file in `src/content/networks/`.
2. Keep the schema aligned with `src/content.config.ts`.
3. Run `npm run verify`.

### Add or update a news signal

1. Edit or create a JSON file in `src/content/news/`.
2. Keep `relatedNetworks` aligned with existing provider slugs.
3. Run `npm run verify`.

### Update compare behavior

1. Edit `src/content/compare.json`.
2. Run `npm run verify`.

## Deployment

The site builds to static assets in `dist/` and is suitable for Cloudflare Pages or any other static host.

This repo now includes a GitHub Actions workflow at `.github/workflows/verify.yml` that runs on push and pull request:

- `npm ci`
- `npm run build`
- `npm run verify:links`
- `npm run check`

## Notes

- The site is designed around static hosting and Git-based publishing.
- If Cloudflare Pages is wired to the repo’s default branch, pushing to that branch is the deploy path.
- Large public pages are intentionally interactive, so payload size should be watched when adding new client-side data or duplicated markup.
