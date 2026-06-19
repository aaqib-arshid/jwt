/**
 * Build client-side search index from all generated pages.
 */
export function buildSearchIndex(pages, extras = []) {
  return [...pages, ...extras].map(p => ({
    title: p.title || p.seoTitle || '',
    description: p.description || '',
    path: p.path,
    type: p.type || detectType(p.path),
    keywords: p.keywords || '',
  })).filter(p => p.title && p.path);
}

function detectType(path) {
  if (path.startsWith('/tools/')) return 'tool';
  if (path.startsWith('/guides/')) return 'guide';
  if (path.startsWith('/errors/')) return 'error';
  if (path.startsWith('/algorithms/')) return 'algorithm';
  if (path.startsWith('/compare/')) return 'compare';
  if (path.startsWith('/claims/')) return 'claim';
  if (path.startsWith('/providers/')) return 'provider';
  if (path.startsWith('/glossary/')) return 'glossary';
  if (path.startsWith('/learn/')) return 'learn';
  if (path.startsWith('/hubs/')) return 'hub';
  if (path.startsWith('/blog/')) return 'blog';
  return 'page';
}

export function searchIndexScore(item, query) {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  let score = 0;
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const kw = (item.keywords || '').toLowerCase();
  for (const t of terms) {
    if (title.includes(t)) score += 10;
    if (title.startsWith(t)) score += 5;
    if (desc.includes(t)) score += 3;
    if (kw.includes(t)) score += 4;
    if (item.path.toLowerCase().includes(t)) score += 2;
  }
  if (item.type === 'tool') score += 2;
  return score;
}
