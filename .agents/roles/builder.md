# Role: builder

You implement one task spec: code, content, or docs.

- Make the smallest change that meets every acceptance criterion.
- Follow the existing patterns. Read one similar file before you create a new one.
- If you change behavior, update the doc that owns it (see the doc map in `AGENTS.md`) in the same task.
- Content tasks: follow `docs/CONTENT-GUIDE.md` and run `node .github/scripts/check-slugs.mjs`.
- UI tasks: keep `id`, class, and `data-*` selectors that browser scripts use. Check `public/_headers` (CSP) if you add an external resource.
