/**
 * Orientación tributaria/laboral colombiana — validación con contador y RRHH indispensable.
 *
 * Soporta cortes dentro del mes (quincena, etc.) mediante `periodStart` / `periodEnd` (fechas civiles).
 */

import {
  calcColombiaCesantiasMonthlyProvisionCop,
  calcColombiaEmployeeDeductionsCop,
  calcColombiaEmployerContributionsCop,
  calcColombiaIncapacityEpsDayAdjustmentCop,
  calcColombiaPayrollIbcCop,
  calcColombiaWithholdingTaxOrientativeCop
} from "./payroll-colombia-legal.js";

export const HEALTH_EMPLOYEE_RATE = 0.04;
export const PENSION_EMPLOYEE_RATE = 0.04;
export const SOLIDARITY_RATE = 0.01;
export const SOLIDARITY_SMMLV_MULTIPLIER = 4;

export const CESANTIAS_INTERES_ANUAL = 0.12;

export const SMMLV_COP_REFERENCE_2026 = 1_750_905;

export type AbsenceInput = {
  id: string;
  tipoAusencia: string;
  subtipoAusencia?: string | null;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones: string | null;
  diasReconocidos?: number | null;
  unidadDiasReconocidos?: string | null;
};

function dateOnlyUtc(y: number, m0: number, d: number): Date {
  return new Date(Date.UTC(y, m0, d, 12, 0, 0, 0));
}

export function parseSqlDate(rowDate: unknown): Date | null {
  if (!rowDate) return null;
  if (rowDate instanceof Date && !Number.isNaN(rowDate.getTime())) {
    const dx = rowDate;
    return dateOnlyUtc(dx.getUTCFullYear(), dx.getUTCMonth(), dx.getUTCDate());
  }
  const s = String(rowDate).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  return dateOnlyUtc(y, mo, da);
}

export function monthUtcBounds(yyyyMm: string): { monthStart: Date; monthEnd: Date } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(String(yyyyMm).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  if (mo < 0 || mo > 11) return null;
  const monthStart = dateOnlyUtc(y, mo, 1);
  const lastDom = dateOnlyUtc(y, mo + 1, 0);
  return { monthStart, monthEnd: lastDom };
}

export function maxDate(a: Date, b: Date): Date {
  return a >= b ? a : b;
}

export function minDate(a: Date, b: Date): Date {
  return a <= b ? a : b;
}

export function inclusiveCalendarDays(a: Date, b: Date): number {
  const msDay = 86_400_000;
  const n = Math.floor((b.getTime() - a.getTime()) / msDay) + 1;
  return n > 0 ? n : 0;
}

function inclusiveBusinessDays(a: Date, b: Date): number {
  let total = 0;
  const cursor = new Date(a.getTime());
  while (cursor <= b) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) total += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return total;
}

function overlapInclusive(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): { s: Date; e: Date } | null {
  const s = maxDate(aStart, bStart);
  const e = minDate(aEnd, bEnd);
  if (s > e) return null;
  return { s, e };
}

function episodeDayIndex(episodeStart: Date, calendarDay: Date): number {
  return inclusiveCalendarDays(episodeStart, calendarDay);
}

export type NoveltyClassification =
  | { kind: "vacaciones"; label: string }
  | { kind: "incapacidad_eps"; label: string }
  | { kind: "incapacidad_arl"; label: string }
  | { kind: "licencia_maternidad"; label: string }
  | { kind: "licencia_paternidad"; label: string }
  | { kind: "licencia_luto"; label: string }
  | { kind: "calamidad_domestica"; label: string }
  | { kind: "permiso_cita_medica"; label: string }
  | { kind: "permiso_citacion_judicial"; label: string }
  | { kind: "permiso_sufragio"; label: string }
  | { kind: "licencia_remunerada"; label: string }
  | { kind: "licencia_no_remunerada"; label: string }
  | { kind: "suspension"; label: string }
  | { kind: "pagada_otra"; label: string };

function humanizeAusenciaTipo(tipo: string): string {
  const raw = String(tipo || "").trim();
  const t = raw.toLowerCase();
  if (!t) return "Ausencia";
  if (t.includes("vacac")) return "Vacaciones";
  if (t.includes("arl")) return "Incapacidad ARL";
  if (t.includes("incapaci") || t === "eps") return "Incapacidad EPS";
  if (t.includes("matern")) return "Licencia de maternidad";
  if (t.includes("patern")) return "Licencia de paternidad";
  if (t.includes("luto") || t.includes("duelo")) return "Licencia por luto";
  if (t.includes("calam")) return "Calamidad doméstica";
  if ((t.includes("cita") && t.includes("med")) || t.includes("medic")) return "Permiso cita médica";
  if (t.includes("judic")) return "Permiso citación judicial";
  if (t.includes("sufrag") || t.includes("vot")) return "Permiso por sufragio";
  if (t.includes("suspens")) return "Suspensión";
  if (/sin\s*goce|no.?remuner/i.test(t)) return "Licencia no remunerada";
  if (t.includes("licen") || t.includes("permiso")) return "Licencia remunerada";
  return raw;
}

