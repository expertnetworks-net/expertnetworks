# CLAUDE.md — LLM Context File for ExpertNetworks Hub

This file is optimized for AI assistants (Claude, GPT, Copilot) working on this codebase. It provides the essential context needed to make changes safely and correctly.

Last verified against codebase: March 8, 2026

## Project Identity

- **What**: Static website tracking 33 expert network providers (GLG, AlphaSights, Third Bridge, etc.)
- **Who**: Independent, non-commercial — not affiliated with any expert network
- **Stack**: Astro 5.18 + React 19 (SSR-only) + Tailwind CSS 3.4, fully static output
- **Content**: JSON files (no database), validated by Zod schemas at build time
- **URL**: https://expertnetworks.net
- **Build output**: ~50 static HTML pages in `dist/`

## Critical Rules

1. **Never modify content JSON files** unless specifically asked — these contain manually researched, editorially audited data
2. **Never expose the admin password** from `.env`
3. **Always run `npm run build`** after changes to verify the build passes
4. **Content schema is strict** — any new field must be added to `src/content.config.ts` first or the build will fail
5. **The site is static** — no server-side rendering in production. Admin panel and API routes only work in dev mode.
6. **All images need `loading="lazy"`** except above-the-fold hero images
7. **News signals require editorial rigor** — hedged attribution, sourcing notes, no unverified claims presented as fact

## File Map (What To Edit For Common Tasks)

### Site-wide layout/SEO:
- `src/layouts/BaseLayout.astro` — meta tags, OG, Twitter Cards, JSON-LD, fonts, scroll behavior, overflow safety reset
- `src/components/Header.astro` — navigation, search overlay, hamburger menu (includes inline JS)
- `src/components/Footer.astro` — footer links, copyright text

### Page content:
- `src/pages/index.astro` — homepage (particle hero, typewriter, news feed, top 7 sidebar, featured cards, marquee)
- `src/pages/networks/index.astro` — directory listing with search/filter/sort
- `src/pages/networks/[slug].astro` — individual network profile (sidebar + main content + accordions)
- `src/pages/news/index.astro` — intelligence desk (featured signals, significance tiers, trending, filters, feed/grid toggle)
- `src/pages/compare.astro` — comparison table with 7 presets and modal overlay

### Data:
- `src/content/networks/*.json` — one file per network (33 files)
- `src/content/news/*.json` — one file per news signal (52 files)
- `src/content/site.json` — hero text, footer text, about section text
- `src/content/compare.json` — comparison table config (networks, 7 presets, 6 sections)

### Data schema:
- `src/content.config.ts` — Zod schemas for `networks` and `news` collections

### Styling:
- `tailwind.config.mjs` — custom colors, fonts, shadows, border-radius
- `src/styles/global.css` — fade-in animations, scrollbar styles, stagger delays

