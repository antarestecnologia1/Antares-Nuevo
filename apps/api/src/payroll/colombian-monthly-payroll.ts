/**
 * Orientación tributaria/laboral colombiana — validación con contador y RRHH indispensable.
 *
 * Soporta cortes dentro del mes (quincena, etc.) mediante `periodStart` / `periodEnd` (fechas civiles).
 */

export const HEALTH_EMPLOYEE_RATE = 0.04;
export const PENSION_EMPLOYEE_RATE = 0.04;
export const SOLIDARITY_RATE = 0.01;
export const SOLIDARITY_SMMLV_MULTIPLIER = 4;

export const CESANTIAS_INTERES_ANUAL = 0.12;

export const SMMLV_COP_REFERENCE_2026 = 1_750_905;

export type AbsenceInput = {
  id: string;
  tipoAusencia: string;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones: string | null;
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
  | { kind: "licencia_no_remunerada"; label: string }
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
  if (/sin\s*goce|no.?remuner/i.test(t)) return "Licencia no remunerada";
  if (t.includes("licen") || t.includes("permiso")) return "Licencia remunerada";
  return raw;
}

export function classifyAusenciaTipo(tipo: string, observaciones: string | null): NoveltyClassification {
  const t = String(tipo || "").trim().toLowerCase();
  const obs = String(observaciones || "").trim().toLowerCase();
  if (/\barl\b|origen.?labor|risk|riesgo.?labor/i.test(obs) || t.includes("arl")) {
    return { kind: "incapacidad_arl", label: humanizeAusenciaTipo(tipo) || "Incapacidad ARL" };
  }
  if (/sin\s*goce|no.?remuner/i.test(t) || /sin\s*goce|no.?remuner/i.test(obs)) {
    return { kind: "licencia_no_remunerada", label: humanizeAusenciaTipo(tipo) || "Licencia no remunerada" };
  }
  if (t.includes("incapaci") || t === "eps" || /\beps\b/.test(obs)) {
    return { kind: "incapacidad_eps", label: humanizeAusenciaTipo(tipo) || "Incapacidad EPS" };
  }
  if (t.includes("vacac")) return { kind: "vacaciones", label: humanizeAusenciaTipo(tipo) || "Vacaciones" };
  return { kind: "pagada_otra", label: humanizeAusenciaTipo(tipo) || "Otra ausencia remunerada orientativa" };
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
  totalDeducciones: number;
  payInteresesCesantias: boolean;
  interesesCesantiasCop: number;
  cesantiasInterestDays: number | null;
  grossTotal: number;
  netOrientativo: number;
  diasCalendarioServicioEnMes: number;
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

export function computeColombiaPayrollForPeriodCut(d: ColombiaPayrollCutDeps): ColombiaAutoPayrollResult {
  const hire = d.fechaIngresoEmpresa;
  const p0 = d.periodStart;
  const p1 = d.periodEnd;

  const serviceLo = maxDate(p0, hire);
  const serviceHi = p1;

  let diasEnCorte = inclusiveCalendarDays(serviceLo, serviceHi);
  if (diasEnCorte <= 0) {
    throw new Error(
      `empleado sin días efectivos en el corte — verifique fecha de ingreso (${hire.toISOString().slice(0, 10)}) frente al rango solicitado`
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
  if ((primaMn === 6 || primaMn === 12) && isUltimoDiaMesUtc(d.periodEnd)) {
    primaDays = semesterEmployedCalendarDays(hire, d.calendarMonthYm, d.periodEnd);
    payPrima = primaDays >= 1;
    if (payPrima) primaCop = calcPrimaServiciosCop(salMonthly, primaDays);
  }

  for (const ab of d.ausenciasEnPeriodo) {
    const cl = classifyAusenciaTipo(ab.tipoAusencia, ab.observaciones);
    const ov = overlapInclusive(ab.fechaInicio, ab.fechaFin, serviceLo, serviceHi);
    if (!ov) continue;

    if (cl.kind === "vacaciones") {
      vacOverlapDaysAgg[`${ab.id}`] = {
        dias: inclusiveCalendarDays(ov.s, ov.e),
        label: cl.label
      };
      continue;
    }

    if (cl.kind === "pagada_otra") {
      incapEsp.push({
        ausenciaId: ab.id,
        tipo: cl.label,
        dias: inclusiveCalendarDays(ov.s, ov.e),
        ajusteSalarioOrientativoCop: 0,
        nota:
          String(ab.tipoAusencia).toLowerCase().includes("licencia")
            ? "Licencias con goce u otras ausencias remuneradas: sin ajuste en este motor (registro informativo)."
            : "Ausencia tratada como remunerada salvo pacto especial."
      });
      continue;
    }

    if (cl.kind === "licencia_no_remunerada") {
      const days = inclusiveCalendarDays(ov.s, ov.e);
      const ded = -Math.round(days * daily);
      salarioAjuste += ded;
      incapEsp.push({
        ausenciaId: ab.id,
        tipo: cl.kind,
        dias: days,
        ajusteSalarioOrientativoCop: ded,
        nota: "Descuento ~ salario÷30 × días sin goce de sueldo (validar colectivo / convenio)."
      });
      continue;
    }

    if (cl.kind === "incapacidad_arl") {
      const days = inclusiveCalendarDays(ov.s, ov.e);
      const ded = -Math.round(days * daily);
      salarioAjuste += ded;
      incapEsp.push({
        ausenciaId: ab.id,
        tipo: cl.kind,
        dias: days,
        ajusteSalarioOrientativoCop: ded,
        nota: "Incapacidad origen laboral / ARL: orientativamente excluida de nómina empresa (pago vía ARL ~100% del salario base orientativo)."
      });
      continue;
    }

    const toleranciaMinimo = salMonthly > 0 && salMonthly <= d.smmlv;
    if (toleranciaMinimo) {
      incapEsp.push({
        ausenciaId: ab.id,
        tipo: cl.kind,
        dias: inclusiveCalendarDays(ov.s, ov.e),
        ajusteSalarioOrientativoCop: 0,
        nota:
          "Salario equivalente a SMMLV o inferior: no se prorratea negativamente en este motor (verificar pago 100% según normativa/EPS vigente)."
      });
      continue;
    }

    let netIncap = 0;
    const msDay = 86_400_000;
    for (let cur = ov.s.getTime(); cur <= ov.e.getTime(); cur += msDay) {
      const dt = new Date(cur);
      const idx = episodeDayIndex(ab.fechaInicio, dt);
      netIncap += -daily + (idx <= 2 ? (daily * 2) / 3 : 0);
    }
    const roundedIncap = Math.round(netIncap);
    salarioAjuste += roundedIncap;
    incapEsp.push({
      ausenciaId: ab.id,
      tipo: cl.kind,
      dias: inclusiveCalendarDays(ov.s, ov.e),
      ajusteSalarioOrientativoCop: roundedIncap,
      nota:
        "Incapacidad origen común (EPS): se retira el día completo desde nómina empresa y se reintegra orientativamente ~⅔ del día en los dos primeros días corridos del episodio desde fecha_inicio; del día 3 en adelante el pago habitual lo liquida EPS/UPC según tabla (empleador suele consolidar/recuperar). Validar año y soporte médico."
    });
  }

  const salarioProp = Math.max(0, salarioBaseProp + salarioAjuste);
  const ibcComputed = Math.max(0, Math.round(daily * diasEnCorte));

  const baseCes = Math.max(0, d.cesantiasBaseInteresOpcional ?? 0);
  const msIx = d.periodStart.getUTCMonth();
  const payInt =
    baseCes > 0 && (msIx === 0 || msIx === 1);
  const intDays = payInt ? 360 : null;
  const interesesCop = payInt ? Math.round(baseCes * CESANTIAS_INTERES_ANUAL) : 0;

  const healthDeduction = ibcComputed * Math.max(0, d.healthEmployeeRate ?? HEALTH_EMPLOYEE_RATE);
  const pensionDeduction = ibcComputed * Math.max(0, d.pensionEmployeeRate ?? PENSION_EMPLOYEE_RATE);
  const solidarityDeduction =
    ibcComputed > d.smmlv * SOLIDARITY_SMMLV_MULTIPLIER ? ibcComputed * SOLIDARITY_RATE : 0;

  const grossTotal =
    salarioProp + auxProp + (payPrima ? primaCop : 0) + (payInt ? interesesCop : 0);

  const h = Math.round(healthDeduction);
  const pm = Math.round(pensionDeduction);
  const s = Math.round(solidarityDeduction);
  const totalDeducciones = h + pm + s;
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
    proporcionFormula:
      "Salario: (mensual÷30)×días de contrato en el corte. Auxilio transporte proporcional igual criterio. Divisor orientativo uso frecuente en nómina colombiana (validar pacto/colectivos).",
    fechaIngresoConsiderada: hire.toISOString().slice(0, 10),
    vacaciones: vacOverlapDaysAgg,
    ausenciasAjustes: incapEsp,
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
          omitidoMotivo:
            msIx !== 0 && msIx !== 1
              ? "Este corte no inicia en enero ni febrero; intereses de cesantías suelen parametrizarse con nómina de esos meses."
              : "Sin variable PAYROLL_AUTOGEN_CESANTIAS_INTERES_BASE_COP o base en 0."
        }
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
    totalDeducciones,
    payInteresesCesantias: payInt,
    interesesCesantiasCop: interesesCop,
    cesantiasInterestDays: intDays,
    grossTotal,
    netOrientativo,
    diasCalendarioServicioEnMes: diasEnCorte,
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
