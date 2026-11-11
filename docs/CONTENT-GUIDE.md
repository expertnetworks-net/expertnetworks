# Content guide

This file owns: the sourcing rule, the content field reference, and the procedures to change content.

The source of truth for field names and types is `src/content.config.ts`.
If this file and the schema disagree, the schema is correct. Correct this file.

The docs use the term "provider" for a profiled company. The code uses "network" for the same entity.

## 1. Sourcing rule

The site publishes facts about real companies. A wrong fact damages the trust in the site.

1. Write a fact only if you read it in a public source during this work session.
2. Do not write a fact from memory. Do not write a fact from model knowledge.
3. Do not invent a number, a date, a quote, a product name, or a URL.
4. Open each `sourceUrl` and make sure that it loads and that it supports the text.
5. Prefer the primary source: the company press release, a regulatory filing, or the original news article.
6. If sources disagree, use the more conservative value and write the disagreement in `sourceNotes`.
7. If you cannot verify a fact, do not include it. Tell the owner what you could not verify.
8. Mark the type of evidence. Use `confidence` for provider fields and `sourceType` for news items.
9. Do not copy long text from a source. Summarize in your own words. Keep a neutral tone.
10. Do not change an existing fact unless a source shows that it is wrong or out of date.

### Unknown values

**Remove a claim, keep the field explicit.** When verification drops a value used by a table or facts display, retain `"Not disclosed"` for text or `null` for a boolean/capability. Do not invent a replacement or use `false` to mean unknown. Optional fields omitted in older records also render as “Not disclosed”. Empty lists have the same display fallback.

Boolean fields in `comparison` and `compliance.auditTrail` have three states: `true` (Yes), `false` (No, only for an established negative), and `null` (Not disclosed). Their schema default is `null`; absence must never manufacture a negative. Missing and explicit unknown values appear as muted text in the compare matrix and directory. The integrity check validates rendered cells, not whether a provider publishes every fact.

Remove badges and preset memberships whose capability implication is no longer supported by the profile. Do not restore a claim just to keep a badge or a preset. Compare pricing, services, AI capability lists, and caveats read the collection; compare-only AI assessments may be `null` when no supported assessment remains. Check editorial pages and metadata for repeated claims after each profile verification.

Confidence values for provider fields:

| Value | Use it when |
|---|---|
| `verified` | An independent or official public source confirms the fact. |
| `positioning` | The fact is a company claim that you cannot confirm independently. |
| `inference` | You derived the fact from indirect public evidence. |
| `partially-unverifiable` | A source confirms a part of the fact, but not all of it. |

The public explanation of these labels is on the `/verification` page (`src/pages/verification.astro`).

## 2. Slug rules

1. A slug contains lowercase letters, digits, and hyphens only.
2. The `slug` field must be the same as the file name without `.json`.
3. A slug must be unique in its collection.
4. Do not change a provider slug. It is the public URL `/networks/<slug>`, and other files refer to it.
5. If the owner approves a slug change, update each reference: `relatedNetworks` in news files and all slugs in `src/content/compare.json`.

Find all references to a slug:

```bash
grep -rn '"<slug>"' src/content
```

## 3. Add a news item

1. Find the public source. Open it. Read it fully.
2. List the current provider slugs: `ls src/content/networks`.
3. Create `src/content/news/<slug>.json`. Start the slug with the primary provider slug, for example `guidepoint-mcp-claude-2026`.
4. Fill the fields from section 6. Copy the structure of a recent file in `src/content/news/`.
5. Set `date` to the publication date of the source, in the format `YYYY-MM-DD`.
6. Set `relatedNetworks` to the slugs of the providers that the item is about.
7. Use a `category` value that exists. List the values with the command below.
8. Run `node .github/scripts/check-slugs.mjs`.
9. Run `npm run verify`.

```bash
grep -h '"category"' src/content/news/*.json | sort | uniq -c
```

Where the item appears: the homepage news section, `/news`, and the page of each provider in `relatedNetworks`.

