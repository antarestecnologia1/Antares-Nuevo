/**
 * Dominio nómina Colombia: periodos, cálculos legales orientativos, ausencias,
 * filtros de liquidaciones y aplicación de parámetros del sistema laboral.
 * Extraído desde `portal-runtime.js` (Fase 9).
 *
 * Pendiente en portal (`buildPayrollEmployeePayloadFromWizard`, HTML de ficha, etc.):
 * acoplados a reclutamiento / UI — ver Fase 9b.
 */
import {
  KEYS,
  CO_PAYROLL,
  CO_CESANTIAS_INTERES_ANUAL_PCT,
  PAYROLL_ABSENCE_LEGAL_LIMITS
} from "../core/config.js";
import { read } from "../core/data-io.js";
import { state } from "../core/store.js";
import { escapeAttr, escapeHtml, monthRange, normalizePayrollFrequencyJs, payrollPeriodCalendarYm } from "../core/utils.js";
import { notify, userMessage } from "../ui/modals.js";

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}


/** Prestación de servicios (conductores): pago por viaje, no nómina laboral ordinaria. */
export function employeeIsConductorServiceProvider(employee) {
  if (!employee) return false;
  const role = String(employee.workerRole || "").trim().toLowerCase();
  if (role === "conductor") return true;
  const ct = String(employee.contractType || "").trim().toLowerCase();
  if (/prestaci[oó]n\s*de\s*servicios|prestacion.*servicio/i.test(ct)) return true;
  const tpl = String(employee.contractTemplateKind || employee.contractTemplate || "").trim().toLowerCase();
  if (tpl === "prestacion" || tpl.includes("prestacion")) return true;
  return false;
}

export function employeeReceivesPayrollNomina(employee) {
  return !employeeIsConductorServiceProvider(employee);
}

export function payrollRunIsDriverTripPayment(run) {
  return payrollRunFrequencyKind(run) === "prestacion_viajes";
}

export function filterPayrollNominaRuns(allRuns = []) {
  return (Array.isArray(allRuns) ? allRuns : []).filter((run) => !payrollRunIsDriverTripPayment(run));
}

export function filterDriverTripPaymentRuns(allRuns = []) {
  return (Array.isArray(allRuns) ? allRuns : []).filter((run) => payrollRunIsDriverTripPayment(run));
}

export function listConductorServiceEmployees(employees = []) {
  return (Array.isArray(employees) ? employees : []).filter((e) => employeeIsConductorServiceProvider(e));
}

export function payrollRunTypeLabel(run) {
  const pk = String(run?.payrollKind || "").trim().toLowerCase();
  if (pk === "prestacion_viajes" || pk === "conductor_viajes") return "Pago por viajes (prestación)";
  if (pk === "terminacion") return "Terminación contractual";
  if (pk === "quincenal") return "Nómina quincenal";
  if (pk === "catorcenal") return "Nómina catorcenal";
  if (pk === "semanal") return "Nómina semanal";
  const key = String(run?.month || "");
  if (/-Q[12]$/i.test(key)) return "Nómina quincenal";
  if (/-C[12]$/i.test(key)) return "Nómina catorcenal";
  if (/-S\d+$/i.test(key)) return "Nómina semanal";
  return "Nómina mensual";
}

/** `mensual` | `quincenal` | `catorcenal` | `semanal` | `terminacion` — infiere desde tipo_registro o clave de periodo. */
export function payrollRunFrequencyKind(run) {
  const pk = String(run?.payrollKind || "").trim().toLowerCase();
  if (pk === "terminacion") return "terminacion";
  if (pk === "prestacion_viajes" || pk === "conductor_viajes") return "prestacion_viajes";
  if (pk === "quincenal" || pk === "catorcenal" || pk === "semanal" || pk === "mensual") return pk;
  const key = String(run?.month || "");
  if (/-Q[12]$/i.test(key)) return "quincenal";
  if (/-C[12]$/i.test(key)) return "catorcenal";
  if (/-S\d+$/i.test(key)) return "semanal";
  return "mensual";
}

export function payrollRunMatchesFrequencyFilter(run, frequencyFilter) {
  const f = String(frequencyFilter || "all").trim().toLowerCase();
  if (!f || f === "all") return true;
  return payrollRunFrequencyKind(run) === f;
}

export function defaultPayrollFilters() {
  return { period: "all", employee: "", status: "all", frequency: "all" };
}

export function payrollRunMatchesPeriodFilter(run, period, currentYm, previousYm) {
  if (period === "all") return true;
  const runYm = payrollPeriodCalendarYm(run.month);
  if (period === "current") return runYm === currentYm;
  if (period === "previous") return runYm === previousYm;
  return true;
}

export function buildPayrollPeriodKeyFromForm(monthYm, payFrequency, quincenaHalf) {
  const ym = String(monthYm || "").trim();
  const freq = normalizePayrollFrequencyJs(payFrequency);
  if (freq === "quincenal") {
    const half = String(quincenaHalf || "Q1").trim().toUpperCase();
    return `${ym}-${half === "Q2" ? "Q2" : "Q1"}`;
  }
  return ym;
}

export function payrollDaysInManualCut(monthYm, payFrequency, quincenaHalf) {
  const freq = normalizePayrollFrequencyJs(payFrequency);
  const range = monthRange(monthYm);
  if (!range) return 30;
  if (freq !== "quincenal") return 30;
  if (String(quincenaHalf || "Q1").toUpperCase() === "Q2") {
    const end = new Date(range.end);
    const start = new Date(range.start);
    start.setDate(16);
    return Math.max(1, Math.min(30, Math.round((end - start) / 86400000) + 1));
  }
  return 15;
}

export function filterPayrollRunsByUiState(
  allRuns = [],
  filters = state.payrollFilters || defaultPayrollFilters(),
  scope = "all"
) {
  let source = Array.isArray(allRuns) ? allRuns : [];
  if (scope === "nomina") source = filterPayrollNominaRuns(source);
  else if (scope === "driver") source = filterDriverTripPaymentRuns(source);
  const period = String(filters.period || "all");
  const employee = String(filters.employee || "");
  const status = String(filters.status || "all");
  const frequency = String(filters.frequency || "all");
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousYm = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
  return source.filter((run) => {
    const matchPeriod = payrollRunMatchesPeriodFilter(run, period, currentYm, previousYm);
    const matchEmployee = !employee || String(run.employeeId || "") === employee;
    const matchFrequency = payrollRunMatchesFrequencyFilter(run, frequency);
    const matchStatus =
      status === "all" ||
      (status === "paid" && Boolean(run.paid)) ||
      (status === "pending" && !run.paid);
    return matchPeriod && matchEmployee && matchFrequency && matchStatus;
  });
}

