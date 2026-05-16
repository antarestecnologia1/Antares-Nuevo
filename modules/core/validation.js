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
    date: "Ingrese una fecha válida (formato AAAA-MM-DD).",
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
    } else if (lastComma > -1) norm = s.replace(/\./g, "").replace(",", ".");
    else norm = s.replace(/,/g, "");
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
    "form.p-form, form.auth-form, form.auth-register-form, form.contact-form-premium, form.modal-edit-form, #b2b-form";

  /** Nombres de campo → reglas Antares (solo si el input aún no tiene `data-antares-field`). */
  const FIELD_NAME_RULES = [
    { re: /^email$/i, attrs: { field: "email", blur: "email", restrict: "email-local" } },
    {
      re: /^(firstName|lastName|middleName|secondLastName|legalRep|contactName|siteContactName|emergencyContact|emergencyRelation)$/i,
      attrs: { field: "person-name", blur: "person-name", restrict: "person-name" }
    },
    { re: /^name$/i, attrs: { field: "person-name", blur: "person-name", restrict: "person-name" } },
    { re: /^(taxId|idDoc)$/i, attrs: { field: "doc", restrict: "alnum-doc" } },
    { re: /^(companyNit|nit)$/i, attrs: { field: "nit", restrict: "alnum-doc" } },
    { re: /^personalTaxId$/i, attrs: { field: "doc", restrict: "alnum-doc" } },
    {
      re: /phone/i,
      attrs: { blur: "phone-loose", restrict: "digits" },
      skip: (el) => el.matches(".js-b2b-phone-national, .js-register-phone-national")
    },
    {
      re: /(Salary|salary|Cost|cost|Cop|cop|Amount|amount|Price|price|Value|value|Reimbursement|Allowance|allowance|bonus|Bonus|indemnization|cesantias|prima|vacaciones|otrosSettlement|tripValue|tripRate|totalCost|fuelReimbursement|baseSalary|liters|odometerKm|weightKg|capacityKg|fuelles|openings|experienceYears|expectedSalary|salaryOffer|extras|aux|primaServicios|interesesCesantias|vacationDays|days360|primaProp)/,
      attrs: { blur: "decimal", restrict: "decimal" }
    },
    { re: /^(plate|vin)$/i, attrs: { restrict: "alnum-doc" } },
    { re: /^(pickupDate|deliveryDate|birthDate|documentIssuedAt|dueDate|startDate|endDate|deadline|when|soat|techInspection|rcPolicy)/i, attrs: { blur: "date-iso" } }
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
    for (const rule of FIELD_NAME_RULES) {
      if (rule.skip && rule.skip(el)) continue;
      if (rule.re.test(n)) return rule.attrs;
    }
    const type = String(el.type || "").toLowerCase();
    if (type === "email") return { field: "email", blur: "email", restrict: "email-local" };
    if (type === "date") return { blur: "date-iso" };
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
      if (node.id === "emp-contract-duration-block" && (node.hidden || node.classList.contains("hidden"))) return true;
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
      if (name === "company" || name === "position" || name === "workArea" || name === "cargoDescription") {
        if (!el.getAttribute("data-antares-max")) el.setAttribute("data-antares-max", name === "cargoDescription" ? "500" : "255");
        return;
      }
      if (name === "address" || name === "originAddress" || name === "destinationAddress" || name === "notes" || name === "message") {
        if (!el.getAttribute("data-antares-max")) {
          el.setAttribute("data-antares-max", name === "message" ? "8000" : name === "notes" ? "2000" : "500");
        }
        return;
      }
      const rules = resolveFieldRules(name, el);
      if (rules) applyFieldRuleAttrs(el, rules);
      if (el.tagName === "SELECT" && el.required && !el.getAttribute("data-antares-validate-blur")) {
        el.setAttribute("data-antares-validate-blur", "required-select");
      }
    });
    form.setAttribute("data-antares-decorated", "1");
  }

  function prepareFormsInRoot(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(FORM_GUARD_SELECTOR).forEach((form) => decorateFormFields(form));
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
        if (!form.matches(FORM_GUARD_SELECTOR)) return;
        decorateFormFields(form);
        const result = validateDomForm(form);
        if (!result.ok) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          onInvalid(form, result.firstInvalid);
        }
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
    if (check === "date-iso") {
      if (raw && !isValidIsoDate(raw)) {
        setFieldError(el, MSG.date);
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
      return { ok: true, message: "", patchValue: s };
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
    if (kind === "date" || kind === "date-iso") {
      if (!isValidIsoDate(raw)) return { ok: false, message: MSG.date, patchValue: undefined };
      return { ok: true, message: "", patchValue: raw.slice(0, 10) };
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
    const raw = String(el.value ?? "").trim();
    const maxLenAttr = el.getAttribute("data-antares-max");
    if (maxLenAttr && raw) {
      const m = Number(maxLenAttr);
      if (Number.isFinite(m) && raw.length > m) {
        return { ok: false, message: MSG.maxLen(m), patchValue: undefined };
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
    if (type === "date" && raw) {
      if (!isValidIsoDate(raw)) return { ok: false, message: MSG.date, patchValue: undefined };
      return { ok: true, message: "", patchValue: raw.slice(0, 10) };
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
      if (explicit && res.patchValue !== undefined && el.name) patch[el.name] = res.patchValue;

      if (!explicit) {
        res = inferHtmlValidation(el, form);
        if (!res.ok) {
          setFieldError(el, res.message);
          if (!firstInvalid) firstInvalid = el;
          continue;
        }
        if (res.patchValue !== undefined && el.name) patch[el.name] = res.patchValue;
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
        name,
        company,
        position,
        taxId: nitVal.normalized,
        email,
        phone: String(data.phone || "").trim(),
        message
      }
    };
  }

  function validateProfileForm(data) {
    const name = sanitizeOneLineText(data.name, 200);
    if (name.length < 2) return { ok: false, message: "El nombre completo es obligatorio (mínimo 2 caracteres)." };
    if (!RE_PERSON_NAME.test(name)) return { ok: false, message: MSG.personName };

    const docType = String(data.documentType || "CC").toUpperCase();
    const taxRaw = String(data.taxId || "").trim();
    if (taxRaw) {
      const dv = validateColombianDocument(docType, taxRaw);
      if (!dv.ok) return { ok: false, message: dv.message };
    }

    const birth = String(data.birthDate || "").trim();
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
        taxId: taxRaw ? validateColombianDocument(docType, taxRaw).normalized : "",
        phone: String(data.phone || "").trim(),
        emergencyContact: emName,
        emergencyPhone: String(data.emergencyPhone || "").trim(),
        emergencyRelation: sanitizeOneLineText(data.emergencyRelation, 80)
      }
    };
  }

  function installLiveValidation(root) {
    const rootEl = root && root.addEventListener ? root : document;
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
        if (check === "required-select") {
          if (t.required && !String(t.value || "").trim()) setFieldError(t, MSG.required);
          else clearFieldError(t);
          return;
        }
        runBlurValidation(t, check);
      },
      true
    );
  }

  window.AntaresValidation = {
    MSG,
    normalizeEmail,
    isValidEmail,
    validateColombianDocument,
    isValidIsoDate,
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
    decorateFormFields,
    prepareFormsInRoot,
    installFormSubmitGuard,
    installLiveValidation,
    applyRestrictToValue
  };
})();
