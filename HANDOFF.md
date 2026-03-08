# Handoff Document

Last updated: March 8, 2026

## Current State

The site is **production-ready** for static deployment. All core features are built, SEO is fully implemented, and content has been editorially audited.

### What's Live

- **33 network profiles** — all published, 6 featured (GLG, AlphaSights, Third Bridge, Guidepoint, AlphaSense/Tegus, Dialectica)
- **52 news signals** — curated from press releases, industry reports, and news coverage with V2 intelligence features (significance tiers, source types, "Why it matters" editorial context, impact tags, trending analysis)
- **5 rich profiles** with deep-dive accordions, timelines, source notes, and confidence badges (GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica)
- **Comparison table** with 7 presets (Leaders, Consulting, PE, Enterprise, Asia, AI, Library) across 6 evaluation sections
- **Full SEO suite** — sitemap, robots.txt, OG tags, Twitter Cards, JSON-LD, canonical URLs, unique descriptions
- **Custom 404 page** and **verification methodology page**
- **Admin panel** — 7 pages + 6 API endpoints, functional in dev mode only

### What Was Done (March 2026)

1. **News V2 intelligence desk** — Redesigned news feed from flat list to intelligence-desk layout:
   - "What Matters Now" featured signals section with editorial "Why it matters"
   - Significance tiers: major (10), standard (32), brief (11)
   - Source type badges: Press Release, Industry Report, News Coverage, Regulatory, Product Update
   - Impact tags and trending sidebar (90-day category breakdown)
   - Dual view: featured signals + full chronological feed/grid
2. **Two-pass news accuracy audit** — Editorial review of all 52 signals:
   - Fixed dates, tightened attribution, reframed editorial claims as hedged observations
   - Removed entries that were market-status inferences rather than discrete events
   - Added methodology disclaimers where sources use different counting methodologies
   - Corrected "Why it matters" sections that mischaracterized deal theses (e.g., Carousel acquisition)
   - Softened sourcing claims where only secondary sources exist (e.g., Capvision IPO)
3. **SEO implementation** — @astrojs/sitemap, robots.txt, Open Graph, Twitter Cards, canonical URLs, JSON-LD structured data, unique meta descriptions
4. **Stuck loading bug fix** — overlays setting `overflow: hidden` on `<body>` without clearing; fixed with safety-net reset and close-before-navigate handlers
5. **Security fix** — search results innerHTML XSS risk eliminated with `escapeHtml()`
6. **Performance** — `loading="lazy"` on all below-fold images, passive scroll listeners, font preconnect
7. **Deep research profiles** — GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica with confidence badges, source notes, extended fields
8. **Custom 404 page** and **verification methodology page**
9. **Full documentation audit** — all docs rewritten from scratch against verified codebase

## Critical Files

| File | What It Controls | Risk If Modified Incorrectly |
|---|---|---|
| `src/content.config.ts` | Zod schemas for all content | Build fails if schema doesn't match JSON |
| `src/content/networks/*.json` | Network data (33 files) | Content errors, missing profiles |
| `src/content/news/*.json` | News signals (52 files) | Content errors, missing signals |
| `src/content/compare.json` | Comparison table config | Broken comparison page, invalid presets |
| `src/middleware.ts` | Auth protection for admin/API | Security bypass if weakened |
| `src/layouts/BaseLayout.astro` | SEO tags, overflow reset, animations | SEO regression, stuck-page bug |
| `src/components/Header.astro` | Navigation, search, menu | Site-wide navigation failure |
| `astro.config.mjs` | Build mode, sitemap, integrations | Build failure, missing sitemap |

## Content Coverage

### Networks by Profile Depth

**Rich profiles (5 — full deep-dive with accordions, timelines, confidence badges):**
- GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica

**Basic profiles (28 — summary + services + compliance):**
- All other networks

### Networks by Region

- **US-based:** GLG, AlphaSights (also London), Guidepoint, Coleman Research, NewtonX, Maven, Zintro, Stax, Ridgetop, Silverlight, Mainstreet, Raven, Mosaic
- **UK-based:** Third Bridge, Prosapient, Techspert
- **Europe:** Dialectica (Montreal HQ, Greek origins), Atheneum (Berlin), Emerton (Paris)
- **Asia:** Capvision (Shanghai), VisasQ (Tokyo), Lynk (Hong Kong)
- **Other:** Astute Connect (India), OnFrontiers (DC, emerging markets focus)

### Logo Coverage

11 of 33 networks have logo PNGs in `public/images/networks/`. The remaining 22 use gradient placeholders generated from their `gradientFrom`/`gradientTo` colors.

### Content Gaps

