# Architecture

## System Overview

ExpertNetworks.net is a **static site** built with Astro. At build time, Astro reads JSON content files, validates them against Zod schemas, renders Astro/React components into HTML, and outputs a `dist/` folder of pure HTML/CSS/JS. No server is needed in production.

```
┌─────────────────────────────────────────────────────────┐
│                    BUILD TIME                           │
│                                                         │
│  JSON files ──→ Zod validation ──→ Astro templates ──→ dist/
│  (content/)     (content.config.ts)  (pages/*.astro)    (static HTML)
│                                                         │
│  Tailwind CSS ──→ PostCSS ──→ Optimized CSS bundle      │
│  Google Fonts ──→ <link> tags in <head>                 │
│  public/ assets ──→ Copied to dist/ as-is               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    RUNTIME (browser)                    │
│                                                         │
│  Static HTML served by any web server                   │
│  Inline <script> blocks handle:                         │
│    - Search overlay (Header.astro)                      │
│    - Filter/sort on directory and news pages            │
│    - Mobile sidebar toggle on profile pages             │
│    - Scroll animations (IntersectionObserver)           │
│  No client-side routing — full page loads on navigation │
└─────────────────────────────────────────────────────────┘
```

## Data Architecture

### Content Collections

Astro's Content Collections system is the backbone. Two collections are defined in `src/content.config.ts`:

```
networks/          (33 JSON files → 33 static profile pages)
  ├── glg.json
  ├── alphasights.json
  └── ... (one file per provider)

news/              (40+ JSON files → rendered in news feed)
  ├── glg-agentic-ai-report.json
  └── ... (one file per article)
```

Each JSON file is validated at build time against a Zod schema. If a file doesn't match the schema, the build fails with a clear error pointing to the invalid field.

### Data Flow

```
Network JSON ──→ getCollection('networks') ──→ filter/sort ──→ render in template
                                                   │
                                                   ├── index.astro (top 10 + featured)
                                                   ├── networks/index.astro (full directory)
                                                   ├── networks/[slug].astro (individual profile)
                                                   ├── CompareTable.astro (comparison)
                                                   ├── Header.astro (search data)
                                                   ├── Footer.astro (top network links)
                                                   └── TrackedNetworksMarquee.astro (logo bar)
```

### Static Config Files

| File | Purpose | Used By |
|---|---|---|
| `site.json` | Hero text, footer text, about features | Footer.astro |
| `compare.json` | Which networks + features appear in comparison table | CompareTable.astro |

## Component Architecture

### Layout Hierarchy

```
BaseLayout.astro
├── <head> (meta, OG, Twitter, canonical, JSON-LD, fonts, favicon)
├── Header.astro (nav bar + search overlay + menu drawer)
├── <slot /> (page content)
├── Footer.astro
└── <script> (IntersectionObserver, scroll listener, overflow reset)
```

### Page Types

| Page | Route | Data Source | Special Features |
|---|---|---|---|
| Homepage | `/` | networks + news | Dashboard layout, news feed, top 10, featured cards, marquee |
| Directory | `/networks` | networks | Search, filter (type/pricing/region), sort, stats bar |
| Profile | `/networks/[slug]` | single network + news | Desktop sidebar, mobile sidebar, accordion deep-dive |
| News | `/news` | news + networks | Category/network filters, date sort |
| Compare | `/compare` | compare.json + networks | Static comparison table |
| About | `/about` | networks (count) | Static content |
| Sources | `/sources` | none | Static content |
| Disclaimer | `/disclaimer` | none | Static content |
| Privacy | `/privacy` | none | Static content |

### Component Responsibilities

