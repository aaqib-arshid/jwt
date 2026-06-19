/**
 * Programmatic SEO page generator — scales to 1000+ pages.
 * Reads keyword CSVs → writes JSON data files → consumed by generate-pages.js
 *
 * Usage: node scripts/generate-programmatic.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  guideContent, errorContent, claimContent, compareContent,
  learnContent, providerContent, useCaseContent, buildFaq,
} from './lib/content-templates.js';
import { assignLinks } from './lib/link-graph.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');

function readJson(name) {
  return JSON.parse(readFileSync(join(DATA, name), 'utf-8'));
}

function writeJson(name, data) {
  writeFileSync(join(DATA, name), JSON.stringify(data, null, 2) + '\n');
}

function parseCsv(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
  });
}

function mergeBySlug(existing, incoming) {
  const map = new Map(existing.map(e => [e.slug, e]));
  let added = 0;
  for (const item of incoming) {
    if (!item.slug || map.has(item.slug)) continue;
    map.set(item.slug, item);
    added++;
  }
  return { items: [...map.values()], added };
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── Seed generators ───────────────────────────────────────────────

function seedClaims() {
  const claims = [
    { slug: 'exp', claim: 'exp', name: 'Expiration Time', description: 'is a Unix timestamp indicating when the token must no longer be accepted.' },
    { slug: 'sub', claim: 'sub', name: 'Subject', description: 'identifies the principal (user or entity) that is the subject of the token.' },
    { slug: 'iss', claim: 'iss', name: 'Issuer', description: 'identifies the principal that issued the JWT, typically your auth server URL.' },
    { slug: 'aud', claim: 'aud', name: 'Audience', description: 'identifies the recipients that the JWT is intended for — your API or client ID.' },
    { slug: 'iat', claim: 'iat', name: 'Issued At', description: 'is a Unix timestamp of when the token was created.' },
    { slug: 'nbf', claim: 'nbf', name: 'Not Before', description: 'is a Unix timestamp before which the token must not be accepted.' },
    { slug: 'jti', claim: 'jti', name: 'JWT ID', description: 'provides a unique identifier for the token, used for revocation and replay prevention.' },
  ];
  return claims.map(c => assignLinks({
    slug: c.slug,
    title: `JWT ${c.claim.toUpperCase()} Claim Explained`,
    seoTitle: `JWT ${c.claim} Claim (${c.name}) — Meaning & Validation`,
    description: `What is the JWT ${c.claim} claim? Learn ${c.name} meaning, examples, and validation rules for ${c.claim} in JSON Web Tokens.`,
    keywords: `jwt ${c.claim} claim,${c.claim} jwt,${c.name.toLowerCase()} jwt`,
    content: claimContent(c),
    faq: buildFaq(`jwt ${c.claim} claim`, 'claim'),
    cluster: 'claims',
    pageType: 'claims',
  }, 'claims', 'claims'));
}

function seedComparisons() {
  const pairs = [
    { slug: 'jwt-vs-session', title: 'JWT vs Session Cookies', a: 'JWT', b: 'Session Cookies', keyword: 'jwt vs session cookies authentication' },
    { slug: 'jwt-vs-oauth', title: 'JWT vs OAuth 2.0', a: 'JWT', b: 'OAuth', keyword: 'jwt vs oauth difference' },
    { slug: 'jwt-vs-api-key', title: 'JWT vs API Keys', a: 'JWT', b: 'API Keys', keyword: 'jwt vs api key authentication' },
    { slug: 'jwt-io-alternative', title: 'Best jwt.io Alternative', a: 'JWTValidator.org', b: 'jwt.io', keyword: 'jwt.io alternative jwt decoder' },
    { slug: 'access-token-vs-id-token', title: 'Access Token vs ID Token', a: 'Access Token', b: 'ID Token', keyword: 'access token vs id token oauth' },
    { slug: 'bearer-token-vs-jwt', title: 'Bearer Token vs JWT', a: 'Bearer Token', b: 'JWT', keyword: 'bearer token vs jwt difference' },
    { slug: 'hs256-vs-es256', title: 'HS256 vs ES256', a: 'HS256', b: 'ES256', keyword: 'hs256 vs es256 jwt algorithm' },
    { slug: 'stateless-vs-stateful-auth', title: 'Stateless vs Stateful Authentication', a: 'JWT', b: 'Session Cookies', keyword: 'stateless vs stateful authentication jwt' },
    { slug: 'jwt-vs-passport', title: 'JWT vs Passport.js Sessions', a: 'JWT', b: 'Passport Sessions', keyword: 'jwt vs passport session' },
    { slug: 'jwt-vs-api-gateway-key', title: 'JWT vs API Gateway Keys', a: 'JWT', b: 'API Keys', keyword: 'jwt vs api gateway key' },
    { slug: 'jwt-vs-mtls', title: 'JWT vs mTLS', a: 'JWT', b: 'mTLS', keyword: 'jwt vs mtls authentication' },
    { slug: 'jwt-vs-saml', title: 'JWT vs SAML', a: 'JWT', b: 'SAML', keyword: 'jwt vs saml sso' },
    { slug: 'jwt-vs-basic-auth', title: 'JWT vs Basic Auth', a: 'JWT', b: 'Basic Auth', keyword: 'jwt vs basic authentication' },
    { slug: 'jwt-decode-vs-verify', title: 'JWT Decode vs Verify', a: 'Decode', b: 'Verify', keyword: 'jwt decode vs verify difference' },
  ];
  return pairs.map(p => assignLinks({
    ...p,
    seoTitle: `${p.title} — Complete Comparison | JWTValidator.org`,
    description: `Compare ${p.keyword}. Practical guide for developers choosing authentication strategies.`,
    keywords: p.keyword,
    content: compareContent(p),
    faq: buildFaq(p.keyword),
    cluster: 'comparisons',
    pageType: 'compare',
  }, 'compare', 'comparisons'));
}

function seedAlgorithmComparisons() {
  const algos = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'EdDSA'];
  const pairs = [];
  for (let i = 0; i < algos.length; i++) {
    for (let j = i + 1; j < algos.length; j++) {
      const a = algos[i];
      const b = algos[j];
      const slug = `${a.toLowerCase()}-vs-${b.toLowerCase()}`;
      pairs.push({
        slug,
        title: `${a} vs ${b} — JWT Algorithm Comparison`,
        a,
        b,
        keyword: `${a.toLowerCase()} vs ${b.toLowerCase()} jwt algorithm`,
      });
    }
  }
  return pairs.map(p => assignLinks({
    ...p,
    seoTitle: `${p.title} | JWTValidator.org`,
    description: `Compare ${p.a} and ${p.b} JWT signing algorithms. Choose the right algorithm for your API.`,
    keywords: p.keyword,
    content: compareContent({ title: p.title, a: p.a, b: p.b, keyword: p.keyword }),
    faq: buildFaq(p.keyword),
    cluster: 'algorithms',
    pageType: 'compare',
  }, 'compare', 'algorithms'));
}

function seedProviders() {
  const providers = [
    { slug: 'auth0-jwt', provider: 'Auth0', keyword: 'auth0 jwt decode verify' },
    { slug: 'firebase-jwt', provider: 'Firebase', keyword: 'firebase jwt id token verify' },
    { slug: 'aws-cognito-jwt', provider: 'AWS Cognito', keyword: 'aws cognito jwt verify' },
    { slug: 'okta-jwt', provider: 'Okta', keyword: 'okta jwt access token verify' },
    { slug: 'keycloak-jwt', provider: 'Keycloak', keyword: 'keycloak jwt decode' },
    { slug: 'azure-ad-jwt', provider: 'Azure AD', keyword: 'azure ad jwt verify' },
    { slug: 'google-oauth-jwt', provider: 'Google OAuth', keyword: 'google oauth jwt id token' },
    { slug: 'supabase-jwt', provider: 'Supabase', keyword: 'supabase jwt verify' },
    { slug: 'github-jwt', provider: 'GitHub', keyword: 'github jwt app token verify' },
    { slug: 'microsoft-entra-jwt', provider: 'Microsoft Entra ID', keyword: 'microsoft entra jwt verify' },
    { slug: 'stripe-jwt', provider: 'Stripe', keyword: 'stripe jwt connect webhook' },
    { slug: 'ping-identity-jwt', provider: 'Ping Identity', keyword: 'ping identity jwt verify' },
    { slug: 'duende-identityserver-jwt', provider: 'Duende IdentityServer', keyword: 'duende identityserver jwt' },
    { slug: 'passport-oauth-jwt', provider: 'Passport.js OAuth', keyword: 'passport oauth jwt strategy' },
    { slug: 'hasura-jwt', provider: 'Hasura', keyword: 'hasura jwt authentication' },
    { slug: 'wordpress-jwt', provider: 'WordPress JWT', keyword: 'wordpress jwt authentication plugin' },
  ];
  return providers.map(p => assignLinks({
    slug: p.slug,
    title: `${p.provider} JWT — Decode & Verify Guide`,
    seoTitle: `${p.provider} JWT Token Guide — Decode & Verify`,
    description: `How to decode and verify ${p.provider} JWT tokens. JWKS validation, claims, and debugging with free tools.`,
    keywords: p.keyword,
    content: providerContent(p),
    faq: buildFaq(p.keyword),
    cluster: 'providers',
    pageType: 'providers',
  }, 'providers', 'providers'));
}

function seedUseCases() {
  const cases = [
    { slug: 'microservices-auth', scenario: 'microservices architectures', keyword: 'jwt authentication microservices' },
    { slug: 'spa-authentication', scenario: 'single-page applications (React, Vue, Angular)', keyword: 'jwt authentication spa react' },
    { slug: 'mobile-api-auth', scenario: 'mobile app API authentication', keyword: 'jwt mobile app authentication' },
    { slug: 'api-gateway-jwt', scenario: 'API gateway token validation', keyword: 'jwt api gateway validation' },
    { slug: 'single-sign-on', scenario: 'single sign-on (SSO) systems', keyword: 'jwt single sign on sso' },
    { slug: 'machine-to-machine', scenario: 'machine-to-machine (M2M) communication', keyword: 'jwt machine to machine m2m' },
    { slug: 'graphql-jwt-auth', scenario: 'GraphQL API authentication', keyword: 'jwt graphql authentication' },
    { slug: 'websocket-jwt-auth', scenario: 'WebSocket connection authentication', keyword: 'jwt websocket authentication' },
  ];
  return cases.map(c => assignLinks({
    slug: c.slug,
    title: `JWT for ${c.scenario.split('(')[0].trim()}`,
    seoTitle: `JWT Authentication for ${c.scenario} — Guide`,
    description: `${c.keyword} — implementation guide with tools and best practices.`,
    keywords: c.keyword,
    content: useCaseContent({ title: `JWT for ${c.scenario}`, keyword: c.keyword, scenario: c.scenario }),
    faq: buildFaq(c.keyword),
    cluster: 'security',
    pageType: 'use-cases',
  }, 'use-cases', 'security'));
}

function seedLearnLanguages() {
  const langs = ['nodejs', 'python', 'java', 'go', 'csharp', 'php', 'ruby', 'typescript', 'rust', 'elixir', 'kotlin', 'swift', 'scala'];
  const topics = [
    { slug: 'jwt-authentication', title: 'JWT Authentication', keyword: 'jwt authentication' },
    { slug: 'jwt-verify', title: 'Verify JWT Token', keyword: 'jwt verify token' },
    { slug: 'jwt-decode', title: 'Decode JWT Token', keyword: 'jwt decode token' },
    { slug: 'jwt-sign', title: 'Sign JWT Token', keyword: 'jwt sign token' },
    { slug: 'jwt-refresh-token', title: 'JWT Refresh Token', keyword: 'jwt refresh token' },
    { slug: 'jwt-middleware', title: 'JWT Middleware', keyword: 'jwt middleware' },
    { slug: 'jwt-guard', title: 'JWT Auth Guard', keyword: 'jwt auth guard' },
    { slug: 'jwt-interceptor', title: 'JWT HTTP Interceptor', keyword: 'jwt interceptor' },
  ];
  const pages = [];
  for (const lang of langs) {
    for (const topic of topics) {
      pages.push(assignLinks({
        slug: topic.slug,
        lang,
        title: `${topic.title} in ${lang.charAt(0).toUpperCase() + lang.slice(1)}`,
        seoTitle: `${topic.title} ${lang} Example — Code & Guide`,
        description: `${topic.keyword} ${lang} example. Complete code sample with sign, verify, and debug using free JWT tools.`,
        keywords: `${topic.keyword} ${lang},${lang} jwt example`,
        content: learnContent({ language: lang, title: `${topic.title} in ${lang}`, keyword: `${topic.keyword} ${lang}` }),
        faq: buildFaq(`${topic.keyword} ${lang}`),
        cluster: 'implementation',
        pageType: 'learn',
      }, 'learn', 'implementation'));
    }
  }
  return pages;
}

function fromCsvGuides(rows) {
  return rows.map(row => assignLinks({
    slug: row.slug || slugify(row.primary_keyword),
    title: row.title,
    seoTitle: `${row.title} | JWTValidator.org`,
    description: row.description || `Guide to ${row.primary_keyword}. Free JWT decoder and validator tools included.`,
    keywords: `${row.primary_keyword},${row.secondary_keywords || 'jwt'}`,
    content: guideContent({
      title: row.title,
      keyword: row.primary_keyword,
      lang: row.language || null,
      fixType: row.fix_type || null,
    }),
    faq: buildFaq(row.primary_keyword),
    cluster: row.cluster || 'decode-validate',
    pageType: 'guides',
  }, 'guides', row.cluster || 'decode-validate'));
}

function fromCsvErrors(rows) {
  return rows.map(row => assignLinks({
    slug: row.slug || slugify(row.primary_keyword),
    title: row.title,
    seoTitle: `${row.title} — Fix & Explanation`,
    description: row.description || `Fix ${row.primary_keyword}. Diagnose and resolve JWT validation errors.`,
    keywords: row.primary_keyword,
    errorCode: row.error_code || '',
    content: errorContent({ title: row.title, keyword: row.primary_keyword, errorCode: row.error_code }),
    faq: buildFaq(row.primary_keyword, 'error'),
    cluster: 'decode-validate',
    pageType: 'errors',
  }, 'errors', 'decode-validate'));
}

function fromCsvAlgorithms(rows) {
  return rows.map(row => assignLinks({
    slug: row.slug || slugify(row.primary_keyword),
    title: row.title,
    seoTitle: `${row.title} | JWTValidator.org`,
    description: row.description || `${row.primary_keyword} — algorithm guide for JWT signing and verification.`,
    keywords: row.primary_keyword,
    content: guideContent({ title: row.title, keyword: row.primary_keyword }),
    faq: buildFaq(row.primary_keyword),
    cluster: 'algorithms',
    pageType: 'algorithms',
  }, 'algorithms', 'algorithms'));
}

// ─── Main ──────────────────────────────────────────────────────────

console.log('Generating programmatic SEO content...\n');

const keywordsDir = join(DATA, 'keywords');
const stats = {};

function loadAllCsv(prefix) {
  const dir = join(DATA, 'keywords');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.startsWith(prefix) && f.endsWith('.csv'))
    .flatMap(f => parseCsv(readFileSync(join(dir, f), 'utf-8')));
}

// Guides from all guides*.csv files
const guideRows = loadAllCsv('guides');
const existingGuides = readJson('guides.json');
const { items: guides, added: guidesAdded } = mergeBySlug(existingGuides, fromCsvGuides(guideRows));
writeJson('guides.json', guides);
stats.guides = guidesAdded;

// Errors from all errors*.csv files
const errorRows = loadAllCsv('errors');
const existingErrors = readJson('errors.json');
const { items: errors, added: errorsAdded } = mergeBySlug(existingErrors, fromCsvErrors(errorRows));
writeJson('errors.json', errors);
stats.errors = errorsAdded;

// Algorithms from CSV
const algoRows = loadAllCsv('algorithms');
const existingAlgos = readJson('algorithms.json');
const { items: algorithms, added: algosAdded } = mergeBySlug(existingAlgos, fromCsvAlgorithms(algoRows));
writeJson('algorithms.json', algorithms);
stats.algorithms = algosAdded;

// New page types — merge manual + algorithm comparison pairs
const manualComparisons = seedComparisons();
const algoComparisons = seedAlgorithmComparisons();
const { items: comparisons } = mergeBySlug(manualComparisons, algoComparisons);
writeJson('comparisons.json', comparisons);
stats.comparisons = comparisons.length;

const claims = seedClaims();
writeJson('claims.json', claims);
stats.claims = claims.length;

const providers = seedProviders();
writeJson('providers.json', providers);
stats.providers = providers.length;

const useCases = seedUseCases();
writeJson('use-cases.json', useCases);
stats['use-cases'] = useCases.length;

const learn = seedLearnLanguages();
writeJson('learn.json', learn);
stats.learn = learn.length;

// Summary
const total = Object.values(stats).reduce((a, b) => a + b, 0);
console.log('Pages generated/merged:');
for (const [type, count] of Object.entries(stats)) {
  console.log(`  ${type}: +${count}`);
}
console.log(`\nTotal new entries: ${total}`);
console.log(`Estimated build output: ~${guides.length + errors.length + algorithms.length + comparisons.length + claims.length + providers.length + useCases.length + learn.length + 50} HTML pages`);
