/**
 * Dominio contratación y RRHH (Colombia): compensación, parámetros laborales, pipeline de hiring,
 * contratos Word, avatar de empleado y barreras de permiso para acciones del portal.
 * Extraído desde `portal-runtime.js` (Fase 10).
 */
import {
  CO_PAYROLL,
  CO_HR_RULES,
  CO_TRANSPORT_ALLOWANCE_MAX_SMMLV,
  CO_INTEGRAL_SALARY_MIN_SMMLV,
  CO_CATALOGS,
  KEYS,
  PIPELINE,
  PIPELINE_TRANSITIONS,
  HIRING_RRHH_EDIT_ACTIONS,
  FLEET_DRIVER_EDIT_ACTIONS,
  LABOR_SYSTEM_PARAMETERS_MIN_YEAR,
  LABOR_SYSTEM_PARAMETERS_MAX_YEAR
} from "../core/config.js";
import { read } from "../core/data-io.js";
import { state, persistHrWorkspace } from "../core/store.js";
import {
  currentUser,
  canManageHiringModule,
  canEditFleetDriverAsAdmin,
  canPerformPermissionGatedAction,
  getPositionById,
  isAdminActor
} from "../core/auth.js";
import { colombiaTodayIsoDate, escapeAttr, escapeHtml, normalizePortalDateYmd } from "../core/utils.js";
import { notify, userMessage, ensureEmployeeContractFields, resolveEmployeeContractPlazoStartYmd } from "../ui/modals.js";
import { matchCatalogOptionValue, normalizeContractTemplateKind } from "../domain/payroll-catalog-sanitize.domain.js";

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Iconos del portal (`portal-icons.js` → `window.IC`). */
const IC = typeof globalThis !== "undefined" && globalThis.IC ? globalThis.IC : /** @type {Record<string, string>} */ ({});


const CO_TRANSPORT_ALLOWANCE_MAX_SMMLV = 2;
/** Salario integral (CST / práctica): referencia mínima habitual 13 SMMLV. */
const CO_INTEGRAL_SALARY_MIN_SMMLV = 13;
const CO_SYSTEM_PARAMS_DEFAULTS = {
  smmlvCop: CO_PAYROLL.smmlv,
  minMonthlySalaryCop: CO_HR_RULES.minMonthlySalary,
  transportAllowanceCop: CO_HR_RULES.transportAllowance,
  legalWeeklyHours: CO_HR_RULES.legalWeeklyHours,
  healthEmployeeRate: CO_PAYROLL.healthEmployeeRate,
  pensionEmployeeRate: CO_PAYROLL.pensionEmployeeRate,
  uvtCop: null,
  activeYear: new Date().getFullYear(),
  referenceMode: "automatic"
};

export function colombiaTransportAllowanceSalaryCapCop() {
  return Math.max(0, parseNum(CO_HR_RULES.minMonthlySalary)) * CO_TRANSPORT_ALLOWANCE_MAX_SMMLV;
}

export function colombiaTransportAllowanceEligible(baseSalary) {
  const salary = Math.max(0, parseNum(baseSalary));
  const cap = colombiaTransportAllowanceSalaryCapCop();
  return salary > 0 && cap > 0 && salary <= cap;
}

export function suggestedEmployeeTransportAllowanceCop(baseSalary) {
  return colombiaTransportAllowanceEligible(baseSalary) ? CO_HR_RULES.transportAllowance : 0;
}

export function resolveEmployeeTransportAllowanceCop(rawTransportAllowance, baseSalary) {
  if (!colombiaTransportAllowanceEligible(baseSalary)) return 0;
  const rawValue = String(rawTransportAllowance ?? "").trim();
  if (!rawValue) return CO_HR_RULES.transportAllowance;
  return Math.max(0, parseNum(rawTransportAllowance));
}

export function readEmployeeTransportAllowanceCop(employee) {
  if (!employee) return 0;
  const rawValue = employee.transportAllowance;
  if (rawValue != null && String(rawValue).trim() !== "") {
    return Math.max(0, parseNum(rawValue));
  }
  return suggestedEmployeeTransportAllowanceCop(employee.baseSalary);
}

export function readPositionTransportAllowanceCop(position) {
  if (!position) return 0;
  const rawValue = position.transportAllowance;
  if (rawValue != null && String(rawValue).trim() !== "") {
    return Math.max(0, parseNum(rawValue));
  }
  return suggestedEmployeeTransportAllowanceCop(position.baseSalary);
}

export function positionSalaryUsesSmmlv(baseSalary) {
  return parseNum(baseSalary) === parseNum(CO_HR_RULES.minMonthlySalary);
}

export function colombiaIntegralSalaryFloorCop() {
  return Math.max(0, parseNum(CO_HR_RULES.minMonthlySalary)) * CO_INTEGRAL_SALARY_MIN_SMMLV;
}

export function validateColombiaMonthlySalaryCop(salary, label = "Salario") {
  const amount = parseNum(salary);
  const minSalary = CO_HR_RULES.minMonthlySalary;
  if (amount < minSalary) {
    return {
      ok: false,
      message: `${label}: debe ser al menos el SMMLV vigente ($${minSalary.toLocaleString("es-CO")}).`
    };
  }
  return { ok: true, amount };
}

export function validateColombiaIntegralSalary(baseSalary, integralSalary) {
  const isIntegral = integralSalary === true || String(integralSalary || "").toLowerCase() === "true";
  if (!isIntegral) return { ok: true };
  const base = parseNum(baseSalary);
  const floor = colombiaIntegralSalaryFloorCop();
  if (base < floor) {
    return {
      ok: false,
      message: `Salario integral: el monto debe ser al menos 13 SMMLV ($${floor.toLocaleString("es-CO")}) según la norma laboral colombiana.`
    };
  }
  return { ok: true };
}

export function validateColombiaPositionCompensation(raw = {}) {
  const minCheck = validateColombiaMonthlySalaryCop(raw.baseSalary, "Salario base del cargo");
  if (!minCheck.ok) return minCheck;
  const integralCheck = validateColombiaIntegralSalary(minCheck.amount, raw.integralSalary);
  if (!integralCheck.ok) return integralCheck;
  return {
    ok: true,
    baseSalary: minCheck.amount,
    transportAllowance: resolveEmployeeTransportAllowanceCop(raw.transportAllowance, minCheck.amount)
  };
}

export function isVacancyAcceptingApplications(vacancy) {
  if (!vacancy) return false;
  if (String(vacancy.status || "").trim() !== "Publicada") return false;
  const deadline = String(vacancy.deadline || "").trim();
  if (!deadline) return true;
  const parts = deadline.split("-");
  if (parts.length !== 3) return true;
  const endTs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
  if (!Number.isFinite(endTs)) return true;
  const today = new Date();
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return endTs >= today0;
}

