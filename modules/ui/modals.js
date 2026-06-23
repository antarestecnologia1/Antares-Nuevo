/**
 * Toasts, guards de formulario, wizard RRHH, contratos a término fijo y modales CRUD genéricos.
 * Helpers aún en `portal-runtime.js` se resuelven vía `window` cuando hace falta.
 */
import { state } from "../core/store.js";
import { currentUser } from "../core/auth.js";
import { escapeHtml, escapeAttr, normalizePortalDateYmd, fmtDateOr, devWarn } from "../core/utils.js";
import { MODULE_PANEL_LABELS, MODULE_PANEL_BTN_TITLES } from "../core/config.js";
import {
  pcardWrap,
  pcardWrapPro,
  renderModalHead,
  renderModalFooterActions,
  renderConfirmDiscardModalBody,
  renderModulePanelToolbar,
  isCreatePanelExpanded
} from "./components.js";

function ic() {
  return typeof window !== "undefined" && window.IC ? window.IC : {};
}

function toInputDateSafe(isoDate) {
  const fn = typeof window !== "undefined" ? window.toInputDate : null;
  return typeof fn === "function" ? fn(isoDate) : "";
}

function addOneYearToYmdSafe(ymd) {
  const fn = typeof window !== "undefined" ? window.addOneYearToYmd : null;
  return typeof fn === "function" ? fn(ymd) : "";
}

function daysUntilSafe(dateValue) {
  const fn = typeof window !== "undefined" ? window.daysUntil : null;
  return typeof fn === "function" ? fn(dateValue) : NaN;
}