## 4. Update a provider

1. Open `src/content/networks/<slug>.json`.
2. Verify each fact that you change against a public source. Obey section 1.
3. Change the fields.
4. Update `confidence` for each changed field, if the type of evidence changed.
5. Add or update a line in `sourceNotes` that names the source.
6. Set `lastUpdated` to the date of your check, in the format `YYYY-MM-DD`. The provider page shows this date as the fact-check date.
7. If the provider is in `src/content/compare.json` (`enriched`), check that its compare-only data is still correct.
8. Run `node .github/scripts/check-slugs.mjs`.
9. Run `npm run verify`.

Text in editorial pages (for example `src/pages/best-expert-networks.astro`) does not update automatically.
Search for the provider name in `src/pages/` and correct text that is now wrong:

```bash
grep -rln '<provider name>' src/pages
```

## 5. Add a provider

1. Make sure that the provider is not in the repository: `ls src/content/networks`.
2. Create `src/content/networks/<slug>.json`.
3. Fill each required field from section 7. Copy the structure of an existing file.
4. Fill the optional fields that the sources support. Do not fill a field with a guess.
5. Set `priority`. A smaller number puts the provider earlier in lists. Look at the values of the other providers first.
6. If there is a logo, put the file in `public/images/networks/` and set `logo` to `/images/networks/<file>`. The file name is case-sensitive.
7. Set `lastUpdated` to the date of your check.
8. Run `node .github/scripts/check-slugs.mjs`.
9. Run `npm run verify`.
10. Open `/networks/<slug>` and `/networks` in the dev server and examine the result.

To hide a provider or a news item, set `published` to `false`. Do not delete the file.
Before you hide a provider, remove its slug from `relatedNetworks` and from `src/content/compare.json`.

## 6. News field reference

Collection: `news`. Files: `src/content/news/*.json`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | Yes | Headline. Neutral. |
| `slug` | string | Yes | See section 2. |
| `date` | string | Yes | `YYYY-MM-DD`. Pages sort by this value. |
| `source` | string | Yes | Name of the publisher, for example `Third Bridge (Press Release)`. |
| `sourceUrl` | string | No | URL of the source. Set it for each new item. |
| `summary` | string | Yes | Two to three sentences. Only facts from the source. |
| `category` | string | Yes | Free text in the schema. Use an existing value. `/news` makes a filter from each different value. |
| `categoryColor` | string | No | Hex color of the category label. Use the color that other items in the same category use. |
| `gradientFrom`, `gradientTo` | string | No | Hex colors of the item tile. |
| `relatedNetworks` | string[] | No (default `[]`) | Provider slugs. Not checked by the schema. |
| `published` | boolean | No (default `true`) | `false` hides the item. |
| `sourceType` | enum | No | `Press Release`, `Industry Report`, `News Coverage`, `Regulatory`, `Product Update`. |
| `significance` | enum | No | `major`, `standard`, `brief`. The homepage gives priority to `major` items. |
| `featured` | boolean | No (default `false`) | The homepage gives priority to featured items. |
| `whyItMatters` | string | No | One to two sentences of analysis. Label it as analysis by its wording. Do not add new facts. |
| `impactTags` | string[] | No (default `[]`) | Short topic tags. |

All existing items set every field in this table. Do the same for a new item.

## 7. Provider field reference

Collection: `networks`. Files: `src/content/networks/*.json`.

### 7.1 Identity and status

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Full name. |
| `shortName` | string | Yes | Short name for chips and tables. |
| `slug` | string | Yes | See section 2. |
| `website` | string | No | Official URL. |
| `logo` | string | No | Path below `public/`, for example `/images/networks/glg.png`. Without a logo, pages show a gradient tile. |
| `gradientFrom`, `gradientTo` | string | Yes | Hex colors of the provider tile. |
| `type` | string | Yes | Free text, for example `Expert Network`. |
| `description` | string | Yes | Short summary for cards and metadata. |
| `parentCompany` | string | No | |
| `featured` | boolean | No (default `false`) | Puts the provider in the featured group of the provider page side navigation. |
| `priority` | number | No (default `50`) | Sort order. Smaller is earlier. |
| `published` | boolean | No (default `true`) | `false` removes the provider from all pages. |
| `lastUpdated` | string | Yes | `YYYY-MM-DD`. Date of the last fact check. |

