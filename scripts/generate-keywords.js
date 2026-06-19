/**
 * Bulk keyword → guide page generator (scale to 500+ pages).
 *
 * Usage:
 *   node scripts/generate-keywords.js data/keywords.csv
 *
 * CSV format: slug,title,primary_keyword,description
 * Merges new entries into data/guides.json (skips existing slugs).
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
  });
}

function buildGuideEntry(row) {
  const slug = row.slug;
  const keyword = row.primary_keyword || row.title;
  return {
    slug,
    title: row.title,
    seoTitle: `${row.title} | JWTValidator.org`,
    description: row.description || `Learn about ${keyword}. Free JWT tools and expert guides.`,
    keywords: `${keyword},jwt,${row.secondary_keywords || ''}`.replace(/,$/, ''),
    category: 'guides',
    relatedTools: ['jwt-decoder', 'jwt-validator', 'jwt-debugger'],
    relatedGuides: ['jwt-authentication-explained'],
    relatedArticles: ['jwt-beginner-guide'],
    faq: [
      { q: `What is ${keyword}?`, a: `See our complete guide on ${row.title.toLowerCase()} with examples and fixes.` },
      { q: 'How do I debug JWT issues?', a: 'Use our free JWT Debugger and Validator tools — all processing runs in your browser.' },
    ],
    content: `<h2>${row.title}</h2><p>This guide covers <strong>${keyword}</strong> — a common JWT authentication topic for developers.</p><h2>Quick Fix</h2><p>Paste your token into the <a href="/tools/jwt-decoder.html">JWT Decoder</a> to inspect claims, then use the <a href="/tools/jwt-validator.html">JWT Validator</a> to verify the signature.</p><h2>Node.js Example</h2><pre><code class="language-javascript">const jwt = require('jsonwebtoken');\ntry {\n  const decoded = jwt.verify(token, process.env.JWT_SECRET);\n} catch (err) {\n  console.error('${keyword}:', err.message);\n}</code></pre><h2>Python Example</h2><pre><code class="language-python">import jwt\ntry:\n    decoded = jwt.decode(token, secret, algorithms=['HS256'])\nexcept jwt.InvalidTokenError as e:\n    print('${keyword}:', e)</code></pre>`,
  };
}

const csvPath = process.argv[2] || join(ROOT, 'data', 'keywords.csv');
const guidesPath = join(ROOT, 'data', 'guides.json');

try {
  const csv = readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(csv);
  const guides = JSON.parse(readFileSync(guidesPath, 'utf-8'));
  const existing = new Set(guides.map(g => g.slug));
  let added = 0;

  for (const row of rows) {
    if (!row.slug || existing.has(row.slug)) continue;
    guides.push(buildGuideEntry(row));
    existing.add(row.slug);
    added++;
  }

  writeFileSync(guidesPath, JSON.stringify(guides, null, 2) + '\n');
  console.log(`Added ${added} guide(s) to guides.json`);
} catch (e) {
  if (e.code === 'ENOENT') {
    console.log('Create data/keywords.csv with: slug,title,primary_keyword,description');
    console.log('Example: jwt-nodejs-example,JWT Node.js Example,jwt authentication node js,Node.js JWT guide');
  } else {
    throw e;
  }
}
