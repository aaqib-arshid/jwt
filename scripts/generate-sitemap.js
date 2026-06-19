import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateAll } from './generate-pages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const pages = generateAll();
const site = JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf-8'));

const urls = pages.map(p => `  <url>
    <loc>${site.domain}${p.path === '/' ? '/' : p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.priority || '0.5'}</priority>
  </url>`).join('\n');

writeFileSync(join(ROOT, 'dist', 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);

console.log(`Sitemap generated: ${pages.length} URLs`);
