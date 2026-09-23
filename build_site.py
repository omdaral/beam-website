#!/usr/bin/env python3
"""Build statically localized Beam landing pages from one shared template."""
from __future__ import annotations

import datetime as dt
import html
import json
import re
from pathlib import Path

BASE = "https://omdaral.github.io/beam-website/"
REPO = "omdaral/beam-fileshare"
RELEASE_PAGE = f"https://github.com/{REPO}/releases/latest"
HELP_PAGE = f"https://github.com/{REPO}/blob/main/HELP.md"
TEMPLATE = Path("page.template.html").read_text(encoding="utf-8")
STYLES = Path("assets/site.css").read_text(encoding="utf-8")

ASSETS = {
    "windows-amd64": lambda v: f"Beam-{v}-windows-amd64.zip",
    "windows-arm64": lambda v: f"Beam-{v}-windows-arm64.zip",
    "linux-amd64": lambda v: f"Beam-{v}-linux-amd64.tar.gz",
    "linux-arm64": lambda v: f"Beam-{v}-linux-arm64.tar.gz",
    "macos-arm64": lambda v: f"Beam-{v}-macos-arm64.zip",
    "macos-amd64": lambda v: f"Beam-{v}-macos-amd64.zip",
    "android": lambda v: f"Beam-{v}-android.apk",
    "deb-amd64": lambda v: f"beam-fileshare_{v}-1_amd64.deb",
    "deb-arm64": lambda v: f"beam-fileshare_{v}-1_arm64.deb",
    "appimage-x64": lambda v: f"Beam-{v}-x86_64.AppImage",
    "appimage-arm": lambda v: f"Beam-{v}-aarch64.AppImage",
    "rpm": lambda v: f"beam-fileshare-{v}-1.x86_64.rpm",
}
PRIMARY = ["windows-amd64", "linux-amd64", "macos-arm64", "android"]
ALT = ["linux-arm64", "windows-arm64", "macos-amd64", "deb-amd64", "deb-arm64", "appimage-x64", "appimage-arm", "rpm"]
ALT_LABELS = {
    "linux-arm64": "alt_linux_arm", "windows-arm64": "alt_windows_arm",
    "macos-amd64": "alt_mac_intel", "deb-amd64": "alt_deb_amd64",
    "deb-arm64": "alt_deb_arm64", "appimage-x64": "alt_appimage",
    "appimage-arm": "alt_appimage_arm", "rpm": "alt_rpm",
}
PRIMARY_LABELS = {
    "windows-amd64": ("download_windows", "download_windows_desc"),
    "linux-amd64": ("download_linux", "download_linux_desc"),
    "macos-arm64": ("download_mac", "download_mac_desc"),
    "android": ("download_android", "download_android_desc"),
}


def safe(value: object) -> str:
    return html.escape(str(value), quote=True)


def href(key: str, version: str) -> str:
    return f"https://github.com/{REPO}/releases/download/v{version}/{ASSETS[key](version)}"


def download_markup(lang: dict[str, str], version: str) -> tuple[str, str]:
    cards: list[str] = []
    for key in PRIMARY:
        title_key, desc_key = PRIMARY_LABELS[key]
        filename = ASSETS[key](version)
        cards.append(
            '<article class="download-option">'
            '<div class="download-name">'
            f'<h3>{safe(lang[title_key])}</h3>'
            f'<p>{safe(lang[desc_key])}</p>'
            '</div>'
            f'<a class="download-link" data-asset="{safe(key)}" href="{safe(href(key, version))}" '
            f'aria-label="{safe(lang["download_button"])} {safe(lang[title_key])}">'
            f'{safe(lang["download_button"])} <span aria-hidden="true">↓</span></a>'
            '</article>'
        )
    alternatives: list[str] = []
    for key in ALT:
        filename = ASSETS[key](version)
        label = safe(lang[ALT_LABELS[key]])
        alternatives.append(
            f'<a data-asset="{safe(key)}" href="{safe(href(key, version))}">'
            f'<span>{label}</span><b dir="ltr">{safe(filename)}</b></a>'
        )
    return "\n".join(cards), "\n".join(alternatives)


def faq_markup(lang: dict[str, str]) -> str:
    return "\n".join(
        f'<details><summary>{safe(lang[f"faq{i}_q"])}</summary>'
        f'<p>{safe(lang[f"faq{i}_a"])}</p></details>'
        for i in range(1, 6)
    )