### Admin (dev mode only):
- `src/pages/admin/` — 7 pages: index, login, networks, news, compare, settings, preview
- `src/pages/api/` — 6 endpoints: auth, networks, news, compare, settings, upload
- `src/middleware.ts` — cookie-based auth protecting /admin/* and /api/*

## Content Schema Quick Reference

### Network JSON (src/content/networks/*.json)

```
REQUIRED:
  name, shortName, slug, gradientFrom, gradientTo, type, description, lastUpdated

DISPLAY CONTROL:
  published (boolean) — must be true to show on site
  featured (boolean) — shows in "Featured Profiles" on homepage
  priority (number) — lower = higher rank (1 = top)

BASIC FIELDS:
  logo, website, founded, headquarters, employeeCount, employeeCountSource,
  expertCount, expertCountLabel, parentCompany,
  services[], aiCapabilities[], industries[], pricingModel, pricingDetail,
  keyDifferentiators[], bestFor[], compliance{mnpiPolicy, expertVetting, coolingOffPeriod, auditTrail, regulatoryHistory}

V2 DIRECTORY FIELDS:
  categoryBadge — enum: 'Global Leader' | 'Major Provider' | 'Fast-Growing' | 'Asia Specialist' | 'Research Platform' | 'Technology-First' | 'Marketplace' | 'Boutique Specialist'
  deliveryModel — enum: 'Concierge' | 'Hybrid' | 'Self-Serve' | 'Marketplace' | 'Platform-Led'
  regionStrength — enum: 'Global' | 'North America' | 'Europe' | 'Asia-Pacific' | 'Greater China' | 'India' | 'Emerging Markets'
  complianceBadge — enum: 'Strong Compliance' | 'Standard Compliance' | 'Compliance Tools' | 'Limited Public Detail'
  aiBadge — enum: 'AI-Native' | 'AI Research' | 'AI Matching' | 'AI Moderation' | 'Limited AI Detail'

RICH PROFILE FIELDS (renders accordion sections):
  overview, history{narrative, timeline[]}, servicesDetailed[{name, description}],
  aiPlatform{narrative, features[]}, complianceExtended{narrative, highlights[], regulatoryContext},
  clientFit{narrative, segments[]}, strengths[], caveats[], notableFacts[], sourceNotes[]

METADATA:
  confidence{} — per-field: 'verified' | 'positioning' | 'inference' | 'partially-unverifiable'
  whyChoose[], whenNotIdeal[]
  comparison{expertCalls, contentLibrary, aiMatching, surveys, complianceTools}
```

### News JSON (src/content/news/*.json)

```
REQUIRED: title, slug, date (YYYY-MM-DD), source, summary, category
OPTIONAL: sourceUrl, categoryColor, gradientFrom, gradientTo, relatedNetworks[], published

V2 FIELDS (news intelligence):
  sourceType — enum: 'Press Release' | 'Industry Report' | 'News Coverage' | 'Regulatory' | 'Product Update'
  significance — enum: 'major' | 'standard' | 'brief'
  featured (boolean) — shows in "What Matters Now" on news page
  whyItMatters (string) — editorial context for major signals
  impactTags[] — topic tags for trending sidebar (e.g., "M&A", "AI & Automation")
```

## JavaScript Behavior

All JS is inline in `.astro` files (no separate JS bundles). Key behaviors:

### Header.astro (global, runs on every page):
- Search overlay: opens with `/` key or click, closes with `Escape` or backdrop click
- Menu drawer: slides in from left, expandable "Top Networks" and "Resources" sections
- Closes on link click, backdrop click, or `Escape`
- Both properly reset `document.body.style.overflow` when closing

### BaseLayout.astro (global):
- IntersectionObserver for `.fade-in` class animations (threshold 0.1, rootMargin '0px 0px -50px 0px')
- Resets `document.body.style.overflow = ''` on every page load (safety net for stuck overlays)
- Passive scroll listener for nav background opacity (only fires if `#hero` element exists)

### index.astro (homepage):
- Canvas-based particle animation with pointer repulsion, click pulse, frame-rate independence
- Typewriter effect on hero title

### [slug].astro (network profile pages only):
- Sidebar search filtering (desktop + mobile)
- Mobile sidebar toggle with backdrop
- Closes mobile sidebar on link click, backdrop click, close button, or `Escape`
- Scrolls active sidebar item into view on desktop

### networks/index.astro:
- Client-side search, type/pricing/region filters, sort
- DOM manipulation to show/hide/reorder network rows

### news/index.astro:
- Category, network, source type, time range, significance filters
- Feed view / grid view toggle
- "What Matters Now" section for featured major signals
- Trending sidebar computing 90-day category counts from impactTags

## Z-Index Hierarchy

```
z-300  — Skip-to-content link (Header.astro, visible on focus only)
z-200  — Header search overlay (fixed, highest interactive priority)
z-200  — Compare page modal overlay (fixed)
z-100  — Header menu drawer (fixed)
z-90   — Header menu backdrop (fixed)
z-80   — [slug] mobile sidebar panel (fixed)
z-70   — [slug] mobile sidebar toggle + backdrop (fixed)
z-50   — Header nav bar (fixed)
```

## Tailwind Custom Theme

Verified from `tailwind.config.mjs`:

```
Colors:
  primary (#1D1D1F), secondary (#6E6E73), tertiary (#86868B),
  accent (#0071E3), accent-hover (#0077ED),
  accent-green (#30D158), accent-orange (#FF9F0A), accent-purple (#BF5AF2),
  bg-primary (#FBFBFD), bg-secondary (#F5F5F7), bg-dark (#1D1D1F),
  border (#D2D2D7)

Font:   Inter + system fallbacks (Google Fonts, weights 300-800)
Radius: card (16px), sm (10px)
Max-width: site (1200px)
Shadows: card (0 2px 12px rgba(0,0,0,0.08)), card-hover (0 8px 30px rgba(0,0,0,0.12))
```

## Auth System

- Admin routes (`/admin/*` except `/admin/login`) protected by middleware (`src/middleware.ts`)
- API routes (`/api/*` except `/api/auth`) also protected
- Auth is cookie-based: `admin_session=authenticated`
- Password checked via `import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD` in `/api/auth.ts`
- Login page: `/admin/login`
- **Only functional in dev/preview mode (SSR). Does not work in static production build.**

## SEO Checklist (implemented)

- [x] `@astrojs/sitemap` generates sitemap-index.xml (excludes /admin via filter)
- [x] `robots.txt` blocks /admin/ and /api/
- [x] Open Graph tags on all pages (6 tags)
- [x] Twitter Cards on all pages (4 tags, summary_large_image)
- [x] Canonical URLs on all pages
- [x] JSON-LD structured data (WebSite, CollectionPage, Organization)
- [x] Unique meta descriptions per page type
- [x] `loading="lazy"` on all below-fold images
- [x] Font preconnect to both fonts.googleapis.com and fonts.gstatic.com
- [x] Passive scroll listeners (`{ passive: true }`)

## Build & Deploy

```bash
npm run build          # Outputs to dist/ (static HTML, ~50 pages, ~6-9 seconds)
npm run preview        # Preview the built site locally
npm run dev            # Dev server with hot reload at localhost:4321
```

The `dist/` folder is self-contained — deploy to any static hosting (Netlify, Vercel, Cloudflare Pages, S3, etc.).

No environment variables needed for production. `.env` only needed for dev mode admin.

## Common Pitfalls

1. Adding a new field to network JSON without updating `src/content.config.ts` will break the build
2. The `confidence` enum only accepts: `verified`, `positioning`, `inference`, `partially-unverifiable`
3. The `sourceType` enum only accepts: `Press Release`, `Industry Report`, `News Coverage`, `Regulatory`, `Product Update`
4. The `significance` enum only accepts: `major`, `standard`, `brief`
5. Network slugs in `compare.json` and news `relatedNetworks[]` must match actual file slugs (filename without `.json`)
6. Logo paths in JSON must match actual files in `public/images/networks/` (case-sensitive on Linux)
7. The admin panel and API routes only work in dev/preview mode, not in the static build
8. The `fetch-news` npm script references a non-existent file (`scripts/fetch-news.ts`)
9. `@astrojs/node` is installed but not configured in `astro.config.mjs` — it's a leftover dependency
