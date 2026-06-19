import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { render, loadTemplate } from './lib/template-engine.js';
import {
  buildMeta,
  buildBreadcrumbs,
  buildFaqSchema,
  buildArticleSchema,
  buildSoftwareAppSchema,
  buildBreadcrumbSchema,
  buildHowToSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildItemListSchema,
  buildDefinedTermSchema,
  defaultHowToSteps,
} from './lib/seo.js';
import { quickAnswerSnippet, contentSupplement } from './lib/content-templates.js';
import { buildSearchIndex } from './lib/search-index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const DATA = join(ROOT, 'data');
const TEMPLATES = join(ROOT, 'templates');

function readJson(name, fallback = null) {
  const path = join(DATA, name);
  if (!existsSync(path)) return fallback ?? [];
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writePage(relPath, html) {
  const full = join(DIST, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html, 'utf-8');
}

function resolveLinks(slugs, map, prefix, suffix = '.html', keyFn = s => s) {
  return (slugs || []).map(slug => {
    const key = keyFn(slug);
    const item = map.get(key);
    return item ? { slug, label: item.title, href: `${prefix}/${key}${suffix}`.replace(/\/+/g, '/').replace('.html.html', '.html') } : null;
  }).filter(Boolean);
}

function buildRelatedSections(page, ctx) {
  const relatedTools = resolveLinks(page.relatedTools, ctx.toolsMap, '/tools');
  const relatedGuides = resolveLinks(page.relatedGuides, ctx.guidesMap, '/guides');
  const relatedArticles = resolveLinks(page.relatedArticles, ctx.blogMap, '/blog/posts');
  const relatedAlgorithms = resolveLinks(page.relatedAlgorithms, ctx.algorithmsMap, '/algorithms');
  const relatedErrors = resolveLinks(page.relatedErrors, ctx.errorsMap, '/errors');
  const relatedComparisons = resolveLinks(page.relatedComparisons, ctx.comparisonsMap, '/compare');
  const relatedClaims = resolveLinks(page.relatedClaims, ctx.claimsMap, '/claims');
  const relatedProviders = resolveLinks(page.relatedProviders, ctx.providersMap, '/providers');

  return {
    relatedTools,
    relatedGuides,
    relatedArticles,
    relatedAlgorithms,
    relatedErrors,
    relatedComparisons,
    relatedClaims,
    relatedProviders,
    hasRelatedTools: relatedTools.length > 0,
    hasRelatedGuides: relatedGuides.length > 0,
    hasRelatedArticles: relatedArticles.length > 0,
    hasRelatedAlgorithms: relatedAlgorithms.length > 0,
    hasRelatedErrors: relatedErrors.length > 0,
    hasRelatedComparisons: relatedComparisons.length > 0,
    hasRelatedClaims: relatedClaims.length > 0,
    hasRelatedProviders: relatedProviders.length > 0,
  };
}

function renderPage(templateName, data) {
  const base = loadTemplate(join(TEMPLATES, 'base.html'));
  const partial = loadTemplate(join(TEMPLATES, `${templateName}.html`));
  const body = render(partial, data);
  return render(base, { ...data, body });
}

function renderHeadPartial(meta, schemas) {
  const headTpl = loadTemplate(join(TEMPLATES, 'partials', 'head-seo.html'));
  return render(headTpl, {
    ...meta,
    schemaBlocks: (schemas || []).filter(Boolean).map(s =>
      `<script type="application/ld+json">${s}</script>`
    ).join('\n'),
  });
}

function renderBreadcrumbsPartial(breadcrumbs) {
  const tpl = loadTemplate(join(TEMPLATES, 'partials', 'breadcrumbs.html'));
  return render(tpl, { breadcrumbs: buildBreadcrumbs(breadcrumbs) });
}

function renderRelatedPartial(related) {
  return render(loadTemplate(join(TEMPLATES, 'partials', 'related-topics.html')), related);
}

function renderFaqPartial(faq) {
  if (!faq?.length) return '';
  return render(loadTemplate(join(TEMPLATES, 'partials', 'faq.html')), { faq });
}

function renderTryItPartial(tools) {
  if (!tools?.length) return '';
  return render(loadTemplate(join(TEMPLATES, 'partials', 'try-it.html')), { tryTools: tools.slice(0, 2) });
}

function renderTrustLinksPartial() {
  return render(loadTemplate(join(TEMPLATES, 'partials', 'trust-links.html')), {});
}

function generateGlossaryPages(ctx) {
  const { site } = ctx;
  const glossary = readJson('glossary.json', []);
  const indexItems = [];

  for (const term of glossary) {
    const path = `/glossary/${term.slug}.html`;
    const title = `${term.term} — JWT Glossary`;
    const description = term.definition.slice(0, 155);
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Glossary', href: '/glossary/' },
      { label: term.term },
    ];
    const content = `<h2>What is ${term.term}?</h2>
<p>${term.definition}</p>
<h2>See It in Practice</h2>
<p>Paste any JWT into our <a href="/tools/jwt-decoder.html">JWT Decoder</a> to see ${term.term === 'JWT' ? 'tokens' : 'related claims'} in action. Use the <a href="/tools/jwt-debugger.html">JWT Debugger</a> for detailed analysis.</p>
<h2>Related</h2>
<p>Browse the full <a href="/glossary/">JWT Glossary</a> or explore <a href="/guides/jwt-basics.html">JWT Basics</a>.</p>`;
    const meta = buildMeta({ title, seoTitle: `${term.term} Definition | JWT Glossary`, description, path, keywords: `${term.term.toLowerCase()}, jwt glossary,${term.slug}` }, site);
    const quickAnswerHtml = quickAnswerSnippet({ keyword: term.term, type: 'glossary' });

    writePage(`glossary/${term.slug}.html`, renderPage('content', {
      site,
      page: { title: term.term, description },
      path,
      metaHtml: renderHeadPartial(meta, [
        buildDefinedTermSchema(term, site),
        buildBreadcrumbSchema(breadcrumbs, site, path),
      ]),
      breadcrumbsHtml: renderBreadcrumbsPartial(breadcrumbs),
      faqHtml: '',
      tryItHtml: renderTryItPartial(resolveLinks(['jwt-decoder'], ctx.toolsMap, '/tools')),
      contentHtml: content + contentSupplement({ keyword: term.term, type: 'glossary' }),
      quickAnswerHtml,
      year: new Date().getFullYear(),
      relatedHtml: renderRelatedPartial({
        relatedTools: resolveLinks(['jwt-decoder', 'jwt-debugger'], ctx.toolsMap, '/tools'),
        relatedGuides: resolveLinks(['jwt-basics'], ctx.guidesMap, '/guides'),
        hasRelatedTools: true, hasRelatedGuides: true,
        hasRelatedArticles: false, hasRelatedAlgorithms: false, hasRelatedErrors: false,
        hasRelatedComparisons: false, hasRelatedClaims: false, hasRelatedProviders: false,
      }),
    }));

    ctx.allPages.push({ path, lastmod: today(), priority: '0.65' });
    ctx.searchEntries.push({ title: term.term, description, path, type: 'glossary', keywords: term.slug });
    indexItems.push({ title: term.term, description: term.definition.slice(0, 100), href: path });
  }

  const glossaryPath = '/glossary/';
  const glossaryMeta = buildMeta({
    title: 'JWT Glossary',
    seoTitle: 'JWT Glossary — Every JWT Term Defined | JWTValidator.org',
    description: 'Complete JWT glossary: JWT, JWS, JWKS, claims, algorithms, OAuth terms, and security concepts explained for developers.',
    path: glossaryPath,
  }, site);

  writePage('glossary/index.html', renderPage('index-list', {
    site,
    page: { title: 'JWT Glossary', description: 'Every JWT term defined with examples and links to tools.' },
    path: glossaryPath,
    metaHtml: renderHeadPartial(glossaryMeta, [buildItemListSchema('JWT Glossary', indexItems, site)]),
    breadcrumbsHtml: renderBreadcrumbsPartial([{ label: 'Home', href: '/' }, { label: 'Glossary' }]),
    listItems: indexItems,
    year: new Date().getFullYear(),
  }));
  ctx.allPages.push({ path: glossaryPath, lastmod: today(), priority: '0.75' });
}