```
Header.astro
├── Fixed navigation bar (z-50)
├── Search overlay (z-200) — searches network data inline
├── Menu drawer (z-100) — slide-out navigation with expandable sections
└── Keyboard shortcuts: / opens search, Escape closes overlays

Footer.astro
├── Brand, description
├── Navigation links, top network links, legal links
└── Copyright, disclaimer

NetworkCard.astro
├── Two variants: 'logo' (compact) and 'profile' (detailed)
├── Used on homepage featured section
└── Receives props from parent page

CompareTable.astro
├── Reads compare.json for network slugs and feature keys
├── Renders HTML table with checkmarks/dashes/values
└── Horizontally scrollable on mobile

TrackedNetworksMarquee.astro
├── Desktop: infinite CSS marquee animation (pauses on hover)
├── Mobile: horizontal scroll
└── Shows top 12 networks with logos
```

## Network Profile Page Architecture

The `[slug].astro` page is the most complex. It has a two-panel layout:

```
┌──────────────────┬──────────────────────────────────┐
│   SIDEBAR        │   MAIN CONTENT                   │
│   (desktop only) │                                  │
│                  │   Layer 1: Always visible         │
│   Search bar     │   ├── Header (logo, name, meta)  │
│   Featured list  │   ├── Description                │
│   All networks   │   ├── Stats (experts, employees) │
│                  │   ├── Services chips              │
│   Active item    │   ├── Best for / When not ideal   │
│   highlighted    │   └── Strengths / Caveats         │
│                  │                                  │
│                  │   Layer 2: Expandable accordions  │
│                  │   ├── Overview                    │
│                  │   ├── History (with timeline)     │
│                  │   ├── Services in Detail          │
│                  │   ├── AI & Platform               │
│                  │   ├── Compliance                  │
│                  │   ├── Client Fit                   │
│                  │   ├── Notable Facts               │
│                  │   └── Source Notes                │
│                  │                                  │
│                  │   Related News                    │
│                  │   Website link                    │
└──────────────────┴──────────────────────────────────┘

Mobile: Sidebar hidden, toggle button (FAB) opens slide-out panel
```

## Auth & Admin Architecture

```
Browser ──→ /admin/login ──→ POST /api/auth ──→ Sets cookie: admin_session=authenticated
                                                     │
                                                     ▼
         /admin/* pages ──→ middleware.ts checks cookie ──→ Allow or redirect to /admin/login
         /api/* endpoints ──→ middleware.ts checks cookie ──→ Allow or return 401

Admin panel pages:
  /admin/           — Dashboard
  /admin/networks   — CRUD for network profiles
  /admin/news       — CRUD for news articles
  /admin/compare    — Edit comparison table
  /admin/settings   — Site settings
  /admin/preview    — Preview content
```

**Important:** The admin panel and API endpoints only work in dev/SSR mode. In the static build, these routes exist as HTML but the API endpoints are not functional (no server to handle POST requests).

## SEO Architecture

```
BaseLayout.astro generates:
├── <meta name="description" content="...">     (unique per page)
├── <link rel="canonical" href="...">            (full URL)
├── <meta property="og:*" ...>                   (6 OG tags)
├── <meta name="twitter:*" ...>                  (4 Twitter tags)
├── <script type="application/ld+json">          (JSON-LD, varies by page type)
├── <link rel="preconnect" href="fonts...">      (2 preconnects)
└── <link rel="icon" href="/favicon.svg">

Sitemap (@astrojs/sitemap):
├── /sitemap-index.xml  → references sitemap-0.xml
└── /sitemap-0.xml      → 41 URLs (all public pages, no /admin)

robots.txt:
├── Allow: /
├── Disallow: /admin/
├── Disallow: /api/
└── Sitemap: https://expertnetworks.net/sitemap-index.xml
```

## Performance Characteristics

- **Build time:** ~5.5 seconds (48 pages)
- **Page weight:** HTML-only, no client-side framework shipped (React is SSR-only)
- **Images:** All below-fold images use `loading="lazy"`
- **Fonts:** Preconnected to both `fonts.googleapis.com` and `fonts.gstatic.com`
- **CSS:** Tailwind purges unused styles at build time
- **JS:** Minimal inline scripts only — no bundled JavaScript framework
- **Animations:** CSS-only marquee, IntersectionObserver for fade-ins, `prefers-reduced-motion` respected