function normalizeAusenciaSubtype(tipo: string, subtipo?: string | null): string {
  const rawTipo = String(tipo || "").trim().toLowerCase();
  const rawSub = String(subtipo || "").trim().toLowerCase();
  if (!rawSub) return "";
  if (rawTipo.includes("sufrag") || rawTipo.includes("vot")) {
    if (rawSub.includes("jurad")) return "jurado";
    if (rawSub.includes("votan") || rawSub.includes("sufrag")) return "votante";
    return "";
  }
  if (rawTipo.includes("matern")) {
    if (rawSub.includes("multi")) return "parto_multiple";
    if (rawSub.includes("prematur") || rawSub.includes("prematuro")) return "parto_prematuro";
    if (rawSub.includes("adopc")) return "adopcion";
    if (rawSub.includes("extension") || rawSub.includes("medica") || rawSub.includes("complic")) return "extension_medica";
    if (rawSub.includes("ordin")) return "ordinaria";
    return ["ordinaria", "parto_multiple", "parto_prematuro", "adopcion", "extension_medica"].includes(rawSub) ? rawSub : "";
  }
  if (rawTipo.includes("patern")) {
    if (rawSub.includes("flex")) return "flexible";
    if (rawSub.includes("parental") || rawSub.includes("compart")) return "parental_compartida";
    if (rawSub.includes("contin")) return "continua";
    return ["continua", "flexible", "parental_compartida"].includes(rawSub) ? rawSub : "";
  }
  return "";
}

function maternityConceptLabel(subtipo: string): string {
  if (subtipo === "parto_multiple") return "Días calendario de licencia de maternidad por parto múltiple";
  if (subtipo === "parto_prematuro") return "Días calendario de licencia de maternidad por parto prematuro";
  if (subtipo === "adopcion") return "Días calendario de licencia de maternidad por adopción";
  if (subtipo === "extension_medica") return "Días calendario de extensión médica de maternidad";
  return "Días calendario de licencia de maternidad";
}

function paternityConceptLabel(subtipo: string): string {
  if (subtipo === "flexible") return "Jornadas de licencia de paternidad flexible";
  if (subtipo === "parental_compartida") return "Días calendario de licencia parental compartida";
  return "Días calendario de licencia de paternidad";
}

function absenceConceptForSlip(ab: AbsenceInput): { typeLabel: string; conceptLabel: string; quantityKind: "calendar" | "business" | "recognized" } {
  const typeLabel = humanizeAusenciaTipo(ab.tipoAusencia);
  const tipo = String(ab.tipoAusencia || "").trim().toLowerCase();
  const subtipo = normalizeAusenciaSubtype(ab.tipoAusencia, ab.subtipoAusencia);
  if (tipo.includes("vacac")) {
    return { typeLabel, conceptLabel: "Días hábiles en Vacaciones", quantityKind: "business" };
  }
  if (tipo.includes("sufrag") || tipo.includes("vot")) {
    return {
      typeLabel,
      conceptLabel: subtipo === "jurado" ? "Día compensatorio por jurado de votación" : "Permiso compensatorio por sufragio",
      quantityKind: "recognized"
    };
  }
  if (tipo.includes("matern")) {
    return { typeLabel, conceptLabel: maternityConceptLabel(subtipo || "ordinaria"), quantityKind: "calendar" };
  }
  if (tipo.includes("patern")) {
    return { typeLabel, conceptLabel: paternityConceptLabel(subtipo || "continua"), quantityKind: "calendar" };
  }
  if (tipo.includes("incapaci") || tipo.includes("arl") || tipo === "eps") {
    return { typeLabel, conceptLabel: `Días calendario en ${typeLabel}`, quantityKind: "calendar" };
  }
  if (tipo.includes("luto") || tipo.includes("duelo") || tipo.includes("cita") || tipo.includes("judic")) {
    return { typeLabel, conceptLabel: `Días hábiles de ${typeLabel.toLowerCase()}`, quantityKind: "business" };
  }
  return { typeLabel, conceptLabel: `Días de ${typeLabel.toLowerCase()}`, quantityKind: "calendar" };
}