function generateResourcesPage(ctx, sources) {
  const { site } = ctx;
  const path = '/resources.html';
  const sections = sources.map(s => ({
    title: s.title,
    count: s.items.length,
    items: s.items,
  }));
  const totalCount = sections.reduce((n, s) => n + s.count, 0);
  const meta = buildMeta({
    title: 'JWT Resource Directory',
    seoTitle: `JWT Resource Directory — ${totalCount}+ Tools & Guides | JWTValidator.org`,
    description: 'Search and browse every JWT tool, guide, error fix, algorithm, claim, provider, and glossary term.',
    path,
  }, site);

  writePage('resources.html', renderPage('resources', {
    site,
    page: { title: 'JWT Resource Directory' },
    path,
    metaHtml: renderHeadPartial(meta, [buildWebSiteSchema(site)]),
    breadcrumbsHtml: renderBreadcrumbsPartial([{ label: 'Home', href: '/' }, { label: 'Resources' }]),
    sections,
    year: new Date().getFullYear(),
  }));
  ctx.allPages.push({ path, lastmod: today(), priority: '0.85' });
}

function writeSearchIndex(ctx) {
  const index = buildSearchIndex(ctx.searchEntries);
  writePage('assets/search-index.json', JSON.stringify(index, null, 0));
}