export function sortPayrollRunsByUiState(runs = [], sortKey = "recent") {
  const source = Array.isArray(runs) ? [...runs] : [];
  const runSort = String(sortKey || "recent");
  return source.sort((a, b) => {
    if (runSort === "pending_first") {
      if (Boolean(a.paid) !== Boolean(b.paid)) return a.paid ? 1 : -1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (runSort === "net_desc") return parseNum(b.net) - parseNum(a.net);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

export function payrollRunAlreadyExists(runs = [], employeeId, month, payrollKind = "mensual") {
  const emp = String(employeeId || "").trim();
  const ym = String(month || "").trim();
  const kind = String(payrollKind || "mensual").trim().toLowerCase();
  if (!emp || !ym) return false;
  return (Array.isArray(runs) ? runs : []).some(
    (run) =>
      String(run.employeeId || "").trim() === emp &&
      String(run.month || "").trim() === ym &&
      String(run.payrollKind || "mensual").trim().toLowerCase() === kind
  );
}

export function payrollMonthIsPrimaSemester(ym) {
  return /^(\d{4})-(06|12)(-|$)/.test(String(ym || "").trim());
}

/**
 * Enero u febrero: ventana habitual en nómina para liquidar o pagar intereses de cesantías del año causado (Ley 52/1975).
 * La ley señala pago **en el mes de enero** del año siguiente; muchas empresas lo registran en la planilla **01**, otras en **02** — valide con contador y fondo.
 */
export function payrollMonthIsCesantiasInterestMonth(ym) {
  return /^(\d{4})-(01|02)(-|$)/.test(String(ym || "").trim());
}

/**
 * Intereses sobre cesantías (referencia Ley 52/1975): 12% anual.
 * Si `days360` > 0: proporcional (días/360). Si no, aplica tasa plena sobre la base (año completo orientativo).
 */
export function calcColombiaInteresesCesantiasCop(baseCesantias, days360) {
  const b = Math.max(0, parseNum(baseCesantias));
  const d = Math.max(0, parseNum(days360));
  const rate = CO_CESANTIAS_INTERES_ANUAL_PCT / 100;
  if (d <= 0) return Math.round(b * rate);
  return Math.round(b * rate * (Math.min(d, 360) / 360));
}

/**
 * Prima de servicios semestral (referencia CST arts. 244–249): (salario mensual × días) ÷ 360.
 * Validar siempre con contador y política interna de la empresa.
 */
export function calcColombiaPrimaServiciosCop(salaryMonthly, daysInSemester) {
  const s = Math.max(0, parseNum(salaryMonthly));
  const d = Math.max(0, parseNum(daysInSemester));
  return Math.round((s * d) / 360);
}

/**
 * Liquidación contractual por terminación (referencia orientativa — CST y normativa salarial colombiana).
 * Cesantías: salario × días ÷ 360. Intereses: 12% anual proporcional sobre cesantías calculadas (simplificado).
 * Prima proporcional: (salario × días proporcionales) ÷ 360. Vacaciones: (salario × días compensar) ÷ 720 (uso frecuente en nómina).
 */
export function calcColombiaTerminationLines({ baseSalary, days360Year, primaPropDays, vacationDays }) {
  const base = Math.max(0, parseNum(baseSalary));
  const d360 = Math.max(0, parseNum(days360Year));
  const dPrima = Math.max(0, parseNum(primaPropDays));
  const dVac = Math.max(0, parseNum(vacationDays));
  const cesantias = Math.round((base * d360) / 360);
  const interesesCesantias = Math.round(((cesantias * 12) / 100) * (Math.min(d360, 360) / 360));
  const primaProporcional = Math.round((base * dPrima) / 360);
  const vacaciones = Math.round((base * dVac) / 720);
  return { cesantias, interesesCesantias, primaProporcional, vacaciones };
}

/** Rellena rubros del formulario de liquidación contractual a partir del salario y días ingresados. */
export function fillSettlementSuggestedAmounts(form) {
  if (!form) return;
  const employeeId = String(form.querySelector("[name='employeeId']")?.value || "");
  const employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === employeeId);
  if (!employee) {
    notify(userMessage("contractPickEmployee"), "error");
    return;
  }
  const base = parseNum(employee.baseSalary);
  const days360 = parseNum(form.querySelector("[name='days360Year']")?.value);
  const primaPropDays = parseNum(form.querySelector("[name='primaPropDays']")?.value);
  const vacationDays = parseNum(form.querySelector("[name='vacationDays']")?.value);
  const lines = calcColombiaTerminationLines({ baseSalary: base, days360Year: days360, primaPropDays, vacationDays });
  const c = form.querySelector("[name='cesantiasCop']");
  const i = form.querySelector("[name='interesesCesantiasCop']");
  const p = form.querySelector("[name='primaPropCop']");
  const v = form.querySelector("[name='vacacionesCop']");
  if (c) c.value = String(lines.cesantias);
  if (i) i.value = String(lines.interesesCesantias);
  if (p) p.value = String(lines.primaProporcional);
  if (v) v.value = String(lines.vacaciones);
}

/**
 * Rubros de devengo de la liquidación mensual como arreglo (incluye auxilio según ficha del empleado).
 * Se persiste en `devengosLines` y dentro de `noveltiesDetail` para columnas JSON en servidor.
 */
export function buildPayrollMensualDevengosLines({
  baseSalary,
  extras,
  aux,
  bonus,
  travelAllowance,
  fuelReimbursement,
  primaServiciosCop,
  interesesCesantiasCop,
  empleadoAuxilioTransporteMensualCop,
  incapacityEpisodes
}) {
  const bs = Math.max(0, parseNum(baseSalary));
  const ex = Math.max(0, parseNum(extras));
  const au = Math.max(0, parseNum(aux));
  const bo = Math.max(0, parseNum(bonus));
  const via = Math.max(0, parseNum(travelAllowance));
  const comb = Math.max(0, parseNum(fuelReimbursement));
  const prima = Math.max(0, parseNum(primaServiciosCop));
  const intCe = Math.max(0, parseNum(interesesCesantiasCop));
  const refAux = Math.max(0, parseNum(empleadoAuxilioTransporteMensualCop));
  const lines = [
    { code: "SALARIO_ORDINARIO", label: "Salario básico mensual (ordinario)", amount: bs },
    {
      code: "AUXILIO_TRANSPORTE",
      label: "Auxilio legal de transporte (no constitutivo de salario)",
      amount: au,
      empleadoAuxilioMensualRefCop: refAux > 0 ? refAux : null
    }
  ];
  if (ex > 0) lines.push({ code: "EXTRAS", label: "Horas extras, dominicales o recargos nocturnos", amount: ex });
  if (bo > 0) lines.push({ code: "BONIFICACIONES", label: "Bonificaciones y pagos ocasionales gravables", amount: bo });
  if (via > 0) lines.push({ code: "VIATICOS", label: "Viáticos y anticipos de viaje (reintegro)", amount: via });
  if (comb > 0) lines.push({ code: "REEMBOLSO_COMBUSTIBLE", label: "Reembolso combustible y gastos de ruta", amount: comb });
  if (prima > 0) lines.push({ code: "PRIMA_SERVICIOS", label: "Prima de servicios (CST)", amount: prima });
  if (intCe > 0) lines.push({ code: "INT_CESANTIAS", label: "Intereses sobre cesantías (Ley 52/1975)", amount: intCe });
  const incapEp = Array.isArray(incapacityEpisodes) ? incapacityEpisodes : [];
  incapEp.forEach((ep, i) => {
    const amt = Math.round(parseNum(ep.adjustCop));
    lines.push({
      code: `INCAPACIDAD_EP_${i}`,
      label: `${String(ep.label || "Incapacidad")} · ${ep.days ?? "—"} días liq. · ${String(ep.rangeLabel || "")}`,
      amount: amt,
      incapacityNote: ep.note ? String(ep.note) : ""
    });
  });
  return lines;
}

export function resolvePayrollDevengosLines(run) {
  if (!run || typeof run !== "object") return null;
  if (Array.isArray(run.devengosLines) && run.devengosLines.length) return run.devengosLines;
  const nv = run.noveltiesDetail;
  if (nv && typeof nv === "object" && Array.isArray(nv.devengosLines) && nv.devengosLines.length) return nv.devengosLines;
  return null;
}

/**
 * Fecha local mediodía (alineado a cortes de mes del portal).
 */
export function payrollDateAtNoonLocal(y, m0, d) {
  return new Date(y, m0, d, 12, 0, 0, 0);
}

export function payrollParseLocalYmd(raw) {
  const s = String(raw || "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const dt = payrollDateAtNoonLocal(y, mo, da);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function payrollInclusiveCalendarDaysLocal(a, b) {
  const msDay = 86400000;
  const n = Math.floor((b.getTime() - a.getTime()) / msDay) + 1;
  return n > 0 ? n : 0;
}

export function payrollInclusiveBusinessDaysLocal(a, b) {
  if (!a || !b || !(a instanceof Date) || !(b instanceof Date)) return 0;
  let total = 0;
  let cur = payrollDateAtNoonLocal(a.getFullYear(), a.getMonth(), a.getDate());
  const end = payrollDateAtNoonLocal(b.getFullYear(), b.getMonth(), b.getDate());
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) total += 1;
    cur = payrollDateAtNoonLocal(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
  return total;
}

export function payrollMaxDateLocal(a, b) {
  return a >= b ? a : b;
}

export function payrollMinDateLocal(a, b) {
  return a <= b ? a : b;
}

export function payrollOverlapInclusiveLocal(aStart, aEnd, bStart, bEnd) {
  const s = payrollMaxDateLocal(aStart, bStart);
  const e = payrollMinDateLocal(aEnd, bEnd);
  if (s > e) return null;
  return { s, e };
}

export function payrollFmtYmdLocal(d) {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

export function payrollNormalizeAbsenceTypeKey(absenceType) {
  const t = String(absenceType || "").trim().toLowerCase();
  if (!t) return "";
  if (t.includes("vacac")) return "vacaciones";
  if (t.includes("arl")) return "incapacidad_arl";
  if (t.includes("incapaci") || t === "eps") return "incapacidad_eps";
  if (t.includes("matern")) return "licencia_maternidad";
  if (t.includes("patern")) return "licencia_paternidad";
  if (t.includes("luto") || t.includes("duelo")) return "licencia_luto";
  if (t.includes("calam")) return "calamidad_domestica";
  if ((t.includes("cita") && t.includes("med")) || t.includes("medic")) return "permiso_cita_medica";
  if (t.includes("judic")) return "permiso_citacion_judicial";
  if (t.includes("sufrag") || t.includes("vot")) return "permiso_sufragio";
  if (t.includes("sin goce") || t.includes("no remuner") || t.includes("no_remuner")) return "licencia_no_remunerada";
  if (t === "incapacidad") return "incapacidad_eps";
  if (t === "licencia") return "licencia_remunerada";
  if (t === "calamidad") return "calamidad_domestica";
  return t;
}

/** Clave visual para filas / badges de ausencias (CSS: `payroll-absence-row--${kind}`). */
export function payrollAbsenceVisualKind(absenceType) {
  const k = payrollNormalizeAbsenceTypeKey(absenceType);
  if (k === "incapacidad_eps" || k === "permiso_cita_medica") return "eps";
  if (k === "incapacidad_arl") return "arl";
  if (k === "vacaciones") return "vacation";
  if (k === "licencia_maternidad") return "maternity";
  if (k === "licencia_paternidad") return "paternity";
  if (k === "licencia_luto" || k === "calamidad_domestica") return "sensitive";
  if (k === "licencia_no_remunerada") return "unpaid";
  if (k.startsWith("permiso_")) return "permit";
  return "other";
}

export function payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const raw = String(absenceSubtype || "").trim().toLowerCase();
  if (!raw) return "";
  if (typeKey === "permiso_sufragio") {
    if (raw.includes("jurad")) return "jurado";
    if (raw.includes("votan") || raw.includes("sufrag")) return "votante";
    return "";
  }
  if (typeKey === "licencia_maternidad") {
    if (raw.includes("multi")) return "parto_multiple";
    if (raw.includes("prematur") || raw.includes("prematuro")) return "parto_prematuro";
    if (raw.includes("adopc")) return "adopcion";
    if (raw.includes("extension") || raw.includes("medica") || raw.includes("complic")) return "extension_medica";
    if (raw.includes("ordin")) return "ordinaria";
    return ["ordinaria", "parto_multiple", "parto_prematuro", "adopcion", "extension_medica"].includes(raw) ? raw : "";
  }
  if (typeKey === "licencia_paternidad") {
    if (raw.includes("flex")) return "flexible";
    if (raw.includes("parental") || raw.includes("compart")) return "parental_compartida";
    if (raw.includes("contin")) return "continua";
    return ["continua", "flexible", "parental_compartida"].includes(raw) ? raw : "";
  }
  return "";
}

export function payrollGetAbsenceSubtypeOptions(absenceType) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  if (typeKey === "permiso_sufragio") {
    return [
      { value: "votante", label: "Votante (medio día compensatorio)" },
      { value: "jurado", label: "Jurado de votación (1 día compensatorio)" }
    ];
  }
  if (typeKey === "licencia_maternidad") {
    return [
      { value: "ordinaria", label: "Ordinaria (18 semanas / 126 días)" },
      { value: "parto_multiple", label: "Parto múltiple (+2 semanas / 140 días)" },
      { value: "parto_prematuro", label: "Parto prematuro (completar 18 semanas)" },
      { value: "adopcion", label: "Adopción o acogimiento (18 semanas)" },
      { value: "extension_medica", label: "Extensión médica por complicaciones" }
    ];
  }
  if (typeKey === "licencia_paternidad") {
    return [
      { value: "continua", label: "Continua (hasta 14 días calendario)" },
      { value: "flexible", label: "Flexible (jornadas parciales dentro del mes)" },
      { value: "parental_compartida", label: "Parental compartida (hasta 7 días cedidos)" }
    ];
  }
  return [];
}

export function payrollAbsenceRequiresSubtype(absenceType) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  return typeKey === "permiso_sufragio" || typeKey === "licencia_maternidad" || typeKey === "licencia_paternidad";
}

export function payrollGetAbsenceMaternityMaxDays(subtype) {
  const norm = String(subtype || "").trim().toLowerCase();
  if (norm === "parto_multiple") return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadMultipleDays;
  if (norm === "parto_prematuro") return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadPrematuroMaxDays;
  if (norm === "extension_medica") return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadExtensionMedicaMaxDays;
  return PAYROLL_ABSENCE_LEGAL_LIMITS.maternidadOrdinariaDays;
}

export function payrollGetAbsencePaternityMaxDays(subtype) {
  const norm = String(subtype || "").trim().toLowerCase();
  if (norm === "parental_compartida") return PAYROLL_ABSENCE_LEGAL_LIMITS.paternidadParentalCompartidaDays;
  return PAYROLL_ABSENCE_LEGAL_LIMITS.paternidadDays;
}

export function payrollGetAbsenceSupportRules(absenceType, absenceSubtype = "") {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const base = {
    requiresSupportNumber: false,
    requiresEntity: false,
    requiresNotes: false,
    suggestedEntity: "",
    supportHint: "Opcional: radicado, acta, certificado o soporte documental.",
    entityHint: "Indique EPS, ARL u otra entidad cuando aplique."
  };
  if (typeKey === "incapacidad_eps") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresEntity: true,
      supportHint: "Obligatorio: número de incapacidad o radicado EPS.",
      entityHint: "Obligatorio: EPS que expide la incapacidad."
    };
  }
  if (typeKey === "incapacidad_arl") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresEntity: true,
      suggestedEntity: "ARL",
      supportHint: "Obligatorio: radicado o número de reporte ARL.",
      entityHint: "Obligatorio: ARL."
    };
  }
  if (typeKey === "licencia_maternidad") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresNotes: subtype === "parto_prematuro" || subtype === "extension_medica",
      supportHint: "Obligatorio: certificado médico, prenatal o acta de nacimiento según el caso.",
      entityHint: "Recomendado: EPS o entidad de salud."
    };
  }
  if (typeKey === "licencia_paternidad") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresNotes: subtype === "flexible" || subtype === "parental_compartida",
      supportHint: "Obligatorio: registro civil del recién nacido o soporte equivalente.",
      entityHint: "Opcional: entidad de salud o registraduría."
    };
  }
  if (typeKey === "licencia_luto") {
    return {
      ...base,
      requiresSupportNumber: true,
      supportHint: "Obligatorio: acta de defunción o certificado equivalente."
    };
  }
  if (typeKey === "calamidad_domestica") {
    return {
      ...base,
      requiresNotes: true,
      supportHint: "Recomendado: soporte que acredite la calamidad.",
      entityHint: "Opcional."
    };
  }
  if (typeKey === "permiso_cita_medica") {
    return {
      ...base,
      requiresSupportNumber: true,
      supportHint: "Obligatorio: orden médica, cita o constancia de asistencia."
    };
  }
  if (typeKey === "permiso_citacion_judicial") {
    return {
      ...base,
      requiresSupportNumber: true,
      requiresEntity: true,
      suggestedEntity: "Juzgado",
      supportHint: "Obligatorio: número de citación o acta judicial.",
      entityHint: "Obligatorio: juzgado o autoridad."
    };
  }
  if (typeKey === "permiso_sufragio") {
    return {
      ...base,
      suggestedEntity: "Registraduría",
      supportHint: "Recomendado: certificado de jurado o constancia electoral."
    };
  }
  if (typeKey === "licencia_no_remunerada") {
    return {
      ...base,
      requiresNotes: true,
      supportHint: "Recomendado: acto o comunicación del empleador.",
      entityHint: "Opcional."
    };
  }
  return base;
}

