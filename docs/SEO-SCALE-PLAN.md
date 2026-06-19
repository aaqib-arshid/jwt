# Programmatic SEO Scale Plan

See README.md for architecture. This document describes scaling to 500+ guides and 1000+ keyword landing pages.

## Scaling Workflow

1. Add keywords to `data/keywords.csv`
2. Run `node scripts/generate-keywords.js` (future) → merges into `data/guides.json`
3. Run `npm run build`
4. GitHub Actions deploys `dist/`

## Page Types at Scale

| Pattern | Example | JSON file |
|---------|---------|-----------|
| `{keyword}-explained` | jwt-authentication-explained | guides.json |
| `{algo}-vs-{algo}` | hs256-vs-rs256 | algorithms.json |
| `{error}-fix` | token-expired | errors.json |
| `{lang}-jwt-example` | nodejs-jwt-auth | learn.json (future) |

## Internal Link Rules

- Every guide → 3–5 tools, 2 guides, 1 article
- Every tool → 3 guides, 2 errors
- Every error → 1 guide, 2 tools

## Sitemap at 1500+ URLs

Split into sitemap index + section sitemaps (tools, guides, blog).