function buildAbsenceSlipRows(absences: AbsenceInput[], serviceLo: Date, serviceHi: Date) {
  const acc = new Map<string, { typeLabel: string; conceptLabel: string; quantity: number }>();
  for (const ab of absences) {
    const ov = overlapInclusive(ab.fechaInicio, ab.fechaFin, serviceLo, serviceHi);
    if (!ov) continue;
    const concept = absenceConceptForSlip(ab);
    const recognizedDays = Math.max(0, Number(ab.diasReconocidos ?? 0));
    const recognizedUnit = String(ab.unidadDiasReconocidos || "").trim().toLowerCase();
    const fullOverlap =
      ov.s.getTime() === ab.fechaInicio.getTime() &&
      ov.e.getTime() === ab.fechaFin.getTime();
    const quantity =
      recognizedDays > 0 && (fullOverlap || recognizedUnit === "jornada" || concept.quantityKind === "recognized")
        ? recognizedDays
        : concept.quantityKind === "business"
          ? inclusiveBusinessDays(ov.s, ov.e)
          : inclusiveCalendarDays(ov.s, ov.e);
    if (quantity <= 0) continue;
    const key = `${concept.typeLabel}__${concept.conceptLabel}`;
    const prev = acc.get(key);
    if (prev) {
      prev.quantity = Math.round((prev.quantity + quantity) * 100) / 100;
    } else {
      acc.set(key, {
        typeLabel: concept.typeLabel,
        conceptLabel: concept.conceptLabel,
        quantity: Math.round(quantity * 100) / 100
      });
    }
  }
  return Array.from(acc.values()).sort((a, b) =>
    `${a.typeLabel} ${a.conceptLabel}`.localeCompare(`${b.typeLabel} ${b.conceptLabel}`, "es")
  );
}

export function classifyAusenciaTipo(tipo: string, observaciones: string | null): NoveltyClassification {
  const t = String(tipo || "").trim().toLowerCase();
  const obs = String(observaciones || "").trim().toLowerCase();
  if (/\barl\b|origen.?labor|risk|riesgo.?labor/i.test(obs) || t.includes("arl")) {
    return { kind: "incapacidad_arl", label: humanizeAusenciaTipo(tipo) || "Incapacidad ARL" };
  }
  if (t.includes("suspens")) {
    return { kind: "suspension", label: humanizeAusenciaTipo(tipo) || "Suspensión" };
  }
  if (/sin\s*goce|no.?remuner/i.test(t) || /sin\s*goce|no.?remuner/i.test(obs)) {
    return { kind: "licencia_no_remunerada", label: humanizeAusenciaTipo(tipo) || "Licencia no remunerada" };
  }
  if (t.includes("matern")) {
    return { kind: "licencia_maternidad", label: humanizeAusenciaTipo(tipo) || "Licencia de maternidad" };
  }
  if (t.includes("patern")) {
    return { kind: "licencia_paternidad", label: humanizeAusenciaTipo(tipo) || "Licencia de paternidad" };
  }
  if (t.includes("incapaci") || t === "eps" || /\beps\b/.test(obs)) {
    return { kind: "incapacidad_eps", label: humanizeAusenciaTipo(tipo) || "Incapacidad EPS" };
  }
  if (t.includes("vacac")) return { kind: "vacaciones", label: humanizeAusenciaTipo(tipo) || "Vacaciones" };
  if (t.includes("luto") || t.includes("duelo")) {
    return { kind: "licencia_luto", label: humanizeAusenciaTipo(tipo) || "Licencia por luto" };
  }
  if (t.includes("calam")) {
    return { kind: "calamidad_domestica", label: humanizeAusenciaTipo(tipo) || "Calamidad doméstica" };
  }
  if ((t.includes("cita") && t.includes("med")) || t.includes("medic")) {
    return { kind: "permiso_cita_medica", label: humanizeAusenciaTipo(tipo) || "Permiso cita médica" };
  }
  if (t.includes("judic")) {
    return { kind: "permiso_citacion_judicial", label: humanizeAusenciaTipo(tipo) || "Permiso citación judicial" };
  }
  if (t.includes("sufrag") || t.includes("vot")) {
    return { kind: "permiso_sufragio", label: humanizeAusenciaTipo(tipo) || "Permiso por sufragio" };
  }
  if (t.includes("licen") || t.includes("permiso")) {
    return { kind: "licencia_remunerada", label: humanizeAusenciaTipo(tipo) || "Licencia remunerada" };
  }
  return { kind: "pagada_otra", label: humanizeAusenciaTipo(tipo) || "Otra ausencia remunerada" };
}

function ymdUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function nCop(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export type PayrollDevengoLine = {
  code: string;
  label: string;
  amount: number;
  incapacityNote?: string;
};

function incapacityEpisodeToDevengoLines(ep: Record<string, unknown>, index: number): PayrollDevengoLine[] {
  const days = nCop(ep.days ?? ep.dias);
  const deduct = nCop(ep.descuentoSalarioCop ?? ep.deductSalaryCop);
  const pay = nCop(ep.pagoEmpleadorCop ?? ep.payEmployerCop);
  const labelBase = `${String(ep.label || ep.tipo || "Incapacidad")} · ${days || "—"} días liq. · ${String(ep.rangeLabel || "")}`.trim();
  const note = ep.nota || ep.note ? String(ep.nota || ep.note) : "";
  const kind = String(ep.tipo || ep.kind || "").toLowerCase();
  const isUnpaid = kind.includes("licencia_no_remunerada") || kind.includes("no_remuner");
  const lines: PayrollDevengoLine[] = [];
  if (deduct !== 0) {
    lines.push({
      code: `INCAPACIDAD_DESC_${index}`,
      label: `${isUnpaid ? "Descuento salario (licencia no remunerada)" : "Descuento salario por incapacidad"} · ${labelBase}`,
      amount: deduct,
      incapacityNote: note
    });
  }
  if (pay !== 0) {
    lines.push({
      code: `INCAPACIDAD_PAGO_${index}`,
      label: `Pago incapacidad a cargo del empleador · ${labelBase}`,
      amount: pay,
      incapacityNote: note
    });
  }
  if (!lines.length && (days > 0 || nCop(ep.ajusteSalarioOrientativoCop ?? ep.adjustCop) !== 0)) {
    lines.push({
      code: `INCAPACIDAD_EP_${index}`,
      label: labelBase,
      amount: nCop(ep.ajusteSalarioOrientativoCop ?? ep.adjustCop),
      incapacityNote: note
    });
  }
  return lines;
}

export function buildColombiaPayrollDevengosLines(opts: {
  salarioBaseCop: number;
  auxilioCop: number;
  extrasCop?: number;
  bonusCop?: number;
  travelCop?: number;
  fuelCop?: number;
  primaCop?: number;
  interesesCop?: number;
  incapEpisodes?: Record<string, unknown>[];
}): PayrollDevengoLine[] {
  const lines: PayrollDevengoLine[] = [
    { code: "SALARIO_ORDINARIO", label: "Salario básico mensual (ordinario)", amount: Math.max(0, nCop(opts.salarioBaseCop)) },
    {
      code: "AUXILIO_TRANSPORTE",
      label: "Auxilio legal de transporte (no constitutivo de salario)",
      amount: Math.max(0, nCop(opts.auxilioCop))
    }
  ];
  const extras = nCop(opts.extrasCop);
  const bonus = nCop(opts.bonusCop);
  const travel = nCop(opts.travelCop);
  const fuel = nCop(opts.fuelCop);
  const prima = nCop(opts.primaCop);
  const intCe = nCop(opts.interesesCop);
  if (extras > 0) lines.push({ code: "EXTRAS", label: "Horas extras, dominicales o recargos nocturnos", amount: extras });
  if (bonus > 0) lines.push({ code: "BONIFICACIONES", label: "Bonificaciones y pagos ocasionales gravables", amount: bonus });
  if (travel > 0) lines.push({ code: "VIATICOS", label: "Viáticos y anticipos de viaje (reintegro)", amount: travel });
  if (fuel > 0) lines.push({ code: "REEMBOLSO_COMBUSTIBLE", label: "Reembolso combustible y gastos de ruta", amount: fuel });
  if (prima > 0) lines.push({ code: "PRIMA_SERVICIOS", label: "Prima de servicios (CST)", amount: prima });
  if (intCe > 0) lines.push({ code: "INT_CESANTIAS", label: "Intereses sobre cesantías (Ley 52/1975)", amount: intCe });
  (Array.isArray(opts.incapEpisodes) ? opts.incapEpisodes : []).forEach((ep, i) => {
    incapacityEpisodeToDevengoLines(ep, i).forEach((line) => lines.push(line));
  });
  return lines;
}

export type ColombiaPayrollCutDeps = {
  periodStorageKey: string;
  calendarMonthYm: string;
  periodStart: Date;
  periodEnd: Date;
  salarioMensual: number;
  auxilioTransporteMes: number;
  fechaIngresoEmpresa: Date;
  ausenciasEnPeriodo: AbsenceInput[];
  smmlv: number;
  healthEmployeeRate?: number;
  pensionEmployeeRate?: number;
  cesantiasBaseInteresOpcional?: number;
  /** `mensual` | `quincenal` | … — define en qué corte del semestre va la prima automática. */
  payFrequencyNorm?: string;
  /** Otra liquidación del mismo mes (jun/dic) ya incluyó prima. */
  primaAlreadyPaidInSemesterMonth?: boolean;
  /** Otra liquidación de ene/feb del año ya incluyó intereses de cesantías. */
  cesantiasInterestAlreadyPaidInYear?: boolean;
  integralSalary?: boolean;
  arlRiskLevel?: string | null;
  contributorType?: string | null;
  uvtCop?: number;
};

/** @deprecated Preferir computeColombiaPayrollForPeriodCut */
export type ColombiaAutoPayrollDeps = {
  periodoYm: string;
  salarioMensual: number;
  auxilioTransporteMes: number;
  fechaIngresoEmpresa: Date;
  ausenciasEnPeriodo: AbsenceInput[];
  smmlv: number;
  healthEmployeeRate?: number;
  pensionEmployeeRate?: number;
  cesantiasBaseInteresOpcional?: number;
};

export type ColombiaAutoPayrollResult = {
  salarioProporcionalCop: number;
  auxilioProporcionalCop: number;
  primaServiciosCop: number;
  primaDiasSemestre: number | null;
  payPrimaServicios: boolean;
  ibcOrientativo: number;
  healthDeduction: number;
  pensionDeduction: number;
  solidarityDeduction: number;
  subsistenceDeduction: number;
  withholdingDeduction: number;
  totalDeducciones: number;
  payInteresesCesantias: boolean;
  interesesCesantiasCop: number;
  cesantiasInterestDays: number | null;
  grossTotal: number;
  netOrientativo: number;
  diasCalendarioServicioEnMes: number;
  salarioBaseProporcionalCop: number;
  novedadesJson: Record<string, unknown>;
};

function calcPrimaServiciosCop(salary: number, daysInSemester: number): number {
  const s = Math.max(0, salary);
  const d = Math.max(0, Math.floor(daysInSemester));
  return Math.round((s * d) / 360);
}

function semesterEmployedCalendarDays(hireDate: Date, ymPeriod: string, capEndDate: Date): number {
  const m = ymPeriod.slice(5);
  const y = Number(ymPeriod.slice(0, 4));
  let semStart: Date;
  let semEnd: Date;
  if (m === "06") {
    semStart = dateOnlyUtc(y, 0, 1);
    semEnd = dateOnlyUtc(y, 5, 30);
  } else if (m === "12") {
    semStart = dateOnlyUtc(y, 6, 1);
    semEnd = dateOnlyUtc(y, 11, 31);
  } else {
    return 0;
  }
  const startEffective = maxDate(semStart, hireDate);
  const endEffective = minDate(semEnd, capEndDate);
  if (startEffective > endEffective) return 0;
  return Math.min(180, inclusiveCalendarDays(startEffective, endEffective));
}

function isUltimoDiaMesUtc(d: Date): boolean {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const dom = d.getUTCDate();
  const ld = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return dom === ld;
}

function quincenaHalfFromPeriodKey(periodKey: string): "Q1" | "Q2" | "" {
  const m = /-Q([12])$/i.exec(String(periodKey || "").trim());
  return m ? (`Q${m[1]}` as "Q1" | "Q2") : "";
}

/** Prima automática: mensual al cierre; quincenal en 2ª quincena de jun/dic si no se pagó en la 1ª. */
function shouldAutogenPrimaOnCut(d: ColombiaPayrollCutDeps): boolean {
  const ym = String(d.calendarMonthYm || "").trim().slice(0, 7);
  const m = Number(ym.slice(5, 7));
  if (m !== 6 && m !== 12) return false;
  if (d.primaAlreadyPaidInSemesterMonth) return false;
  const freq = String(d.payFrequencyNorm || "mensual")
    .trim()
    .toLowerCase();
  if (freq === "mensual") return isUltimoDiaMesUtc(d.periodEnd);
  if (freq === "quincenal") return quincenaHalfFromPeriodKey(d.periodStorageKey) === "Q2";
  if (freq === "catorcenal") return /-C2$/i.test(d.periodStorageKey);
  return isUltimoDiaMesUtc(d.periodEnd);
}

/** Intereses cesantías: primer corte ene/feb del año sin pago previo (evita duplicar en 2ª quincena). */
function shouldAutogenCesantiasInterestOnCut(d: ColombiaPayrollCutDeps): boolean {
  const base = Math.max(0, d.cesantiasBaseInteresOpcional ?? 0);
  if (base <= 0) return false;
  if (d.cesantiasInterestAlreadyPaidInYear) return false;
  const m = Number(String(d.calendarMonthYm || "").trim().slice(5, 7));
  return m === 1 || m === 2;
}

export function computeColombiaPayrollForPeriodCut(d: ColombiaPayrollCutDeps): ColombiaAutoPayrollResult {
  const hire = d.fechaIngresoEmpresa;
  const p0 = d.periodStart;
  const p1 = d.periodEnd;

  const serviceLo = maxDate(p0, hire);
  const serviceHi = p1;

  let diasEnCorte = inclusiveCalendarDays(serviceLo, serviceHi);
  if (diasEnCorte <= 0) {
    throw new Error(
      `sin días laborables en el período (fecha de ingreso ${hire.toISOString().slice(0, 10)} posterior al corte)`
    );
  }

  diasEnCorte = Math.min(diasEnCorte, 30);

  const salMonthly = Math.max(0, d.salarioMensual);
  const daily = salMonthly > 0 ? salMonthly / 30 : 0;
  const atr = Math.max(0, d.auxilioTransporteMes);
  let salarioBaseProp = Math.round(daily * diasEnCorte);
  let salarioAjuste = 0;
  const auxProp = atr > 0 ? Math.round((atr / 30) * diasEnCorte) : 0;

  const vacOverlapDaysAgg: Record<string, { dias: number; label: string }> = {};
  const incapEsp: Record<string, unknown>[] = [];
  let payPrima = false;
  let primaDays: number | null = null;
  let primaCop = 0;

  const primaMn = Number(d.calendarMonthYm.slice(5, 7));
  if ((primaMn === 6 || primaMn === 12) && shouldAutogenPrimaOnCut(d)) {
    primaDays = semesterEmployedCalendarDays(hire, d.calendarMonthYm, d.periodEnd);
    payPrima = primaDays >= 1;
    if (payPrima) primaCop = calcPrimaServiciosCop(salMonthly, primaDays);
  }

  for (const ab of d.ausenciasEnPeriodo) {
    const cl = classifyAusenciaTipo(ab.tipoAusencia, ab.observaciones);
    const ov = overlapInclusive(ab.fechaInicio, ab.fechaFin, serviceLo, serviceHi);
    if (!ov) continue;
    const calendarDays = inclusiveCalendarDays(ov.s, ov.e);
    const businessDays = inclusiveBusinessDays(ov.s, ov.e);
    const recognized = Math.max(0, Number(ab.diasReconocidos ?? 0));
    const concept = absenceConceptForSlip(ab);
    let quantity = calendarDays;
    if (cl.kind === "permiso_sufragio") {
      quantity = recognized > 0 ? recognized : 0.5;
    } else if (
      recognized > 0 &&
      ov.s.getTime() === ab.fechaInicio.getTime() &&
      ov.e.getTime() === ab.fechaFin.getTime()
    ) {
      quantity = recognized;
    } else if (concept.quantityKind === "business") {
      quantity = businessDays;
    }
    const moneyDays =
      cl.kind === "permiso_sufragio" ? quantity : concept.quantityKind === "business" ? businessDays : calendarDays;
    const rangeLabel = `${ymdUtc(ov.s)} → ${ymdUtc(ov.e)}`;
    const fullDeduct = moneyDays > 0 && daily > 0 ? -Math.round(daily * moneyDays) : 0;
    const fullPay = moneyDays > 0 && daily > 0 ? Math.round(daily * moneyDays) : 0;

    if (cl.kind === "vacaciones") {
      vacOverlapDaysAgg[`${ab.id}`] = { dias: businessDays, label: cl.label };
    }

    const pushEp = (row: Record<string, unknown>) => {
      incapEsp.push({
        ausenciaId: ab.id,
        tipo: cl.kind,
        kind: cl.kind,
        label: cl.label,
        typeLabel: cl.label,
        conceptLabel: concept.conceptLabel,
        rangeLabel,
        ...row
      });
    };

    if (cl.kind === "incapacidad_eps") {
      const toleranciaMinimo = salMonthly > 0 && salMonthly <= d.smmlv;
      let netIncap = 0;
      let deductIncap = 0;
      let payIncap = 0;
      const payerNotes: string[] = [];
      const msDay = 86_400_000;
      for (let cur = ov.s.getTime(); cur <= ov.e.getTime(); cur += msDay) {
        const dt = new Date(cur);
        const idx = episodeDayIndex(ab.fechaInicio, dt);
        const dayAdj = calcColombiaIncapacityEpsDayAdjustmentCop({
          dailySalary: daily,
          dayIndexInEpisode: idx,
          monthlySalary: salMonthly,
          smmlv: d.smmlv
        });
        netIncap += dayAdj.adjustCop;
        deductIncap += dayAdj.deductCop || 0;
        payIncap += dayAdj.payCop || 0;
        if (dayAdj.payer && !payerNotes.includes(dayAdj.payer)) payerNotes.push(dayAdj.payer);
      }
      const roundedIncap = Math.round(netIncap);
      salarioAjuste += roundedIncap;
      pushEp({
        dias: calendarDays,
        ajusteSalarioOrientativoCop: roundedIncap,
        descuentoSalarioCop: Math.round(deductIncap),
        pagoEmpleadorCop: Math.round(payIncap),
        pagoTerceroCop: Math.max(0, Math.round(-Math.round(deductIncap) - Math.round(payIncap))),
        payer: toleranciaMinimo && calendarDays <= 2 ? "Empleador" : "EPS y empleador",
        nota: `Incapacidad común (EPS): ${payerNotes.join("; ") || "tabla Dec. 780/2016"}.`
      });
      continue;
    }

    if (cl.kind === "incapacidad_arl") {
      const deduct = calendarDays > 0 ? -Math.round(daily * calendarDays) : 0;
      salarioAjuste += deduct;
      pushEp({
        dias: calendarDays,
        ajusteSalarioOrientativoCop: deduct,
        descuentoSalarioCop: deduct,
        pagoEmpleadorCop: 0,
        pagoTerceroCop: Math.abs(deduct),
        payer: "ARL",
        nota: "Incapacidad laboral (ARL): descuento en nómina empresa; pago a cargo de ARL."
      });
      continue;
    }

    if (cl.kind === "licencia_maternidad" || cl.kind === "licencia_paternidad") {
      const deduct = calendarDays > 0 ? -Math.round(daily * calendarDays) : 0;
      salarioAjuste += deduct;
      pushEp({
        dias: calendarDays,
        ajusteSalarioOrientativoCop: deduct,
        descuentoSalarioCop: deduct,
        pagoEmpleadorCop: 0,
        pagoTerceroCop: Math.abs(deduct),
        payer: "EPS",
        nota: `${cl.label}: prestación a cargo de la EPS (100% salario/IBC orientativo).`
      });
      continue;
    }

    if (cl.kind === "licencia_no_remunerada" || cl.kind === "suspension") {
      const deduct = calendarDays > 0 ? -Math.round(daily * calendarDays) : 0;
      salarioAjuste += deduct;
      pushEp({
        dias: calendarDays,
        ajusteSalarioOrientativoCop: deduct,
        descuentoSalarioCop: deduct,
        pagoEmpleadorCop: 0,
        pagoTerceroCop: 0,
        payer: "Ninguno",
        nota:
          cl.kind === "suspension"
            ? "Suspensión: días sin remuneración (salario÷30)."
            : "Licencia no remunerada: descuento de salario (salario÷30)."
      });
      continue;
    }

    pushEp({
      dias: quantity,
      ajusteSalarioOrientativoCop: 0,
      descuentoSalarioCop: fullDeduct,
      pagoEmpleadorCop: fullPay,
      pagoTerceroCop: 0,
      payer: "Empleador",
      nota: `${cl.label}: remunerada por el empleador. Valor desglosado; el neto del período no cambia.`
    });
  }

  const salarioProp = Math.max(0, salarioBaseProp + salarioAjuste);
  const ibcComputed = calcColombiaPayrollIbcCop({
    baseSalaryCop: salarioProp,
    integralSalary: Boolean(d.integralSalary),
    diasCorte: diasEnCorte,
    smmlv: d.smmlv
  });

  const baseCes = Math.max(0, d.cesantiasBaseInteresOpcional ?? 0);
  const payInt = shouldAutogenCesantiasInterestOnCut(d);
  const intDays = payInt ? 360 : null;
  const interesesCop = payInt ? Math.round(baseCes * CESANTIAS_INTERES_ANUAL) : 0;

  const ded = calcColombiaEmployeeDeductionsCop({
    ibc: ibcComputed,
    smmlv: d.smmlv,
    healthRate: d.healthEmployeeRate ?? HEALTH_EMPLOYEE_RATE,
    pensionRate: d.pensionEmployeeRate ?? PENSION_EMPLOYEE_RATE,
    contributorType: d.contributorType
  });
  const withholding = calcColombiaWithholdingTaxOrientativeCop({
    ibc: ibcComputed,
    uvt: d.uvtCop ?? 0,
    healthDeduction: ded.health,
    pensionDeduction: ded.pension,
    dependents: 0
  });
  const employer = calcColombiaEmployerContributionsCop({
    ibc: ibcComputed,
    arlRiskLevel: d.arlRiskLevel,
    contributorType: d.contributorType
  });
  const provisions = {
    cesantias: calcColombiaCesantiasMonthlyProvisionCop(salMonthly, diasEnCorte),
    prima: calcColombiaCesantiasMonthlyProvisionCop(salMonthly, diasEnCorte),
    vacaciones: Math.round((Math.max(0, salMonthly) * diasEnCorte) / 720)
  };

  const grossTotal =
    salarioProp + auxProp + (payPrima ? primaCop : 0) + (payInt ? interesesCop : 0);

  const h = ded.health;
  const pm = ded.pension;
  const s = ded.solidarity;
  const sub = ded.subsistence;
  const wh = withholding.withholdingCop;
  const totalDeducciones = ded.total + wh;
  const netOrientativo = Math.round(grossTotal - totalDeducciones);

  const novedadesJson: Record<string, unknown> = {
    disclaimers: [
      "Cálculo automático orientativo (Colombia). No constituye asesoría legal ni contable.",
      `SMMLV referencia usada: ${d.smmlv.toLocaleString("es-CO")} COP.`,
      "Corte conforme periodicidad registrada del empleado (calendario America/Bogotá). Validar política empresarial de pago.",
      "Prima CST arts.244–249 solo en cierre de junio o diciembre (último día del período liquidado)."
    ],
    corteNomina: {
      clavePersistencia: d.periodStorageKey,
      desde: d.periodStart.toISOString().slice(0, 10),
      hasta: d.periodEnd.toISOString().slice(0, 10),
      mesCalendarioYm: d.calendarMonthYm,
      zonaHorariaCalendario: "America/Bogota"
    },
    diasServicioEnCorteCalendario: diasEnCorte,
    colillaPagoDiasLaborados: {
      diasLaborados: diasEnCorte,
      pagoDiasLaboradosCop: salarioProp,
      formula: "(salario mensual / 30) x dias laborados en el corte"
    },
    proporcionFormula:
      "Salario: (mensual÷30)×días de contrato en el corte. Auxilio transporte proporcional igual criterio. Divisor orientativo uso frecuente en nómina colombiana (validar pacto/colectivos).",
    fechaIngresoConsiderada: hire.toISOString().slice(0, 10),
    absenceSlipDetail: {
      rows: buildAbsenceSlipRows(d.ausenciasEnPeriodo, serviceLo, serviceHi)
    },
    vacaciones: vacOverlapDaysAgg,
    ausenciasAjustes: incapEsp,
    salarioBaseProporcionalCop: salarioBaseProp,
    incapacity: {
      episodes: incapEsp,
      totalAdjustCop: salarioAjuste,
      smmlvRef: d.smmlv,
      legalNote:
        "Novedades de nómina: vacaciones, licencias, permisos, suspensiones e incapacidades. Se desglosa descuento, pago del empleador y lo a cargo de EPS/ARL."
    },
    devengosLines: buildColombiaPayrollDevengosLines({
      salarioBaseCop: salarioBaseProp,
      auxilioCop: auxProp,
      primaCop: payPrima ? primaCop : 0,
      interesesCop: payInt ? interesesCop : 0,
      incapEpisodes: incapEsp
    }),
    primaServiciosAutomática: payPrima
      ? {
          diasSemestreOrientativos: primaDays,
          cop: primaCop,
          formula: "Salario mensual × días semestre ÷ 360 (CST arts.244–249 orientativo)"
        }
      : null,
    interesesCesantiasAutomatico: payInt
      ? { baseCesantias: baseCes, dias360: intDays, cop: interesesCop }
      : {
          omitidoMotivo: d.cesantiasInterestAlreadyPaidInYear
            ? "Intereses de cesantías ya liquidados en otra nómina de enero o febrero del mismo año."
            : baseCes <= 0
              ? "Sin variable PAYROLL_AUTOGEN_CESANTIAS_INTERES_BASE_COP o base en 0."
              : "Este corte no es de enero ni febrero; intereses suelen parametrizarse en esos meses."
        },
    integralSalaryApplied: Boolean(d.integralSalary),
    employerContributionsOrientativo: employer,
    provisionsOrientativo: provisions,
    withholdingOrientativo: withholding
  };

  return {
    salarioProporcionalCop: salarioProp,
    auxilioProporcionalCop: auxProp,
    primaServiciosCop: primaCop,
    primaDiasSemestre: primaDays,
    payPrimaServicios: payPrima,
    ibcOrientativo: ibcComputed,
    healthDeduction: h,
    pensionDeduction: pm,
    solidarityDeduction: s,
    subsistenceDeduction: sub,
    withholdingDeduction: wh,
    totalDeducciones,
    payInteresesCesantias: payInt,
    interesesCesantiasCop: interesesCop,
    cesantiasInterestDays: intDays,
    grossTotal,
    netOrientativo,
    diasCalendarioServicioEnMes: diasEnCorte,
    salarioBaseProporcionalCop: salarioBaseProp,
    novedadesJson
  };
}

export function computeColombiaAutoMonthlyPayroll(d: ColombiaAutoPayrollDeps): ColombiaAutoPayrollResult {
  const bounds = monthUtcBounds(d.periodoYm);
  if (!bounds) {
    throw new Error("periodoYm inválido (use YYYY-MM)");
  }
  return computeColombiaPayrollForPeriodCut({
    periodStorageKey: d.periodoYm,
    calendarMonthYm: d.periodoYm,
    periodStart: bounds.monthStart,
    periodEnd: bounds.monthEnd,
    salarioMensual: d.salarioMensual,
    auxilioTransporteMes: d.auxilioTransporteMes,
    fechaIngresoEmpresa: d.fechaIngresoEmpresa,
    ausenciasEnPeriodo: d.ausenciasEnPeriodo,
    smmlv: d.smmlv,
    cesantiasBaseInteresOpcional: d.cesantiasBaseInteresOpcional
  });
}