export function validateVacancySalaryOffer(salaryOffer, position) {
  const offerCheck = validateColombiaMonthlySalaryCop(salaryOffer, "Salario ofrecido");
  if (!offerCheck.ok) return offerCheck;
  if (position) {
    const catalogSalary = parseNum(position.baseSalary);
    if (catalogSalary > 0 && offerCheck.amount < catalogSalary) {
      return {
        ok: false,
        message: `El salario ofrecido no puede ser inferior al del cargo en catálogo ($${catalogSalary.toLocaleString("es-CO")}).`
      };
    }
  }
  return { ok: true, salaryOffer: offerCheck.amount };
}

export function validateWorkerMinimumAge(birthIso, label = "trabajador") {
  const birth = String(birthIso || "").trim().slice(0, 10);
  if (!birth) return { ok: true };
  const ageInfo = portalCandidateAgeFromBirthIso(birth);
  if (ageInfo.age === null) {
    return { ok: false, message: "Indique una fecha de nacimiento válida." };
  }
  if (ageInfo.age < 18) {
    return { ok: false, message: `El ${label} debe ser mayor de 18 años (Código Sustantivo del Trabajo).` };
  }
  return { ok: true };
}

export function setFormSelectValue(selectEl, value) {
  if (!selectEl || value == null) return;
  const v = String(value).trim();
  if (!v) return;
  const vLower = v.toLowerCase();
  const match = [...selectEl.options].find((o) => {
    const ov = String(o.value).trim();
    const ot = String(o.textContent || "").trim();
    return (
      ov === v ||
      ot === v ||
      (ov && ov.toLowerCase() === vLower) ||
      (ot && ot.toLowerCase() === vLower)
    );
  });
  if (match) selectEl.value = match.value;
}