export function payrollAbsenceSubtypeLabel(absenceType, absenceSubtype) {
  const norm = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const option = payrollGetAbsenceSubtypeOptions(absenceType).find((item) => item.value === norm);
  return option ? option.label : "";
}

export function payrollGetAbsenceTypeMeta(absenceType, absenceSubtype = "") {
  const raw = String(absenceType || "").trim();
  const key = payrollNormalizeAbsenceTypeKey(raw);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const catalog = {
    vacaciones: {
      label: "Vacaciones",
      optionLabel: "Vacaciones remuneradas",
      conceptLabel: "Días hábiles en Vacaciones",
      quantityKind: "business"
    },
    incapacidad_eps: {
      label: "Incapacidad EPS",
      optionLabel: "Incapacidad por enfermedad general (EPS)",
      conceptLabel: "Días calendario en Incapacidad EPS",
      quantityKind: "calendar"
    },
    incapacidad_arl: {
      label: "Incapacidad ARL",
      optionLabel: "Incapacidad por accidente o enfermedad laboral (ARL)",
      conceptLabel: "Días calendario en Incapacidad ARL",
      quantityKind: "calendar"
    },
    licencia_maternidad: {
      label: "Licencia de maternidad",
      optionLabel: "Licencia de maternidad",
      conceptLabel:
        subtype === "parto_multiple"
          ? "Días calendario de licencia de maternidad por parto múltiple"
          : subtype === "parto_prematuro"
            ? "Días calendario de licencia de maternidad por parto prematuro"
            : subtype === "adopcion"
              ? "Días calendario de licencia de maternidad por adopción"
              : subtype === "extension_medica"
                ? "Días calendario de extensión médica de maternidad"
                : "Días calendario de licencia de maternidad",
      quantityKind: "calendar"
    },
    licencia_paternidad: {
      label: "Licencia de paternidad",
      optionLabel: "Licencia de paternidad",
      conceptLabel:
        subtype === "flexible"
          ? "Jornadas de licencia de paternidad flexible"
          : subtype === "parental_compartida"
            ? "Días calendario de licencia parental compartida"
            : "Días calendario de licencia de paternidad",
      quantityKind: "calendar"
    },
    licencia_luto: {
      label: "Licencia por luto",
      optionLabel: "Licencia por luto",
      conceptLabel: "Días hábiles de licencia por luto",
      quantityKind: "business"
    },
    calamidad_domestica: {
      label: "Calamidad doméstica",
      optionLabel: "Licencia por grave calamidad doméstica",
      conceptLabel: "Días de calamidad doméstica",
      quantityKind: "calendar"
    },
    permiso_cita_medica: {
      label: "Permiso cita médica",
      optionLabel: "Permiso por cita médica o atención en salud",
      conceptLabel: "Días hábiles por cita médica",
      quantityKind: "business"
    },
    permiso_citacion_judicial: {
      label: "Permiso citación judicial",
      optionLabel: "Permiso por citación judicial o deber legal",
      conceptLabel: "Días hábiles por citación judicial",
      quantityKind: "business"
    },
    permiso_sufragio: {
      label: "Permiso por sufragio",
      optionLabel: "Permiso por sufragio / jornada electoral",
      conceptLabel:
        subtype === "jurado"
          ? "Día compensatorio por jurado de votación"
          : "Permiso compensatorio por sufragio",
      quantityKind: "recognized"
    },
    licencia_remunerada: {
      label: "Licencia remunerada",
      optionLabel: "Otra licencia o permiso remunerado",
      conceptLabel: "Días de licencia remunerada",
      quantityKind: "calendar"
    },
    licencia_no_remunerada: {
      label: "Licencia no remunerada",
      optionLabel: "Licencia no remunerada / suspensión autorizada",
      conceptLabel: "Días de licencia no remunerada",
      quantityKind: "calendar"
    }
  };
  const meta = catalog[key];
  if (meta) return { key, ...meta };
  return {
    key,
    label: raw || "Ausentismo",
    optionLabel: raw || "Ausentismo",
    conceptLabel: "Días de ausentismo registrados",
    quantityKind: "calendar"
  };
}

