# Contributing

Thank you for helping keep this research accurate.

## Report an error in a profile or news item

Open an issue with: the page URL, the claim, and a public source that shows the correct fact. Corrections with a primary source are fixed first.

## Change code or content

1. Read `AGENTS.md` (rules and pitfalls) and the doc that owns your topic (doc map in `AGENTS.md`).
2. Branch from `main`.
3. Content: follow `docs/CONTENT-GUIDE.md`. Every fact needs a public source you read yourself.
4. Run `scripts/agents/gate.sh` before you open a pull request.
5. Open a pull request. CI must pass. A maintainer merges; a merge to `main` deploys the live site.

## Ground rules

- No paid placement, no sponsored rankings, no affiliate links.
- No personal data of maintainers or contributors in code, content, or commit messages beyond what you choose for your own commits.
- Security issues: see `.github/SECURITY.md`. Do not open a public issue.
