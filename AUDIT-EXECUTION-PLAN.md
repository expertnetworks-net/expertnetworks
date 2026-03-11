# ExpertNetworks.net — Audit Execution Plan

**Generated:** 2026-03-11
**Audit scope:** Full-site product audit across 56 pages
**Ship-readiness score:** 7.5 / 10 → target 9.0+ for CPO review

---

## 1. Bug Backlog

Issues that represent incorrect behavior, broken contracts, or visible defects.

| # | Title | Page / Component | Severity | Exact Issue | Expected Behavior | Recommended Fix | Owner | Effort | Priority |
|---|-------|-----------------|----------|-------------|-------------------|-----------------|-------|--------|----------|
| BUG-01 | Terminology mismatch in core trust framework | `/sources` + `/verification` | Critical | `/sources` uses "Verified, Positioned, Inferred, Estimated". `/verification` uses "Verified, Positioning, Inference, Partially Unverifiable". Sources page claims "This system matches the site's verification framework" — it does not. | One canonical set of four tier names used consistently across all pages. | Align both pages to: **Verified, Positioned, Inferred, Estimated**. Update `/verification` tier names and descriptions to match. Remove or correct the "matches" claim on `/sources`. | Content + Frontend | S | P0 |
| BUG-02 | SSR/client provider count mismatch | `/compare` (`compare.astro` + `compare-page.ts`) | Medium | `compare.json` defaults array may contain 6 slugs but client JS caps at 5 via `.slice(0, 5)`. SSR renders "6/5" chip count, then client corrects to "5/5" — visible flash of incorrect state. | Server-rendered default state matches client cap (5 providers max). | Ensure `compare.json` `defaults.networks` array has exactly 5 entries. Verify SSR template reads the same cap. | Frontend | S | P0 |
| BUG-03 | Dead `heroDirectoryBtn` DOM reference | `/compare` (`compare-page.ts:28`) | Low | `getElementById('heroDirectoryBtn')` references a non-existent element. Null-check prevents errors but this is dead code. | No dead references in client code. | Remove the `heroDirectoryBtn` variable and its usage at line 189. | Frontend | S | P1 |
| BUG-04 | "Open source comparison" subtitle is misleading | `/compare` (`compare.astro`) | Medium | Hero subtitle says "Open source comparison of pricing, compliance…". The site is not open source — no public repo, no OSS license. This is the #1 credibility risk identified in audit. | Subtitle accurately describes the site's nature. | Change to "Independent comparison of pricing, compliance…" | Content | S | P0 |
| BUG-05 | Silent provider removal on 6th add | `/compare` (`compare-page.ts:266`) | Medium | When user has 5 providers and adds another, `activeSlugs.shift()` silently drops the first provider with no feedback. | User is informed when a provider is removed, or prevented from exceeding the cap. | Show a brief toast/notification: "Removed [name] to stay within 5-provider limit", or disable the add button when at cap. | Frontend | S | P1 |
| BUG-06 | Disclaimer page missing contact email | `/disclaimer` | Low | Page says "please contact us" but provides no email address. `/about` and `/sources` both expose `contact@expertnetworks.net`. | Contact email is linked wherever "contact us" appears. | Add `<a href="mailto:contact@expertnetworks.net">contact@expertnetworks.net</a>` where "contact us" is referenced. | Content | S | P1 |
| BUG-07 | Privacy page missing JSON-LD breadcrumb | `/privacy` | Low | Only page audited without `BreadcrumbList` structured data. All other supplementary pages have it. | Consistent JSON-LD breadcrumb on all pages. | Add `jsonLd` prop with BreadcrumbList to the BaseLayout call in `privacy.astro`. | SEO | S | P1 |
| BUG-08 | localStorage not disclosed in privacy policy | `/privacy` | Low | Site uses `localStorage` for navigation state persistence. Privacy policy does not mention client-side storage. | All storage mechanisms disclosed in privacy policy. | Add a brief section: "Local Storage: We use your browser's localStorage to remember UI preferences (such as navigation state). This data never leaves your device." | Content | S | P1 |
| BUG-09 | Google Fonts IP disclosure incomplete | `/privacy` | Low | Privacy policy mentions Google Fonts but does not state that Google receives visitor IP addresses as a result. | Full disclosure of third-party data exposure. | Expand the Google Fonts paragraph: "When you visit our site, your browser loads fonts from Google's servers, which means Google receives your IP address and standard browser metadata for this request." | Content | S | P1 |
| BUG-10 | News card external links have no visual indicator | `/` (homepage, news section) | Low | News cards link to external `sourceUrl` via `target="_blank"` but have no icon or text indicating the link leaves the site. | External links are visually distinguishable from internal links. | Add a small external-link icon (↗) next to the "Read →" text on news cards that link externally. | Frontend | S | P1 |
| BUG-11 | Directory search does not sync to URL | `/networks` | Low | JSON-LD `SearchAction` advertises `/networks?q={search_term_string}` but the hero search input does not read from or write to `?q=` URL parameter. Incoming search links don't work. | `?q=` parameter populates hero search and filters cards on page load. | Read `URLSearchParams.get('q')` on init, set input value, trigger filter. Update URL on input change via `replaceState`. | Frontend | M | P1 |

