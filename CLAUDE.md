# CLAUDE.md

Repository guidance for AI-assisted edits.

Last verified against the codebase: March 8, 2026

## Repo Truths

- This is a static Astro site for [https://expertnetworks.net](https://expertnetworks.net).
- The repo itself is the CMS.
- Content lives in JSON under `src/content/`.
- There is no admin panel, no API surface, and no runtime content-editing workflow in the current repo.
- The codebase does not currently use React components or React islands.

Do not invent features that are not implemented.

## Non-Negotiable Rules

1. Treat `src/content.config.ts` as the source of truth for content shape.
2. Do not add content fields without updating the schema.
3. Do not describe the project as SSR, API-driven, or CMS-backed unless that architecture is actually added.
4. Do not reintroduce admin/dashboard language into docs or code comments.
5. Run `npm run verify` after meaningful code or content changes.

## Core Content Model

### Providers

- Files: `src/content/networks/*.json`
- One file per provider profile
- Used by homepage, directory, provider pages, compare page, global search, footer, and marquee

### News

- Files: `src/content/news/*.json`
- One file per signal
- Used by homepage, `/news`, and related-news sections on provider pages
- `relatedNetworks` must reference real provider slugs

### Compare

- File: `src/content/compare.json`
- Controls default providers, presets, compare sections, and enriched compare-only fields

## Page Ownership

- `src/pages/index.astro`
  Homepage and hero behavior
- `src/pages/networks/index.astro`
  Directory filtering, search, view toggle, compare selection
- `src/pages/networks/[slug].astro`
  Provider profile rendering, sidebar navigation, related news
- `src/pages/compare.astro`
  Compare matrix, preset logic, URL sync, differences-only mode
- `src/pages/news/index.astro`
  Intelligence feed, filters, alternate view rendering

## Shared Layout And Components

- `src/layouts/BaseLayout.astro`
  Global metadata, layout chrome, JSON-LD, shared browser behavior
- `src/components/Header.astro`
  Navigation, search overlay, drawer
- `src/components/Footer.astro`
  Footer navigation and counts
- `src/components/ParticleHero.astro`
  Reusable dark header effect
- `src/components/TrackedNetworksMarquee.astro`
  Homepage provider marquee

## Implementation Notes

- Most interactivity is inline browser JavaScript inside `.astro` files.
- This is not a SPA. Navigation is normal page navigation.
- Build-time content validation is strong; cross-file slug validation is still partly a maintainer responsibility.
- The compare page is the most stateful public page and easiest to regress.

## Common Pitfalls

1. Slugs must stay consistent across network files, news `relatedNetworks`, and compare presets/defaults.
2. A build can succeed even if a cross-reference is logically wrong.
3. Inline-script regressions often come from changing DOM IDs or `data-*` attributes without updating selectors.
4. Static asset paths under `public/` must match exactly, including filename case.
5. If architecture changes, docs must be updated in the same pass.

## Validation Commands

```bash
npm run build
npm run check
npm run verify:links
npm run verify
```

Use `npm run verify` as the default pre-merge check.

## Deployment Context

- GitHub default branch is `main`.
- Cloudflare Pages production branch should be verified directly before assuming a push will update the live site.
- The site is static and should stay static unless there is an explicit architecture change.

## Editing Guidance For AI Agents

- Prefer precise, source-grounded edits over broad rewrites.
- When rewriting docs, verify claims against code first.
- When changing content, preserve editorial tone and field semantics.
- When unsure, describe current behavior rather than future intent.
