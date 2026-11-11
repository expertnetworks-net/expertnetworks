// Checks the cross-file slug references that the Zod schema cannot check.
// Run from the repository root: node .github/scripts/check-slugs.mjs
// Exit code 0 = all references resolve. Exit code 1 = at least one problem.
import fs from 'node:fs';
import path from 'node:path';

function readDir(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ file, data: JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) }));
}

const providers = readDir('src/content/networks');
const news = readDir('src/content/news');
const compare = JSON.parse(fs.readFileSync('src/content/compare.json', 'utf8'));
const published = new Set(providers.filter((p) => p.data.published !== false).map((p) => p.data.slug));
const problems = [];

for (const [label, entries] of [['networks', providers], ['news', news]]) {
  const seen = new Set();
  for (const { file, data } of entries) {
    if (file !== `${data.slug}.json`) problems.push(`${label}/${file}: "slug" (${data.slug}) does not match the file name`);
    if (seen.has(data.slug)) problems.push(`${label}/${file}: duplicate slug ${data.slug}`);
    seen.add(data.slug);
  }
}

for (const { file, data } of news) {
  for (const slug of data.relatedNetworks ?? []) {
    if (!published.has(slug)) problems.push(`news/${file}: relatedNetworks slug "${slug}" is not a published provider`);
  }
}

const compareRefs = [
  ...compare.networks.map((slug) => ['networks', slug]),
  ...Object.entries(compare.presets).flatMap(([name, slugs]) => slugs.map((slug) => [`presets.${name}`, slug])),
  ...Object.keys(compare.enriched).map((slug) => ['enriched', slug]),
];
for (const [where, slug] of compareRefs) {
  if (!published.has(slug)) problems.push(`compare.json ${where}: slug "${slug}" is not a published provider`);
}

for (const { file, data } of providers) {
  if (data.logo && !fs.existsSync(path.join('public', data.logo))) {
    problems.push(`networks/${file}: logo file public${data.logo} does not exist`);
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} content reference problem(s):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Checked ${providers.length} provider files, ${news.length} news files, and compare.json. All slug references resolve.`,
);
