---
id: header-menus
role: builder
depends_on: []
---

# Goal
The site header follows `docs/DESIGN.md` section 5 (menus) and section 4 (header rule): translucent material, real dropdown menus, Cmd/Ctrl+K search, no overlap at any width.

# Context
Read `docs/DESIGN.md` sections 4 and 5. Current header: `src/components/Header.astro`. A `Menu` primitive may already exist in `src/components/ui/` from the profile work; reuse or extend it there so the profile switcher and the header share one implementation.

Menus (4–6 items each, each with a one-line description; destinations must exist in `src/pages/`):
- **Networks**: Directory, Compare, Best expert networks, Alternatives pages.
- **AI**: AI in expert networks (`/ai/`), and the AI guides if they exist.
- **Guides**: What is an expert network, Pricing, For hedge funds, For private equity, For consulting.
- **About**: About, Methodology/verification, Sources, Disclaimer.
Plus News as a plain link, and a search button that opens a command palette (Cmd/Ctrl+K) searching providers, pages, and news titles from a build-time JSON index.

# Scope
- src/components/Header.astro
- src/components/ui/
- src/layouts/BaseLayout.astro
- src/pages/search-index.json.ts
- src/styles/global.css
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] Full navigation from 1024 px; below that a menu button opens a sheet with the same groups; no overlap at 768, 1024, 1280, 1440 px
- [ ] Menus: open from trigger with origin-aware scale and fade (180 ms enter, faster exit), keyboard complete (arrows, type-ahead, Esc returns focus), `aria` correct; Popover API where possible; no library
- [ ] Header and menus use the translucent material; header carries `view-transition-name: site-header`
- [ ] Command palette: opens on Cmd/Ctrl+K and on the search button, fuzzy-matches providers and pages, Enter navigates, works without network
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Page content, profile components other than shared `ui/` primitives, the footer.
