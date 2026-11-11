# ExpertNetworks.net

Independent research on expert network providers, from public sources.

Live site: <https://expertnetworks.net>

## What this project is

An expert network connects an organization that needs specialized knowledge with a professional who has it.
Public information about this industry is scattered and frequently promotional.

This site collects that information into three structures:

- **Provider profiles.** One page for each provider, with the same fields for each.
- **A compare page.** A matrix of providers across pricing, compliance, AI, scale, and fit.
- **A news feed.** Short, sourced items about products, funding, partnerships, and legal events.

The site also has guides and editorial pages, for example `/what-is-an-expert-network` and `/sources`.

## What this project is not

- It does not broker expert calls.
- It does not sell positions in rankings.
- It does not claim complete or real-time coverage.
- It does not replace legal, procurement, compliance, or investment advice.

Each provider field can have a confidence label. Some data is company-stated, inferred, or estimated.
The site states this on `/verification` and `/sources`.

## How it works

The site is static. The repository is the publishing system.

1. Content is JSON in `src/content/`.
2. `npm run build` validates the content and writes HTML to `dist/`.
3. Cloudflare Pages builds and serves the production branch.

There is no server, no API, no database, and no admin panel.
No environment variables are necessary.

## Quick start

Use the Node version in `.node-version`. The minimum version is in `package.json` (`engines`).

```bash
npm ci
npm run dev
```

Before you commit:

```bash
npm run verify
```

`CLAUDE.md` contains the full command table.

## Documentation

| Read this | To learn |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Rules, repository map, commands, and pitfalls. Written for AI agents. Useful for all contributors. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the build, the pages, and the browser scripts work. |
| [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) | How to add or update a provider, a news item, or the compare config. Field reference. Sourcing rule. |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Branches, Cloudflare Pages, CI, the deploy procedure, and known issues. |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Security posture and audit history. |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Symptoms and corrections. |
| [`docs/archive/`](docs/archive/README.md) | Historical files. Not maintained. |

Important: a push to `main` does not update the live site. Read [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) before you deploy.

## Contributions

1. Create a feature branch.
2. Make the change. For content, obey the sourcing rule in [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md).
3. Run `npm run verify`.
4. Open a pull request. The template lists the necessary checks.

## License

The repository has no license file.
The code and content are public, but they are not licensed as open source.
