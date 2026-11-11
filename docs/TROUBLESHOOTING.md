# Troubleshooting

This file owns: symptoms, their causes, and their corrections.

Each entry has the same structure: symptom, cause, correction.
Background information is in [`ARCHITECTURE.md`](ARCHITECTURE.md), [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md), and [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Quick index

| Symptom | First file to examine |
|---|---|
| Build fails with a content error | The JSON file in the error message, then `src/content.config.ts` |
| A provider or news item is absent from the site | The `published` field of its JSON file |
| A news item is absent from a provider page | `relatedNetworks` in the news file |
| Compare page shows a wrong or empty provider | `src/content/compare.json` |
| Compare page does not respond | `src/scripts/compare-page.ts`, `src/lib/compare-v2.ts`, `src/pages/compare.astro` |
| Search overlay or menu drawer does not work | `src/components/Header.astro` |
| Directory filters do not work | `src/pages/networks/index.astro` |
| Provider page side navigation does not work | `src/pages/networks/[slug].astro` |
| News filters do not work | `src/pages/news/index.astro` |
| Wrong title, description, or canonical URL | `src/layouts/BaseLayout.astro` and the page file |
| Link check fails | `scripts/verify-dist-links.mjs` output, then the source page |
| Live site did not change after a push | [`DEPLOYMENT.md`](DEPLOYMENT.md), section 1 |
| CI fails at the audit step | [`DEPLOYMENT.md`](DEPLOYMENT.md), section 7 |
| `Cloudflare Pages` check fails on a feature branch | [`DEPLOYMENT.md`](DEPLOYMENT.md), section 8.1 |
| A resource is blocked on the live site only | `public/_headers` |

## Install and local setup

### `npm ci` or `npm run build` fails with a Node version error

- Cause: the local Node version is lower than `engines.node` in `package.json`.
- Correction:
  1. Run `node -v`.
  2. Install the version in `.node-version`. With nvm: `nvm install && nvm use`.
  3. Run `npm ci` again.

### Changes do not show in `npm run dev`

- Cause: the dev server does not always reload after a change to a config file.
- Applicable files: `src/content.config.ts`, `tailwind.config.mjs`, `postcss.config.mjs`, `astro.config.mjs`.
- Correction: stop the dev server and start it again.

### Is a `.env` file necessary?

No. The site uses no environment variables.

## Build and validation

### Build fails with `InvalidContentEntryDataError`

- Cause: a JSON file in `src/content/networks/` or `src/content/news/` does not agree with the schema.
- Usual causes: a required field is absent, an enum value is wrong, or a number is written as a string.
- Correction:
  1. Read the file name and the field name in the error message.
  2. Compare the field with `src/content.config.ts` or with the tables in [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md).
  3. Correct the data. Change the schema only if the new shape is intended.
  4. Run `npm run verify`.

### Build fails with a JSON syntax error

- Cause: a content file is not valid JSON. A trailing comma is the usual cause.
- Correction: run `node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))"` to find the position.

### `npm run check` fails after a new field is used in a page

- Cause: the page reads `data.<field>`, but the schema does not define the field.
- Correction: add the field to `src/content.config.ts`. See [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md), section 9.

### `npm run verify:links` reports `dist/ does not exist`

- Cause: the link check reads the build output.
- Correction: run `npm run build` first, or run `npm run verify`.

### `npm run verify:links` reports a broken internal reference

- Cause: an `href` or `src` value in the built HTML does not resolve to a file in `dist/`.
- Usual causes: a wrong path, a file that was moved or renamed in `public/`, or a link to a route that does not exist.
- Correction:
  1. Read the three values in the report: the HTML file, the reference, and the resolved path.
  2. Find the reference in the source: `grep -rn '<reference>' src`.
  3. Correct the path, or add the file that is absent.

## Content

### A provider or news item is absent from the site

- Cause: `published` is `false` in the JSON file.
- Correction: set `published` to `true`. For a provider, this also creates its page.

### A news item is absent from a provider page

- Cause: `relatedNetworks` does not contain the provider slug, or contains a slug with a typing error.
- Correction:
  1. Run `node .github/scripts/check-slugs.mjs`.
  2. Correct the slug in the news file.

### The build passes, but a reference is wrong

- Cause: the schema does not check cross-file references.
- Correction: run `node .github/scripts/check-slugs.mjs`. It reports unknown slugs in news files and in `src/content/compare.json`.

### A logo or image does not show

- Causes:
  - The file is not in `public/`.
  - The `logo` path does not start with `/`.
  - The file name has different letter case. Linux, CI, and Cloudflare Pages are case-sensitive.
- Correction: run `node .github/scripts/check-slugs.mjs` for logos. For other images, compare the path with `ls public/images`.

### A new favicon or Open Graph image does not show

- Causes: the browser or the CDN has a cached copy, or `src/layouts/BaseLayout.astro` refers to a different file.
- Correction: examine the path in `BaseLayout.astro`. Then examine the response with `curl -sI <url>`. The cache times are in `public/_headers`.

## Compare page

### A provider is absent from the compare page or from a preset

- Causes: the slug in `src/content/compare.json` is wrong, or the provider is not published.
- Correction: run `node .github/scripts/check-slugs.mjs`.

### Rows are empty for one provider

- Cause: the provider has no entry in `enriched` in `src/content/compare.json`, or it has no `comparison` object in its provider file.
- Correction: add the absent data. See [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md), section 8.

### The page does not respond, or the URL does not update

- Cause: a selector in `src/scripts/compare-page.ts` does not find its element. The usual reason is a renamed `id` or class in `src/pages/compare.astro` or in the HTML from `src/lib/compare-v2.ts`.
- Correction:
  1. Open the browser console and read the first error.
  2. Compare the `getElementById` and `querySelectorAll` calls in `src/scripts/compare-page.ts` with the markup.
  3. Correct the name on one side.

### Browser checks after a change to the compare page

Do these checks in `npm run dev` or `npm run preview`. No automated test does them.

1. Open `/compare`. The default providers show. The console has no errors.
2. Click a goal button. The providers change. The URL gets a `networks=` parameter.
3. Remove a provider. The count decreases. You cannot go below 2 providers.
4. Add a provider with the dialog. Press Escape in the dialog: it closes.
5. With 5 providers, add one more. A message says which provider was removed.
6. Open `/compare?networks=alphasights`. The default providers and AlphaSights show.
7. Open `/compare?networks=glg,alphasights`. Only these two providers show.
8. Reload the page. The selection stays.

## Other pages

### Search overlay or menu drawer does not work

- File: `src/components/Header.astro`.
- Usual causes: a changed element `id`, changed markup that the script expects, or a syntax error in the inline script.
- Correction: read the first console error. Compare the selectors in the script with the markup.

### The page does not scroll after navigation

- Cause: an overlay left a scroll lock on `body`.
- File: the shared script at the end of `src/layouts/BaseLayout.astro` removes the lock on page load. Make sure that it still runs.

### Directory filters, list view, or compare selection do not work

- File: `src/pages/networks/index.astro`.
- Usual cause: the filters read `data-*` attributes on the provider cards. A changed attribute name breaks a filter.
- Note: the list view is made in the browser from the `#directoryData` JSON element.

### Provider page side navigation or mobile panel does not work

- File: `src/pages/networks/[slug].astro`.
- Usual cause: a changed section `id`. The navigation links refer to section `id` values.

### News filters or the signals view do not work

- File: `src/pages/news/index.astro`.
- Usual cause: a changed `data-*` attribute on a news item, or a changed shape of the `#newsClientData` JSON element.

## Deployment

### The live site did not change after a push

- Cause: the push went to `main` or to a feature branch. Only the production branch deploys.
- Correction: read [`DEPLOYMENT.md`](DEPLOYMENT.md), sections 1 and 5.

### The local build passes, but the Cloudflare Pages build fails

- On a feature branch: this is a known open issue. See [`DEPLOYMENT.md`](DEPLOYMENT.md), section 8.1.
- On the production branch, examine these causes:
  1. The Node version. See [`DEPLOYMENT.md`](DEPLOYMENT.md), section 3.
  2. A file name with different letter case.
  3. A file that is not committed. Run `git status`.
  4. A build that passes only with old local files. Run `rm -rf node_modules dist .astro && npm ci && npm run verify`.

### A script, font, or image is blocked on the live site only

- Cause: the CSP in `public/_headers`. Cloudflare Pages applies it. The local servers do not.
- Correction: read the CSP error in the browser console. Then obey the rules in [`SECURITY.md`](SECURITY.md), section 2.

### CI fails at the audit step with no code change

- Cause: a new advisory was published for a dependency.
- Correction: [`DEPLOYMENT.md`](DEPLOYMENT.md), section 7.
