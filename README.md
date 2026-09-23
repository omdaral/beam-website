# Beam FileShare — Official Website and Local Wi-Fi Guides

Live site: **https://omdaral.github.io/beam-website/**

Official website for Beam FileShare, a source-available local Wi-Fi file-sharing app that is free for non-commercial use. Commercial use requires prior written permission from omdaral. It includes English and Arabic landing pages, platform downloads, and practical guides for sharing over Wi-Fi and transferring files between Android and Windows.

- [Share files over Wi-Fi without cloud uploads](https://omdaral.github.io/beam-website/guides/share-files-over-wifi/)
- [مشاركة الملفات عبر الواي فاي بلا سحابة](https://omdaral.github.io/beam-website/ar/guides/share-files-over-wifi/)
- [Transfer files between Android and Windows](https://omdaral.github.io/beam-website/guides/android-to-windows-file-sharing/)
- [نقل الملفات بين أندرويد وويندوز](https://omdaral.github.io/beam-website/ar/guides/android-to-windows-file-sharing/)

## Source and build

- `page.template.html` — shared semantic page structure.
- `guide.template.html` — lightweight bilingual guide-page template.
- `content/en.json` and `content/ar.json` — localized copy, metadata, and FAQs.
- `content/guides_en.json` and `content/guides_ar.json` — original platform and network how-to guides.
- `assets/site.css` — inline-critical responsive design; no external fonts or UI libraries.
- `build_site.py` — writes the localized landing and guide pages, `downloads.json`, and `sitemap.xml` from the current `release.json`.
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
After each deployment, the workflow submits all six home and guide URLs to IndexNow.
The hourly release sync updates the static download snapshot and triggers another Pages deployment.