/** ¿La opción del `<select>` corresponde al valor guardado? (exacto, etiqueta o sin distinguir mayúsculas). */
export function editModalSelectOptionSelected(opt, fieldValue) {
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

/**
 * Tras montar un modal CRUD: reaplica valores en selects, fechas y horas
 * (catálogos, BD en mayúsculas, ISO con hora, etc.).
 */
export function wireEditModalFieldValues(formEl, fields) {
  if (!formEl || !Array.isArray(fields)) return;
  fields.forEach((f) => {
    if (!f?.name) return;
    if (f.type === "select") {
      const sel = formEl.querySelector(`select[name="${f.name}"]`);
      if (sel && f.value != null && String(f.value).trim() !== "") {
        setFormSelectValue(sel, f.value);
      }
      return;
    }
    if (f.type === "date") {
      const norm = normalizePortalDateYmd(f.value);
      if (norm && typeof globalThis.setFormDateByName === "function") globalThis.setFormDateByName(formEl, f.name, norm);
      return;
    }
    if (f.type === "datetime-local") {
      if (f.value == null || String(f.value).trim() === "") return;
      const raw = String(f.value).trim();
      const local =
        raw.length >= 16 && raw.includes("T") ? raw.slice(0, 16) : String((typeof globalThis.toInputDate === "function" ? globalThis.toInputDate(raw) : "") || "").slice(0, 16);
      if (!local) return;
      const V = window.AntaresValidation;
      const hidden = formEl.querySelector(
        `input[type="hidden"][name="${f.name}"][data-portal-datetime-iso="1"]`
      );
      const wrap = hidden?.closest?.(".portal-datetime-dmy-row");
      if (wrap && V?.portalDatetimeInputSetIso) {
        V.portalDatetimeInputSetIso(wrap, local);
        return;
      }
      const inp = formEl.querySelector(`input[type="datetime-local"][name="${f.name}"]`);
      if (!inp) return;
      inp.value = local;
      V?.mountPortalDatetimeDmyInput?.(inp);
      const mountedWrap = inp.closest?.(".portal-datetime-dmy-row") || inp;
      V?.portalDatetimeInputSetIso?.(mountedWrap, local);
      return;
    }
    if (f.type === "time") {
      const inp = formEl.querySelector(`input[type="time"][name="${f.name}"]`);
      const raw = String(f.value ?? "").trim();
      if (inp && raw) inp.value = raw.length >= 5 ? raw.slice(0, 5) : raw;
    }
  });
}

/**
 * Precarga en el formulario de empleado los datos definidos en el catálogo de cargos (Contratación).
 */
export function applyPositionCatalogToEmployeeForm(form, position, options = {}) {
  const hintEl = form?.querySelector?.(options.hintSelector || "#emp-position-catalog-hint");
  if (!form) return false;
  if (!position) {
    if (hintEl) {
      hintEl.textContent =
        "Seleccione un cargo del catálogo para cargar salario, tipo de contrato, jornada, riesgo ARL y auxilio de transporte.";
    }
    const conductorBlock = form.querySelector("#hr-conductor-fields");
    if (conductorBlock) {
      conductorBlock.classList.remove("hidden");
      conductorBlock.removeAttribute("hidden");
    }
    return false;
  }

  const salaryEl = form.querySelector(options.salarySelector || "#emp-base-salary, input[name='baseSalary']");
  const contractEl = form.querySelector(options.contractSelector || "#emp-contract-type, select[name='contractType']");
  const transportEl = form.querySelector(options.auxSelector || "#emp-transport-allowance, input[name='transportAllowance']");
  const arlEl = form.querySelector(options.arlRiskSelector || "select[name='arlRiskLevel']");
  const templateEl = form.querySelector(options.templateSelector || "select[name='contractTemplateKind']");
  const scheduleEl = form.querySelector(options.scheduleSelector || "#emp-work-schedule, input[name='workSchedule']");

  const contractType = String(position.contractTypeDefault || "Termino indefinido").trim();
  const wr = String(position.workerRole || "empleado").toLowerCase();
  const schedule = String(position.workSchedule || position.schedule || "").trim();

  if (salaryEl) salaryEl.value = String(parseNum(position.baseSalary));
  if (contractEl) setFormSelectValue(contractEl, contractType);
  if (transportEl) {
    transportEl.value = String(readPositionTransportAllowanceCop(position));
    delete transportEl.dataset.userEdited;
  }
  if (arlEl && position.arlRiskLevel) setFormSelectValue(arlEl, position.arlRiskLevel);
  if (scheduleEl) scheduleEl.value = schedule;
  if (templateEl && window.RecruitmentDomain?.inferTemplateKind) {
    templateEl.value = window.RecruitmentDomain.inferTemplateKind(contractType, wr);
  }

  const conductorBlock = form.querySelector("#hr-conductor-fields");
  if (conductorBlock) {
    const isDriver = wr === "conductor";
    conductorBlock.classList.toggle("hidden", !isDriver);
    if (isDriver) conductorBlock.removeAttribute("hidden");
    else conductorBlock.setAttribute("hidden", "hidden");
    conductorBlock.querySelectorAll("input, select").forEach((inp) => {
      const name = String(inp.getAttribute("name") || "");
      if (!name) return;
      if (isDriver && ["license", "licenseCategory", "licenseExpiry"].includes(name)) {
        inp.setAttribute("required", "required");
      } else if (["license", "licenseCategory", "licenseExpiry"].includes(name)) {
        inp.removeAttribute("required");
      }
    });
  }

  if (hintEl) {
    const integral =
      position.integralSalary === true || String(position.integralSalary).toLowerCase() === "true";
    const bits = [
      `Cargo: ${String(position.name || "").trim()}`,
      wr === "conductor" ? "Conductor" : "Empleado",
      contractType ? `Contrato: ${contractType}` : "",
      schedule ? `Jornada: ${schedule}` : "",
      integral ? "Salario integral (catálogo)" : "",
      `Salario $${parseNum(position.baseSalary).toLocaleString("es-CO")}`,
      `Auxilio $${readPositionTransportAllowanceCop(position).toLocaleString("es-CO")}`
    ].filter(Boolean);
    hintEl.textContent = `${bits.join(" · ")}. Puede ajustar salario o auxilio si el pacto lo exige.`;
  }

  if (typeof options.onAfterApply === "function") options.onAfterApply(position);
  return true;
}

export function bindPositionCompensationFields(form, config = {}) {
  const basisSelect = form?.querySelector?.(config.basisSelector || 'select[name="salaryBasis"]');
  const salaryInput = form?.querySelector?.(config.salarySelector || 'input[name="baseSalary"]');
  const minSalary = CO_HR_RULES.minMonthlySalary;
  const transportRule = bindEmployeeTransportAllowanceRule(form, {
    salarySelector: config.salarySelector || 'input[name="baseSalary"]',
    auxSelector: config.auxSelector || 'input[name="transportAllowance"]',
    hintSelector: config.hintSelector || "#position-legal-comp-hint",
    preserveExistingValue: Boolean(config.preserveExistingValue)
  });
  if (!basisSelect || !salaryInput) return { sync: transportRule.sync };
  const syncBasis = () => {
    const isSmmlv = String(basisSelect.value || "smmlv") === "smmlv";
    if (isSmmlv) {
      salaryInput.value = String(minSalary);
      salaryInput.readOnly = true;
      salaryInput.setAttribute("readonly", "readonly");
    } else {
      salaryInput.readOnly = false;
      salaryInput.removeAttribute("readonly");
      if (parseNum(salaryInput.value) < minSalary) salaryInput.value = String(minSalary);
    }
    transportRule.sync({ force: isSmmlv });
  };
  basisSelect.addEventListener("change", syncBasis);
  salaryInput.addEventListener("input", () => {
    if (String(basisSelect.value || "") === "custom") transportRule.sync();
  });
  syncBasis();
  return {
    sync: ({ force = false } = {}) => {
      syncBasis();
      transportRule.sync({ force });
    }
  };
}

export function clampLaborSystemParameterYear(yearLike) {
  const y = Math.trunc(Number(yearLike) || new Date().getFullYear());
  return Math.min(LABOR_SYSTEM_PARAMETERS_MAX_YEAR, Math.max(LABOR_SYSTEM_PARAMETERS_MIN_YEAR, y));
}

export function employeeTransportAllowanceGuidance(baseSalary) {
  const legalAux = parseNum(CO_HR_RULES.transportAllowance).toLocaleString("es-CO");
  const cap = colombiaTransportAllowanceSalaryCapCop().toLocaleString("es-CO");
  const activeParams =
    (typeof window.normalizeSystemParametersPayload === "function"
      ? window.normalizeSystemParametersPayload(read(KEYS.systemParameters, null))
      : null) || CO_SYSTEM_PARAMS_DEFAULTS;
  const activeYear = clampLaborSystemParameterYear(activeParams.activeYear);
  if (colombiaTransportAllowanceEligible(baseSalary)) {
    return `${activeYear}: se sugiere auxilio legal de transporte/conectividad por $${legalAux}. Aplica hasta 2 SMMLV ($${cap}).`;
  }
  const salary = Math.max(0, parseNum(baseSalary));
  if (salary > 0) {
    return `${activeYear}: si el salario supera 2 SMMLV ($${cap}), el auxilio legal se registra en $0. Si la empresa reconoce un valor adicional, debe tratarse como beneficio extralegal.`;
  }
  return `${activeYear}: el SMMLV es $${parseNum(CO_HR_RULES.minMonthlySalary).toLocaleString("es-CO")} y el auxilio legal de transporte/conectividad es $${legalAux}.`;
}

export function bindEmployeeTransportAllowanceRule(form, config = {}) {
  const salaryInput = form?.querySelector?.(config.salarySelector || 'input[name="baseSalary"]');
  const auxInput = form?.querySelector?.(config.auxSelector || 'input[name="transportAllowance"]');
  const hintEl = form?.querySelector?.(config.hintSelector || "");
  const preserveExistingValue = Boolean(config.preserveExistingValue);
  if (!salaryInput || !auxInput) return { sync: () => {} };
  let initialized = false;
  const sync = ({ force = false } = {}) => {
    const baseSalary = parseNum(salaryInput.value);
    const eligible = colombiaTransportAllowanceEligible(baseSalary);
    const preserveOnInit = preserveExistingValue && !initialized;
    if (!preserveOnInit) {
      if (force || auxInput.dataset.userEdited !== "1" || !eligible) {
        auxInput.value = String(suggestedEmployeeTransportAllowanceCop(baseSalary));
      }
    } else if (!eligible) {
      auxInput.value = "0";
    }
    if (!eligible) delete auxInput.dataset.userEdited;
    if (hintEl) hintEl.textContent = employeeTransportAllowanceGuidance(baseSalary);
    initialized = true;
  };
  salaryInput.addEventListener("input", () => sync());
  auxInput.addEventListener("input", () => {
    auxInput.dataset.userEdited = "1";
    if (hintEl) hintEl.textContent = employeeTransportAllowanceGuidance(salaryInput.value);
  });
  sync({ force: !preserveExistingValue });
  return { sync };
}

export function applyLaborSystemParametersApiResponse(saved) {
  if (saved?.systemParameters && typeof window.applySystemParametersFromBootstrapPayload === "function") {
    window.applySystemParametersFromBootstrapPayload(saved.systemParameters);
  }
  if (saved?.systemParametersHistory !== undefined) {
    state.systemParametersHistory = Array.isArray(saved.systemParametersHistory) ? saved.systemParametersHistory : [];
  }
}

export function laborSystemParametersHistoryRows() {
  return Array.isArray(state.systemParametersHistory) ? state.systemParametersHistory.filter(Boolean) : [];
}

export function laborSystemParametersDraftForYear(yearLike, historyRows = laborSystemParametersHistoryRows()) {
  const active =
    (typeof window.normalizeSystemParametersPayload === "function"
      ? window.normalizeSystemParametersPayload(read(KEYS.systemParameters, null))
      : null) || CO_SYSTEM_PARAMS_DEFAULTS;
  const numericYear = clampLaborSystemParameterYear(yearLike);
  const exact = historyRows.find((row) => Number(row?.year) === numericYear) || null;
  const fallback = exact || historyRows[0] || {};
  return {
    year: numericYear,
    effectiveFrom: String(fallback.effectiveFrom || `${numericYear}-01-01`),
    effectiveTo: String(fallback.effectiveTo || `${numericYear}-12-31`),
    smmlvCop: Math.max(0, parseNum(fallback.smmlvCop ?? fallback.minMonthlySalaryCop ?? active.smmlvCop)),
    minMonthlySalaryCop: Math.max(
      0,
      parseNum(fallback.minMonthlySalaryCop ?? fallback.smmlvCop ?? active.minMonthlySalaryCop)
    ),
    transportAllowanceCop: Math.max(0, parseNum(fallback.transportAllowanceCop ?? active.transportAllowanceCop)),
    legalWeeklyHours: Math.max(0, parseNum(fallback.legalWeeklyHours ?? active.legalWeeklyHours)),
    healthEmployeeRate: Math.max(0, parseNum(fallback.healthEmployeeRate ?? active.healthEmployeeRate)),
    pensionEmployeeRate: Math.max(0, parseNum(fallback.pensionEmployeeRate ?? active.pensionEmployeeRate)),
    uvtCop: Math.max(0, parseNum(fallback.uvtCop ?? active.uvtCop ?? 0)),
    activeYear: clampLaborSystemParameterYear(active.activeYear || numericYear),
    referenceMode: active.referenceMode === "manual" ? "manual" : "automatic",
    isCurrent: Boolean(fallback.isCurrent)
  };
}

export function laborSystemParametersSelectableYears(historyRows = laborSystemParametersHistoryRows()) {
  const years = new Set(
    (Array.isArray(historyRows) ? historyRows : [])
      .map((row) => Number(row?.year) || 0)
      .filter((y) => y >= LABOR_SYSTEM_PARAMETERS_MIN_YEAR && y <= LABOR_SYSTEM_PARAMETERS_MAX_YEAR)
  );
  for (let y = LABOR_SYSTEM_PARAMETERS_MIN_YEAR; y <= LABOR_SYSTEM_PARAMETERS_MAX_YEAR; y += 1) {
    years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

export function renderPayrollLegalHistoryCard(row, allRuns = [], { canDelete = false } = {}) {
  const rowYear = Number(row?.year) || 0;
  const rowRuns = (Array.isArray(allRuns) ? allRuns : []).filter((run) =>
    String(run.month || "").startsWith(`${rowYear}`)
  ).length;
  const healthPct = ((parseNum(row.healthEmployeeRate) || 0) * 100).toFixed(2).replace(/\.00$/, "");
  const pensionPct = ((parseNum(row.pensionEmployeeRate) || 0) * 100).toFixed(2).replace(/\.00$/, "");
  const statusHtml = row.isCurrent
    ? '<span class="status status-completada">Vigente hoy</span>'
    : '<span class="status">Histórica</span>';
  return `<article class="payroll-legal-vigencia-card${row.isCurrent ? " is-current" : ""}" data-legal-year="${escapeAttr(String(rowYear))}">
    <header class="payroll-legal-vigencia-card__head">
      <div>
        <p class="payroll-legal-vigencia-card__year">${escapeHtml(String(rowYear || "—"))}</p>
        <p class="muted payroll-legal-vigencia-card__range">${escapeHtml(String(row.effectiveFrom || "—"))} → ${escapeHtml(String(row.effectiveTo || "—"))}</p>
      </div>
      ${statusHtml}
    </header>
    <dl class="payroll-legal-vigencia-card__metrics">
      <div><dt>SMMLV</dt><dd>$${parseNum(row.smmlvCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Auxilio</dt><dd>$${parseNum(row.transportAllowanceCop).toLocaleString("es-CO")}</dd></div>
      <div><dt>Salud / pensión</dt><dd>${healthPct}% / ${pensionPct}%</dd></div>
      <div><dt>UVT</dt><dd>${row.uvtCop != null ? `$${parseNum(row.uvtCop).toLocaleString("es-CO")}` : "—"}</dd></div>
      <div><dt>Horas / liq.</dt><dd>${escapeHtml(String(parseNum(row.legalWeeklyHours || 0) || "—"))} · <strong>${rowRuns}</strong></dd></div>
    </dl>
    <footer class="payroll-legal-vigencia-card__actions toolbar">
      <button type="button" class="btn btn-sm btn-outline" data-action="payroll-legal-set-year" data-year="${escapeAttr(String(rowYear))}">${IC.edit} Editar</button>
      ${
        canDelete
          ? `<button type="button" class="btn btn-sm btn-reject" data-action="payroll-legal-delete" data-year="${escapeAttr(String(rowYear))}" title="Eliminar vigencia del año (solo administradores)">${IC.trash} Eliminar</button>`
          : ""
      }
    </footer>
  </article>`;
}


export function selectOptionsFromCatalog(values = [], selected = "", placeholder = "Seleccione...") {
  const matched = matchCatalogOptionValue(values, selected);
  const normalizedSelected = String(matched || selected || "").trim();
  const list = Array.isArray(values) ? [...values] : [];
  if (
    normalizedSelected &&
    !list.some((v) => String(v).trim().toLowerCase() === normalizedSelected.toLowerCase())
  ) {
    list.push(normalizedSelected);
  }
  const options = list.map((value) => {
    const safeValue = String(value || "").trim();
    const sel =
      safeValue === normalizedSelected ||
      safeValue.toLowerCase() === normalizedSelected.toLowerCase()
        ? "selected"
        : "";
    return `<option value="${safeValue}" ${sel}>${safeValue}</option>`;
  });
  return [`<option value="">${placeholder}</option>`, ...options].join("");
}

/** Opciones `{ value, label }` para `openEditModal`: incluye valor guardado aunque no esté en el catálogo. */
export function editModalCatalogSelectOptions(catalog, selected, placeholder = "Seleccione...") {
  const matched = matchCatalogOptionValue(catalog, selected);
  const values = Array.isArray(catalog) ? [...catalog] : [];
  if (matched && !values.some((v) => String(v).trim() === String(matched).trim())) {
    values.push(matched);
  }
  return [{ value: "", label: placeholder }, ...values.map((item) => ({ value: item, label: item }))];
}

export function validateCandidatePipelineTransition(candidate, nextStatus) {
  const currentStatus = String(candidate?.status || PIPELINE[0]);
  const targetStatus = String(nextStatus || currentStatus);
  if (currentStatus === targetStatus) return { ok: true };
  const allowed = PIPELINE_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return { ok: false, message: `Flujo invalido: ${currentStatus} -> ${targetStatus}. Debes respetar el orden del pipeline.` };
  }
  if (targetStatus === "Oferta enviada") {
    const hasInterview = read(KEYS.interviews, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    if (!hasInterview) {
      return { ok: false, message: "Para enviar oferta primero debes registrar entrevista del candidato." };
    }
  }
  if (targetStatus === "Contratado") {
    const byCandidate = read(KEYS.contracts, []).some((item) => String(item.candidateId || "") === String(candidate.id || ""));
    const candDoc = String(candidate.idDoc || "").trim();
    const byEmployeeDoc =
      Boolean(candDoc) &&
      read(KEYS.contracts, []).some((item) => {
        if (!item.employeeId) return false;
        const emp = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(item.employeeId));
        return emp && String(emp.idDoc || "").trim() === candDoc;
      });
    if (!byCandidate && !byEmployeeDoc) {
      return {
        ok: false,
        message:
          "Para marcar como contratado debe existir un contrato generado (desde Gestión humana o Contratación, misma cédula) o el registro histórico por candidato."
      };
    }
  }
  return { ok: true };
}

export function canPerformHiringEditAction(action) {
  return HIRING_RRHH_EDIT_ACTIONS.has(String(action || "")) && canManageHiringModule();
}

export function hiringPipelineStatusClass(status) {
  const s = String(status || "");
  if (s === "Contratado") return "status-viaje_asignado";
  if (s === "Descartado") return "status-rechazada";
  if (s === "Oferta enviada") return "status-viaje_completado";
  if (s === "Entrevistado") return "status-en_transito";
  if (s === "Preseleccionado") return "status-pendiente";
  return "status-pendiente";
}

export function hiringPipelineSelectOptions(currentStatus) {
  const current = String(currentStatus || PIPELINE[0]);
  const allowed = PIPELINE_TRANSITIONS[current] || [];
  const options = new Set([current, ...allowed]);
  return [...options]
    .map((p) => `<option value="${escapeAttr(p)}"${p === current ? " selected" : ""}>${escapeHtml(p)}</option>`)
    .join("");
}

export function computeHiringConversionPct(candidates) {
  const rows = Array.isArray(candidates) ? candidates : [];
  if (!rows.length) return 0;
  const hired = rows.filter((c) => String(c.status || "") === "Contratado").length;
  return Math.round((hired / rows.length) * 100);
}

export function formatInterviewModeLabel(mode) {
  const m = String(mode || "").trim().toLowerCase();
  if (m === "virtual") return "Virtual";
  if (m === "telefonica" || m === "telefónica") return "Telefónica";
  if (m === "presencial") return "Presencial";
  return mode ? String(mode) : "—";
}

export function getCandidateVacancyAndPosition(candidate) {
  const vacancy =
    read(KEYS.vacancies, []).find((v) => String(v.id) === String(candidate?.vacancyId || "")) || null;
  const position = vacancy ? getPositionById(String(vacancy.positionId || "")) : null;
  return { vacancy, position };
}

export function hiringEmptyState(text, cta = null) {
  const ctaHtml =
    cta && cta.action
      ? `<div class="hiring-empty-actions"><button type="button" class="btn btn-primary btn-sm" data-action="${escapeAttr(
          cta.action
        )}"${cta.section ? ` data-section="${escapeAttr(cta.section)}"` : ""}>${IC.plus} ${escapeHtml(
          cta.label || "Registrar"
        )}</button></div>`
      : "";
  return `<div class="empty-state hiring-empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><p>${escapeHtml(
    text
  )}</p>${ctaHtml}</div>`;
}

export function applyCandidateToEmployeeForm(form, candidate) {
  if (!form || !candidate) return false;
  const { position } = getCandidateVacancyAndPosition(candidate);
  const setVal = (selector, value) => {
    const el = form.querySelector(selector);
    if (el && value != null && String(value).trim() !== "") el.value = String(value);
  };
  setVal("input[name='name']", candidate.name);
  setVal("select[name='documentType']", candidate.documentType || "CC");
  setVal("input[name='idDoc']", candidate.idDoc);
  const setDate = (name, iso) => {
    const ymd = normalizePortalDateYmd(iso);
    if (!ymd) return;
    window.AntaresValidation?.setPortalFormDateByName?.(form, name, ymd);
  };
  setDate("birthDate", String(candidate.birthDate || "").slice(0, 10));
  setVal("select[name='educationLevel']", candidate.educationLevel);
  setVal("input[name='phone']", candidate.phone);
  setVal("input[name='personalEmail']", candidate.email);
  setVal("input[name='address']", candidate.address);
  setDate("startDate", colombiaTodayIsoDate());
  const deptSel = form.querySelector("select[name='department']");
  if (deptSel && candidate.department) {
    setFormSelectValue(deptSel, candidate.department);
    deptSel.dispatchEvent(new Event("change", { bubbles: true }));
    requestAnimationFrame(() => setVal("select[name='city']", candidate.city));
  } else {
    setVal("select[name='city']", candidate.city);
  }
  const posSel = form.querySelector("#emp-position-select, select[name='positionId']");
  if (posSel && position) {
    setFormSelectValue(posSel, position.id);
    posSel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const hintEl = form.querySelector("#emp-position-catalog-hint");
  if (hintEl) {
    hintEl.textContent = `Datos precargados desde candidato «${String(candidate.name || "").trim()}». Complete seguridad social, banco y demás campos obligatorios antes de guardar.`;
  }
  form.dataset.prefillCandidateId = String(candidate.id || "");
  return true;
}

export function openPayrollEmployeeFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  state.hiringUi = { ...(state.hiringUi || {}), prefillEmployeeFromCandidateId: cid };
  state.payrollUi = { ...(state.payrollUi || {}), workspace: "operate", operateSection: "employee" };
  state.createPanels = { ...(state.createPanels || {}), "create-employee": true };
  persistHrWorkspace("payroll", "operate");
  persistHrWorkspace("hiring", state.hiringUi?.workspace || "data");
  state.currentView = "payroll";
  globalThis.renderPortalView?.();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => globalThis.scrollToCreatePanelForm?.("create-employee"));
  });
}