### 7.2 Company facts

| Field | Type | Required | Notes |
|---|---|---|---|
| `founded` | number | No | Year. |
| `headquarters` | string | No | The directory derives the region filter from this text. |
| `employeeCount` | string | No | Text, for example a range. |
| `employeeCountSource` | string | No | Label for the origin of the employee number. |
| `expertCount` | string | No | Text. Company-stated in most cases. |
| `expertCountLabel` | string | No | What the provider counts, for example members or professionals. |
| `pricingModel` | string | No | |
| `pricingDetail` | string | No | |

### 7.3 Lists

All fields in this table are `string[]` with default `[]`.

| Field | Notes |
|---|---|
| `services` | Short service names. |
| `aiCapabilities` | Short AI capability names. |
| `industries` | |
| `keyDifferentiators` | |
| `bestFor` | |
| `strengths` | |
| `caveats` | Limits and weak points. |
| `notableFacts` | |
| `sourceNotes` | One line for each source or method. Required by the sourcing rule. |
| `whyChoose`, `whenNotIdeal` | Short chips on the provider page. |

### 7.4 Classification (enums)

All fields in this table are optional in the schema. Omit an unsupported badge instead of restoring an unverified capability. The directory filters use supported values.

| Field | Permitted values |
|---|---|
| `categoryBadge` | `Global Leader`, `Major Provider`, `Fast-Growing`, `Asia Specialist`, `Research Platform`, `Technology-First`, `Marketplace`, `Boutique Specialist` |
| `deliveryModel` | `Concierge`, `Hybrid`, `Self-Serve`, `Marketplace`, `Platform-Led` |
| `regionStrength` | `Global`, `North America`, `Europe`, `Asia-Pacific`, `Greater China`, `India`, `Emerging Markets` |
| `complianceBadge` | `Strong Compliance`, `Standard Compliance`, `Compliance Tools`, `Limited Public Detail` |
| `aiBadge` | `AI-Native`, `AI Research`, `AI Matching`, `AI Moderation`, `Limited AI Detail` |

### 7.5 Objects

| Field | Shape | Notes |
|---|---|---|
| `compliance` | `{ mnpiPolicy?, expertVetting?, coolingOffPeriod?, regulatoryHistory?: string; auditTrail: boolean or null (default null) }` | Optional. |
| `comparison` | `{ expertCalls, surveys, complianceTools: boolean or null; contentLibrary, aiMatching: boolean, string, or null }` | Optional. Capability defaults are `null` (unknown). The compare matrix reads these values. |
| `overview` | string | Optional. Long text for the provider page. |
| `history` | `{ narrative: string; timeline: { year: string; event: string }[] }` | Optional. |
| `servicesDetailed` | `{ name: string; description: string }[]` | Default `[]`. |
| `aiPlatform` | `{ narrative?: string; features: string[] }` | Optional. |
| `complianceExtended` | `{ narrative?: string; highlights: string[]; regulatoryContext?: string }` | Optional. |
| `clientFit` | `{ narrative?: string; segments: string[] }` | Optional. |
| `confidence` | Map from field name to confidence value | Optional. See section 1 for the values. Example: `{ "founded": "verified", "expertCount": "positioning" }`. |

The provider page hides a section if its field is absent or empty.

## 8. Compare config reference

File: `src/content/compare.json`. No schema validates this file.
The design of the compare page is in [`ARCHITECTURE.md`](ARCHITECTURE.md), section 6.

