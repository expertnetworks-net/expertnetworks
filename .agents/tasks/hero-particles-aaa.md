---
id: hero-particles-aaa
role: designer
depends_on: []
---
# Goal
The owner loves the live homepage hero: dark canvas particle network with pointer repulsion and a click pulse (`src/components/ParticleHero.astro`). Make it the opening of the new homepage again and take the particle system to a flagship, "AAA" level: the click must feel spectacular, the field must feel deep and alive, and it must stay at 60 fps.

# Context
- Base branch is `integration/design`. Its `src/pages/index.astro` is the new showcase home (scroll scenes in `src/components/home/`). Its opening hero (`src/components/home/Hero.astro`, "Find the expertise. Check the evidence.") replaced the live hero. The owner wants the live hero back.
- The live hero is in production: run `git show main:src/pages/index.astro` and copy its hero composition exactly: status pill "Independent research · No paid placements", the three-line headline with the gradient third line ("Compare expert networks / the way serious buyers / actually evaluate them"), the subhead, the search field with the blue Search button, the three chevron links, the four-cell stat band (providers profiled, comparison dimensions, market signals logged, latest data update; all computed from collections, never hard-coded), and the line "No paywalls. No sign-up required. No affiliations. Public-source research."
- Keep every showcase scene below the hero unchanged. Remove `Hero.astro` from the home only if nothing else imports it.
- `ParticleHero.astro` is also used on `/networks/`, `/compare/`, `/expert-network-pricing/` and `/what-is-an-expert-network/`. Add a prop `intensity: 'showcase' | 'workbench'` (default `workbench`). Home uses `showcase`. Workbench keeps today's behaviour plus the cheaper upgrades; showcase gets everything.
- Read `docs/DESIGN.md` section 5 (two motion registers, compositor-only rule, reduced motion) before writing code.

# Upgrades (showcase intensity)
1. Click shockwave: an expanding ring (radius eased out over ~900 ms) that pushes particles outward with falloff, and brightens every connection line it crosses, in accent blue (#4f8ff7 range), fading back to white.
2. Spark burst: 24-40 short-lived spark particles per click with velocity, drag and alpha decay (life ~700 ms), drawn with additive blending (`globalCompositeOperation = 'lighter'`). Pool them; never allocate per frame.
3. Chain reaction: nodes hit by the wave light up for ~400 ms and pass a weaker secondary pulse to their linked neighbours (max 2 hops).
4. Hold to charge: pointer held >250 ms gathers nearby particles toward the pointer with a growing glow; release fires a stronger shockwave scaled by hold time (cap 1.5 s).
5. Depth: three layers (far/mid/near) with different size, alpha, speed and connection distance; subtle parallax on pointer move and on scroll (translate the far layer less).
6. Cursor glow: a soft radial light following the pointer with easing, revealing extra faint connections inside its radius (the existing reveal layer, made smoother).
7. Idle life: when no pointer for 6 s, an occasional soft auto-pulse somewhere off-text, at most once every 4 s, so the hero never looks static.
8. Touch: tap triggers the shockwave + sparks; no hold-to-charge; fewer sparks.

Workbench intensity gets 1, 2 (half the sparks) and 6 only.

# Hard rules
- 60 fps target on a MacBook Air at 1440×900 and on a mid-range phone. Use a uniform spatial grid for neighbour/connection lookup (no O(n²) over all particles). Batch line drawing by alpha bucket. DPR cap stays 2. Pause when the hero is off-screen or the tab is hidden (keep the existing logic).
- Add a debug FPS readout behind `?fxdebug` (not shown otherwise) and report measured fps at 1440 and 375 widths in your result `checks`.
- `prefers-reduced-motion: reduce`: draw one static, finished frame (no animation, no click effects). No-JS: the dark gradient background alone still looks finished.
- The canvas is decorative: `aria-hidden="true"`, pointer events must not block the search field, links or buttons (clicks on interactive elements do not fire the shockwave; clicks on empty hero space do).
- Text stays readable: keep a dark scrim/vignette behind the headline area so sparks never reduce contrast below WCAG AA.
- No dependencies. Plain TypeScript in the component's script. Keep the file organized (config block at top, then pools, grid, update, draw).

# Scope
- src/components/ParticleHero.astro
- src/components/home/
- src/pages/index.astro
- src/styles/fx.css
- public/images/cosmos/
- docs/DESIGN.md
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] Home opens with the live hero composition (copy, search, links, stat band) on `intensity="showcase"`, followed by the existing showcase scenes
- [ ] Stat band numbers come from collections (`getCollection`), not literals
- [ ] All 8 showcase upgrades implemented; workbench pages get 1, 2 (reduced) and 6
- [ ] `?fxdebug` FPS readout; measured fps reported for 1440 and 375
- [ ] Reduced motion renders a static frame (state how you checked)
- [ ] Clicking the search field, Search button or links never triggers the shockwave
- [ ] `npm run verify` passes; `docs/DESIGN.md` documents the `intensity` prop and the particle effects