export function openHiringContractFromCandidate(candidateId) {
  const cid = String(candidateId || "").trim();
  if (!cid) return;
  state.hiringUi = {
    ...(state.hiringUi || {}),
    prefillContractFromCandidateId: cid,
    workspace: "operate",
    operateSection: "contract"
  };
  state.createPanels = { ...(state.createPanels || {}), "create-contract": true };
  persistHrWorkspace("hiring", "operate");
  globalThis.renderPortalView?.();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => globalThis.scrollToCreatePanelForm?.("create-contract"));
  });
}

export function prepareEmployeeForContractDocx(employee) {
  const e = ensureEmployeeContractFields((typeof globalThis.normalizePayrollEmployeeRowDates === "function" ? globalThis.normalizePayrollEmployeeRowDates : (e) => e)({ ...(employee || {}) }));
  const positionName = getPositionById(String(e.positionId || ""))?.name || String(e.position || "").trim();
  const wr = String(
    e.workerRole || (positionName.toLowerCase().includes("conductor") ? "conductor" : "empleado")
  );
  const contractType = String(e.contractType || "Termino indefinido").trim();
  let contractDuration = String(e.contractDuration || e.contractDurationText || "").trim();
  if (!contractDuration && isFixedTermContractType(contractType)) {
    contractDuration = "1 año";
  }
  return {
    ...e,
    position: positionName || e.position,
    workerRole: wr,
    city: String(e.city || "").trim(),
    bankName: matchCatalogOptionValue(CO_CATALOGS.banks, e.bankName),
    bankAccountType: matchCatalogOptionValue(CO_CATALOGS.accountTypes, e.bankAccountType || "Ahorros"),
    eps: matchCatalogOptionValue(CO_CATALOGS.eps, e.eps),
    pensionFund: matchCatalogOptionValue(CO_CATALOGS.pensionFunds, e.pensionFund),
    arl: matchCatalogOptionValue(CO_CATALOGS.arl, e.arl),
    contractTemplateKind: normalizeContractTemplateKind(e.contractTemplateKind, contractType, wr),
    contractDuration
  };
}