---

## 2. UX Improvement Backlog

Enhancements that improve usability, clarity, or perceived quality — not bugs per se.

| # | Title | Page / Component | Severity | Exact Issue | Expected Behavior | Recommended Fix | Owner | Effort | Priority |
|---|-------|-----------------|----------|-------------|-------------------|-----------------|-------|--------|----------|
| UX-01 | No section navigation for tablet users on compare page | `/compare` (rail nav) | Medium | Rail nav is `display: none` below 1280px. Tablet users (768–1279px) have no section navigation on a very long page. | All screen sizes have some form of section navigation. | Add a floating "jump to section" button at bottom-right for tablet that opens a compact section menu. Or make the rail nav responsive at a lower breakpoint. | Product Design | M | P1 |
| UX-02 | Pricing right rail hidden on tablet/mobile | `/expert-network-pricing` | Medium | Right rail (TOC, Key Takeaways, Confidence Legend, Quick Links) is `hidden lg:block`. Tablet/mobile users lose all navigation aids on a 9-section page. | TOC accessible on all devices. | Add a sticky bottom bar or floating TOC button for screens below `lg`. | Product Design | M | P1 |
| UX-03 | Pricing notes column hidden on mobile | `/expert-network-pricing` | Medium | The most valuable column ("Pricing Notes") disappears at `< sm` breakpoint. Users must navigate away to see details. | Pricing details accessible on mobile without leaving the page. | Convert table rows to expandable accordions on mobile, revealing notes on tap. | Frontend | M | P1 |
| UX-04 | Mobile card layout loses comparative context | `/compare` (tables at ≤640px) | Medium | Tables become vertically stacked cards on mobile. With 5 providers, each comparison row becomes very tall and hard to compare. | Mobile users can compare at least 2–3 providers side-by-side. | Implement a horizontal swipe card UI on mobile, showing 2 providers at a time with swipe pagination. | Product Design + Frontend | L | P2 |
| UX-05 | Adjacent homepage sections merge visually | `/` (sections 7 & 8) | Low | "What matters now" and "How this site works" both use `bg-bg-secondary`, creating a continuous block with no visual break. | Each major section is visually distinct. | Change section 8 ("How this site works") to `bg-white` or `bg-bg-primary`, or add a subtle `border-t` separator between sections. | Frontend | S | P1 |
| UX-06 | No visible "last updated" date on pricing page | `/expert-network-pricing` | Low | JSON-LD has `dateModified: "2026-03-09"` but no visible date on the page. Users cannot assess data freshness. | Visible date near hero or methodology note. | Add "Last reviewed: March 9, 2026" near the hero subtitle or methodology callout. | Content + Frontend | S | P1 |
| UX-07 | No CTA after Red Flags section on pricing page | `/expert-network-pricing` | Low | Section 9 (Red Flags) ends without a transition to action. Users who read through warnings are ready to act. | Natural conversion point after Red Flags content. | Add a brief CTA block: "Ready to compare? → Compare providers in detail" between Red Flags and FAQ. | Product Design | S | P2 |
| UX-08 | Bottom CTA on pricing page is visually understated | `/expert-network-pricing` | Low | `bg-bg-secondary border border-border/40` is subtle for the primary conversion point after a long read. | CTA section has appropriate visual weight for a conversion point. | Use a gradient background or slightly more prominent styling. Increase heading size. | Product Design | S | P2 |
| UX-09 | Goal preset pills don't preview which providers they load | `/compare` (goal pills) | Low | Pills like "Fast expert calls" or "Lowest compliance risk" don't hint at which providers they'll show. | Some preview of what a preset does before clicking. | Add a tooltip on hover showing the provider names in the preset (e.g., "GLG, AlphaSights, Guidepoint"). | Frontend | S | P2 |
| UX-10 | No visible breadcrumb on /about and /sources | `/about`, `/sources` | Low | JSON-LD breadcrumb exists but no visible UI breadcrumb, unlike `/verification`, `/disclaimer`, `/privacy` which have a "← Home" link. | Consistent visible breadcrumb across all supplementary pages. | Add a "← Home" link at the top of both pages, matching the pattern used on `/verification`. | Frontend | S | P1 |
| UX-11 | "High-volume" stat card on about page is vague | `/about` | Low | Three market-scale stats: "$2B+", "100+", "High-volume". The third is not a number and feels weaker than the first two. | All stat cards have concrete, credible numbers. | Replace "High-volume" with a specific figure (e.g., "500K+ Consultations/yr" with appropriate evidence label) or reduce to two stat cards. | Content | S | P2 |
| UX-12 | Compare tray max selection not communicated upfront | `/networks` (directory) | Low | The compare tray shows "N/5 selected" only after first selection. No upfront messaging about the 5-provider limit. | Users know the cap before they start selecting. | Add subtle "(up to 5)" text near compare checkboxes or in the empty tray state. | Frontend | S | P2 |
| UX-13 | Two-tier visual design across supplementary pages | `/verification`, `/disclaimer`, `/privacy` | Low | These pages use an older light-background prose layout while `/about`, `/sources`, `/best-expert-networks` use the dark cinematic theme. Trust pages feel less polished. | Consistent design language across all pages. | Upgrade `/verification`, `/disclaimer`, `/privacy` to the dark-theme design language used on newer pages. | Product Design + Frontend | L | P2 |

