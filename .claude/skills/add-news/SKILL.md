---
name: add-news
description: Add one source-verified news item to src/content/news/. Use when the user asks to add, publish, or draft a news item or signal about an expert network provider.
argument-hint: "[source URL or topic]"
---

# Add a news item

Input: $ARGUMENTS

The rules and the field reference are in `docs/CONTENT-GUIDE.md` (sections 1, 2, 3, and 6). Read those sections first. This skill is the checklist.

## Procedure

1. Get the source.
   - If the input is a URL, fetch it and read it fully.
   - If the input is a topic, search for the primary source. Then fetch it and read it fully.
   - If you cannot open a source, stop. Tell the user. Do not write the item from memory.
2. Make sure that the item is new: `grep -rli '<keyword>' src/content/news`.
3. List the provider slugs: `ls src/content/networks`.
4. Read one recent file in `src/content/news/` and use its structure.
5. Create `src/content/news/<slug>.json`.
   - `slug` is the file name without `.json`. Start it with the primary provider slug.
   - `date` is the publication date of the source, `YYYY-MM-DD`.
   - `sourceUrl` is the URL that you read.
   - `summary` contains only facts from the source.
   - `relatedNetworks` contains only slugs from step 3.
   - `category` and `categoryColor` use values that exist in other items.
   - Set each field in the table in `docs/CONTENT-GUIDE.md`, section 6.
6. Run `node .github/scripts/check-slugs.mjs`.
7. Run `npm run verify`.
8. Report to the user:
   - The file path.
   - The source URL.
   - Each number, date, and name in the item, with the sentence of the source that supports it.
   - Each fact that you could not verify and thus did not include.

## Limits

- Do not change `src/content.config.ts` in this skill.
- Do not commit or deploy unless the user asks. For a deploy, use the `deploy` skill.