/** Descompone texto guardado (p. ej. "12 meses", "1 año") — alineado con `parseContractDurationFields` en runtime. */
export function parseContractDurationText(text) {
  const t = String(text || "").trim();
  if (!t) return { unit: "", amount: "", other: "" };
  const lower = t.toLowerCase();
  if (/^ind/i.test(lower) || /indefinid/i.test(lower)) return { unit: "otro", amount: "", other: t };
  const mMes = t.match(/^(\d+)\s*mes(es)?\s*$/i);
  if (mMes) {
    const n = parseInt(mMes[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "meses", amount: String(n), other: "" };
  }
  const mAn = t.match(/^(\d+)\s*(años|anos|año|ano)\s*$/i);
  if (mAn) {
    const n = parseInt(mAn[1], 10);
    if (Number.isFinite(n) && n >= 1) return { unit: "anios", amount: String(n), other: "" };
  }
  return { unit: "otro", amount: "", other: t };
}

export function wireModalDismiss(content, close, opts = {}) {
  if (!content || typeof close !== "function") return;
  const escId = (id) =>
    typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : String(id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const closeIds = Array.isArray(opts.closeIds) ? opts.closeIds : ["crud-close", "crud-cancel"];
  closeIds.forEach((id) => {
    content.querySelector(`#${escId(id)}`)?.addEventListener("click", close);
  });
  const okId = String(opts.okId || "").trim();
  if (okId) {
    content.querySelector(`#${escId(okId)}`)?.addEventListener("click", close);
  }
  const modal = content.closest(".modal") || document.getElementById("crud-modal");
  if (opts.backdrop !== false && modal) {
    modal.addEventListener(
      "click",
      (event) => {
        if (event.target === modal) close();
      },
      { once: true }
    );
  }
}

function isHrWizardFieldVisible(el, stepEl) {
  if (!el || el.disabled) return false;
  let node = el.parentElement;
  while (node && node !== stepEl) {
    if (node.hidden) return false;
    if (node.classList?.contains("hidden")) return false;
    if (node.classList?.contains("emp-contract-duration-branch") && (node.hidden || node.classList.contains("hidden"))) {
      return false;
    }
    node = node.parentElement;
  }
  return true;
}

export function hrWizardValidityTargets(stepEl) {
  if (!stepEl) return [];
  return [...stepEl.querySelectorAll("input, select, textarea")].filter((el) => {
    if (el.disabled || el.type === "hidden") return false;
    return isHrWizardFieldVisible(el, stepEl);
  });
}

/**
 * Marca un campo como inválido, muestra el mensaje bajo el control y desplaza el foco.
 * @returns {false} para cortar flujos `if (!failPortalField(...)) return;`
 */
export function failPortalField(form, fieldRef, message) {
  const V = window.AntaresValidation;
  if (!V) return false;
  const field =
    typeof V.resolveFormField === "function"
      ? V.resolveFormField(form, fieldRef)
      : form?.querySelector?.(typeof fieldRef === "string" ? `[name="${fieldRef}"]` : null);
  if (!field) return false;
  const msg = String(message || V.MSG?.required || "Este campo es obligatorio.").trim();
  V.setFieldError?.(field, msg);
  V.focusInvalidField?.(field, { pulse: true });
  return false;
}

/** Texto de error visible (`.field-error`) o mensaje nativo del campo (p. ej. `setCustomValidity`). */
export function readInlineOrNativeFieldError(fieldEl) {
  if (!fieldEl) return "";
  const label = fieldEl.closest("label");
  const hint = label?.querySelector(".field-error");
  const inline = String(hint?.textContent || "").trim();
  if (inline) return inline;
  return String(fieldEl.validationMessage || "").trim();
}

/**
 * Marca el paso como inválido: enfoca/desplaza al primer campo con error.
 * @returns {{ ok: true } | { ok: false, detail: string, firstInvalid: Element }}
 */
export function hrWizardStepValid(stepEl) {
  if (!stepEl) return { ok: true };
  const V = window.AntaresValidation;
  let firstInvalid = null;
  let hasInlineError = false;
  if (V && typeof V.validateDomForm === "function") {
    const res = V.validateDomForm(stepEl);
    if (!res.ok) {
      firstInvalid = res.firstInvalid || null;
      hasInlineError = true;
    }
  }
  if (!firstInvalid) {
    for (const el of hrWizardValidityTargets(stepEl)) {
      if (typeof el.checkValidity === "function" && !el.checkValidity()) {
        firstInvalid = el;
        const nativeMsg = String(el.validationMessage || "").trim();
        if (nativeMsg && V && typeof V.setFieldError === "function") {
          V.setFieldError(el, nativeMsg);
          hasInlineError = true;
        }
        break;
      }
    }
  }
  if (!firstInvalid) return { ok: true };
  const detail = readInlineOrNativeFieldError(firstInvalid);
  if (V && typeof V.focusInvalidField === "function") {
    V.focusInvalidField(firstInvalid, { pulse: true });
  } else {
    try {
      firstInvalid.scrollIntoView?.({ behavior: "smooth", block: "center" });
    } catch (_e) {
      /* noop */
    }
    try {
      firstInvalid.focus?.({ preventScroll: true });
    } catch (_e) {
      firstInvalid.focus?.();
    }
  }
  if (!hasInlineError && typeof firstInvalid.reportValidity === "function") {
    firstInvalid.reportValidity();
  }
  return { ok: false, detail, firstInvalid };
}

/** Etiqueta corta del paso (texto del dot) para mensajes de error específicos. */
export function hrWizardStepLabel(wizard, stepIndex) {
  const dot = wizard?.querySelector?.(`[data-hr-wizard-dot="${stepIndex}"] small`);
  const txt = String(dot?.textContent || "").trim();
  return txt || `Paso ${Number(stepIndex) + 1}`;
}

/** Resalta brevemente el dot del paso con error para guiar al usuario entre pantallas. */
export function flashHrWizardDotError(wizard, stepIndex) {
  const dot = wizard?.querySelector?.(`[data-hr-wizard-dot="${stepIndex}"]`);
  if (!dot) return;
  dot.classList.add("is-error");
  window.setTimeout(() => dot.classList.remove("is-error"), 1600);
}

/**
 * Solo **Término fijo** y **Prestación de servicios** requieren texto de plazo/duración.
 */
export function contractTypeRequiresDurationPlazo(contractType) {
  const t = String(contractType || "").trim();
  return t === "Termino fijo" || t === "Prestacion de servicios";
}

export function isFixedTermContractType(contractType) {
  return String(contractType || "").trim() === "Termino fijo";
}

export function addDaysToYmd(ymd, deltaDays) {
  const n = normalizePortalDateYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.trunc(Number(deltaDays) || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Suma meses calendario a `YYYY-MM-DD` (local). */
export function addMonthsToYmd(ymd, months) {
  const n = normalizePortalDateYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + Math.trunc(Number(months) || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Inicio del plazo del contrato vigente (renovación); si falta, usa fecha de ingreso. */
export function resolveEmployeeContractPlazoStartYmd(emp) {
  const e = emp && typeof emp === "object" ? emp : {};
  const vigente = normalizePortalDateYmd(
    e.contractVigenteStartDate ?? e.fecha_inicio_contrato_vigente ?? ""
  );
  const hire = normalizePortalDateYmd(e.startDate ?? e.fecha_ingreso ?? "");
  return vigente || hire;
}

/** Término fijo: fin = inicio contrato vigente + plazo (meses/años); por defecto 1 año calendario. */
export function resolveEmployeeContractEndDateYmd(contractType, plazoStartYmd, raw = {}) {
  const start = normalizePortalDateYmd(plazoStartYmd);
  if (!isFixedTermContractType(contractType)) {
    return normalizePortalDateYmd(raw.contractEndDate || raw.fecha_fin_contrato || "");
  }
  if (!start) return "";
  const unit = String(raw.contractDurationUnit || "").trim().toLowerCase();
  const parsedAmt = parseInt(String(raw.contractDurationAmount ?? "").trim(), 10);
  const amount = Number.isFinite(parsedAmt) ? Math.max(1, Math.floor(parsedAmt)) : 0;
  if (unit === "meses" && amount >= 1) return addMonthsToYmd(start, amount);
  if (unit === "anios" && amount >= 1) {
    let cursor = start;
    for (let i = 0; i < amount; i += 1) {
      cursor = addOneYearToYmdSafe(cursor);
      if (!cursor) return "";
    }
    return cursor;
  }
  if (raw.honorExplicitContractEndDate === true) {
    const explicit = normalizePortalDateYmd(raw.contractEndDate || raw.fecha_fin_contrato || "");
    if (explicit) return explicit;
  }
  return addOneYearToYmdSafe(start);
}

export function ensureEmployeeContractFields(emp) {
  const e = emp && typeof emp === "object" ? { ...emp } : {};
  const ct = String(e.contractType || "").trim();
  if (!isFixedTermContractType(ct)) return e;
  if (!String(e.contractDuration || e.contractDurationText || "").trim()) {
    e.contractDuration = "1 año";
  }
  const plazoStart = resolveEmployeeContractPlazoStartYmd(e);
  if (isFixedTermContractType(ct) && plazoStart) {
    const durText = String(e.contractDuration || e.contractDurationText || "1 año").trim();
    const parsed = parseContractDurationText(durText || "1 año");
    e.contractEndDate = resolveEmployeeContractEndDateYmd(ct, plazoStart, {
      contractDurationUnit: parsed.unit === "otro" ? "anios" : parsed.unit,
      contractDurationAmount: parsed.amount || "1"
    });
  }
  return e;
}

/**
 * Colombia (CST): si no se renovará el contrato a término fijo, avisar con al menos 30 días de anticipación.
 */
export function computeEmployeeContractRenewalMeta(emp) {
  const e = ensureEmployeeContractFields(emp || {});
  if (!isFixedTermContractType(e.contractType)) {
    return { applies: false, statusSlug: "na" };
  }
  const endYmd = normalizePortalDateYmd(e.contractEndDate);
  if (!endYmd) {
    return {
      applies: true,
      statusSlug: "unknown",
      endYmd: "",
      noticeDeadlineYmd: "",
      daysToEnd: null,
      headline: "Término fijo sin fecha fin",
      detail: "Indique la fecha de inicio del contrato vigente (o la de ingreso) para calcular el plazo.",
      pillLabel: "Sin fecha fin",
      pillTone: "warn"
    };
  }
  const daysToEnd = daysUntilSafe(endYmd);
  const noticeDeadlineYmd = addDaysToYmd(endYmd, -30);
  let statusSlug = "active";
  let headline = `Vence ${fmtDateOr(endYmd)}`;
  let detail = `Si no renovará, notifique por escrito a más tardar el ${fmtDateOr(noticeDeadlineYmd)} (30 días de anticipación, CST).`;
  let pillLabel = "Vigente";
  let pillTone = "ok";
  if (daysToEnd < 0) {
    statusSlug = "expired";
    headline = "Contrato vencido";
    detail = `Finalizó el ${fmtDateOr(endYmd)}. Revise renovación o terminación.`;
    pillLabel = "Vencido";
    pillTone = "alert";
  } else if (daysToEnd <= 30) {
    statusSlug = "notice_window";
    headline = `Vence en ${daysToEnd} día${daysToEnd === 1 ? "" : "s"}`;
    detail = `Ventana de aviso: notifique la no renovación antes del ${fmtDateOr(noticeDeadlineYmd)} si aplica.`;
    pillLabel = "Aviso urgente";
    pillTone = "alert";
  }
  return {
    applies: true,
    statusSlug,
    endYmd,
    noticeDeadlineYmd,
    daysToEnd,
    headline,
    detail,
    pillLabel,
    pillTone
  };
}

/** Vista previa de fin de contrato (término fijo = plazo desde inicio contrato vigente). */
export function bindFixedTermContractEndPreview(root, cfg) {
  const readFormDateIso = window.readFormDateIso;
  const queryPortalDateField = window.queryPortalDateField;
  const setFormDateByName = window.setFormDateByName;
  const clearFormDateInput = window.clearFormDateInput;
  const contractSel = root.querySelector(cfg.contractSelect);
  const startEl = root.querySelector(cfg.startDate);
  const vigenteEl = cfg.contractVigenteStartDate
    ? root.querySelector(cfg.contractVigenteStartDate)
    : null;
  const vigenteWrap = cfg.vigenteWrap ? root.querySelector(cfg.vigenteWrap) : null;
  const endEl = root.querySelector(cfg.contractEndDate);
  const wrap = root.querySelector(cfg.endWrap);
  const hintEl = cfg.hint ? root.querySelector(cfg.hint) : null;
  const unitSel = cfg.unit ? root.querySelector(cfg.unit) : null;
  const amtEl = cfg.amount ? root.querySelector(cfg.amount) : null;
  if (!contractSel || !startEl || !endEl || !wrap) return () => {};
  const startFieldName =
    String(startEl.getAttribute("name") || "").trim() ||
    String(cfg.startDate || "").replace(/^#/, "").trim() ||
    "startDate";
  const readStartYmd = () => {
    const byName = typeof readFormDateIso === "function" ? readFormDateIso(root, startFieldName) : "";
    if (byName) return normalizePortalDateYmd(byName);
    const vis =
      (typeof queryPortalDateField === "function" ? queryPortalDateField(root, cfg.startDate) : null) ||
      (typeof queryPortalDateField === "function" ? queryPortalDateField(root, startFieldName) : null) ||
      startEl;
    const iso =
      window.AntaresValidation?.portalDateInputValueIso?.(vis) || String(vis?.value || "").trim();
    return normalizePortalDateYmd(iso);
  };
  const vigenteFieldName =
    vigenteEl && String(vigenteEl.getAttribute("name") || "").trim()
      ? String(vigenteEl.getAttribute("name") || "").trim()
      : "contractVigenteStartDate";
  const readPlazoStartYmd = () => {
    if (vigenteEl) {
      const byName = typeof readFormDateIso === "function" ? readFormDateIso(root, vigenteFieldName) : "";
      if (byName) return normalizePortalDateYmd(byName);
      const vis =
        (typeof queryPortalDateField === "function" ? queryPortalDateField(root, cfg.contractVigenteStartDate) : null) ||
        (typeof queryPortalDateField === "function" ? queryPortalDateField(root, vigenteFieldName) : null) ||
        vigenteEl;
      const iso =
        window.AntaresValidation?.portalDateInputValueIso?.(vis) ||
        String(vis?.value || "").trim();
      const vigente = normalizePortalDateYmd(iso);
      if (vigente) return vigente;
    }
    return readStartYmd();
  };
  const writeEndYmd = (endYmd) => {
    const ymd = normalizePortalDateYmd(endYmd);
    if (!ymd) {
      if (typeof clearFormDateInput === "function") clearFormDateInput(endEl);
      return;
    }
    if (typeof setFormDateByName === "function") setFormDateByName(root, "contractEndDate", ymd);
    const endVis =
      (typeof queryPortalDateField === "function" ? queryPortalDateField(root, "contractEndDate") : null) || endEl;
    window.AntaresValidation?.portalDateInputSetIso?.(endVis, ymd);
  };
  const sync = () => {
    const contractType = String(contractSel.value || "").trim();
    const fixed = isFixedTermContractType(contractType);
    setContractDurationBranchVisible(wrap, fixed);
    if (vigenteWrap) setContractDurationBranchVisible(vigenteWrap, fixed);
    if (!fixed) {
      if (vigenteEl) clearFormDateInput?.(vigenteEl);
      clearFormDateInput?.(endEl);
      if (hintEl) hintEl.textContent = "";
      return;
    }
    if (amtEl && !String(amtEl.value || "").trim()) amtEl.value = "1";
    if (unitSel && !String(unitSel.value || "").trim()) {
      unitSel.value = "anios";
      unitSel.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const start = readPlazoStartYmd();
    const unit = String(unitSel?.value || "").trim().toLowerCase();
    const parsedAmt = parseInt(String(amtEl?.value ?? "").trim(), 10);
    const amount = Number.isFinite(parsedAmt) ? Math.max(1, Math.floor(parsedAmt)) : 1;
    const endYmd = resolveEmployeeContractEndDateYmd(contractType, start, {
      contractDurationUnit: unitSel?.value,
      contractDurationAmount: amtEl?.value,
      honorExplicitContractEndDate: false
    });
    writeEndYmd(endYmd);
    if (hintEl) {
      const notice = endYmd ? addDaysToYmd(endYmd, -30) : "";
      let plazoLabel = "1 año";
      if (unit === "meses") plazoLabel = `${amount} ${amount === 1 ? "mes" : "meses"}`;
      else if (unit === "anios") plazoLabel = `${amount} ${amount === 1 ? "año" : "años"}`;
      hintEl.textContent = endYmd
        ? `Plazo legal sugerido: ${plazoLabel} (hasta ${fmtDateOr(endYmd)}). Si no renovará, avise al trabajador antes del ${fmtDateOr(notice)}.`
        : "Indique la fecha de inicio del contrato vigente (o de ingreso) para calcular la fecha fin.";
    }
  };
  const scheduleSync = () => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(sync);
    else sync();
  };
  contractSel.addEventListener("change", sync);
  startEl.addEventListener("change", scheduleSync);
  startEl.addEventListener("input", scheduleSync);
  startEl.addEventListener("blur", scheduleSync);
  const hiddenStart = root.querySelector(
    'input[type="hidden"][name="startDate"][data-portal-date-iso="1"]'
  );
  if (hiddenStart) {
    hiddenStart.addEventListener("change", scheduleSync);
    hiddenStart.addEventListener("input", scheduleSync);
  }
  if (vigenteEl) {
    vigenteEl.addEventListener("change", scheduleSync);
    vigenteEl.addEventListener("input", scheduleSync);
    vigenteEl.addEventListener("blur", scheduleSync);
    const hiddenVigente = root.querySelector(
      `input[type="hidden"][name="${vigenteFieldName}"][data-portal-date-iso="1"]`
    );
    if (hiddenVigente) {
      hiddenVigente.addEventListener("change", scheduleSync);
      hiddenVigente.addEventListener("input", scheduleSync);
    }
  }
  if (unitSel && unitSel.dataset.fixedTermEndWired !== "1") {
    unitSel.dataset.fixedTermEndWired = "1";
    unitSel.addEventListener("change", sync);
  }
  if (amtEl && amtEl.dataset.fixedTermEndWired !== "1") {
    amtEl.dataset.fixedTermEndWired = "1";
    amtEl.addEventListener("input", sync);
    amtEl.addEventListener("change", sync);
  }
  return sync;
}

export function setContractDurationBranchVisible(el, show) {
  if (!el) return;
  el.classList.toggle("hidden", !show);
  el.toggleAttribute("hidden", !show);
  el.setAttribute("aria-hidden", show ? "false" : "true");
}

export function wireContractDurationBranch({ unitSel, qtyWrap, otherWrap, amtEl, otherEl }) {
  if (!unitSel || !qtyWrap || !otherWrap) return () => {};
  const sync = () => {
    const u = String(unitSel.value || "").trim().toLowerCase();
    const showQty = u === "meses" || u === "anios";
    const showOtro = u === "otro";
    setContractDurationBranchVisible(qtyWrap, showQty);
    setContractDurationBranchVisible(otherWrap, showOtro);
    if (amtEl) {
      if (showQty) amtEl.setAttribute("required", "required");
      else {
        amtEl.removeAttribute("required");
        amtEl.value = "";
      }
    }
    if (otherEl) {
      if (showOtro) otherEl.setAttribute("required", "required");
      else {
        otherEl.removeAttribute("required");
        otherEl.value = "";
      }
    }
  };
  if (unitSel.dataset.contractDurBranchWired !== "1") {
    unitSel.dataset.contractDurBranchWired = "1";
    unitSel.addEventListener("change", sync);
  }
  return sync;
}

/**
 * Muestra u oculta el bloque de duración según tipo de contrato; limpia campos si no aplica.
 * @returns {() => void} función `sync` para llamar tras cambiar cargo (tipo contrato por defecto).
 */
export function setupContractDurationPlazoVisibility(root, cfg) {
  const contractSel = root.querySelector(cfg.contractSelect);
  const block = root.querySelector(cfg.block);
  const unitSel = root.querySelector(cfg.unit);
  const qtyWrap = root.querySelector(cfg.qtyWrap);
  const otherWrap = root.querySelector(cfg.otherWrap);
  const amtEl = root.querySelector(cfg.amount);
  const otherEl = root.querySelector(cfg.otherText);
  if (!contractSel || !block) return () => {};
  const syncBranch = wireContractDurationBranch({ unitSel, qtyWrap, otherWrap, amtEl, otherEl });
  const sync = () => {
    const ct = String(contractSel.value || "").trim();
    const need = contractTypeRequiresDurationPlazo(ct);
    setContractDurationBranchVisible(block, need);
    if (unitSel) {
      if (need) {
        unitSel.setAttribute("required", "required");
        if (!String(unitSel.value || "").trim()) {
          unitSel.value = isFixedTermContractType(ct) ? "anios" : "meses";
        }
      } else {
        unitSel.removeAttribute("required");
        unitSel.value = "";
        if (amtEl) {
          amtEl.removeAttribute("required");
          amtEl.value = "";
        }
        if (otherEl) {
          otherEl.removeAttribute("required");
          otherEl.value = "";
        }
      }
    }
    syncBranch();
  };
  contractSel.addEventListener("change", sync);
  return sync;
}

export function bindHrFormWizard(form) {
  if (!form || form.dataset.hrWizardBound === "1") return;
  const wizard = form.querySelector("[data-hr-wizard]");
  if (!wizard) return;
  const steps = [...wizard.querySelectorAll(".hr-form-step")].sort(
    (a, b) => Number(a.dataset.stepIndex || 0) - Number(b.dataset.stepIndex || 0)
  );
  if (steps.length < 2) return;
  form.dataset.hrWizardBound = "1";

  const prevBtn = wizard.querySelector("[data-hr-wizard-prev]");
  const nextBtn = wizard.querySelector("[data-hr-wizard-next]");
  const submitBtn = wizard.querySelector(".hr-form-wizard-submit");
  const progressEl = wizard.querySelector("[data-hr-wizard-progress]");
  const progressFill = wizard.querySelector("[data-hr-wizard-progress-fill]");
  const hintEl = wizard.querySelector("[data-hr-wizard-hint]");
  const dots = [...wizard.querySelectorAll("[data-hr-wizard-dot]")];

  let idx = Math.max(
    0,
    steps.findIndex((s) => s.classList.contains("is-active"))
  );

  const sync = () => {
    steps.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle("is-active", on);
      s.classList.toggle("hidden", !on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });
    dots.forEach((d, i) => {
      const on = i === idx;
      d.classList.toggle("is-active", on);
      d.classList.toggle("is-done", i < idx);
      d.setAttribute("aria-selected", on ? "true" : "false");
      if (on) d.setAttribute("aria-current", "step");
      else d.removeAttribute("aria-current");
    });
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) {
      nextBtn.classList.toggle("hidden", idx >= steps.length - 1);
      nextBtn.disabled = idx >= steps.length - 1;
    }
    const submitSyncButtons = [...wizard.querySelectorAll("[data-hr-wizard-submit-sync]")];
    if (submitBtn) {
      const wizKind = String(wizard.getAttribute("data-hr-wizard") || "");
      const contractEarly = wizKind === "contract";
      const last = idx >= steps.length - 1;
      const enableSubmit = contractEarly || last;
      submitBtn.disabled = !enableSubmit;
      submitBtn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
      submitSyncButtons.forEach((btn) => {
        btn.disabled = !enableSubmit;
        btn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
      });
    }
    const pct = steps.length ? ((idx + 1) / steps.length) * 100 : 0;
    const pctRounded = Math.round(pct);
    const pctEl = wizard.querySelector("[data-hr-wizard-progress-pct]");
    if (progressEl) progressEl.textContent = `Paso ${idx + 1} de ${steps.length}`;
    if (pctEl) pctEl.textContent = `${pctRounded}% completado`;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (hintEl) {
      const wizKind = String(wizard.getAttribute("data-hr-wizard") || "");
      if (wizKind === "contract") {
        hintEl.textContent = "Puede generar el contrato desde el paso que prefiera.";
      } else if (wizKind === "candidate" && idx === 0 && idx < steps.length - 1) {
        hintEl.textContent =
          "Si el documento ya existe en candidatos, verá el aviso al escribir y no podrá avanzar hasta corregirlo.";
      } else {
        hintEl.textContent =
          idx < steps.length - 1
            ? "Avance hasta el último paso para habilitar guardar."
            : wizKind === "employee"
              ? "Último paso: puede generar el contrato Word antes de guardar la ficha."
              : wizKind === "candidate"
                ? "Último paso: adjunte CV y confirme; el documento ya se validó en el paso 1."
                : "Último paso: revise y guarde.";
      }
    }
    const activeStep = steps[idx] || form;
    window.AntaresValidation?.upgradePortalDateFields?.(activeStep);
    window.AntaresValidation?.resyncPortalDateValuesInRoot?.(activeStep);
  };

  prevBtn?.addEventListener("click", () => {
    if (form.dataset.submitting === "1") return;
    if (idx > 0) {
      idx -= 1;
      sync();
    }
  });

  nextBtn?.addEventListener("click", async () => {
    if (form.dataset.submitting === "1") return;
    if (typeof form.__antaresDupDocCheck === "function") {
      await form.__antaresDupDocCheck({ silent: false, forceServer: true });
    }
    const stepRes = hrWizardStepValid(steps[idx]);
    if (!stepRes.ok) {
      flashHrWizardDotError(wizard, idx);
      const stepName = hrWizardStepLabel(wizard, idx);
      const tail = stepRes.detail ? ` ${stepRes.detail}` : "";
      notify(`Revise «${stepName}».${tail ? ` ${tail}` : " Hay campos obligatorios o datos incorrectos."}`, "error");
      return;
    }
    if (idx < steps.length - 1) {
      idx += 1;
      sync();
    }
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", async () => {
      if (form.dataset.submitting === "1") return;
      const raw = dot.dataset.hrWizardDot;
      const targetIdx = Number.parseInt(String(raw ?? ""), 10);
      if (!Number.isFinite(targetIdx) || targetIdx < 0 || targetIdx >= steps.length) return;
      if (targetIdx === idx) return;
      if (targetIdx > idx) {
        if (typeof form.__antaresDupDocCheck === "function") {
          await form.__antaresDupDocCheck({ silent: false, forceServer: true });
        }
        for (let i = idx; i < targetIdx; i++) {
          const hopRes = hrWizardStepValid(steps[i]);
          if (!hopRes.ok) {
            idx = i;
            sync();
            flashHrWizardDotError(wizard, i);
            const nm = hrWizardStepLabel(wizard, i);
            const tail = hopRes.detail ? ` ${hopRes.detail}` : "";
            notify(`Complete «${nm}» antes de avanzar.${tail ? ` ${tail}` : ""}`, "error");
            return;
          }
        }
      }
      idx = targetIdx;
      sync();
    });
  });

  form.addEventListener(
    "submit",
    async (ev) => {
      if (typeof form.__antaresDupDocCheck === "function") {
        const dupOk = await form.__antaresDupDocCheck({ silent: false, forceServer: true, fromSubmit: true });
        if (!dupOk) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          /* El chequeo de duplicado ya mostró notify + error en el campo (wireFormDocDuplicateCheck). */
          return;
        }
      }
      for (let i = 0; i < steps.length; i++) {
        const subRes = hrWizardStepValid(steps[i]);
        if (!subRes.ok) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          idx = i;
          sync();
          flashHrWizardDotError(wizard, i);
          const nm = hrWizardStepLabel(wizard, i);
          const tail = subRes.detail ? ` ${subRes.detail}` : "";
          notify(`Revise «${nm}».${tail ? ` ${tail}` : " Hay campos por completar o corregir."}`, "error");
          return;
        }
      }
    },
    true
  );

  sync();
}

export function createCollapsibleCard(panelId, iconKey, title, subtitle, bodyHtml, expandLabel = "Crear nuevo", opts = {}) {
  const createPanels =
    opts && typeof opts === "object" && Object.prototype.hasOwnProperty.call(opts, "createPanels")
      ? opts.createPanels
      : {};
  const expanded = isCreatePanelExpanded(panelId, false, createPanels);
  const cardBody = `${renderModulePanelToolbar({ expanded, toggleAction: "toggle-create-panel", panelId, expandLabel, showWhen: "collapsed" })}
  <div class="${expanded ? "" : "hidden"}" data-create-panel="${escapeAttr(panelId)}">
    ${bodyHtml}
  </div>`;
  const extraClass = expanded ? "p-card--expanded" : "p-card--collapsed";
  return pcardWrap(iconKey, title, subtitle, cardBody, extraClass);
}

export function createCollapsibleProCard(
  panelId,
  iconKey,
  title,
  subtitle,
  bodyHtml,
  extraClass = "",
  expandLabel = "Abrir formulario",
  opts = {}
) {
  const createPanels =
    opts && typeof opts === "object" && Object.prototype.hasOwnProperty.call(opts, "createPanels")
      ? opts.createPanels
      : {};
  const expanded = isCreatePanelExpanded(panelId, false, createPanels);
  const cardBody = `${renderModulePanelToolbar({ expanded, toggleAction: "toggle-create-panel", panelId, expandLabel, showWhen: "collapsed" })}
  <div class="${expanded ? "" : "hidden"}" data-create-panel="${escapeAttr(panelId)}">
    ${bodyHtml}
  </div>`;
  const classes = [expanded ? "p-card--expanded" : "p-card--collapsed", String(extraClass || "").trim()].filter(Boolean).join(" ");
  return pcardWrapPro(iconKey, title, subtitle, cardBody, classes);
}

const TOAST_META = {
  success: {
    title: "Éxito",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
  },
  error: {
    title: "Error",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
  },
  info: {
    title: "Aviso",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  },
  warn: {
    title: "Atención",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  }
};

export function notify(message, type = "info", durationMs = 3200) {
  let box = document.getElementById("toast-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-container";
    box.className = "toast-container";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  box.style.position = "fixed";
  box.style.zIndex = "2147483647";

  const safeType = TOAST_META[type] ? type : "info";
  const meta = TOAST_META[safeType];
  const ms = Number(durationMs);
  const hideAfter = Number.isFinite(ms) && ms > 0 ? ms : 3200;

  const item = document.createElement("div");
  item.className = `toast toast-${safeType}`;
  item.setAttribute("role", "status");
  item.innerHTML = `
    <span class="toast-accent" aria-hidden="true"></span>
    <span class="toast-icon">${meta.icon}</span>
    <div class="toast-body">
      <p class="toast-title">${meta.title}</p>
      <p class="toast-message">${escapeHtml(String(message ?? ""))}</p>
    </div>
    <button type="button" class="toast-close" aria-label="Cerrar aviso">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <span class="toast-progress" style="--toast-duration:${hideAfter}ms" aria-hidden="true"></span>
  `;
  box.appendChild(item);

  let hideTimer = null;
  let removeTimer = null;
  const dismiss = () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = null;
    item.classList.remove("show");
    item.classList.add("toast-hide");
    if (removeTimer) clearTimeout(removeTimer);
    removeTimer = setTimeout(() => item.remove(), 280);
  };

  item.querySelector(".toast-close")?.addEventListener("click", dismiss);

  requestAnimationFrame(() => item.classList.add("show"));
  hideTimer = setTimeout(dismiss, hideAfter);
}

/** Si la bandeja guardó una notificación para quien ya vio el toast de éxito en pantalla, no repetir en el poll. */
export function suppressSelfInboxPollToastIfRecipientIsCurrentUser(recipientUserId) {
  const self = currentUser();
  if (!self || recipientUserId === undefined || recipientUserId === null || recipientUserId === "") return;
  if (String(recipientUserId) !== String(self.id)) return;
  state.portalSuppressSelfPollToastUntil = Date.now() + 5200;
}

function rememberButtonDisabledBeforeLock(btn) {
  if (!btn || btn.dataset.lockOrigDisabled != null) return;
  btn.dataset.lockOrigDisabled = btn.disabled ? "1" : "0";
}

function restoreButtonDisabledAfterLock(btn) {
  if (!btn) return;
  btn.removeAttribute("aria-busy");
  btn.classList.remove("is-busy");
  if (btn.dataset.lockOrigDisabled != null) {
    btn.disabled = btn.dataset.lockOrigDisabled === "1";
    delete btn.dataset.lockOrigDisabled;
    return;
  }
  btn.disabled = false;
}

function resolveDefaultSubmitButton(formEl, opts = {}) {
  return (
    opts.submitButton ??
    formEl?.querySelector?.("button[type='submit']") ??
    formEl?.querySelector?.("[data-step-submit]") ??
    formEl?.querySelector?.(".hr-form-wizard-submit")
  );
}

function collectFormActionLockRoots(formEl, triggerBtn) {
  const roots = [];
  if (formEl) roots.push(formEl);
  const card = formEl?.closest?.("[data-hr-panel]") || triggerBtn?.closest?.("[data-hr-panel]");
  if (card && !roots.includes(card)) roots.push(card);
  const actionBar =
    triggerBtn?.closest?.(".module-panel-actions, .hr-form-wizard-footer, .modal-edit-actions") ||
    formEl?.querySelector?.(".module-panel-actions, .hr-form-wizard-footer, .modal-edit-actions");
  if (actionBar && !roots.includes(actionBar)) roots.push(actionBar);
  return roots;
}

/** Botones de pie de formularios de alta (cancelar, minimizar, wizard, etc.). */
export function collectManagedCreateFormLockButtons(formEl, extraButtons = []) {
  if (!formEl) return [...extraButtons].filter(Boolean);
  const roots = collectFormActionLockRoots(formEl);
  const selectors = [
    "[data-action='cancel-create-panel']",
    "[data-action='toggle-create-panel']",
    "[data-hr-wizard-prev]",
    "[data-hr-wizard-next]",
    "[data-hr-wizard-submit-sync]",
    "[data-action='employee-form-save-draft']",
    "[data-action='employee-form-generate-contract-draft']",
    "[data-action='settlement-recalc']",
    "[data-action='payroll-liquidation-mode']",
    "#payroll-bulk-generate",
    ".module-panel-actions button",
    ".hr-form-wizard-footer-nav button",
    ".modal-edit-actions button"
  ];
  const seen = new Set();
  const out = [];
  const push = (btn) => {
    if (!btn || seen.has(btn)) return;
    seen.add(btn);
    out.push(btn);
  };
  selectors.forEach((sel) => {
    roots.forEach((root) => root.querySelectorAll(sel).forEach(push));
  });
  extraButtons.forEach(push);
  return out;
}

/** Resuelve botón de envío y botones auxiliares a bloquear durante una acción. */
export function resolveFormSubmitLockOpts(formEl, opts = {}) {
  if (opts.lockRelatedActions === false) return { ...opts };
  const submitBtn = resolveDefaultSubmitButton(formEl, opts);
  const seen = new Set();
  const extras = [];
  const push = (btn) => {
    if (!btn || btn === submitBtn || seen.has(btn)) return;
    seen.add(btn);
    extras.push(btn);
  };
  collectManagedCreateFormLockButtons(formEl, opts.lockExtraButtons || []).forEach(push);
  (opts.lockExtraButtons || []).forEach(push);
  return { ...opts, submitButton: submitBtn, lockExtraButtons: extras };
}

function markFormSubmitting(formEl, active) {
  if (!formEl) return;
  const targets = [formEl, ...formEl.querySelectorAll(".module-panel-actions, .hr-form-wizard-footer")];
  targets.forEach((node) => {
    if (!node) return;
    node.classList.toggle("is-submitting", active);
  });
  if (active) formEl.dataset.submitting = "1";
  else delete formEl.dataset.submitting;
}

export function isActionButtonBusy(btn) {
  if (!btn) return false;
  return btn.dataset.busy === "1" || btn.getAttribute("aria-busy") === "true";
}

/** Restaura habilitado/deshabilitado del botón «Guardar» en formularios por pasos. */
export function syncHrWizardSubmitDisabled(formEl) {
  if (!formEl) return;
  const wizard = formEl.querySelector("[data-hr-wizard]");
  if (!wizard) return;
  const steps = [...wizard.querySelectorAll(".hr-form-step")];
  const submitBtn = formEl.querySelector(".hr-form-wizard-submit");
  if (!submitBtn || !steps.length) return;
  const activeIdx = steps.findIndex((s) => s.classList.contains("is-active"));
  const idx = activeIdx >= 0 ? activeIdx : 0;
  const wizKind = String(wizard.getAttribute("data-hr-wizard") || "");
  const enableSubmit = wizKind === "contract" || idx >= steps.length - 1;
  submitBtn.disabled = !enableSubmit;
  submitBtn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
  formEl.querySelectorAll("[data-hr-wizard-submit-sync]").forEach((btn) => {
    btn.disabled = !enableSubmit;
    btn.setAttribute("aria-disabled", enableSubmit ? "false" : "true");
  });
}

/** Deshabilita el botón principal de envío y opcionalmente botones auxiliares del formulario. */
export function lockFormSubmitUi(formEl, opts = {}) {
  const resolved = resolveFormSubmitLockOpts(formEl, opts);
  const submitBtn = resolved.submitButton;
  if (submitBtn) {
    if (!submitBtn.dataset.submitOrigHtml) submitBtn.dataset.submitOrigHtml = submitBtn.innerHTML;
    const labelEl = submitBtn.querySelector(".auth-submit-label");
    if (labelEl && !labelEl.dataset.submitOrigText) labelEl.dataset.submitOrigText = labelEl.textContent || "";
    rememberButtonDisabledBeforeLock(submitBtn);
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    submitBtn.classList.add("is-busy");
    if (resolved.busyText) {
      if (labelEl) labelEl.textContent = resolved.busyText;
      else if (!resolved.busyHtml) submitBtn.textContent = resolved.busyText;
    }
    if (resolved.busyHtml) submitBtn.innerHTML = resolved.busyHtml;
    if (resolved.loadingClass) submitBtn.classList.add(resolved.loadingClass);
  }
  (resolved.lockExtraButtons || []).forEach((btn) => {
    if (!btn || btn === submitBtn) return;
    rememberButtonDisabledBeforeLock(btn);
    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    btn.classList.add("is-busy");
  });
  markFormSubmitting(formEl, true);
}

/** Restaura el estado del botón de envío tras `lockFormSubmitUi`. */
export function releaseFormSubmitUi(formEl, opts = {}) {
  const resolved = resolveFormSubmitLockOpts(formEl, opts);
  markFormSubmitting(formEl, false);
  const submitBtn = resolved.submitButton;
  if (submitBtn) {
    if (submitBtn.dataset.submitOrigHtml) submitBtn.innerHTML = submitBtn.dataset.submitOrigHtml;
    const labelEl = submitBtn.querySelector(".auth-submit-label");
    if (labelEl?.dataset.submitOrigText) labelEl.textContent = labelEl.dataset.submitOrigText;
    if (resolved.loadingClass) submitBtn.classList.remove(resolved.loadingClass);
    restoreButtonDisabledAfterLock(submitBtn);
  }
  (resolved.lockExtraButtons || []).forEach((btn) => {
    if (!btn || btn === submitBtn) return;
    restoreButtonDisabledAfterLock(btn);
  });
  if (formEl?.dataset?.hrWizardBound === "1") {
    syncHrWizardSubmitDisabled(formEl);
  }
}

export async function runWithBusyButton(btn, fn, opts = {}) {
  if (!btn || typeof fn !== "function" || isActionButtonBusy(btn)) return;
  const formEl = btn.closest("form");
  btn.dataset.busy = "1";
  const lockOpts = resolveFormSubmitLockOpts(formEl, { ...opts, submitButton: btn });
  lockFormSubmitUi(formEl, lockOpts);
  try {
    await fn();
  } finally {
    releaseFormSubmitUi(formEl, lockOpts);
    btn.dataset.busy = "0";
  }
}

function runPrepareCreationForm(formEl, opts) {
  const fn = opts.prepareForm ?? window.prepareCreationFormForSubmit;
  if (typeof fn !== "function") return true;
  return fn(formEl) !== false;
}

export function wireFormSubmitGuard(formEl, onSubmit, opts = {}) {
  if (!formEl || typeof onSubmit !== "function") return;
  const wireKey = opts.wireKey || "submitGuardWired";
  if (formEl.dataset[wireKey] === "1") return;
  formEl.dataset[wireKey] = "1";
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (formEl.dataset.submitting === "1") return;
    if (!runPrepareCreationForm(formEl, opts)) return;
    const lockOpts = resolveFormSubmitLockOpts(formEl, opts);
    lockFormSubmitUi(formEl, lockOpts);
    try {
      await onSubmit(event);
    } catch (err) {
      releaseFormSubmitUi(formEl, lockOpts);
      throw err;
    } finally {
      releaseFormSubmitUi(formEl, lockOpts);
      opts.onFinally?.(formEl);
    }
  });
}

