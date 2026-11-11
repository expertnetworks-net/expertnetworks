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
3. Cloudflare Pages builds and serves `main`.

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

`AGENTS.md` contains the full command table.

## Documentation

| Read this | To learn |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Rules, repository map, commands, and pitfalls. Written for AI agents (Codex and Claude). Useful for all contributors. |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Where the project is going, and why. |
| [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) | How the orchestrator and Codex workers split, run, review, and merge work. |
| [`docs/ORCHESTRATION-PLAYBOOK.md`](docs/ORCHESTRATION-PLAYBOOK.md) | What we learned running agent swarms on this project, with measurements. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to report an error or contribute. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the build, the pages, and the browser scripts work. |
| [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) | How to add or update a provider, a news item, or the compare config. Field reference. Sourcing rule. |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Branches, Cloudflare Pages, CI, the deploy procedure, and known issues. |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Security posture and audit history. |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Symptoms and corrections. |
| [`docs/archive/`](docs/archive/README.md) | Historical files. Not maintained. |

Important: a push to `main` updates the live site. Read [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) before you deploy.

## Contributions

1. Create a feature branch.
2. Make the change. For content, obey the sourcing rule in [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md).
3. Run `npm run verify`.
4. Open a pull request. The template lists the necessary checks.

## License

The repository has no license file.
The code and content are public, but they are not licensed as open source.