export function portalCandidateAgeFromBirthIso(birthIso) {
  const s = String(birthIso ?? "")
    .trim()
    .slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return { age: null, birthLabel: "—" };
  const [y, mo, d] = s.split("-").map((x) => Number(x));
  const birth = new Date(y, mo - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== mo - 1 || birth.getDate() !== d) {
    return { age: null, birthLabel: s };
  }
  const today = new Date();
  let age = today.getFullYear() - y;
  const md = today.getMonth() - (mo - 1);
  if (md < 0 || (md === 0 && today.getDate() < d)) age -= 1;
  return { age, birthLabel: s };
}

export function renderHiringCandidateCard(c, ctx) {
  const ageInfo = portalCandidateAgeFromBirthIso(c.birthDate);
  const expCargo = parseNum(c.experienceYears || 0);
  const canDlCv = Boolean(ctx.canDlCv);
  const statusClass = hiringPipelineStatusClass(c.status);
  const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
  return `<article class="hiring-candidate-card">
    <header class="hiring-candidate-card__head">
      <div>
        <h4>${escapeHtml(String(c.name || ""))}</h4>
        <p class="muted">${escapeHtml(String(c.vacancyTitle || "-"))}</p>
      </div>
      <span class="status ${statusClass}">${escapeHtml(String(c.status || ""))}</span>
    </header>
    <dl class="hiring-candidate-card__meta">
      <div><dt>Contacto</dt><dd>${escapeHtml(String(c.email || "-"))}<br><span class="muted">${escapeHtml(String(c.phone || "-"))}</span></dd></div>
      <div><dt>Experiencia</dt><dd>${expCargo} años · Edad ${ageInfo.age != null ? `${ageInfo.age} años` : "—"}</dd></div>
      <div><dt>Etapa</dt><dd><select class="hiring-status-select" data-action="candidate-status" data-id="${escapeAttr(String(c.id))}">${hiringPipelineSelectOptions(c.status)}</select></dd></div>
    </dl>
    <div class="toolbar hiring-candidate-card__actions">
      <button class="btn btn-sm btn-outline" data-action="view-candidate" data-id="${escapeAttr(String(c.id))}">${IC.eye} Ver</button>
      ${
        ctx.canScheduleInterview
          ? `<button type="button" class="btn btn-sm btn-action" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.calendar} Entrevista</button>`
          : ""
      }
      <button type="button" class="btn btn-sm btn-action"${canDlCv ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.download} CV</button>
      ${
        ctx.canEdit
          ? `<button class="btn btn-sm btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Abrir alta de empleado con datos precargados">${IC.userPlus} Empleado</button>`
          : ""
      }
      ${
        ctx.canEdit && employeeMatch
          ? `<button class="btn btn-sm btn-action" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}" title="Generar contrato Word">${IC.file} Contrato</button>`
          : ""
      }
      ${ctx.canEdit ? `<button class="btn btn-sm btn-action" data-action="edit-candidate" data-id="${escapeAttr(String(c.id))}">${IC.edit} Editar</button>` : ""}
      ${ctx.canDelete ? `<button class="btn btn-sm btn-reject" data-action="delete-candidate" data-id="${escapeAttr(String(c.id))}" title="Solo administradores">${IC.trash}</button>` : ""}
    </div>
  </article>`;
}

export function describeContractDurationForDocx(data) {
  const ct = String(data.contractType || "");
  const start = String(data.startDate || "").trim();
  const end = String(data.endDate || data.contractEndDate || "").trim();
  if (ct === "Termino fijo" && start && end) return `Término fijo: ${start} a ${end}`;
  if (ct === "Termino fijo") return "Término fijo (plazo contractual en cláusulas)";
  if (ct === "Prestacion de servicios") return "Prestación de servicios";
  return start ? `Vigencia desde ${start} · ${ct || "según anexo"}` : String(ct || "Según cláusulas y normativa aplicable");
}

/** Descompone texto guardado (p. ej. "12 meses", "1 año") para el formulario de edición. */
export function parseContractDurationFields(text) {
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

/** Arma el texto único `contractDuration` a partir de unidad + cantidad u “otro” (texto libre). */
export function composeContractDurationText(raw) {
  const unit = String(raw.contractDurationUnit || "").trim().toLowerCase();
  const parsedAmt = parseInt(String(raw.contractDurationAmount ?? "").trim(), 10);
  const amount = Number.isFinite(parsedAmt) ? Math.floor(parsedAmt) : NaN;
  const other = String(raw.contractDurationOther || "").trim();
  const legacy = String(raw.contractDuration || "").trim();
  if (unit === "otro") return other;
  if (unit === "meses" && Number.isFinite(amount) && amount >= 1) {
    return `${amount} ${amount === 1 ? "mes" : "meses"}`;
  }
  if (unit === "anios" && Number.isFinite(amount) && amount >= 1) {
    return `${amount} ${amount === 1 ? "año" : "años"}`;
  }
  return legacy;
}

export async function resolveEmployeeAvatarUrl(file, fallbackDataUrl = "") {
  if (!file) return String(fallbackDataUrl || "").trim();
  const api = window.AntaresApi;
  const rawMime = String(file.type || "image/jpeg").split(";")[0].trim().toLowerCase();
  const contentType =
    !rawMime || rawMime === "image/jpg" || rawMime === "image/pjpeg" ? "image/jpeg" : rawMime;
  const canUseBackend =
    api &&
    typeof api.postJson === "function" &&
    typeof api.getBase === "function" &&
    api.getBase() &&
    typeof api.getAccessToken === "function" &&
    api.getAccessToken();

  if (canUseBackend) {
    let publicFromPresign = "";
    try {
      const presign = await api.postJson("/uploads/avatar/presign", {
        fileName: String(file.name || "avatar.jpg"),
        contentType
      });
      const uploadUrl = String(presign?.uploadUrl || "").trim();
      publicFromPresign = String(presign?.publicUrl || "").trim();
      if (uploadUrl) {
        const resp = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file
        });
        if (!resp.ok) throw new Error(`R2 PUT respondió ${resp.status}`);
      }
    } catch (err) {
      globalThis.devWarn?.("avatar-upload-r2-presign-failed", err);
      publicFromPresign = "";
    }
    if (/^https?:\/\//i.test(publicFromPresign)) return publicFromPresign;

    try {
      if (typeof api.postFormData === "function") {
        const fd = new FormData();
        fd.append("file", file, file.name || "upload.jpg");
        const viaServer = await api.postFormData("/uploads/image", fd);
        const u = String(viaServer?.publicUrl || "").trim();
        if (/^https?:\/\//i.test(u)) return u;
      }
    } catch (err) {
      globalThis.devWarn?.("avatar-upload-api-failed", err);
    }
  }

  return new Promise((resolve) => {
    const r = new FileReader();
    r.onerror = () => resolve(String(fallbackDataUrl || "").trim());
    r.onload = () => resolve(String(r.result || "").trim());
    r.readAsDataURL(file);
  });
}

/** Vista previa local en el óvalo (misma lógica que perfil de usuario). */
export function bindEmployeeAvatarFilePreview(fileInput, labelEl) {
  if (!fileInput || !labelEl) return;
  let previewBlobUrl = "";
  fileInput.addEventListener("change", () => {
    const f = fileInput.files?.[0];
    if (!f || !String(f.type || "").startsWith("image/")) return;
    if (previewBlobUrl && previewBlobUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewBlobUrl);
      } catch (_e) {}
      previewBlobUrl = "";
    }
    try {
      previewBlobUrl = URL.createObjectURL(f);
    } catch (_e) {
      previewBlobUrl = "";
    }
    const cssSafe = previewBlobUrl ? previewBlobUrl.replace(/'/g, "\\'") : "";
    labelEl.style.backgroundImage = cssSafe ? `url('${cssSafe}')` : "";
    labelEl.classList.toggle("has-image", Boolean(cssSafe));
    const initial = labelEl.querySelector(".profile-avatar-initial");
    if (initial) initial.textContent = "";
  });
}

export function employeeAvatarCssUrl(av) {
  const u = String(av || "").trim();
  if (/^https?:\/\//i.test(u) || /^data:image\//i.test(u)) return u.replace(/'/g, "\\'");
  return "";
}

export function contractTemplateFileName(kind) {
  const k = String(kind || "").trim().toLowerCase();
  return window.RecruitmentDomain?.TEMPLATE_FILE_BY_KIND?.[k] || "";
}

export function renderContractTemplateSelectOptions(selectedKind = "", includeAuto = false) {
  const kinds = ["oficina", "fijo", "prestacion"];
  const cur = String(selectedKind || "").trim().toLowerCase();
  let html = includeAuto
    ? `<option value="">${escapeHtml("Automatica segun tipo de contrato y rol")}</option>`
    : "";
  for (const k of kinds) {
    const label = contractTemplateFileName(k) || k;
    html += `<option value="${escapeAttr(k)}"${cur === k ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }
  return html;
}