/** Mensajes en {@link window.AntaresFeedback} (modules/core/feedback-messages.js). */
export function userMessage(key, ...args) {
  const M = window.AntaresFeedback;
  if (!M) return String(key);
  const v = M[key];
  if (typeof v === "function") return v(...args);
  return v != null ? v : String(key);
}

/**
 * Atributos estándar Antares para validación en vivo / al enviar en modales CRUD (`openEditModal`).
 */
export function editModalAntaresAttrString(f) {
  const a = f?.antares;
  if (!a || typeof a !== "object") return "";
  let s = "";
  if (a.restrict) s += ` data-antares-restrict="${escapeAttr(String(a.restrict))}"`;
  if (a.blur) s += ` data-antares-validate-blur="${escapeAttr(String(a.blur))}"`;
  if (a.field) s += ` data-antares-field="${escapeAttr(String(a.field))}"`;
  if (a.max != null && String(a.max).trim() !== "") s += ` data-antares-max="${escapeAttr(String(a.max))}"`;
  if (a.skipValidate) s += ` data-antares-skip-validate="1"`;
  return s;
}

export function editModalLabelClassAttr(f) {
  const parts = [];
  if (f.full) parts.push("full");
  const w = String(f.wrapperClass || "").trim();
  if (w) parts.push(w);
  if (!parts.length) return "";
  return ` class="${escapeAttr(parts.join(" "))}"`;
}

