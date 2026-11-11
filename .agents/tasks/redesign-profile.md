---
id: redesign-profile
role: builder
depends_on: []
---

# Goal
The provider profile page follows the anatomy, evidence-label system, and component rules in `docs/DESIGN.md`, for every provider, with no content or schema change.

# Context
Read `docs/DESIGN.md` fully: it is the specification, and sections 2, 3, 4, 5, and 7 are binding. Read `docs/ARCHITECTURE.md` for how the page and its scripts work. The current page is `src/pages/networks/[slug].astro` (about 1,400 lines, one global style block, a left directory sidebar). The owner's bar: premium, native-app smooth, information-rich, nothing that looks generated. Problems to remove: a three-column layout (directory sidebar, content, right rail) that crowds the content; ten closed accordions that hide the substance; the directory sidebar on profile pages; green "Verified" badges and check-marked strength chips; fact cards with paragraphs inside and unequal heights; a 7-line intro paragraph above the fold; no visible sources list or "last checked" date.

Content files are being edited by other tasks right now. Do not touch them. Read fields defensively: any optional field may be absent; show "Not disclosed" rather than a blank or a crash. Verify with at least these profiles after building: `glg`, `alphasights`, `atheneum`, `zintro`, and one small provider.

# Scope
- src/pages/networks/[slug].astro
- src/components/profile/
- src/components/ui/
- src/scripts/
- src/styles/global.css
- tailwind.config.mjs
- docs/ARCHITECTURE.md

# Acceptance criteria
- [ ] Page is composed from the components named in `docs/DESIGN.md` section 4; `[slug].astro` is under 400 lines; no inline `style=`; no component over 200 lines
- [ ] Evidence chips follow section 2 exactly (labels, no check marks, no filled green badge); a one-line legend links to `/verification`
- [ ] Header shows "Last checked" from `lastUpdated` and a source count; a numbered Sources section renders `sourceNotes` with URLs as links
- [ ] Motion, the `Menu` component (provider switcher in the header band, evidence popovers), and the refusals in section 5 are implemented as written; deep-dive sections are open by default on desktop; the "Global leader"-style badge is shown only if the profile data carries it with a source, otherwise the plain category
- [ ] No left directory sidebar on profile pages; sticky section nav highlights the current section; "Similar providers" uses `relatedNetworks`
- [ ] Existing section ids are preserved; any selector used by scripts still exists or its script is updated in the same change
- [ ] Built HTML for the five test profiles has no empty fact cell and no horizontal overflow at 375 px (check the built CSS/HTML; describe how you checked)
- [ ] `docs/ARCHITECTURE.md` describes the new component structure
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
`src/content/`, `src/content.config.ts`, other pages, the site header and footer, new dependencies, new fonts, images.
