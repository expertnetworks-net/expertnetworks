# Architecture

## System Overview

ExpertNetworks.net is a **fully static site** built with Astro 5.18. At build time, Astro reads JSON content files, validates them against Zod schemas, renders Astro/React components into HTML, and outputs a `dist/` folder of pure static HTML/CSS/JS. No server is needed in production.

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
│    - Particle animation + typewriter (homepage hero)    │
│    - Scroll animations (IntersectionObserver)           │
│  No client-side routing — full page loads on navigation │
│  No React shipped to browser — React is SSR-only        │
└─────────────────────────────────────────────────────────┘
```

## Data Architecture

### Content Collections

Astro Content Collections with Zod validation. Two collections defined in `src/content.config.ts`:

```
networks/          (33 JSON files → 33 static profile pages)
  ├── glg.json
  ├── alphasights.json
  ├── third-bridge.json
  └── ... (one file per provider)

news/              (52 JSON files → rendered in news feed)
  ├── glg-agentic-ai-report.json
  ├── alphasense-500m-arr.json
  └── ... (one file per signal)

site.json          (hero text, footer text, about content)
compare.json       (comparison table config: networks, presets, sections)
```

Each JSON file is validated at build time. Schema violations fail the build with a clear error pointing to the invalid file and field.

### Data Flow

```
Network JSON ──→ getCollection('networks') ──→ filter(published) + sort ──→ render
                                                      │
                                                      ├── index.astro (top 7 + featured cards)
                                                      ├── networks/index.astro (full directory)
                                                      ├── networks/[slug].astro (individual profile)
                                                      ├── CompareTable.astro (comparison matrix)
                                                      ├── Header.astro (search data)
                                                      ├── Footer.astro (top network links)
                                                      └── TrackedNetworksMarquee.astro (logo bar)

News JSON ──→ getCollection('news') ──→ filter(published) + sort(date desc) ──→ render
                                                      │
                                                      ├── news/index.astro (intelligence desk)
                                                      ├── index.astro (homepage news feed)
                                                      └── networks/[slug].astro (related news)
