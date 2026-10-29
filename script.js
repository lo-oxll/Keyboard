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
      { c: "r4", k: [F("ar", "ابج", "f4"), F("sym", "۞", "f4"), F("cur", "$", "f4"), SP(), RET] }
    ],
    sym: [
      { c: "w1", k: [{ ch: "﷽", label: "﷽", cls: "wide sy2", aria: "بسم الله الرحمن الرحيم" }].concat(arr(["ﷲ", "ﷺ", "۞", "۝", "۩", "؏"], "sy")) },
      { c: "", k: arr(["٫", "٬", "۔", "؞", "؍", "؎", "٭", "+", "=", "×"]) },
      { c: "n3", k: [F("num", "123", "dg")], mid: arr(["(", ")", "[", "]", "÷"]), end: DEL },
      { c: "r4", k: [F("ar", "ابج", "f4"), F("cur", "$", "f4"), SP(), RET] }
    ],
    cur: "cur"
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
  var DEL4 = { act: "del", icon: ICON_DEL, cls: "fn dia", aria: "حذف" };
  function buildCur() {
    var box = document.createElement("div"); box.className = "cur"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "العملات");
    CUR.forEach(function (sec) {
      var h = document.createElement("div"); h.className = "ch"; h.textContent = sec[0]; box.appendChild(h);
      sec[1].forEach(function (it) {
        var b = document.createElement("button"); b.type = "button"; b.className = "k " + (sec[2] || "");
        b.dataset.ch = it[0]; b.setAttribute("aria-label", it[1]);
        var a = document.createElement("span"); a.textContent = it[0];
        var s = document.createElement("small"); s.textContent = it[1];
        b.appendChild(a); b.appendChild(s); box.appendChild(b);
      });
    });
    rowsEl.appendChild(box);
    var r = document.createElement("div"); r.className = "r r4";
    [F("ar", "ابج", "f4"), F("num", "123", "f4 dg"), SP(), DEL4, RET].forEach(function (d) { r.appendChild(key(d)); });
    rowsEl.appendChild(r);
  }
  function build() {
    rowsEl.textContent = "";
    if (layer === "cur") { buildCur(); return; }
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
