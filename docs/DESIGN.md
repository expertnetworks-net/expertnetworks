# Design

This file owns: the visual direction, the evidence-label system, page anatomy, and component rules. Tokens live in `tailwind.config.mjs` and `src/styles/global.css`; this file says how to use them.
Decided by the orchestrator on 2026-11-11 with the owner's authorization. Change it by pull request, not ad hoc in a page.

## 1. Direction: the research dossier

The site is a reference work, not a marketing page. A profile should read like an analyst's one-pager: facts first, each with its evidence level, prose second, decoration last.

| Principle | Meaning in practice |
|---|---|
| Facts before prose | The first screen of a profile answers: what is it, how big, how it charges, who it fits, how fresh the data is. No paragraph longer than 3 lines above the fold. |
| Evidence is part of the design | Every figure carries its evidence level in the same place and the same style. The reader never guesses what "verified" means. |
| One reading column | Body text 65–75 characters wide. Wide screens get a facts rail, not wider text. |
| Quiet chrome | One accent colour. Borders 1 px, low contrast. No shadows on static cards. Motion only on state change, 150–200 ms, and none with `prefers-reduced-motion`. |
| Same anatomy everywhere | Every profile has the same sections in the same order. Missing data shows "Not disclosed" with its evidence level, never a blank. |

## 2. Evidence labels (one system, site-wide)

| Level | Label | Meaning | Style |
|---|---|---|---|
| `verified` | Sourced | A primary or reputable source says it, and we link it. | Neutral grey text, small link icon. Not green: sourced is the default, not a prize. |
| `positioning` | Company-stated | Only the provider says it. | Amber outline. |
| `inference` | Our assessment | Editorial judgment from the evidence. | Blue outline. |
| `partially-unverifiable` | Unconfirmed | We could not confirm it. | Grey dashed outline. |

Rules: a label is a 12 px text chip after the value, never a filled badge and never a check mark. Check marks are reserved for "feature present" in the compare matrix. Strength and fit chips are editorial: plain chips, no check mark. Each chip opens the matching entries of `sourceNotes` (popover on desktop, sheet on mobile). The legend is one line under the profile header with a link to `/verification`.

## 3. Profile page anatomy

Order is fixed. Section ids stay as they are today; scripts and deep links depend on them.

1. **Header band**: logo (64 px, square, 12 px radius, neutral background, never cropped), name (h1), category line, one-sentence summary (max 160 characters, from `description`), actions (Compare, Visit website). Right-aligned: "Last checked <date>" and "<n> sources".
2. **Key facts grid**: 6–8 cells, 2 columns on mobile, 4 on desktop, equal height. Cell = label (11 px caps), value (20 px semibold, max 2 lines), evidence chip. Long explanations go to the section below, never inside a cell.
3. **Section nav**: sticky, horizontal, scrollable on mobile; highlights the section in view. Replaces the provider-directory sidebar on profile pages. The directory stays reachable from "All networks" and from a "Similar providers" block.
4. **Overview** (prose, max 2 short paragraphs), then **Services**, **Buyer fit**, **Strengths**, **Watch-outs** as two-column definition lists or plain chips.
5. **Deep dive**: pricing, compliance, AI, history. Collapsible on mobile, open on desktop. History is a vertical timeline with year, event, and source link.
6. **Recent news**, **Similar providers** (3 cards), **Compare** call to action.
7. **Sources**: numbered list built from `sourceNotes`: title or domain, URL, date read. This section is the proof; give it the same weight as the others.

Layout: content column max 760 px; from 1200 px wide, a 280 px right rail holds the facts summary and "On this page". No left sidebar on profile pages.

## 4. Component rules

- Build the page from components in `src/components/profile/`: `ProfileHeader`, `FactGrid`, `EvidenceChip`, `SectionNav`, `Timeline`, `SourceList`, `SimilarProviders`. No component over 200 lines; no inline `style=`; no page-level `<style is:global>` for things that are tokens.
- Type scale: 12 / 14 / 16 / 20 / 28 / 40. Body 16 px, line height 1.6. Headings use weight, not colour.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 40 / 64. Section gap 64 px desktop, 40 px mobile.
- Touch targets 44 px. Focus ring 2 px accent, offset 2 px. Contrast AA at minimum.
- Images: every `<img>` has `alt`, `width`, `height`, `loading="lazy"` below the fold. Provider logos come from the provider's own public assets (see `docs/LOGO-SOURCES.md`), never generated. Illustrations are original and abstract (see `public/images/editorial/`).
- Header: full navigation from 1024 px; below that, the menu button only. No overlap at any width.