---

## 3. Technical Hardening Backlog

Infrastructure, performance, accessibility, and code quality improvements.

| # | Title | Page / Component | Severity | Exact Issue | Expected Behavior | Recommended Fix | Owner | Effort | Priority |
|---|-------|-----------------|----------|-------------|-------------------|-----------------|-------|--------|----------|
| TECH-01 | No focus trap in Add Network modal | `/compare` (`compare-page.ts`) | Medium | The modal has no focus trap. Tab key can escape the modal to background elements. Missing `aria-haspopup="dialog"` on trigger button. | Modal traps focus while open per WAI-ARIA dialog pattern. | Implement a focus trap (capture first/last focusable elements, loop Tab/Shift+Tab). Add `aria-haspopup="dialog"` to the Add Network button. | Frontend | S | P1 |
| TECH-02 | Footer heading hierarchy skip | `Footer.astro` | Low | Footer column headings use `h4` without any `h3` ancestor. Skips a heading level. | Heading hierarchy has no skipped levels. | Change footer headings from `h4` to `h3`, or use `<p class="font-bold">` if semantic heading is not needed. | Frontend | S | P1 |
| TECH-03 | Directory list view has no server-rendered fallback | `/networks` | Low | List view (`#networkList`) is an empty hidden div populated entirely by JavaScript. If JS fails, list view shows nothing. | Graceful degradation if JS fails. | Either server-render the list view (hidden) alongside the grid, or show a "Requires JavaScript" message as fallback content. | Frontend | M | P2 |
| TECH-04 | `backdrop-filter` on every mobile table row | `/compare` (CSS line ~716) | Low | `backdrop-filter: blur(20px) saturate(1.8)` applied to every `<tr>` on mobile. With many rows, causes compositing overhead on older devices. | Efficient rendering on low-end mobile devices. | Remove `backdrop-filter` from individual rows. Apply it only to the card container or remove entirely on mobile. | Frontend | S | P2 |
| TECH-05 | `providerConfidence` array index-coupled to `published` array | `/expert-network-pricing` | Low | Confidence computation at lines 47–52 depends on array index alignment. Filtering or reordering would desync the arrays. | Robust data coupling that survives reordering. | Use a `Map<slug, confidence>` instead of parallel arrays, or compute confidence inline during the template loop. | Frontend | S | P2 |
| TECH-06 | Region normalization uses brittle string matching | `/networks` | Low | `getRegion()` uses `hq.includes('UK')` etc. A value like "New York, UK Office" would match incorrectly. | Region extraction works correctly for all HQ strings. | Use more specific matching (exact country at end of string, or a lookup map from HQ → region). | Frontend | S | P2 |
| TECH-07 | Particle canvas O(n²) connection loop | `/` (homepage hero) | Very Low | All-pairs particle distance check could be heavy on very low-end devices. Mobile count (35) and IntersectionObserver mitigate this. | Animation never degrades user experience. | Current mitigation is adequate. Consider adding a frame-time check that reduces connections if frame budget exceeded. | Frontend | S | P2 |
| TECH-08 | TOC active tracking uses `offsetTop` | `/expert-network-pricing` | Very Low | `offsetTop` may be inaccurate with CSS transforms or dynamic content. Static page mitigates risk. | Accurate scroll tracking under all conditions. | Replace with `getBoundingClientRect().top + scrollY` for robustness. | Frontend | S | P2 |
| TECH-09 | Missing cross-links between trust pages | `/disclaimer` | Low | Disclaimer does not link to `/sources` or `/verification`. Missed opportunity to deepen trust documentation web. | Trust pages cross-reference each other. | Add "See our Sources & Methodology and Verification Framework for how we ensure accuracy" with links. | Content + Frontend | S | P1 |
| TECH-10 | Add /expert-networks-for-consulting to footer | `Footer.astro` | Low | Footer Explore column links to `/expert-networks-for-private-equity` but omits `/expert-networks-for-consulting` and `/expert-networks-for-hedge-funds`. Only accessible via header dropdown. | All major buyer pathway pages discoverable from footer. | Add both pages to the footer Explore column. | Frontend | S | P1 |
| TECH-11 | Add methodology link to best-expert-networks ranking | `/best-expert-networks` | Low | Rankings page states methodology criteria but does not link to `/sources` where the methodology is detailed. Most editorially assertive page should reference research standards. | Methodology section links to `/sources`. | Add "See our full research methodology →" link near the ranking criteria description. | Content + Frontend | S | P1 |

