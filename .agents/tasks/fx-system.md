---
id: fx-system
role: builder
depends_on: []
---

# Goal
A shared, site-wide effects system exists and is active on every page: page transitions, scroll progress, header shrink, spotlight cards, tilt, magnetic buttons, reveal-on-view, counting numbers, drawn lines, animated underlines, sliding indicators, shimmer, focus gradient borders — all at 60 fps and all respecting reduced motion.

# Context
Read `docs/DESIGN.md` section 5 fully, including the table "Workbench pages … use the shared effects system". That table is the spec. Other workers are rebuilding pages in parallel; they and future pages opt in through classes and data attributes that this task defines, so the API must be small and documented.

API (implement exactly, document in `docs/DESIGN.md` under a new heading "Effects API"):
- Classes: `fx-reveal` (with optional `style="--fx-i: <index>"` for stagger), `fx-spotlight`, `fx-tilt`, `fx-magnetic`, `fx-underline`, `fx-shimmer`, `fx-focus-ring`.
- Attributes: `data-fx-count` on an element whose text is a number (counts from 0 to that value; keeps prefix/suffix like `~`, `+`, `M`, `%`); `data-fx-draw` on an SVG path or line.
- Automatic, no opt-in: page transitions, scroll progress bar on pages taller than 2 viewports, header shrink.
- Apply the classes to existing shared elements you own: buttons in `src/styles/global.css` utility classes if present, links in body text, cards in `src/components/` that are not being rebuilt (Footer, VsComparison, TrackedNetworksMarquee).

Implementation rules:
- CSS first: scroll-driven animations (`animation-timeline: view()` / `scroll()`) inside `@supports`; `@property` for counters; `@view-transition { navigation: auto; }` with named groups and custom `::view-transition-*` keyframes.
- JS only for pointer-driven effects (spotlight, tilt, magnetic): one delegated `pointermove` listener on `document`, throttled with `requestAnimationFrame`, writing CSS variables; disabled for `(pointer: coarse)` and `prefers-reduced-motion: reduce`. Under 3 KB minified; no dependency.
- Animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`, and registered custom properties. No `will-change` left on idle elements. No layout reads inside the pointer handler except one cached `getBoundingClientRect` per entered element.
- Every effect's final state is the default style: with no JS, no `@supports`, or reduced motion, the page looks finished.

# Scope
- src/styles/fx.css
- src/scripts/fx.ts
- src/components/fx/
- src/pages/styleguide/
- src/layouts/BaseLayout.astro
- src/components/Footer.astro
- src/components/VsComparison.astro
- src/components/TrackedNetworksMarquee.astro
- docs/DESIGN.md
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] `fx.css` and `fx.ts` are loaded on every page through `BaseLayout.astro` (one import each)
- [ ] A test page `src/pages/styleguide/fx.astro` (add `noindex`) shows every effect with a label, for review
- [ ] Reduced motion and no-JS: the style guide page shows final states (state how you checked in built CSS)
- [ ] `fx.ts` minified size reported in `checks`; under 3 KB
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Page-specific redesigns (other workers), content files, new dependencies or fonts.
