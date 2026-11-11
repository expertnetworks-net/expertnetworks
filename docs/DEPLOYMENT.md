# Deployment

This file owns: branches, Cloudflare Pages, the Node version, CI, the deploy procedure, dependency updates, and known operational issues.

Branch and Cloudflare facts in this file were last verified on 2026-11-11.
Cloudflare settings are not in the repository. Verify them in the Cloudflare Pages dashboard if a deploy does not behave as this file says.

## 1. Branches

| Branch | Role |
|---|---|
| `main` | Production branch and GitHub default branch. A push or merge to `main` deploys <https://expertnetworks.net>. |
| `integration/<date>` | Where the orchestrator merges agent branches before a deploy. See `AGENT-WORKFLOW.md`. |
| `agent/<task-id>` | One branch for each agent task. Created by `scripts/agents/swarm.sh`. |
| Other branches | Feature branches. Cloudflare Pages makes a preview build for each push. See section 8.1. |

Rule: every branch starts from `main`. Nothing reaches `main` without the gate, a review, and the owner's approval.

History: until 2026-11-11 the production branch was `claude/expert-network-sources-6oGs1` and `main` was stale. Both were merged into `main` on that date (merge commit `1adf0b0`). The old branch is frozen; do not push to it.

## 2. Hosting

- Host: Cloudflare Pages, connected to the GitHub repository `expertnetworks-net/expertnetworks`.
- Cloudflare Pages runs the Astro build and serves `dist/`.
- Cloudflare Pages applies `public/_headers` to responses. This file sets the security headers, the CSP, and the cache rules. See [`SECURITY.md`](SECURITY.md).
- Cloudflare Web Analytics is enabled. Cloudflare adds its script to pages at the edge. The script is not in the repository.
- The site needs no environment variables at build time or at run time, with one exception: `NODE_VERSION` (section 3).

## 3. Node version

| Item | Value |
|---|---|
| Minimum version | The `engines.node` value in `package.json`. Astro sets this requirement. |
| Version selector files | `.node-version` and `.nvmrc`. Keep the two files identical. |
| CI | `.github/workflows/verify.yml` reads `.node-version`. |
| Cloudflare Pages, Production environment | The variable `NODE_VERSION=22` is set in the dashboard. Production builds succeed. |
| Cloudflare Pages, Preview environment | Not confirmed. See section 8.1. |

When a dependency update raises the minimum Node version:

1. Update `engines.node` in `package.json`.
2. Update `.node-version` and `.nvmrc` if the major version changes.
3. Update `NODE_VERSION` in the Cloudflare Pages dashboard for Production and Preview.

## 4. CI

Workflow: `.github/workflows/verify.yml`. It runs on each push and each pull request.

| Step | Command |
|---|---|
| Install | `npm ci` |
| Build | `npm run build` |
| Link check | `npm run verify:links` |
| Type check | `npm run check` |
| Security audit | `npm audit --audit-level=high` |

- The first four steps are the same as `npm ci` followed by `npm run verify`.
- The audit step fails on each advisory of severity high or critical. See section 7.
- A new run on the same branch cancels the run that is in progress.
- The workflow token has read-only access to repository contents.
- CI does not run `.github/scripts/check-slugs.mjs`. Run it locally after content changes.

## 5. Deploy procedure

A deploy changes the live site. **Get the explicit approval of the owner for each deploy.**
An approval for one deploy does not apply to the next deploy.

In the commands below, `<feature>` is the feature branch and `<sha>` is the merge commit.

1. Make sure that the working tree is clean.

   ```bash
   git status
   ```

2. On the feature branch, run the checks. Stop if a check fails.

   ```bash
   git checkout <feature>
   npm ci
   npm run verify
   npm audit --audit-level=high
   node .github/scripts/check-slugs.mjs
   ```

3. Update the local `main`.

   ```bash
   git fetch origin
   git checkout main
   git pull --ff-only origin main
   ```

4. Merge the feature branch with a merge commit.

   ```bash
   git merge --no-ff <feature>
   ```

5. If the merge brought in commits that the feature branch did not have, run `npm run verify` again.

6. Push. This step starts the production deploy.

   ```bash
   git push origin main
   ```

7. Get the merge commit hash.

   ```bash
   git rev-parse HEAD
   ```

8. Examine the check runs on the merge commit. Repeat until each run has the status `completed`.

   ```bash
   gh api repos/expertnetworks-net/expertnetworks/commits/<sha>/check-runs \
     --jq '.check_runs[] | "\(.name): \(.status) \(.conclusion)"'
   ```

   Two runs must have the conclusion `success`: `Cloudflare Pages` and `verify`.