export function payrollAbsenceTypeLabel(absenceType) {
  return payrollGetAbsenceTypeMeta(absenceType).label;
}

export function payrollAbsenceConceptForSlip(absenceType, absenceSubtype = "") {
  const meta = payrollGetAbsenceTypeMeta(absenceType, absenceSubtype);
  return {
    typeLabel: meta.label,
    conceptLabel: meta.conceptLabel,
    quantityKind: meta.quantityKind
  };
}

export function payrollAbsenceSelectOptions() {
  return [
    "vacaciones",
    "incapacidad_eps",
    "incapacidad_arl",
    "licencia_maternidad",
    "licencia_paternidad",
    "licencia_luto",
    "calamidad_domestica",
    "permiso_cita_medica",
    "permiso_citacion_judicial",
    "permiso_sufragio",
    "licencia_remunerada",
    "licencia_no_remunerada"
  ].map((value) => ({
    value,
    label: payrollGetAbsenceTypeMeta(value).optionLabel
  }));
}

export function buildPayrollAbsenceTypeOptionsHtml(selectedValue = "") {
  const normalizedSelected = payrollNormalizeAbsenceTypeKey(selectedValue);
  return payrollAbsenceSelectOptions()
    .map((opt) => `<option value="${escapeAttr(opt.value)}"${opt.value === normalizedSelected ? " selected" : ""}>${escapeHtml(opt.label)}</option>`)
    .join("");
}

