# Beam — Official Website (omdaral/beam-website)

Live site: **https://omdaral.github.io/beam-website/**

Official single-page site for Beam file-sharing: English (LTR) primary + Arabic (RTL) fully supported,
direct downloads from GitHub Releases (`AhmedFaseh/beam-fileshare`), Lighthouse
100/100/100/100 gate on every PR.

## Structure

- `index.html` — the whole page (inline critical CSS, no frameworks, no webfonts)
- `app.js` — vanilla JS: reads `release.json`, rewrites download links,
  OS auto-detect, AR/EN toggle, theme toggle, copy buttons.
  The browser never calls api.github.com directly (a failed cross-origin
  request logs a console error = Lighthouse Best-Practices penalty).
- `release.json` — latest release snapshot (same-origin, always 200).
  Refreshed hourly by `.github/workflows/sync-release.yml` with an
  authenticated API call; untouched while the app repo is private/unreleased.
- `downloads.json` — static fallback data used by docs and CI validation.
- `assets/` — `logo.svg` (Beam identity) + `og.svg` (share cover)
- `sitemap.xml` / `robots.txt` / `manifest.webmanifest` / `404.html` / `.nojekyll`
- `.github/workflows/pages.yml` — build + deploy to GitHub Pages
- `.github/workflows/lighthouse.yml` — must stay 100 in all 4 categories

## Local preview

```bash
python3 -m http.server 8080
# open http://127.0.0.1:8080/
```

## Deployment

Push to `main` → the `Pages` workflow deploys automatically.
Source: GitHub Actions (Settings → Pages → Source: GitHub Actions).

## Org management

- No secrets needed — fully static, read-only GitHub API.
- `CODEOWNERS` points at the maintainers; protect `main` (require Pages +
  Lighthouse checks).
- Download links intentionally point at `AhmedFaseh/beam-fileshare` releases;
  the app repo has not moved.