function editModalSelectOptionSelected(opt, fieldValue) {
  const fv = String(fieldValue ?? "").trim();
  if (!fv) return false;
  const ov = String(opt.value ?? "").trim();
  const ol = String(opt.label ?? "").trim();
  const fvLower = fv.toLowerCase();
  return (
    ov === fv ||
    ol === fv ||
    (ov && ov.toLowerCase() === fvLower) ||
    (ol && ol.toLowerCase() === fvLower)
  );
}

export function renderEditModalFieldRow(f, fieldIdx) {
  void fieldIdx;
  if (f.type === "section") return "";
  if (f.type === "select") {
    const options = (f.options || [])
      .map((opt) => {
        const v = escapeAttr(String(opt.value ?? ""));
        const sel = editModalSelectOptionSelected(opt, f.value) ? "selected" : "";
        const dis = opt.disabled ? "disabled" : "";
        return `<option value="${v}" ${sel} ${dis}>${escapeHtml(opt.label)}</option>`;
      })
      .join("");
    const labelInner = f.labelHtml ? f.labelHtml : escapeHtml(f.label);
    const labelWrap = f.labelHtml
      ? `<span class="modal-field-label modal-field-label--html">${labelInner}</span>`
      : `<span>${labelInner}</span>`;
    const hiddenAttr = f.hidden ? " hidden" : "";
    const searchableAttr = f.searchable
      ? ` class="searchable-select-native" data-searchable-select="1" data-searchable-placeholder="${escapeAttr(String(f.searchablePlaceholder || "Escriba placa, nombre o documento…"))}"`
      : "";
    return `<label${editModalLabelClassAttr(f)}${hiddenAttr}>${labelWrap}<select name="${escapeAttr(f.name)}"${searchableAttr} ${f.required ? "required" : ""}${editModalAntaresAttrString(f)}>${options}</select></label>`;
  }
  if (f.type === "hidden") {
    return `<input type="hidden" name="${escapeAttr(f.name)}" value="${escapeAttr(String(f.value ?? ""))}" />`;
  }
  if (f.type === "textarea") {
    return `<label${editModalLabelClassAttr({ ...f, full: true })}><span>${escapeHtml(f.label)}</span><textarea name="${escapeAttr(f.name)}" rows="${f.rows || 3}" ${f.required ? "required" : ""}${editModalAntaresAttrString(f)}>${escapeHtml(f.value ?? "")}</textarea></label>`;
  }
  if (f.type === "file") {
    return `<label${editModalLabelClassAttr({ ...f, full: true })}><span>${escapeHtml(f.label)}</span><input type="file" name="${escapeAttr(f.name)}" ${f.accept ? `accept="${escapeAttr(f.accept)}"` : ""} ${f.multiple ? "multiple" : ""} ${f.required ? "required" : ""} /></label>`;
  }
  if (f.type === "custom") {
    const labelHtml = f.label ? `<span class="modal-edit-section-title">${escapeHtml(f.label)}</span>` : "";
    return `<div class="full modal-edit-custom-slot"${f.id ? ` id="${escapeAttr(f.id)}"` : ""}>${labelHtml}${f.html || ""}</div>`;
  }
  const inputType = String(f.type || "text").replace(/[^a-z0-9\-]/gi, "") || "text";
  const minAttr = f.min != null ? ` min="${escapeAttr(String(f.min))}"` : "";
  const maxAttr = f.max != null ? ` max="${escapeAttr(String(f.max))}"` : "";
  const stepAttr = f.step != null ? ` step="${escapeAttr(String(f.step))}"` : "";
  const langAttr = f.lang ? ` lang="${escapeAttr(String(f.lang))}"` : "";
  const labelInner = f.labelHtml ? f.labelHtml : escapeHtml(f.label);
  const labelWrap = f.labelHtml
    ? `<span class="modal-field-label modal-field-label--html">${labelInner}</span>`
    : `<span>${labelInner}</span>`;
  const hiddenAttr = f.hidden ? " hidden" : "";
  let inputValue = String(f.value ?? "");
  if (inputType === "date") {
    inputValue = normalizePortalDateYmd(f.value) || inputValue;
  } else if (inputType === "datetime-local") {
    const raw = String(f.value ?? "").trim();
    inputValue =
      raw.length >= 16 && raw.includes("T") ? raw.slice(0, 16) : String(toInputDateSafe(raw) || "").slice(0, 16) || inputValue;
  } else if (inputType === "time") {
    const raw = String(f.value ?? "").trim();
    inputValue = raw.length >= 5 ? raw.slice(0, 5) : raw;
  }
  return `<label${editModalLabelClassAttr(f)}${hiddenAttr}>${labelWrap}<input type="${inputType}" name="${escapeAttr(f.name)}" value="${escapeAttr(inputValue)}"${minAttr}${maxAttr}${stepAttr}${langAttr} ${f.required ? "required" : ""}${editModalAntaresAttrString(f)} /></label>`;
}

