/**
 * Liquidación contractual por terminación — Colombia (CST, Ley 50, Ley 52).
 * Orientativo: validar con abogado laboral y contador antes de pagar.
 */
import { CO_PAYROLL, CO_HR_RULES } from "../core/config.js";
import {
  calcColombiaEmployeeDeductionsCop,
  calcColombiaWithholdingProcedimiento1Cop,
  colombiaTransportAllowanceEligibleCop,
  readActiveUvtCop,
  resolveIntegralSalaryFlag
} from "./payroll-colombia-legal.domain.js";
import { isColombiaHolidayLocalDate } from "./colombia-holidays.domain.js";

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parseYmd(raw) {
  const s = String(raw || "").trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d, 12, 0, 0, 0);
  if (Number.isNaN(dt.getTime()) || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

function isLastDayOfMonth(dt) {
  return new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate() === dt.getDate();
}

/**
 * Días inclusivos en base comercial 360 (meses de 30 días): el día 31 cuenta como 30 y el
 * último día de febrero completa el mes (1-feb → 28-feb = 30 días; 1-ene → 31-dic = 360).
 */
export function days360Inclusive(a, b) {
  if (!a || !b || a > b) return 0;
  const d1 = a.getMonth() === 1 && isLastDayOfMonth(a) ? 30 : Math.min(a.getDate(), 30);
  const d2 = isLastDayOfMonth(b) ? 30 : Math.min(b.getDate(), 30);
  return (
    (b.getFullYear() - a.getFullYear()) * 360 + (b.getMonth() - a.getMonth()) * 30 + (d2 - d1) + 1
  );
}

function payrollBusinessDaysInclusive(a, b) {
  if (!a || !b || a > b) return 0;
  let total = 0;
  const cur = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 12);
  while (cur <= b) {
    const wd = cur.getDay();
    if (wd !== 0 && wd !== 6 && !isColombiaHolidayLocalDate(cur)) total += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

function yearStart(y) {
  return new Date(y, 0, 1, 12, 0, 0, 0);
}

function semesterBoundsForDate(dt) {
  const y = dt.getFullYear();
  const m = dt.getMonth();
  if (m < 6) return { start: new Date(y, 0, 1, 12, 0, 0, 0), end: new Date(y, 5, 30, 12, 0, 0, 0) };
  return { start: new Date(y, 6, 1, 12, 0, 0, 0), end: new Date(y, 11, 31, 12, 0, 0, 0) };
}

export const CO_LEGAL_FINIQUITO_CHECKLIST = [
  "Pago de todos los rubros acordados en finiquito firmado por las partes.",
  "Entrega de certificado laboral (CST art. 57): tiempo de servicio, cargo, salario, causa de retiro.",
  "Paz y salvo mutuo por obligaciones laborales pendientes.",
  "Traslado de cesantías al fondo o pago directo según extracto y fecha de retiro.",
  "Reporte de novedad de retiro en seguridad social (sin PILA automática en este sistema).",
  "Entrega de dotación y elementos de trabajo devueltos por el trabajador.",
  "Actualizar estado del empleado en el directorio y archivar soportes de terminación."
];
export const CO_TERMINATION_CAUSE_LABELS = {
  renuncia_voluntaria: "Renuncia voluntaria",
  despido_sin_justa: "Despido sin justa causa",
  despido_justa: "Despido con justa causa",
  mutuo_acuerdo: "Mutuo acuerdo",
  vencimiento_contrato: "Vencimiento de contrato",
  otro: "Otro"
};

/** Reglas orientativas de prestaciones por causal (CST / práctica laboral). */
export function terminationCauseEligibility(cause) {
  const c = String(cause || "otro").trim().toLowerCase();
  const base = {
    salarioPendiente: true,
    auxilioTransporte: true,
    cesantias: true,
    interesesCesantias: true,
    primaProporcional: true,
    vacaciones: true,
    indemnizacionDespido: false,
    indemnizacionAvisoPrevio: false,
    note: ""
  };
  if (c === "despido_sin_justa") {
    return {
      ...base,
      indemnizacionDespido: true,
      indemnizacionAvisoPrevio: false,
      note: "Despido sin justa causa: prestaciones sociales + indemnización CST art. 64 (indefinido: tabla por años de servicio; término fijo: salarios del tiempo faltante). La Ley 50/1990 eliminó la indemnización por falta de preaviso del empleador."
    };
  }
  if (c === "despido_justa") {
    return {
      ...base,
      indemnizacionDespido: false,
      indemnizacionAvisoPrevio: false,
      note: "Despido con justa causa: se liquidan prestaciones devengadas (cesantías, prima, vacaciones, intereses); no hay indemnización sustitutiva por despido."
    };
  }
  if (c === "renuncia_voluntaria") {
    return {
      ...base,
      indemnizacionDespido: false,
      indemnizacionAvisoPrevio: false,
      note: "Renuncia: se liquidan las prestaciones devengadas. No se descuenta ni se cobra multa por falta de preaviso."
    };
  }
  if (c === "vencimiento_contrato") {
    return {
      ...base,
      indemnizacionDespido: false,
      note: "Vencimiento del plazo pactado: prestaciones devengadas. Terminación anticipada de contrato fijo puede generar indemnización (Ley 50/1990) — regístrela en «Otros» o indemnización manual."
    };
  }
  if (c === "mutuo_acuerdo") {
    return {
      ...base,
      indemnizacionDespido: "manual",
      note: "Mutuo acuerdo: ajuste indemnización y rubros según acta o acuerdo firmado."
    };
  }
  return { ...base, note: "Revise causal y rubros con asesoría legal." };
}

/** Días laborados en base 360 (ingreso → retiro inclusive). */
export function calcColombiaTerminationEmployedDays(hireDateYmd, terminationDateYmd) {
  const hire = parseYmd(hireDateYmd);
  const term = parseYmd(terminationDateYmd);
  if (!hire || !term || term < hire) return 0;
  return days360Inclusive(hire, term);
}

/** Días del año de retiro para cesantías (base 360): desde 1 ene o ingreso hasta retiro. */
export function calcColombiaTerminationCesantiasDaysYear(hireDateYmd, terminationDateYmd) {
  const hire = parseYmd(hireDateYmd);
  const term = parseYmd(terminationDateYmd);
  if (!term) return 0;
  const y = term.getFullYear();
  const yearLo = yearStart(y);
  const lo = hire && hire > yearLo ? hire : yearLo;
  if (lo > term) return 0;
  return Math.min(360, days360Inclusive(lo, term));
}

/** Días del semestre en curso para prima proporcional. */
export function calcColombiaTerminationPrimaSemesterDays(hireDateYmd, terminationDateYmd) {
  const hire = parseYmd(hireDateYmd);
  const term = parseYmd(terminationDateYmd);
  if (!term) return 0;
  const sem = semesterBoundsForDate(term);
  const lo = hire && hire > sem.start ? hire : sem.start;
  const hi = term < sem.end ? term : sem.end;
  if (lo > hi) return 0;
  return Math.min(180, days360Inclusive(lo, hi));
}

/**
 * Vacaciones pendientes (orientativo): 15 días hábiles/año → 15/360 × días laborados − gozadas.
 */
export function calcColombiaTerminationVacationDaysAccrued(employedDays, vacationDaysTaken = 0) {
  const total = Math.max(0, parseNum(employedDays));
  const taken = Math.max(0, parseNum(vacationDaysTaken));
  const accrued = (total * 15) / 360;
  return Math.max(0, Math.round((accrued - taken) * 100) / 100);
}

/** Suma días de vacaciones gozadas desde ausencias del empleado. */
export function sumVacationDaysTakenFromAbsences(employeeId, absencesAll, hireDateYmd, terminationDateYmd) {
  const hire = parseYmd(hireDateYmd);
  const term = parseYmd(terminationDateYmd);
  if (!term) return 0;
  const lo = hire || new Date(1900, 0, 1, 12);
  let sum = 0;
  for (const ab of absencesAll || []) {
    if (String(ab.employeeId || "") !== String(employeeId || "")) continue;
    const t = String(ab.absenceType || ab.type || "").toLowerCase();
    if (!t.includes("vacac")) continue;
    const s = parseYmd(ab.startDate);
    const e = parseYmd(ab.endDate) || s;
    if (!s || !e) continue;
    const ovStart = s > lo ? s : lo;
    const ovEnd = e < term ? e : term;
    if (ovStart > ovEnd) continue;
    const overlapBusiness = payrollBusinessDaysInclusive(ovStart, ovEnd);
    const recognized = parseNum(ab.recognizedDays ?? ab.days);
    if (recognized > 0) {
      /* Prorratea los días reconocidos según la parte de la ausencia que cae dentro del vínculo. */
      const fullBusiness = payrollBusinessDaysInclusive(s, e);
      sum += fullBusiness > 0 ? (recognized * overlapBusiness) / fullBusiness : recognized;
    } else {
      sum += overlapBusiness;
    }
  }
  return Math.round(sum * 100) / 100;
}

/**
 * Indemnización despido sin justa causa, contrato a término indefinido — CST art. 64 (Ley 789/2002).
 * Salario < 10 SMMLV: 30 días el primer año (aunque no se complete) + 20 días por año adicional, proporcional.
 * Salario ≥ 10 SMMLV: 20 días el primer año + 15 días por año adicional, proporcional.
 */
export function calcColombiaIndemnizacionDespidoSinJustaCop(salaryMonthly, employedDays, smmlv = CO_PAYROLL.smmlv) {
  const sal = Math.max(0, parseNum(salaryMonthly));
  const days = Math.max(0, parseNum(employedDays));
  if (sal <= 0 || days <= 0) return { cop: 0, diasIndemn: 0, formula: "" };
  const sm = Math.max(0, parseNum(smmlv));
  const highSalary = sm > 0 && sal >= sm * 10;
  const firstYearDays = highSalary ? 20 : 30;
  const extraYearDays = highSalary ? 15 : 20;
  const years = days / 360;
  const diasIndemn =
    Math.round((firstYearDays + Math.max(0, years - 1) * extraYearDays) * 100) / 100;
  return {
    cop: Math.round((sal / 30) * diasIndemn),
    diasIndemn,
    formula: highSalary
      ? "CST art. 64 (salario ≥ 10 SMMLV): 20 días el primer año + 15 días por año adicional, proporcional."
      : "CST art. 64 (salario < 10 SMMLV): 30 días el primer año + 20 días por año adicional, proporcional."
  };
}

/** Indemnización sustitutiva de aviso previo — empleador despide sin preaviso (30 días indefinido). */
export function calcColombiaAvisoPrevioEmpleadorCop(salaryMonthly, avisoDaysWorked = 0, contractIndefinite = true) {
  const sal = Math.max(0, parseNum(salaryMonthly));
  const worked = Math.max(0, parseNum(avisoDaysWorked));
  const required = contractIndefinite ? 30 : 15;
  const missing = Math.max(0, required - worked);
  return Math.round((sal / 30) * missing);
}

/** Descuento por renuncia sin aviso previo al empleador (15 días — CST art. 62). */
export function calcColombiaRenunciaAvisoPrevioDeductionCop(salaryMonthly, avisoDaysWorked = 0, contractIndefinite = true) {
  const sal = Math.max(0, parseNum(salaryMonthly));
  const worked = Math.max(0, parseNum(avisoDaysWorked));
  const required = contractIndefinite ? 15 : 8;
  const missing = Math.max(0, required - worked);
  return Math.round((sal / 30) * missing);
}

/**
 * Contrato a término fijo: salarios del tiempo restante si el empleador termina sin justa causa (Ley 50/1990 art. 7).
 */
export function calcColombiaFixedTermRemainingSalaryCop(salaryMonthly, terminationDateYmd, contractEndDateYmd) {
  const sal = Math.max(0, parseNum(salaryMonthly));
  const term = parseYmd(terminationDateYmd);
  const end = parseYmd(contractEndDateYmd);
  if (!term || !end || end <= term || sal <= 0) return { cop: 0, daysRemaining: 0 };
  const next = new Date(term.getFullYear(), term.getMonth(), term.getDate() + 1, 12);
  const daysRemaining = days360Inclusive(next, end);
  return { cop: Math.round((sal / 30) * daysRemaining), daysRemaining };
}

/**
 * Clasificación tributaria finiquito (sin DIAN): qué integra seguridad social y retención.
 * Cesantías, intereses e indemnización despido: exentos de retención (doctrina laboral).
 */
export function classifyColombiaTerminationTaxBases({
  salarioPendiente = 0,
  auxilioPendiente = 0,
  overtime = 0,
  bonus = 0,
  primaProporcional = 0,
  vacaciones = 0
}) {
  const sal = Math.max(0, parseNum(salarioPendiente));
  const ot = Math.max(0, parseNum(overtime));
  const bo = Math.max(0, parseNum(bonus));
  const prima = Math.max(0, parseNum(primaProporcional));
  const vac = Math.max(0, parseNum(vacaciones));
  const ibcSeguridadSocial = sal + ot + bo;
  const baseRetencion = sal + ot + bo + prima + vac;
  return {
    ibcSeguridadSocial,
    baseRetencion,
    auxilioNoConstitutivo: Math.max(0, parseNum(auxilioPendiente)),
    note:
      "Seguridad social sobre salario y pagos salariales del último período. Retención Proc. 1 sobre salario, extras, prima y vacaciones en dinero. Cesantías, intereses e indemnizaciones excluidos de retención."
  };
}

/** Salario y auxilio del mes de retiro (base 30: desde el 1 o el ingreso hasta la fecha de retiro). */
export function calcColombiaTerminationPendingSalaryCop(
  salaryMonthly,
  terminationDateYmd,
  transportMonthlyCop = 0,
  hireDateYmd = ""
) {
  const term = parseYmd(terminationDateYmd);
  const sal = Math.max(0, parseNum(salaryMonthly));
  if (!term || sal <= 0) return { salarioCop: 0, auxilioCop: 0, diasMes: 0 };
  const monthStart = new Date(term.getFullYear(), term.getMonth(), 1, 12);
  const hire = parseYmd(hireDateYmd);
  const from = hire && hire > monthStart ? hire : monthStart;
  const diasMes = Math.min(30, days360Inclusive(from, term));
  const salarioCop = Math.round((sal / 30) * diasMes);
  const aux = Math.max(0, parseNum(transportMonthlyCop));
  const auxilioCop = aux > 0 ? Math.round((aux / 30) * diasMes) : 0;
  return { salarioCop, auxilioCop, diasMes };
}

/**
 * Motor completo de liquidación por terminación.
 */
export function computeColombiaTerminationSettlement({
  employee,
  position,
  terminationDateYmd,
  terminationCause = "otro",
  cesantiasFondoBalanceCop = 0,
  pendingOvertimeCop = 0,
  pendingBonusCop = 0,
  avisoPrevioDaysWorked = 0,
  renunciaAvisoDaysWorked = 0,
  manualIndemnizationCop = 0,
  otrosSettlementCop = 0,
  contractEndDateYmd = null,
  contractIndefinite = true,
  absencesAll = [],
  withholdingDependents = 0,
  smmlv = CO_PAYROLL.smmlv
}) {
  const hire = String(employee?.startDate || "").trim().slice(0, 10);
  const term = String(terminationDateYmd || "").trim().slice(0, 10);
  const salary = Math.max(0, parseNum(employee?.baseSalary));
  const integral = resolveIntegralSalaryFlag(employee, position);
  const eligibility = terminationCauseEligibility(terminationCause);

  const employedDays = calcColombiaTerminationEmployedDays(hire, term);
  const cesantiasDaysYear = calcColombiaTerminationCesantiasDaysYear(hire, term);
  const primaSemesterDays = calcColombiaTerminationPrimaSemesterDays(hire, term);
  const vacationTaken = sumVacationDaysTakenFromAbsences(employee?.id, absencesAll, hire, term);
  const vacationDaysAccrued = calcColombiaTerminationVacationDaysAccrued(employedDays, vacationTaken);

  const transportRef = colombiaTransportAllowanceEligibleCop(salary, smmlv)
    ? parseNum(employee?.transportAllowance) > 0
      ? parseNum(employee.transportAllowance)
      : CO_HR_RULES.transportAllowance
    : 0;
  const pending = calcColombiaTerminationPendingSalaryCop(salary, term, transportRef, hire);

  /* El auxilio de transporte integra la base de cesantías, intereses y prima (Ley 1/1963 art. 7), no la de vacaciones. */
  const prestacionesBase = salary + transportRef;
  /* El salario integral ya incluye cesantías, intereses y prima (CST art. 132). */
  const cesantiasCausadas =
    eligibility.cesantias && !integral ? Math.round((prestacionesBase * cesantiasDaysYear) / 360) : 0;
  /* El saldo ya consignado lo paga el fondo, no el empleador: solo se informa. */
  const fondo = Math.max(0, parseNum(cesantiasFondoBalanceCop));
  const cesantiasTotal = cesantiasCausadas;
  const interesesBase = cesantiasCausadas;
  const interesesCesantias =
    eligibility.interesesCesantias && !integral && interesesBase > 0
      ? Math.round(interesesBase * 0.12 * (Math.min(cesantiasDaysYear, 360) / 360))
      : 0;
  const primaProporcional =
    eligibility.primaProporcional && !integral
      ? Math.round((prestacionesBase * primaSemesterDays) / 360)
      : 0;
  const vacaciones =
    eligibility.vacaciones && vacationDaysAccrued > 0
      ? Math.round((salary * vacationDaysAccrued) / 30)
      : 0;

  let indemnizacionDespido = 0;
  let indemnizacionFormula = "";
  if (eligibility.indemnizacionDespido === true && contractIndefinite) {
    const ind = calcColombiaIndemnizacionDespidoSinJustaCop(salary, employedDays, smmlv);
    indemnizacionDespido = ind.cop;
    indemnizacionFormula = ind.formula;
  } else if (eligibility.indemnizacionDespido === "manual") {
    indemnizacionDespido = Math.max(0, parseNum(manualIndemnizationCop));
  }

  let indemnizacionAviso = 0;
  if (eligibility.indemnizacionAvisoPrevio) {
    indemnizacionAviso = calcColombiaAvisoPrevioEmpleadorCop(salary, avisoPrevioDaysWorked, contractIndefinite);
  }

  let indemnizacionContratoFijo = 0;
  let fixedTermDays = 0;
  if (
    !contractIndefinite &&
    terminationCause === "despido_sin_justa" &&
    contractEndDateYmd
  ) {
    const ft = calcColombiaFixedTermRemainingSalaryCop(salary, term, contractEndDateYmd);
    indemnizacionContratoFijo = ft.cop;
    fixedTermDays = ft.daysRemaining;
    indemnizacionFormula = "CST art. 64 (término fijo): salarios del tiempo faltante para cumplir el plazo.";
  }

  // Política de la empresa: no se aplica multa ni descuento por falta de preaviso (siempre 0).
  const renunciaAvisoDeduction = 0;

  const salarioPendiente = eligibility.salarioPendiente ? pending.salarioCop : 0;
  const auxilioPendiente = eligibility.auxilioTransporte ? pending.auxilioCop : 0;
  const overtime = Math.max(0, parseNum(pendingOvertimeCop));
  const bonus = Math.max(0, parseNum(pendingBonusCop));
  const otros = Math.max(0, parseNum(otrosSettlementCop)) + indemnizacionContratoFijo;

  const taxBases = classifyColombiaTerminationTaxBases({
    salarioPendiente,
    auxilioPendiente,
    overtime,
    bonus,
    primaProporcional,
    vacaciones
  });

  const grossDevengos =
    salarioPendiente +
    auxilioPendiente +
    overtime +
    bonus +
    cesantiasTotal +
    interesesCesantias +
    primaProporcional +
    vacaciones +
    indemnizacionDespido +
    indemnizacionAviso +
    otros;

  const ded = calcColombiaEmployeeDeductionsCop({
    ibc: taxBases.ibcSeguridadSocial,
    smmlv,
    contributorType: employee?.contributorType
  });
  const uvt = readActiveUvtCop();
  const withholding = calcColombiaWithholdingProcedimiento1Cop({
    taxableIncomeCop: taxBases.baseRetencion,
    uvt,
    healthDeduction: ded.health,
    pensionDeduction: ded.pension,
    dependents: withholdingDependents
  });
  const totalDeductions = ded.total + withholding.withholdingCop + renunciaAvisoDeduction;
  const net = grossDevengos - totalDeductions;

  const lines = [
    { code: "SALARIO_PENDIENTE", label: `Salario pendiente (${pending.diasMes} días del mes de retiro)`, amount: salarioPendiente },
    { code: "AUXILIO_PENDIENTE", label: "Auxilio de transporte proporcional", amount: auxilioPendiente },
    { code: "HORAS_EXTRAS_PEND", label: "Horas extras / recargos pendientes", amount: overtime },
    { code: "BONIFICACIONES_PEND", label: "Bonificaciones pendientes", amount: bonus },
    {
      code: "CESANTIAS_CAUSADAS",
      label: `Cesantías año en curso (${cesantiasDaysYear} días ÷ 360)`,
      amount: cesantiasCausadas
    },
    {
      code: "INT_CESANTIAS",
      label: `Intereses cesantías (12% anual Ley 52/1975 sobre base ${interesesBase.toLocaleString("es-CO")})`,
      amount: interesesCesantias
    },
    {
      code: "PRIMA_PROP",
      label: `Prima proporcional semestre (${primaSemesterDays} días ÷ 360)`,
      amount: primaProporcional
    },
    {
      code: "VACACIONES",
      label: `Vacaciones compensadas (${vacationDaysAccrued} días pendientes)`,
      amount: vacaciones
    },
    {
      code: "INDEMN_DESPIDO",
      label: "Indemnización sustitutiva despido sin justa causa (CST art. 64)",
      amount: indemnizacionDespido
    },
    {
      code: "INDEMN_AVISO",
      label: "Indemnización sustitutiva aviso previo (empleador)",
      amount: indemnizacionAviso
    },
    ...(indemnizacionContratoFijo > 0
      ? [
          {
            code: "INDEMN_FIJO",
            label: `Salarios tiempo restante contrato fijo (${fixedTermDays} días — Ley 50/1990)`,
            amount: indemnizacionContratoFijo
          }
        ]
      : []),
    { code: "OTROS", label: "Otros conceptos de finiquito", amount: Math.max(0, parseNum(otrosSettlementCop)) }
  ].filter((l) => parseNum(l.amount) > 0 || l.code === "SALARIO_PENDIENTE");

  const deductionsLines = [
    { code: "SALUD", label: "Aporte salud empleado (4%)", amount: ded.health },
    { code: "PENSION", label: "Aporte pensión empleado (4%)", amount: ded.pension },
    { code: "FSP", label: `Fondo solidaridad pensional (${ded.solidarityTramo || "—"})`, amount: ded.solidarity },
    { code: "RETENCION", label: "Retención fuente Proc. 1 (Art. 383)", amount: withholding.withholdingCop }
  ].filter((l) => parseNum(l.amount) > 0);

  return {
    terminationCause,
    eligibility,
    integralSalaryApplied: integral,
    employedDays,
    cesantiasDaysYear,
    primaSemesterDays,
    vacationDaysAccrued,
    vacationDaysTaken: vacationTaken,
    cesantiasCausadas,
    cesantiasFondoBalance: fondo,
    cesantias: cesantiasTotal,
    interesesCesantias,
    primaProporcional,
    vacaciones,
    indemnizacionDespido,
    indemnizacionAviso,
    indemnizacionContratoFijo,
    fixedTermRemainingDays: fixedTermDays,
    renunciaAvisoDeduction,
    indemnizacionFormula,
    taxClassification: taxBases,
    salarioPendiente,
    auxilioPendiente,
    pendingOvertimeCop: overtime,
    pendingBonusCop: bonus,
    otrosSettlement: Math.max(0, parseNum(otrosSettlementCop)),
    gross: grossDevengos,
    ibc: taxBases.ibcSeguridadSocial,
    health: ded.health,
    pension: ded.pension,
    solidarity: ded.solidarity,
    subsistence: ded.subsistence,
    withholding: withholding.withholdingCop,
    withholdingNote: withholding.note,
    deductions: totalDeductions,
    deductionsLines,
    finiquitoChecklist: CO_LEGAL_FINIQUITO_CHECKLIST,
    net,
    devengosLines: lines,
    legalDisclaimer:
      "Liquidación contractual Colombia (CST, Ley 50/1990, Ley 52/1975, Art. 383 ET). Sin transmisión PILA/DIAN. Validar finiquito firmado, extracto fondo de cesantías y certificado laboral con abogado y contador."
  };
}

/** Sugiere días de referencia en el formulario antes del cálculo monetario. */
export function suggestTerminationReferenceDays({ employee, terminationDateYmd, absencesAll }) {
  const hire = String(employee?.startDate || "").trim();
  const term = String(terminationDateYmd || "").trim();
  const employedDays = calcColombiaTerminationEmployedDays(hire, term);
  const cesantiasDaysYear = calcColombiaTerminationCesantiasDaysYear(hire, term);
  const primaSemesterDays = calcColombiaTerminationPrimaSemesterDays(hire, term);
  const vacationTaken = sumVacationDaysTakenFromAbsences(employee?.id, absencesAll, hire, term);
  const vacationDaysAccrued = calcColombiaTerminationVacationDaysAccrued(employedDays, vacationTaken);
  return {
    employedDays,
    days360Year: cesantiasDaysYear,
    primaPropDays: primaSemesterDays,
    vacationDays: vacationDaysAccrued,
    vacationDaysTaken: vacationTaken
  };
}

/** Aplica liquidación sugerida al formulario de terminación. */
export function applyTerminationSettlementToForm(form, settlement) {
  if (!form || !settlement) return;
  const set = (name, val) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = String(val ?? "");
  };
  set("cesantiasCop", settlement.cesantias);
  set("interesesCesantiasCop", settlement.interesesCesantias);
  set("primaPropCop", settlement.primaProporcional);
  set("vacacionesCop", settlement.vacaciones);
  set("salarioPendienteCop", settlement.salarioPendiente);
  set("auxilioPendienteCop", settlement.auxilioPendiente);
  set("indemnizacionDespidoCop", settlement.indemnizacionDespido);
  set("indemnizacionAvisoCop", settlement.indemnizacionAviso);
  set("indemnization", settlement.indemnizacionDespido + settlement.indemnizacionAviso);
  if (settlement.indemnizacionContratoFijo > 0) {
    set("otrosSettlement", (parseNum(settlement.otrosSettlement) || 0) + settlement.indemnizacionContratoFijo);
  } else {
    set("otrosSettlement", settlement.otrosSettlement);
  }
  const hint = form.querySelector("#settlement-cause-hint");
  if (hint && settlement.eligibility?.note) {
    hint.textContent = settlement.eligibility.note;
    hint.classList.remove("hidden");
  }
  const preview = form.querySelector("#settlement-preview-net");
  if (preview) {
    preview.textContent = `$${Math.round(settlement.net).toLocaleString("es-CO")} neto orientativo`;
  }
}

/** Lee entradas del formulario y calcula liquidación completa. */
export function computeTerminationSettlementFromForm(form, { employee, position, absencesAll }) {
  if (!form || !employee) return null;
  const data = {};
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    const n = el.name;
    if (n) data[n] = el.type === "checkbox" ? el.checked : el.value;
  });
  const contractIndef =
    !String(employee.contractType || "")
      .toLowerCase()
      .includes("fijo") && !String(employee.contractDuration || "").toLowerCase().includes("fijo");
  const cause = String(data.terminationCause || "otro");
  const elig = terminationCauseEligibility(cause);
  return computeColombiaTerminationSettlement({
    employee,
    position,
    terminationDateYmd: data.terminationDate,
    terminationCause: cause,
    cesantiasFondoBalanceCop: parseNum(data.cesantiasFondoBalanceCop),
    pendingOvertimeCop: parseNum(data.pendingOvertimeCop),
    pendingBonusCop: parseNum(data.pendingBonusCop),
    avisoPrevioDaysWorked: parseNum(data.avisoPrevioDaysWorked),
    renunciaAvisoDaysWorked: parseNum(data.renunciaAvisoDaysWorked || data.avisoPrevioDaysWorked),
    manualIndemnizationCop: elig.indemnizacionDespido === "manual" ? parseNum(data.indemnization) : 0,
    otrosSettlementCop: parseNum(data.otrosSettlement),
    contractEndDateYmd: String(employee.contractEndDate || employee.endDate || data.contractEndDate || "").trim() || null,
    contractIndefinite: contractIndef,
    absencesAll,
    withholdingDependents: parseNum(data.withholdingDependents)
  });
}
