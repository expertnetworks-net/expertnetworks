# Security

This file owns: the security posture of the site, the rules for `public/_headers`, and the audit history.

Related owners:

- CI audit step and dependency update procedure: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- Post-deploy header checks: [`DEPLOYMENT.md`](DEPLOYMENT.md), section 5

## 1. Security model

The site is static. This fact defines the attack surface.

| Item | Status |
|---|---|
| Server code, API, database | None. |
| User input sent to a server | None. No forms post data. |
| Authentication, cookies, sessions | None. |
| Secrets and environment variables | None in the repository. None necessary for the build. |
| Browser storage | `localStorage` holds UI state for the menu drawer. The `/privacy` page states this. |
| Third-party requests from the browser | Defined by the CSP in `public/_headers`. |

The remaining risks are:

1. **Supply chain.** A compromised or vulnerable npm package can affect the build output or a developer machine.
2. **Content integrity.** A wrong or invented fact about a real company. See the sourcing rule in [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md).
3. **Unintended deploy.** A push to `main` publishes immediately. See [`DEPLOYMENT.md`](DEPLOYMENT.md).
4. **Header regression.** A change to `public/_headers` can weaken the CSP or block a necessary resource.

## 2. Headers and CSP

`public/_headers` is the source of truth. This file does not repeat the header values or the permitted origins.
Read `public/_headers` for the current policy. The comments in that file give the reason for each CSP entry.

What the file does:

- Sets a Content-Security-Policy, HSTS, and other security headers on all paths.
- Sets long cache times for fingerprinted assets in `/_astro/` and for images and icons.

Facts that are not visible in the repository:

- Cloudflare Pages applies `public/_headers`. The file has no effect in `npm run dev` or `npm run preview`.
- Cloudflare Web Analytics is added to pages at the edge. Its script origin and its reporting origin must stay in the CSP. If you remove them, the browser silently blocks analytics.
- The CSP permits inline scripts and inline styles. Astro puts small scripts and JSON data blocks inline, and some elements have `style` attributes. A stricter policy needs code changes first.

Rules for a change to `public/_headers`:

1. When you add an external script, style, font, image host, or embed, add its origin to the CSP in the same commit.
2. When you remove an external resource, remove its origin from the CSP in the same commit.
3. Do not remove the Cloudflare Web Analytics origins.
4. After the deploy, do steps 9 and 11 of the deploy procedure in [`DEPLOYMENT.md`](DEPLOYMENT.md).

Show the live headers:

```bash
curl -sI https://expertnetworks.net/
```

## 3. Dependency advisories

- CI fails on each advisory of severity high or critical.
- Advisories accumulate with time. Routine updates are necessary. The procedure is in [`DEPLOYMENT.md`](DEPLOYMENT.md), section 7.
- `package.json` contains an `overrides` block. It forces patched versions of transitive build-tool packages. Remove an override only when `npm audit` stays clean without it.
- The advisories found in the audits below affected build and dev tooling. None was exploitable on the deployed static site.

Show the current state:

```bash
npm audit
```

## 4. How to do an audit

1. Run `npm ci`.
2. Run `npm run verify`.
3. Run `npm audit`.
4. Run `node .github/scripts/check-slugs.mjs`.
5. Run `curl -sI https://expertnetworks.net/` and compare the headers with `public/_headers`.
6. Open `/`, `/compare`, `/networks`, and `/news` on the live site. Look for CSP errors in the browser console.
7. Add an entry to section 5 with the date, the results, and the changes.

## 5. Audit history

Newest first. Each entry records the state at that date. Do not use an entry as a source of current facts.

### 2026-11-11

| Check | Result |
|---|---|
| Live site | HTTP 200 on the primary routes. Security headers present. |
| `npm run verify` | Pass. |
| Slug references, logo paths, news dates | All valid. |
| `npm audit` before the changes | 15 advisories: 1 critical, 12 high, 2 moderate. No code change since June caused them. |
| `npm audit` after the changes | 0 advisories. |

Changes:

1. Upgraded Astro by one major version, because the earlier major line had no patched release. This raised the minimum Node version. No source changes were necessary. A headless-browser comparison with the live site found no differences.
2. Updated patch versions of direct and transitive dependencies.
3. Corrected the CSP. The June policy blocked the Cloudflare Web Analytics script. Analytics data was lost from June to November 2026.

Commit: `6e847e3`.

### 2026-06-16

| Check | Result |
|---|---|
| `npm run verify` | Pass. |
| Slug references, required directory fields, news dates | All valid. |
| `npm audit` before the changes | 17 advisories. |
| `npm audit` after the changes | 0 advisories. |
| Live site | HTTP 200. No security headers before this audit. |

Changes:

1. Added `public/_headers`. Before this date, the live site sent no CSP, HSTS, `X-Frame-Options`, or `Permissions-Policy` header.
2. Added cache rules for `/_astro/*`, images, and icons.
3. Removed unused code in `src/components/Header.astro` and `src/components/VsComparison.astro`. Marked JSON data `<script>` blocks as `is:inline`.
4. Upgraded Astro by one major version. Removed the `@astrojs/tailwind` integration and moved Tailwind CSS v3 to PostCSS (`postcss.config.mjs`). The visual output did not change.
5. Changed the Zod import in `src/content.config.ts` to the `zod` package. Added `zod` as a direct dependency.
6. Added the `overrides` block in `package.json` for `esbuild` and `yaml`.

Commits: `a194a9c`, `184145e`, `afa1410`.

### 2026-03-11

A product audit made a list of 35 defects and improvements. Commit `e026392` applied the corrections.
The list is in [`archive/AUDIT-EXECUTION-PLAN.md`](archive/AUDIT-EXECUTION-PLAN.md). It is not a security audit.

## 6. Open items

| Item | Detail |
|---|---|
| HSTS preload | The HSTS header includes `preload`. No record shows that the domain was submitted to hstspreload.org. |
| Inline scripts in the CSP | The CSP permits inline scripts and styles. See section 2. |
| Slug check not in CI | `.github/scripts/check-slugs.mjs` runs only locally. |
