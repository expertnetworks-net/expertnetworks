## Summary

<!-- What changes, and why. One to three sentences. -->

## Verification

- [ ] `npm run verify` passes (build, internal links, `astro check`).
- [ ] `npm audit --audit-level=high` reports no high-severity advisory.
- [ ] `node .github/scripts/check-slugs.mjs` passes (for changes in `src/content/`).
- [ ] I examined the changed pages in a browser (for UI changes and for `/compare`).

## Content sourcing

- [ ] Each new or changed fact comes from a public source that was opened and read. `sourceUrl`, `sourceNotes`, and `confidence` agree with that source. Rule: `docs/CONTENT-GUIDE.md`.
- [ ] Not applicable. This pull request does not change `src/content/`.

## Deploy note

<!-- A merge into `main` does not deploy the live site. Procedure: docs/DEPLOYMENT.md -->

- Production deploy necessary after merge: yes / no
- Changes `public/_headers`: yes / no