export function buildOpenEditModalFieldsHtml(fields, fallbackSectionTitle = "Información") {
  if (!fields.length) return "";
  const toneCycle = ["blue", "violet", "emerald", "amber", "cyan", "rose"];
  let toneIdx = 0;
  const firstSectionAt = fields.findIndex((x) => x.type === "section");
  if (firstSectionAt === -1) {
    const inner = fields.map((f, i) => renderEditModalFieldRow(f, i)).join("");
    if (fields.every((x) => x.type === "hidden")) return inner;
    return `<fieldset class="form-section form-section-blue full" role="group">
      <legend>${escapeHtml(fallbackSectionTitle)}</legend>
      <div class="form-section-grid">${inner}</div>
    </fieldset>`;
  }
  let html = "";
  if (firstSectionAt > 0) {
    const leading = fields.slice(0, firstSectionAt);
    const leadH = leading.filter((x) => x.type === "hidden");
    const leadV = leading.filter((x) => x.type !== "hidden");
    html += leadH.map((f, i) => renderEditModalFieldRow(f, i)).join("");
    if (leadV.length) {
      html += `<fieldset class="form-section form-section-blue full" role="group">
        <legend>${escapeHtml(fallbackSectionTitle)}</legend>
        <div class="form-section-grid">${leadV.map((f, i) => renderEditModalFieldRow(f, i)).join("")}</div>
      </fieldset>`;
    }
  }
  const rest = firstSectionAt > 0 ? fields.slice(firstSectionAt) : fields;
  let i = 0;
  while (i < rest.length) {
    const head = rest[i];
    if (head.type !== "section") {
      html += renderEditModalFieldRow(head, i);
      i++;
      continue;
    }
    const section = head;
    i++;
    const chunk = [];
    while (i < rest.length && rest[i].type !== "section") {
      chunk.push(rest[i]);
      i++;
    }
    const sid = escapeAttr(String(section.id || `edit-section-${toneIdx}`));
    const explicitTone =
      section.sectionTone && toneCycle.includes(String(section.sectionTone)) ? String(section.sectionTone) : null;
    const tone = explicitTone || toneCycle[toneIdx % toneCycle.length];
    if (!explicitTone) toneIdx += 1;
    const hint = section.hint ? `<p class="muted form-section-hint">${escapeHtml(section.hint)}</p>` : "";
    const gridExtra = section.gridClass ? ` ${escapeAttr(String(section.gridClass))}` : "";
    const gridInner = chunk.map((f, j) => renderEditModalFieldRow(f, j)).join("");
    html += `<fieldset class="form-section form-section-${tone} full" role="group" aria-labelledby="${sid}-lg">
      <legend id="${sid}-lg">${escapeHtml(section.title || "Sección")}</legend>
      ${hint}
      <div class="form-section-grid${gridExtra}">${gridInner}</div>
    </fieldset>`;
  }
  return html;
}