1. **28 networks** still need rich profiles (deep-dive research like GLG/AlphaSights/Third Bridge)
2. **INEX ONE** is listed as a meta-platform but could use a more detailed breakdown
3. **22 networks missing logos** — they use gradient placeholders
4. **News coverage skewed** toward larger networks — smaller/boutique networks have little or no coverage
5. **Some news signals** still have secondary sourcing (Capvision IPO details from industry summaries rather than primary HKEX filings)

## Known Limitations

1. **Admin panel is dev-mode only** — API endpoints (POST routes) don't work in static build. Options:
   - Run admin locally, edit JSON files, rebuild and deploy
   - Add a headless CMS (Tina, Decap)
   - Switch to Astro hybrid/SSR mode with the Node adapter
2. **No real-time news** — signals are manually curated JSON files, not auto-fetched
3. **No analytics** — no tracking (intentional, privacy-first approach)
4. **OG image is SVG** — Facebook/LinkedIn may not render SVG og:images; convert to 1200x630 PNG for better sharing
5. **Duplicate logo files** — some exist in both lowercase and capitalized versions; JSON references lowercase
6. **No CI/CD pipeline** — no GitHub Actions or automated deployment
7. **No linting or formatting tools** — no ESLint, Prettier, or similar
8. **No automated tests** — no test framework configured
9. **`fetch-news` npm script is broken** — references `scripts/fetch-news.ts` which does not exist
10. **`@astrojs/node` installed but not configured** — listed in dependencies but not referenced in `astro.config.mjs`; likely leftover from SSR development

## Brittle Areas / Risks

- **Content schema changes** — adding a new field to network/news JSON requires updating `content.config.ts` first or the build will fail
- **`confidence` enum** — only accepts exactly: `verified`, `positioning`, `inference`, `partially-unverifiable`
- **Slug consistency** — network slugs in `compare.json`, news `relatedNetworks[]`, and actual filenames must all match
- **Logo path case sensitivity** — Linux is case-sensitive; `GLG.png` ≠ `glg.png`
- **Inline JavaScript** — all page interactivity is in inline `<script>` blocks in `.astro` files; no bundling, no source maps, harder to debug in production

## Deployment

### Requirements

Any static hosting service. The `dist/` folder is self-contained (~50 HTML pages + CSS + minimal JS).

### Recommended Hosting

| Service | Notes |
|---|---|
| Cloudflare Pages | Free, fast, automatic HTTPS |
| Netlify | Free tier, one-click deploy |
| Vercel | Free tier, good Astro support |
| AWS S3 + CloudFront | Production-grade, more setup |

### Deploy Steps

```bash
npm run build         # Generates dist/
# Upload dist/ contents to hosting platform
```

### Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `ADMIN_PASSWORD` | Admin panel login | Only for dev mode |

No environment variables are needed for production static deployment.

## Architecture Decisions

### Why Astro (not Next.js, Nuxt, etc.)

- Content-heavy, read-only site — ideal for static generation
- Ships zero JavaScript by default (React only renders at build time)
- Content Collections provide type-safe JSON validation
- No need for SSR, API routes, or client-side routing in production

### Why JSON files (not a database or CMS)

- 33 network profiles + 52 news signals is small enough for file-based content
- JSON files are version-controlled in Git (full audit trail)
- No database to manage, back up, or pay for
- Easy to edit with any text editor or AI assistant

### Why inline scripts (not bundled JS)

- Each page needs <100 lines of interactivity (search, filters, sidebar)
- Bundling adds complexity for minimal benefit at this scale
- Inline scripts are simpler to read and debug
- No build step for JavaScript, no framework overhead in browser

## Next Steps (Suggestions)

### High Priority

1. **Convert OG image to PNG** — SVG og:image doesn't render on Facebook/LinkedIn
2. **Add rich profiles** for remaining 28 networks (prioritize by traffic/relevance)
3. **Set up Google Search Console** and submit the sitemap
4. **Remove or implement `fetch-news` script** — currently broken reference in package.json

### Medium Priority

5. **Add missing network logos** (22 networks use gradient placeholders)
6. **Clean up duplicate logo files** in `public/images/networks/`
7. **Add CI/CD pipeline** (GitHub Actions for build verification on PR)
8. **Strengthen primary sourcing** for signals flagged during accuracy audit (Capvision IPO, Uzabase date)
9. **Add `.env.example` to onboarding docs** (now created)

### Low Priority

10. **Add analytics** (Plausible or Simple Analytics for privacy-first tracking)
11. **Add linting/formatting** (ESLint + Prettier)
12. **Create per-network OG images** for better social sharing
13. **Add View Transitions** for smoother navigation
14. **Expand news coverage** to smaller/boutique networks
15. **Remove unused `@astrojs/node` dependency** if SSR is not planned
