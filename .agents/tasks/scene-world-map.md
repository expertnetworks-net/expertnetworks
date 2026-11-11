---
id: scene-world-map
role: designer
depends_on: []
---
# Goal
Replace the second homepage section ("One question, the right expert.", `QuestionScene.astro` + `NetworkGraph.astro`) with a full scroll-driven story built around a world map / globe that locates the expert networks. The owner's words: "something must happen when you scroll down, a world map that locates the expert networks, WOAH, full animation storytelling, very visual graphics while scrolling." The current grid of dots with one blue polyline is rejected as weak.

# Concept (build this)
A pinned section (about 400-500 vh of scroll) with a sticky full-viewport stage. Left: short narrative text that changes per step. Right/centre: a dotted 3D globe drawn on `<canvas>` (orthographic projection of a land-dot sphere, like the GitHub/Stripe globes), dark "night" palette continuing the hero (graphite background, land dots in soft white/blue, accent #4f8ff7). Scroll progress drives every change; nothing is on a timer except a slow idle spin.

Steps (each step lands crisply, < 300 ms of scroll, eased cubic-bezier(.2,.7,0,1)):
1. **One question.** An illustrative question card floats in ("Example: How are Taiwanese foundries handling advanced-packaging capacity?"), labelled "Example". The globe spins slowly.
2. **Where the expertise sits.** Pins rise from the globe at each provider's headquarters city (from data, see below), one wave per continent as the globe rotates Americas -> Europe -> Asia-Pacific. A counter shows "N networks, M headquarters cities" from data; region counters tick up. Hovering/tapping a pin shows the provider name and HQ city.
3. **Narrow the field.** The question's region (Asia-Pacific in the example) glows; pins of providers whose `regionStrength` covers that region stay lit and grow, the others dim to 20%. Great-circle arcs draw from the question region to those providers' HQs with travelling light pulses along the arcs.
4. **Read the profile.** The globe eases back and shrinks to one side; the filtered providers (max 5, ordered alphabetically, never a ranking) appear as profile cards with name, HQ, coverage and the existing evidence chips, each linking to `/networks/<slug>/`. A line says "Illustrative filter on public profile data. Not a ranking." and a CTA "Filter all 33 networks" to `/networks/`.

# Data rules (facts only)
- HQ city comes only from each profile's `headquarters` field. Add `src/data/geo/hq.json` mapping slug -> `{ city, lat, lon }` for every provider whose HQ is disclosed; coordinates are the city centre (public geographic fact). Skip providers with undisclosed HQ and say so in a footnote count ("N of 33 have a disclosed HQ").
- Coverage comes only from `regionStrength`. Map its values to regions explicitly in code with a documented table; if a value is ambiguous, the provider is not highlighted in step 3.
- No provider claims inside graphics beyond name, HQ city and the coverage value. No logos on the globe.
- Land geometry: generate the dot sphere at build time from Natural Earth via `world-atlas` (110m, TopoJSON) + `topojson-client` as devDependencies (both permissive licences; record them in `docs/ARCHITECTURE.md`), output a compact JSON of land dot coordinates (~6-10k dots, < 120 KB gzipped) under `src/data/geo/`. No runtime fetch from third parties, no map tiles, no API keys.

# Rendering and motion
- Canvas 2D, devicePixelRatio capped at 2, one requestAnimationFrame loop that runs only while the section is on screen. Back-face culling of dots; dots shaded by facing angle for depth; subtle atmosphere rim glow (cached radial sprite). Pins: short vertical light beams + head glow. Arcs: quadratic great-circle approximation with an animated dash/pulse; additive blending for light.
- Use the shared fx system where it fits (`fx-reveal`, `data-fx-count` for counters, `fx-spotlight` on the profile cards).
- 60 fps on a MacBook Air at 1440x900 and a mid-range phone; add `?fxdebug` readout for this scene too.
- `prefers-reduced-motion`: no pinning, no spin; render the four steps as four stacked static frames (globe drawn once per step). No-JS: a static SVG/PNG poster of the globe with pins plus the step text, fully readable.
- Mobile 375: stage stacks text over globe, globe 90vw, same steps; touch tap on pins.
- The section must look finished at every scroll position (no empty frames, no half-drawn states while scrolling fast).

# Scope
- src/components/home/QuestionScene.astro
- src/components/home/NetworkGraph.astro
- src/components/home/globe/
- src/scripts/globe-scene.ts
- src/data/geo/
- scripts/build-geo.mjs
- package.json
- package-lock.json
- docs/DESIGN.md
- docs/ARCHITECTURE.md

Do NOT edit `src/pages/index.astro`, `src/components/home/Hero.astro`, `src/components/ParticleHero.astro`, `src/components/home/home.css` or any other scene; keep the component name `QuestionScene` and its props so the homepage needs no change. Put all styles in `src/components/home/globe/globe.css`.

# Acceptance criteria
- [ ] Pinned 4-step scroll story with the dotted globe, HQ pins from data, coverage filter from `regionStrength`, arcs, and linked profile cards
- [ ] `src/data/geo/hq.json` covers every disclosed HQ; region mapping table documented in DESIGN.md
- [ ] Land-dot data generated at build time from world-atlas; sizes reported
- [ ] `?fxdebug` fps at 1440 and 375 reported; reduced-motion and no-JS fallbacks described with how they were checked
- [ ] Copy says "Example" for the question and "Not a ranking" for the shortlist
- [ ] `npm run verify` passes
