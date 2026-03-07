# Handoff Document

Last updated: March 7, 2026

## Current State

The site is **production-ready**. All core features are built, all known bugs are fixed, SEO is fully implemented.

### What's Live

- **33 network profiles** — all published, 6 featured (GLG, AlphaSights, Third Bridge, Guidepoint, AlphaSense/Tegus, Dialectica)
- **40+ news articles** — curated from third-party sources
- **Rich profiles** for GLG, AlphaSights, Third Bridge, Guidepoint, and Dialectica (with deep-dive accordions, timelines, source notes, confidence badges)
- **Comparison table** comparing 6 top networks across 7 features
- **Full SEO suite** — sitemap, robots.txt, OG tags, Twitter Cards, JSON-LD, canonical URLs, unique descriptions
- **Admin panel** — functional in dev mode for content management

### What Was Done Recently (March 2026)

1. **SEO implementation** — added @astrojs/sitemap, robots.txt, Open Graph, Twitter Cards, canonical URLs, JSON-LD structured data, unique meta descriptions for all page types
2. **Stuck loading bug fix** — overlays (search, menu, mobile sidebar) were setting `overflow: hidden` on `<body>` but not clearing it when users navigated away via links inside the overlay. Fixed with:
   - `document.body.style.overflow = ''` reset on every page load (BaseLayout.astro)
   - Click handlers on links inside all overlays to close them before navigation
   - Escape key handler for mobile sidebar on profile pages
3. **Security fix** — search results innerHTML was using unescaped network data (XSS risk). All dynamic values now escaped.
4. **Performance** — added `loading="lazy"` to all below-fold images (~100+ images across directory, profiles, news), passive scroll listeners, font preconnect optimization
5. **Deep research profiles** — GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica all have independently verified profiles with confidence badges, source notes, and extended fields

## Content Coverage

### Networks by Profile Depth

**Rich profiles (full deep-dive):**
- GLG, AlphaSights, Third Bridge, Guidepoint, Dialectica

**Basic profiles (summary + services + compliance):**
- All other 28 networks

### Networks by Region

- **US-based:** GLG, AlphaSights (also London), Guidepoint, Coleman Research, NewtonX, Maven, Zintro, Stax, Ridgetop, Silverlight, Mainstreet, Raven, Mosaic
- **UK-based:** Third Bridge, Prosapient, Techspert
- **Europe:** Dialectica (Montreal HQ, Greek origins), Atheneum (Berlin), Emerton (Paris)
- **Asia:** Capvision (Shanghai), VisasQ (Tokyo), Lynk (Hong Kong)
- **Other:** Astute Connect (India), OnFrontiers (DC, emerging markets focus)

### Content Gaps to Fill

1. **28 networks** still need rich profiles (deep-dive research like GLG/AlphaSights/Third Bridge)
2. **INEX ONE** is listed as a meta-platform but could use a more detailed breakdown of how it aggregates other networks
3. **Logo images** are missing for ~20 networks (they use gradient placeholders instead)
4. **News coverage** is skewed toward larger networks — smaller networks have little or no coverage

## Known Limitations

1. **Admin panel is dev-mode only** — the API endpoints (POST routes) don't work in the static build. To manage content in production, you'd need either:
   - Run the admin locally, edit JSON files, rebuild and deploy
   - Add a headless CMS (e.g., Tina, Decap)
   - Switch to Astro SSR mode with the Node adapter
2. **No real-time news** — news articles are manually curated JSON files, not auto-fetched
3. **No analytics** — no Google Analytics, Plausible, or other tracking (intentionally, per the privacy-first approach)
4. **OG image is SVG** — social platforms (Facebook, LinkedIn) may not render SVG og:images. For best social sharing, convert `public/og-default.svg` to a 1200x630 PNG using any image tool
5. **No 404 page** — Astro's default 404 is used. Could create a custom `src/pages/404.astro`
6. **Duplicate logo files** — some logos exist in both lowercase and capitalized versions (e.g., `Alphasights.png` and `alphasights.png`). The JSON files reference the lowercase versions.

## Deployment

### Requirements

Any static hosting service. The `dist/` folder is self-contained.

### Recommended Hosting

| Service | Notes |
|---|---|
| Cloudflare Pages | Free, fast, automatic HTTPS |
| Netlify | Free tier, one-click deploy |
| Vercel | Free tier, good for Astro |
| AWS S3 + CloudFront | Production-grade, more setup |

### Deploy Steps

```bash
npm run build         # Generate dist/
# Upload dist/ contents to hosting
```

### Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `ADMIN_PASSWORD` | Admin panel login password | Only for dev mode |

## Architecture Decisions

### Why Astro (not Next.js, Nuxt, etc.)

- This site is content-heavy and read-only — perfect for static generation
- Astro ships zero JavaScript by default (React only renders at build time)
- Content Collections provide type-safe JSON validation at build time
- No need for server-side rendering, API routes, or client-side routing

### Why JSON files (not a database or CMS)

- 33 network profiles + 40 news articles is small enough for file-based content
- JSON files are version-controlled in Git (full audit trail)
- No database dependency to manage, back up, or pay for
- Easy to edit with any text editor or AI assistant

### Why inline scripts (not bundled JS)

- Each page only needs a small amount of interactivity (search, filters, sidebar toggle)
- Bundling would add unnecessary complexity for <100 lines of JS per page
- Inline scripts are simpler to read and debug
- No build step for JavaScript, no framework overhead in the browser

## Next Steps (Suggestions)

### High Priority

1. **Convert OG image to PNG** for better social media sharing compatibility
2. **Create a 404 page** (`src/pages/404.astro`)
3. **Add rich profiles** for the remaining 28 networks (prioritize by size/relevance)
4. **Set up Google Search Console** and submit the sitemap

### Medium Priority

5. **Add missing network logos** (20 networks use gradient placeholders)
6. **Clean up duplicate logo files** in `public/images/networks/`
7. **Add a contact form** or email address for corrections
8. **Set up automated news fetching** (the `scripts/fetch-news.ts` exists but may need configuration)

### Low Priority

9. **Add analytics** (Plausible or Simple Analytics for privacy-first tracking)
10. **Add View Transitions** for smoother navigation (would require event listener cleanup)
11. **Create per-network OG images** for better social sharing of individual profiles
12. **Add Bing Webmaster Tools** submission alongside Google
