/* كيبورد الخط الكوفي. CC0 */
(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ================= الخطوط (الأرقام ثابتة دائماً بخط الزوايا) ================= */
  var TAIL = ',"IQD Symbol",system-ui,-apple-system,"Amiri","Noto Naskh Arabic","Segoe UI Symbol",serif';
  var FONTS = [
    { id: "kufic", name: "كوفي قديم", fam: '"Iraq Kufic"' },
    { id: "reem",  name: "ريم كوفي",  fam: '"Reem Kufi"' },
    { id: "noto",  name: "نوتو كوفي", fam: '"Noto Kufi Arabic"' },
    { id: "kufam", name: "كُفام",      fam: '"Kufam"' },
    { id: "ink",   name: "ريم حبر",   fam: '"Reem Kufi Ink"' }
  ];
  function stack(f) { return '"Iraq Digits",' + f.fam + TAIL; }
  var fontIdx = 0;
  var savedFont = safeGet("kb-font");
  FONTS.forEach(function (f, i) { if (f.id === savedFont) fontIdx = i; });

  var barEl = $("#fontBar");
  FONTS.forEach(function (f, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.setAttribute("role", "radio");
    b.textContent = f.name; b.style.fontFamily = stack(f);
    b.addEventListener("click", function () { setFont(i); });
    barEl.appendChild(b);
  });
  function setFont(i) {
    fontIdx = i;
    document.documentElement.style.setProperty("--kb-font", stack(FONTS[i]));
    Array.prototype.forEach.call(barEl.children, function (b, j) { b.setAttribute("aria-checked", String(j === i)); });
    safeSet("kb-font", FONTS[i].id);
    ta.focus({ preventScroll: true });
  }
  $("#globe").addEventListener("click", function () { setFont((fontIdx + 1) % FONTS.length); });

  /* ================= الطبقات ================= */
  var ta = $("#ta"), rowsEl = $("#rows"), layer = "ar";
  var ICON_DEL = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M8.5 5H20a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 19H8.5L2.5 12z"/><path d="M11.5 9.5l5 5m0-5l-5 5"/></svg>';
  var ICON_RET = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M20 5v6.5a1.5 1.5 0 0 1-1.5 1.5H5m0 0l4-4m-4 4l4 4"/></svg>';

  function CU(c) { return { ch: c, label: c, cls: "cur", cur: 1, aria: c + " (ضغط مطول: كل العملات)" }; }
  function C(c, cls, label) { return { ch: c, label: label || c, cls: cls || "" }; }
  function list(s, cls) { return Array.prototype.map.call(s, function (c) { return C(c, cls); }); }
  function arr(a, cls) { return a.map(function (c) { return C(c, cls); }); }
  var DEL = { act: "del", icon: ICON_DEL, cls: "fn", aria: "حذف" };
  var RET = { ch: "\n", icon: ICON_RET, cls: "fn ret", aria: "سطر جديد" };
  function SP(cls) { return { ch: " ", label: "مسافة", cls: "sp " + (cls || ""), aria: "مسافة" }; }
  function F(act, label, cls) { return { act: act, label: label, cls: "fn " + (cls || "") }; }

  var LAYERS = {
    ar: [
      { c: "l",  k: list("ضصثقفغعهخحج") },
      { c: "l",  k: list("شسيبلاتنمكة") },
      { c: "l",  k: list("ءظطذدزروى").concat([DEL]) },
      { c: "r4", k: [F("num", "123", "f4 dg"), F("sym", "۞", "f4"), SP(), F("alt", "◌ً", "dia"), RET] }
    ],
    alt: [
      { c: "l l2", k: [C("أ"), C("إ"), C("آ"), C("ؤ"), C("ئ"), C("ء"), C("لا"), C("ـ", "", "ـــ")] },
      { c: "l l2", k: ["َ", "ُ", "ِ", "ّ", "ْ", "ً", "ٌ", "ٍ"].map(function (c) { return C(c, "", "◌" + c); }) },
      { c: "l",  k: [DEL] },
      { c: "r4", k: [F("num", "123", "f4 dg"), F("sym", "۞", "f4"), SP(), F("ar", "ابج", "dia"), RET] }
    ],
    num: [
      { c: "", k: list("1234567890", "dg") },
      { c: "", k: [C("-"), C("/"), C(":"), C("؛"), C("﴿"), C("﴾"), CU("\uE900"), CU("$"), CU("€"), CU("£")] },
      { c: "n3", k: [F("sym", "#+=")], mid: list(".،؟!ـ"), end: DEL },
      { c: "r4", k: [F("ar", "ابج", "f4"), F("sym", "۞", "f4"), SP(), RET] }
    ],
    sym: [
      { c: "w1", k: [C("؏", "fit g12"), C("\uE90B", "fit g16", "\uE90B"), C("\uE90A", "fit g16", "\uE90A"), C("ﷻ", "fit g12"), C("ﷲ", "fit g12"), C("﷽", "fit g28")] },
      { c: "", k: arr(["۞", "۝", "۩", "؍", "؎", "٭", "۔", "؞", "٫", "٬"], "sy") },
      { c: "n3", k: [F("num", "123", "dg")], mid: arr(["(", ")", "«", "»", "٪", "+", "=", "×", "÷"]), end: DEL },
      { c: "r4", k: [F("ar", "ابج", "f4"), SP(), RET] }
    ]
  };

  function key(d) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "k " + (d.cls || "");
    if (d.icon) b.innerHTML = d.icon;
    else if ((d.cls || "").indexOf("fit") > -1) {
      var sp = document.createElement("span"); sp.className = "fi"; var cv = document.createElement("canvas"); cv.setAttribute("aria-hidden", "true");
      sp.appendChild(cv); b.appendChild(sp); b._lab = d.label;
      if (!d.aria) b.setAttribute("aria-label", d.label === "\uE90A" ? "صلى الله عليه وسلم" : d.label === "\uE90B" ? "صلى الله عليه وآله وسلم" : d.label.replace(/\n/g, " "));
    }
    else b.textContent = d.label;
    if (d.cur) b.dataset.cur = "1";
    if (d.aria) b.setAttribute("aria-label", d.aria);
    if (d.act) b.dataset.act = d.act;
    if (d.ch !== undefined) b.dataset.ch = d.ch;
    return b;
  }

  /* ================= العملات ================= */
  var CUR = [
    ["الدينار العراقي", [["\uE900","IQD"],["\uE901","IQD 1"],["\uE902","IQD 2"],["\uE903","IQD 3"],["\uE904","IQD 4"],["\uE905","IQD 5"],["\uE906","IQD 6"],["\uE907","IQD 7"],["\uE908","IQD 8"],["\uE909","IQD 9"]], "big"],
    ["العملات العربية", [["ر.س","SAR"],["ر.ع.","OMR"],["د.إ","AED"],["د.ك","KWD"],["د.ب","BHD"],["ر.ق","QAR"],["د.أ","JOD"],["ل.ل","LBP"],["ل.س","SYP"],["ج.م","EGP"],["د.ل","LYD"],["د.ت","TND"],["د.ج","DZD"],["د.م","MAD"],["ج.س","SDG"],["﷼","YER"],["أ.م","MRU"],["Sh","SOS"],["Fdj","DJF"],["CF","KMF"]]],
    ["الرئيسية", [["$","USD"],["€","EUR"],["£","GBP"],["¥","JPY"],["CN¥","CNY"],["CHF","CHF"],["C$","CAD"],["A$","AUD"],["NZ$","NZD"],["HK$","HKD"],["S$","SGD"],["₹","INR"],["₩","KRW"],["₺","TRY"],["₽","RUB"],["₴","UAH"],["₪","ILS"],["﷼","IRR"],["؋","AFN"]]],
    ["أوروبا", [["kr","SEK"],["kr","NOK"],["kr","DKK"],["kr","ISK"],["zł","PLN"],["Kč","CZK"],["Ft","HUF"],["lei","RON"],["лв","BGN"],["дин.","RSD"],["L","ALL"],["ден","MKD"],["KM","BAM"],["L","MDL"],["Br","BYN"],["£","GIP"]]],
    ["الأمريكتان", [["Mex$","MXN"],["R$","BRL"],["AR$","ARS"],["CL$","CLP"],["COL$","COP"],["S/","PEN"],["$U","UYU"],["₲","PYG"],["Bs.","BOB"],["Bs.S","VES"],["Q","GTQ"],["L","HNL"],["C$","NIO"],["₡","CRC"],["B/.","PAB"],["RD$","DOP"],["₱","CUP"],["J$","JMD"],["TT$","TTD"],["Bds$","BBD"],["B$","BSD"],["G","HTG"],["BZ$","BZD"],["G$","GYD"],["Sr$","SRD"],["EC$","XCD"],["ƒ","AWG"],["ƒ","ANG"],["CI$","KYD"],["BD$","BMD"]]],
    ["أفريقيا", [["R","ZAR"],["₦","NGN"],["₵","GHS"],["KSh","KES"],["USh","UGX"],["TSh","TZS"],["Br","ETB"],["FRw","RWF"],["CFA","XOF"],["FCFA","XAF"],["MT","MZN"],["ZK","ZMW"],["P","BWP"],["N$","NAD"],["Kz","AOA"],["Ar","MGA"],["₨","MUR"],["₨","SCR"],["MK","MWK"],["L","LSL"],["E","SZL"],["D","GMD"],["Le","SLE"],["L$","LRD"],["FG","GNF"],["FC","CDF"],["FBu","BIF"],["Nfk","ERN"],["Esc","CVE"],["Db","STN"]]],
    ["آسيا والمحيط الهادئ", [["₨","PKR"],["৳","BDT"],["Rs","LKR"],["Rs","NPR"],["฿","THB"],["₫","VND"],["₱","PHP"],["Rp","IDR"],["RM","MYR"],["₸","KZT"],["₾","GEL"],["֏","AMD"],["₼","AZN"],["NT$","TWD"],["MOP$","MOP"],["K","MMK"],["៛","KHR"],["₭","LAK"],["₮","MNT"],["B$","BND"],["с","KGS"],["SM","TJS"],["m","TMT"],["soʻm","UZS"],["Nu.","BTN"],["Rf","MVR"],["K","PGK"],["FJ$","FJD"],["T","WST"],["T$","TOP"],["VT","VUV"],["SI$","SBD"],["₣","XPF"]]]
  ];
  function build() {
    rowsEl.textContent = "";
    LAYERS[layer].forEach(function (row) {
      var r = document.createElement("div"); r.className = "r " + row.c;
      row.k.forEach(function (d) { r.appendChild(key(d)); });
      if (row.mid) {
        var m = document.createElement("div"); m.className = "mid";
        row.mid.forEach(function (d) { m.appendChild(key(d)); });
        r.appendChild(m); r.appendChild(key(row.end));
      }
      rowsEl.appendChild(r);
    });
    fit();
  }
  function fit() {
    var PX = 200;
    Array.prototype.forEach.call(rowsEl.querySelectorAll(".k.fit"), function (k) {
      var c = k.querySelector("canvas"); if (!c || !k._lab) return;
      var cs = getComputedStyle(k), font = "400 " + PX + "px " + cs.fontFamily, lines = k._lab.split("\n");
      var ctx = c.getContext("2d"); ctx.font = font; ctx.direction = "rtl"; ctx.textAlign = "center";
      var m = lines.map(function (t) { return ctx.measureText(t); }), lh = PX * 1.25, L = 0, R = 0;
      m.forEach(function (x) { L = Math.max(L, x.actualBoundingBoxLeft); R = Math.max(R, x.actualBoundingBoxRight); });
      var asc = m[0].actualBoundingBoxAscent, desc = m[m.length - 1].actualBoundingBoxDescent;
      var w = Math.ceil(L + R) + 8, h = Math.ceil(asc + desc + lh * (lines.length - 1)) + 8;
      if (w < 12 || h < 12) return;
      c.width = w; c.height = h;
      ctx = c.getContext("2d"); ctx.font = font; ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.fillStyle = cs.color;
      lines.forEach(function (t, i) { ctx.fillText(t, L + 4, 4 + asc + i * lh); });
      var sc = Math.min(k.clientWidth * 0.86 / w, k.clientHeight * 0.78 / h, k.clientHeight * 0.7 / PX);
      c.style.width = Math.round(w * sc) + "px"; c.style.height = Math.round(h * sc) + "px";
    });
  }
  window.addEventListener("resize", fit);
  if (window.matchMedia) { var mq = window.matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", fit); }
  if (document.fonts) { document.fonts.addEventListener("loadingdone", fit); document.fonts.ready.then(fit); }
  function go(l) { layer = l; build(); fit(); }

  /* ================= الإدخال ================= */
  function ins(t) { ta.setRangeText(t, ta.selectionStart, ta.selectionEnd, "end"); }
  function del() {
    var a = ta.selectionStart, b = ta.selectionEnd;
    if (a !== b) ta.setRangeText("", a, b, "end");
    else if (a > 0) {
      var s = ta.value, n = 1, c = s.charCodeAt(a - 1);
      if (c >= 0xDC00 && c <= 0xDFFF && a > 1) n = 2;
      ta.setRangeText("", a - n, a, "end");
    }
  }
  var holdT, holdI;
  function stopHold() { clearTimeout(holdT); clearInterval(holdI); }

  rowsEl.addEventListener("mousedown", function (e) { e.preventDefault(); });
  rowsEl.addEventListener("pointerdown", function (e) {
    var k = e.target.closest(".k");
    if (!k || k.dataset.act !== "del") return;
    del(); stopHold();
    holdT = setTimeout(function () { holdI = setInterval(del, 60); }, 400);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { rowsEl.addEventListener(ev, stopHold); });

  rowsEl.addEventListener("click", function (e) {
    var k = e.target.closest(".k"); if (!k) return;
    var a = k.dataset.act;
    if (suppress) { suppress = false; return; }
    if (a === "del") { if (e.detail === 0) del(); }
    else if (a) go(a);
    else if (k.dataset.ch !== undefined) {
      ins(k.dataset.ch);
      if (layer === "alt") go("ar");
    }
    ta.focus({ preventScroll: true });
  });


  /* ================= معاينة الحرف والبدائل بالضغط المطوّل ================= */
  var kbd = $(".kbd");
  var VOC = "صَلَّى ٱللَّهُ عَلَيْهِ وَآلِهِ وَسَلَّمَ";
  var ALTS = {
    "ا": ["أ", "إ", "آ", "ء", "ٱ"], "و": ["ؤ"], "ي": ["ئ", "ى"], "ى": ["ي"], "ه": ["ة"], "ة": ["ه"],
    "ء": ["أ", "إ", "ؤ", "ئ"], "-": ["ـ", "–"], ".": ["،", "؛", "؟"], "،": [".", "؛"],
    "ﷲ": ["ﷻ"]
  };
  ALTS["\uE90A"] = ["ﷺ", "\uE90B"];
  ALTS["\uE90B"] = ["صلى الله عليه وآله وسلم", VOC, "\uE90A"];
  var pv = null, altBox = null, holdAlt = 0, suppress = false, altKey = null;
  function rel(el) { var a = el.getBoundingClientRect(), b = kbd.getBoundingClientRect(); return { l: a.left - b.left, t: a.top - b.top, w: a.width, h: a.height, W: b.width }; }
  function clampL(l, w, W) { return Math.max(2, Math.min(l, W - w - 2)); }
  function hidePv() { if (pv) { pv.remove(); pv = null; } }
  function closeAlts() { clearTimeout(holdAlt); if (altBox) { altBox.remove(); altBox = null; } altKey = null; }
  function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  function showPv(k) {
    hidePv();
    var r = rel(k), w = Math.max(r.w * 1.45, 36), h = r.h * 1.45;
    pv = document.createElement("div"); pv.className = "pv"; pv.setAttribute("aria-hidden", "true");
    pv.textContent = k.dataset.ch;
    pv.style.cssText = "width:" + w + "px;height:" + h + "px;left:" + clampL(r.l + r.w / 2 - w / 2, w, r.W) + "px;top:" + (r.t - h + r.h * 0.12) + "px;font-size:" + (r.h * 0.62) + "px";
    kbd.appendChild(pv);
  }
  function showAlts(k) {
    var list = ALTS[k.dataset.ch]; if (!list) return;
    hidePv(); closeAlts(); altKey = k;
    var r = rel(k), n = list.length, phr = list.some(function (x) { return x.length > 2; });
    var w = phr ? Math.min(r.W * 0.9, 260) : r.w * 1.05, h = r.h * 1.15;
    altBox = document.createElement("div"); altBox.className = "alts"; altBox.setAttribute("role", "menu");
    var tw = phr ? w : w * n;
    altBox.style.cssText = "left:" + clampL(r.l + r.w / 2 - tw / 2, tw, r.W) + "px;top:" + (r.t - h - r.h * 0.2) + "px;flex-direction:" + (phr ? "column" : "row");
    list.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.className = "alt"; b.setAttribute("role", "menuitem");
      b.dataset.v = c; b.textContent = c;
      b.style.cssText = "width:" + w + "px;min-height:" + h + "px;font-size:" + (phr ? r.h * 0.34 : r.h * 0.6) + "px";
      altBox.appendChild(b);
    });
    kbd.appendChild(altBox); vib(12); suppress = true;
  }
  function showCurPop(k) {
    hidePv(); closeAlts(); altKey = k;
    var r = rel(k), W = r.W, H = W * 0.62;
    altBox = document.createElement("div"); altBox.className = "alts curpop"; altBox.setAttribute("role", "menu"); altBox.setAttribute("aria-label", "جميع العملات");
    altBox.style.cssText = "left:" + (W * 0.01) + "px;width:" + (W * 0.98) + "px;height:" + H + "px;top:" + (r.t - H - 6) + "px";
    CUR.forEach(function (sec) {
      var h = document.createElement("div"); h.className = "ch"; h.textContent = sec[0]; altBox.appendChild(h);
      sec[1].forEach(function (it) {
        var b = document.createElement("button"); b.type = "button"; b.className = "alt ci" + (sec[2] ? " big" : "");
        b.setAttribute("role", "menuitem"); b.dataset.v = it[0]; b.setAttribute("aria-label", it[1]);
        var a = document.createElement("span"); a.textContent = it[0];
        var m = document.createElement("small"); m.textContent = it[1];
        b.appendChild(a); b.appendChild(m); altBox.appendChild(b);
      });
    });
    kbd.appendChild(altBox); vib(12); suppress = true;
  }
  function pickAlt(v) { ins(v); closeAlts(); if (layer === "alt") go("ar"); ta.focus({ preventScroll: true }); }

  rowsEl.addEventListener("pointerdown", function (e) {
    var k = e.target.closest(".k");
    suppress = false;
    if (altBox && !(e.target.closest(".alts"))) closeAlts();
    if (!k) return;
    if (k.dataset.ch === " ") {
      spStart = spLast = e.clientX; clearTimeout(holdAlt);
      holdAlt = setTimeout(function () { trk = { last: spLast, acc: 0 }; suppress = true; kbd.classList.add("trk"); vib(12); ta.focus({ preventScroll: true }); }, 350);
    }
    if (k.dataset.ch !== undefined && k.dataset.ch !== " " && k.dataset.ch !== "\n") {
      vib(6);
      if (!ALTS[k.dataset.ch] || k.dataset.ch.length <= 2) showPv(k);
      if (k.dataset.cur) { clearTimeout(holdAlt); holdAlt = setTimeout(function () { showCurPop(k); }, 380); }
      else if (ALTS[k.dataset.ch]) { clearTimeout(holdAlt); holdAlt = setTimeout(function () { showAlts(k); }, 380); }
    }
  });
  var spStart = null, spLast = 0, trk = null, STEP = 9;
  function moveCaret(dir) {
    var pos = ta.selectionStart, ch = ta.value.charAt(pos) || ta.value.charAt(pos - 1) || "";
    var rtl = !/[A-Za-z0-9]/.test(ch), d = rtl ? -dir : dir;
    var np = Math.max(0, Math.min(ta.value.length, pos + d));
    if (np !== pos) { ta.setSelectionRange(np, np); vib(4); }
  }
  rowsEl.addEventListener("pointermove", function (e) {
    if (spStart !== null) {
      if (!trk) { if (Math.abs(e.clientX - spStart) > 14) { clearTimeout(holdAlt); spStart = null; } else spLast = e.clientX; }
      else {
        trk.acc += e.clientX - trk.last; trk.last = e.clientX;
        while (Math.abs(trk.acc) >= STEP) { var sg = trk.acc > 0 ? 1 : -1; trk.acc -= sg * STEP; moveCaret(sg); }
        ta.focus({ preventScroll: true });
      }
    }
    if (!altBox || altBox.classList.contains("curpop")) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    Array.prototype.forEach.call(altBox.children, function (c) { c.classList.toggle("on", c === el); });
  });
  function up(e) {
    clearTimeout(holdAlt); hidePv();
    spStart = null; if (trk) { trk = null; kbd.classList.remove("trk"); }
    if (altBox && !altBox.classList.contains("curpop") && e.type === "pointerup") {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if (el && el.classList && el.classList.contains("alt")) { pickAlt(el.dataset.v); }
    }
  }
  ["pointerup", "pointercancel"].forEach(function (ev) { document.addEventListener(ev, up); });
  document.addEventListener("pointerdown", function (e) { if (altBox && !e.target.closest(".alts")) closeAlts(); });
  kbd.addEventListener("mousedown", function (e) { if (e.target.closest(".alts")) e.preventDefault(); });
  kbd.addEventListener("click", function (e) {
    var a = e.target.closest(".alt"); if (a) { pickAlt(a.dataset.v); }
  });

  /* أدوات النص */
  var copyBtn = $("#copy");
  function plain(t) {
    return t.replace(/\uE90A/g, "ﷺ").replace(/\uE90B/g, "صلى الله عليه وآله وسلم").replace(/[\uE900-\uE909]/g, "د.ع");
  }
  copyBtn.addEventListener("click", function () {
    var done = function () { copyBtn.textContent = "تم النسخ"; setTimeout(function () { copyBtn.textContent = "نسخ"; }, 1200); };
    if (!ta.value) return;
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(plain(ta.value)).then(done, function () {}); }
    else { var keep = ta.value; ta.value = plain(keep); ta.select(); try { if (document.execCommand("copy")) done(); } catch (er) {} ta.value = keep; }
    ta.focus({ preventScroll: true });
  });
  $("#clear").addEventListener("click", function () { ta.value = ""; ta.focus({ preventScroll: true }); });

  /* ================= المحاذاة ================= */
  var align = safeGet("kb-align"); if (["right", "center", "left"].indexOf(align) < 0) align = "right";
  var alBtns = document.querySelectorAll("[data-al]");
  function setAlign(a) {
    align = a; ta.style.textAlign = a; safeSet("kb-align", a);
    Array.prototype.forEach.call(alBtns, function (b) { b.setAttribute("aria-pressed", String(b.dataset.al === a)); });
  }
  Array.prototype.forEach.call(alBtns, function (b) { b.addEventListener("click", function () { setAlign(b.dataset.al); ta.focus({ preventScroll: true }); }); });
  setAlign(align);

  /* ================= الحفظ كصورة ================= */
  var FMT = [
    { id: "png",  name: "PNG",  mime: "image/png" },
    { id: "jpg",  name: "JPG",  mime: "image/jpeg", opaque: true },
    { id: "webp", name: "WebP", mime: "image/webp" },
    { id: "svg",  name: "SVG",  mime: "image/svg+xml" },
    { id: "bmp",  name: "BMP",  mime: "image/bmp", opaque: true }
  ];
  var BGS = [{ id: "white", name: "أبيض" }, { id: "black", name: "أسود" }, { id: "none", name: "شفاف" }];
  var fmt = "png", bgSel = "white";
  var dlg = $("#exp"), prev = $("#expPrev"), note = $("#expNote"), fmtGrp = $("#fmtGrp"), bgGrp = $("#bgGrp");
  var IW = 1080, IP = 72, IF = 64, ILH = 110;

  function chips(host, arr, getter, setter) {
    arr.forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.setAttribute("role", "radio"); b.dataset.id = o.id; b.textContent = o.name;
      b.addEventListener("click", function () { setter(o.id); sync(); render(); });
      host.appendChild(b);
    });
  }
  function sync() {
    Array.prototype.forEach.call(fmtGrp.children, function (b) { b.setAttribute("aria-checked", String(b.dataset.id === fmt)); });
    var f = FMT.filter(function (x) { return x.id === fmt; })[0];
    Array.prototype.forEach.call(bgGrp.children, function (b) {
      b.setAttribute("aria-checked", String(b.dataset.id === eff())); b.disabled = !!(f.opaque && b.dataset.id === "none");
    });
    note.textContent = f.opaque ? "هذه الصيغة لا تدعم الشفافية، تُحفظ بخلفية بيضاء عند اختيار «شفاف»." : (f.id === "svg" ? "الخطوط المحلية تُضمَّن داخل الملف، وخطوط Google تتطلب اتصالاً عند فتحه." : "");
  }
  function eff() { var f = FMT.filter(function (x) { return x.id === fmt; })[0]; return (f.opaque && bgSel === "none") ? "white" : bgSel; }
  chips(fmtGrp, FMT, null, function (v) { fmt = v; });
  chips(bgGrp, BGS, null, function (v) { bgSel = v; });

  function wrap(ctx, text, maxW) {
    var out = [];
    text.split("\n").forEach(function (par) {
      if (!par) { out.push(""); return; }
      var cur = "";
      par.split(" ").forEach(function (w) {
        var t = cur ? cur + " " + w : w;
        if (cur && ctx.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t;
      });
      out.push(cur);
    });
    return out;
  }
  function famStack() { return stack(FONTS[fontIdx]); }
  function layoutText() {
    var c = document.createElement("canvas"), ctx = c.getContext("2d");
    ctx.font = "400 " + IF + "px " + famStack(); ctx.direction = "rtl";
    var lines = wrap(ctx, ta.value.replace(/\r/g, ""), IW - IP * 2);
    return { lines: lines, H: Math.max(IP * 2 + lines.length * ILH, 200) };
  }
  function lineX() { return align === "right" ? IW - IP : (align === "center" ? IW / 2 : IP); }
  function drawTo(cv, scale) {
    var L = layoutText(), bg = eff();
    cv.width = Math.round(IW * scale); cv.height = Math.round(L.H * scale);
    var ctx = cv.getContext("2d"); ctx.scale(scale, scale);
    if (bg !== "none") { ctx.fillStyle = bg === "black" ? "#000" : "#fff"; ctx.fillRect(0, 0, IW, L.H); }
    ctx.fillStyle = bg === "black" ? "#fff" : "#12141c";
    ctx.font = "400 " + IF + "px " + famStack(); ctx.direction = "rtl"; ctx.textBaseline = "middle"; ctx.textAlign = align;
    L.lines.forEach(function (t, i) { if (t) ctx.fillText(t, lineX(), IP + (i + 0.5) * ILH); });
    return L;
  }
  function render() {
    var f = famStack();
    var p = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load("400 " + IF + "px " + f, ta.value || "ا"), document.fonts.load("400 " + IF + "px \"Iraq Digits\"", "0123456789")]) : Promise.resolve();
    p.catch(function () {}).then(function () { drawTo(prev, 0.5); });
  }
  function bmpBlob(cv) {
    var w = cv.width, h = cv.height, d = cv.getContext("2d").getImageData(0, 0, w, h).data;
    var rs = Math.ceil(w * 3 / 4) * 4, size = 54 + rs * h, buf = new ArrayBuffer(size), v = new DataView(buf);
    v.setUint8(0, 0x42); v.setUint8(1, 0x4D); v.setUint32(2, size, true); v.setUint32(10, 54, true); v.setUint32(14, 40, true);
    v.setInt32(18, w, true); v.setInt32(22, h, true); v.setUint16(26, 1, true); v.setUint16(28, 24, true); v.setUint32(34, rs * h, true);
    v.setInt32(38, 2835, true); v.setInt32(42, 2835, true);
    for (var y = 0; y < h; y++) {
      var o = 54 + (h - 1 - y) * rs;
      for (var x = 0; x < w; x++) { var i = (y * w + x) * 4; v.setUint8(o + x * 3, d[i + 2]); v.setUint8(o + x * 3 + 1, d[i + 1]); v.setUint8(o + x * 3 + 2, d[i]); }
    }
    return new Blob([buf], { type: "image/bmp" });
  }
  function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function fontCss() {
    var out = "";
    try {
      Array.prototype.forEach.call(document.styleSheets, function (sh) {
        var rules; try { rules = sh.cssRules; } catch (e) { return; }
        Array.prototype.forEach.call(rules, function (r) {
          if (r.type === 5 && /Iraq Kufic|Iraq Digits|IQD Symbol/.test(r.cssText)) out += r.cssText + "\n";
        });
      });
    } catch (e) {}
    if (out) return Promise.resolve(out);
    return fetch("style.css").then(function (r) { return r.text(); }).then(function (t) {
      return (t.match(/@font-face\{[^}]*\}/g) || []).filter(function (x) { return /Iraq Kufic|Iraq Digits|IQD Symbol/.test(x); }).join("\n");
    }).catch(function () { return ""; });
  }
  function svgBlob() {
    return fontCss().then(function (css) {
      var L = layoutText(), bg = eff(), anchor = align === "right" ? "start" : (align === "center" ? "middle" : "end");
      var fam = famStack().replace(/"/g, "'");
      var imp = "@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi&family=Noto+Kufi+Arabic&family=Kufam&family=Reem+Kufi+Ink&family=Amiri&display=swap');\n";
      var body = L.lines.map(function (t, i) { return t ? '<text x="' + lineX() + '" y="' + (IP + (i + 0.5) * ILH) + '">' + esc(t) + '</text>' : ""; }).join("\n");
      var rect = bg === "none" ? "" : '<rect width="100%" height="100%" fill="' + (bg === "black" ? "#000" : "#fff") + '"/>';
      var svg = '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="' + IW + '" height="' + L.H + '" viewBox="0 0 ' + IW + ' ' + L.H + '">\n<style>' + imp + css + '</style>\n' + rect +
        '\n<g xml:space="preserve" direction="rtl" text-anchor="' + anchor + '" dominant-baseline="central" font-size="' + IF + '" fill="' + (bg === "black" ? "#fff" : "#12141c") + '" style="font-family:' + fam + '">\n' + body + '\n</g>\n</svg>';
      return new Blob([svg], { type: "image/svg+xml" });
    });
  }
  function toBlob(cv, mime) { return new Promise(function (res) { cv.toBlob(res, mime, 0.95); }); }
  function save(blob, ext) {
    var u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u; a.download = "kufic-text." + ext; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
  }
  function exportNow() {
    var f = FMT.filter(function (x) { return x.id === fmt; })[0], go = $("#expGo");
    go.disabled = true; note.textContent = "جارٍ التجهيز...";
    var done = function () { go.disabled = false; sync(); };
    var fail = function () { note.textContent = "تعذر إنشاء الصورة. جرّب صيغة أخرى."; go.disabled = false; };
    if (f.id === "svg") { svgBlob().then(function (b) { save(b, "svg"); done(); }, fail); return; }
    var cv = document.createElement("canvas"); drawTo(cv, 1);
    if (f.id === "bmp") { save(bmpBlob(cv), "bmp"); done(); return; }
    toBlob(cv, f.mime).then(function (b) {
      if (!b) { fail(); return; }
      var ext = b.type === "image/png" ? "png" : (b.type === "image/jpeg" ? "jpg" : "webp");
      save(b, ext); done();
      if (f.id === "webp" && ext !== "webp") note.textContent = "متصفحك لا يدعم WebP فحُفظت الصورة بصيغة PNG.";
    }, fail);
  }
  $("#save").addEventListener("click", function () {
    if (!ta.value.trim()) { var s0 = $("#save"); s0.textContent = "اكتب نصًا أولاً"; setTimeout(function () { s0.textContent = "حفظ كصورة"; }, 1400); return; }
    if (!dlg.showModal) return;
    sync(); render(); dlg.showModal();
  });
  $("#expGo").addEventListener("click", exportNow);
  $("#expX").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("close", function () { ta.focus({ preventScroll: true }); });

  /* كيبورد الجهاز الفعلي (حاسوب) */
  var PHYS = { q:"ض",w:"ص",e:"ث",r:"ق",t:"ف",y:"غ",u:"ع",i:"ه",o:"خ",p:"ح","[":"ج","]":"د",a:"ش",s:"س",d:"ي",f:"ب",g:"ل",h:"ا",j:"ت",k:"ن",l:"م",";":"ك","'":"ط","`":"ذ",z:"ئ",x:"ء",c:"ؤ",v:"ر",b:"لا",n:"ى",m:"ة",",":"و",".":"ز","/":"ظ" };
  ta.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    var m = PHYS[e.key.toLowerCase()];
    if (m) { e.preventDefault(); ins(m); }
  });

  setFont(fontIdx);
  build();
})();
