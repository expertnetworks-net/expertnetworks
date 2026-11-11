---
id: ci-slug-check
role: builder
depends_on: []
---

# Goal
CI fails when a slug reference in `src/content/` is broken, the same way the local slug check does.

# Context
`node .github/scripts/check-slugs.mjs` exists and exits non-zero on a broken reference, but `.github/workflows/verify.yml` does not run it. `docs/DEPLOYMENT.md` section 4 says so.

# Scope
- .github/workflows/verify.yml
- docs/DEPLOYMENT.md (section 4 only)

# Acceptance criteria
- [ ] `verify.yml` runs `node .github/scripts/check-slugs.mjs` after install and before build
- [ ] `docs/DEPLOYMENT.md` section 4 lists the new step and no longer says CI skips the slug check
- [ ] `scripts/agents/gate.sh --quick` passes

# Out of scope
Changing the slug script itself. Any other workflow change.