function generateContentPages(ctx, items, config) {
  const { site, sectionLabel, sectionHref, filePrefix, urlPrefix, priority, ogType, snippetType } = config;

  for (const item of items) {
    const path = item.path || `${urlPrefix}/${item.slug}.html`;
    item.path = path;
    const related = buildRelatedSections(item, ctx);
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: sectionLabel, href: sectionHref },
      { label: item.title },
    ];
    const howToSteps = item.howToSteps || defaultHowToSteps(item.primaryKeyword || item.title);
    const quickAnswerHtml = item.quickAnswerHtml || quickAnswerSnippet({
      keyword: item.primaryKeyword || item.title,
      type: snippetType || 'guide',
    });
    const meta = buildMeta({ ...item, path, ogType: ogType || 'website' }, site);
    const tryTools = resolveLinks(item.relatedTools?.slice(0, 2), ctx.toolsMap, '/tools');
    const schemas = [
      buildArticleSchema(item, site),
      buildFaqSchema(item.faq),
      buildBreadcrumbSchema(breadcrumbs, site, path),
      buildHowToSchema({ ...item, howToSteps }, site),
    ].filter(s => s && s.length > 2);

    const supplementType = snippetType || 'guide';
    const html = renderPage('content', {
      site,
      page: item,
      path,
      metaHtml: renderHeadPartial(meta, schemas),
      breadcrumbsHtml: renderBreadcrumbsPartial(breadcrumbs),
      relatedHtml: renderRelatedPartial(related),
      faqHtml: renderFaqPartial(item.faq),
      tryItHtml: renderTryItPartial(tryTools),
      contentHtml: item.content + contentSupplement({ keyword: item.primaryKeyword || item.title, type: supplementType }),
      quickAnswerHtml,
      year: new Date().getFullYear(),
      ...related,
    });

    const filePath = item.filePath || `${filePrefix}/${item.slug}.html`;
    writePage(filePath, html);
    ctx.allPages.push({ path, lastmod: item.date || item.lastUpdated || today(), priority });
    ctx.searchEntries.push({
      title: item.title,
      description: item.description,
      path,
      type: snippetType || sectionLabel.toLowerCase().replace(/\s+/g, '-'),
      keywords: item.keywords || '',
    });
  }
}

