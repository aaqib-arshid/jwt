/**
 * Copy dist/ output to repo root for GitHub Pages (main branch deploy).
 * Run after build.js — CI commits the result with [skip ci].
 */
import { cpSync, rmSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const GENERATED_DIRS = [
  'tools', 'guides', 'errors', 'algorithms', 'compare', 'claims',
  'providers', 'use-cases', 'glossary', 'hubs', 'blog', 'learn',
];

const GENERATED_FILES = [
  'index.html', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'ai.txt',
  'manifest.json', '.nojekyll',
  'learning-path.html', 'resources.html',
  'about.html', 'privacy.html', 'terms.html', 'disclaimer.html',
  'contact.html', 'support.html',
];

if (!existsSync(DIST)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

for (const dir of GENERATED_DIRS) {
  const p = join(ROOT, dir);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

for (const file of GENERATED_FILES) {
  const p = join(ROOT, file);
  if (existsSync(p)) rmSync(p, { force: true });
}

// Replace assets/ with built version (includes search-index.json)
const assetsDist = join(DIST, 'assets');
const assetsRoot = join(ROOT, 'assets');
if (existsSync(assetsDist)) {
  if (existsSync(assetsRoot)) rmSync(assetsRoot, { recursive: true, force: true });
  cpSync(assetsDist, assetsRoot, { recursive: true });
}

for (const entry of readdirSync(DIST)) {
  if (entry === 'assets') continue;
  cpSync(join(DIST, entry), join(ROOT, entry), { recursive: true });
}

console.log('Published dist/ → repo root for GitHub Pages');
