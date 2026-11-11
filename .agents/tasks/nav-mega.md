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

# Design
1. **Morphing panel.** One shared dropdown surface that animates its width, height and x-position between triggers (Stripe-style), with the content cross-fading/sliding 8 px in the direction of travel. Open 160-200 ms, cubic-bezier(.2,.7,0,1); close faster. A caret/arrow tracks the active trigger. Hover intent delay 80 ms open / 150 ms close; never flickers between adjacent triggers.
2. **Surface.** Match the header tone: on dark headers a dark glass panel (rgba(18,19,24,.78), `backdrop-filter: blur(24px) saturate(180%)`, 1 px inner highlight border rgba(255,255,255,.08), layered shadow); on light headers a light glass equivalent. No muddy mid-grey gradients.
3. **Networks menu (3 columns).**
   - Primary: Directory, Compare, Best expert networks, each with a custom line icon (1.5 px stroke, duotone accent), a sharp one-line description that says something specific, and a live number from collections (e.g. "33 profiles", "30 dimensions", "Updated Nov 2026").
   - "Profiles": 6 most-viewed-or-largest providers (pick by a documented data rule, e.g. the compare default slugs) with their logo from `public/logos/`, name and HQ city; "All 33 networks ->".
   - Featured card: an editorial image (use existing `public/images/editorial/*` or generate a new one with Images 2.6 in the art direction in DESIGN.md) with title "Alternatives" and compact chips GLG / AlphaSights / Third Bridge linking to the alternatives pages.
4. **AI menu (2 columns).** Left: AI in expert networks, MCP integrations, Transcript libraries, AI calls and data, each with icon + specific description. Right: a live mini evidence ladder built from the `ai` collection (Documented / Reported / Claimed / Announced / No public evidence counts as small bars that grow in on open) and the latest AI-tagged news item with its date.
5. **Guides menu.** "Start here" (What is an expert network, Pricing) and "By buyer" (Private equity, Hedge funds, Consulting) with persona icons; a featured guide card with image.
6. **About menu.** Methodology/verification, Sources, About, Privacy; a small trust strip with numbers from data (profiles verified, sources cited, last review date).
7. **Item interactions.** A single sliding highlight that moves between items under the pointer (not a grey slab per item), icon micro-motion on hover (2-3 px shift or stroke draw), arrow nudge on CTAs, `fx-spotlight` on the featured card. Keyboard: arrow keys move within the panel, Esc closes and returns focus, Tab order logical, `aria-expanded`, `aria-controls`, roving focus. Touch/mobile keeps `NavigationSheet` but restyle it with the same icons, numbers and featured cards in an accordion.
8. **Icons.** A coherent custom set (16-24 px, 1.5 px stroke, rounded joins) in `src/components/nav/icons/` as inline SVG components. You may draft them with Images 2.6 SVG export, but the final SVGs must be clean, hand-tidied paths with `currentColor`.

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
- [ ] Morphing shared panel with caret, hover intent, keyboard support and reduced-motion behaviour
- [ ] Networks (3 col with logos + featured), AI (live evidence ladder + latest AI news), Guides, About menus as specified
- [ ] Custom icon set; specific descriptions <= 60 chars; numbers from data
- [ ] Dark and light header variants both look finished (state pages checked)
- [ ] Mobile sheet restyled with the same content
- [ ] `npm run verify` passes
