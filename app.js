/* Beam official site — vanilla, no deps. Dynamic GitHub release + i18n + theme. */
(function () {
  "use strict";
  var REPO = "AhmedFaseh/beam-fileshare";
  var FALLBACK_VER = "1.7.0";
  var currentTag = "v" + FALLBACK_VER, currentOk = false;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var STR = window.BEAM_STR || { ar: {}, en: {} };

  function getLang() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q === "ar" || q === "en") return q;
      var s = localStorage.getItem("beam-site-lang");
      if (s === "ar" || s === "en") return s;
    } catch (e) {}
    return "en";
  }

  function setLang(lang) {
    var dict = STR[lang] || STR.ar;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (dict[k] !== undefined) el.textContent = dict[k];
    });
    var btn = $("#langBtn");
    if (btn) {
      btn.textContent = lang === "ar" ? "EN" : "عربي";
      btn.setAttribute("aria-label", lang === "ar"
        ? "EN — Switch language / تغيير اللغة"
        : "عربي — Switch language / تغيير اللغة");
    }
    var tb = $("#themeBtn");
    if (tb) tb.setAttribute("aria-label", lang === "ar" ? "تبديل المظهر" : "Toggle appearance");
    document.title = lang === "ar"
      ? "Beam — شارك ملفاتك بين أجهزتك بضغطة واحدة"
      : "Beam — Share files between your devices in one click";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", dict.lead);
    try { localStorage.setItem("beam-site-lang", lang); } catch (e) {}
    setBadge(currentTag, currentOk, lang);
  }

  function initTheme() {
    var btn = $("#themeBtn");
    function current() {
      try { return localStorage.getItem("beam-site-theme") || "auto"; } catch (e) { return "auto"; }
    }
    function apply(v) {
      if (v === "light" || v === "dark") document.documentElement.setAttribute("data-theme", v);
      else document.documentElement.removeAttribute("data-theme");
      if (btn) btn.setAttribute("aria-pressed", v === "dark" ? "true" : "false");
    }
    apply(current());
    if (btn) btn.addEventListener("click", function () {
      var c = current();
      var next = c === "dark" ? "light" : c === "light" ? "auto" : "dark";
      try { localStorage.setItem("beam-site-theme", next); } catch (e) {}
      apply(next);
    });
  }

  function initCopy() {
    var btn = $("#copyBtn"), code = $("#oneline");
    if (!btn || !code) return;
    var lang = getLang();
    btn.addEventListener("click", function () {
      var t = code.textContent.trim();
      function done() {
        var orig = btn.textContent;
        btn.textContent = (STR[lang] || STR.ar).copied;
        setTimeout(function () { btn.textContent = orig; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(done, function () { fallback(); });
      } else fallback();
      function fallback() {
        try {
          var ta = document.createElement("textarea");
          ta.value = t; ta.setAttribute("readonly", "");
          ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta); done();
        } catch (e) {}
      }
    });
  }

  function detectOS() {
    var ua = (navigator.userAgent || "").toLowerCase();
    var plat = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "").toLowerCase();
    var isARM = /arm|aarch64|apple m|m1|m2|m3|m4|iphone|ipad/.test(ua + " " + plat);
    var isMac = /mac|darwin|iphone|ipad/.test(ua + " " + plat);
    var isWin = /win/.test(ua + " " + plat);
    var isAndroid = /android/.test(ua);
    var isIOS = /iphone|ipad|ipod/.test(ua);
    if (isIOS) return { key: null, label_ar: "iPhone — بدون تطبيق", label_en: "iPhone — no app needed" };
    if (isAndroid) return { key: "android", label_ar: "Android", label_en: "Android" };
    if (isMac) return { key: isARM ? "macos-arm64" : "macos-amd64", label_ar: isARM ? "Mac ‏Apple Silicon" : "Mac ‏Intel", label_en: isARM ? "Mac Apple Silicon" : "Mac Intel" };
    if (isWin) return { key: isARM ? "windows-arm64" : "windows-amd64", label_ar: isARM ? "Windows ‏ARM" : "Windows ‏64-بت", label_en: isARM ? "Windows ARM" : "Windows 64-bit" };
    return { key: isARM ? "linux-arm64" : "linux-amd64", label_ar: isARM ? "Linux ‏ARM" : "Linux ‏64-بت", label_en: isARM ? "Linux ARM" : "Linux 64-bit" };
  }

  function fileFor(key, ver) {
    var m = {
      "linux-amd64": "Beam-" + ver + "-linux-amd64.tar.gz",
      "linux-arm64": "Beam-" + ver + "-linux-arm64.tar.gz",
      "windows-amd64": "Beam-" + ver + "-windows-amd64.zip",
      "windows-arm64": "Beam-" + ver + "-windows-arm64.zip",
      "macos-amd64": "Beam-" + ver + "-macos-amd64.zip",
      "macos-arm64": "Beam-" + ver + "-macos-arm64.zip",
      "android": "Beam-" + ver + "-android.apk",
      "deb-amd64": "beam-fileshare_" + ver + "-1_amd64.deb",
      "deb-arm64": "beam-fileshare_" + ver + "-1_arm64.deb",
      "appimage-x64": "Beam-" + ver + "-x86_64.AppImage",
      "appimage-arm": "Beam-" + ver + "-aarch64.AppImage",
      "rpm": "beam-fileshare-" + ver + "-1.x86_64.rpm"
    };
    return m[key] || null;
  }

  function initSmart(lang) {
    var d = detectOS(), el = $("#smartDownload");
    if (!el) return;
    var dict = STR[lang] || STR.ar;
    if (!d.key) {
      el.setAttribute("href", "#download");
      el.textContent = lang === "ar" ? "ثبّت من Safari ← مشاركة ← Add to Home Screen" : "Install from Safari → Share → Add to Home Screen";
      return;
    }
    var target = document.querySelector('[data-asset="' + d.key + '"]');
    if (target) el.setAttribute("href", target.getAttribute("href"));
    else el.setAttribute("href", "#download");
    var name = lang === "ar" ? d.label_ar : d.label_en;
    el.textContent = (lang === "ar" ? "حمّل لـ " : "Download for ") + name;
  }

  function setBadge(ver, ok, lang) {
    currentTag = ver; currentOk = ok;
    var b = $("#versionBadge"), st = $("#releaseStatus");
    if (b) b.textContent = lang === "ar"
      ? "الإصدار " + ver + (ok ? " — الأحدث ✓" : " — روابط احتياطية")
      : "Version " + ver + (ok ? " — latest ✓" : " — fallback links");
    if (st) st.textContent = lang === "ar"
      ? (ok ? "تم التحقق — كل الروابط من github.com." : "روابط احتياطية — راجع صفحة الإصدارات.")
      : (ok ? "Verified — all links from github.com." : "Fallback links — see the Releases page.");
  }

  function upgradeLinks(tag, assets, lang) {
    var ver = tag.replace(/^v/, "");
    $$("[data-asset]").forEach(function (a) {
      var key = a.getAttribute("data-asset");
      var fname = fileFor(key, ver);
      if (!fname) return;
      var url = null;
      for (var i = 0; i < (assets || []).length; i++) {
        if (assets[i] && assets[i].name === fname && (assets[i].browser_download_url || assets[i].url)) { url = assets[i].browser_download_url || assets[i].url; break; }
      }
      if (!url) url = "https://github.com/" + REPO + "/releases/download/" + tag + "/" + fname;
      a.setAttribute("href", url);
      a.textContent = fname;
    });
    setBadge(tag, true, lang);
    initSmart(lang);
  }

  // Release info comes from same-origin release.json (refreshed hourly by the
  // sync-release workflow with an authenticated API call). The browser never
  // calls api.github.com directly: a failing cross-origin request would log a
  // console error (Best-Practices penalty) and hit unauthenticated rate limits.
  function initRelease(lang) {
    setBadge("v" + FALLBACK_VER, false, lang);
    if (typeof fetch !== "function") return;
    fetch("release.json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || !j.tag) throw new Error("bad payload");
      if (j.fallback) { setBadge(j.tag, false, lang); return; }
      upgradeLinks(j.tag, j.assets, lang);
    }).catch(function () {
      setBadge("v" + FALLBACK_VER, false, lang);
    });
  }

  var lang = getLang();
  setLang(lang);
  initTheme();
  initCopy();
  initSmart(lang);
  initRelease(lang);

  var lb = $("#langBtn");
  if (lb) lb.addEventListener("click", function () {
    lang = (document.documentElement.lang === "ar") ? "en" : "ar";
    try {
      var u = new URL(location.href);
      u.searchParams.set("lang", lang);
      history.replaceState(null, "", u.toString());
    } catch (e) {}
    setLang(lang);
    initSmart(lang);
    setBadge(currentTag, currentOk, lang);
  });
})();
