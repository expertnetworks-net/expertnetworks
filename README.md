# ExpertNetworks.net

An independent, free information hub for the expert network industry. No affiliations, no paywalls, no sign-ups.

**Live site:** [https://expertnetworks.net](https://expertnetworks.net)

## What This Is

ExpertNetworks.net is a static website that independently tracks expert network providers (companies like GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica, etc.). It provides:

- **Network profiles** for 33 providers with pricing, compliance, expert counts, AI capabilities, and deep-dive content
- **Industry news feed** with 52 curated signals — sourced from press releases, industry reports, and news coverage (not vendor marketing)
- **Side-by-side comparison** table of top networks
- **Admin panel** for content management (password-protected)

The site is aimed at hedge funds, PE firms, consultancies, and corporates who buy expert network services and want unbiased information before choosing a provider.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 5.18](https://astro.build) (static site generator) |
| UI Components | Astro components + [React 19](https://react.dev) for interactive parts |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) |
| Content | JSON files in `src/content/` (Astro Content Collections) |
| SEO | `@astrojs/sitemap`, robots.txt, Open Graph, Twitter Cards, JSON-LD |
| Admin | Cookie-based auth, REST API endpoints, file-based CRUD |
| Fonts | Inter via Google Fonts |

## Quick Start

```bash
# Install dependencies
npm install

# Run development server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
ExpertNetworks_Hub/
├── public/                    # Static assets (images, favicon, robots.txt, OG image)
│   ├── images/networks/       # Network logo PNGs
│   ├── robots.txt             # Crawl rules for search engines
│   ├── og-default.svg         # Default Open Graph image for social sharing
│   └── favicon.svg
├── src/
│   ├── components/            # Reusable Astro components
│   │   ├── Header.astro       # Global nav with search overlay and hamburger menu
│   │   ├── Footer.astro       # Global footer
│   │   ├── NetworkCard.astro  # Network card (used on homepage featured section)
│   │   ├── CompareTable.astro # Side-by-side comparison table
│   │   ├── NewsCard.astro     # News signal card (used in news feed and homepage)
│   │   ├── Hero.astro         # Hero section component
│   │   ├── ParticleHero.astro # Animated particle hero variant
│   │   └── TrackedNetworksMarquee.astro  # Scrolling network logos bar
│   ├── content/               # All site data (JSON)
│   │   ├── networks/          # 33 network profile JSON files
│   │   ├── news/              # 52 news signal JSON files
│   │   ├── site.json          # Site-wide text (hero, footer, about)
│   │   └── compare.json       # Which networks appear in comparison table
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Main layout (SEO meta, OG tags, JSON-LD, fonts)
│   │   └── AdminLayout.astro  # Admin panel layout
│   ├── pages/
│   │   ├── index.astro        # Homepage (dashboard with news + top 10)
│   │   ├── networks/
│   │   │   ├── index.astro    # Directory listing with filters
│   │   │   └── [slug].astro   # Individual network profile pages
│   │   ├── news/index.astro   # News feed with category/network filters
│   │   ├── compare.astro      # Comparison table page
│   │   ├── about.astro        # About page
│   │   ├── sources.astro      # Sources & methodology
│   │   ├── verification.astro # Verification & methodology page
│   │   ├── disclaimer.astro   # Legal disclaimer
│   │   ├── privacy.astro      # Privacy policy
│   │   ├── 404.astro          # Custom 404 error page
│   │   ├── admin/             # Admin panel pages (protected)
│   │   └── api/               # REST API endpoints (protected)
│   ├── styles/
│   │   ├── global.css         # Base styles, animations, scrollbar styles
│   │   └── admin.css          # Admin panel styles
│   ├── content.config.ts      # Zod schemas for content collections
│   └── middleware.ts          # Auth middleware (protects /admin and /api)
├── astro.config.mjs           # Astro configuration
├── tailwind.config.mjs        # Tailwind theme (colors, fonts, shadows)
├── package.json
└── .env                       # Admin password
```

## Content Management

### Adding a New Network

1. Create a JSON file in `src/content/networks/` (e.g., `my-network.json`)
2. Follow the schema defined in `src/content.config.ts`
3. Required fields: `name`, `shortName`, `slug`, `gradientFrom`, `gradientTo`, `type`, `description`, `lastUpdated`
4. Set `published: true` to make it visible
5. Set `featured: true` and a low `priority` number (1-10) to feature it on the homepage
6. Optionally add a logo PNG to `public/images/networks/` and reference it in the `logo` field

### Adding News

1. Create a JSON file in `src/content/news/` (e.g., `my-article.json`)
2. Required fields: `title`, `slug`, `date`, `source`, `summary`, `category`
3. Optional V2 fields: `sourceType` (Press Release / Industry Report / News Coverage / Regulatory / Product Update), `significance` (major / standard / brief), `featured`, `whyItMatters`, `impactTags[]`
4. Use `relatedNetworks` array to link to network slugs
5. Set `published: true` to make it visible

### Network Profile Tiers

Networks can have two levels of detail:

- **Basic profile**: name, description, services, pricing, compliance, industries (all networks have this)
- **Rich profile**: adds `overview`, `history` (with timeline), `servicesDetailed`, `aiPlatform`, `complianceExtended`, `clientFit`, `strengths`, `caveats`, `notableFacts`, `sourceNotes`. These render as expandable accordion sections on the profile page.

### Confidence Badges

Each field can have a confidence level in the `confidence` object:
- `verified` — independently confirmed from multiple sources
- `positioning` — based on company's own marketing claims
- `inference` — estimated from indirect evidence
- `partially-unverifiable` — some claims could not be independently verified

### Admin Panel

Access at `/admin/login` with the password in `.env` (`ADMIN_PASSWORD`). The admin panel provides CRUD for networks, news, comparison table, and site settings.

## SEO

The site includes comprehensive SEO:

- **Sitemap**: Auto-generated at `/sitemap-index.xml` via `@astrojs/sitemap` (excludes /admin pages)
- **robots.txt**: Allows all crawlers, blocks `/admin/` and `/api/`
- **Open Graph**: All pages have og:title, og:description, og:type, og:url, og:image, og:site_name
- **Twitter Cards**: summary_large_image format on all pages
- **Canonical URLs**: Every page has a `<link rel="canonical">`
- **JSON-LD**: WebSite schema on homepage, CollectionPage on directory/news, Organization on each network profile
- **Unique meta descriptions**: Every page type has a tailored description

### After Deploying

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Verify site ownership (DNS TXT record or HTML file)
3. Submit sitemap: `https://expertnetworks.net/sitemap-index.xml`

## Development Notes

- The site builds as fully static HTML (no server required in production)
- Build output goes to `dist/`
- All content is in JSON files — no database, no CMS
- The admin panel writes directly to JSON files on disk (only works in dev/SSR mode)
- Tailwind classes use a custom theme defined in `tailwind.config.mjs`

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, data flow, component relationships
- [HANDOFF.md](./HANDOFF.md) — Current state, what's done, what's next
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Common issues and fixes
- [CLAUDE.md](./CLAUDE.md) — LLM-optimized context file for AI-assisted development