---

## 4. Pre-CPO Review Checklist

Items that must be verified before presenting the site to a Chief Product Officer.

### Content & Credibility
- [ ] **BUG-01 RESOLVED:** Terminology is consistent across `/sources` and `/verification` (one canonical four-tier system)
- [ ] **BUG-04 RESOLVED:** "Open source" removed from compare subtitle; replaced with "Independent"
- [ ] **UX-11 ADDRESSED:** About page stats are all concrete and credible
- [ ] **BUG-06 RESOLVED:** Contact email present on disclaimer page
- [ ] **BUG-08 RESOLVED:** Privacy policy mentions localStorage
- [ ] **BUG-09 RESOLVED:** Google Fonts IP disclosure is complete
- [ ] All provider data reviewed within last 30 days (check dateModified values)
- [ ] No "Dashboard" or "admin" language anywhere in public-facing copy
- [ ] No placeholder text, lorem ipsum, or TODO comments visible in any page

### Visual Quality & Consistency
- [ ] **UX-05 RESOLVED:** No adjacent sections with identical backgrounds on homepage
- [ ] **UX-10 RESOLVED:** Visible breadcrumbs on all supplementary pages
- [ ] **UX-06 RESOLVED:** Visible "last reviewed" date on pricing page
- [ ] All provider logos render correctly (no broken images, no oversized SVGs)
- [ ] Color system is consistent (badges, pills, chips use the same palette site-wide)
- [ ] No visual regressions on compare page after recent refactor

### Functional Integrity
- [ ] **BUG-02 RESOLVED:** Compare page SSR matches client state (no 6/5 flash)
- [ ] **BUG-05 RESOLVED:** Adding providers at cap shows feedback, not silent removal
- [ ] **BUG-03 RESOLVED:** No dead DOM references in client code
- [ ] Compare URL sharing works (paste a `?networks=x,y,z` URL → correct providers load)
- [ ] Compare preset pills load correct provider sets
- [ ] All 33 provider profile pages render without errors
- [ ] News feed loads and filters work
- [ ] Directory search returns relevant results
- [ ] Directory compare selection → compare page handoff works end-to-end

### Accessibility Baseline
- [ ] **TECH-01 RESOLVED:** Compare modal has focus trap
- [ ] **TECH-02 RESOLVED:** No skipped heading levels site-wide
- [ ] Skip-to-content link works on all pages
- [ ] All interactive elements have 44px minimum touch targets
- [ ] Reduced motion preference is respected (no forced animations)
- [ ] All images have alt text or are marked decorative

### SEO & Technical
- [ ] **BUG-07 RESOLVED:** JSON-LD breadcrumb on all pages including `/privacy`
- [ ] `npm run verify` passes with 0 errors
- [ ] All canonical URLs are correct
- [ ] No broken internal links (verified by `npm run verify:links`)
- [ ] Open Graph tags present and correct on all pages
- [ ] Sitemap includes all public pages

