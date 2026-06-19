import { readFileSync, writeFileSync, cpSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateAll } from './generate-pages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

async function runProgrammatic() {
  try {
    await import('./generate-programmatic.js');
  } catch (e) {
    console.warn('Programmatic generation warning:', e.message);
  }
}

function generateLlmsTxt(pages, site) {
  const tools = pages.filter(p => p.path.startsWith('/tools/')).slice(0, 15);
  const guides = pages.filter(p => p.path.startsWith('/guides/')).slice(0, 20);
  const content = `# JWTValidator.org

> Free JWT decoder, validator, debugger, and programmatic SEO hub for JWT authentication.

## Tools
${tools.map(p => `- ${site.domain}${p.path}`).join('\n')}

## Top Guides
${guides.map(p => `- ${site.domain}${p.path}`).join('\n')}

## Resource Discovery
- ${site.domain}/resources.html — Searchable directory of all pages
- ${site.domain}/glossary/ — JWT terminology encyclopedia
- ${site.domain}/assets/search-index.json — Machine-readable search index
- ${site.domain}/hubs/decode-validate.html
- ${site.domain}/hubs/algorithms.html
- ${site.domain}/hubs/implementation.html
- ${site.domain}/hubs/security.html
- ${site.domain}/compare/jwt-io-alternative.html

## Optional
- ${site.domain}/llms-full.txt
`;
  writeFileSync(join(DIST, 'llms.txt'), content, 'utf-8');

  const full = pages.map(p => `${site.domain}${p.path === '/' ? '/' : p.path}`).join('\n');
  writeFileSync(join(DIST, 'llms-full.txt'), `# All pages (${pages.length})\n\n${full}\n`, 'utf-8');
  console.log('llms.txt + llms-full.txt generated');
}

function generateAiTxt(pages, site) {
  const content = `# JWTValidator.org — AI Crawler Guide

> The #1 free JWT decoder, validator, debugger, and learning platform. 100% client-side, no token uploads.

## Primary tools
- ${site.domain}/tools/jwt-decoder.html — Decode JWT header, payload, signature
- ${site.domain}/tools/jwt-validator.html — Verify HS256/HS384/HS512 signatures
- ${site.domain}/tools/jwt-debugger.html — Claim-by-claim analysis and warnings
- ${site.domain}/tools/jwks-validator.html — Verify RS256 with JWKS endpoints

## Resource discovery
- ${site.domain}/resources.html — Searchable directory of all ${pages.length}+ pages
- ${site.domain}/glossary/ — JWT terminology encyclopedia
- ${site.domain}/guides/ — Step-by-step JWT guides
- ${site.domain}/errors/ — JWT error diagnosis and fixes
- ${site.domain}/compare/jwt-io-alternative.html — jwt.io alternative

## For LLMs
See also: ${site.domain}/llms.txt and ${site.domain}/llms-full.txt
Search index: ${site.domain}/assets/search-index.json
`;
  writeFileSync(join(DIST, 'ai.txt'), content, 'utf-8');
  console.log('ai.txt generated');
}

function copyStaticAssets() {
  const assetsSrc = join(ROOT, 'assets');
  const assetsDst = join(DIST, 'assets');
  if (existsSync(assetsSrc)) cpSync(assetsSrc, assetsDst, { recursive: true });
  for (const file of ['CNAME', 'robots.txt', 'manifest.json']) {
    const src = join(ROOT, file);
    if (existsSync(src)) cpSync(src, join(DIST, file));
  }
  // Prevent Jekyll processing if GitHub Pages ever serves from a branch
  writeFileSync(join(DIST, '.nojekyll'), '');
}

function cleanOldSitemaps() {
  if (!existsSync(DIST)) return;
  for (const file of readdirSync(DIST)) {
    if (file.startsWith('sitemap-') && file.endsWith('.xml')) {
      unlinkSync(join(DIST, file));
    }
  }
  const sitemapsDir = join(DIST, 'sitemaps');
  if (existsSync(sitemapsDir)) {
    for (const file of readdirSync(sitemapsDir)) {
      if (file.endsWith('.xml')) unlinkSync(join(sitemapsDir, file));
    }
  }
}

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';

function urlEntry(domain, page) {
  return `  <url>
    <loc>${domain}${page.path === '/' ? '/' : page.path}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority || '0.5'}</priority>
  </url>`;
}

function generateSitemap(pages) {
  const site = JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf-8'));
  const seoConfig = JSON.parse(readFileSync(join(ROOT, 'data', 'seo-config.json'), 'utf-8'));
  // Google allows 50,000 URLs per sitemap file. Use a single file until that limit.
  const indexThreshold = seoConfig.sitemap?.indexThreshold || 50000;

  cleanOldSitemaps();

  if (pages.length <= indexThreshold) {
    const urls = pages.map(p => urlEntry(site.domain, p)).join('\n');
    writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NS}">
${urls}
</urlset>`);
    console.log(`Sitemap: ${pages.length} URLs in sitemap.xml`);
    return;
  }

  // Split into section sitemaps under /sitemaps/ (only when exceeding 50k URLs)
  mkdirSync(join(DIST, 'sitemaps'), { recursive: true });
  const sections = {
    core: p => ['/', '/learning-path.html', '/resources.html', '/about.html', '/hubs/'].includes(p.path) || p.path.startsWith('/tools/') || p.path.startsWith('/hubs/'),
    guides: p => p.path.startsWith('/guides/'),
    learn: p => p.path.startsWith('/learn/'),
    algorithms: p => p.path.startsWith('/algorithms/'),
    errors: p => p.path.startsWith('/errors/'),
    compare: p => p.path.startsWith('/compare/'),
    claims: p => p.path.startsWith('/claims/'),
    providers: p => p.path.startsWith('/providers/'),
    usecases: p => p.path.startsWith('/use-cases/'),
    blog: p => p.path.startsWith('/blog/'),
    legal: p => ['/privacy.html', '/terms.html', '/disclaimer.html', '/contact.html', '/support.html'].includes(p.path),
    glossary: p => p.path.startsWith('/glossary/'),
  };

  const sitemapFiles = [];
  for (const [name, filter] of Object.entries(sections)) {
    const sectionPages = pages.filter(filter);
    if (!sectionPages.length) continue;
    const filename = `sitemap-${name}.xml`;
    const urls = sectionPages.map(p => urlEntry(site.domain, p)).join('\n');
    writeFileSync(join(DIST, 'sitemaps', filename), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NS}">
${urls}
</urlset>`);
    sitemapFiles.push({ filename, lastmod: new Date().toISOString().split('T')[0] });
  }

  const indexEntries = sitemapFiles.map(s => `  <sitemap>
    <loc>${site.domain}/sitemaps/${s.filename}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n');

  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="${SITEMAP_NS}">
${indexEntries}
</sitemapindex>`);

  console.log(`Sitemap index: ${sitemapFiles.length} sitemaps in /sitemaps/, ${pages.length} total URLs`);
}

console.log('Building jwtvalidator.org...\n');

mkdirSync(DIST, { recursive: true });
await runProgrammatic();
const pages = generateAll();
copyStaticAssets();
generateSitemap(pages);
generateLlmsTxt(pages, JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf-8')));
generateAiTxt(pages, JSON.parse(readFileSync(join(ROOT, 'data', 'site.json'), 'utf-8')));

console.log(`\nBuild complete → dist/ (${pages.length} pages)`);