export function renderContractMergePreviewHtml(employee, opts = {}) {
  if (!employee) {
    return `<p class="muted" style="margin:0">${escapeHtml("Seleccione un empleado para ver los datos que se insertaran en el Word (solo marcadores de la plataforma).")}</p>`;
  }
  const missing = validateEmployeeContractDocFields(employee);
  const payload = buildEmployeeContractDocxPayload(employee, opts);
  const file = contractTemplateFileName(payload.contractTemplateKind) || payload.contractTemplateKind;
  const rows = [
    ["Archivo", file],
    ["Nombre", payload.nombre_empleado],
    ["Documento", payload.cedula_empleado],
    ["Ciudad / municipio", payload.ciudad_empleado],
    ["Cargo", payload.cargo_empleado],
    ["Salario", payload.salario ? `$${Math.round(Number(payload.salario)).toLocaleString("es-CO")}` : ""],
    ["Salario en letras", payload.salario_letras],
    ["Duracion", payload.duracion_contrato],
    ["Banco", payload.banco_cuenta_bancaria],
    ["Cuenta", payload.cuenta_bancaria],
    ["Fecha firma (constancia)", opts.signDate || ""]
  ];
  const missHtml = missing.length
    ? `<p class="muted" style="margin:0 0 0.5rem;color:var(--danger,#c0392b)">${escapeHtml(`Faltan en la ficha: ${missing.join(", ")}`)}</p>`
    : "";
  const body = rows
    .filter(([, v]) => String(v || "").trim())
    .map(
      ([k, v]) =>
        `<tr><th scope="row" style="text-align:left;padding:0.2rem 0.75rem 0.2rem 0;white-space:nowrap">${escapeHtml(k)}</th><td style="padding:0.2rem 0">${escapeHtml(String(v))}</td></tr>`
    )
    .join("");
  return `${missHtml}<table class="contract-merge-preview-table" style="width:100%;font-size:0.88rem;border-collapse:collapse"><tbody>${body}</tbody></table>`;
}