### Navigation & Discovery
- [ ] **TECH-10 RESOLVED:** All buyer pathway pages in footer
- [ ] **TECH-11 RESOLVED:** Methodology link on rankings page
- [ ] **TECH-09 RESOLVED:** Trust pages cross-reference each other
- [ ] **BUG-10 RESOLVED:** External links visually distinguished from internal links
- [ ] Header nav works on desktop and mobile
- [ ] Drawer opens/closes correctly with keyboard (Escape)
- [ ] Global search returns results and links to correct profiles

---

## 5. Launch-Quality Acceptance Checklist

Final go/no-go checklist for production readiness. Each item is a binary pass/fail.

### P0 — Must Pass (Launch Blockers)

| # | Check | Pass/Fail |
|---|-------|-----------|
| L-01 | `npm run verify` completes with 0 errors | ☐ |
| L-02 | All 33 provider profile pages load without JS errors (spot-check 5) | ☐ |
| L-03 | Compare page loads default providers correctly (no count mismatch flash) | ☐ |
| L-04 | Compare URL sharing works: `?networks=glg,alphasights` loads correct view | ☐ |
| L-05 | Compare preset pills each load their defined provider set | ☐ |
| L-06 | No "open source" language anywhere on the site | ☐ |
| L-07 | Terminology consistent across `/sources` and `/verification` (spot-check all four tiers) | ☐ |
| L-08 | No console errors on homepage, directory, compare, pricing (check in DevTools) | ☐ |
| L-09 | Site loads in < 3s on 4G throttle (Lighthouse or WebPageTest) | ☐ |
| L-10 | All pages have correct `<title>`, `<meta description>`, and canonical URL | ☐ |

### P1 — Should Pass (Quality Gates)

| # | Check | Pass/Fail |
|---|-------|-----------|
| L-11 | Mobile navigation drawer opens/closes, all links work | ☐ |
| L-12 | Compare modal opens, search filters, add provider works, close works (keyboard + click) | ☐ |
| L-13 | Directory filters narrow results correctly (test 3 filter combinations) | ☐ |
| L-14 | Directory grid → list view toggle works without data loss | ☐ |
| L-15 | News page loads, category filters work, external links open in new tab | ☐ |
| L-16 | Pricing page TOC links jump to correct sections | ☐ |
| L-17 | Footer links all resolve (no 404s) | ☐ |
| L-18 | Privacy policy mentions localStorage and Google Fonts IP exposure | ☐ |
| L-19 | Contact email present on disclaimer page | ☐ |
| L-20 | Heading hierarchy has no skipped levels (run aXe or Lighthouse accessibility audit) | ☐ |
| L-21 | Compare modal traps focus (Tab does not escape to background) | ☐ |
| L-22 | Visible "last reviewed" date on pricing page | ☐ |
| L-23 | External links have visual indicator (↗ icon or similar) | ☐ |
| L-24 | All buyer pathway pages discoverable from footer | ☐ |

### P2 — Nice to Have (Polish)

| # | Check | Pass/Fail |
|---|-------|-----------|
| L-25 | Compare page has section navigation on tablet (768–1279px) | ☐ |
| L-26 | Pricing notes accessible on mobile without leaving page | ☐ |
| L-27 | About page stat cards all show concrete numbers | ☐ |
| L-28 | Trust pages (`/verification`, `/disclaimer`, `/privacy`) match dark-theme design language | ☐ |
| L-29 | Goal preset pills show tooltip with provider names on hover | ☐ |
| L-30 | Directory search syncs to URL `?q=` parameter | ☐ |

---

## Summary Statistics

| Category | P0 | P1 | P2 | Total |
|----------|----|----|-----|-------|
| Bug Backlog | 3 | 7 | 1 | 11 |
| UX Improvements | 0 | 6 | 7 | 13 |
| Technical Hardening | 0 | 5 | 6 | 11 |
| **Total** | **3** | **18** | **14** | **35** |

**Estimated effort breakdown:**
- S (Small, < 1 hour): 28 items
- M (Medium, 1–4 hours): 5 items
- L (Large, 4+ hours): 2 items

**Recommended sprint plan:**
- **Sprint 1 (P0 + critical P1):** BUG-01, BUG-02, BUG-04, BUG-05, TECH-01, TECH-02, UX-05, UX-06, UX-10 — ~1 day of frontend work
- **Sprint 2 (remaining P1):** BUG-03, BUG-06–11, TECH-09–11, UX-01, UX-02, UX-03 — ~2 days mixed frontend + content
- **Sprint 3 (P2 polish):** All remaining items — ~2–3 days, can be parallelized across frontend + design
