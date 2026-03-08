import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function getSitePath(filePath) {
  const relPath = path.relative(distDir, filePath).split(path.sep).join('/');
  return `/${relPath}`;
}

function resolveSitePath(ref, sourceFile) {
  const cleanRef = ref.split('#')[0];
  if (!cleanRef) return null;
  const withoutQuery = cleanRef.split('?')[0];
  if (!withoutQuery) return null;
  if (withoutQuery.startsWith('//')) return null;
  if (withoutQuery.startsWith('/')) return withoutQuery;

  const sourceUrl = new URL(getSitePath(sourceFile), 'https://expertnetworks.net');
  return new URL(withoutQuery, sourceUrl).pathname;
}

function existsInDist(sitePath) {
  const normalized = decodeURIComponent(sitePath);
  const trimmed = normalized.replace(/^\/+/, '');

  if (!trimmed) {
    return fs.existsSync(path.join(distDir, 'index.html'));
  }

  if (path.extname(trimmed)) {
    return fs.existsSync(path.join(distDir, trimmed));
  }

  return (
    fs.existsSync(path.join(distDir, trimmed)) ||
    fs.existsSync(path.join(distDir, `${trimmed}.html`)) ||
    fs.existsSync(path.join(distDir, trimmed, 'index.html'))
  );
}

if (!fs.existsSync(distDir)) {
  console.error('dist/ does not exist. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = walk(distDir).filter((filePath) => filePath.endsWith('.html'));
const refPattern = /\b(?:href|src)=["']([^"']+)["']/g;
const brokenRefs = [];
let checkedRefCount = 0;

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, 'utf8');
  const markupOnly = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  for (const match of markupOnly.matchAll(refPattern)) {
    const ref = match[1];
    if (
      !ref ||
      ref.startsWith('#') ||
      ref.startsWith('http://') ||
      ref.startsWith('https://') ||
      ref.startsWith('mailto:') ||
      ref.startsWith('tel:') ||
      ref.startsWith('data:') ||
      ref.startsWith('javascript:')
    ) {
      continue;
    }

    const sitePath = resolveSitePath(ref, filePath);
    if (!sitePath) continue;

    checkedRefCount += 1;
    if (!existsInDist(sitePath)) {
      brokenRefs.push({
        file: getSitePath(filePath),
        ref,
        resolved: sitePath,
      });
    }
  }
}

if (brokenRefs.length > 0) {
  console.error(`Found ${brokenRefs.length} broken internal references:`);
  brokenRefs.forEach(({ file, ref, resolved }) => {
    console.error(`- ${file}: ${ref} -> ${resolved}`);
  });
  process.exit(1);
}

console.log(`Checked ${checkedRefCount} internal references across ${htmlFiles.length} HTML files. No broken links found.`);