def structured_data(lang: dict[str, str], canonical: str, version: str) -> str:
    questions = [
        {"@type": "Question", "name": lang[f"faq{i}_q"],
         "acceptedAnswer": {"@type": "Answer", "text": lang[f"faq{i}_a"]}}
        for i in range(1, 6)
    ]
    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication", "name": "Beam",
                "alternateName": "Beam FileShare", "applicationCategory": "UtilitiesApplication",
                "operatingSystem": ["Linux", "Windows", "macOS", "Android"],
                "inLanguage": lang["locale"], "license": "https://opensource.org/licenses/MIT",
                "softwareVersion": version, "isAccessibleForFree": True, "url": canonical,
                "downloadUrl": RELEASE_PAGE,
                "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
                "codeRepository": f"https://github.com/{REPO}",
            },
            {"@type": "FAQPage", "mainEntity": questions},
        ],
    }
    return json.dumps(graph, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def render(lang_code: str, version: str) -> str:
    lang = json.loads(Path(f"content/{lang_code}.json").read_text(encoding="utf-8"))
    is_ar = lang_code == "ar"
    canonical = BASE + ("ar/" if is_ar else "")
    url_ar = BASE + "ar/"
    cards, alternatives = download_markup(lang, version)
    values: dict[str, object] = dict(lang)
    values.update({
        "styles": STYLES,
        "base": BASE,
        "og_image": BASE + ("assets/og-cover-ar.png" if is_ar else "assets/og-cover.png"),
        "canonical": canonical,
        "url_en": BASE,
        "url_ar": url_ar,
        "asset_prefix": "../" if is_ar else "",
        "manifest_url": "../manifest-ar.webmanifest" if is_ar else "manifest.webmanifest",
        "home_url": "../" if is_ar else "./",
        "language_url": "../" if is_ar else "ar/",
        "other_locale": "en" if is_ar else "ar",
        "og_locale": "ar_AR" if is_ar else "en_US",
        "other_og_locale": "en_US" if is_ar else "ar_AR",
        "release_tag": f"v{version}",
        "github_url": f"https://github.com/{REPO}",
        "release_url": RELEASE_PAGE,
        "help_url": HELP_PAGE,
        "app_js": "../app.js" if is_ar else "app.js",
        "download_cards": cards,
        "alternate_downloads": alternatives,
        "faq_items": faq_markup(lang),
        "structured_data": structured_data(lang, canonical, version),
    })
    raw_keys = {"styles", "structured_data", "download_cards", "alternate_downloads", "faq_items"}
    rendered = re.sub(
        r"\{\{([a-zA-Z0-9_]+)\}\}",
        lambda match: str(values[match.group(1)]) if match.group(1) in raw_keys else safe(values[match.group(1)]),
        TEMPLATE,
    )
    unresolved = re.findall(r"\{\{[^}]+\}\}", rendered)
    if unresolved:
        raise ValueError(f"Unresolved template placeholders: {unresolved}")
    return rendered


def main() -> None:
    release_path = Path("release.json")
    release = json.loads(release_path.read_text(encoding="utf-8"))
    version = str(release.get("tag", "v1.7.1")).removeprefix("v")
    release["repo"] = REPO
    release_path.write_text(json.dumps(release, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    Path("index.html").write_text(render("en", version), encoding="utf-8")
    Path("ar/index.html").write_text(render("ar", version), encoding="utf-8")
    catalog_path = Path("downloads.json")
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    catalog["repo"] = REPO
    catalog["fallback_version"] = version
    catalog["releases_page"] = RELEASE_PAGE
    catalog["api_latest"] = f"https://api.github.com/repos/{REPO}/releases/latest"
    catalog["assets"] = {key: ASSETS[key](version) for key in ASSETS}
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    today = dt.date.today().isoformat()
    sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>{BASE}</loc>
    <lastmod>{today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="{BASE}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="{BASE}ar/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}"/>
  </url>
  <url>
    <loc>{BASE}ar/</loc>
    <lastmod>{today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="{BASE}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="{BASE}ar/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}"/>
  </url>
</urlset>
'''
    Path("sitemap.xml").write_text(sitemap, encoding="utf-8")
    print(f"Built / and /ar/ for v{version}")


if __name__ == "__main__":
    main()