function generateLearnPages(ctx, items) {
  const { site } = ctx;
  for (const item of items) {
    const path = `/learn/${item.lang}/${item.slug}.html`;
    item.path = path;
    const related = buildRelatedSections(item, ctx);
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Learn', href: '/learn/' },
      { label: item.lang.toUpperCase(), href: `/learn/${item.lang}/` },
      { label: item.title },
    ];
    const meta = buildMeta({ ...item, path }, site);
    const tryTools = resolveLinks(item.relatedTools?.slice(0, 2), ctx.toolsMap, '/tools');
    const schemas = [buildArticleSchema(item, site), buildFaqSchema(item.faq), buildBreadcrumbSchema(breadcrumbs, site, path)];

    const html = renderPage('content', {
      site, page: item, path,
      metaHtml: renderHeadPartial(meta, schemas),
      breadcrumbsHtml: renderBreadcrumbsPartial(breadcrumbs),
      relatedHtml: renderRelatedPartial(related),
      faqHtml: renderFaqPartial(item.faq),
      tryItHtml: renderTryItPartial(tryTools),
      contentHtml: item.content,
      year: new Date().getFullYear(),
      ...related,
    });

    writePage(`learn/${item.lang}/${item.slug}.html`, html);
    ctx.allPages.push({ path, lastmod: today(), priority: '0.75' });
  }

  // Learn language index pages
  const langs = [...new Set(items.map(i => i.lang))];
  for (const lang of langs) {
    const langItems = items.filter(i => i.lang === lang);
    const path = `/learn/${lang}/`;
    const meta = buildMeta({
      title: `JWT ${lang} Examples`,
      seoTitle: `JWT ${lang.charAt(0).toUpperCase() + lang.slice(1)} Examples | JWTValidator.org`,
      description: `JWT authentication code examples in ${lang}. Sign, verify, decode tokens.`,
      path,
    }, site);
    const html = renderPage('index-list', {
      site,
      page: { title: `JWT ${lang.charAt(0).toUpperCase() + lang.slice(1)} Examples` },
      path,
      metaHtml: renderHeadPartial(meta, []),
      breadcrumbsHtml: renderBreadcrumbsPartial([{ label: 'Home', href: '/' }, { label: 'Learn', href: '/learn/' }, { label: lang }]),
      listItems: langItems.map(i => ({ title: i.title, description: i.description, href: `/learn/${lang}/${i.slug}.html` })),
      year: new Date().getFullYear(),
    });
    writePage(`learn/${lang}/index.html`, html);
    ctx.allPages.push({ path, lastmod: today(), priority: '0.7' });
  }
}

function generateHubPages(ctx) {
  const { site } = ctx;
  const seoConfig = readJson('seo-config.json', { clusters: [] });
  const trustLinksHtml = renderTrustLinksPartial();

  // Collect all pages by cluster
  const allContent = [
    ...readJson('guides.json').map(p => ({ ...p, path: `/guides/${p.slug}.html`, cluster: p.cluster || 'decode-validate' })),
    ...readJson('errors.json').map(p => ({ ...p, path: `/errors/${p.slug}.html`, cluster: p.cluster || 'decode-validate' })),
    ...readJson('algorithms.json').map(p => ({ ...p, path: `/algorithms/${p.slug}.html`, cluster: p.cluster || 'algorithms' })),
    ...readJson('comparisons.json').map(p => ({ ...p, path: `/compare/${p.slug}.html`, cluster: p.cluster || 'comparisons' })),
    ...readJson('claims.json').map(p => ({ ...p, path: `/claims/${p.slug}.html`, cluster: p.cluster || 'claims' })),
    ...readJson('providers.json').map(p => ({ ...p, path: `/providers/${p.slug}.html`, cluster: p.cluster || 'providers' })),
    ...readJson('use-cases.json').map(p => ({ ...p, path: `/use-cases/${p.slug}.html`, cluster: p.cluster || 'security' })),
    ...readJson('tools.json').map(p => ({ ...p, path: `/tools/${p.slug}.html`, cluster: 'tools' })),
  ];

  const hubIndex = [];

  for (const cluster of seoConfig.clusters || []) {
    const clusterPages = allContent.filter(p => p.cluster === cluster.id);
    const path = `/hubs/${cluster.hubSlug}.html`;

    const meta = buildMeta({
      title: cluster.name,
      seoTitle: `${cluster.name} — JWT Topic Hub | JWTValidator.org`,
      description: cluster.description,
      path,
    }, site);

    const html = renderPage('hub', {
      site,
      page: { title: cluster.name, description: cluster.description },
      path,
      metaHtml: renderHeadPartial(meta, [buildBreadcrumbSchema([{ label: 'Home', href: '/' }, { label: 'Topics', href: '/hubs/' }, { label: cluster.name }], site, path)]),
      breadcrumbsHtml: renderBreadcrumbsPartial([{ label: 'Home', href: '/' }, { label: 'Topics', href: '/hubs/' }, { label: cluster.name }]),
      hubPages: clusterPages.map(p => ({ title: p.title, description: p.description, href: p.path })),
      trustLinksHtml,
      year: new Date().getFullYear(),
    });

    writePage(`hubs/${cluster.hubSlug}.html`, html);
    ctx.allPages.push({ path, lastmod: today(), priority: String(cluster.priority || 0.85) });
    hubIndex.push({ title: cluster.name, description: cluster.description, href: path });
  }

  // Hubs index
  const hubsPath = '/hubs/';
  const hubsMeta = buildMeta({
    title: 'JWT Topic Hubs',
    seoTitle: 'JWT Topic Hubs — Guides, Tools, Algorithms | JWTValidator.org',
    description: 'Browse JWT topic hubs: tools, algorithms, security, implementation guides, and comparisons.',
    path: hubsPath,
  }, site);

  const hubsHtml = renderPage('index-list', {
    site,
    page: { title: 'JWT Topic Hubs' },
    path: hubsPath,
    metaHtml: renderHeadPartial(hubsMeta, []),
    breadcrumbsHtml: renderBreadcrumbsPartial([{ label: 'Home', href: '/' }, { label: 'Topic Hubs' }]),
    listItems: hubIndex,
    year: new Date().getFullYear(),
  });
  writePage('hubs/index.html', hubsHtml);
  ctx.allPages.push({ path: hubsPath, lastmod: today(), priority: '0.8' });
}