export function openEditModal({
  title,
  subtitle = "",
  introHtml = "",
  fields = [],
  submitText = "Guardar",
  cancelLabel,
  cancelBtnClass = "",
  primaryBtnClass = "btn btn-primary module-panel-btn",
  onSubmit,
  afterMount,
  extraModalCardClass = ""
}) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) {
    card.className = `modal-card modal-card-edit${extraModalCardClass ? ` ${extraModalCardClass}` : ""}`;
  }
  const content = modal.querySelector("#crud-modal-content");
  const fieldsHtml = buildOpenEditModalFieldsHtml(fields);

  content.innerHTML = `
    ${renderModalHead(title, { subtitle })}
    ${introHtml || ""}
    <form id="crud-form" class="p-form p-form-colored modal-edit-form">
      ${fieldsHtml}
      ${renderModalFooterActions({
        className: "full",
        cancelLabel,
        cancelBtnClass: cancelBtnClass || undefined,
        primaryHtml: `<button type="submit" class="${escapeAttr(primaryBtnClass)}">${ic().save} ${escapeHtml(submitText)}</button>`
      })}
    </form>
  `;

  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  wireModalDismiss(content, close);
  const formEl = content.querySelector("#crud-form");
  if (typeof afterMount === "function") {
    try {
      afterMount(formEl);
    } catch (err) {
      devWarn("openEditModal afterMount", err);
    }
  }
  window.AntaresValidation?.decorateFormFields?.(formEl);
  window.wireEditModalFieldValues?.(formEl, fields);
  window.AntaresValidation?.resyncPortalDateValuesInRoot?.(formEl);
  window.enhanceTripAssignmentSelects?.(formEl);
  window.scrollIntoViewSmoothBlockStart?.(formEl);
  window.scrollOpenCrudModalIntoView?.();
  wireFormSubmitGuard(
    formEl,
    async (event) => {
      const currentForm = event.currentTarget;
      const V = window.AntaresValidation;
      if (V && typeof V.validateDomForm === "function") {
        const domVal = V.validateDomForm(currentForm);
        if (!domVal.ok) {
          V.focusInvalidField?.(domVal.firstInvalid, { pulse: true });
          const msg = userMessage("validationStep");
          notify(msg, "error");
          return false;
        }
        V.applyDomFormPatch?.(currentForm, domVal.patch);
      }
      const readFormEntriesNormalized = window.readFormEntriesNormalized;
      const payload =
        typeof readFormEntriesNormalized === "function" ? readFormEntriesNormalized(currentForm) : {};
      const fileInputs = [...currentForm.querySelectorAll("input[type='file']")];
      fileInputs.forEach((input) => {
        if (input.multiple) {
          payload[input.name] = [...input.files].map((file) => file.name).join(", ");
        } else if (input.files?.[0]) {
          payload[input.name] = input.files[0].name;
        }
      });
      let result;
      try {
        result = onSubmit?.(payload, currentForm);
        if (result && typeof result.then === "function") {
          result = await result;
        }
      } catch (err) {
        devWarn("openEditModal onSubmit", err);
        return false;
      }
      if (result === false) return false;
      close();
    },
    { busyText: "Guardando…", wireKey: "crudSubmitGuardWired" }
  );
}