9. Examine the live site.

   ```bash
   curl -sI https://expertnetworks.net/
   curl -s -o /dev/null -w '%{http_code}\n' https://expertnetworks.net/compare
   curl -s -o /dev/null -w '%{http_code}\n' https://expertnetworks.net/networks
   curl -s -o /dev/null -w '%{http_code}\n' https://expertnetworks.net/news
   ```

   - Each page must return `200`.
   - The headers must include `content-security-policy` and `strict-transport-security`.
   - The `content-security-policy` value must agree with `public/_headers`.

10. Open a changed page on the live site and make sure that the change is there.

11. If `public/_headers` changed, open `/`, `/compare`, `/networks`, and `/news` in a browser. Look for CSP errors in the console.

12. Report the result to the owner: the merge commit hash, the two check conclusions, and the HTTP results.

## 6. Rollback

1. Get the approval of the owner.
2. On `main`, revert the merge commit: `git revert -m 1 <sha>`.
3. Run `npm run verify`.
4. Push `main`.
5. Do steps 8 to 12 of the deploy procedure.

The Cloudflare Pages dashboard can also roll back to an earlier deployment. Only the owner has access.

## 7. Dependency updates

Fact: advisories accumulate without code changes.
Between June 2026 and November 2026, `npm audit` went from 0 to 15 advisories, and the code did not change.
Because CI fails on high-severity advisories, a branch that passed CI can fail later with no new commit.

Mechanisms:

- `.github/dependabot.yml` opens pull requests each week for npm packages and for GitHub Actions.
- Minor and patch updates for npm arrive in one grouped pull request.
- Each major update arrives as a separate pull request.

Procedure for a Dependabot pull request:

1. Make sure that the `verify` check passes.
2. For a major update, check out the branch and run `npm run verify` locally. Open `/`, `/compare`, `/networks`, and `/news` in the dev server.
3. Merge the pull request.
4. Deploy with the procedure in section 5 when the owner approves.

Procedure when CI fails only at the audit step:

1. Run `npm audit` to see the advisories.
2. Run `npm audit fix`. Do not use `--force` without the approval of the owner.
3. Run `npm run verify`.
4. If advisories remain, a major update or an `overrides` entry in `package.json` is necessary. Tell the owner.

Note: Dependabot opens pull requests against `main`. Merging one is a deploy: follow section 5.

## 8. Known open issues

### 8.1 Preview builds for feature branches fail

- Symptom: the `Cloudflare Pages` check run fails on feature branches. Production builds succeed.
- Cause: not diagnosed.
- Most probable cause: the Preview environment in Cloudflare Pages does not have the `NODE_VERSION` variable. Only the Production environment has it.
- Suggested correction: in the Cloudflare Pages dashboard, open Settings, then the variables for the Preview environment. Add `NODE_VERSION=22`. Then push a commit to a feature branch and examine the check run.
- If the correction does not help, read the build log of the failed preview deployment in the dashboard.
- Effect now: a failed `Cloudflare Pages` check on a feature branch is not evidence of a code defect. Use the `verify` check and a local `npm run verify`.

Only the owner has dashboard access.

### 8.2 Stale remote branches

These remote branches are from March 2026. They are candidates for deletion.
Do not delete a branch without the approval of the owner.

| Branch |
|---|
| `claude/audit-news-accuracy-OdySo` |
| `claude/create-single-page-Ypxhc` |
| `claude/fix-mobile-ui-bugs-a3Y2x` |
| `claude/portfolio-docs-a3Y2x` |
| `claude/study-expertnetworks-gD9NZ` |
| `claude/fix-compare-networks-4VuOG` |
| `claude/expert-network-sources-6oGs1` (former production branch, merged into `main`) |

Before deletion, show the commits of a branch that the production branch does not have:

```bash
git log --oneline origin/main..origin/<branch>
```

## 9. Accounts and services

Verified on 2026-11-11. Hosting is Cloudflare only. Do not add another host.

| Service | Status | Notes |
|---|---|---|
| GitHub `expertnetworks-net/expertnetworks` | In use | Source of truth. Public repository, so Actions, code scanning, secret scanning, and push protection are free. Local `gh` must be signed in as `expertnetworks-net` (`gh auth switch -u expertnetworks-net`). |
| Cloudflare Pages, DNS, Web Analytics | In use | Hosting, CDN, and analytics. Settings live in the dashboard, not in the repository. Free plan. |
| Supabase | Planned, not in use | Organization exists, no project yet. Purpose and rules: `ROADMAP.md`, phase 2. Until a project exists, the site has no database. |
| Codex CLI and Codex Cloud | In use for agent work | Workers. See `AGENT-WORKFLOW.md`. Not part of the build. |
| Claude (chat and Claude Code) | In use for agent work | Orchestrator. Not part of the build. |

Budget rule: no paid service beyond the owner's Claude and ChatGPT subscriptions. Every new service must have a free tier that covers current traffic, or the owner's written approval.

Older repositories (`Expert-Networks.net`, `Experts-Portal---V1.0`) are archived. `dialectica-expert-network` is a separate private prototype. None of them deploy this site.
