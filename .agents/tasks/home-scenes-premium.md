---
id: home-scenes-premium
role: designer
depends_on: []
---
# Goal
The homepage scroll scenes below the hero must feel like a flagship product page (Apple / Linear / Stripe level), not a template. The owner's verdict on the current "One question, the right expert." scene: "something happens when you scroll, but it is very soft, very ugly, very over." Rebuild the scenes around generated, art-directed imagery and scroll-scrubbed motion.

# Context
- Base: `integration/design`. Scenes live in `src/components/home/` (QuestionScene, NetworkGraph, EvidenceScene, CompareScene, NumbersBand, UseCases, LatestSignals, ProviderMarquee, CountReel) with styles in `home.css` and `src/scripts/home-showcase.ts`.
- Another task owns `src/components/home/Hero.astro`, `src/pages/index.astro` and `src/components/ParticleHero.astro`: do not edit those three files. Keep scene order and component names so index.astro needs no change.
- Read `docs/DESIGN.md` fully: research-dossier direction, the refusals list (no AI-sloppy gradients, no stock-photo people, no glowing brains, no robot hands), evidence labels, two motion registers. Read `.agents/roles/designer.md`.
- OpenAI Images 2.6 is available in this Codex session: high-quality stills, SVG export, and animated GIF output (2-16 frames, prompt describes subject, motion and loop).

# Art direction (decide and document in DESIGN.md before generating)
One coherent visual world across all scenes, e.g. "precision instruments for research": dark graphite and paper-white surfaces, machined metal and glass, fine engraved grid lines, a single accent blue (#4f8ff7), soft studio light, shallow depth of field. Abstract and object-based: dossiers, index cards, magnifier lenses, routing diagrams as physical objects, map fragments, transcript sheets with redacted lines. No people, no logos, no readable fake text, no fake data.

# What to build
1. **(Moved to task scene-world-map: do not edit QuestionScene.astro or NetworkGraph.astro.)** Former brief, ignore: Replace the soft fade with a pinned, scroll-scrubbed sequence (sticky stage, `position: sticky`, progress from `animation-timeline: view()` with a JS fallback): a single research question card travels through 3 steps (Frame the question -> Narrow the field -> Read the profile) while the generated visual transforms (e.g. a dossier opening, cards filtering through a lens, a profile sheet resolving into focus). Text for each step crossfades crisply with the visual; no blur-mush, no slow 2 s fades. Each step change lands in under 300 ms of scroll.
2. **Frame sequences from Images 2.6.** Apply this to the Evidence scene (a lens sweeping over a sourced document, evidence labels resolving). For the scrubbed visual, generate a 12-16 frame animation (GIF output) per step or one continuous sequence, then extract frames with `ffmpeg` and encode to WebP (`cwebp -q 78`) at 1x and 2x, preloaded lazily when the scene is within 1 viewport. Draw the current frame to a `<canvas>` from scroll progress (no video). Total per scene <= 900 KB at 2x; poster frame is a normal `<img>` with alt text so no-JS and reduced motion get a finished still.
3. **Stills for the other scenes.** At least 6 new generated stills (Sunburst quality) in the same world: evidence scene (lens over a sourced document), compare scene backdrop, numbers band texture, use-cases cards (one per buyer type: PE, hedge fund, consulting, corporate), latest-signals header. Optimise to WebP/AVIF, width-appropriate `srcset`.
4. **Motion polish everywhere in these scenes:** depth parallax on the visuals (transform only), staggered reveals with crisp easing (cubic-bezier(.2,.7,0,1), 400-600 ms), counters via the shared `data-fx-count`, and the shared fx classes (`fx-spotlight`, `fx-tilt`) on cards. 60 fps; compositor-only properties.
5. Save every raw generation, prompt and the selected frame list under `.agents/runs/home-scenes-premium/images/`, and record prompts in `docs/DESIGN.md` (new "Generated imagery" section) so the set can be extended consistently.

# Hard rules
- Content stays factual: imagery is illustrative and labelled as such in alt text; no provider names, logos or claims inside images.
- `prefers-reduced-motion`: final still frames, no scrubbing. No-JS: poster images, readable text.
- Lighthouse performance on the home must not drop more than 5 points vs base (report both numbers). LCP element remains the hero headline, not a scene image.
- Mobile 375: scenes stack, sequences still scrub or fall back to stills; nothing overflows horizontally.

# Scope
- src/components/home/EvidenceScene.astro
- src/components/home/CompareScene.astro
- src/components/home/NumbersBand.astro
- src/components/home/UseCases.astro
- src/components/home/LatestSignals.astro
- src/components/home/home.css
- src/components/home/scenes/
- src/scripts/home-showcase.ts
- src/scripts/frame-scrub.ts
- public/images/home/
- docs/DESIGN.md

# Acceptance criteria
- [ ] Evidence scene uses a scroll-scrubbed generated frame sequence on canvas (the frame-scrub technique from item 2), with crisp text transitions
- [ ] >= 6 new generated stills in one documented art direction, used in the other scenes
- [ ] Prompts and raw outputs saved; DESIGN.md "Generated imagery" section written
- [ ] Reduced motion and no-JS show finished stills
- [ ] Per-scene weight <= 900 KB at 2x; Lighthouse delta reported
- [ ] `npm run verify` passes
