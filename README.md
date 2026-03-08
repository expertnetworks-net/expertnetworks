# ExpertNetworks.net

An independent, free information hub for the expert network industry. No affiliations, no paywalls, no sign-ups.

**Live site:** [https://expertnetworks.net](https://expertnetworks.net)

## What This Is

ExpertNetworks.net is a static website that independently tracks expert network providers (GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica, etc.). It provides:

- **33 network profiles** with pricing, compliance, expert counts, AI capabilities, and deep-dive content
- **52 news signals** curated from press releases, industry reports, and news coverage (not vendor marketing), with an intelligence-desk layout featuring significance tiers, editorial context, and trending analysis
- **Side-by-side comparison table** with 7 presets (Leaders, Consulting, PE, Enterprise, Asia, AI, Library) across 6 evaluation sections
- **Admin panel** for content management (password-protected, dev mode only)

Target audience: hedge funds, PE firms, consultancies, and corporates who buy expert network services and want unbiased information before choosing a provider.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 5.18](https://astro.build) (static site generator) |
| UI Components | Astro components + [React 19](https://react.dev) (SSR-only, no client-side React shipped) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) with custom theme |
| Content | JSON files in `src/content/` (Astro Content Collections with Zod validation) |
| SEO | `@astrojs/sitemap`, robots.txt, Open Graph, Twitter Cards, JSON-LD |
| Admin | Cookie-based auth (`admin_session`), REST API endpoints, file-based CRUD |
| Fonts | Inter via Google Fonts (weights 300-800) |
| SSR Adapter | `@astrojs/node` (installed for dev/preview mode; not used in static production build) |

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm

## Quick Start

```bash
# Install dependencies
npm install

# Create .env for admin panel access (optional, only needed for dev mode admin)
cp .env.example .env
# Edit .env and set ADMIN_PASSWORD

# Run development server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `ADMIN_PASSWORD` | Admin panel login password | Only for `npm run dev` (admin panel) |

The `.env` file is gitignored. See `.env.example` for the template. In production static builds, no environment variables are needed — the admin panel and API routes are not functional in static output.

## Project Structure

```
ExpertNetworks_Hub/
├── public/                    # Static assets (copied to dist/ as-is)
│   ├── images/networks/       # Network logo PNGs (11 logos, others use gradient placeholders)
│   ├── robots.txt             # Crawl rules: allows all, blocks /admin/ and /api/
│   ├── og-default.svg         # Default Open Graph image (SVG — see known limitations)
│   └── favicon.svg
├── src/
│   ├── components/            # 8 Astro components
│   │   ├── Header.astro       # Global nav, search overlay (z-200), hamburger menu (z-100)
│   │   ├── Footer.astro       # Global footer with nav links
│   │   ├── NetworkCard.astro  # Network card (homepage featured section)
│   │   ├── NewsCard.astro     # News signal card (news feed + homepage)
│   │   ├── CompareTable.astro # Side-by-side comparison table
│   │   ├── Hero.astro         # Hero section component
│   │   ├── ParticleHero.astro # Animated particle hero with typewriter effect
│   │   └── TrackedNetworksMarquee.astro  # Scrolling network logos bar
│   ├── content/               # All site data (JSON, validated by Zod at build time)
│   │   ├── networks/          # 33 network profile JSON files
│   │   ├── news/              # 52 news signal JSON files
│   │   ├── site.json          # Hero text, footer text, about section text
│   │   └── compare.json       # Comparison table config (networks, presets, sections)
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Main layout (SEO meta, OG, Twitter Cards, JSON-LD, fonts)
│   │   └── AdminLayout.astro  # Admin panel layout
│   ├── pages/
│   │   ├── index.astro        # Homepage (particle hero, news feed, top 10 sidebar)
│   │   ├── networks/
│   │   │   ├── index.astro    # Directory listing with search/filter/sort
│   │   │   └── [slug].astro   # Individual network profiles (33 pages)
│   │   ├── news/index.astro   # Intelligence desk (featured signals, filters, trending)
│   │   ├── compare.astro      # Comparison table with preset toggles
│   │   ├── about.astro        # About page
│   │   ├── sources.astro      # Sources & methodology
│   │   ├── verification.astro # Confidence tier methodology
│   │   ├── disclaimer.astro   # Legal disclaimer
│   │   ├── privacy.astro      # Privacy policy
│   │   ├── 404.astro          # Custom 404 error page
│   │   ├── admin/             # 7 admin pages (dev mode only)
│   │   │   ├── index.astro    # Admin dashboard
│   │   │   ├── login.astro    # Login page
│   │   │   ├── networks.astro # Network CRUD
│   │   │   ├── news.astro     # News CRUD
│   │   │   ├── compare.astro  # Comparison table editor
│   │   │   ├── settings.astro # Site settings
│   │   │   └── preview.astro  # Content preview
│   │   └── api/               # 6 REST endpoints (dev mode only)
│   │       ├── auth.ts        # POST login (checks ADMIN_PASSWORD)
│   │       ├── networks.ts    # Network CRUD
│   │       ├── news.ts        # News CRUD
│   │       ├── compare.ts     # Comparison table updates
│   │       ├── settings.ts    # Site settings updates
│   │       └── upload.ts      # File upload (logos)
│   ├── styles/
│   │   ├── global.css         # Fade-in animations, scrollbar styles, stagger delays
│   │   └── admin.css          # Admin panel styles
│   ├── content.config.ts      # Zod schemas for networks and news collections
│   └── middleware.ts          # Auth middleware (protects /admin/* and /api/*)
├── astro.config.mjs           # Astro config (static output, sitemap, React, Tailwind)
├── tailwind.config.mjs        # Custom theme (colors, fonts, shadows, border-radius)
├── tsconfig.json              # TypeScript strict mode, React JSX
├── package.json               # Dependencies and scripts
├── .env.example               # Environment variable template
└── prototype.html             # Original design prototype
```

**Build output:** `dist/` (~50 static HTML pages). Not checked into git.

## npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `astro dev` | Development server with hot reload at localhost:4321 |
| `npm run build` | `astro build` | Static build to `dist/` |
| `npm run preview` | `astro preview` | Preview the built static site |
| `npm run fetch-news` | `ts-node --esm scripts/fetch-news.ts` | **Not functional** — script file does not exist |

## Content Management

### Adding a New Network

1. Create a JSON file in `src/content/networks/` (e.g., `my-network.json`)
2. Follow the schema in `src/content.config.ts`
3. Required fields: `name`, `shortName`, `slug`, `gradientFrom`, `gradientTo`, `type`, `description`, `lastUpdated`
4. Set `published: true` to make it visible
5. Set `featured: true` and a low `priority` number (1-10) to feature on homepage
6. Optionally add a logo PNG to `public/images/networks/` and reference it in the `logo` field
7. Run `npm run build` to verify the schema validates

### Adding a News Signal

1. Create a JSON file in `src/content/news/` (e.g., `my-signal.json`)
2. Required fields: `title`, `slug`, `date` (YYYY-MM-DD), `source`, `summary`, `category`
3. V2 intelligence fields (recommended):
   - `sourceType`: `Press Release` | `Industry Report` | `News Coverage` | `Regulatory` | `Product Update`
   - `significance`: `major` | `standard` | `brief`
   - `featured`: `true` to appear in "What Matters Now" section
   - `whyItMatters`: editorial context string (shown for featured/major signals)
   - `impactTags`: topic tags for trending sidebar (e.g., `["M&A", "AI & Automation"]`)
4. Use `relatedNetworks` array to link to network slugs (must match filenames without `.json`)
5. Set `published: true` to make it visible
6. Run `npm run build` to verify

### Network Profile Tiers

- **Basic profile**: name, description, services, pricing, compliance, industries (all 33 networks have this)
- **Rich profile**: adds `overview`, `history` (with timeline), `servicesDetailed`, `aiPlatform`, `complianceExtended`, `clientFit`, `strengths`, `caveats`, `notableFacts`, `sourceNotes` — renders as expandable accordion sections. Currently 5 networks have rich profiles: GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica.

### Confidence Badges

Each field can have a confidence level in the `confidence` object:
- `verified` — independently confirmed from multiple sources
- `positioning` — based on company's own marketing claims
- `inference` — estimated from indirect evidence
- `partially-unverifiable` — some claims could not be independently verified

### Admin Panel

Access at `/admin/login` during `npm run dev` only. Set `ADMIN_PASSWORD` in `.env`. The admin panel provides CRUD for networks, news, comparison table, site settings, content preview, and file uploads.

**The admin panel does not work in production static builds.** API endpoints require a running server.

## SEO

- **Sitemap**: Auto-generated at `/sitemap-index.xml` via `@astrojs/sitemap` (excludes /admin)
- **robots.txt**: Allows all crawlers, blocks `/admin/` and `/api/`
- **Open Graph**: og:title, og:description, og:type, og:url, og:image, og:site_name on all pages
- **Twitter Cards**: summary_large_image format on all pages
- **Canonical URLs**: Every page has `<link rel="canonical">`
- **JSON-LD**: WebSite schema on homepage, CollectionPage on directory/news, Organization on network profiles
- **Unique meta descriptions**: Every page type has a tailored description

### After Deploying

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Verify site ownership (DNS TXT record or HTML file)
3. Submit sitemap: `https://expertnetworks.net/sitemap-index.xml`

## Known Limitations

1. **Admin panel is dev-mode only** — API endpoints don't work in static builds
2. **OG image is SVG** — Facebook/LinkedIn may not render it. Convert to 1200x630 PNG for better sharing.
3. **No CI/CD** — no GitHub Actions or automated deployment pipeline
4. **No linting/formatting** — no ESLint, Prettier, or similar tooling configured
5. **No automated tests** — no test framework or test files
6. **`fetch-news` script is broken** — `scripts/fetch-news.ts` does not exist despite being defined in package.json
7. **~22 networks missing logos** — they use gradient placeholders instead
8. **Duplicate logo files** — some exist in both lowercase and capitalized versions; JSON references lowercase

## Deployment

Any static hosting service. The `dist/` folder is self-contained.

```bash
npm run build   # Generates dist/
# Upload dist/ contents to hosting
```

Compatible with: Cloudflare Pages, Netlify, Vercel, AWS S3 + CloudFront, or any static file server.

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, data flow, component relationships
- [HANDOFF.md](./HANDOFF.md) — Current state, what's done, what's next
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Common issues and fixes
- [CLAUDE.md](./CLAUDE.md) — LLM-optimized context file for AI-assisted development