export function syncContractFormFromSelection(form) {
  if (!form) return;
  const employeeSelect = form.querySelector("select[name='employeeId']");
  const candidateSelect = form.querySelector("select[name='candidateId']");
  const personMode = String(form.querySelector("#contract-person-mode")?.value || "employee");
  const templateSelect = form.querySelector("select[name='contractTemplateKind']");
  const signDateEl = form.querySelector("input[name='signDate']");
  const previewEl = form.querySelector("[data-contract-merge-preview]");
  let employee = read(KEYS.payrollEmployees, []).find(
    (item) => String(item.id) === String(employeeSelect?.value || "")
  );
  if (personMode === "candidate") {
    const candidate = read(KEYS.candidates, []).find(
      (item) => String(item.id) === String(candidateSelect?.value || "")
    );
    employee = candidate ? findPayrollEmployeeByIdDoc(candidate.idDoc) : null;
  }
  if (!employee) {
    if (previewEl) previewEl.innerHTML = renderContractMergePreviewHtml(null);
    return;
  }
  const empTpl = String(employee.contractTemplateKind || "").trim().toLowerCase();
  if (templateSelect) {
    if (empTpl && [...templateSelect.options].some((o) => String(o.value) === empTpl)) {
      templateSelect.value = empTpl;
    } else if (!String(templateSelect.value || "").trim() && window.RecruitmentDomain?.inferTemplateKind) {
      const wr =
        employee.workerRole ||
        (String(employee.position || "").toLowerCase().includes("conductor") ? "conductor" : "empleado");
      templateSelect.value = window.RecruitmentDomain.inferTemplateKind(
        employee.contractType || "Termino indefinido",
        wr
      );
    }
  }
  const signDate = String(signDateEl?.value || colombiaTodayIsoDate()).trim();
  const kind = String(templateSelect?.value || "").trim();
  if (previewEl) {
    previewEl.innerHTML = renderContractMergePreviewHtml(employee, {
      contractTemplateKind: kind,
      signDate
    });
  }
}

