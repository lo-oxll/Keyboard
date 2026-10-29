/* كيبورد الخط الكوفي. CC0 */
(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ================= الخطوط (الأرقام ثابتة دائماً بخط الزوايا) ================= */
  var TAIL = ',"IQD Symbol","Amiri","Noto Naskh Arabic","Segoe UI Symbol",serif';
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
      { c: "", k: arr(["-", "/", ":", "؛", "﴿", "﴾", "\uE900", "٪", "«", "»"]) },
      { c: "n3", k: [F("sym", "#+=")], mid: list(".،؟!ـ"), end: DEL },
      { c: "r4", k: [F("ar", "ابج", "f4"), F("sym", "۞", "f4"), SP(), RET] }
    ],
    sym: [
      { c: "", k: arr(["﷽", "ﷲ", "ﷺ", "۞", "۝", "۩", "؍", "؎", "؏", "٭"], "sy") },
      { c: "", k: arr(["٫", "٬", "۔", "؞", "+", "=", "×", "÷", "(", ")"]) },
      { c: "n3", k: [F("num", "123", "dg")], mid: arr(["[", "]", "{", "}", "…"]), end: DEL },
      { c: "r4", k: [F("ar", "ابج", "f4"), SP(), RET] }
    ]
  };

  function key(d) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "k " + (d.cls || "");
    if (d.icon) b.innerHTML = d.icon; else b.textContent = d.label;
    if (d.aria) b.setAttribute("aria-label", d.aria);
    if (d.act) b.dataset.act = d.act;
    if (d.ch !== undefined) b.dataset.ch = d.ch;
    return b;
  }
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
  }
  function go(l) { layer = l; build(); }

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
    if (a === "del") { if (e.detail === 0) del(); }
    else if (a) go(a);
    else if (k.dataset.ch !== undefined) {
      ins(k.dataset.ch);
      if (layer === "alt") go("ar");
    }
    ta.focus({ preventScroll: true });
  });

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
