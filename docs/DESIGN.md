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

## 5. Other pages (apply after the profile is accepted)

| Page | Change |
|---|---|
| `/networks/` | Table-first directory: sortable columns (name, type, scale, pricing model, last checked), filters as chips, cards only on mobile. |
| `/compare/` | Keep the matrix; adopt the evidence chips and the facts typography; sticky first column and header; empty cells show "Not disclosed". |
| `/news/` | Dated list grouped by month, source domain visible on every item, pagination. |
| Guides | One reading column, hero illustration from `public/images/editorial/`, "Key takeaways" box with sourced numbers at the top. |

## 6. Acceptance for any design task

- Works at 375, 768, 1024, 1440 px with no horizontal scroll and no overlap.
- Keyboard reachable; visible focus; reduced-motion respected.
- No selector that `src/scripts/` depends on was renamed without updating the script.
- `scripts/agents/gate.sh` passes.