## 5. Premium feel: motion, menus, and what we refuse

The reference is a well-made native macOS app: fast, quiet, exact. Premium comes from precision and response time, not from effects.

### Motion

| Rule | Value |
|---|---|
| Animate only `transform` and `opacity` | Never width, height, top, left, margin, or box-shadow. This keeps animation on the compositor at the display's refresh rate (60–120 Hz). |
| Durations | 120 ms hover and press; 180 ms menus, popovers, chips; 260 ms sheets and page-level transitions. Nothing over 320 ms. |
| Easing | Enter: `cubic-bezier(0.2, 0.8, 0.2, 1)`. Exit: `cubic-bezier(0.4, 0, 1, 1)`, 30% shorter than enter. No bounce, no overshoot. |
| Page navigation | Cross-document view transitions (already in `global.css`): 180 ms cross-fade of the content area; header and section nav stay fixed (`view-transition-name`). Profile to profile: the logo and name morph. |
| Press feedback | Buttons and cards scale to 0.98 on `:active`. Hover changes background or border, not size. |
| Scroll | Native scrolling only. No scroll hijacking, no parallax, no reveal-on-scroll for content. `scroll-behavior: smooth` for in-page anchors; `scroll-margin-top` on every section. |
| Reduced motion | `prefers-reduced-motion: reduce` removes transforms and cuts durations to 0. |
| Speed | No layout shift (set `width`/`height` on media, reserve space for chips). Prefetch same-origin links on hover (speculation rules are already in `BaseLayout`). Interaction to next paint under 100 ms. |

### Menus, dropdowns, popovers

- One component: `Menu` (also used by the header, the provider switcher, filters, and evidence popovers). Opens from its trigger: `transform-origin` at the trigger, scale 0.96 → 1 with opacity, 180 ms. Closes on outside click, `Esc`, and focus leaving.
- Surface: `background: color-mix(in srgb, var(--surface) 88%, transparent)`, `backdrop-filter: saturate(180%) blur(20px)`, 1 px hairline border, 12 px radius, one soft shadow. This translucent material is used for the sticky header and floating menus only, never for static cards.
- Keyboard: arrow keys move, type-ahead selects, `Enter` activates, `Esc` closes and returns focus. `role="menu"` / `listbox` with correct ARIA. Prefer the native Popover API and anchor positioning; no library.
- Provider switcher: the name in the profile header opens a searchable menu of all providers (replaces the left sidebar). `Cmd/Ctrl+K` opens the same search globally.
- Header: "Networks", "Compare", and "Guides" open menus with 4–6 real destinations each, with one-line descriptions. No mega-menu.

### Information density

A profile must be worth the visit: key facts, pricing model, compliance, AI capabilities, coverage, history timeline, recent news, similar providers, sources. Dense like a terminal, legible like a book: tabular figures (`font-variant-numeric: tabular-nums`), aligned columns, consistent units.
Deep-dive sections are open by default on desktop. Do not hide the page behind ten closed accordions.

### What we refuse (it reads as generated or cheap)

- Decorative gradients, glows, animated blobs, particle backgrounds behind text.
- Glass cards everywhere, neon accents, more than one accent colour on a screen.
- Emoji as icons; mixed icon sets. One icon set, 1.5 px stroke, 20 px grid.
- Filler copy ("Unlock insights", "Seamlessly", "Powerful"). Labels are nouns; buttons are verbs.
- Badges that imply a judgment we did not make ("Global leader", "Top rated") unless the profile sources it.
- Stock photos, generated people, generated logos.
- Centered everything. Text is left-aligned; numbers are right-aligned in tables.

## 6. Other pages (apply after the profile is accepted)

| Page | Change |
|---|---|
| `/networks/` | Table-first directory: sortable columns (name, type, scale, pricing model, last checked), filters as chips, cards only on mobile. |
| `/compare/` | Keep the matrix; adopt the evidence chips and the facts typography; sticky first column and header; empty cells show "Not disclosed". |
| `/news/` | Dated list grouped by month, source domain visible on every item, pagination. |
| Guides | One reading column, hero illustration from `public/images/editorial/`, "Key takeaways" box with sourced numbers at the top. |

## 7. Acceptance for any design task

- Works at 375, 768, 1024, 1440 px with no horizontal scroll and no overlap.
- Keyboard reachable; visible focus; reduced-motion respected.
- No selector that `src/scripts/` depends on was renamed without updating the script.
- `scripts/agents/gate.sh` passes.