```

### Static Config Files

| File | Purpose | Used By |
|---|---|---|
| `site.json` | Hero text, footer text, about features | `index.astro`, `Footer.astro` |
| `compare.json` | Networks list, 7 presets, 6 comparison sections with rows | `CompareTable.astro` |

## Component Architecture

### Layout Hierarchy

```
BaseLayout.astro
├── <head>
│   ├── Meta tags (title, description, canonical URL)
│   ├── Open Graph tags (6 tags)
│   ├── Twitter Card tags (4 tags)
│   ├── JSON-LD structured data (varies by page type)
│   ├── Font preconnects (googleapis.com, gstatic.com)
│   └── Favicon
├── Header.astro (nav bar + search overlay + menu drawer)
├── <slot /> (page content)
├── Footer.astro
└── <script>
    ├── IntersectionObserver for .fade-in animations (threshold 0.1)
    ├── Passive scroll listener for nav opacity (only if #hero exists)
    └── document.body.style.overflow = '' reset (safety net)
```

### Page Inventory

| Page | Route | Data Source | Key Features |
|---|---|---|---|
| Homepage | `/` | networks + news | Particle hero with typewriter, news feed, top 7 sidebar, featured cards, marquee |
| Directory | `/networks` | networks | Search, filter (type/pricing/region), sort, stats bar |
| Profile | `/networks/[slug]` | network + news | Desktop sidebar, mobile sidebar, accordion deep-dive, related news |
| News | `/news` | news + networks | Intelligence desk: featured signals, significance tiers, source type badges, trending sidebar, category/network/time filters, feed/grid view toggle |
| Compare | `/compare` | compare.json + networks | Comparison matrix with 7 presets, 6 sections, modal overlay (z-200) |
| About | `/about` | networks (count) | Static content |
| Sources | `/sources` | none | Static content |
| Verification | `/verification` | none | Confidence tier methodology explanation |
| Disclaimer | `/disclaimer` | none | Legal disclaimer |
| Privacy | `/privacy` | none | Privacy policy |
| 404 | N/A | none | Custom error page with navigation links |
| Admin (7 pages) | `/admin/*` | various | Dashboard, login, networks, news, compare, settings, preview |
| API (6 endpoints) | `/api/*` | various | auth, networks, news, compare, settings, upload |

**Total: ~50 pages generated at build time**

### Component Responsibilities

```
Header.astro
├── Fixed navigation bar (z-50)
├── Skip-to-content link (z-300, visible on focus)
├── Search overlay (z-200) — searches network data inline, opens with / key
├── Menu drawer (z-100) — slide-out nav with expandable "Top Networks" and "Resources"
├── Menu backdrop (z-90)
└── Keyboard shortcuts: / opens search, Escape closes overlays

Footer.astro
├── Brand + description
├── Navigation links, top network links, legal links
└── Copyright + disclaimer

NetworkCard.astro
├── Two variants: 'logo' (compact) and 'profile' (detailed)
└── Used on homepage featured section

NewsCard.astro
├── Signal card with source type badge, significance indicator, date
├── "Why it matters" expandable section for major signals
└── Related network chips and impact tags

CompareTable.astro
├── Reads compare.json for network slugs, presets, sections
├── 7 preset tabs (Leaders, Consulting, PE, Enterprise, Asia, AI, Library)
├── 6 evaluation sections with typed rows (boolean, text, chip, graded, list)
└── Horizontally scrollable on mobile

ParticleHero.astro
├── Canvas-based particle animation with pointer repulsion
├── Click pulse effect
├── Frame-rate independent animation
└── Typewriter effect on hero title

TrackedNetworksMarquee.astro
├── Desktop: infinite CSS marquee animation (pauses on hover)
├── Mobile: horizontal scroll
└── Shows top 12 networks with logos
```

## Network Profile Page Architecture

The `[slug].astro` page is the most complex. Two-panel layout:

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
│                  │   ├── Client Fit                  │
│                  │   ├── Notable Facts               │
│                  │   └── Source Notes                │
│                  │                                  │
│                  │   Related News                    │
│                  │   Website link                    │
└──────────────────┴──────────────────────────────────┘

Mobile: Sidebar hidden, FAB toggle button opens slide-out panel
```

Rich profile detection:
```js
const isRich = !!(d.overview || d.history || d.servicesDetailed?.length || d.aiPlatform || d.strengths?.length);
```

## News Intelligence Desk Architecture

The `news/index.astro` page implements a V2 intelligence desk:

```
┌──────────────────────────────────────────────────────┐
│  Coverage Intelligence Bar                           │
│  [52 SIGNALS] [10 Major] [32 Standard] [11 Brief]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  WHAT MATTERS NOW (featured signals only)            │
│  ┌────────────────────────────┐                      │
│  │ Major signal with          │                      │
│  │ WHY IT MATTERS context     │                      │
│  │ Source type badge + date   │                      │
│  └────────────────────────────┘                      │
│                                                      │
├──────────────────────────────────────┬───────────────┤
│  CONTROL BAR                        │ TRENDING      │
│  Category | Network | Source Type   │ (90-day)      │
│  Time Range | Significance          │ Industry (6)  │
│  [Feed View] [Grid View]           │ Product  (6)  │
│                                     │ M&A      (3)  │
├─────────────────────────────────────│ ...           │
│  ALL SIGNALS (chronological)        │               │
│  ┌─────────────────────────────┐   │               │
│  │ Signal card                  │   │               │
│  │ Left border = significance   │   │               │
│  │ accent=major, gray=standard  │   │               │
│  └─────────────────────────────┘   │               │
└──────────────────────────────────────┴───────────────┘
```

## Auth & Admin Architecture

```
Browser ──→ /admin/login ──→ POST /api/auth ──→ Checks ADMIN_PASSWORD env var
                                                     │
                                                     ▼
                                              Sets cookie: admin_session=authenticated
                                                     │
         /admin/* pages ──→ middleware.ts checks cookie ──→ Allow or redirect to /admin/login
         /api/* endpoints ──→ middleware.ts checks cookie ──→ Allow or return 401 JSON

Admin pages:              API endpoints:
  /admin/                   /api/auth     (login, no auth required)
  /admin/login              /api/networks (CRUD)
  /admin/networks           /api/news     (CRUD)
  /admin/news               /api/compare  (update)
  /admin/compare            /api/settings (update)
  /admin/settings           /api/upload   (file upload)
  /admin/preview
```

**Critical:** Admin panel and API endpoints only work in dev/preview mode (SSR). In the static production build, these routes exist as static HTML but POST/PUT/DELETE requests have no server to handle them.

## Z-Index Hierarchy

```
z-300  — Skip-to-content link (visible on focus only)
z-200  — Header search overlay (fixed, highest interactive priority)
z-200  — Compare page modal overlay (fixed)
z-100  — Header menu drawer (fixed)
z-90   — Header menu backdrop (fixed)
z-80   — [slug] mobile sidebar panel (fixed)
z-70   — [slug] mobile sidebar toggle + backdrop (fixed)
z-50   — Header nav bar (fixed)
```

## SEO Architecture

```
BaseLayout.astro generates per page:
├── <meta name="description">              (unique per page type)
├── <link rel="canonical">                 (full URL with site base)
├── <meta property="og:*">                 (6 Open Graph tags)
├── <meta name="twitter:*">                (4 Twitter Card tags)
├── <script type="application/ld+json">    (JSON-LD, varies by page type)
├── <link rel="preconnect">                (2 font preconnects)
└── <link rel="icon" href="/favicon.svg">

Sitemap (@astrojs/sitemap):
├── /sitemap-index.xml  → references sitemap-0.xml
└── /sitemap-0.xml      → ~50 URLs (all public pages, /admin excluded via config)

robots.txt:
├── User-agent: *
├── Disallow: /admin/
├── Disallow: /api/
└── Sitemap: https://expertnetworks.net/sitemap-index.xml
```

## Tailwind Custom Theme

Verified from `tailwind.config.mjs`:

```
Colors:
  primary: #1D1D1F       secondary: #6E6E73      tertiary: #86868B
  accent: #0071E3        accent-hover: #0077ED
  accent-green: #30D158  accent-orange: #FF9F0A   accent-purple: #BF5AF2
  bg-primary: #FBFBFD    bg-secondary: #F5F5F7    bg-dark: #1D1D1F
  border: #D2D2D7

Font:    Inter + system fallbacks (weights 300-800 via Google Fonts)
Radius:  card: 16px, sm: 10px
Width:   max-site: 1200px
Shadows: card: 0 2px 12px rgba(0,0,0,0.08)
         card-hover: 0 8px 30px rgba(0,0,0,0.12)
```

## Performance Characteristics

- **Build time:** ~6-9 seconds (50 pages)
- **Page weight:** HTML-only, no client-side framework shipped (React is SSR-only)
- **Images:** All below-fold images use `loading="lazy"`
- **Fonts:** Preconnected to both `fonts.googleapis.com` and `fonts.gstatic.com`
- **CSS:** Tailwind purges unused styles at build time
- **JS:** Minimal inline scripts only — no bundled JavaScript framework in the browser
- **Animations:** CSS-only marquee, IntersectionObserver for fade-ins (threshold 0.1), canvas particle animation on homepage, `prefers-reduced-motion` respected
- **Scroll listeners:** All use `{ passive: true }`

## Dependency Graph

```
astro@5.18 ──→ static site generation, content collections, routing
  ├── @astrojs/react ──→ SSR-only React component rendering
  ├── @astrojs/tailwind ──→ Tailwind CSS integration
  ├── @astrojs/sitemap ──→ sitemap generation (excludes /admin)
  └── @astrojs/node ──→ SSR adapter (dev/preview mode only, not used in static build)

react@19 + react-dom@19 ──→ component rendering (SSR only, not shipped to browser)
tailwindcss@3.4 ──→ utility-first CSS with custom theme

No database. No external APIs. No queues. No workers. No observability tools.
Content is file-based JSON validated by Zod schemas at build time.
```
