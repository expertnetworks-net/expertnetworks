---
id: showcase-home
role: builder
depends_on: []
---

# Goal
The home page is a Showcase page as defined in `docs/DESIGN.md` section 5 ("Two registers"): a scroll-told introduction to the site with rich, meaningful effects at 60 fps, that still loads fast and reads fully without motion.

# Context
Read `docs/DESIGN.md` fully; section 5 is binding (techniques, performance rules, refusals). The owner's reference for the level of craft is a luxury-brand site with pinned, scroll-driven scenes; match the craft, not the brand: this is a research site, dark hero surface `#0d0d0f`, one blue accent. Use the original illustrations in `public/images/editorial/` only as style reference; build the scenes as inline SVG so they can be animated. Read real numbers (provider count, comparison dimensions, news count, latest update) from the content collections at build time; never hard-code them.

Page script, top to bottom:
1. **Hero** (100svh, dark): headline rises word by word; behind it an SVG network of about 40 nodes with a cursor light; the search field and three entry links. The headline is the LCP element and is not animated in from invisible (animate transform only).
2. **Scene 1, pinned: "One question, the right expert."** A question node travels across the network; the path lights up; non-relevant nodes dim. One sentence of copy per step, three steps.
3. **Scene 2, pinned: "Compare on the same dimensions."** A matrix of five provider columns fills row by row as you scroll (pricing, compliance, AI, library, coverage); cells show real evidence-chip styles. Ends with the Compare call to action.
4. **Scene 3, pinned: "Claimed is not documented."** The evidence ladder: five rungs light up in order (No public evidence, Announced, Claimed, Reported, Documented), each with a one-line definition. Links to `/verification`.
5. **Numbers band**: counting figures (providers, dimensions, sourced news items, last update), staggered.
6. **Provider marquee** with real logos from `public/images/networks/` (only files that exist), then "Start with your use case" cards with staggered entrance.
7. **Latest signals**: three newest news items, hairline list.

# Scope
- src/pages/index.astro
- src/components/home/
- src/components/ui/
- src/styles/global.css
- src/scripts/
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] All scroll effects use CSS scroll-driven animations inside `@supports (animation-timeline: view())`; no scroll event listener; no animation or smooth-scroll library; no new dependency
- [ ] Only `transform`, `opacity`, `clip-path`, `stroke-dashoffset` are animated; `will-change` is not set permanently
- [ ] With `prefers-reduced-motion: reduce`, and with JavaScript disabled, every section shows its final state and all copy is readable (state how you checked in the built HTML/CSS)
- [ ] `index.astro` under 250 lines; scenes are components in `src/components/home/`; no inline `style=` except CSS custom properties for per-item delay
- [ ] Existing ids and selectors used by `src/scripts/` and by the header still work; the site search still works from the hero
- [ ] No filler copy; every sentence states something the site does. Numbers come from collections
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Other pages, the site header and footer, content files, new images or fonts, video.
