/**
 * Advanced SEO schema and metadata builders for global JWT search dominance.
 */

export function buildMeta(page, site) {
  const url = `${site.domain}${page.path}`;
  return {
    title: page.seoTitle || page.title,
    description: page.description,
    keywords: page.keywords || '',
    canonical: url,
    ogTitle: page.seoTitle || page.title,
    ogDescription: page.description,
    ogUrl: url,
    ogType: page.ogType || 'website',
    ogSiteName: site.name,
    ogImage: page.ogImage || site.ogImage || `${site.domain}/assets/img/og-default.svg`,
    twitterCard: 'summary_large_image',
    twitterTitle: page.seoTitle || page.title,
    twitterDescription: page.description,
    twitterImage: page.ogImage || site.ogImage || `${site.domain}/assets/img/og-default.svg`,
    hreflangTags: buildHreflangTags(page, site),
    robots: page.robots || 'index, follow, max-snippet:-1, max-image-preview:large',
  };
}

const LOCALE_MAP = {
  deutsch: 'de', francais: 'fr', espanol: 'es', portugues: 'pt',
  italiano: 'it', nederlands: 'nl', polski: 'pl', turkce: 'tr', russian: 'ru',
  japanese: 'ja', korean: 'ko', chinese: 'zh', hindi: 'hi', arabic: 'ar',
};

export function detectHreflang(slug) {
  for (const [key, lang] of Object.entries(LOCALE_MAP)) {
    if (slug.includes(key)) return lang;
  }
  return null;
}

function buildHreflangTags(page, site) {
  const lang = page.hreflang || detectHreflang(page.slug || '');
  if (!lang) {
    return `<link rel="alternate" hreflang="x-default" href="${site.domain}${page.path}">\n<link rel="alternate" hreflang="en" href="${site.domain}${page.path}">`;
  }
  const enPath = page.enEquivalent || page.path;
  return `<link rel="alternate" hreflang="${lang}" href="${site.domain}${page.path}">
<link rel="alternate" hreflang="en" href="${site.domain}${enPath}">
<link rel="alternate" hreflang="x-default" href="${site.domain}${enPath}">`;
}

export function buildBreadcrumbs(items) {
  return items.map((item, i) => ({ ...item, isLast: i === items.length - 1 }));
}

export function buildFaqSchema(faq) {
  if (!faq?.length) return '';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  });
}

export function buildHowToSchema(page, site) {
  if (!page.howToSteps?.length) return '';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: page.title,
    description: page.description,
    url: `${site.domain}${page.path}`,
    step: page.howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  });
}

export function buildArticleSchema(page, site) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.seoTitle || page.title,
    description: page.description,
    url: `${site.domain}${page.path}`,
    author: { '@type': 'Organization', name: page.author || site.name, url: site.domain },
    datePublished: page.date || page.lastUpdated || '2026-01-01',
    dateModified: page.lastUpdated || new Date().toISOString().split('T')[0],
    publisher: {
      '@type': 'Organization', name: site.name, url: site.domain,
      logo: { '@type': 'ImageObject', url: `${site.domain}/assets/img/logo.svg` },
    },
    mainEntityOfPage: `${site.domain}${page.path}`,
    inLanguage: page.hreflang || detectHreflang(page.slug || '') || 'en',
  });
}

export function buildSoftwareAppSchema(tool, site) {
  const url = `${site.domain}/tools/${tool.slug}.html`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.title,
    description: tool.description,
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: ['JWT decode', 'encode', 'validate', 'debug', 'offline capable', 'no upload'],
  });
}

export function buildBreadcrumbSchema(breadcrumbs, site, pagePath = '') {
  const pageUrl = pagePath ? `${site.domain}${pagePath}` : undefined;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => {
      const itemUrl = b.href ? `${site.domain}${b.href}` : (pageUrl || `${site.domain}/`);
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: b.label,
        item: itemUrl,
      };
    }),
  });
}

export function buildOrganizationSchema(site) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.domain,
    logo: `${site.domain}/assets/img/logo.svg`,
    description: site.description,
    sameAs: [],
  });
}

export function buildWebSiteSchema(site) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.domain,
    description: site.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site.domain}/resources.html?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  });
}

export function buildItemListSchema(name, items, site) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 50).map((item, i) => ({
      '@type': 'ListItem', position: i + 1,
      name: item.title,
      url: `${site.domain}${item.href || item.path}`,
    })),
  });
}

export function buildDefinedTermSchema(term, site) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.definition,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'JWT Glossary',
      url: `${site.domain}/glossary/`,
    },
    url: `${site.domain}/glossary/${term.slug}.html`,
  });
}

export function defaultHowToSteps(keyword) {
  return [
    { name: 'Copy JWT token', text: 'Copy the JWT from your app, API response, or browser dev tools.' },
    { name: 'Paste into decoder', text: 'Open the JWT Decoder tool and paste the token.' },
    { name: 'Inspect claims', text: 'Review header, payload claims, and expiration time.' },
    { name: 'Verify signature', text: `Use the JWT Validator with the correct secret or JWKS URL to verify.` },
  ];
}
