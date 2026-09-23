#!/usr/bin/env python3
"""Build statically localized Beam landing pages from one shared template."""
from __future__ import annotations

import datetime as dt
import html
import json
import re
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

BASE = "https://omdaral.github.io/beam-website/"
REPO = "omdaral/beam-fileshare"
RELEASE_PAGE = f"https://github.com/{REPO}/releases/latest"
HELP_PAGE = f"https://github.com/{REPO}/blob/main/HELP.md"
TEMPLATE = Path("page.template.html").read_text(encoding="utf-8")
GUIDE_TEMPLATE = Path("guide.template.html").read_text(encoding="utf-8")
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
PLATFORMS = [
    ("windows", "platform_windows", "platform_windows_desc", [
        ("windows-amd64", "build_windows_x64", "format_zip"),
        ("windows-arm64", "build_windows_arm64", "format_zip"),
    ]),
    ("macos", "platform_macos", "platform_macos_desc", [
        ("macos-arm64", "build_macos_arm64", "format_zip"),
        ("macos-amd64", "build_macos_intel", "format_zip"),
    ]),
    ("linux", "platform_linux", "platform_linux_desc", [
        ("linux-amd64", "build_linux_x64", "format_archive"),
        ("linux-arm64", "build_linux_arm64", "format_archive"),
        ("appimage-x64", "build_appimage_x64", "format_appimage"),
        ("appimage-arm", "build_appimage_arm64", "format_appimage"),
        ("deb-amd64", "build_deb_x64", "format_deb"),
        ("deb-arm64", "build_deb_arm64", "format_deb"),
        ("rpm", "build_rpm_x64", "format_rpm"),
    ]),
    ("android", "platform_android", "platform_android_desc", [
        ("android", "build_android_apk", "format_apk"),
    ]),
]


def safe(value: object) -> str:
    return html.escape(str(value), quote=True)


def href(key: str, version: str) -> str:
    return f"https://github.com/{REPO}/releases/download/v{version}/{ASSETS[key](version)}"


def download_markup(lang: dict[str, str], version: str) -> str:
    cards: list[str] = []
    for slug, title_key, desc_key, builds in PLATFORMS:
        rows: list[str] = []
        for key, build_key, format_key in builds:
            title = lang[build_key]
            rows.append(
                f'<a class="build-choice" data-asset="{safe(key)}" href="{safe(href(key, version))}" '
                f'aria-label="{safe(lang["download_button"])} {safe(title)}">'
                '<span class="build-choice-main">'
                f'<b>{safe(title)}</b><small>{safe(lang[format_key])}</small>'
                '</span>'
                f'<span class="build-size" data-asset-size="{safe(key)}" aria-hidden="true"></span>'
                f'<span class="build-download">{safe(lang["download_button"])}</span>'
                '<span class="build-arrow" aria-hidden="true">↓</span></a>'
            )
        cards.append(
            f'<details class="download-platform" data-platform="{safe(slug)}">'
            '<summary class="platform-summary">'
            '<span class="platform-summary-main">'
            f'<b>{safe(lang[title_key])}</b>'
            f'<small class="platform-recommendation">{safe(lang["recommended_label"])}</small>'
            '</span>'
            f'<span class="platform-count"><b>{len(builds)}</b><span>{safe(lang["builds_label"])}</span></span>'
            '<span class="platform-chevron" aria-hidden="true"></span>'
            '</summary>'
            '<div class="platform-content">'
            f'<p class="platform-description">{safe(lang[desc_key])}</p>'
            f'<div class="build-list">{"".join(rows)}</div>'
            '</div>'
            '</details>'
        )
    return "\n".join(cards)


def faq_markup(lang: dict[str, str]) -> str:
    return "\n".join(
        f'<details><summary>{safe(lang[f"faq{i}_q"])}</summary>'
        f'<p>{safe(lang[f"faq{i}_a"])}</p></details>'
        for i in range(1, 6)
    )


