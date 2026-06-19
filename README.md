# JWTValidator.org

High-authority JWT tools hub and programmatic SEO platform — **100% static**, GitHub Pages compatible.

## Architecture

```
jwt/
├── assets/              # Static CSS + client-side JS (tools run in browser)
│   ├── css/main.css
│   └── js/
│       ├── core/        # jwt-utils, share, ui
│       └── tools/       # One module per tool page
├── data/                # JSON content source (guides, blog, tools metadata)
├── templates/           # HTML templates (base, tool, content, partials)
├── scripts/
│   ├── build.js         # Full build pipeline
│   ├── generate-pages.js
│   ├── generate-sitemap.js
│   └── lib/             # Template engine + SEO helpers
└── dist/                # Build output (deploy this to GitHub Pages)
```

## Build

```bash
npm install
npm run build    # Generates dist/ with all HTML, sitemap, assets
npm run dev      # Preview dist/ locally on :3000
```

## Static Generation Pipeline

1. Read JSON from `/data`
2. Render HTML via template engine (`scripts/lib/template-engine.js`)
3. Inject SEO metadata, JSON-LD schema, breadcrumbs, internal links
4. Copy assets + CNAME + robots.txt
5. Generate sitemap.xml

## Adding Content at Scale

| Type | File | Output |
|------|------|--------|
| Tool | `data/tools.json` | `/tools/{slug}.html` |
| Guide | `data/guides.json` | `/guides/{slug}.html` |
| Algorithm | `data/algorithms.json` | `/algorithms/{slug}.html` |
| Error page | `data/errors.json` | `/errors/{slug}.html` |
| Blog post | `data/blog-posts.json` | `/blog/posts/{slug}.html` |
| Trust/Legal | `data/trust-pages.json` | `/about.html`, `/privacy.html`, etc. |

Add a JSON entry → run `npm run build` → deploy. No runtime rendering.

## SEO Features

- Canonical URLs, OpenGraph, Twitter cards
- JSON-LD: `SoftwareApplication`, `TechArticle`, `FAQPage`, `BreadcrumbList`
- Auto-generated `sitemap.xml`
- Internal link graph (tools ↔ guides ↔ articles)
- Breadcrumb navigation on every page

## GitHub Pages Setup

1. Enable **GitHub Pages** → Source: **GitHub Actions**
2. Push to `main` — workflow deploys `dist/` automatically
3. Custom domain: `CNAME` file included in build

## Constraints

- No SSR, no backend, no database
- JWKS fetch is optional client-side only
- All token processing runs in the browser
