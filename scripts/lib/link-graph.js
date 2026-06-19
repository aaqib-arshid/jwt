/** Auto internal linking for programmatic SEO pages */

const CLUSTER_TOOLS = {
  'decode-validate': ['jwt-decoder', 'jwt-validator', 'jwt-debugger', 'jwt-expiry-checker'],
  algorithms: ['jwt-validator', 'jwt-encoder', 'jwks-validator'],
  implementation: ['jwt-encoder', 'jwt-decoder', 'jwt-validator'],
  claims: ['jwt-decoder', 'jwt-debugger'],
  providers: ['jwks-validator', 'oauth-token-inspector', 'jwt-decoder'],
  security: ['jwt-validator', 'jwt-debugger', 'jwks-validator'],
  comparisons: ['jwt-decoder', 'jwt-validator'],
  tools: ['jwt-decoder', 'jwt-validator', 'jwt-encoder', 'jwt-debugger'],
};

const CLUSTER_GUIDES = {
  'decode-validate': ['jwt-basics', 'jwt-authentication-explained', 'jwt-expired-token-fix', 'jwt-invalid-signature'],
  algorithms: ['jwt-authentication-explained', 'jwt-invalid-signature'],
  implementation: ['jwt-basics', 'jwt-authentication-explained'],
  claims: ['jwt-basics', 'jwt-authentication-explained'],
  providers: ['jwt-authentication-explained'],
  security: ['jwt-invalid-signature', 'jwt-expired-token-fix'],
  comparisons: ['jwt-basics', 'jwt-authentication-explained'],
};

export function assignLinks(page, type, clusterId) {
  const tools = CLUSTER_TOOLS[clusterId] || CLUSTER_TOOLS['decode-validate'];
  const guides = CLUSTER_GUIDES[clusterId] || CLUSTER_GUIDES['decode-validate'];

  return {
    ...page,
    relatedTools: page.relatedTools || tools.slice(0, 4),
    relatedGuides: page.relatedGuides || guides.slice(0, 4),
    relatedArticles: page.relatedArticles || ['jwt-beginner-guide', 'jwt-security-best-practices'],
    relatedAlgorithms: page.relatedAlgorithms || ['hs256-vs-rs256', 'jwt-algorithm-selection'],
    relatedErrors: page.relatedErrors || ['invalid-signature', 'token-expired'],
    cluster: clusterId,
    pageType: type,
  };
}

export function hubPages(clusters, sectionMaps) {
  return clusters.map(cluster => {
    const pages = [];
    for (const section of cluster.sections || []) {
      const items = sectionMaps[section] || [];
      for (const item of items) {
        if (item.cluster === cluster.id || !item.cluster) {
          pages.push(item);
        }
      }
    }
    return {
      slug: cluster.hubSlug,
      title: cluster.name,
      seoTitle: `${cluster.name} — JWTValidator.org Topic Hub`,
      description: cluster.description,
      cluster: cluster.id,
      pages: pages.slice(0, 50).map(p => ({
        title: p.title,
        description: p.description,
        href: p.path || buildPath(p, sectionMaps),
      })).filter(p => p.href),
    };
  });
}

function buildPath(item, sectionMaps) {
  if (item.path) return item.path;
  if (item.lang) return `/learn/${item.lang}/${item.slug}.html`;
  const type = item.pageType || 'guides';
  const prefixes = {
    guides: '/guides',
    errors: '/errors',
    algorithms: '/algorithms',
    compare: '/compare',
    claims: '/claims',
    providers: '/providers',
    'use-cases': '/use-cases',
    learn: `/learn/${item.lang || 'nodejs'}`,
  };
  const prefix = prefixes[type] || `/guides`;
  return `${prefix}/${item.slug}.html`;
}

export function crossLinkErrors(guides, errors) {
  const errorSlugs = new Set(errors.map(e => e.slug));
  const fixMap = {
    'jwt-expired-token-fix': 'token-expired',
    'jwt-invalid-signature': 'invalid-signature',
  };
  return guides.map(g => {
    const errSlug = fixMap[g.slug];
    if (errSlug && errorSlugs.has(errSlug)) {
      return { ...g, relatedErrors: [...(g.relatedErrors || []), errSlug] };
    }
    return g;
  });
}
