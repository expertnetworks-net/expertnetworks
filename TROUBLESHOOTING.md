# Troubleshooting

Last verified against the repository: June 16, 2026

This guide only covers the current static-site architecture.

The repo no longer includes an admin panel, API routes, or environment-variable-based auth flow. If you see documentation or old notes referring to `/admin`, `/api/*`, or `ADMIN_PASSWORD`, treat them as stale.

## Install And Setup Problems

### `npm install` fails or produces incompatible dependency errors

Recommended baseline is Node 22 (>=22.12.0) to match `.github/workflows/verify.yml` and the Astro 6 engine requirement. Node 20 will no longer build the project.

Check:

```bash
node -v
npm -v
```

If your local Node version is far behind CI, switch to Node 22 and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

Only delete `package-lock.json` if you intend to regenerate it locally.

### `npm run dev` starts, but changes do not show up

Some changes require a full dev-server restart, especially:

- `src/content.config.ts`
- `tailwind.config.mjs`
- `astro.config.mjs`

Stop and restart:

```bash
npm run dev
```

## Validation And Build Failures

### `InvalidContentEntryDataError`

This means a JSON file in `src/content/networks/` or `src/content/news/` does not match the schema in `src/content.config.ts`.

Typical causes:

- a required field is missing
- an enum value is wrong
- a field type changed without a schema update
- a number was entered as a string

Fix process:

1. read the exact file and field named in the error
2. compare it against `src/content.config.ts`
3. update either the data or the schema
4. rerun `npm run verify`

### `astro check` fails after adding a new field

If a content field is new, add it to `src/content.config.ts` before using it in a page.

If a page expects `data.someField`, but the schema does not define it, TypeScript and Astro will complain.

### A provider or news item is missing from the built site

Check the `published` field in the corresponding JSON file.

If `published` is `false`, the item will be omitted from public pages and, for provider profiles, from static path generation.

## Cross-Reference Issues

### News item does not show up on the expected provider page

Check `relatedNetworks` in the news JSON file.

Every entry in `relatedNetworks` must match a real provider slug from `src/content/networks/*.json`.

Quick check:

```bash
rg -n '"slug": "your-provider-slug"' src/content/networks
```

### Compare preset or default provider is broken

Check `src/content/compare.json`.

Every slug in:

- `networks`
- `presets.*`
- any compare-driven assumptions in page code

must match a published provider slug.

If a provider was renamed, compare defaults and presets must be updated manually.

### Directory or news links look right in content, but behavior is wrong

The schema validates structure, but not every relationship. A build can still succeed if:

- `relatedNetworks` contains a typo
- compare presets reference a removed slug
- a page assumes a field exists but the content is only partially populated

When in doubt, check the rendered page in the browser after `npm run verify`.

## Internal Link Verification Problems

### `npm run verify:links` says `dist/ does not exist`

The link checker runs against built output, not source files.

Build first:

```bash
npm run build
npm run verify:links
```

Or run the full command:

```bash
npm run verify
```

### `npm run verify:links` reports a broken internal reference

The script in `scripts/verify-dist-links.mjs` checks `href` and `src` values in built HTML.

Common causes:

- wrong path in an `<a>` or `<img>`
- moved file under `public/`
- missing trailing `index.html` equivalent route
- broken asset reference in page markup

Fix process:

1. note the file and resolved path from the error output
2. confirm the target exists in `dist/` after build
3. trace back to the source page or component that emitted the bad link

## Static Asset And Path Issues

### Logo or image does not render

Check:

- the asset exists under `public/`
- the JSON or page points to the correct path
- filename case matches exactly

Static hosts and CI environments are case-sensitive even if your local machine is forgiving.

### OG image or favicon changes do not appear

These files are served from `public/`.

Check:

- the new file exists in `public/`
- `src/layouts/BaseLayout.astro` points to the correct asset
- your browser or CDN is not serving a cached copy

## Page-Level UI Problems