export function ensureCrudModalElement() {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  return modal;
}

export function openConfirmModalAsync({
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmBtnClass = "btn-primary",
  cancelBtnClass = "",
  confirmIcon = "check",
  cardClass = "modal-card-edit",
  onConfirm
}) {
  return new Promise((resolve) => {
    const modal = ensureCrudModalElement();
    const card = modal.querySelector(".modal-card");
    if (card) card.className = `modal-card ${cardClass}`.trim();
    const content = modal.querySelector("#crud-modal-content");
    const safeCardClass = String(cardClass || "modal-card-edit").trim();
    const isDiscardModal = safeCardClass.includes("modal-card--discard");
    if (isDiscardModal) {
      content.innerHTML = renderConfirmDiscardModalBody({
        title,
        message,
        cancelLabel: cancelText,
        confirmText,
        confirmIcon
      });
    } else {
      const safeConfirmClass = String(confirmBtnClass || "btn-primary").trim() || "btn-primary";
      const confirmIconHtml = ic()[String(confirmIcon || "check")] || ic().check;
      const safeCancelBtnClass = String(cancelBtnClass || "").trim();
      content.innerHTML = `
    ${renderModalHead(title)}
    <p class="modal-body-lead">${escapeHtml(message)}</p>
    ${renderModalFooterActions({
      cancelLabel: cancelText,
      cancelBtnClass: safeCancelBtnClass,
      primaryHtml: `<button type="button" id="crud-confirm" class="btn ${escapeAttr(safeConfirmClass)}">${confirmIconHtml} ${escapeHtml(confirmText)}</button>`
    })}
  `;
    }
    let settled = false;
    const finish = (confirmed) => {
      if (settled) return;
      settled = true;
      modal.classList.add("hidden");
      resolve(Boolean(confirmed));
    };
    modal.classList.remove("hidden");
    wireModalDismiss(content, () => finish(false));

    const confirmBtn = content.querySelector("#crud-confirm");
    const cancelBtn = content.querySelector("#crud-cancel, [data-action='crud-cancel']");
    let confirmConsumed = false;
    confirmBtn?.addEventListener(
      "click",
      async () => {
        if (confirmConsumed || isActionButtonBusy(confirmBtn)) return;
        confirmConsumed = true;
        const lockOpts = resolveFormSubmitLockOpts(null, {
          submitButton: confirmBtn,
          lockExtraButtons: [cancelBtn],
          busyText: "Procesando…"
        });
        lockFormSubmitUi(null, lockOpts);
        try {
          let out = onConfirm?.();
          if (out && typeof out.then === "function") {
            await out;
          }
          finish(true);
        } catch (_e) {
          try {
            const msg =
              _e && typeof _e === "object" && _e.message
                ? String(_e.message)
                : typeof _e === "string"
                  ? _e
                  : userMessage("genericError");
            if (msg) notify(msg, "error");
          } catch (_) {}
          confirmConsumed = false;
          releaseFormSubmitUi(null, lockOpts);
        }
      },
      { once: true }
    );
    window.scrollOpenCrudModalIntoView?.();
  });
}

