---
name: refresh-provider
description: Verify an expert network provider profile against current public sources and update src/content/networks/<slug>.json. Use when the user asks to refresh, re-verify, fact-check, or update a provider profile.
argument-hint: "[provider slug]"
---

# Refresh a provider profile

Provider slug: $ARGUMENTS

The rules and the field reference are in `docs/CONTENT-GUIDE.md` (sections 1, 4, 7, and 8). Read those sections first. This skill is the checklist.

## Procedure

1. If no slug is given, list the profiles with the oldest fact check and ask the user to select one:
   `grep -H '"lastUpdated"' src/content/networks/*.json | sort -t'"' -k4 | head`
2. Read `src/content/networks/<slug>.json` fully.
3. Read the `enriched.<slug>` entry in `src/content/compare.json`, if there is one.
4. Verify the facts that can change. Use the official provider website and other public sources. Fetch each source and read it.
   - Company facts: `headquarters`, `employeeCount`, `expertCount`, `parentCompany`.
   - Products: `services`, `aiCapabilities`, `aiPlatform`, `servicesDetailed`.
   - Commercial: `pricingModel`, `pricingDetail`.
   - Compliance: `compliance`, `complianceExtended`.
   - Compare-only data: `officialAIProducts` and `ai` in `enriched.<slug>`.
5. Make a table for the user: field, current value, value in the source, source URL, action (keep, change, cannot verify).
6. Change only the fields that a source contradicts or extends. Keep the tone and the length of the current text.
7. For each changed field, update `confidence` if the type of evidence changed.
8. Add or update lines in `sourceNotes` for the sources that you used.
9. Set `lastUpdated` to the date of today, `YYYY-MM-DD`. Do this only if you verified the profile.
10. If a significant event has no news item, tell the user. Offer the `add-news` skill.
11. Run `node .github/scripts/check-slugs.mjs`.
12. Run `npm run verify`.
13. Report to the user: the table from step 5, the changed fields, and the facts that you could not verify.

## Limits

- Do not change `slug`.
- Do not write a fact that you did not read in a source in this session.
- If a source is not available, keep the current value and report it as "cannot verify".
- Do not commit or deploy unless the user asks. For a deploy, use the `deploy` skill.
