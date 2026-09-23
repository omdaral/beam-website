/* Beam site interactions: theme, device recommendation, release links, and copy. */
(function () {
  "use strict";

  var REPO = "omdaral/beam-fileshare";
  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var lang = document.documentElement.lang === "ar" ? "ar" : "en";
  var labels = lang === "ar" ? {
    prefix: "نزّل Beam لـ", ios: "استخدم Beam من Safari",
    windows: "ويندوز 64-بت", windowsArm: "ويندوز ARM",
    linux: "لينكس 64-بت", linuxArm: "لينكس ARM",
    mac: "macOS Apple Silicon", macIntel: "macOS Intel", android: "أندرويد",
    copied: "تم النسخ", latest: "أحدث إصدار", github: "روابط تنزيل GitHub",
    fallback: "روابط الإصدار الحالي", copyError: "تعذّر النسخ — حدّد الأمر وانسخه يدويًا"
  } : {
    prefix: "Download Beam for", ios: "Use Beam from Safari",
    windows: "Windows 64-bit", windowsArm: "Windows ARM",
    linux: "Linux 64-bit", linuxArm: "Linux ARM",
    mac: "macOS Apple Silicon", macIntel: "macOS Intel", android: "Android",
    copied: "Copied", latest: "Latest version", github: "GitHub download links",
    fallback: "Current release links", copyError: "Could not copy — select and copy the command manually"
  };
  var filename = function (key, version) {
    var files = {
      "windows-amd64": "Beam-" + version + "-windows-amd64.zip",
      "windows-arm64": "Beam-" + version + "-windows-arm64.zip",
      "linux-amd64": "Beam-" + version + "-linux-amd64.tar.gz",
      "linux-arm64": "Beam-" + version + "-linux-arm64.tar.gz",
      "macos-arm64": "Beam-" + version + "-macos-arm64.zip",
      "macos-amd64": "Beam-" + version + "-macos-amd64.zip",
      android: "Beam-" + version + "-android.apk",
      "deb-amd64": "beam-fileshare_" + version + "-1_amd64.deb",
      "deb-arm64": "beam-fileshare_" + version + "-1_arm64.deb",
      "appimage-x64": "Beam-" + version + "-x86_64.AppImage",
      "appimage-arm": "Beam-" + version + "-aarch64.AppImage",
      rpm: "beam-fileshare-" + version + "-1.x86_64.rpm"
    };
    return files[key] || "";
  };

  function detectDevice() {
    var ua = (navigator.userAgent || "").toLowerCase();
    var platform = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "").toLowerCase();
    var architecture = (navigator.userAgentData && navigator.userAgentData.architecture) || "";
    var source = ua + " " + platform + " " + architecture;
    var arm = /arm|aarch64/.test(source);
    if (/iphone|ipad|ipod/.test(source) || (/macintel/.test(platform) && navigator.maxTouchPoints > 1)) return "ios";
    if (/android/.test(source)) return "android";
    if (/windows/.test(source) || /win32|win64/.test(platform)) return arm ? "windows-arm64" : "windows-amd64";
    if (/macintosh|mac os|macintel|macppc/.test(source)) return arm || /arm|aarch64/.test(platform) ? "macos-arm64" : "macos-amd64";
    if (/linux|x11/.test(source)) return arm ? "linux-arm64" : "linux-amd64";
    return null;
  }

  function deviceLabel(key) {
    var labelsByKey = {
      "windows-amd64": labels.windows,
      "windows-arm64": labels.windowsArm,
      "linux-amd64": labels.linux,
      "linux-arm64": labels.linuxArm,
      "macos-arm64": labels.mac,
      "macos-amd64": labels.macIntel,
      android: labels.android
    };
    return labelsByKey[key] || "";
  }

  function updateRecommendation() {
    var key = detectDevice();
    var button = $("#smartDownload");
    if (!button) return;
    document.querySelectorAll(".download-platform.recommended, .build-choice.recommended").forEach(function (item) {
      item.classList.remove("recommended");
    });
    if (key === "ios") {
      button.href = "#iphone-note";
      button.textContent = labels.ios;
      return;
    }
    var match = key ? $("[data-asset='" + key + "']") : null;
    if (match) {
      button.href = match.href;
      button.textContent = labels.prefix + " " + deviceLabel(key);
      var platform = match.closest(".download-platform");
      if (platform) platform.classList.add("recommended");
      match.classList.add("recommended");
    } else {
      button.href = "#download";
    }
  }

  function formatBytes(bytes) {
    var value = Number(bytes);
    if (!Number.isFinite(value) || value <= 0) return "";
    var mb = value / (1024 * 1024);
    return (mb >= 1 ? mb.toFixed(1) + " MB" : (value / 1024).toFixed(0) + " KB");
  }

  function setTheme(theme) {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    var button = $("#themeBtn");
    if (button) button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function initTheme() {
    var theme = "light";
    try {
      var stored = localStorage.getItem("beam-site-theme");
      if (stored === "dark" || stored === "light") theme = stored;
    } catch (e) {}
    setTheme(theme);
    var button = $("#themeBtn");
    if (!button) return;
    button.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem("beam-site-theme", next); } catch (e) {}
      setTheme(next);
    });
  }

  function initCopy() {
    var button = $("#copyBtn");
    var command = $("#oneline");
    if (!button || !command) return;
    button.addEventListener("click", function () {
      var original = button.textContent;
      function done() {
        button.textContent = labels.copied;
        window.setTimeout(function () { button.textContent = original; }, 1400);
      }
      function fail() {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(command);
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = labels.copyError;
        window.setTimeout(function () { button.textContent = original; }, 2600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(command.textContent.trim()).then(done, fail);
      } else {
        var input = document.createElement("textarea");
        input.value = command.textContent.trim();
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        var copied = false;
        try { copied = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(input);
        copied ? done() : fail();
      }
    });
  }

  function updateRelease(data) {
    if (!data || !data.tag || data.fallback) return;
    var version = data.tag.replace(/^v/, "");
    var byName = Object.create(null);
    (data.assets || []).forEach(function (asset) { if (asset && asset.name) byName[asset.name] = asset; });
    document.querySelectorAll("[data-asset]").forEach(function (link) {
      var key = link.getAttribute("data-asset");
      var name = filename(key, version);
      var asset = byName[name];
      if (!name || !asset) return;
      link.href = asset.browser_download_url || asset.url || "https://github.com/" + REPO + "/releases/download/" + data.tag + "/" + name;
      var size = $("[data-asset-size='" + key + "']");
      if (size && asset.size) size.textContent = formatBytes(asset.size);
    });
    var badge = $("#versionBadge");
    var status = $("#releaseStatus");
    if (badge) badge.textContent = labels.latest + " " + data.tag;
    if (status) status.textContent = labels.github;
    updateRecommendation();
  }

  initTheme();
  updateRecommendation();
  initCopy();
  if (typeof fetch === "function") {
    fetch((lang === "ar" ? "../" : "") + "release.json", { cache: "no-cache" })
      .then(function (response) { if (!response.ok) throw new Error("Release data unavailable"); return response.json(); })
      .then(updateRelease)
      .catch(function () {});
  }
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues(["architecture"]).then(updateRecommendation).catch(function () {});
  }
}());
