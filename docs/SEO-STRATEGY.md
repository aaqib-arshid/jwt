# JWTValidator.org — Programmatic SEO Strategy

## Goal
Dominate JWT-related organic search and outrank jwt.io through programmatic scale, topic authority, and tool-content synergy.

## Keyword Clusters (8 hubs)

| Cluster | Hub URL | Target keywords | Scale target |
|---------|---------|-----------------|--------------|
| Tools | `/hubs/jwt-tools.html` | jwt decoder, jwt validator, jwt debugger | 15+ tools |
| Decode & Validate | `/hubs/decode-validate.html` | jwt decode, jwt verify, jwt expired fix | 200+ guides/errors |
| Algorithms | `/hubs/algorithms.html` | hs256 vs rs256, rs256 explained, es256 | 50+ pages |
| Implementation | `/hubs/implementation.html` | jwt nodejs, jwt python, jwt java | 300+ learn pages |
| Claims | `/hubs/claims.html` | jwt exp claim, jwt sub claim | 20+ claims |
| Providers | `/hubs/providers.html` | auth0 jwt, firebase jwt, cognito jwt | 30+ providers |
| Security | `/hubs/security.html` | jwt security, jwt vulnerabilities | 100+ guides |
| Comparisons | `/hubs/comparisons.html` | jwt vs session, jwt.io alternative | 50+ compare pages |

## Page Types & URL Structure

```
/tools/{tool}.html              → High-intent tool pages (priority 0.9)
/guides/{slug}.html             → Informational + long-tail (0.8)
/errors/{slug}.html             → Problem/fix intent (0.75)
/algorithms/{slug}.html         → Algorithm intent (0.8)
/compare/{slug}.html            → Comparison intent (0.7)
/learn/{lang}/{slug}.html       → Language implementation (0.75)
/claims/{slug}.html             → Claim explainers (0.7)
/providers/{slug}.html          → Provider-specific (0.7)
/use-cases/{slug}.html          → Use case intent (0.7)
/hubs/{cluster}.html            → Topic authority hubs (0.85)
/blog/posts/{slug}.html         → Long-form authority (0.8)
```

## Scaling Workflow (→ 1000+ pages)

```bash
# 1. Add keywords to CSV files in data/keywords/
#    guides.csv | errors.csv | algorithms.csv

# 2. Generate JSON content
npm run generate:programmatic

# 3. Build static HTML
npm run build

# 4. Deploy (GitHub Actions → dist/)
git push origin main
```

## Internal Linking Rules

Every programmatic page auto-gets:
- 3 related tools (decoder, validator, debugger)
- 3 related guides (basics, auth explained, relevant fix)
- 2 blog articles
- Cluster hub link via breadcrumbs + related topics

Hub pages link to all cluster content → tools link back to hubs.

## Content Structure (every programmatic page)

1. H1 with primary keyword
2. Quick answer (featured snippet target)
3. Step-by-step fix/how-to
4. Code examples (Node.js + Python minimum)
5. FAQ section (FAQPage JSON-LD)
6. Try It Now → tool embed links
7. Related Topics → internal link graph

## vs jwt.io Competitive Advantages

| jwt.io | JWTValidator.org |
|--------|------------------|
| 1 decoder tool | 8+ specialized tools |
| No guides | 50+ guides (scale to 500+) |
| No error pages | 25+ error fix pages |
| No language examples | 42+ learn pages (7 langs × 6 topics) |
| No comparisons | jwt.io alternative page + comparisons |
| No provider guides | Auth0, Firebase, Cognito, Okta |
| No topic hubs | 8 SEO cluster hub pages |
| No FAQ schema | FAQPage on every page |

## Technical SEO

- Canonical URLs on every page
- OpenGraph + Twitter cards
- JSON-LD: WebSite, SoftwareApplication, TechArticle, FAQPage, BreadcrumbList
- Sitemap index auto-splits at 500+ URLs
- Static = fast Core Web Vitals
- Breadcrumb navigation on all content pages

## Next Expansion Priorities

1. Add 200+ more rows to `data/keywords/guides-batch3.csv`
2. ~~Add tools: jwt-claims-viewer, pem-to-jwk, jwt-header-decoder~~ ✅ Done
3. ~~Provider pages expanded to 16~~ ✅ Done
4. Submit sitemap to Google Search Console after deploy
5. Build backlinks to hub pages and `/compare/jwt-io-alternative.html`

## Current Scale (auto-updated on build)

Run `npm run build` — **1,016 static pages** (sitemap index, 11 section sitemaps)

| Section | ~Pages |
|---------|--------|
| Guides | 612 |
| Learn | 104 |
| Comparisons | 68 |
| Errors | 127 |
| Algorithms | 20 |
| Providers | 16 |
| Tools | 11 |
| Claims + use-cases + blog + hubs + legal | ~58 |
