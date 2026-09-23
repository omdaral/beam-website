# Beam — Official Website

Live site: **https://omdaral.github.io/beam-website/**

Official bilingual landing page and download guide for Beam file sharing. The
English page is at `/`; the statically rendered Arabic page is at `/ar/`.

## Source and build

- `page.template.html` — shared semantic page structure.
- `content/en.json` and `content/ar.json` — localized copy, metadata, and FAQs.
- `assets/site.css` — inline-critical responsive design; no external fonts or UI libraries.
- `build_site.py` — writes `index.html`, `ar/index.html`, `downloads.json`, and `sitemap.xml` from the current `release.json`.
- `app.js` — theme switch, device download recommendation, current release links, and installer copy action.
- `release.json` — current release snapshot, synced hourly from the app repository.
- `robots.txt`, `sitemap.xml`, and the Google / IndexNow verification files — crawler discovery and ownership verification.

## Local preview

```bash
python3 build_site.py
python3 -m http.server 8080
# open http://127.0.0.1:8080/ or http://127.0.0.1:8080/ar/
```

## Deployment

Push to `main` → GitHub Actions builds the localized pages and deploys GitHub Pages.
After each deployment, the workflow submits the English and Arabic URLs to IndexNow.
The hourly release sync updates the static download snapshot and triggers another Pages deployment.