export function buildPayrollAbsenceSubtypeOptionsHtml(absenceType, selectedValue = "") {
  const normalizedSelected = payrollNormalizeAbsenceSubtype(absenceType, selectedValue);
  const options = payrollGetAbsenceSubtypeOptions(absenceType);
  if (!options.length) return `<option value="">No aplica</option>`;
  return options
    .map((opt) => `<option value="${escapeAttr(opt.value)}"${opt.value === normalizedSelected ? " selected" : ""}>${escapeHtml(opt.label)}</option>`)
    .join("");
}

export function payrollAbsenceIsIncapacityType(absenceType) {
  const key = payrollNormalizeAbsenceTypeKey(absenceType);
  return key === "incapacidad_eps" || key === "incapacidad_arl";
}

export function payrollAbsenceRecognizedUnit(absenceType, absenceSubtype = "") {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  if (typeKey === "permiso_sufragio") return "jornada";
  const meta = payrollGetAbsenceTypeMeta(absenceType, absenceSubtype);
  return meta.quantityKind === "business" ? "habil" : "calendario";
}

export function payrollComputeAbsenceSuggestedRecognizedDays({ absenceType, absenceSubtype, startDate, endDate }) {
  const abStart = payrollParseLocalYmd(startDate);
  const abEnd = payrollParseLocalYmd(endDate) || abStart;
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  if (typeKey === "permiso_sufragio") {
    return subtype === "jurado" ? 1 : 0.5;
  }
  if (!abStart || !abEnd) return 1;
  if (typeKey === "licencia_luto") {
    return Math.min(PAYROLL_ABSENCE_LEGAL_LIMITS.lutoMaxBusinessDays, payrollInclusiveBusinessDaysLocal(abStart, abEnd));
  }
  if (typeKey === "licencia_maternidad") {
    const maxDays = payrollGetAbsenceMaternityMaxDays(subtype || "ordinaria");
    return Math.min(maxDays, payrollInclusiveCalendarDaysLocal(abStart, abEnd));
  }
  if (typeKey === "licencia_paternidad") {
    const maxDays = payrollGetAbsencePaternityMaxDays(subtype || "continua");
    return Math.min(maxDays, payrollInclusiveCalendarDaysLocal(abStart, abEnd));
  }
  return payrollAbsenceRecognizedUnit(absenceType, absenceSubtype) === "habil"
    ? payrollInclusiveBusinessDaysLocal(abStart, abEnd)
    : payrollInclusiveCalendarDaysLocal(abStart, abEnd);
}

export function payrollAbsenceLegalHint(absenceType, absenceSubtype = "") {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  if (typeKey === "permiso_sufragio") {
    return subtype === "jurado"
      ? "Regla legal aplicada: jurado de votación = 1 jornada compensatoria."
      : "Regla legal aplicada: sufragante = 0,5 jornada compensatoria.";
  }
  if (typeKey === "licencia_luto") {
    return "Regla legal aplicada: máximo 5 días hábiles de licencia por luto.";
  }
  if (typeKey === "licencia_maternidad") {
    const maxDays = payrollGetAbsenceMaternityMaxDays(subtype || "ordinaria");
    const labels = {
      ordinaria: "18 semanas (126 días calendario)",
      parto_multiple: "20 semanas (140 días calendario)",
      parto_prematuro: "completar 18 semanas desde la fecha probable de parto",
      adopcion: "18 semanas desde la entrega del menor",
      extension_medica: "extensión médica con soporte clínico"
    };
    return `Referencia legal: ${labels[subtype] || labels.ordinaria}; tope parametrizado ${maxDays} días.`;
  }
  if (typeKey === "licencia_paternidad") {
    if (subtype === "parental_compartida") {
      return "Regla legal aplicada: hasta 7 días calendario cedidos desde la licencia de maternidad.";
    }
    if (subtype === "flexible") {
      return "Regla legal aplicada: hasta 14 días calendario, tomables en jornadas parciales dentro del primer mes.";
    }
    return "Regla legal aplicada: hasta 14 días calendario de licencia de paternidad.";
  }
  const supportRules = payrollGetAbsenceSupportRules(absenceType, absenceSubtype);
  if (supportRules.requiresSupportNumber || supportRules.requiresNotes) {
    return "Revise los soportes obligatorios indicados abajo.";
  }
  return "";
}