def guide_sections_markup(sections: list[dict[str, object]]) -> str:
    result: list[str] = []
    for section in sections:
        result.append(f'<section><h2>{safe(section["heading"])}</h2>')
        for paragraph in section.get("paragraphs", []):
            result.append(f'<p>{safe(paragraph)}</p>')
        steps = section.get("steps", [])
        if steps:
            result.append("<ol>")
            result.extend(f"<li>{safe(step)}</li>" for step in steps)
            result.append("</ol>")
        bullets = section.get("bullets", [])
        if bullets:
            result.append("<ul>")
            result.extend(f"<li>{safe(bullet)}</li>" for bullet in bullets)
            result.append("</ul>")
        result.append("</section>")
    return "\n".join(result)


def guide_faq_markup(items: list[dict[str, str]]) -> str:
    return "\n".join(
        f'<details><summary>{safe(item["q"])}</summary><p>{safe(item["a"])}</p></details>'
        for item in items
    )


def guide_structured_data(
    page: dict[str, object], lang: dict[str, str], canonical: str, home_url: str, guides_url: str
) -> str:
    breadcrumbs = [
        {"@type": "ListItem", "position": 1, "name": lang["nav_home"], "item": home_url},
        {"@type": "ListItem", "position": 2, "name": lang["breadcrumb_guides"], "item": guides_url},
        {"@type": "ListItem", "position": 3, "name": page["h1"], "item": canonical},
    ]
    questions = [
        {"@type": "Question", "name": item["q"],
         "acceptedAnswer": {"@type": "Answer", "text": item["a"]}}
        for item in page["faq"]
    ]
    data = {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "WebPage", "@id": canonical + "#page", "url": canonical,
             "name": page["title"], "description": page["description"],
             "inLanguage": lang["locale"], "isPartOf": {"@id": BASE + "#website"},
             "about": {"@id": BASE + "#app"}, "breadcrumb": {"@id": canonical + "#breadcrumb"}},
            {"@type": "BreadcrumbList", "@id": canonical + "#breadcrumb", "itemListElement": breadcrumbs},
            {"@type": "FAQPage", "@id": canonical + "#faq", "mainEntity": questions},
        ],
    }
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def render_guide(locale: str, slug: str, related_slug: str) -> tuple[str, str, str]:
    is_ar = locale == "ar"
    home = json.loads(Path(f"content/{locale}.json").read_text(encoding="utf-8"))
    catalog = json.loads(Path(f"content/guides_{locale}.json").read_text(encoding="utf-8"))
    page = catalog["wifi"] if slug == "share-files-over-wifi" else catalog["android"]
    related = catalog["android"] if related_slug == "android-to-windows-file-sharing" else catalog["wifi"]
    home_url = BASE + ("ar/" if is_ar else "")
    prefix = "ar/" if is_ar else ""
    canonical = BASE + prefix + "guides/" + slug + "/"
    related_url = BASE + prefix + "guides/" + related_slug + "/"
    counterpart_prefix = "" if is_ar else "ar/"
    language_url = BASE + counterpart_prefix + "guides/" + slug + "/"
    en_url = BASE + "guides/" + slug + "/"
    ar_url = BASE + "ar/guides/" + slug + "/"
    guides_url = home_url + "#guides"
    values: dict[str, object] = dict(home)
    values.update({key: value for key, value in catalog.items() if isinstance(value, str)})
    values.update({
        **page,
        "locale": home["locale"], "dir": home["dir"], "canonical": canonical,
        "url_en": en_url, "url_ar": ar_url, "home_url": home_url,
        "language_url": language_url, "other_locale": "en" if is_ar else "ar",
        "og_locale": "ar_AR" if is_ar else "en_US",
        "other_og_locale": "en_US" if is_ar else "ar_AR",
        "og_image": BASE + ("assets/og-cover-ar.png" if is_ar else "assets/og-cover.png"),
        "asset_prefix": "../../../" if is_ar else "../../",
        "download_url": home_url + "#download", "repo_url": f"https://github.com/{REPO}",
        "related_url": related_url, "related_title": related["title"],
        "faq_title": home["faq_title"], "breadcrumb_label": home["nav_label"],
        "related_label": home["guides_title"],
        "sections_html": guide_sections_markup(page["sections"]),
        "faq_html": guide_faq_markup(page["faq"]),
        "structured_data": guide_structured_data(page, {**home, **catalog}, canonical, home_url, guides_url),
    })
    raw_keys = {"sections_html", "faq_html", "structured_data"}
    rendered = re.sub(
        r"\{\{([a-zA-Z0-9_]+)\}\}",
        lambda match: str(values[match.group(1)]) if match.group(1) in raw_keys else safe(values[match.group(1)]),
        GUIDE_TEMPLATE,
    )
    unresolved = re.findall(r"\{\{[^}]+\}\}", rendered)
    if unresolved:
        raise ValueError(f"Unresolved guide placeholders for {locale}/{slug}: {unresolved}")
    out = Path(prefix) / "guides" / slug / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(rendered, encoding="utf-8")
    return en_url, ar_url, canonical


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
                "@type": "SoftwareApplication", "@id": BASE + "#app",
                "name": "Beam FileShare", "alternateName": "Beam local Wi-Fi file sharing",
                "description": lang["description"], "brand": {"@type": "Brand", "name": "Beam FileShare"},
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": ["Linux", "Windows", "macOS", "Android"],
                "inLanguage": lang["locale"], "license": "https://opensource.org/licenses/MIT",
                "softwareVersion": version, "isAccessibleForFree": True, "url": canonical,
                "downloadUrl": RELEASE_PAGE,
                "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
                "codeRepository": f"https://github.com/{REPO}",
            },
            {"@type": "WebSite", "@id": BASE + "#website", "name": "Beam FileShare",
             "url": BASE, "inLanguage": ["en", "ar"]},
            {"@type": "FAQPage", "mainEntity": questions},
        ],
    }
    return json.dumps(graph, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def render(lang_code: str, version: str) -> str:
    lang = json.loads(Path(f"content/{lang_code}.json").read_text(encoding="utf-8"))
    is_ar = lang_code == "ar"
    canonical = BASE + ("ar/" if is_ar else "")
    url_ar = BASE + "ar/"
    cards = download_markup(lang, version)
    values: dict[str, object] = dict(lang)
    values.update({
        "styles": STYLES,
        "base": BASE,
        "og_image": BASE + ("assets/og-cover-ar.png" if is_ar else "assets/og-cover.png"),
        "canonical": canonical,
        "brand": lang["brand"],
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
        "guide_wifi_url": "guides/share-files-over-wifi/",
        "guide_android_url": "guides/android-to-windows-file-sharing/",
        "alternate_downloads": "",
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
    guide_pairs: list[tuple[str, str]] = []
    for slug, related in [
        ("share-files-over-wifi", "android-to-windows-file-sharing"),
        ("android-to-windows-file-sharing", "share-files-over-wifi"),
    ]:
        en_url, ar_url, _ = render_guide("en", slug, related)
        render_guide("ar", slug, related)
        guide_pairs.append((en_url, ar_url))
    catalog_path = Path("downloads.json")
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    catalog["repo"] = REPO
    catalog["fallback_version"] = version
    catalog["releases_page"] = RELEASE_PAGE
    catalog["api_latest"] = f"https://api.github.com/repos/{REPO}/releases/latest"
    catalog["assets"] = {key: ASSETS[key](version) for key in ASSETS}
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    today = dt.date.today().isoformat()
    pairs = [(BASE, BASE + "ar/"), *guide_pairs]
    urls: list[str] = []
    for en_url, ar_url in pairs:
        for url, lang in [(en_url, "en"), (ar_url, "ar")]:
            urls.append(
                "  <url>\n"
                f"    <loc>{xml_escape(url)}</loc>\n"
                f"    <lastmod>{today}</lastmod>\n"
                f"    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{xml_escape(en_url)}\"/>\n"
                f"    <xhtml:link rel=\"alternate\" hreflang=\"ar\" href=\"{xml_escape(ar_url)}\"/>\n"
                f"    <xhtml:link rel=\"alternate\" hreflang=\"x-default\" href=\"{xml_escape(en_url)}\"/>\n"
                "  </url>"
            )
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    Path("sitemap.xml").write_text(sitemap, encoding="utf-8")
    print(f"Built /, /ar/, and {len(guide_pairs) * 2} localized guides for v{version}")


if __name__ == "__main__":
    main()
