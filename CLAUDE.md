# CLAUDE.md — ExpertNetworks Hub Context

Last verified against codebase: March 8, 2026

## What This Repo Is

- Static Astro site for [https://expertnetworks.net](https://expertnetworks.net)
- Version-controlled JSON content, no database
- Git-based publishing workflow
- No admin panel or runtime CRUD layer

## Working Rules

1. Treat the repo as the CMS. Content changes should happen in `src/content/`.
2. Do not invent new content fields without updating `src/content.config.ts`.
3. Run `npm run verify` after meaningful code changes.
4. Keep the site static. Do not reintroduce server-only editing paths unless explicitly requested.
5. Be careful with content integrity. Profiles and signals are editorial assets, not generated placeholders.

## Core Files

### Content

- `src/content/networks/*.json`
  Provider profiles.
- `src/content/news/*.json`
  News signals.
- `src/content/compare.json`
  Compare defaults, presets, and row structure.
- `src/content.config.ts`
  Content schemas.

### Main pages

- `src/pages/index.astro`
  Homepage.
- `src/pages/networks/index.astro`
  Directory with filters, compare tray, and grid/list toggle.
- `src/pages/networks/[slug].astro`
  Provider profile pages.
- `src/pages/news/index.astro`
  Intelligence feed.
- `src/pages/compare.astro`
  Side-by-side comparison matrix.
- `src/pages/about.astro`
- `src/pages/sources.astro`
- `src/pages/privacy.astro`
- `src/pages/disclaimer.astro`
- `src/pages/verification.astro`

### Shared layout/components

- `src/layouts/BaseLayout.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/ParticleHero.astro`
- `src/components/TrackedNetworksMarquee.astro`

## Build and Verification

Use these commands:

```bash
npm run build
npm run check
npm run verify:links
npm run verify
```

`npm run verify` is the standard pre-merge check.

## Implementation Notes

- Most interactivity is inline browser JS inside `.astro` files.
- The compare page is driven by `src/content/compare.json` plus provider content from `src/content/networks/`.
- The directory page now server-renders one primary view and renders the alternate list view client-side to avoid duplicate HTML.
- The news page keeps the feed SSR and uses a smaller client data payload for alternate card rendering.

## Common Pitfalls

1. Network slugs must stay consistent across `src/content/networks/`, `src/content/news/relatedNetworks`, and `src/content/compare.json`.
2. Rich profile fields are part of the content schema and should not be dropped during refactors.
3. The compare page is sensitive to payload size because it ships client-side provider data.
4. The site is static-first; changes that depend on request-time cookies, file writes, or server sessions are the wrong default.

## Deployment Context

- The project is deployed as a static site.
- The user’s current GitHub default/deploy branch is `claude/expert-network-sources-6oGs1`.
- If branch strategy changes, verify what Cloudflare Pages is actually tracking before automating release assumptions.
