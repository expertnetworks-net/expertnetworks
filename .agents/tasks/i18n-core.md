---
id: i18n-core
role: builder
depends_on: []
---
# Goal
Every page of ExpertNetworks.net can be read in English or Spanish. English stays at the current URLs; Spanish lives under `/es/`. A visitor switches language from the header and lands on the same page in the other language.

# Context
- Base: `integration/design`. Astro 7 static site, content collections `networks`, `news`, `ai` (`src/content.config.ts`).
- Other tasks own the homepage right now: do NOT edit `src/pages/index.astro`, `src/components/home/**`, `src/components/ParticleHero.astro`. The Spanish home (`/es/`) is a later task; for now `/es/` may render a minimal Spanish landing that links to the Spanish sections, built only from files in your scope.
- Read `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/CONTENT-GUIDE.md` (evidence labels, AI capability records, legal wording rule) before starting.

# Build
1. **Routing.** Astro `i18n` config: `defaultLocale: 'en'`, `locales: ['en','es']`, `routing.prefixDefaultLocale: false`. Spanish pages under `src/pages/es/` reuse the same components with a `lang` prop; no duplicated markup beyond thin route files.
2. **Strings.** `src/i18n/ui.ts` with typed `en` and `es` dictionaries, `t(lang, key)`, `getLang(url)`, `localizePath(path, lang)`, `alternatePath(url)`. Type error if a key is missing in either language.
3. **Chrome.** Header (dropdowns, mobile sheet, search palette labels, placeholders), Footer, breadcrumbs, evidence chips and popovers, compare UI, filters, empty states, buttons, dates (`Intl.DateTimeFormat` with `es` locale), numbers.
4. **Language switcher** in the header (EN · ES, `aria-current` on the active one, `hreflang` on links), keyboard-accessible, no cookies or storage; preserves path, query and hash.
5. **SEO.** `<html lang>`, `<link rel="alternate" hreflang="en|es|x-default">` on every page, per-language canonical, `og:locale` + `og:locale:alternate`, sitemap includes `/es/` URLs, JSON-LD `inLanguage`. `llms.txt` lists both.
6. **Spanish pages now:** `/es/networks/` (directory), `/es/networks/<slug>/` (profile chrome in Spanish; provider text falls back to English with a small "Texto original en inglés" note until translated), `/es/compare/`, `/es/ai/`, `/es/guides/*` (three AI guides, fully translated), `/es/what-is-an-expert-network/`, `/es/expert-network-pricing/`, `/es/best-expert-networks/`, buyer guides, alternatives, trust and legal pages (`/es/about/`, `/es/sources/`, `/es/verification/`, `/es/privacy/`, `/es/disclaimer/`), and `/es/news/` (news items stay in English, labelled "En inglés").
7. **Provider translations (schema only here).** Add an optional collection `networksEs` at `src/content/networks-es/<slug>.json` with the translatable text fields only (description, overview, history, strengths, caveats, bestFor, servicesDetailed text, clientFit text, compliance prose, AI narrative). The profile page merges it over the English record when present. Facts never live in the overlay: numbers, names, dates, URLs, prices and source quotes come from the English record. Add `.github/scripts/check-translations.mjs`: every overlay key exists in the English record, no overlay contains digits/URLs that differ from the English record, and wire it into `gate.sh` and `verify.yml`. Translate 2 profiles (glg, alphasights) as the reference examples.
8. **Glossary** in `docs/CONTENT-GUIDE.md` (new "Spanish" section) and used everywhere: expert network = red de expertos; expert call = llamada con experto; compliance = cumplimiento; transcript library = biblioteca de transcripciones; Sourced = Con fuente; Company-stated = Según la empresa; Our assessment = Nuestra evaluación; Unconfirmed = Sin confirmar; Documented = Documentado; Reported = Reportado; Claimed = Declarado por la empresa; Announced = Anunciado; No public evidence = Sin evidencia pública. Neutral Latin American professional Spanish, `usted` avoided by impersonal phrasing. The legal wording rule holds in Spanish: the strongest negative is "Sin evidencia pública a <fecha>"; never say a provider lies or exaggerates.

# Scope
- astro.config.mjs
- src/i18n/
- src/pages/es/
- src/layouts/BaseLayout.astro
- src/components/Header.astro
- src/components/Footer.astro
- src/components/ui/
- src/components/profile/
- src/components/ai/
- src/components/guides/
- src/components/compare/
- src/components/VsComparison.astro
- src/pages/networks/
- src/pages/compare.astro
- src/pages/ai/
- src/pages/guides/
- src/content.config.ts
- src/content/networks-es/
- src/lib/
- src/scripts/
- public/_redirects
- .github/scripts/check-translations.mjs
- .github/workflows/verify.yml
- scripts/agents/gate.sh
- docs/ARCHITECTURE.md
- docs/CONTENT-GUIDE.md

# Acceptance criteria
- [ ] `/es/...` exists for every section listed in Build 6 and renders Spanish chrome; English URLs unchanged (no redirects added for English)
- [ ] Switcher preserves path/query/hash and is keyboard accessible
- [ ] hreflang + canonical + `html lang` correct on a sample of 5 EN and 5 ES pages (state which)
- [ ] `networksEs` overlay schema, merge on profile pages, glg + alphasights translated, `check-translations.mjs` in the gate
- [ ] Spanish glossary documented and applied; legal wording rule respected in Spanish
- [ ] `npm run verify` passes; build page count reported before/after
