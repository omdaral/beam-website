/* Beam official site — vanilla, no deps. Dynamic GitHub release + i18n + theme. */
(function () {
  "use strict";
  var REPO = "AhmedFaseh/beam-fileshare";
  var FALLBACK_VER = "1.7.0";
  var currentTag = "v" + FALLBACK_VER, currentOk = false;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var STR = {
    ar: {
      skip: "تخطَّ إلى المحتوى", nav_dl: "التحميل", nav_feat: "المميزات", nav_verify: "التحقق", nav_help: "المساعدة",
      h1: "شارك ملفاتك بين أجهزتك بضغطة واحدة",
      lead: "برنامج صغير واحد لكل نظام — بدون Python وبدون تثبيت. ملفاتك في مكان واحد تعرفه (Downloads/Beam)، وتعمل على شبكتك المحلية بدون حسابات.",
      cta_all: "كل الإصدارات على GitHub", copy: "نسخ", copied: "تم النسخ ✓",
      oneline_hint: "يكتشف نظامك ومعماريتك تلقائياً (Linux / macOS / Windows).",
      s1t: "اتصل", s1d: "انضم لنفس شبكة الواي فاي، أو أنشئ شبكة Beam الخاصة من البرنامج.",
      s2t: "افتح / امسح", s2d: "افتح رابط الدخول على المنفذ 2004 أو امسح رمز QR من بطاقة الشبكة.",
      s3t: "ارفع ونزّل", s3d: "الجميع يرفع ويحمّل من المتصفح. الملفات الكبيرة تُستأنف تلقائياً.",
      dl_h: "التحميل — مباشرة من GitHub Releases",
      dl_sub: "بدون بناء وبدون حساب. اختر نظامك، أو اترك الكشف التلقائي يختار لك. كل الملفات مرفقة مع بصمات SHA256 وMANIFEST في صفحة الإصدار.",
      t1c: "1) النسخ المحمولة — الأكثر استخداماً (بدون تثبيت)",
      col_sys: "نظامك", col_file: "الملف", col_run: "بعد التحميل", col_dev: "الجهاز", col_dist: "التوزيعة",
      os_l64: "Linux ‏64-بت (Intel/AMD)", os_la: "Linux ‏ARM (Raspberry Pi)", os_w64: "Windows ‏64-بت", os_wa: "Windows ‏ARM", os_mi: "Mac ‏Intel", os_ms: "Mac ‏Apple Silicon",
      run_l: "فك الضغط ثم ./install.sh ثم نقرة مزدوجة على Beam", run_same: "نفس الخطوات", run_w: "أبقِ Beam.exe مع Beam.bat وانقر Beam.bat", run_m: "أول مرة: كليك يمين ← Open",
      t2c: "2) الهواتف", run_apk: "انسخه للهاتف واسمح بمصادر غير معروفة مرة واحدة", no_app: "لا يوجد تطبيق — من Safari اختر Add to Home Screen", run_ios: "يعمل بملء الشاشة مثل التطبيق",
      t3c: "3) حزم النظام (Linux — اختياري)", d_deb64: "Debian / Ubuntu ‏64-بت", d_deba: "Debian / Ubuntu ‏ARM",
      feat_h: "لماذا Beam؟", feat_sub: "مصمم للشبكة المحلية: سريع، بسيط، ويعمل دون إنترنت.",
      f1t: "بدون تثبيت", f1d: "انسخ المجلد في أي مكان وانقر نقراً مزدوجاً. لا Python ولا صلاحيات مدير.",
      f2t: "ملفات كبيرة بلا حدود", f2d: "رفع متوازٍ بقطع صغيرة مع بصمة لكل قطعة، واستئناف تلقائي عند الانقطاع.",
      f3t: "يعمل دون إنترنت", f3d: "خط عربي مضمّن ورموز QR محلية. كل شيء يعمل على شبكتك فقط.",
      f4t: "عربي / إنجليزي", f4d: "زر لغة للجميع في الأعلى، وصاحب الجهاز يحدد لغة الزوار الافتراضية.",
      f5t: "مجلد واحد واضح", f5d: "كل المشاركات في Downloads/Beam. انسخ إليه من المضيف فتظهر للجميع فوراً.",
      f6t: "أمان الشبكة", f6d: "كلمة سر الواي فاي هي التحكم الوحيد. إيقاف تلقائي بعد 5 ساعات خمول.",
      ver_h: "تحقق من سلامة التحميل", ver_sub: "كل إصدار مرفق مع SHA256SUMS وMANIFEST.json. قارن البصمة قبل التشغيل.",
      ver_hint: "قارن الناتج مع ملف SHA256SUMS في صفحة الإصدار. إذا ظهرت صفحة 404 فالمستودع ما زال خاصاً أو التاج لم يُدفع بعد.",
      ver_link: "فتح صفحة Releases والبصمات ←",
      help_h: "أسئلة شائعة",
      q1t: "أي ملف أختار؟ amd64 أم arm64؟", q1d: "نفّذ uname -m: الناتج x86_64 يعني amd64، وaarch64/arm64 يعني arm64. أو استخدم أمر النقرة الواحدة بالأعلى فهو يكتشف تلقائياً.",
      q2t: "الأيقونة لا تعمل على Linux؟", q2d: "نفّذ ./install.sh داخل المجلد ثم كليك يمين على الأيقونة ← Allow Launching. أو انقر ملف Beam مباشرة.",
      q3t: "هل أحتاج حساباً أو إنترنت؟", q3d: "لا. الجميع على نفس الواي فاي يفتح الرابط ويبدأ الرفع والتحميل مباشرة. الأمان الوحيد هو كلمة سر الشبكة.",
      q4t: "أين أجد المساعدة الكاملة؟", q4d: "الدليل الكامل في مستودع التطبيق:",
      foot: "مشاركة محلية بضغطة واحدة — MIT © 2026 Ahmed Faseh", foot_rel: "الإصدارات", foot_help: "المساعدة"
    },
    en: {
      skip: "Skip to content", nav_dl: "Download", nav_feat: "Features", nav_verify: "Verify", nav_help: "Help",
      h1: "Share files between your devices in one click",
      lead: "One small program per OS — no Python, nothing to install. Your files live in one place you know (Downloads/Beam), on your local network with no accounts.",
      cta_all: "All releases on GitHub", copy: "Copy", copied: "Copied ✓",
      oneline_hint: "Auto-detects your OS and architecture (Linux / macOS / Windows).",
      s1t: "Connect", s1d: "Join the same Wi-Fi, or create your private Beam network from the app.",
      s2t: "Open / Scan", s2d: "Open the login link on port 2004 or scan the QR from the network card.",
      s3t: "Upload & download", s3d: "Everyone uploads and downloads from the browser. Large files resume automatically.",
      dl_h: "Download — directly from GitHub Releases",
      dl_sub: "No build, no account. Pick your OS or let auto-detect choose for you. Every file ships with SHA256SUMS and MANIFEST on the release page.",
      t1c: "1) Portable builds — most popular (no install)",
      col_sys: "Your system", col_file: "File", col_run: "After download", col_dev: "Device", col_dist: "Distro",
      os_l64: "Linux 64-bit (Intel/AMD)", os_la: "Linux ARM (Raspberry Pi)", os_w64: "Windows 64-bit", os_wa: "Windows ARM", os_mi: "Mac Intel", os_ms: "Mac Apple Silicon",
      run_l: "Extract, run ./install.sh once, then double-click Beam", run_same: "Same steps", run_w: "Keep Beam.exe with Beam.bat, double-click Beam.bat", run_m: "First time: right-click → Open",
      t2c: "2) Phones", run_apk: "Copy to phone, allow unknown sources once", no_app: "No app needed — in Safari choose Add to Home Screen", run_ios: "Opens fullscreen like an app",
      t3c: "3) System packages (Linux — optional)", d_deb64: "Debian / Ubuntu 64-bit", d_deba: "Debian / Ubuntu ARM",
      feat_h: "Why Beam?", feat_sub: "Built for the local network: fast, simple, works offline.",
      f1t: "No install", f1d: "Copy the folder anywhere and double-click. No Python, no admin rights.",
      f2t: "Huge files, no limits", f2d: "Parallel small chunks with a checksum per chunk, auto-resume on drop.",
      f3t: "Works offline", f3d: "Embedded Arabic font and local QR codes. Everything stays on your network.",
      f4t: "Arabic / English", f4d: "Language button for everyone; the host sets the default visitor language.",
      f5t: "One clear folder", f5d: "Everything shared lives in Downloads/Beam. Copy there to publish instantly.",
      f6t: "Network security", f6d: "The Wi-Fi password is the only access control. Auto-stops after 5 idle hours.",
      ver_h: "Verify your download", ver_sub: "Every release ships SHA256SUMS and MANIFEST.json. Compare the hash before running.",
      ver_hint: "Compare the output with SHA256SUMS on the release page. A 404 means the repo is still private or the tag was never pushed.",
      ver_link: "Open Releases and checksums →",
      help_h: "FAQ",
      q1t: "Which file? amd64 or arm64?", q1d: "Run uname -m: x86_64 means amd64, aarch64/arm64 means arm64. Or use the one-liner above — it detects automatically.",
      q2t: "Icon does nothing on Linux?", q2d: "Run ./install.sh inside the folder, then right-click the icon → Allow Launching. Or launch the Beam binary directly.",
      q3t: "Do I need an account or internet?", q3d: "No. Everyone on the same Wi-Fi opens the link and starts sharing. The only security is the network password.",
      q4t: "Where is the full help?", q4d: "Full guide in the app repo:",
      foot: "One-click local sharing — MIT © 2026 Ahmed Faseh", foot_rel: "Releases", foot_help: "Help"
    }
  };

  function getLang() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q === "ar" || q === "en") return q;
      var s = localStorage.getItem("beam-site-lang");
      if (s === "ar" || s === "en") return s;
    } catch (e) {}
    return "ar";
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
    if (btn) btn.textContent = lang === "ar" ? "EN" : "عربي";
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
      ? "الإصدار " + ver + (ok ? " — الأحدث على GitHub ✓" : " — روابط احتياطية (تعذّر الاتصال بـ GitHub)")
      : "Version " + ver + (ok ? " — latest on GitHub ✓" : " — fallback links (GitHub unreachable)");
    if (st) st.textContent = lang === "ar"
      ? (ok ? "تم التحقق من صفحة الإصدارات الآن — كل الروابط مباشرة من github.com." : "اعرض صفحة الإصدارات للمقارنة عند عودة الاتصال.")
      : (ok ? "Verified against the Releases page just now — all links come straight from github.com." : "Check the Releases page when back online.");
  }

  function upgradeLinks(tag, assets, lang) {
    var ver = tag.replace(/^v/, "");
    $$("[data-asset]").forEach(function (a) {
      var key = a.getAttribute("data-asset");
      var fname = fileFor(key, ver);
      if (!fname) return;
      var url = null;
      for (var i = 0; i < (assets || []).length; i++) {
        if (assets[i] && assets[i].name === fname && assets[i].browser_download_url) { url = assets[i].browser_download_url; break; }
      }
      if (!url) url = "https://github.com/" + REPO + "/releases/download/" + tag + "/" + fname;
      a.setAttribute("href", url);
      a.textContent = fname;
    });
    setBadge(tag, true, lang);
    initSmart(lang);
  }

  function initRelease(lang) {
    setBadge("v" + FALLBACK_VER, false, lang);
    if (typeof fetch !== "function") return;
    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem("beam-site-release") || "null"); } catch (e) {}
    if (cached && cached.tag && cached.ts && Date.now() - cached.ts < 3600000 && cached.assets) {
      clearTimeout(to);
      upgradeLinks(cached.tag, cached.assets, lang);
      return;
    }
    fetch("https://api.github.com/repos/" + REPO + "/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(to);
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || !j.tag_name) throw new Error("bad payload");
      var slim = (j.assets || []).map(function (a) { return { name: a.name, browser_download_url: a.browser_download_url }; });
      try { localStorage.setItem("beam-site-release", JSON.stringify({ tag: j.tag_name, assets: slim, ts: Date.now() })); } catch (e) {}
      upgradeLinks(j.tag_name, slim, lang);
    }).catch(function () {
      clearTimeout(to);
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
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem("beam-site-release") || "null"); } catch (e) {}
    if (cached && cached.tag) setBadge(cached.tag, true, lang);
    else setBadge("v" + FALLBACK_VER, false, lang);
  });
})();