| Key | Used by the page | Content |
|---|---|---|
| `networks` | Yes | Default provider slugs. Maximum 5. |
| `presets` | Yes | Map from preset name to provider slugs. A goal button shows the first 5 slugs of its preset. |
| `sections` | Yes | Matrix sections. Each section has `id`, `name`, and `rows`. |
| `enriched` | Yes | Compare-only data for each provider slug. |
| `substituteTypes` | Yes | Map from provider type to its relation label, for example `Direct peer`. |
| `comparisonNote` | Yes | Note below the goal buttons. |
| `contextualDisclaimers` | Yes | Disclaimer text for `pricing`, `scale`, `ai`, and `compliance`. |
| `presetMeta` | Yes | Labels and descriptions for the preset cards on the homepage (`src/pages/index.astro`). |

Row fields in `sections[].rows[]`:

| Field | Content |
|---|---|
| `id`, `label` | Identifier and visible name of the row. Do not rename an `id`. `src/lib/compare-v2.ts` refers to some rows by `id`. |
| `key` | Path to the value. Without `source`, the path is in the provider file, for example `comparison.expertCalls`. |
| `source` | `enriched` means that the value comes from `enriched.<slug>` in `compare.json`. |
| `type` | How the renderer shows the value, for example `boolean`, `text`, `chip`, `capability`. The renderer is `src/lib/compare-v2.ts`. |
| `importance` | `major`, `moderate`, or `minor`. |
| `critical` | No code reads this field. The "Critical differences" section selects rows by `id` in `src/lib/compare-v2.ts`. |
| `confidenceView` | `high`, `mixed`, or `low`. |
| `evidenceField`, `taxonomy`, `description` | Optional. Read `src/lib/compare-v2.ts` before you use them. |

Fields of `enriched.<slug>`:

| Field | Content |
|---|---|
| `providerType` | Must be a key of `substituteTypes`. |
| `officialAIProducts` | Legacy data; the matrix uses the profile’s `aiCapabilities` list. |
| `weakness` | Legacy data; the matrix uses the profile’s `caveats` list. |
| `scaleEvidence`, `employeeEvidence` | Evidence label, for example `Company-Stated`, `Inferred`, `Estimated`. |
| `ai` | Six capabilities: `matchingAI`, `libraryQA`, `synthesis`, `agents`, `interviewing`, `complianceAI`. Each value is an array (status, evidence label, optional note), or `null` for unknown. Keep supported assessments aligned with the profile’s AI fields; do not blank them just because another capability is unconfirmed. Include the primary source URL in the assessment note. Expert matching reads `comparison.aiMatching` from the profile instead. |

The `ai` status values in use are `Publicly documented`, `Publicly indicated`, `Limited public evidence`, and `Not publicly clear`.

### 8.1 Change the compare config

1. Edit `src/content/compare.json`.
2. Use only slugs of published providers.
3. To add a provider to a preset, also add an `enriched.<slug>` entry. Rows with `source: enriched` are empty without it.
4. To add a preset that a goal button selects, also add an entry to `compareGoals` in `src/lib/compare-v2.ts`.
5. The sourcing rule in section 1 applies to `enriched` data.
6. Run `node .github/scripts/check-slugs.mjs`.
7. Run `npm run verify`.
8. Open `/compare` in the dev server. Do the browser checks in [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md), section "Compare page".

## 9. Add a schema field

1. Add the field to `src/content.config.ts`. Make it optional or give it a default.
2. Use the field in the page or component.
3. Add the field to the reference tables in this file.
4. Run `npm run verify`.

## 10. Useful commands

| Purpose | Command |
|---|---|
| Count provider files | `ls src/content/networks \| wc -l` |
| Count news files | `ls src/content/news \| wc -l` |
| Find the newest news dates | `grep -h '"date"' src/content/news/*.json \| sort \| tail -5` |
| Find providers with the oldest fact check | `grep -H '"lastUpdated"' src/content/networks/*.json \| sort -t'"' -k4 \| head` |
| Check all slug references | `node .github/scripts/check-slugs.mjs` |