function generateSectionIndexes(ctx, sections) {
  const { site } = ctx;
  for (const section of sections) {
    const path = section.path;
    const meta = buildMeta({
      title: section.title,
      seoTitle: `${section.title} | ${site.name}`,
      description: section.description || `Browse ${section.title} on ${site.name}.`,
      path,
    }, site);

    const html = renderPage('index-list', {
      site,
      page: { title: section.title, description: section.description },
      path,
      introHtml: section.introHtml || `<p class="lead">Browse ${section.items.length} ${section.title.toLowerCase()} on JWTValidator.org — free JWT decoder, validator, and learning resources.</p>`,
      metaHtml: renderHeadPartial(meta, section.items.length ? [buildItemListSchema(section.title, section.items, site)] : []),
      breadcrumbsHtml: renderBreadcrumbsPartial([{ label: 'Home', href: '/' }, { label: section.title }]),
      listItems: section.items,
      year: new Date().getFullYear(),
    });
    writePage(section.outPath, html);
    ctx.allPages.push({ path, lastmod: today(), priority: section.priority || '0.7' });
  }
}

function today() {
  return new Date().toISOString().split('T')[0];
}

export function generateAll() {
  const site = readJson('site.json');
  const tools = readJson('tools.json');
  const guides = readJson('guides.json');
  const algorithms = readJson('algorithms.json');
  const errors = readJson('errors.json');
  const blogPosts = readJson('blog-posts.json');
  const comparisons = readJson('comparisons.json');
  const claims = readJson('claims.json');
  const providers = readJson('providers.json');
  const useCases = readJson('use-cases.json');
  const learn = readJson('learn.json');
  const examples = readJson('jwt-examples.json');
  const learningPath = readJson('learning-path.json');

  const ctx = {
    site,
    toolsMap: new Map(tools.map(t => [t.slug, t])),
    guidesMap: new Map(guides.map(g => [g.slug, g])),
    algorithmsMap: new Map(algorithms.map(a => [a.slug, a])),
    errorsMap: new Map(errors.map(e => [e.slug, e])),
    blogMap: new Map(blogPosts.map(b => [b.slug, b])),
    comparisonsMap: new Map(comparisons.map(c => [c.slug, c])),
    claimsMap: new Map(claims.map(c => [c.slug, c])),
    providersMap: new Map(providers.map(p => [p.slug, p])),
    examples,
    allPages: [],
    searchEntries: [],
  };

  const mapItems = (items, prefix) => items.map(i => ({
    title: i.title,
    description: i.description,
    href: `${prefix}/${i.slug}.html`,
  }));

  // Tools
  for (const tool of tools) {
    const path = `/tools/${tool.slug}.html`;
    const related = buildRelatedSections(tool, ctx);
    const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Tools', href: '/#tools' }, { label: tool.title }];
    const meta = buildMeta({ ...tool, path }, site);
    const schemas = [buildSoftwareAppSchema(tool, site), buildFaqSchema(tool.faq), buildBreadcrumbSchema(breadcrumbs, site, path)];

    writePage(`tools/${tool.slug}.html`, renderPage('tool', {
      site, page: tool, path,
      metaHtml: renderHeadPartial(meta, schemas),
      breadcrumbsHtml: renderBreadcrumbsPartial(breadcrumbs),
      relatedHtml: renderRelatedPartial(related),
      faqHtml: renderFaqPartial(tool.faq),
      contentHtml: '',
      exampleToken: examples.hs256?.token || '',
      toolScript: tool.script,
      year: new Date().getFullYear(),
      ...related,
    }));
    ctx.allPages.push({ path, lastmod: today(), priority: '0.9' });
    ctx.searchEntries.push({ title: tool.title, description: tool.description, path, type: 'tool', keywords: tool.keywords || '' });
  }

  generateContentPages(ctx, guides, { site, sectionLabel: 'Guides', sectionHref: '/guides/', filePrefix: 'guides', urlPrefix: '/guides', priority: '0.8', snippetType: 'guide' });
  generateContentPages(ctx, algorithms, { site, sectionLabel: 'Algorithms', sectionHref: '/algorithms/', filePrefix: 'algorithms', urlPrefix: '/algorithms', priority: '0.8', snippetType: 'algorithm' });
  generateContentPages(ctx, errors, { site, sectionLabel: 'Errors', sectionHref: '/errors/', filePrefix: 'errors', urlPrefix: '/errors', priority: '0.75', snippetType: 'error' });
  generateContentPages(ctx, blogPosts.map(p => ({ ...p, date: p.date })), { site, sectionLabel: 'Blog', sectionHref: '/blog/', filePrefix: 'blog/posts', urlPrefix: '/blog/posts', priority: '0.8', ogType: 'article', snippetType: 'blog' });
  generateContentPages(ctx, comparisons, { site, sectionLabel: 'Compare', sectionHref: '/compare/', filePrefix: 'compare', urlPrefix: '/compare', priority: '0.7', snippetType: 'compare' });
  generateContentPages(ctx, claims, { site, sectionLabel: 'Claims', sectionHref: '/claims/', filePrefix: 'claims', urlPrefix: '/claims', priority: '0.7', snippetType: 'claim' });
  generateContentPages(ctx, providers, { site, sectionLabel: 'Providers', sectionHref: '/providers/', filePrefix: 'providers', urlPrefix: '/providers', priority: '0.7', snippetType: 'provider' });
  generateContentPages(ctx, useCases, { site, sectionLabel: 'Use Cases', sectionHref: '/use-cases/', filePrefix: 'use-cases', urlPrefix: '/use-cases', priority: '0.7', snippetType: 'guide' });

  if (learn.length) generateLearnPages(ctx, learn);
  generateHubPages(ctx);
  generateGlossaryPages(ctx);

  generateResourcesPage(ctx, [
    { title: 'Tools', items: mapItems(tools, '/tools') },
    { title: 'Guides', items: mapItems(guides, '/guides') },
    { title: 'Errors', items: mapItems(errors, '/errors') },
    { title: 'Algorithms', items: mapItems(algorithms, '/algorithms') },
    { title: 'Comparisons', items: mapItems(comparisons, '/compare') },
    { title: 'Claims', items: mapItems(claims, '/claims') },
    { title: 'Providers', items: mapItems(providers, '/providers') },
    { title: 'Glossary', items: readJson('glossary.json', []).map(t => ({ title: t.term, description: t.definition.slice(0, 100), href: `/glossary/${t.slug}.html` })) },
  ]);

  // Section index pages
  generateSectionIndexes(ctx, [
    { title: 'JWT Guides', path: '/guides/', outPath: 'guides/index.html', priority: '0.75', items: guides.map(g => ({ title: g.title, description: g.description, href: `/guides/${g.slug}.html` })) },
    { title: 'JWT Algorithms', path: '/algorithms/', outPath: 'algorithms/index.html', items: algorithms.map(a => ({ title: a.title, description: a.description, href: `/algorithms/${a.slug}.html` })) },
    { title: 'JWT Errors', path: '/errors/', outPath: 'errors/index.html', items: errors.map(e => ({ title: e.title, description: e.description, href: `/errors/${e.slug}.html` })) },
    { title: 'JWT Blog', path: '/blog/', outPath: 'blog/index.html', items: blogPosts.map(b => ({ title: b.title, description: b.description, href: `/blog/posts/${b.slug}.html` })) },
    { title: 'JWT Comparisons', path: '/compare/', outPath: 'compare/index.html', items: comparisons.map(c => ({ title: c.title, description: c.description, href: `/compare/${c.slug}.html` })) },
    { title: 'JWT Claims', path: '/claims/', outPath: 'claims/index.html', items: claims.map(c => ({ title: c.title, description: c.description, href: `/claims/${c.slug}.html` })) },
    { title: 'Auth Providers', path: '/providers/', outPath: 'providers/index.html', items: providers.map(p => ({ title: p.title, description: p.description, href: `/providers/${p.slug}.html` })) },
    { title: 'JWT Use Cases', path: '/use-cases/', outPath: 'use-cases/index.html', items: useCases.map(u => ({ title: u.title, description: u.description, href: `/use-cases/${u.slug}.html` })) },
    { title: 'Learn JWT', path: '/learn/', outPath: 'learn/index.html', items: [...new Set(learn.map(l => l.lang))].map(lang => ({ title: `${lang.charAt(0).toUpperCase() + lang.slice(1)} Examples`, description: `JWT code examples in ${lang}`, href: `/learn/${lang}/` })) },
  ]);

  // Homepage
  const path = '/';
  writePage('index.html', renderPage('home', {
    site, path,
    metaHtml: renderHeadPartial(buildMeta({ title: site.tagline, seoTitle: 'JWT Decoder, Validator & Tools Hub | JWTValidator.org', description: site.description, path }, site), [
      buildWebSiteSchema(site),
      buildOrganizationSchema(site),
    ]),
    toolCards: tools.map(t => ({ icon: t.icon, title: t.title, description: t.description, href: `/tools/${t.slug}.html` })),
    guideCards: guides.slice(0, 6).map(g => ({ title: g.title, description: g.description, href: `/guides/${g.slug}.html` })),
    blogCards: blogPosts.slice(0, 3).map(b => ({ title: b.title, description: b.description, href: `/blog/posts/${b.slug}.html` })),
    year: new Date().getFullYear(),
  }));
  ctx.allPages.unshift({ path: '/', lastmod: today(), priority: '1.0' });

  // Learning path
  const lpPath = '/learning-path.html';
  writePage('learning-path.html', renderPage('learning-path', {
    site, page: learningPath, path: lpPath,
    metaHtml: renderHeadPartial(buildMeta({ title: learningPath.title, seoTitle: learningPath.seoTitle, description: learningPath.description, path: lpPath }, site), []),
    breadcrumbsHtml: renderBreadcrumbsPartial([{ label: 'Home', href: '/' }, { label: learningPath.title }]),
    steps: learningPath.steps,
    commonMistakes: learningPath.commonMistakes.map(m => ({ text: m })),
    attackScenarios: learningPath.attackScenarios,
    year: new Date().getFullYear(),
  }));
  ctx.allPages.push({ path: lpPath, lastmod: today(), priority: '0.8' });

  // Trust pages
  for (const page of readJson('trust-pages.json')) {
    const tPath = `/${page.slug}.html`;
    const breadcrumbs = [{ label: 'Home', href: '/' }, { label: page.title }];
    const meta = buildMeta({ ...page, path: tPath }, site);
    const template = page.template || 'trust';
    writePage(`${page.slug}.html`, renderPage(template, {
      site, page, path: tPath,
      contactEmail: site.contactEmail || 'support@ratpdf.com',
      metaHtml: renderHeadPartial(meta, [buildBreadcrumbSchema(breadcrumbs, site, tPath), page.faq?.length ? buildFaqSchema(page.faq) : null].filter(Boolean)),
      breadcrumbsHtml: renderBreadcrumbsPartial(breadcrumbs),
      contentHtml: page.content || '',
      faqHtml: renderFaqPartial(page.faq),
      trustLinksHtml: renderTrustLinksPartial(),
      year: new Date().getFullYear(),
    }));
    ctx.allPages.push({ path: tPath, lastmod: page.lastUpdated || today(), priority: '0.5' });
  }

  writeSearchIndex(ctx);
  return ctx.allPages;
}

if (process.argv[1]?.endsWith('generate-pages.js')) {
  mkdirSync(DIST, { recursive: true });
  const pages = generateAll();
  console.log(`Generated ${pages.length} pages → dist/`);
}