### Header search or menu drawer stops working

Check `src/components/Header.astro`.

This component contains inline JavaScript for:

- search overlay open/close
- menu drawer open/close
- search results rendering

Common breakage sources:

- changed DOM IDs
- changed element structure without updating selectors
- syntax error in the inline script

### Directory filters or compare selection stop working

Check `src/pages/networks/index.astro`.

That page owns:

- filter state
- search state
- view toggle
- compare tray state
- compare handoff to `/compare`

Pay attention to `data-*` attributes on rendered cards. Many filters rely on them.

### Profile sidebar or mobile drawer breaks

Check `src/pages/networks/[slug].astro`.

That page contains sidebar navigation and mobile-panel logic. It is easy to break by renaming DOM IDs or changing the profile layout structure.

### Compare page stops responding or URL behavior is wrong

Check all three compare files together:

- `src/pages/compare.astro`
- `src/lib/compare-v2.ts`
- `src/scripts/compare-page.ts`

The compare page manages:

- default provider state
- preset switching
- buyer pathways
- add/remove provider actions
- URL parameter normalization
- differences-only mode
- high-confidence filtering
- evidence-note filtering
- scroll-progress navigation

If compare behavior regresses, test both:

- a normal compare URL
- a single-provider URL such as `/compare?networks=alphasights`

If server-rendered HTML and client-side behavior disagree, `src/lib/compare-v2.ts` is the first place to inspect because it now provides the shared compare render logic for both.

### News filters or alternate view break

Check `src/pages/news/index.astro`.

That page owns:

- filter controls
- feed/signals view toggle
- featured signal rendering assumptions
- client-side data used by the alternate signals view

## Static Hosting And Deployment Problems

### Push succeeded, but the live site did not update

Do not assume GitHub default branch equals Cloudflare production branch.

Check Cloudflare Pages directly.

Questions to verify:

1. Which branch is configured as the production branch?
2. Did Cloudflare build the commit you expected?
3. Did you push to that branch, or only to `main`?

This is a known operational gotcha in the current repo history.

Last verified on June 16, 2026:

- GitHub default branch: `main`
- Cloudflare preview branch: `main`
- Cloudflare production branch: `claude/expert-network-sources-6oGs1`

### Local build works, but Cloudflare Pages fails

Check:

- Node version differences between local and CI/Pages. Astro 6 requires Node >=22.12.0; set `NODE_VERSION=22` in the Cloudflare Pages environment if the build fails on an older default.
- missing files under `public/` (including `_headers`, which Cloudflare applies for security headers and caching)
- content schema issues that only show up on a clean install
- whether `npm run verify` passes from a clean checkout

Cloudflare Pages expects a static build output from `astro build`.

## Environment Variable Confusion

### Do I need a `.env` file?

No, not for the current site.

The repo does not require environment variables for:

- `npm run dev`
- `npm run build`
- `npm run preview`
- static deployment

If you see instructions mentioning `.env`, `ADMIN_PASSWORD`, or auth tokens for app runtime, they are from removed workflows.

## Quick File Reference

| Issue | First file to inspect |
|---|---|
| Content schema mismatch | `src/content.config.ts` |
| Network content issue | `src/content/networks/*.json` |
| News content issue | `src/content/news/*.json` |
| Compare preset/default issue | `src/content/compare.json` |
| Global metadata or layout issue | `src/layouts/BaseLayout.astro` |
| Header search/menu issue | `src/components/Header.astro` |
| Directory UI issue | `src/pages/networks/index.astro` |
| Provider page UI issue | `src/pages/networks/[slug].astro` |
| Compare UI issue | `src/pages/compare.astro` |
| Compare render logic | `src/lib/compare-v2.ts` |
| Compare client interactions | `src/scripts/compare-page.ts` |
| News UI issue | `src/pages/news/index.astro` |
| Link verification behavior | `scripts/verify-dist-links.mjs` |
| CI verification behavior | `.github/workflows/verify.yml` |