export function payrollValidateAbsenceLegalRules({
  absenceType,
  absenceSubtype,
  startDate,
  endDate,
  recognizedDays,
  supportNumber = "",
  epsEntity = "",
  notes = ""
}) {
  const typeKey = payrollNormalizeAbsenceTypeKey(absenceType);
  const subtype = payrollNormalizeAbsenceSubtype(absenceType, absenceSubtype);
  const start = payrollParseLocalYmd(startDate);
  const end = payrollParseLocalYmd(endDate) || start;
  const recognized = Number(parseNum(recognizedDays));
  const support = String(supportNumber || "").trim();
  const entity = String(epsEntity || "").trim();
  const obs = String(notes || "").trim();
  if (!start || !end || !Number.isFinite(recognized) || recognized <= 0) {
    return { ok: false, message: "Complete fechas válidas y días reconocidos mayores a cero." };
  }
  if (payrollAbsenceRequiresSubtype(absenceType) && !subtype) {
    const labels = {
      permiso_sufragio: "En permiso por sufragio debe indicar si fue votante o jurado de votación.",
      licencia_maternidad: "En licencia de maternidad debe seleccionar el subtipo aplicable.",
      licencia_paternidad: "En licencia de paternidad debe seleccionar continua, flexible o parental compartida."
    };
    return { ok: false, message: labels[typeKey] || "Debe seleccionar un subtipo válido." };
  }
  const businessDays = payrollInclusiveBusinessDaysLocal(start, end);
  const calendarDays = payrollInclusiveCalendarDaysLocal(start, end);
  const supportRules = payrollGetAbsenceSupportRules(absenceType, subtype);
  if (supportRules.requiresSupportNumber && !support) {
    return { ok: false, message: "Debe registrar el número de soporte o radicado para este tipo de ausencia." };
  }
  if (supportRules.requiresEntity && !entity) {
    return { ok: false, message: "Debe indicar la entidad (EPS, ARL, juzgado u otra) para este tipo de ausencia." };
  }
  if (supportRules.requiresNotes && !obs) {
    return { ok: false, message: "Debe registrar observaciones que expliquen el caso y el soporte legal." };
  }
  if (typeKey === "permiso_sufragio") {
    const expected = subtype === "jurado" ? 1 : 0.5;
    if (Math.abs(recognized - expected) > 0.001) {
      return {
        ok: false,
        message: subtype === "jurado" ? "Jurado de votación reconoce 1 jornada." : "Sufragante reconoce 0,5 jornada."
      };
    }
  }
  if (typeKey === "licencia_luto" && (recognized > PAYROLL_ABSENCE_LEGAL_LIMITS.lutoMaxBusinessDays || businessDays > PAYROLL_ABSENCE_LEGAL_LIMITS.lutoMaxBusinessDays)) {
    return { ok: false, message: "La licencia por luto no puede exceder 5 días hábiles en esta parametrización." };
  }
  if (typeKey === "licencia_maternidad") {
    const maxDays = payrollGetAbsenceMaternityMaxDays(subtype);
    if (recognized > maxDays || calendarDays > maxDays) {
      return {
        ok: false,
        message: `La licencia de maternidad (${payrollAbsenceSubtypeLabel(absenceType, subtype) || "subtipo seleccionado"}) no puede exceder ${maxDays} días calendario.`
      };
    }
  }
  if (typeKey === "licencia_paternidad") {
    const maxDays = payrollGetAbsencePaternityMaxDays(subtype);
    if (recognized > maxDays || calendarDays > maxDays) {
      const label = subtype === "parental_compartida" ? "licencia parental compartida" : "licencia de paternidad";
      return { ok: false, message: `La ${label} no puede exceder ${maxDays} días calendario en esta parametrización.` };
    }
    if (subtype === "flexible" && Math.abs(recognized * 2 - Math.round(recognized * 2)) > 0.001) {
      return { ok: false, message: "En paternidad flexible los días reconocidos deben ser múltiplos de 0,5 jornada." };
    }
  }
  if (typeKey === "vacaciones" && recognized > businessDays) {
    return { ok: false, message: "En vacaciones los días reconocidos no pueden superar los días hábiles del periodo." };
  }
  if ((typeKey === "incapacidad_eps" || typeKey === "incapacidad_arl") && recognized > calendarDays) {
    return { ok: false, message: "En incapacidades los días reconocidos no pueden superar los días calendario del periodo." };
  }
  return { ok: true, message: "" };
}

export function payrollFormatAbsenceQuantity(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "0";
  return num.toLocaleString("es-CO", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 1,
    maximumFractionDigits: 2
  });
}

