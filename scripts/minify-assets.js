/**
 * Minify CSS in dist/assets after build (no external deps).
 * JS is left unminified — regex-aware minification needs a proper parser.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function walk(dir, ext, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, ext, files);
    else if (extname(full) === ext) files.push(full);
  }
  return files;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export async function minifyAssets(assetsDir) {
  if (!assetsDir) return;

  // Only minify CSS — naive JS minification breaks regex literals (e.g. /\//g)
  let cssCount = 0;
  for (const file of walk(assetsDir, '.css')) {
    writeFileSync(file, minifyCss(readFileSync(file, 'utf-8')));
    cssCount++;
  }

  console.log(`Minified ${cssCount} CSS files (JS left unminified for safety)`);
}
