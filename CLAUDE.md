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
- Controls default providers, presets, buyer pathways, explainable insights, compare sections, and enriched compare-only fields

## Page Ownership

- `src/pages/index.astro`
  Homepage and hero behavior
- `src/pages/networks/index.astro`
  Directory filtering, search, view toggle, compare selection
- `src/pages/networks/[slug].astro`
  Provider profile rendering, sidebar navigation, related news
- `src/pages/compare.astro`
  Compare page shell and server-rendered default compare state
- `src/lib/compare-v2.ts`
  Shared compare view-model and HTML renderer
- `src/scripts/compare-page.ts`
  Compare-page client controller for filters, modal actions, and URL sync
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

- Most interactivity is inline browser JavaScript inside `.astro` files, but the compare page now uses a shared helper plus a bundled client script.
- This is not a SPA. Navigation is normal page navigation.
- Build-time content validation is strong; cross-file slug validation is still partly a maintainer responsibility.
- The compare page is the most stateful public page and easiest to regress.
- Because the site is static, query-string-specific compare selections still resolve in the browser after load. Do not describe that as SSR.

## Common Pitfalls

1. Slugs must stay consistent across network files, news `relatedNetworks`, and compare presets/defaults.
2. A build can succeed even if a cross-reference is logically wrong.
3. Inline-script regressions often come from changing DOM IDs or `data-*` attributes without updating selectors.
4. Static asset paths under `public/` must match exactly, including filename case.
5. If architecture changes, docs must be updated in the same pass.
6. Keep compare rendering logic centralized in `src/lib/compare-v2.ts`; do not recreate a giant inline compare script in `src/pages/compare.astro`.

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
- Cloudflare Pages preview branch is `main`.
- Cloudflare Pages production branch is currently `claude/expert-network-sources-6oGs1` and should still be verified directly before assuming a push will update the live site.
- The site is static and should stay static unless there is an explicit architecture change.

## Editing Guidance For AI Agents

- Prefer precise, source-grounded edits over broad rewrites.
- When rewriting docs, verify claims against code first.
- When changing content, preserve editorial tone and field semantics.
- If you change compare behavior, keep `src/pages/compare.astro`, `src/lib/compare-v2.ts`, `src/scripts/compare-page.ts`, and `src/content/compare.json` aligned.
- If compare changed materially, run `npm run verify` and do a quick browser pass on `/compare`.
- When unsure, describe current behavior rather than future intent.