export function buildEmployeeContractDocxPayload(employee, opts = {}) {
  const emp = prepareEmployeeForContractDocx(employee);
  let kind = normalizeContractTemplateKind(
    opts.contractTemplateKind || emp.contractTemplateKind,
    emp.contractType,
    emp.workerRole
  );
  const signDate = String(opts.signDate || emp.startDate || colombiaTodayIsoDate()).trim();
  const positionName = String(emp.position || "").trim();
  const wr = String(emp.workerRole || "empleado");
  const ct = String(emp.contractType || "Termino indefinido");
  const templates = window.RecruitmentDomain?.TEMPLATE_BY_KIND || {};
  if (!kind || !templates[kind]) {
    kind = window.RecruitmentDomain?.inferTemplateKind ? window.RecruitmentDomain.inferTemplateKind(ct, wr) : "oficina";
  }
  const base = parseNum(emp.baseSalary);
  const wordsSalary =
    window.RecruitmentDomain?.formatSalarioLetrasPesos
      ? window.RecruitmentDomain.formatSalarioLetrasPesos(base)
      : "";
  return {
    contractTemplateKind: kind,
    contractType: ct,
    workerRole: wr,
    nombre_empleado: String(emp.name || "").trim(),
    cedula_empleado: String(emp.idDoc || "").trim(),
    ciudad_empleado: String(emp.city || "").trim(),
    municipio_empleado: String(emp.city || "").trim(),
    departamento_empleado: String(emp.department || "").trim(),
    banco_cuenta_bancaria: String(emp.bankName || "").trim(),
    cuenta_bancaria: String(emp.bankAccount || "").trim(),
    salario: base,
    salario_letras: wordsSalary,
    duracion_contrato:
      String(emp.contractDuration || emp.contractDurationText || "").trim() ||
      describeContractDurationForDocx({
        contractType: ct,
        startDate: resolveEmployeeContractPlazoStartYmd(emp) || signDate,
        endDate: emp.contractEndDate || emp.endDate || ""
      }),
    cargo_empleado: positionName,
    signDate
  };
}

export async function generateOfficialWordContract(payload) {
  if (!window.RecruitmentDomain?.generateEmployeeContractDocx) {
    throw new Error("Módulo de contratos Word no disponible (recarga la página).");
  }
  return window.RecruitmentDomain.generateEmployeeContractDocx(payload);
}

/** Valores de ejemplo para generar un Word de prueba sin persistir contrato. */
export function buildContractDocxTestPayload(templateKind) {
  const kind = String(templateKind || "oficina").toLowerCase();
  const contractType =
    kind === "prestacion" ? "Prestacion de servicios" : kind === "fijo" ? "Termino fijo" : "Termino indefinido";
  const workerRole = kind === "prestacion" ? "conductor" : "empleado";
  const today = colombiaTodayIsoDate();
  const endDate = kind === "fijo" ? "2027-12-31" : "";
  return {
    contractTemplateKind: kind,
    contractType,
    workerRole,
    nombre_empleado: "Nombre Apellido Ejemplo",
    cedula_empleado: "1000000000",
    ciudad_empleado: "Bogota D.C.",
    departamento_empleado: "Cundinamarca",
    banco_cuenta_bancaria: "Bancolombia",
    cuenta_bancaria: "000000000000",
    salario: CO_HR_RULES.minMonthlySalary,
    salario_letras: "",
    duracion_contrato: describeContractDurationForDocx({ contractType, startDate: today, endDate }),
    cargo_empleado: kind === "prestacion" ? "Conductor nacional (ejemplo C2)" : "Auxiliar administrativo (ejemplo)",
    signDate: today
  };
}

/** Acciones que los usuarios que no son administrador no pueden ejecutar (listeners capture en `viewRoot`, una sola vez). */
const PORTAL_NON_ADMIN_BLOCKED_ACTIONS = new Set([
  "approve",
  "reject",
  "edit-admin",
  "delete-admin",
  "trip-status",
  "delete-trip",
  "edit-vehicle",
  "toggle-vehicle",
  "delete-vehicle",
  "edit-driver",
  "toggle-driver",
  "delete-driver",
  "delete-route-rate",
  "delete-employee",
  "delete-vacancy",
  "toggle-position",
  "candidate-status",
  "open-edit-user",
  "delete-user",
  "approve-registration",
  "reject-registration",
  "approval-approve",
  "approval-reject",
  "open-edit-company",
  "close-edit-company",
  "toggle-company-active",
  "delete-company",
  "delete-payroll-run",
  "delete-hr-absence",
  "edit-hr-absence",
  "edit-vacancy",
  "edit-position",
  "delete-position",
  "edit-candidate",
  "delete-candidate",
  "edit-interview",
  "delete-interview",
  "delete-contract",
  "edit-sst-record",
  "delete-sst-record",
  "toggle-deleted-requests-log",
  "deleted-request-snapshot-detail",
  "toggle-deleted-trips-log",
  "deleted-trip-snapshot-detail"
]);

export function portalNonAdminRestrictedCaptureClick(event) {
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (FLEET_DRIVER_EDIT_ACTIONS.has(action)) {
    if (canEditFleetDriverAsAdmin()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driversManageForbidden"), "error");
    return;
  }
  if (action === "delete-driver") {
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driverDeleteUseHr"), "error");
    return;
  }
  if (isAdminActor()) return;
  if (canPerformHiringEditAction(action)) return;
  if (canPerformPermissionGatedAction(currentUser(), action, trigger)) return;
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

export function portalNonAdminRestrictedCaptureChange(event) {
  const trigger = event.target.closest("[data-action]");
  const action = String(trigger?.dataset?.action || "");
  if (FLEET_DRIVER_EDIT_ACTIONS.has(action)) {
    if (canEditFleetDriverAsAdmin()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    notify(userMessage("driversManageForbidden"), "error");
    return;
  }
  if (isAdminActor()) return;
  if (canPerformHiringEditAction(action)) return;
  if (canPerformPermissionGatedAction(currentUser(), action, trigger)) return;
  if (!PORTAL_NON_ADMIN_BLOCKED_ACTIONS.has(action)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notify(userMessage("adminOnlyModule"), "error");
}

export function abortIfNotAdmin(reason = "adminOnlyModule") {
  if (isAdminActor()) return false;
  notify(userMessage(reason), "error");
  return true;
}

export function abortUnlessCanManageHiring(reason = "adminOnlyModule") {
  if (canManageHiringModule()) return false;
  notify(userMessage(reason), "error");
  return true;



export {
  getClientDataScope,
  isPortalClientUser,
  clientRequestsScopePrimaryLabel,
  clientDataScopeBarHtml
} from "../core/client-data-scope-ui.js";

