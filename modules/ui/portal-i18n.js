/**
 * Idioma del portal interno (ES / EN).
 * Traduce en vivo el DOM del portal (textos, placeholders, títulos, aria-label) a partir de los diccionarios
 * `portal-i18n-dict-*.js` y reglas para textos dinámicos (cantidades, fechas, horas).
 * No modifica el sitio público (que tiene su propio selector de idioma).
 */
(function () {
  "use strict";

  var STORAGE_KEY = "antares_portal_lang";
  var ATTRS = ["placeholder", "title", "aria-label", "alt", "data-tooltip", "data-label"];
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, NOSCRIPT: 1, SVG: 1 };
  var EXCLUDE_SELECTOR = "#public-app, .top-nav, .site-footer, #auth-modal, [data-no-i18n], .no-i18n";

  var lang = "es";
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "es") lang = saved;
  } catch (e) {}

  /* ---------- Diccionario ---------- */
  var exact = null; /* clave normalizada → traducción */
  var ci = null; /* clave en minúsculas → traducción (para plurales/minúsculas) */
  var phrases = null; /* [clave, traducción] ordenado por longitud desc (para reemplazo parcial) */

  function norm(s) {
    return String(s).replace(/\s+/g, " ").trim();
  }

  function buildDict() {
    exact = Object.create(null);
    ci = Object.create(null);
    var parts = window.__PORTAL_I18N_PARTS || [];
    var list = [];
    parts.forEach(function (p) {
      Object.keys(p).forEach(function (k) {
        var key = norm(k);
        exact[key] = p[k];
        ci[key.toLowerCase()] = p[k];
        if (key.length >= 14 && /\s/.test(key)) list.push([key, p[k]]);
      });
    });
    list.sort(function (a, b) {
      return b[0].length - a[0].length;
    });
    phrases = list;
  }

  /* ---------- Fechas y horas ---------- */
  var MONTHS = {
    enero: "January", febrero: "February", marzo: "March", abril: "April", mayo: "May", junio: "June",
    julio: "July", agosto: "August", septiembre: "September", setiembre: "September", octubre: "October",
    noviembre: "November", diciembre: "December"
  };
  var MONTHS_SHORT = {
    ene: "Jan", feb: "Feb", mar: "Mar", abr: "Apr", may: "May", jun: "Jun", jul: "Jul", ago: "Aug",
    sep: "Sep", sept: "Sep", oct: "Oct", nov: "Nov", dic: "Dec"
  };
  var DAYS = {
    lunes: "Monday", martes: "Tuesday", "miércoles": "Wednesday", miercoles: "Wednesday", jueves: "Thursday",
    viernes: "Friday", "sábado": "Saturday", sabado: "Saturday", domingo: "Sunday"
  };

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function translateDates(text) {
    var out = text;
    /* "13 de octubre de 2026" → "October 13, 2026" ; "13 de octubre" → "October 13" */
    out = out.replace(/\b(\d{1,2}) de ([a-záéíóú]+)(?: de (\d{4}))?/gi, function (m, d, mo, y) {
      var en = MONTHS[mo.toLowerCase()];
      if (!en) return m;
      return en + " " + d + (y ? ", " + y : "");
    });
    /* "Octubre 2026" → "October 2026" */
    out = out.replace(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b(?=\s+\d{4})/gi, function (m) {
      return MONTHS[m.toLowerCase()];
    });
    /* "octubre de 2026" → "October 2026" */
    out = out.replace(/\b([a-záéíóú]+) de (\d{4})\b/gi, function (m, mo, y) {
      var en = MONTHS[mo.toLowerCase()];
      return en ? en + " " + y : m;
    });
    /* Días de la semana */
    out = out.replace(/\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/gi, function (m) {
      var en = DAYS[m.toLowerCase()];
      return en ? (m.charAt(0) === m.charAt(0).toUpperCase() ? en : en.toLowerCase()) : m;
    });
    /* Meses sueltos: sólo si aparecen capitalizados o con año al lado */
    out = out.replace(/\b(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sept?|oct|nov|dic)\.? (\d{4})\b/gi, function (m, d, mo, y) {
      var en = MONTHS_SHORT[mo.toLowerCase()];
      return en ? en + " " + d + ", " + y : m;
    });
    /* Horas: "11:58 p. m." → "11:58 PM" */
    out = out.replace(/(\d{1,2}:\d{2}(?::\d{2})?)\s*([ap])\.?\s?m\.?/gi, function (m, t, ap) {
      return t + " " + ap.toUpperCase() + "M";
    });
    out = out.replace(/\b(\d{1,2})\s*([ap])\.\s?m\./gi, function (m, h, ap) {
      return h + " " + ap.toUpperCase() + "M";
    });
    return out;
  }

  /* ---------- Reglas dinámicas ---------- */
  var RULES = [
    [/^Buen(?:os|as) (días|tardes|noches),?\s*(.*)$/i, function (m, p, rest) {
      var g = { "días": "Good morning", tardes: "Good afternoon", noches: "Good evening" }[p.toLowerCase()];
      return g + (rest ? ", " + rest : ",");
    }],
    [/^Paso (\d+) de (\d+)$/i, "Step $1 of $2"],
    [/^(\d+(?:[.,]\d+)?) d[ií]as? h[aá]biles?\.?$/i, "$1 business days"],
    [/^(\d+) d[ií]as?$/i, function (m, n) { return n + (n === "1" ? " day" : " days"); }],
    [/^(\d+) meses$/i, "$1 months"],
    [/^(\d+) mes$/i, "1 month"],
    [/^(\d+) a[ñn]os?$/i, function (m, n) { return n + (n === "1" ? " year" : " years"); }],
    [/^Sugerido: (\d+(?:[.,]\d+)?) d[ií]as h[aá]biles\.?$/i, "Suggested: $1 business days."],
    [/^(\d+)% completado$/i, "$1% complete"],
    [/^(\d+)% de (.+)$/i, function (m, n, rest) { return n + "% of " + t(rest); }],
    [/^Usar (.+)$/i, function (m, rest) { return "Use " + translateDates(rest); }],
    [/^Elegir (.+)$/i, function (m, rest) { return "Choose " + t(rest.charAt(0).toUpperCase() + rest.slice(1)).replace(/^./, function (c) { return c.toLowerCase(); }); }],
    [/^Mostrando (\d+) de (\d+) (.+)$/i, function (m, a, b, rest) { return "Showing " + a + " of " + b + " " + t(rest); }],
    [/^Última consulta: (.+)$/i, function (m, rest) { return "Last query: " + translateDates(rest); }],
    [/^Actualizado (.+)$/i, function (m, rest) { return "Updated " + translateDates(rest.replace(/·\s*hora Colombia/i, "· Colombia time")); }],
    [/^Sincronizado (.+)$/i, function (m, rest) { return "Synced " + t(rest); }],
    [/^Hace (\d+) (segundos?|minutos?|horas?|días?|semanas?|meses?)$/i, function (m, n, u) {
      var map = { segundo: "second", minuto: "minute", hora: "hour", "día": "day", semana: "week", mes: "month" };
      var base = u.toLowerCase().replace(/s$/, "").replace(/e$/, function () { return u.toLowerCase() === "meses" || u.toLowerCase() === "mese" ? "" : "e"; });
      var key = u.toLowerCase().replace(/(es|s)$/, "");
      var en = map[key] || map[base] || u;
      return n + " " + en + (Number(n) === 1 ? "" : "s") + " ago";
    }],
    [/^(\d+) pendientes?\(?s?\)?$/i, "$1 pending"],
    [/^(\d+) conductores? registrados?(.*)$/i, function (m, n, rest) { return n + (n === "1" ? " registered driver" : " registered drivers") + (rest ? " " + t(rest.trim()) : ""); }],
    [/^(\d+) seleccionad[oa]s?$/i, function (m, n) { return n + " selected"; }],
    [/^(\d+) en estado de (.+)$/i, function (m, n, rest) { return n + " in " + t(rest) + " status"; }],
    [/^(\d+) perfiles? en la matriz (.+)$/i, function (m, n, rest) { return n + (n === "1" ? " profile" : " profiles") + " in the " + rest + " matrix"; }],
    [/^Ej\.?:?\s+(.+)$/i, function (m, rest) { return "E.g.: " + t(rest); }],
    [/^(\d+) solicitud(?:es)? pendientes?(?:es)?$/i, function (m, n) { return n + " pending request" + (n === "1" ? "" : "s"); }],
    [/^(\d+) liquidaci[óo]n(?:es)?(.*)$/i, function (m, n, rest) { return n + " settlement" + (n === "1" ? "" : "s") + translateSegments(rest); }],
    [/^\+(\d+) más$/i, "+$1 more"],
    [/^Vence en (\d+) d[ií]as?$/i, function (m, n) { return "Expires in " + n + (n === "1" ? " day" : " days"); }],
    [/^Vence en (\d+)d$/i, "Expires in $1d"],
    [/^Vencido hace (\d+) d[ií]as?$/i, function (m, n) { return "Expired " + n + (n === "1" ? " day" : " days") + " ago"; }],
    [/^(\d+) registros? pendientes?$/i, function (m, n) { return n + (n === "1" ? " pending record" : " pending records"); }],
    [/^Viaje (VIA-[\w-]+)$/i, "Trip $1"],
    [/^Hasta (\d{1,2}:\d{2}.*)$/i, function (m, rest) { return "Until " + translateDates(rest); }],
    [/^Desde (\d{1,2}:\d{2}.*)$/i, function (m, rest) { return "From " + translateDates(rest); }],
    [/^← (\d{1,2}:\d{2}.*)$/i, function (m, rest) { return "← " + translateDates(rest); }],
    [/^(\d{1,2}) (?:de )?(ene|feb|mar|abr|may|jun|jul|ago|sept?|oct|nov|dic)\.?$/i, function (m, d, mo) { return (MONTHS_SHORT[mo.toLowerCase()] || mo) + " " + d; }],
    [/^((?:\d+\s?(?:d|h|min)\s?)+) restantes$/i, "$1 left"],
    [/^atrasado ((?:\d+\s?(?:d|h|min)\s?)+)$/i, "overdue $1"],
    [/^inicia en ((?:\d+\s?(?:d|h|min)\s?)+)$/i, "starts in $1"],
    [/^Último viaje terminó hace ((?:\d+\s?(?:d|h|min)\s?)+)$/i, "Last trip ended $1 ago"],
    [/^Lic (.+)$/i, "Lic $1"],
    [/^vence (\d{4}-\d{2}-\d{2}|-)$/i, "expires $1"],
    [/^(.+) (vence|vencen) antes del viaje$/i, function (m, what, v) { return t(what) + (v.toLowerCase() === "vencen" ? " expire" : " expires") + " before the trip"; }],
    [/^((?:licencia de conducción|examen médico ocupacional|examen instruvial)(?:, (?:licencia de conducción|examen médico ocupacional|examen instruvial))*) vencido$/i, function (m, what) { return what.split(", ").map(t).join(", ") + " expired"; }],
    [/^Conflicto de horario: el (camión|conductor) ya tiene programado el viaje ([^ (]+)(?: \((.+)\))?\.$/i, function (m, res, trip, win) {
      return "Schedule conflict: the " + (res.toLowerCase() === "camión" ? "truck" : "driver") + " already has trip " + trip + " scheduled" + (win ? " (" + translateDates(win) + ")" : "") + ".";
    }],
    [/^El camión (.+) está marcado como no disponible\.$/i, "Truck $1 is marked as unavailable."],
    [/^(.+) está marcado como no disponible\.$/i, "$1 is marked as unavailable."],
    [/^El camión (.+) no coincide con el tipo de camión solicitado\.$/i, "Truck $1 does not match the requested truck type."],
    [/^El camión (.+) no cumple capacidad, equipo Termoking o tipo de flota para esta solicitud\.$/i, "Truck $1 does not meet the capacity, Thermo King or fleet-type requirements of this request."],
    [/^(.+) no está habilitado para el tipo de camión de la solicitud\.$/i, "$1 is not qualified for the truck type of the request."],
    [/^(.+): documentación vencida\.$/i, "$1: documents expired."],
    [/^(.+): (.+) vence antes de la fecha del viaje\. Renueve en Cumplimiento SST o elija otro conductor\.$/i, function (m, name, what) {
      return name + ": " + t(what) + " expires before the trip date. Renew it in SST Compliance or choose another driver.";
    }],
    [/^(.+): (.+) vencido o sin fecha\. Renueve en Cumplimiento SST antes de asignar\.$/i, function (m, name, what) {
      return name + ": " + t(what) + " expired or missing a date. Renew it in SST Compliance before assigning.";
    }],
    [/^El camión (.+): (.+) (vence|vencen) antes de la fecha del viaje\.$/i, function (m, plate, what, v) {
      return "Truck " + plate + ": " + t(what) + (v.toLowerCase() === "vencen" ? " expire" : " expires") + " before the trip date.";
    }]
  ];

  function applyRules(s) {
    for (var i = 0; i < RULES.length; i++) {
      var r = RULES[i];
      var m = s.match(r[0]);
      if (m) {
        return typeof r[1] === "function" ? r[1].apply(null, m) : s.replace(r[0], r[1]);
      }
    }
    return null;
  }

  var PRIMARY_SEP = /(\s[·—–|•→]\s)/;
  var SECONDARY_SEP = /(:\s|,\s|\s\(|\)\s?|\.\s|;\s)/;

  function lookup(s) {
    var k = norm(s);
    if (!k) return null;
    if (exact[k] !== undefined) return exact[k];
    var low = k.toLowerCase();
    if (ci[low] !== undefined) {
      var tr = ci[low];
      /* conservar minúscula inicial si la fuente la tenía */
      if (k.charAt(0) === k.charAt(0).toLowerCase() && k.charAt(0) !== k.charAt(0).toUpperCase()) {
        return tr.charAt(0).toLowerCase() + tr.slice(1);
      }
      return tr;
    }
    return null;
  }

  /* Traduce `s` dividiéndolo por separadores; cada pieza se intenta completa antes de dividirse más */
  function translateSegments(s, level) {
    if (!s) return s;
    level = level || 0;
    var re = level === 0 ? PRIMARY_SEP : SECONDARY_SEP;
    var parts = s.split(re);
    if (parts.length < 2) return level === 0 ? translateSegments(s, 1) : s;
    var changed = false;
    var out = parts.map(function (p, i) {
      if (i % 2 === 1) return p; /* separador */
      var tr = translatePiece(p, level);
      if (tr !== p) changed = true;
      return tr;
    });
    return changed ? out.join("") : s;
  }

  /* Pieza: diccionario → reglas → número+sustantivo → subdivisión → fechas */
  function translatePiece(p, level) {
    var lead = p.match(/^\s*/)[0];
    var trail = p.match(/\s*$/)[0];
    var core = p.trim();
    if (!core) return p;
    var direct = lookup(core);
    if (direct !== null) return lead + direct + trail;
    var rule = applyRules(core);
    if (rule !== null) return lead + rule + trail;
    var num = core.match(/^(\d[\d.,]*(?:%|\s?(?:KB|MB|GB|COP))?)\s+(.+)$/);
    if (num) {
      var rest = lookup(num[2]);
      if (rest !== null) return lead + num[1] + " " + rest + trail;
    }
    var num2 = core.match(/^(.+?)\s+(\d[\d.,]*)$/);
    if (num2) {
      var head = lookup(num2[1]);
      if (head !== null) return lead + head + " " + num2[2] + trail;
    }
    if (level === 0) {
      var sub = translateSegments(core, 1);
      if (sub !== core) return lead + sub + trail;
    }
    var dated = translateDates(core);
    if (dated !== core) return lead + dated + trail;
    return p;
  }

  var memo = new Map();
  function t(text) {
    if (lang !== "en" || text == null) return text;
    var raw = String(text);
    if (!raw.trim() || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(raw)) return raw;
    var hit = memo.get(raw);
    if (hit !== undefined) return hit;
    var res = translateRaw(raw);
    if (memo.size > 6000) memo.clear();
    memo.set(raw, res);
    return res;
  }

  function translateRaw(raw) {
    if (!exact) buildDict();
    var lead = raw.match(/^\s*/)[0];
    var trail = raw.match(/\s*$/)[0];
    var core = norm(raw);

    var direct = lookup(core);
    if (direct !== null) return lead + direct + trail;
    var rule = applyRules(core);
    if (rule !== null) return lead + rule + trail;

    var seg = translateSegments(core, 0);
    if (seg !== core) return lead + replacePhrases(seg) + trail;
    var pc = translatePiece(core, 1);
    if (pc !== core) return lead + replacePhrases(pc) + trail;
    var rep = replacePhrases(core);
    if (rep !== core) return lead + rep + trail;
    var dated = translateDates(core);
    if (dated !== core) return lead + dated + trail;
    return raw;
  }

  function replacePhrases(s) {
    var out = s;
    for (var i = 0; i < phrases.length; i++) {
      var k = phrases[i][0];
      if (out.indexOf(k) !== -1) out = out.split(k).join(phrases[i][1]);
    }
    return out;
  }

  /* ---------- DOM ---------- */
  var textState = new WeakMap(); /* Text → { orig, tr } */
  var attrState = new WeakMap(); /* Element → { attr: { orig, tr } } */
  var applying = false;

  function excluded(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return true;
    if (SKIP_TAGS[el.tagName] || SKIP_TAGS[String(el.tagName).toUpperCase()]) return true;
    return !!(el.closest && el.closest(EXCLUDE_SELECTOR));
  }

  function applyText(node) {
    var rec = textState.get(node);
    var cur = node.nodeValue;
    if (rec && cur === rec.tr) {
      if (lang === "es") {
        node.nodeValue = rec.orig;
        textState.delete(node);
      }
      return;
    }
    if (lang !== "en") return;
    if (!cur || !cur.trim()) return;
    var tr = t(cur);
    if (tr !== cur) {
      textState.set(node, { orig: cur, tr: tr });
      node.nodeValue = tr;
    } else if (rec) {
      textState.delete(node);
    }
  }

  function applyAttrs(el) {
    var store = attrState.get(el);
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute(a)) continue;
      var cur = el.getAttribute(a);
      var rec = store && store[a];
      if (rec && cur === rec.tr) {
        if (lang === "es") {
          el.setAttribute(a, rec.orig);
          delete store[a];
        }
        continue;
      }
      if (lang !== "en" || !cur) continue;
      var tr = t(cur);
      if (tr !== cur) {
        if (!store) {
          store = {};
          attrState.set(el, store);
        }
        store[a] = { orig: cur, tr: tr };
        el.setAttribute(a, tr);
      }
    }
    /* Botones input[type=button|submit] */
    if (el.tagName === "INPUT" && /^(button|submit|reset)$/i.test(el.type || "") && el.value) {
      var rv = store && store.value;
      if (!(rv && el.value === rv.tr)) {
        if (lang === "en") {
          var tv = t(el.value);
          if (tv !== el.value) {
            if (!store) { store = {}; attrState.set(el, store); }
            store.value = { orig: el.value, tr: tv };
            el.value = tv;
          }
        }
      } else if (lang === "es") {
        el.value = rv.orig;
        delete store.value;
      }
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      if (!excluded(root)) applyText(root);
      return;
    }
    if (root.nodeType !== 1 || excluded(root)) return;
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeType === 1) {
          if (n.tagName === "TEXTAREA") { if (!n.matches(EXCLUDE_SELECTOR) && !n.closest(EXCLUDE_SELECTOR)) applyAttrs(n); return NodeFilter.FILTER_REJECT; }
          if (SKIP_TAGS[n.tagName] || (n.matches && n.matches(EXCLUDE_SELECTOR))) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    applyAttrs(root);
    var n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) applyText(n);
      else applyAttrs(n);
    }
  }

  function restoreAll() {
    /* Recorre el documento y deshace cualquier traducción registrada */
    applying = true;
    try {
      var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      var n;
      while ((n = tw.nextNode())) {
        if (n.nodeType === 3) applyText(n);
        else applyAttrs(n);
      }
    } finally {
      applying = false;
    }
  }

  var pending = new Set();
  var scheduled = false;
  function flush() {
    scheduled = false;
    if (lang !== "en") { pending.clear(); return; }
    applying = true;
    try {
      pending.forEach(function (n) {
        if (n.isConnected) walk(n);
      });
    } finally {
      pending.clear();
      applying = false;
    }
  }
  function queue(n) {
    pending.add(n);
    if (!scheduled) {
      scheduled = true;
      setTimeout(flush, 30);
    }
  }

  var observer = null;
  function startObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (muts) {
      if (applying || lang !== "en") return;
      muts.forEach(function (m) {
        if (m.type === "childList") {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType === 1 || n.nodeType === 3) queue(n);
          });
        } else if (m.type === "characterData") {
          queue(m.target);
        } else if (m.type === "attributes") {
          queue(m.target);
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  /* ---------- API pública ---------- */
  function setLang(next) {
    next = next === "en" ? "en" : "es";
    if (next === lang) { syncToggle(); return; }
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute("data-portal-lang", lang);
    if (lang === "en") {
      startObserver();
      applying = true;
      try { walk(document.body); } finally { applying = false; }
    } else {
      restoreAll();
    }
    syncToggle();
    try { window.dispatchEvent(new CustomEvent("portal-lang-change", { detail: { lang: lang } })); } catch (e) {}
  }

  /* ---------- Selector ES | EN en el menú lateral ---------- */
  function syncToggle() {
    document.querySelectorAll("[data-portal-lang-option]").forEach(function (b) {
      var on = b.getAttribute("data-portal-lang-option") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function mountToggle() {
    var bar = document.querySelector(".sidebar-account-toolbar");
    if (!bar || bar.querySelector(".lang-toggle--portal")) return;
    var wrap = document.createElement("div");
    wrap.className = "lang-toggle lang-toggle--portal";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", lang === "en" ? "Portal language" : "Idioma del portal");
    wrap.setAttribute("data-no-i18n", "");
    wrap.innerHTML =
      '<button type="button" class="lang-option" data-portal-lang-option="es" title="Español">ES</button>' +
      '<button type="button" class="lang-option" data-portal-lang-option="en" title="English">EN</button>';
    wrap.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-portal-lang-option]");
      if (!b) return;
      setLang(b.getAttribute("data-portal-lang-option"));
      wrap.setAttribute("aria-label", lang === "en" ? "Portal language" : "Idioma del portal");
    });
    var themeToggle = bar.querySelector(".theme-toggle");
    if (themeToggle && themeToggle.nextSibling) bar.insertBefore(wrap, themeToggle.nextSibling);
    else bar.insertBefore(wrap, bar.firstChild);
    syncToggle();
  }

  function init() {
    buildDict();
    document.documentElement.setAttribute("data-portal-lang", lang);
    mountToggle();
    if (lang === "en") {
      startObserver();
      applying = true;
      try { walk(document.body); } finally { applying = false; }
    }
    /* El menú lateral puede montarse más tarde */
    var tries = 0;
    var iv = setInterval(function () {
      mountToggle();
      if (++tries > 40 || document.querySelector(".lang-toggle--portal")) clearInterval(iv);
    }, 500);
  }

  window.PortalI18n = {
    t: t,
    setLang: setLang,
    getLang: function () { return lang; },
    refresh: function () { if (lang === "en") queue(document.body); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
