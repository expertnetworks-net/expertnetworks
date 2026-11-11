---
id: logos-official
role: designer
depends_on: []
---

# Goal
Every provider in the list below has a crisp, correctly padded logo file taken from the provider's own public assets, with its source recorded.

# Context
Only 11 of 33 providers have a logo file, and several are tiny (1–4 KB) or render cropped. Logos identify the companies we write about; they must be the real marks, unmodified, from the provider's own site, press kit, or official social profile. Never generate, redraw, or recolour a logo. If no official asset can be found, leave the provider without a file and say so.

Providers (slugs): glg, alphasights, third-bridge, guidepoint, dialectica, alphasense-tegus, atheneum, capvision, coleman-research, prosapient, newtonx, lynk, inex-one, techspert, maven, visasq, arches, zintro, mosaic, stax.

# Scope
- public/images/networks/
- docs/LOGO-SOURCES.md

# Acceptance criteria
- [ ] One file per provider: `public/images/networks/<slug>.svg` preferred, else `<slug>.png` at 256 px or more on the short side, 60 KB or less, transparent or original background, not cropped
- [ ] Existing file names are kept when a file is replaced (profiles reference them); new files follow `<slug>.<ext>`
- [ ] `docs/LOGO-SOURCES.md` has a table: slug, file, source URL, date fetched, notes; plus a list of providers where no official asset was found
- [ ] `checks` lists each provider with the source URL
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Editing profile JSON (a later task wires new files in). Any generated or edited mark. Providers not in the list.
