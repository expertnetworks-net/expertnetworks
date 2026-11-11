---
id: design-editorial-heroes
role: designer
depends_on: []
---

# Goal
Four original editorial hero illustrations exist in `public/images/editorial/`, in one consistent visual style that fits the site, ready to be wired into pages by a later task.

# Context
Pilot of image generation with the built-in image generation tool. Read `tailwind.config.mjs` and `src/styles/global.css` for the palette (dark surface `#0d0d0f`, blue accent). The site is independent research: the look is calm, precise, editorial — not stock-photo, not sci-fi.

Images to make (16:9, 1600x900):
1. `what-is-an-expert-network` — the idea of connecting a question to the one person who knows.
2. `pricing` — comparing cost structures (calls, subscriptions, transcripts) as abstract shapes.
3. `compare` — several providers evaluated side by side on the same dimensions.
4. `news` — a signal feed: discrete events on a timeline.

Style rules for all four: abstract or diagrammatic; dark background compatible with `#0d0d0f`; one blue accent family; no text, letters, or numbers; no logos or brand marks; no recognizable people or faces; no photorealism.

# Scope
- public/images/editorial/

# Acceptance criteria
- [ ] Four files `public/images/editorial/<name>.webp` (or `.png` if WebP conversion is not possible), 1600x900, each 300 KB or less
- [ ] Raw generations kept in `.agents/runs/design-editorial-heroes/images/` (git-ignored), not in `public/`
- [ ] `checks` lists, per image: the exact prompt used, the tool used to convert/optimize, final size in KB, and suggested `alt` text
- [ ] The four images share palette and style (state how you checked)
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Editing any page, layout, or CSS. Provider logos. Open Graph images.
