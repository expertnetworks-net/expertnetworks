// Deterministic UI contracts; no inference about provider positioning or public sources.
// Run from the repository root: node .github/scripts/check-content-integrity.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildCompareRender, projectCompareNetwork, hasCapability } from '../../src/lib/compare-v2.ts';

const blank = (value) => value == null || (typeof value === 'string' && !value.trim());
const supported = hasCapability;

// Validate the HTML contract, not the presence of a public claim. Missing, null,
// and explicit unknown values must render readable text, never a blank or dash.
export function matrixHoles(html) {
  return [...html.matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)].filter(([, , content]) => {
    const text = content.replace(/<[^>]*>/g, '').replace(/&(?:nbsp|ndash|mdash);/g, ' ').trim();
    return !text || /^[–—-]$/.test(text);
  });
}

export function checkContentIntegrity(providers, compare, now = new Date()) {
  const problems = [];
  const published = providers.filter((data) => data.published !== false);
  const bySlug = new Map(published.map((data) => [data.slug, data]));
  const report = (data, field, reason) => problems.push(`${data.slug}: ${field}: ${reason}`);

  for (const data of published) {
    // Unguarded identity/description output in profile and directory templates.
    // expertCount is unguarded in the current profile sidebar; an explicit
    // "Not disclosed" string is valid until the separate profile rebuild adds guards.
    for (const field of ['name', 'shortName', 'slug', 'type', 'description', 'gradientFrom', 'gradientTo', 'expertCount', 'lastUpdated']) {
      if (blank(data[field])) report(data, field, 'missing value rendered without a guard on provider pages');
    }
    // Services has an always-visible heading; other optional arrays have guards.
    if (!Array.isArray(data.services) || !data.services.length || data.services.some(blank)) {
      report(data, 'services', 'empty Services section on the profile page');
    }
    const date = new Date(data.lastUpdated);
    if (!blank(data.lastUpdated) && Number.isNaN(date.getTime())) {
      report(data, 'lastUpdated', 'invalid date');
    } else if (date.getTime() > now.getTime()) {
      report(data, 'lastUpdated', `future date (${data.lastUpdated})`);
    }

    // Only direct, machine-readable implications. AI Research/AI-Native and
    // market-position badges do not imply a particular sourcing capability.
    if (data.aiBadge === 'AI Matching' && !supported(data.comparison?.aiMatching)) {
      report(data, 'aiBadge', 'AI Matching requires comparison.aiMatching');
    }
    if (['Strong Compliance', 'Compliance Tools'].includes(data.complianceBadge) && data.comparison?.complianceTools !== true) {
      report(data, 'complianceBadge', `${data.complianceBadge} requires comparison.complianceTools=true`);
    }
    if (data.categoryBadge === 'Research Platform' && !supported(data.comparison?.contentLibrary)) {
      report(data, 'categoryBadge', 'Research Platform requires comparison.contentLibrary');
    }
    if (data.categoryBadge === 'Marketplace' && data.deliveryModel !== 'Marketplace') {
      report(data, 'categoryBadge', 'Marketplace contradicts deliveryModel');
    }
  }

  const dataset = {
    networkDataMap: Object.fromEntries(published.map((data) => [data.slug, projectCompareNetwork(data)])),
    defaultSlugs: compare.networks,
    presets: compare.presets,
    sections: compare.sections,
    enriched: compare.enriched,
    substituteTypes: compare.substituteTypes,
  };
  const selections = { defaults: compare.networks, ...compare.presets };
  // Every published provider can be selected manually, including those outside presets.
  for (const data of published) selections[`provider:${data.slug}`] = [data.slug];
  for (const [selection, slugs] of Object.entries(selections)) {
    const valid = slugs.filter((slug) => {
      if (bySlug.has(slug)) return true;
      problems.push(`${slug}: compare: not a published provider (${selection})`);
      return false;
    });
    if (!valid.length) continue;
    for (const [section, html] of Object.entries(buildCompareRender(valid, dataset))) {
      if (typeof html !== 'string' || !section.endsWith('Html')) continue;
      for (const [, attributes] of matrixHoles(html)) {
        problems.push(`${selection}: ${section}: empty matrix cell (${attributes.trim()})`);
      }
    }
  }

  // Presets whose minimum capability can be tested without interpreting prose.
  // Sector, buyer-fit, geography and AI-research rankings require editorial review.
  for (const [preset, field] of Object.entries({ library: 'contentLibrary', aiMatching: 'aiMatching', fastCalls: 'expertCalls' })) {
    for (const slug of compare.presets[preset] ?? []) {
      const data = bySlug.get(slug);
      if (data && !supported(data.comparison?.[field])) {
        report(data, `comparison.${field}`, `does not meet compare.presets.${preset} minimum capability`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const providers = fs.readdirSync('src/content/networks').filter((file) => file.endsWith('.json')).sort()
      .map((file) => JSON.parse(fs.readFileSync(path.join('src/content/networks', file), 'utf8')));
    const compare = JSON.parse(fs.readFileSync('src/content/compare.json', 'utf8'));
    const problems = checkContentIntegrity(providers, compare);
    if (problems.length) {
      console.error(`Found ${problems.length} content integrity problem(s):`);
      for (const problem of problems) console.error(`- ${problem}`);
      process.exitCode = 1;
    } else {
      console.log('Content integrity passed: required fields, rendered compare cells, dates, capability presets and badges.');
    }
  } catch (error) {
    console.error(`Content integrity check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