export function wireHrAbsenceFormBehavior(form) {
  if (!form || form.dataset.hrAbsenceBehaviorBound === "1") return;
  form.dataset.hrAbsenceBehaviorBound = "1";
  const typeEl = form.querySelector('[name="absenceType"]');
  const subtypeEl = form.querySelector('[name="absenceSubtype"]');
  const subtypeWrap =
    form.querySelector("[data-absence-subtype-wrap]") ||
    (subtypeEl?.closest("label") ?? null);
  const startEl = form.querySelector('[name="startDate"]');
  const endEl = form.querySelector('[name="endDate"]');
  const recognizedEl = form.querySelector('[name="recognizedDays"]');
  const supportEl = form.querySelector('[name="supportNumber"]');
  const entityEl = form.querySelector('[name="epsEntity"]');
  const notesEl = form.querySelector('[name="notes"]');
  const hintEl = form.querySelector("[data-absence-recognition-hint]");
  const supportHintEl = form.querySelector("[data-absence-support-hint]");
  if (!typeEl || !subtypeEl || !recognizedEl) return;

  const sync = () => {
    subtypeEl.innerHTML = buildPayrollAbsenceSubtypeOptionsHtml(typeEl.value, subtypeEl.value);
    const showSubtype = payrollGetAbsenceSubtypeOptions(typeEl.value).length > 0;
    if (subtypeWrap) {
      subtypeWrap.classList.toggle("hidden", !showSubtype);
      subtypeWrap.setAttribute("aria-hidden", showSubtype ? "false" : "true");
    }
    subtypeEl.required = showSubtype;
    if (showSubtype && !subtypeEl.value) {
      const defaultOpts = payrollGetAbsenceSubtypeOptions(typeEl.value);
      if (defaultOpts.length) subtypeEl.value = defaultOpts[0].value;
    }
    if (!showSubtype) subtypeEl.value = "";
    const suggested = payrollComputeAbsenceSuggestedRecognizedDays({
      absenceType: typeEl.value,
      absenceSubtype: subtypeEl.value,
      startDate: startEl?.value,
      endDate: endEl?.value
    });
    if (!recognizedEl.dataset.userEdited || !String(recognizedEl.value || "").trim()) {
      recognizedEl.value = String(suggested);
    }
    if (hintEl) {
      const unit = payrollAbsenceRecognizedUnit(typeEl.value, subtypeEl.value);
      const subtypeLabel = payrollAbsenceSubtypeLabel(typeEl.value, subtypeEl.value);
      const legalHint = payrollAbsenceLegalHint(typeEl.value, subtypeEl.value);
      hintEl.textContent = `Sugerido: ${payrollFormatAbsenceQuantity(suggested)} ${unit === "habil" ? "días hábiles" : unit === "jornada" ? "jornadas" : "días calendario"}${subtypeLabel ? ` · ${subtypeLabel}` : ""}.${legalHint ? ` ${legalHint}` : ""}`;
    }
    const supportRules = payrollGetAbsenceSupportRules(typeEl.value, subtypeEl.value);
    if (supportEl) supportEl.required = !!supportRules.requiresSupportNumber;
    if (entityEl) entityEl.required = !!supportRules.requiresEntity;
    if (notesEl) notesEl.required = !!supportRules.requiresNotes;
    if (entityEl && supportRules.suggestedEntity && !String(entityEl.value || "").trim()) {
      entityEl.value = supportRules.suggestedEntity;
    }
    if (supportHintEl) {
      const parts = [supportRules.supportHint];
      if (supportRules.entityHint) parts.push(supportRules.entityHint);
      if (supportRules.requiresNotes) parts.push("Observaciones obligatorias para este caso.");
      supportHintEl.textContent = parts.filter(Boolean).join(" ");
    }
  };

  typeEl.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  subtypeEl.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  startEl?.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  endEl?.addEventListener("change", () => {
    delete recognizedEl.dataset.userEdited;
    sync();
  });
  recognizedEl.addEventListener("input", () => {
    recognizedEl.dataset.userEdited = "1";
  });
  sync();
}

export function payrollMergeAbsenceSlipRows(rows) {
  const acc = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (!row || typeof row !== "object") return;
    const quantity = Math.max(0, Number(parseNum(row.quantity)));
    if (quantity <= 0) return;
    const typeLabel = String(row.typeLabel || "Ausentismo").trim() || "Ausentismo";
    const conceptLabel = String(row.conceptLabel || "Días de ausentismo registrados").trim() || "Días de ausentismo registrados";
    const key = `${typeLabel}__${conceptLabel}`;
    const prev = acc.get(key);
    if (prev) {
      prev.quantity = Math.round((prev.quantity + quantity) * 100) / 100;
    } else {
      acc.set(key, { typeLabel, conceptLabel, quantity });
    }
  });
  return Array.from(acc.values()).sort((a, b) =>
    `${a.typeLabel} ${a.conceptLabel}`.localeCompare(`${b.typeLabel} ${b.conceptLabel}`, "es")
  );
}

export function payrollResolveRunPeriodBounds(run) {
  if (!run || typeof run !== "object") return null;
  const nv = run.noveltiesDetail;
  const cutStart = payrollParseLocalYmd(nv?.corteNomina?.desde);
  const cutEnd = payrollParseLocalYmd(nv?.corteNomina?.hasta);
  if (cutStart && cutEnd && cutStart <= cutEnd) {
    return { start: cutStart, end: cutEnd };
  }
  const monthBounds = monthRange(run.month);
  if (!monthBounds) return null;
  return { start: monthBounds.start, end: monthBounds.end };
}

export function buildPayrollAbsenceSlipRowsForPeriod({ employeeId, periodStart, periodEnd, absencesAll }) {
  if (!employeeId || !periodStart || !periodEnd) return [];
  const rows = [];
  (Array.isArray(absencesAll) ? absencesAll : []).forEach((ab) => {
    if (String(ab?.employeeId || "") !== String(employeeId)) return;
    const abStart = payrollParseLocalYmd(ab?.startDate);
    const abEnd = payrollParseLocalYmd(ab?.endDate) || abStart;
    if (!abStart || !abEnd) return;
    const ov = payrollOverlapInclusiveLocal(abStart, abEnd, periodStart, periodEnd);
    if (!ov) return;
    const concept = payrollAbsenceConceptForSlip(ab?.absenceType || ab?.type, ab?.absenceSubtype || ab?.subtype);
    const recognizedDays = Number(parseNum(ab?.recognizedDays ?? ab?.diasReconocidos ?? 0));
    const recognizedUnit = String(ab?.recognizedUnit || ab?.unidadDiasReconocidos || "").trim().toLowerCase();
    const fullOverlap =
      payrollFmtYmdLocal(ov.s) === payrollFmtYmdLocal(abStart) &&
      payrollFmtYmdLocal(ov.e) === payrollFmtYmdLocal(abEnd);
    const quantity =
      recognizedDays > 0 && (fullOverlap || recognizedUnit === "jornada" || concept.quantityKind === "recognized")
        ? recognizedDays
        : concept.quantityKind === "business"
          ? payrollInclusiveBusinessDaysLocal(ov.s, ov.e)
          : payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
    rows.push({
      typeLabel: concept.typeLabel,
      conceptLabel: concept.conceptLabel,
      quantity
    });
  });
  return payrollMergeAbsenceSlipRows(rows);
}

export function resolvePayrollAbsenceSlipRows(run, absencesAll) {
  const bounds = payrollResolveRunPeriodBounds(run);
  if (bounds) {
    const liveRows = buildPayrollAbsenceSlipRowsForPeriod({
      employeeId: run?.employeeId,
      periodStart: bounds.start,
      periodEnd: bounds.end,
      absencesAll
    });
    if (liveRows.length) return liveRows;
  }
  const storedRows = payrollMergeAbsenceSlipRows(run?.noveltiesDetail?.absenceSlipDetail?.rows);
  if (storedRows.length) return storedRows;
  const legacyRows = [];
  const vacations = run?.noveltiesDetail?.vacaciones;
  if (vacations && typeof vacations === "object") {
    Object.values(vacations).forEach((item) => {
      legacyRows.push({
        typeLabel: "Vacaciones",
        conceptLabel: "Días hábiles en Vacaciones",
        quantity: parseNum(item?.dias)
      });
    });
  }
  const adjustments = Array.isArray(run?.noveltiesDetail?.ausenciasAjustes)
    ? run.noveltiesDetail.ausenciasAjustes
    : [];
  adjustments.forEach((item) => {
    const concept = payrollAbsenceConceptForSlip(item?.tipo);
    legacyRows.push({
      typeLabel: concept.typeLabel,
      conceptLabel: concept.conceptLabel,
      quantity: parseNum(item?.dias)
    });
  });
  return payrollMergeAbsenceSlipRows(legacyRows);
}

