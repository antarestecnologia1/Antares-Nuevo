/**
 * Reglas y utilidades de validación / saneamiento compartidas (portal + sitio público).
 * Expone `window.AntaresValidation` para uso desde app.js y otros bundles sin ES modules.
 */
(function antaresValidationModule() {
  "use strict";

  const MSG = {
    email: "Ingrese un correo electrónico válido (ejemplo: nombre@empresa.com).",
    phone: "Ingrese un número telefónico válido según el país seleccionado.",
    coMobile: "El celular en Colombia debe ser móvil (10 dígitos nacionales, empieza por 3).",
    required: "Este campo es obligatorio.",
    minLen: (n) => `Escriba al menos ${n} caracteres.`,
    maxLen: (n) => `Máximo ${n} caracteres.`,
    percent: "El porcentaje debe estar entre 0 y 100.",
    money: "Ingrese un valor monetario válido (solo números; use coma o punto para decimales).",
    int: "Solo se permiten números enteros.",
    decimal: "Solo se permiten números (use coma o punto para decimales).",
    personName: "Use solo letras, espacios y caracteres habituales en nombres (sin números ni símbolos raros).",
    alnumDoc: "Use solo letras, números y los separadores permitidos para documentos.",
    date: "Ingrese una fecha válida (formato DD/MM/AAAA).",
    nit: "El NIT debe tener formato 900123456 o 900123456-7.",
    cc: "La cédula CC debe tener entre 6 y 10 dígitos.",
    ce: "La cédula CE debe tener entre 6 y 12 dígitos.",
    pas: "El pasaporte debe ser alfanumérico (5-20 caracteres).",
    docGeneric: "Documento no válido para el tipo seleccionado.",
    phoneLoose: "El teléfono debe tener entre 7 y 15 dígitos.",
    numberRange: "El valor numérico no está en el rango permitido."
  };

  const RE_EMAIL =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  const RE_PERSON_NAME = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀÈÌÒÙàèìòùÂÊÎÔÛâêîôûÄËÏÖÜäëïöüÇç\s'.-]{1,200}$/;
  const RE_STRIP_PERSON_NAME = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñÀÈÌÒÙàèìòùÂÊÎÔÛâêîôûÄËÏÖÜäëïöüÇç\s'.-]/g;
  const RE_ALNUM_DOC = /^[A-Za-z0-9.\-\s]{1,64}$/;
  const RE_STRIP_ALNUM_DOC = /[^A-Za-z0-9.\-\s]/g;
  const RE_DIGITS = /[^\d]/g;
  const RE_DECIMAL_CLEAN = /[^\d.,-]/g;

  const liveRoots = new WeakSet();

  function normalizeEmail(raw) {
    return String(raw ?? "")
      .trim()
      .toLowerCase();
  }

  /** Sin tildes (ñ → n). No usar en contraseñas. */
  function normalizeLatinForDb(value) {
    if (value == null) return "";
    return String(value)
      .trim()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N");
  }

  /** Alineado con app.js / API: MAYÚSCULAS + sin tildes. No usar en contraseñas ni catálogo departamento/ciudad. */
  function normalizeLatinUpperForDb(value) {
    const t = normalizeLatinForDb(value);
    return t ? t.toUpperCase() : "";
  }

  const PRESERVE_CASE_PAYLOAD_KEYS = new Set([
    "reason",
    "motivo",
    "body",
    "subject",
    "experience",
    "redirectto",
    "turnstiletoken"
  ]);

  /** Selects, UUIDs y enums: solo trim/NUL (no MAYÚSCULAS forzadas). */
  const TRIM_ONLY_PAYLOAD_KEYS = new Set([
    "role",
    "status",
    "registrationkind",
    "accountstatus",
    "paidby",
    "documenttype",
    "persontype",
    "gender",
    "interventiontype",
    "type",
    "ratescope",
    "refrigerated",
    "hasgps",
    "modality",
    "workerrole",
    "contracttype",
    "absencetype",
    "recordtype",
    "followupstatus",
    "servicetype",
    "operationtype",
    "operationfrequency",
    "startwindow",
    "twofactorenabled",
    "acceptterms",
    "maritalstatus",
    "educationlevel",
    "bloodtype",
    "licensecategory",
    "platformreferencemode",
    "platformreferenceyear",
    "requiresthermoking",
    "requiredtrucktype",
    "companykind",
    "hasillness",
    "defensivecourse",
    "pickuptime",
    "deliverytime",
    "pickupdate",
    "deliverydate",
    "documenttype",
    "licensecategory",
    "eps",
    "arl",
    "pensionfund",
    "bankaccount",
    "supportnumber"
  ]);

  /** Valores sí/no de selects: conservar minúsculas. */
  const LOWERCASE_ENUM_VALUES_KEYS = new Set([
    "requiresthermoking",
    "refrigerated",
    "hasgps",
    "hasillness",
    "twofactorenabled",
    "acceptterms"
  ]);

  function stripNulTrimValue(value) {
    return String(value ?? "")
      .replace(/\u0000/g, "")
      .trim();
  }

  function isPasswordPayloadKey(key) {
    const k = String(key || "").trim();
    if (!k) return false;
    if (k === "password" || k === "passwordHash" || k === "passwordConfirm" || k === "confirmPassword") return true;
    const lower = k.toLowerCase();
    return lower.includes("password") || lower.includes("contrasena");
  }

  /** Normaliza strings de payloads de formularios de alta/edición antes de guardar en BD. */
  function normalizePayloadTextFields(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
    const out = { ...payload };
    for (const [k, v] of Object.entries(out)) {
      if (isPasswordPayloadKey(k)) continue;
      if (typeof v !== "string") continue;
      const keyLc = k.toLowerCase();
      if (
        PRESERVE_CASE_PAYLOAD_KEYS.has(keyLc) ||
        keyLc.endsWith("reason") ||
        keyLc.endsWith("motivo") ||
        keyLc.includes("justification") ||
        keyLc.endsWith("justification")
      ) {
        out[k] = sanitizeMultiline(v, 8000);
        continue;
      }
      if (keyLc === "email" || keyLc.endsWith("email")) {
        out[k] = normalizeEmail(v);
        continue;
      }
      if (
        TRIM_ONLY_PAYLOAD_KEYS.has(keyLc) ||
        keyLc.endsWith("id") ||
        keyLc.endsWith("at") ||
        keyLc.endsWith("token") ||
        keyLc.includes("password")
      ) {
        out[k] = LOWERCASE_ENUM_VALUES_KEYS.has(keyLc) ? stripNulTrimValue(v).toLowerCase() : stripNulTrimValue(v);
        continue;
      }
      if (
        keyLc === "department" ||
        keyLc === "city" ||
        keyLc === "departamento" ||
        keyLc === "ciudad" ||
        keyLc.endsWith("department") ||
        keyLc.endsWith("city")
      ) {
        out[k] = normalizeLatinForDb(v);
        continue;
      }
      if (keyLc.includes("notes") || keyLc === "message" || keyLc === "requirements" || keyLc === "description") {
        const m = sanitizeMultiline(v, 8000);
        out[k] = m ? normalizeLatinUpperForDb(m) : "";
        continue;
      }
      out[k] = normalizeLatinUpperForDb(v);
    }
    return out;
  }

  function applyDomFormPatch(form, patch) {
    if (!form || !patch || typeof patch !== "object") return;
    for (const [name, val] of Object.entries(patch)) {
      if (!name) continue;
      const el = form.elements?.namedItem?.(name);
      if (!el) continue;
      if (el instanceof RadioNodeList) {
        for (const node of el) {
          if (node instanceof HTMLInputElement && node.value === val) node.checked = true;
        }
        continue;
      }
      if ("value" in el && typeof val === "string") {
        if (el.classList?.contains("portal-date-dmy") || el.getAttribute("data-antares-field") === "date-dmy") {
          portalDateInputSetIso(el, val);
        } else if ("value" in el) {
          el.value = val;
        }
      }
    }
  }

  function readNormalizedFormObject(form) {
    if (!form) return {};
    decorateFormFields(form);
    const result = validateDomForm(form);
    if (!result.ok) return null;
    applyDomFormPatch(form, result.patch);
    const raw = Object.fromEntries(new FormData(form).entries());
    return normalizePayloadTextFields(raw);
  }

  function isValidEmail(raw) {
    const s = normalizeEmail(raw);
    if (!s || s.length > 320) return false;
    return RE_EMAIL.test(s);
  }

  function validateColombianDocument(docType, rawValue) {
    const type = String(docType || "").toUpperCase();
    const base = String(rawValue || "").trim();
    const compact = base.replace(/[.\s]/g, "");
    if (!compact) return { ok: false, message: MSG.required, normalized: "" };
    if (type === "CC") {
      const ok = /^\d{6,10}$/.test(compact);
      return { ok, message: ok ? "" : MSG.cc, normalized: compact };
    }
    if (type === "CE") {
      const ok = /^\d{6,12}$/.test(compact);
      return { ok, message: ok ? "" : MSG.ce, normalized: compact };
    }
    if (type === "NIT") {
      const ok = /^\d{8,10}(-\d)?$/.test(compact);
      return { ok, message: ok ? "" : MSG.nit, normalized: compact };
    }
    if (type === "PAS") {
      const ok = /^[A-Za-z0-9]{5,20}$/.test(compact);
      return { ok, message: ok ? "" : MSG.pas, normalized: compact.toUpperCase() };
    }
    return { ok: compact.length >= 5, message: MSG.docGeneric, normalized: compact };
  }

  function isValidIsoDate(s) {
    const t = String(s || "").trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return false;
    const [y, mo, d] = t.split("-").map((x) => Number(x));
    const dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
  }

  function formatIsoDateToDmy(iso) {
    const ymd = isValidIsoDate(iso) ? String(iso).trim().slice(0, 10) : "";
    if (!ymd) return "";
    const [y, mo, d] = ymd.split("-");
    return `${d}/${mo}/${y}`;
  }

  function parseDmyToIsoDate(raw) {
    const s = String(raw ?? "").trim();
    if (!s) return "";
    if (isValidIsoDate(s)) return s.slice(0, 10);
    const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (!m) return "";
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return isValidIsoDate(iso) ? iso : "";
  }

  function isValidDmyDate(raw) {
    return Boolean(parseDmyToIsoDate(raw));
  }

  let portalDateUidSeq = 0;

  function findPortalDateIsoHidden(visibleEl) {
    if (!visibleEl?.parentElement) return null;
    const key = String(visibleEl.dataset.portalDateUid || "");
    if (!key) return null;
    return visibleEl.parentElement.querySelector(
      `input[type="hidden"][data-portal-date-iso="1"][data-portal-date-for="${key}"]`
    );
  }

  function portalDateInputValueIso(visibleEl) {
    if (!visibleEl) return "";
    if (String(visibleEl.type || "").toLowerCase() === "date") {
      return String(visibleEl.value || "").trim().slice(0, 10);
    }
    const fromVisible = parseDmyToIsoDate(visibleEl.value);
    if (fromVisible) return fromVisible;
    const hidden = findPortalDateIsoHidden(visibleEl);
    if (hidden?.value && isValidIsoDate(hidden.value)) return String(hidden.value).trim().slice(0, 10);
    const attr = visibleEl.getAttribute("data-portal-date-iso-value");
    if (attr && isValidIsoDate(attr)) return String(attr).trim().slice(0, 10);
    return "";
  }

  function portalDateInputSetIso(visibleEl, iso) {
    if (!visibleEl) return;
    const ymd = isValidIsoDate(iso) ? String(iso).trim().slice(0, 10) : "";
    if (String(visibleEl.type || "").toLowerCase() === "date") {
      visibleEl.value = ymd;
      return;
    }
    const hidden = findPortalDateIsoHidden(visibleEl);
    if (hidden) hidden.value = ymd;
    visibleEl.setAttribute("data-portal-date-iso-value", ymd);
    visibleEl.value = ymd ? formatIsoDateToDmy(ymd) : "";
  }

  function cssEscapePortal(s) {
    const t = String(s ?? "");
    return typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape(t)
      : t.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  /** Campo visible DMY o `type="date"` nativo dentro de un formulario o contenedor. */
  function findPortalDateVisibleInForm(root, fieldNameOrId) {
    if (!root?.querySelector || !fieldNameOrId) return null;
    const esc = cssEscapePortal(fieldNameOrId);
    const hidden = root.querySelector(
      `input[type="hidden"][name="${esc}"][data-portal-date-iso="1"]`
    );
    if (hidden?.previousElementSibling?.classList?.contains("portal-date-dmy")) {
      return hidden.previousElementSibling;
    }
    const byName = root.querySelector(`input[name="${esc}"]`);
    if (byName?.classList?.contains("portal-date-dmy")) return byName;
    if (byName && String(byName.type || "").toLowerCase() === "date") return byName;
    const byId = root.querySelector(`#${esc}`);
    if (byId?.classList?.contains("portal-date-dmy")) return byId;
    if (byId && String(byId.type || "").toLowerCase() === "date") return byId;
    return byName || byId;
  }

  /** Asigna una fecha ISO (YYYY-MM-DD) por `name` o `id`, sincronizando visible DMY e input oculto. */
  function setPortalFormDateByName(form, fieldName, isoYmd) {
    if (!form || !fieldName) return;
    const ymd = isValidIsoDate(isoYmd)
      ? String(isoYmd).trim().slice(0, 10)
      : parseDmyToIsoDate(isoYmd) || "";
    if (!ymd) return;
    const vis = findPortalDateVisibleInForm(form, fieldName);
    if (vis) {
      portalDateInputSetIso(vis, ymd);
      return;
    }
    const esc = cssEscapePortal(fieldName);
    const hidden = form.querySelector(
      `input[type="hidden"][name="${esc}"][data-portal-date-iso="1"]`
    );
    if (hidden) {
      hidden.value = ymd;
      const visAfter = hidden.previousElementSibling;
      if (visAfter?.classList?.contains("portal-date-dmy")) portalDateInputSetIso(visAfter, ymd);
      return;
    }
    let el =
      form.querySelector(`input[name="${esc}"]`) ||
      form.querySelector(`input[type="date"]#${esc}`);
    if (!el) return;
    if (el.classList.contains("portal-date-dmy")) {
      portalDateInputSetIso(el, ymd);
      return;
    }
    if (String(el.type || "").toLowerCase() === "date") {
      el.value = ymd;
      mountPortalDateDmyInput(el);
      portalDateInputSetIso(el, ymd);
      return;
    }
    el.value = ymd;
  }

  function setPortalFormDateById(root, elementId, isoYmd) {
    if (!root || !elementId) return;
    setPortalFormDateByName(root, elementId, isoYmd);
  }

  function syncPortalDateHiddenFromVisible(visibleEl) {
    const iso = parseDmyToIsoDate(visibleEl?.value);
    const hidden = findPortalDateIsoHidden(visibleEl);
    if (hidden) hidden.value = iso;
    if (iso) visibleEl.setAttribute("data-portal-date-iso-value", iso);
    else visibleEl.removeAttribute("data-portal-date-iso-value");
    if (iso && visibleEl.value) visibleEl.value = formatIsoDateToDmy(iso);
    return iso;
  }

  function formatDmyTypingMask(raw) {
    const digits = String(raw ?? "").replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function shouldKeepNativeDateInput(el) {
    if (!el) return false;
    if (String(el.dataset?.portalDateDmy || "") === "1") return false;
    if (String(el.dataset?.portalDateNative || "") === "1") return true;
    const n = String(el.name || "").trim().toLowerCase();
    const i = String(el.id || "").trim().toLowerCase();
    if (n === "pickupdate" || n === "deliverydate" || i === "pickup-date" || i === "delivery-date") return true;
    return true;
  }

  function mountPortalDateDmyInput(el) {
    if (!el || el.dataset.portalDateDmyMounted === "1") return el;
    if (String(el.type || "").toLowerCase() !== "date") return el;
    if (shouldKeepNativeDateInput(el)) return el;

    const fieldName = String(el.name || "").trim();
    const isoSeed = String(el.value || "").trim().slice(0, 10);
    const minIso = String(el.getAttribute("min") || "").trim();
    const maxIso = String(el.getAttribute("max") || "").trim();
    const uid = `pd-${++portalDateUidSeq}`;

    el.type = "text";
    el.classList.add("portal-date-dmy");
    el.autocomplete = "off";
    el.inputMode = "numeric";
    el.maxLength = 10;
    el.placeholder = "DD/MM/AAAA";
    el.dataset.portalDateDmyMounted = "1";
    el.dataset.portalDateUid = uid;
    el.setAttribute("data-antares-field", "date-dmy");
    el.setAttribute("data-antares-validate-blur", "date-dmy");
    el.setAttribute("data-antares-restrict", "date-dmy");
    if (minIso) el.dataset.antaresDateMin = minIso;
    if (maxIso) el.dataset.antaresDateMax = maxIso;
    el.removeAttribute("min");
    el.removeAttribute("max");

    if (fieldName) {
      el.removeAttribute("name");
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = fieldName;
      hidden.value = isValidIsoDate(isoSeed) ? isoSeed : "";
      hidden.dataset.portalDateIso = "1";
      hidden.dataset.portalDateFor = uid;
      el.insertAdjacentElement("afterend", hidden);
    } else if (isValidIsoDate(isoSeed)) {
      el.setAttribute("data-portal-date-iso-value", isoSeed);
    }

    el.value = isValidIsoDate(isoSeed) ? formatIsoDateToDmy(isoSeed) : "";
    return el;
  }

  function parseDatetimeLocalValue(raw) {
    const s = String(raw ?? "").trim();
    const m = s.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
    if (!m) return { dateIso: "", time: "" };
    return { dateIso: m[1], time: `${m[2]}:${m[3]}` };
  }

  function composeDatetimeLocalIso(dateIso, timeHHmm) {
    const d = isValidIsoDate(dateIso) ? String(dateIso).trim().slice(0, 10) : "";
    const t = String(timeHHmm || "").trim();
    if (!d || !/^\d{2}:\d{2}$/.test(t)) return "";
    return `${d}T${t}`;
  }

  function findPortalDatetimeHidden(wrap) {
    if (!wrap) return null;
    return wrap.querySelector('input[type="hidden"][data-portal-datetime-iso="1"]');
  }

  function portalDatetimeInputValueIso(host) {
    if (!host) return "";
    if (String(host.type || "").toLowerCase() === "datetime-local") {
      return String(host.value || "").trim();
    }
    const wrap = host.closest?.(".portal-datetime-dmy-row");
    const hidden = findPortalDatetimeHidden(wrap);
    return String(hidden?.value || "").trim();
  }

  function portalDatetimeInputSetIso(host, iso) {
    if (!host) return;
    const v = String(iso ?? "").trim();
    if (String(host.type || "").toLowerCase() === "datetime-local") {
      host.value = v;
      return;
    }
    const wrap = host.closest?.(".portal-datetime-dmy-row");
    if (!wrap) return;
    const hidden = findPortalDatetimeHidden(wrap);
    const { dateIso, time } = parseDatetimeLocalValue(v);
    const dateVis = wrap.querySelector(".portal-date-dmy");
    const timeEl = wrap.querySelector(".portal-datetime-dmy__time");
    if (dateVis) portalDateInputSetIso(dateVis, dateIso);
    if (timeEl) timeEl.value = time || "";
    if (hidden) hidden.value = composeDatetimeLocalIso(dateIso, time || timeEl?.value) || "";
  }

  function wirePortalDatetimeRow(wrap) {
    const sync = () => {
      const hidden = findPortalDatetimeHidden(wrap);
      if (!hidden) return;
      const dateVis = wrap.querySelector(".portal-date-dmy");
      const timeEl = wrap.querySelector(".portal-datetime-dmy__time");
      const isoDate = portalDateInputValueIso(dateVis);
      const time = String(timeEl?.value || "").trim().slice(0, 5);
      hidden.value = composeDatetimeLocalIso(isoDate, time);
    };
    wrap.querySelector(".portal-date-dmy")?.addEventListener("input", sync);
    wrap.querySelector(".portal-date-dmy")?.addEventListener("blur", sync);
    wrap.querySelector(".portal-datetime-dmy__time")?.addEventListener("input", sync);
    wrap.querySelector(".portal-datetime-dmy__time")?.addEventListener("change", sync);
    sync();
  }

  function mountPortalDatetimeDmyInput(el) {
    if (!el || el.dataset.portalDatetimeDmyMounted === "1") return el;
    if (String(el.type || "").toLowerCase() !== "datetime-local") return el;
    el.dataset.portalDatetimeDmyMounted = "1";

    const fieldName = String(el.name || "").trim();
    const seed = String(el.value || "").trim();
    const { dateIso, time } = parseDatetimeLocalValue(seed);
    const uid = `pdt-${++portalDateUidSeq}`;
    const required = el.required;
    const step = el.getAttribute("step") || "60";
    const min = el.getAttribute("min") || "";
    const max = el.getAttribute("max") || "";

    const wrap = document.createElement("div");
    wrap.className = "portal-datetime-dmy-row";
    wrap.dataset.portalDatetimeDmyMounted = "1";
    wrap.dataset.portalDatetimeUid = uid;

    const dateEl = document.createElement("input");
    dateEl.type = "date";
    dateEl.value = dateIso;
    dateEl.dataset.portalDateDmy = "1";
    if (required) dateEl.required = true;
    if (min) dateEl.min = min.slice(0, 10);
    if (max) dateEl.max = max.slice(0, 10);

    const timeEl = document.createElement("input");
    timeEl.type = "time";
    timeEl.className = "portal-datetime-dmy__time";
    timeEl.step = step;
    timeEl.value = time || "";
    if (required) timeEl.required = true;

    wrap.appendChild(dateEl);
    wrap.appendChild(timeEl);
    mountPortalDateDmyInput(dateEl);

    if (fieldName) {
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = fieldName;
      hidden.dataset.portalDatetimeIso = "1";
      hidden.dataset.portalDatetimeFor = uid;
      hidden.value = seed;
      wrap.appendChild(hidden);
    }

    el.replaceWith(wrap);
    wirePortalDatetimeRow(wrap);
    return wrap;
  }

  function upgradePortalDateFields(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope
      .querySelectorAll('input[type="date"]:not([data-portal-date-dmy-mounted])')
      .forEach((el) => mountPortalDateDmyInput(el));
    scope
      .querySelectorAll('input[type="datetime-local"]:not([data-portal-datetime-dmy-mounted])')
      .forEach((el) => mountPortalDatetimeDmyInput(el));
  }

  /** Tras montar DMY, alinea el visible con el ISO del hidden (p. ej. value="YYYY-MM-DD" en HTML). */
  function resyncPortalDateValuesInRoot(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope
      .querySelectorAll('input[type="hidden"][data-portal-date-iso="1"]')
      .forEach((hidden) => {
        const iso = String(hidden.value || "").trim();
        const vis = hidden.previousElementSibling;
        if (!vis?.classList?.contains("portal-date-dmy")) return;
        if (iso && isValidIsoDate(iso)) portalDateInputSetIso(vis, iso);
      });
    scope.querySelectorAll(".portal-datetime-dmy-row").forEach((wrap) => {
      const hidden = findPortalDatetimeHidden(wrap);
      if (!hidden?.value) return;
      const dateVis = wrap.querySelector(".portal-date-dmy");
      const timeEl = wrap.querySelector(".portal-datetime-dmy__time");
      const { dateIso, time } = parseDatetimeLocalValue(hidden.value);
      if (dateVis && dateIso) portalDateInputSetIso(dateVis, dateIso);
      if (timeEl && time) timeEl.value = time;
    });
  }

  function clearPortalDateInput(el) {
    if (!el) return;
    if (String(el.type || "").toLowerCase() === "hidden" && el.dataset.portalDateIso === "1") {
      const vis = el.previousElementSibling;
      el.value = "";
      if (vis?.classList?.contains("portal-date-dmy")) portalDateInputSetIso(vis, "");
      return;
    }
    portalDateInputSetIso(el, "");
  }

  const upgradePortalDateInputs = upgradePortalDateFields;

  let portalDateObserverInstalled = false;
  let portalDateUpgradeTimer = null;

  function scheduleUpgradePortalDateFields(root) {
    if (typeof window === "undefined") return;
    clearTimeout(portalDateUpgradeTimer);
    portalDateUpgradeTimer = setTimeout(() => {
      const scope = root || document;
      upgradePortalDateFields(scope);
      resyncPortalDateValuesInRoot(scope);
    }, 0);
  }

  function installPortalDateFieldObserver(rootEl) {
    if (portalDateObserverInstalled || typeof MutationObserver === "undefined") return;
    const target = rootEl === document ? document.body : rootEl;
    if (!target) return;
    portalDateObserverInstalled = true;
    const obs = new MutationObserver(() => scheduleUpgradePortalDateFields(document));
    obs.observe(target, { childList: true, subtree: true });
  }

  function parsePercent(raw) {
    const s = String(raw ?? "")
      .trim()
      .replace("%", "")
      .replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    if (n < 0 || n > 100) return null;
    return n;
  }

  /** Acepta "1.234,56" o "1234.56" o "1234,56" → número (COP lógico, sin redondeo especial). */
  function parseMoneyNumber(raw) {
    let s = String(raw ?? "").trim();
    if (!s) return null;
    s = s.replace(/\s/g, "").replace(/[^\d.,-]/g, "");
    const neg = s.startsWith("-");
    if (neg) s = s.slice(1);
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    let norm = s;
    if (lastComma > -1 && lastDot > -1) {
      if (lastComma > lastDot) norm = s.replace(/\./g, "").replace(",", ".");
      else norm = s.replace(/,/g, "");
    } else if (lastComma > -1) {
      const commaCount = (s.match(/,/g) || []).length;
      norm = commaCount > 1 ? s.replace(/,/g, "") : s.replace(/\./g, "").replace(",", ".");
    } else {
      const dotCount = (s.match(/\./g) || []).length;
      norm = dotCount > 1 ? s.replace(/\./g, "") : s.replace(/,/g, "");
    }
    const n = Number(norm);
    if (!Number.isFinite(n)) return null;
    return neg ? -n : n;
  }

  function sanitizeOneLineText(raw, maxLen) {
    let s = String(raw ?? "")
      .replace(/\u0000/g, "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
    return s;
  }

  function sanitizeMultiline(raw, maxLen) {
    let s = String(raw ?? "")
      .replace(/\u0000/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
    s = s.replace(/\n{3,}/g, "\n\n").trim();
    if (maxLen && s.length > maxLen) s = s.slice(0, maxLen);
    return s;
  }

  const FORM_GUARD_SELECTOR =
    'form.p-form, form[id^="form-"], form.auth-form, form.auth-register-form, form.contact-form-premium, form.modal-edit-form, form.hr-form-flow, #b2b-form, form.calendar-filters-bar, form.history-filter-form, form.history-fleet-filter-form, form.history-fleet-create-form, form.payroll-data-toolbar-filters, form.transport-route-form, form.assign-trip-form, form.create-trip-form, form.profile-form, form.payroll-legal-form';

  /** Nombres de campo → reglas Antares (solo si el input aún no tiene `data-antares-field`). */
  const FIELD_NAME_RULES = [
    { re: /^email$/i, attrs: { field: "email", blur: "email", restrict: "email-local" } },
    {
      re: /^(firstName|lastName|middleName|secondLastName|legalRep|contactName|siteContactName|emergencyContact|emergencyRelation)$/i,
      attrs: { field: "person-name", blur: "person-name", restrict: "person-name" }
    },
    { re: /^name$/i, attrs: { field: "person-name", blur: "person-name", restrict: "person-name" } },
    {
      re: /^(company|position|workArea|costCenter|brand|model|type|color|bodyType|fuelType|axleConfig|ownershipCard|gpsProvider|station|provider|recordType|documentCode|eps|arl|bloodType|maritalStatus|educationLevel|illnessDescription|title|departmentName|positionName|modality|workerRole)$/i,
      attrs: { field: "db-upper", blur: "db-upper" }
    },
    {
      re: /^(address|originAddress|destinationAddress|cargoDescription|legalRep|contactName|siteContactName|rcPolicyContract|rcPolicyExtra|engineNumber)$/i,
      attrs: { field: "db-upper", blur: "db-upper" }
    },
    {
      re: /^(department|city|departamento|ciudad)$/i,
      attrs: { field: "catalog", blur: "catalog" },
      skip: (el) => el.tagName === "SELECT"
    },
    { re: /^(taxId|idDoc)$/i, attrs: { field: "doc", restrict: "alnum-doc" } },
    { re: /^(companyNit|nit)$/i, attrs: { field: "nit", restrict: "alnum-doc" } },
    { re: /^personalTaxId$/i, attrs: { field: "doc", restrict: "alnum-doc" } },
    {
      re: /phone/i,
      attrs: { blur: "phone-loose", restrict: "digits" },
      skip: (el) => el.matches(".js-b2b-phone-national, .js-register-phone-national")
    },
    {
      /** Solo nombres de importe; no usar `cost` suelto (rompe `costCenter`). */
      re: /^(baseSalary|transportAllowance|tripValue|tripRateCop|totalCost|fuelReimbursement|insuredValue|distanceKm|weightKg|capacityKg|fuelles|openings|experienceYears|expectedSalary|salaryOffer|extras|aux|primaServicios|interesesCesantias|vacationDays|days360|primaProp|contractDurationAmount|amount|price|value|bonus|liters|odometerKm|salary|cop)$/i,
      attrs: { blur: "decimal", restrict: "decimal" }
    },
    { re: /^(plate|vin)$/i, attrs: { restrict: "alnum-doc" } },
    { re: /^(pickupDate|deliveryDate|birthDate|documentIssuedAt|dueDate|startDate|contractVigenteStartDate|endDate|deadline|when|soat|techInspection|rcPolicyExpiry)/i, attrs: { blur: "date-iso" } },
    { re: /^q$/i, attrs: { max: 200 } },
    { re: /^(notes|message|requirements|description)$/i, attrs: { field: "db-upper-multiline", blur: "db-upper-multiline" } },
    { re: /^(reason|motivo)$/i, attrs: { field: "preserve-text", blur: "preserve-text", max: 4000 } },
    { re: /^(experience|content|subject|body)$/i, attrs: { field: "preserve-text", blur: "preserve-text", max: 12000 } }
  ];

  function applyFieldRuleAttrs(el, attrs) {
    if (!el || !attrs) return;
    if (attrs.field && !el.getAttribute("data-antares-field")) el.setAttribute("data-antares-field", attrs.field);
    if (attrs.blur && !el.getAttribute("data-antares-validate-blur")) el.setAttribute("data-antares-validate-blur", attrs.blur);
    if (attrs.restrict && !el.getAttribute("data-antares-restrict")) el.setAttribute("data-antares-restrict", attrs.restrict);
    if (attrs.max != null && !el.getAttribute("data-antares-max")) el.setAttribute("data-antares-max", String(attrs.max));
  }

  function resolveFieldRules(name, el) {
    const n = String(name || "");
    const tagName = String(el?.tagName || "").toUpperCase();
    if (el?.classList?.contains("portal-date-dmy")) {
      return { field: "date-dmy", blur: "date-dmy", restrict: "date-dmy" };
    }
    /** Clave de catálogo (`ruta@@empresas`), no un importe — no aplicar reglas numéricas. */
    if (n === "tripRateChoice" || n === "costCenter" || el?.getAttribute?.("data-antares-skip-validate") === "1") {
      if (n === "costCenter") return { field: "db-upper", blur: "db-upper" };
      return null;
    }
    for (const rule of FIELD_NAME_RULES) {
      if (rule.skip && rule.skip(el)) continue;
      if (rule.re.test(n)) {
        if (tagName === "SELECT") {
          const blur = rule.attrs?.blur;
          const field = rule.attrs?.field;
          if (blur === "decimal" || rule.attrs?.restrict === "decimal") return null;
          if (blur === "db-upper" || field === "db-upper") return null;
          if (blur === "person-name" || field === "person-name") return null;
          if (blur === "catalog" || field === "catalog") return null;
        }
        return rule.attrs;
      }
    }
    const type = String(el.type || "").toLowerCase();
    if (type === "email") return { field: "email", blur: "email", restrict: "email-local" };
    if (type === "date") {
      if (shouldKeepNativeDateInput(el)) return { field: "date-iso", blur: "date-iso" };
      return { field: "date-dmy", blur: "date-dmy" };
    }
    if (type === "number") return { blur: "decimal", restrict: "decimal" };
    return null;
  }

  function isInsideHiddenSection(el, form) {
    let node = el.parentElement;
    while (node && node !== form) {
      if (node.hidden) return true;
      if (node.id === "register-doc-persona" && node.classList.contains("hidden")) return true;
      if (node.id === "register-doc-empresa" && node.classList.contains("hidden")) return true;
      if (node.id === "emp-illness-detail-label" && node.classList.contains("hidden")) return true;
      /* Pasos del asistente RRHH: solo tienen clase `hidden` (no siempre el atributo HTML `hidden`). */
      if (node.classList?.contains("hr-form-step") && node.classList?.contains("hidden")) return true;
      if (
        (node.id === "emp-contract-duration-block" || node.id === "emp-edit-contract-duration-block") &&
        (node.hidden || node.classList.contains("hidden"))
      ) {
        return true;
      }
      if (node.classList?.contains("emp-contract-duration-branch") && (node.hidden || node.classList.contains("hidden"))) {
        return true;
      }
      if (node.classList?.contains("request-truck-field") && node.hidden) return true;
      if (node.classList?.contains("hidden") && !node.classList?.contains("hr-form-step")) return true;
      node = node.parentElement;
    }
    return false;
  }

  function shouldValidateField(el, form) {
    if (!el || el.disabled || el.readOnly) return false;
    if (el.closest("[data-antares-skip-validate]")) return false;
    if (el.matches(".js-b2b-phone-national, .js-register-phone-national")) return false;
    if (el.type === "hidden" && el.name === "phone") return false;
    if (el.type === "hidden" || el.type === "file" || el.type === "checkbox" || el.type === "radio") return false;
    if (isInsideHiddenSection(el, form)) return false;
    return true;
  }

  function decorateFormFields(form) {
    if (!form || typeof form.querySelectorAll !== "function") return;
    const fields = form.querySelectorAll("input, select, textarea");
    fields.forEach((el) => {
      if (!el.name && !el.id) return;
      const name = el.name || el.id;
      if (name === "company" || name === "position" || name === "workArea" || name === "costCenter") {
        applyFieldRuleAttrs(el, { field: "db-upper", blur: "db-upper", max: name === "costCenter" ? 64 : 255 });
        el.removeAttribute("data-antares-restrict");
        return;
      }
      if (name === "cargoDescription") {
        applyFieldRuleAttrs(el, { field: "db-upper", blur: "db-upper", max: 500 });
        return;
      }
      if (name === "address" || name === "originAddress" || name === "destinationAddress") {
        applyFieldRuleAttrs(el, { field: "db-upper", blur: "db-upper", max: 500 });
        return;
      }
      if (name === "notes") {
        applyFieldRuleAttrs(el, { field: "db-upper-multiline", blur: "db-upper-multiline", max: 2000 });
        return;
      }
      if (name === "message") {
        applyFieldRuleAttrs(el, { field: "db-upper-multiline", blur: "db-upper-multiline", max: 8000 });
        return;
      }
      const rules = resolveFieldRules(name, el);
      if (rules) applyFieldRuleAttrs(el, rules);
      if (el.tagName === "SELECT" && el.required && !el.getAttribute("data-antares-validate-blur")) {
        el.setAttribute("data-antares-validate-blur", "required-select");
      }
    });
    upgradePortalDateFields(form);
    form.setAttribute("data-antares-decorated", "1");
  }

  function prepareFormsInRoot(root) {
    const scope = root && root.querySelectorAll ? root : document;
    upgradePortalDateFields(scope);
    resyncPortalDateValuesInRoot(scope);
    const decorated = new Set();
    scope.querySelectorAll(FORM_GUARD_SELECTOR).forEach((form) => {
      decorateFormFields(form);
      decorated.add(form);
    });
    scope.querySelectorAll("form").forEach((form) => {
      if (decorated.has(form)) return;
      if (form.querySelector('input[type="date"], input[type="datetime-local"], .portal-date-dmy')) {
        decorateFormFields(form);
      }
    });
  }

  let submitGuardInstalled = false;

  function installFormSubmitGuard(root, options) {
    const rootEl = root && root.addEventListener ? root : document;
    if (submitGuardInstalled && rootEl === document) return;
    if (rootEl === document) submitGuardInstalled = true;
    const onInvalid =
      typeof options?.onInvalid === "function"
        ? options.onInvalid
        : (form, firstInvalid) => {
            try {
              firstInvalid?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
            } catch (_e) {
              /* noop */
            }
            firstInvalid?.focus?.();
          };

    rootEl.addEventListener(
      "submit",
      (ev) => {
        const form = ev.target;
        if (!(form instanceof HTMLFormElement)) return;
        if (form.getAttribute("data-antares-no-guard") === "1") return;
        if (form.dataset.submitGuardWired === "1" || form.dataset.crudSubmitGuardWired === "1") return;
        if (!form.matches(FORM_GUARD_SELECTOR)) return;
        decorateFormFields(form);
        const result = validateDomForm(form);
        if (!result.ok) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          onInvalid(form, result.firstInvalid);
          return;
        }
        applyDomFormPatch(form, result.patch);
      },
      true
    );
  }

  function findFieldErrorMount(field) {
    if (!field) return null;
    return (
      field.closest("label") ||
      field.closest(".auth-field-stack") ||
      field.closest("[data-antares-field-wrap]") ||
      field.parentElement
    );
  }

  function clearFieldError(field) {
    if (!field) return;
    field.classList.remove("field-invalid");
    field.removeAttribute("aria-invalid");
    const mount = findFieldErrorMount(field);
    const error = mount?.querySelector(".field-error");
    if (error) error.remove();
  }

  function setFieldError(field, message) {
    if (!field) return;
    const mount = findFieldErrorMount(field);
    if (!mount) return;
    clearFieldError(field);
    field.classList.add("field-invalid");
    field.setAttribute("aria-invalid", "true");
    const hint = document.createElement("small");
    hint.className = "field-error";
    hint.textContent = message;
    mount.appendChild(hint);
  }

  function applyRestrictToValue(el, mode) {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    let v = el.value;
    let next = v;
    if (mode === "digits" || mode === "int") {
      next = v.replace(RE_DIGITS, "");
      if (mode === "int") next = next.replace(/^0+(\d)/, "$1");
    } else if (mode === "decimal") {
      next = v.replace(RE_DECIMAL_CLEAN, "");
      const parts = next.split(/[.,]/);
      if (parts.length > 2) {
        const dec = parts.pop();
        next = parts.join("") + "." + dec;
      }
    } else if (mode === "percent") {
      next = v.replace(/[^\d.,%-]/g, "").replace("%", "");
      const n = parsePercent(next.replace(",", "."));
      if (next && n === null && !/^[\d.,]+$/.test(next)) next = next.slice(0, -1);
    } else if (mode === "money-cop") {
      next = v.replace(/[^\d.,\s]/g, "");
    } else if (mode === "person-name") {
      next = v.replace(RE_STRIP_PERSON_NAME, "");
    } else if (mode === "alnum-doc") {
      next = v.replace(RE_STRIP_ALNUM_DOC, "");
    } else if (mode === "email-local") {
      next = v.replace(/[^\w.@+-]/gi, "");
    } else if (mode === "date-dmy") {
      next = formatDmyTypingMask(v);
    }
    if (next !== v) {
      el.value = next;
      try {
        if (typeof start === "number" && typeof end === "number") el.setSelectionRange(start, end);
      } catch (_e) {
        /* noop */
      }
    }
  }

  function runBlurValidation(el, check) {
    const raw = String(el.value ?? "").trim();
    if (!raw && !el.required) {
      clearFieldError(el);
      return true;
    }
    if (check === "email") {
      if (raw && !isValidEmail(raw)) {
        setFieldError(el, MSG.email);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    if (check === "date-iso" || check === "date-dmy") {
      const iso = check === "date-dmy" ? syncPortalDateHiddenFromVisible(el) : raw;
      if (raw && !isValidIsoDate(iso)) {
        setFieldError(el, MSG.date);
        return false;
      }
      const minIso = String(el.dataset.antaresDateMin || "").trim();
      const maxIso = String(el.dataset.antaresDateMax || "").trim();
      if (iso && minIso && isValidIsoDate(minIso) && iso < minIso) {
        setFieldError(el, `La fecha no puede ser anterior a ${formatIsoDateToDmy(minIso)}.`);
        return false;
      }
      if (iso && maxIso && isValidIsoDate(maxIso) && iso > maxIso) {
        setFieldError(el, `La fecha no puede ser posterior a ${formatIsoDateToDmy(maxIso)}.`);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    if (check === "percent") {
      if (raw && parsePercent(raw) === null) {
        setFieldError(el, MSG.percent);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    if (check === "money-cop") {
      if (raw && parseMoneyNumber(raw) === null) {
        setFieldError(el, MSG.money);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    if (check === "int") {
      if (raw && !/^-?\d+$/.test(raw.replace(/\s/g, ""))) {
        setFieldError(el, MSG.int);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    if (check === "decimal") {
      if (raw && parseMoneyNumber(raw) === null) {
        setFieldError(el, MSG.decimal);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    if (check === "person-name") {
      const s = sanitizeOneLineText(raw, 200);
      if (raw && !RE_PERSON_NAME.test(s)) {
        setFieldError(el, MSG.personName);
        return false;
      }
      if (s && s !== el.value) el.value = normalizeLatinUpperForDb(s);
      clearFieldError(el);
      return true;
    }
    if (check === "db-upper") {
      const maxAttr = Number(el.getAttribute("data-antares-max") || 255);
      const m = Number.isFinite(maxAttr) ? maxAttr : 255;
      const s = sanitizeOneLineText(raw, m);
      if (el.required && !s) {
        setFieldError(el, MSG.required);
        return false;
      }
      if (s) el.value = normalizeLatinUpperForDb(s);
      clearFieldError(el);
      return true;
    }
    if (check === "db-upper-multiline") {
      const maxAttr = Number(el.getAttribute("data-antares-max") || 8000);
      const m = Number.isFinite(maxAttr) ? maxAttr : 8000;
      const s = sanitizeMultiline(raw, m);
      if (el.required && !s) {
        setFieldError(el, MSG.required);
        return false;
      }
      if (s) el.value = normalizeLatinUpperForDb(s);
      clearFieldError(el);
      return true;
    }
    if (check === "catalog") {
      const s = sanitizeOneLineText(raw, 120);
      if (el.required && !s) {
        setFieldError(el, MSG.required);
        return false;
      }
      if (s) el.value = normalizeLatinForDb(s);
      clearFieldError(el);
      return true;
    }
    if (check === "preserve-text") {
      const maxAttr = Number(el.getAttribute("data-antares-max") || 4000);
      const m = Number.isFinite(maxAttr) ? maxAttr : 4000;
      const isTa = String(el.tagName || "").toUpperCase() === "TEXTAREA";
      const s = isTa ? sanitizeMultiline(raw, m) : sanitizeOneLineText(raw, m);
      if (el.required && !s) {
        setFieldError(el, MSG.required);
        return false;
      }
      if (s && s !== el.value) el.value = s;
      clearFieldError(el);
      return true;
    }
    if (check === "alnum-doc") {
      if (raw && !RE_ALNUM_DOC.test(sanitizeOneLineText(raw, 64))) {
        setFieldError(el, MSG.alnumDoc);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    if (check === "phone-loose") {
      const d = raw.replace(/\D/g, "");
      if (raw && (d.length < 7 || d.length > 15)) {
        setFieldError(el, MSG.phoneLoose);
        return false;
      }
      clearFieldError(el);
      return true;
    }
    return true;
  }

  function validateDataAntaresField(el, form) {
    if (String(el.type || "").toLowerCase() === "password") {
      return { ok: true, message: "", patchValue: undefined };
    }
    const kind = String(el.getAttribute("data-antares-field") || "").trim().toLowerCase();
    if (!kind) return { ok: true, message: "", patchValue: undefined };
    const raw = String(el.value ?? "").trim();
    if (el.required && !raw) return { ok: false, message: MSG.required, patchValue: undefined };
    if (!raw) return { ok: true, message: "", patchValue: "" };
    if (kind === "email") {
      if (!isValidEmail(raw)) return { ok: false, message: MSG.email, patchValue: undefined };
      return { ok: true, message: "", patchValue: normalizeEmail(raw) };
    }
    if (kind === "person-name") {
      const s = sanitizeOneLineText(raw, 200);
      if (!RE_PERSON_NAME.test(s)) return { ok: false, message: MSG.personName, patchValue: undefined };
      return { ok: true, message: "", patchValue: normalizeLatinUpperForDb(s) };
    }
    if (kind === "db-upper") {
      const maxAttr = Number(el.getAttribute("data-antares-max") || 255);
      const m = Number.isFinite(maxAttr) ? maxAttr : 255;
      const s = sanitizeOneLineText(raw, m);
      if (!s) return { ok: true, message: "", patchValue: "" };
      return { ok: true, message: "", patchValue: normalizeLatinUpperForDb(s) };
    }
    if (kind === "db-upper-multiline") {
      const maxAttr = Number(el.getAttribute("data-antares-max") || 8000);
      const m = Number.isFinite(maxAttr) ? maxAttr : 8000;
      const s = sanitizeMultiline(raw, m);
      if (!s) return { ok: true, message: "", patchValue: "" };
      return { ok: true, message: "", patchValue: normalizeLatinUpperForDb(s) };
    }
    if (kind === "catalog") {
      const s = sanitizeOneLineText(raw, 120);
      if (!s) return { ok: true, message: "", patchValue: "" };
      return { ok: true, message: "", patchValue: normalizeLatinForDb(s) };
    }
    if (kind === "preserve-text") {
      const maxAttr = Number(el.getAttribute("data-antares-max") || 4000);
      const m = Number.isFinite(maxAttr) ? maxAttr : 4000;
      const isTa = String(el.tagName || "").toUpperCase() === "TEXTAREA";
      const s = isTa ? sanitizeMultiline(raw, m) : sanitizeOneLineText(raw, m);
      return { ok: true, message: "", patchValue: s || "" };
    }
    if (kind === "nit" || kind === "cc" || kind === "ce" || kind === "pas") {
      const r = validateColombianDocument(kind.toUpperCase(), raw);
      if (!r.ok) return { ok: false, message: r.message || MSG.docGeneric, patchValue: undefined };
      return { ok: true, message: "", patchValue: r.normalized };
    }
    if (kind === "doc") {
      const sel = String(el.getAttribute("data-antares-doc-type-selector") || "select[name='documentType']");
      const dt = String(form?.querySelector?.(sel)?.value || "CC").toUpperCase();
      const r = validateColombianDocument(dt, raw);
      if (!r.ok) return { ok: false, message: r.message || MSG.docGeneric, patchValue: undefined };
      return { ok: true, message: "", patchValue: r.normalized };
    }
    if (kind === "date" || kind === "date-iso" || kind === "date-dmy") {
      const iso = kind === "date-dmy" ? parseDmyToIsoDate(raw) : raw;
      if (!isValidIsoDate(iso)) return { ok: false, message: MSG.date, patchValue: undefined };
      const minIso = String(el.dataset.antaresDateMin || "").trim();
      const maxIso = String(el.dataset.antaresDateMax || "").trim();
      if (minIso && isValidIsoDate(minIso) && iso < minIso) {
        return { ok: false, message: `La fecha no puede ser anterior a ${formatIsoDateToDmy(minIso)}.`, patchValue: undefined };
      }
      if (maxIso && isValidIsoDate(maxIso) && iso > maxIso) {
        return { ok: false, message: `La fecha no puede ser posterior a ${formatIsoDateToDmy(maxIso)}.`, patchValue: undefined };
      }
      return { ok: true, message: "", patchValue: iso.slice(0, 10) };
    }
    if (kind === "percent") {
      const n = parsePercent(raw);
      if (n === null) return { ok: false, message: MSG.percent, patchValue: undefined };
      return { ok: true, message: "", patchValue: String(n) };
    }
    if (kind === "money" || kind === "money-cop") {
      const n = parseMoneyNumber(raw);
      if (n === null) return { ok: false, message: MSG.money, patchValue: undefined };
      return { ok: true, message: "", patchValue: String(n) };
    }
    if (kind === "int") {
      if (!/^-?\d+$/.test(raw.replace(/\s/g, ""))) return { ok: false, message: MSG.int, patchValue: undefined };
      return { ok: true, message: "", patchValue: raw.replace(/\s/g, "") };
    }
    if (kind === "decimal") {
      const n = parseMoneyNumber(raw);
      if (n === null) return { ok: false, message: MSG.decimal, patchValue: undefined };
      return { ok: true, message: "", patchValue: String(n) };
    }
    if (kind === "phone-loose") {
      const d = raw.replace(/\D/g, "");
      if (d.length < 7 || d.length > 15) return { ok: false, message: MSG.phoneLoose, patchValue: undefined };
      return { ok: true, message: "", patchValue: raw };
    }
    if (kind === "alnum-doc") {
      const s = sanitizeOneLineText(raw, 64);
      if (!RE_ALNUM_DOC.test(s)) return { ok: false, message: MSG.alnumDoc, patchValue: undefined };
      return { ok: true, message: "", patchValue: s };
    }
    return { ok: true, message: "", patchValue: sanitizeOneLineText(raw, 2000) };
  }

  function inferHtmlValidation(el, form) {
    const type = String(el.type || "").toLowerCase();
    if (type === "password") return { ok: true, message: "", patchValue: undefined };
    const raw = String(el.value ?? "").trim();
    const maxLenAttr = el.getAttribute("data-antares-max");
    if (maxLenAttr && raw) {
      const m = Number(maxLenAttr);
      if (Number.isFinite(m)) {
        const isMultiline = String(el.tagName || "").toUpperCase() === "TEXTAREA";
        const s = isMultiline ? sanitizeMultiline(raw, m) : sanitizeOneLineText(raw, m);
        if (s.length > m) {
          return { ok: false, message: MSG.maxLen(m), patchValue: undefined };
        }
        if (s !== raw) return { ok: true, message: "", patchValue: s };
      }
    }
    if (el.required && !raw && type !== "number") {
      return { ok: false, message: MSG.required, patchValue: undefined };
    }
    if (type === "email" && raw) {
      if (!isValidEmail(raw)) return { ok: false, message: MSG.email, patchValue: undefined };
      return { ok: true, message: "", patchValue: normalizeEmail(raw) };
    }
    if (type === "number") {
      if (el.required && (el.value === "" || el.value === null)) {
        return { ok: false, message: MSG.required, patchValue: undefined };
      }
      if (el.value === "" || el.value === null) return { ok: true, message: "", patchValue: undefined };
      const n = Number(el.value);
      if (!Number.isFinite(n)) return { ok: false, message: MSG.decimal, patchValue: undefined };
      const min = el.min !== "" ? Number(el.min) : NaN;
      const max = el.max !== "" ? Number(el.max) : NaN;
      if (Number.isFinite(min) && n < min) return { ok: false, message: MSG.numberRange, patchValue: undefined };
      if (Number.isFinite(max) && n > max) return { ok: false, message: MSG.numberRange, patchValue: undefined };
      return { ok: true, message: "", patchValue: el.value };
    }
    if ((type === "date" || el.classList.contains("portal-date-dmy")) && raw) {
      const iso = el.classList.contains("portal-date-dmy") ? parseDmyToIsoDate(raw) : raw;
      if (!isValidIsoDate(iso)) return { ok: false, message: MSG.date, patchValue: undefined };
      return { ok: true, message: "", patchValue: iso.slice(0, 10) };
    }
    if (type === "tel" && raw && !el.matches(".js-b2b-phone-national, .js-register-phone-national")) {
      const d = raw.replace(/\D/g, "");
      if (d.length < 7 || d.length > 15) return { ok: false, message: MSG.phoneLoose, patchValue: undefined };
    }
    return { ok: true, message: "", patchValue: undefined };
  }

  /**
   * Valida campos visibles del formulario: `required`, tipos HTML, `data-antares-field` y `data-antares-validate-blur`.
   * Omite teléfonos compuestos (.js-*-phone-national) y el hidden `name=phone` (los valida el flujo de negocio).
   */
  function validateDomForm(form) {
    if (!form || typeof form.querySelectorAll !== "function") {
      return { ok: true, firstInvalid: null, patch: {} };
    }
    const patch = {};
    let firstInvalid = null;
    const selector =
      "input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]):not([type=file]):not([type=checkbox]):not([type=radio]), select, textarea";
    const fields = [...form.querySelectorAll(selector)];
    for (const el of fields) {
      if (!shouldValidateField(el, form)) continue;

      /* Duplicidad de documento u otras reglas con `setCustomValidity`: no borrar el mensaje al validar el resto del formulario. */
      if (el.validity && el.validity.customError && String(el.validationMessage || "").trim()) {
        setFieldError(el, String(el.validationMessage || "").trim());
        if (!firstInvalid) firstInvalid = el;
        continue;
      }

      clearFieldError(el);

      if (el.tagName === "SELECT" && el.required && !String(el.value || "").trim()) {
        setFieldError(el, MSG.required);
        if (!firstInvalid) firstInvalid = el;
        continue;
      }

      const blurCheck = el.getAttribute("data-antares-validate-blur");
      if (blurCheck && !runBlurValidation(el, blurCheck)) {
        if (!firstInvalid) firstInvalid = el;
        continue;
      }

      const explicit = el.getAttribute("data-antares-field");
      let res = explicit ? validateDataAntaresField(el, form) : { ok: true, message: "", patchValue: undefined };
      if (!res.ok) {
        setFieldError(el, res.message);
        if (!firstInvalid) firstInvalid = el;
        continue;
      }
      if (explicit && res.patchValue !== undefined) {
        if (el.name) patch[el.name] = res.patchValue;
        else if (el.classList.contains("portal-date-dmy")) {
          const hiddenIso = findPortalDateIsoHidden(el);
          if (hiddenIso?.name) patch[hiddenIso.name] = res.patchValue;
        }
      }

      if (!explicit) {
        res = inferHtmlValidation(el, form);
        if (!res.ok) {
          setFieldError(el, res.message);
          if (!firstInvalid) firstInvalid = el;
          continue;
        }
        if (res.patchValue !== undefined) {
          if (el.name) patch[el.name] = res.patchValue;
          else if (el.classList.contains("portal-date-dmy")) {
            const hiddenIso = findPortalDateIsoHidden(el);
            if (hiddenIso?.name) patch[hiddenIso.name] = res.patchValue;
          }
        }
      }
    }
    return { ok: !firstInvalid, firstInvalid, patch };
  }

  function validateAuthLogin(data) {
    const email = normalizeEmail(data.email);
    if (!isValidEmail(email)) {
      return { ok: false, message: MSG.email, fieldSelector: "input[name='email']", hint: MSG.email };
    }
    const pw = String(data.password ?? "");
    if (pw.length < 8) {
      return {
        ok: false,
        message: "La contraseña debe tener al menos 8 caracteres.",
        fieldSelector: "input[name='password']",
        hint: "Verifique que no queden espacios al inicio o al final."
      };
    }
    return { ok: true, sanitized: { ...data, email } };
  }

  /**
   * Valida el formulario B2B público (pasos). `getPhoneMeta` debe devolver el mismo objeto que getSelectedPhoneCountry(form, "b2b").
   */
  function validateB2bProspectClient(form, data, getPhoneMeta) {
    const meta = typeof getPhoneMeta === "function" ? getPhoneMeta() : { dial: "57", minNat: 8, maxNat: 15, style: "co", label: "" };
    const email = normalizeEmail(data.email);
    const message = sanitizeMultiline(data.message, 8000);
    const phoneDigitsAll = String(data.phone || "").replace(/\D/g, "");

    const errors = [];
    const natPhoneField = form?.querySelector?.(".js-b2b-phone-national") || null;

    if (!isValidEmail(email)) {
      setFieldError(form?.querySelector?.("input[name='email']"), MSG.email);
      errors.push("email");
    }
    let phoneErrMsg = "";
    if (!phoneDigitsAll.startsWith(String(meta.dial || ""))) {
      phoneErrMsg = "El teléfono no coincide con el país seleccionado en el indicativo.";
    } else {
      const nationalLen = phoneDigitsAll.length - String(meta.dial).length;
      if (nationalLen < meta.minNat || nationalLen > meta.maxNat) {
        phoneErrMsg =
          meta.style === "co"
            ? "Ingrese un celular colombiano válido (10 dígitos nacionales; puede incluir +57 en el mismo campo o usar solo el número local)."
            : `Ingrese entre ${meta.minNat} y ${meta.maxNat} dígitos del número local para ${meta.label}.`;
      } else if (meta.style === "co") {
        const nat = phoneDigitsAll.slice(String(meta.dial).length);
        if (!nat.startsWith("3")) phoneErrMsg = MSG.coMobile;
      }
    }
    if (phoneErrMsg) {
      setFieldError(natPhoneField, phoneErrMsg);
      errors.push("phone");
    }
    if (message.length < 30) {
      setFieldError(
        form?.querySelector?.("textarea[name='message']"),
        "Cuéntenos un poco más del requerimiento (mínimo 30 caracteres)."
      );
      errors.push("message");
    }

    const name = sanitizeOneLineText(data.name, 255);
    const company = sanitizeOneLineText(data.company, 255);
    const position = sanitizeOneLineText(data.position, 255);
    const taxId = sanitizeOneLineText(data.taxId, 32).replace(/\s/g, "");

    if (name.length < 2) {
      setFieldError(form?.querySelector?.("input[name='name']"), MSG.minLen(2));
      errors.push("name");
    } else if (!RE_PERSON_NAME.test(name)) {
      setFieldError(form?.querySelector?.("input[name='name']"), MSG.personName);
      errors.push("name");
    }
    if (company.length < 2) {
      setFieldError(form?.querySelector?.("input[name='company']"), MSG.minLen(2));
      errors.push("company");
    }
    if (position.length < 2) {
      setFieldError(form?.querySelector?.("input[name='position']"), MSG.minLen(2));
      errors.push("position");
    }
    const nitVal = validateColombianDocument("NIT", taxId);
    if (!nitVal.ok) {
      setFieldError(form?.querySelector?.("input[name='taxId']"), nitVal.message || MSG.nit);
      errors.push("taxId");
    }

    if (errors.length) return { ok: false, errors, first: errors[0] };
    return {
      ok: true,
      sanitized: {
        ...data,
        name: normalizeLatinUpperForDb(name),
        company: normalizeLatinUpperForDb(company),
        position: normalizeLatinUpperForDb(position),
        taxId: nitVal.normalized,
        email,
        phone: String(data.phone || "").trim(),
        message: normalizeLatinUpperForDb(message)
      }
    };
  }

  function validateProfileForm(data) {
    const name = normalizeLatinUpperForDb(sanitizeOneLineText(data.name, 200));
    if (name.length < 2) return { ok: false, message: "El nombre completo es obligatorio (mínimo 2 caracteres)." };
    if (!RE_PERSON_NAME.test(name)) return { ok: false, message: MSG.personName };

    const docType = String(data.documentType || "CC").toUpperCase();
    const taxRaw = String(data.taxId || "").trim();
    if (taxRaw) {
      const dv = validateColombianDocument(docType, taxRaw);
      if (!dv.ok) return { ok: false, message: dv.message };
    }

    const birth = parseDmyToIsoDate(data.birthDate) || String(data.birthDate || "").trim();
    if (birth && !isValidIsoDate(birth)) return { ok: false, message: MSG.date };

    const phone = String(data.phone || "").replace(/\D/g, "");
    if (phone && (phone.length < 7 || phone.length > 15))
      return { ok: false, message: "Ingrese un teléfono celular válido (solo dígitos, 7 a 15)." };

    const emName = sanitizeOneLineText(data.emergencyContact, 120);
    if (emName && !RE_PERSON_NAME.test(emName)) return { ok: false, message: "Nombre de contacto de emergencia no válido." };

    const emPhone = String(data.emergencyPhone || "").replace(/\D/g, "");
    if (emPhone && (emPhone.length < 7 || emPhone.length > 15))
      return { ok: false, message: "Teléfono de emergencia no válido." };

    return {
      ok: true,
      sanitized: {
        ...data,
        name,
        birthDate: birth || "",
        taxId: taxRaw ? validateColombianDocument(docType, taxRaw).normalized : "",
        phone: String(data.phone || "").trim(),
        emergencyContact: emName ? normalizeLatinUpperForDb(emName) : "",
        emergencyPhone: String(data.emergencyPhone || "").trim(),
        emergencyRelation: normalizeLatinUpperForDb(sanitizeOneLineText(data.emergencyRelation, 80))
      }
    };
  }

  function installLiveValidation(root) {
    const rootEl = root && root.addEventListener ? root : document;
    upgradePortalDateFields(rootEl);
    if (rootEl === document) installPortalDateFieldObserver(document);
    if (liveRoots.has(rootEl)) return;
    liveRoots.add(rootEl);
    rootEl.addEventListener(
      "input",
      (ev) => {
        const t = ev.target;
        if (!t || !t.getAttribute) return;
        const mode = t.getAttribute("data-antares-restrict");
        if (!mode || (t.disabled && t.getAttribute("data-antares-restrict-always") !== "1")) return;
        if (t.type === "file" || t.type === "hidden") return;
        applyRestrictToValue(t, mode);
      },
      true
    );
    rootEl.addEventListener(
      "blur",
      (ev) => {
        const t = ev.target;
        if (!t || !t.getAttribute) return;
        const check = t.getAttribute("data-antares-validate-blur");
        if (!check) return;
        /* Campo aún vacío: no insertar «Campo obligatorio» al pasar de un campo a otro.
           Insertar/quitar ese mensaje agranda la tarjeta del campo y desplaza el formulario
           (la pantalla "salta" con cada clic). Los obligatorios se siguen exigiendo al pulsar
           «Siguiente» del asistente o al guardar (validateDomForm / submit guard). */
        if (!String(t.value ?? "").trim()) {
          if (check === "date-dmy") syncPortalDateHiddenFromVisible(t);
          clearFieldError(t);
          return;
        }
        if (check === "required-select") {
          clearFieldError(t);
          return;
        }
        runBlurValidation(t, check);
      },
      true
    );
  }

  function readFormEntriesNormalized(form) {
    if (!form) return {};
    return normalizePayloadTextFields(Object.fromEntries(new FormData(form).entries()));
  }

  window.AntaresValidation = {
    MSG,
    normalizeEmail,
    normalizeLatinForDb,
    normalizeLatinUpperForDb,
    normalizePayloadTextFields,
    isValidEmail,
    validateColombianDocument,
    isValidIsoDate,
    isValidDmyDate,
    formatIsoDateToDmy,
    parseDmyToIsoDate,
    portalDateInputValueIso,
    portalDateInputSetIso,
    setPortalFormDateByName,
    setPortalFormDateById,
    findPortalDateVisibleInForm,
    resyncPortalDateValuesInRoot,
    clearPortalDateInput,
    mountPortalDateDmyInput,
    mountPortalDatetimeDmyInput,
    upgradePortalDateFields,
    upgradePortalDateInputs,
    portalDatetimeInputValueIso,
    portalDatetimeInputSetIso,
    scheduleUpgradePortalDateFields,
    parsePercent,
    parseMoneyNumber,
    sanitizeOneLineText,
    sanitizeMultiline,
    clearFieldError,
    setFieldError,
    validateAuthLogin,
    validateB2bProspectClient,
    validateProfileForm,
    validateDomForm,
    applyDomFormPatch,
    readNormalizedFormObject,
    readFormEntriesNormalized,
    decorateFormFields,
    prepareFormsInRoot,
    installFormSubmitGuard,
    installLiveValidation,
    applyRestrictToValue
  };

  if (typeof document !== "undefined") {
    const boot = () => {
      upgradePortalDateFields(document);
      resyncPortalDateValuesInRoot(document);
      installPortalDateFieldObserver(document);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})();