export function openConfirmModal({ title, message, confirmText = "Confirmar", onConfirm }) {
  void openConfirmModalAsync({ title, message, confirmText, onConfirm });
}

export function openConfirmReasonModal({ title, message, confirmText = "Confirmar", onConfirm }) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) card.className = "modal-card modal-card-edit";
  const content = modal.querySelector("#crud-modal-content");
  content.innerHTML = `
    ${renderModalHead(title)}
    <p class="modal-body-lead">${escapeHtml(message)}</p>
    <label class="full modal-reason-field">
      <span class="muted">Motivo (obligatorio, mínimo 3 caracteres)</span>
      <textarea id="crud-delete-reason" rows="4" class="full" required></textarea>
    </label>
    ${renderModalFooterActions({
      primaryHtml: `<button type="button" id="crud-confirm" class="btn btn-primary">${ic().check} ${escapeHtml(confirmText)}</button>`
    })}
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  wireModalDismiss(content, close);
  const ta = content.querySelector("#crud-delete-reason");
  const confirmBtn = content.querySelector("#crud-confirm");
  let confirmConsumed = false;
  confirmBtn.addEventListener("click", async () => {
    if (confirmConsumed) return;
    const motivo = String(ta?.value || "").trim();
    if (motivo.length < 3) {
      notify("Indique el motivo (mínimo 3 caracteres).", "error");
      ta?.focus();
      return;
    }
    confirmConsumed = true;
    confirmBtn.disabled = true;
    confirmBtn.setAttribute("aria-busy", "true");
    try {
      let out = onConfirm?.(motivo);
      if (out && typeof out.then === "function") {
        await out;
      }
    } catch (_e) {
      try {
        const msg =
          _e && typeof _e === "object" && _e.message
            ? String(_e.message)
            : typeof _e === "string"
              ? _e
              : userMessage("genericError");
        if (msg) notify(msg, "error");
      } catch (_) {}
    } finally {
      close();
      confirmBtn.disabled = false;
      confirmBtn.removeAttribute("aria-busy");
    }
  });
  window.scrollOpenCrudModalIntoView?.();
  setTimeout(() => {
    try {
      ta?.focus();
    } catch (_) {}
  }, 50);
}

export function openInfoModal({
  title,
  subtitle = "",
  subtitleHtml = "",
  bodyHtml = "",
  wide = false,
  extraModalCardClass = "",
  secondaryActionsHtml = "",
  afterMount
}) {
  let modal = document.getElementById("crud-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "crud-modal";
    modal.className = "modal hidden";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<div class="modal-card modal-card-edit"><div id="crud-modal-content"></div></div>`;
    document.body.appendChild(modal);
  }
  const card = modal.querySelector(".modal-card");
  if (card) {
    const extra = [wide ? "modal-card-edit--wide-info" : "", extraModalCardClass].filter(Boolean).join(" ");
    card.className = `modal-card modal-card-edit${extra ? ` ${extra}` : ""}`;
  }
  const content = modal.querySelector("#crud-modal-content");
  const subtitleBlock = subtitleHtml
    ? subtitleHtml
    : subtitle
      ? `<p class="muted modal-head__subtitle">${escapeHtml(subtitle)}</p>`
      : "";
  const isPortalDetail = String(extraModalCardClass || "").includes("modal-card--portal-detail");
  const infoBodyClass = [
    "modal-info-body",
    wide ? "modal-info-body--profile" : "",
    isPortalDetail ? "modal-info-body--portal-detail" : ""
  ]
    .filter(Boolean)
    .join(" ");
  content.innerHTML = `
    ${renderModalHead(title, { subtitleHtml: subtitleBlock })}
    <div class="${escapeAttr(infoBodyClass)}">${bodyHtml}</div>
    ${renderModalFooterActions({
      showCancel: false,
      secondaryHtml: secondaryActionsHtml,
      primaryHtml: `<button type="button" id="crud-ok" class="btn btn-primary">${ic().x} Cerrar</button>`
    })}
  `;
  const close = () => modal.classList.add("hidden");
  modal.classList.remove("hidden");
  wireModalDismiss(content, close, { closeIds: ["crud-close"], okId: "crud-ok" });
  if (typeof afterMount === "function") {
    try {
      afterMount(content);
    } catch (err) {
      devWarn("openInfoModal afterMount", err);
    }
  }
  window.scrollOpenCrudModalIntoView?.();
}