export function buildPayrollAbsenceSummaryText(run, absencesAll) {
  const rows = resolvePayrollAbsenceSlipRows(run, absencesAll);
  return rows.length
    ? rows.map((row) => `${row.typeLabel}: ${payrollFormatAbsenceQuantity(row.quantity)}`).join("; ")
    : "";
}

export function payrollRunHasAbsenceDetail(run, absencesAll) {
  return resolvePayrollAbsenceSlipRows(run, absencesAll).length > 0;
}

/**
 * Clasificación incapacidad común (EPS) vs laboral (ARL) según observaciones / tipo.
 * Misma heurística que `classifyAusenciaTipo` en apps/api/src/payroll/colombian-monthly-payroll.ts
 */
export function payrollClassifyIncapacityKind(absenceType, observaciones) {
  const t = String(absenceType || "").trim().toLowerCase();
  const obs = String(observaciones || "").trim().toLowerCase();
  if (/\barl\b|origen.?labor|risk|riesgo.?labor/i.test(obs) || t.includes("arl")) {
    return { kind: "incapacidad_arl", label: "Incapacidad origen laboral (ARL)" };
  }
  return { kind: "incapacidad_eps", label: "Incapacidad común (EPS)" };
}

/**
 * Ajuste orientativo al devengo por incapacidades del mes (normativa laboral colombiana, criterio salario÷30).
 * Ver `computeColombiaPayrollForPeriodCut` en API. No sustituye liquidación EPS/ARL ni tablas de porcentajes.
 */
export function computePayrollIncapacityColombiaForMonth({ employee, liquidacionMonthYm, absencesAll }) {
  const smmlv = CO_PAYROLL.smmlv;
  const baseSalary = Math.max(0, parseNum(employee?.baseSalary));
  const daily = baseSalary > 0 ? baseSalary / 30 : 0;
  const range = monthRange(liquidacionMonthYm);
  if (!range || daily <= 0) {
    return { adjustCop: 0, episodes: [], smmlv };
  }
  const hire = payrollParseLocalYmd(employee?.startDate);
  const lo = payrollMaxDateLocal(hire || range.start, range.start);
  const hi = range.end;
  if (lo > hi) return { adjustCop: 0, episodes: [], smmlv };

  const absences = (absencesAll || []).filter((a) => String(a.employeeId || "") === String(employee?.id || ""));
  let salarioAjuste = 0;
  const episodes = [];

  for (const ab of absences) {
    const typeKey = payrollNormalizeAbsenceTypeKey(ab.absenceType);
    if (!payrollAbsenceIsIncapacityType(ab.absenceType) && typeKey !== "licencia_no_remunerada") continue;
    const abStart = payrollParseLocalYmd(ab.startDate);
    const abEnd = payrollParseLocalYmd(ab.endDate) || abStart;
    if (!abStart || !abEnd) continue;
    const ov = payrollOverlapInclusiveLocal(abStart, abEnd, lo, hi);
    if (!ov) continue;

    if (typeKey === "licencia_no_remunerada") {
      const days = payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
      const ded = -Math.round(days * daily);
      salarioAjuste += ded;
      episodes.push({
        kind: "licencia_no_remunerada",
        absenceId: ab.id,
        days,
        adjustCop: ded,
        label: payrollAbsenceTypeLabel(ab.absenceType || ab.type),
        rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
        note: "Licencia no remunerada: descuento orientativo de salario por días del periodo (salario÷30)."
      });
      continue;
    }

    const obs = [ab.notes, ab.epsEntity, ab.supportNumber].filter(Boolean).join(" · ");
    const cl = payrollClassifyIncapacityKind(ab.absenceType, obs);

    const rad = String(ab.supportNumber || "").trim();
    const baseTypeLabel = payrollAbsenceTypeLabel(ab.absenceType || ab.type);
    const baseLabel = rad ? `${baseTypeLabel} · radicado ${rad}` : baseTypeLabel;

    if (cl.kind === "incapacidad_arl") {
      const days = payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
      const ded = -Math.round(days * daily);
      salarioAjuste += ded;
      episodes.push({
        kind: "arl",
        absenceId: ab.id,
        days,
        adjustCop: ded,
        label: `${cl.label}`,
        rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
        note:
          "Incapacidad laboral / ARL: descuento orientativo del salario por días en el periodo (pago a cargo de ARL según calificación). Validar dictamen y resolución."
      });
      continue;
    }

    if (baseSalary > 0 && baseSalary <= smmlv) {
      const days = payrollInclusiveCalendarDaysLocal(ov.s, ov.e);
      episodes.push({
        kind: "eps_smmlv",
        absenceId: ab.id,
        days,
        adjustCop: 0,
        label: baseLabel,
        rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
        note:
          "Salario hasta SMMLV: sin ajuste automático en este motor. Verificar pago al trabajador según tablas EPS (100% en etapas iniciales) y soporte médico."
      });
      continue;
    }

    let netIncap = 0;
    const msDay = 86400000;
    for (let cur = ov.s.getTime(); cur <= ov.e.getTime(); cur += msDay) {
      const dt = new Date(cur);
      const idx = payrollInclusiveCalendarDaysLocal(abStart, dt);
      netIncap += -daily + (idx <= 2 ? (daily * 2) / 3 : 0);
    }
    const roundedIncap = Math.round(netIncap);
    salarioAjuste += roundedIncap;
    episodes.push({
      kind: "eps",
      absenceId: ab.id,
      days: payrollInclusiveCalendarDaysLocal(ov.s, ov.e),
      adjustCop: roundedIncap,
      label: baseLabel,
      rangeLabel: `${payrollFmtYmdLocal(ov.s)} → ${payrollFmtYmdLocal(ov.e)}`,
      note:
        "Incapacidad común (EPS): sin salario empresa el día; complemento orientativo de ⅔ del salario diario en los dos primeros días corridos del episodio (Dec. 780/2016 / CST — validar año y liquidación en EPS)."
    });
  }

  return { adjustCop: Math.round(salarioAjuste), episodes, smmlv };
}
