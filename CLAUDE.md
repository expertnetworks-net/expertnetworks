# CLAUDE.md — LLM Context File for ExpertNetworks Hub

This file is optimized for AI assistants (Claude, GPT, Copilot) working on this codebase. It provides the essential context needed to make changes safely and correctly.

## Project Identity

- **What**: Static website tracking 33+ expert network providers (GLG, AlphaSights, Third Bridge, etc.)
- **Who**: Independent, non-commercial — not affiliated with any expert network
- **Stack**: Astro 5.18 + React 19 + Tailwind CSS 3.4, fully static output
- **Content**: JSON files (no database), managed via file system
- **URL**: https://expertnetworks.net

## Critical Rules

1. **Never modify content JSON files** unless specifically asked — these contain manually researched, verified data
2. **Never expose the admin password** from `.env`
3. **Always run `npm run build`** after changes to verify the build passes
4. **Content schema is strict** — any new field must be added to `src/content.config.ts` first
5. **The site is static** — no server-side rendering in production. API routes only work in dev mode.
6. **All images need `loading="lazy"`** except above-the-fold hero images

## File Map (What To Edit For Common Tasks)

### To change site-wide layout/SEO:
- `src/layouts/BaseLayout.astro` — meta tags, OG, Twitter Cards, JSON-LD, fonts, scroll behavior
- `src/components/Header.astro` — navigation, search overlay, hamburger menu (includes inline JS)
- `src/components/Footer.astro` — footer links, copyright text

### To change page content:
- `src/pages/index.astro` — homepage (dashboard layout with news feed + top 10 sidebar)
- `src/pages/networks/index.astro` — directory listing with search/filter/sort
- `src/pages/networks/[slug].astro` — individual network profile (sidebar + main content)
- `src/pages/news/index.astro` — news feed with category/network filters
- `src/pages/compare.astro` — comparison table wrapper

### To change data:
- `src/content/networks/*.json` — one file per network (33 files)
- `src/content/news/*.json` — one file per news signal (52 files)
- `src/content/site.json` — hero text, footer text, about section text
- `src/content/compare.json` — which networks appear in comparison table and which features to compare

### To change data schema:
- `src/content.config.ts` — Zod schemas for `networks` and `news` collections

### To change styling:
- `tailwind.config.mjs` — custom colors (primary, secondary, accent, etc.), fonts, shadows, border-radius
- `src/styles/global.css` — fade-in animations, scrollbar styles, sidebar scrollbar behavior

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
  logo, website, founded, headquarters, employeeCount, expertCount,
  services[], aiCapabilities[], industries[], pricingModel, pricingDetail,
  keyDifferentiators[], bestFor[], compliance{}

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
- Menu drawer: slides in from left, closes on link click, backdrop click, or `Escape`
- Both properly reset `document.body.style.overflow` when closing

### BaseLayout.astro (global):
- IntersectionObserver for `.fade-in` class animations
- Resets `document.body.style.overflow = ''` on every page load (safety net for stuck overlays)
- Passive scroll listener for nav background opacity (only fires if `#hero` element exists)

### [slug].astro (network profile pages only):
- Sidebar search filtering (desktop + mobile)
- Mobile sidebar toggle with backdrop
- Closes mobile sidebar on link click, backdrop click, close button, or `Escape`
- Scrolls active sidebar item into view on desktop

### networks/index.astro:
- Client-side search, type/pricing/region filters, sort
- DOM manipulation to show/hide/reorder network rows

### news/index.astro:
- Client-side category/network filters, date sort

## Z-Index Hierarchy

```
z-50   — Header nav bar (fixed)
z-60   — [slug] desktop sidebar (sticky)
z-70   — [slug] mobile sidebar toggle + backdrop (fixed)
z-80   — [slug] mobile sidebar panel (fixed)
z-90   — Header menu backdrop (fixed)
z-100  — Header menu drawer (fixed)
z-200  — Header search overlay (fixed, highest priority)
```

## Tailwind Custom Theme

```
Colors: primary (#1D1D1F), secondary (#6E6E73), tertiary (#86868B),
        accent (#0071E3), accent-green (#30D158), bg-secondary (#F5F5F7)
Font:   Inter (Google Fonts, weights 300-800)
Radius: card (16px), sm (10px)
Max-width: site (1200px)
Shadows: card, card-hover
```

## Auth System

- Admin routes (`/admin/*`) protected by middleware (`src/middleware.ts`)
- API routes (`/api/*`) also protected (except `/api/auth`)
- Auth is cookie-based: `admin_session=authenticated`
- Password stored in `.env` as `ADMIN_PASSWORD`
- Login page: `/admin/login`

## SEO Checklist (already implemented)

- [x] `@astrojs/sitemap` generates sitemap-index.xml (excludes /admin)
- [x] `robots.txt` blocks /admin/ and /api/
- [x] Open Graph tags on all pages
- [x] Twitter Cards on all pages
- [x] Canonical URLs on all pages
- [x] JSON-LD structured data (WebSite, CollectionPage, Organization)
- [x] Unique meta descriptions per page type
- [x] `loading="lazy"` on all below-fold images
- [x] Font preconnect to both fonts.googleapis.com and fonts.gstatic.com
- [x] Passive scroll listeners

## Build & Deploy

```bash
npm run build          # Outputs to dist/ (static HTML, ~50 pages)
npm run preview        # Preview the built site locally
```

The `dist/` folder contains everything needed — deploy to any static hosting (Netlify, Vercel, Cloudflare Pages, S3, etc.).

## Common Pitfalls

1. Adding a new field to network JSON without updating `src/content.config.ts` will break the build
2. The `confidence` enum only accepts: `verified`, `positioning`, `inference`, `partially-unverifiable`
3. Network slugs in `compare.json` and news `relatedNetworks[]` must match actual file slugs
4. Logo paths in JSON must match actual files in `public/images/networks/`
5. The admin panel only works in SSR/dev mode, not in the static build
