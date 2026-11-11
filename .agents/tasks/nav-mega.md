---
id: nav-mega
role: designer
depends_on: []
---
# Goal
Replace the header dropdowns with premium mega-menus at the level of Stripe, Linear, Vercel and Apple. The owner's verdict on the current ones (screenshots: single-column list, grey translucent panel over the dark hero, one-line generic descriptions like "Explore alternatives to GLG."): "boring, sloppy, make it much better."

# Context
- Base `integration/design`. Current implementation: `src/components/Header.astro`, `src/components/ui/navigation.ts` (groups), `src/components/ui/Menu.astro`, `menu.ts`, `NavigationSheet.astro` (mobile), `header.ts`, `search-palette.ts`, `src/styles/fx.css`. Read `docs/DESIGN.md` (refusals list, motion registers, Effects API) first.
- Another task (i18n-core) is translating header labels in parallel. Keep the export shape of `navigation.ts` (extend it with new optional fields; do not rename existing keys) and keep every string in `navigation.ts`, not inline in markup, so the i18n merge stays mechanical.

# Reference (owner, 17:24): "I want something like this, but more top, better, smoother, better images"
Open and study these frames from the owner's screen recording of glg.com's header: `/Users/daniel/Expertnetworks.net/.agents/refs/nav-ref-howwehelp.jpg` and `nav-ref-about.jpg`. The pattern to adopt (do NOT copy GLG's images, wording, logo or exact styling; we are an independent reviewer of GLG):
- The menu opens as a **full-width panel** directly under the header bar (edge to edge, content in the site container), and the **page behind dims** (dark scrim ~45% + slight blur) until the menu closes.
- Each panel starts with a **large display title with an arrow-box link** to the section index (e.g. "Networks ->" linking to /networks/), then a thin rule.
- Left: **columns of grouped links** with group headings that carry a small accent square arrow; secondary links in a quieter size under each heading.
- Right: a row of **2-4 large image cards** (approx. 4:5, rounded 6-8 px, dark imagery, title top-left in white, small arrow chip top-right). Cards are the main visual hook.

# Design (ours, better than the reference)
1. **Motion.** The panel opens with a height reveal (clip-path inset from top, 220-260 ms, cubic-bezier(.2,.7,0,1)) while the scrim fades in; switching between triggers keeps the panel open and **morphs its height** smoothly while the old content fades out 6 px up and the new content fades/staggers in (title, columns, then cards 40 ms apart). Cards: subtle hover zoom on the image (scale 1.04 over 400 ms), lift + shadow, arrow nudge. Active trigger gets a pill highlight that slides between triggers. Hover-intent 80 ms open / 150 ms close; Esc closes; never flickers.
2. **Imagery.** Generate a coherent set of card images with Images 2.6 (Sunburst quality) in the art direction in DESIGN.md ("precision instruments for research": graphite, glass, machined metal, paper, one accent blue, studio light; no people, no logos, no fake readable text). 10-12 cards across menus, e.g. Networks: "Directory" (index-card cabinet), "Compare" (two dossiers under a lens), "Best expert networks" (calibrated scale), "Alternatives" (branching rail switches); AI: "AI hub" (glass chip over transcript sheets), "MCP" (machined connector ports), "Transcript libraries" (archive drawers with light), "AI calls & data" (waveform engraved on metal); Guides: "What is an expert network", "Pricing" (precision balance), "By buyer"; About: "Methodology" (calipers on a document), "Sources" (stacked citations). Save raw output in `.raw/<task-id>/`, ship optimised WebP/AVIF (<= 60 KB per card at 2x, lazy-decoded, preloaded on first header hover), with alt text that says the image is illustrative.
3. **Data inside the panel (our edge over the reference).** Group headings show live numbers from collections where meaningful ("Directory · 33 profiles", "Compare · 30 dimensions", "Updated Nov 2026"). The AI panel includes a compact live evidence ladder (Documented / Reported / Claimed / Announced / No public evidence counts from the `ai` collection, bars grow in on open) as one of its cards. Networks panel lists 6 provider names with logos from `public/logos/` in a quiet column.
4. **Surfaces.** Panel is solid paper-white (#fbfbfd) with a hairline bottom border and soft shadow on light pages; on dark-header pages (hero) the panel is still light for legibility (the reference does this too) and the header bar flips to light while open with a smooth colour transition. No grey translucent glass.
5. **Typography.** Display title in the site's display face at ~44-56 px, tight tracking; group headings 15 px semibold; links 14 px; descriptions specific (no "Explore X", "Browse Y", "Understand Z"), max 60 chars.
6. **Keyboard and a11y.** Triggers are buttons with `aria-expanded`/`aria-controls`; arrow keys move between triggers and within the panel; focus returns to the trigger on Esc; scrim click closes; `inert` on the page behind while open is NOT used (keep it simple: focus stays in panel via roving order). Reduced motion: instant open/close, no zoom.
7. **Mobile (<1024).** Full-screen sheet with the same groups as accordions and a horizontal scroller of the same image cards per section.
8. **Icons.** Small custom arrow chip and group icons as clean inline SVG (`currentColor`, 1.5 px stroke).

# Hard rules
- Numbers come from collections at build time; no hard-coded counts.
- Descriptions are specific and useful (no "Explore X", "Browse Y", "Understand Z"). Max 60 characters each.
- 60 fps; animate transform/opacity/clip-path and width/height only on the single panel (use FLIP with transforms if measuring); reduced motion = instant open/close.
- No layout shift of the header; panel never covers the search button; works at 1024-1920 widths.

# Scope
- src/components/Header.astro
- src/components/nav/
- src/components/ui/navigation.ts
- src/components/ui/Menu.astro
- src/components/ui/menu.ts
- src/components/ui/NavigationSheet.astro
- src/components/ui/header.ts
- src/styles/fx.css
- public/images/nav/
- docs/DESIGN.md
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] Full-width panel with page scrim, display title + arrow link, grouped columns, image cards; smooth open, height morph between triggers, staggered content
- [ ] 10-12 generated card images in the documented art direction (prompts in DESIGN.md), optimised; AI panel has the live evidence ladder card; numbers from data
- [ ] Custom icon set; specific descriptions <= 60 chars; numbers from data
- [ ] Header flips to light while a panel is open on dark-hero pages; checked on /, /networks/, /ai/, a profile
- [ ] Mobile sheet restyled with the same content
- [ ] `npm run verify` passes
