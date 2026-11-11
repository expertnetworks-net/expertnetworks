// Deterministic UI contracts; no inference about provider positioning or public sources.
// Run from the repository root: node .github/scripts/check-content-integrity.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const resolve = (data, key) => key.split('.').reduce((value, part) => value?.[part], data);
const blank = (value) => value == null || (typeof value === 'string' && !value.trim());
const supported = (value) => value === true || (typeof value === 'string' && !!value.trim());

function missingCell(value, type) {
  // The renderer deliberately uses a dash for false. It is an explicit negative,
  // not a missing fact. Missing booleans are still errors, even with Zod defaults.
  if (type === 'boolean') return typeof value !== 'boolean';
  if (type === 'boolean-or-string') return value !== false && !supported(value);
  if (type === 'capability' || type === 'list') {
    return !Array.isArray(value) || !value.length || value.some(blank);
  }
  if (type === 'product-names') return blank(value) || !String(value).split(',').some((item) => item.trim());
  return blank(value) || (Array.isArray(value) && !value.length);
}

export function checkContentIntegrity(providers, compare, now = new Date()) {
  const problems = [];
  const published = providers.filter((data) => data.published !== false);
  const bySlug = new Map(published.map((data) => [data.slug, data]));
  const report = (data, field, reason) => problems.push(`${data.slug}: ${field}: ${reason}`);

  for (const data of published) {
    // Unguarded identity/description output in profile and directory templates.
    // expertCount is also unguarded in both profile sidebar provider lists.
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

  const selected = new Set([...compare.networks, ...Object.values(compare.presets).flat()]);
  for (const slug of selected) {
    const data = bySlug.get(slug);
    if (!data) {
      problems.push(`${slug}: compare: not a published provider`);
      continue;
    }
    for (const section of compare.sections) {
      for (const row of section.rows) {
        // These special rows compute their values rather than resolving key.
        if (row.id === 'substituteType' || row.type === 'substitute-type') continue;
        const key = row.id === 'bestFitBuyer' ? 'bestFor' : row.id === 'lastReviewed' ? 'lastUpdated' : row.key;
        const source = row.source === 'enriched' ? compare.enriched?.[slug] : data;
        const value = resolve(source, key);
        if (missingCell(value, row.type)) {
          report(data, `${row.source === 'enriched' ? 'compare.enriched.' : ''}${key}`, `missing matrix value (${section.id}/${row.id}; compare defaults or presets)`);
        }
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
      console.log('Content integrity passed: provider pages, compare matrix, dates, capability presets and badges.');
    }
  } catch (error) {
    console.error(`Content integrity check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
