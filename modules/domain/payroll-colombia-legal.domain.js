/**
 * Motor legal orientativo nómina Colombia (CST, Ley 100, Ley 52, Dec. 780/2016).
 * No sustituye PILA, nómina electrónica ni asesoría contable.
 */
import { CO_PAYROLL, CO_HR_RULES, KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** IBC máximo cotización salud/pensión (25 SMMLV — referencia habitual). */
export const CO_PAYROLL_IBC_MAX_SMMLV = 25;

/** Salario integral: IBC sobre 70% del salario (prestaciones incluidas en el pacto). */
export const CO_INTEGRAL_SALARY_IBC_FACTOR = 0.7;

/** Tarifas ARL empleador orientativas por nivel (Res. 1563/2015). */
export const CO_ARL_EMPLOYER_RATES = {
  I: 0.00522,
  II: 0.01044,
  III: 0.02436,
  IV: 0.0435,
  V: 0.0696,
  "NIVEL I": 0.00522,
  "NIVEL II": 0.01044,
  "NIVEL III": 0.02436,
  "NIVEL IV": 0.0435,
  "NIVEL V": 0.0696
};

/** Recargos y horas extras (CST / práctica habitual). */
export const CO_OVERTIME_RATES = {
  hed: 0.25,
  hen: 0.75,
  hrdf: 1.0,
  hrnf: 0.75,
  recargoNocturno: 0.35
};

export function normalizeArlRiskLevelKey(raw) {
  const t = String(raw || "").trim().toUpperCase();
  const m = /(I|II|III|IV|V)/.exec(t.replace(/NIVEL\s*/i, ""));
  return m ? m[1] : "I";
}

export function resolveIntegralSalaryFlag(employee, position) {
  if (employee?.integralSalary === true || String(employee?.integralSalary).toLowerCase() === "true") return true;
  if (position?.integralSalary === true || String(position?.integralSalary).toLowerCase() === "true") return true;
  return false;
}

/**
 * IBC mensual o proporcional al corte: salario + extras + bonos + horas extras calculadas.
 * Salario integral: 70%. Aplica piso 1 SMMLV y tope 25 SMMLV (proporcional al corte).
 */
export function calcColombiaPayrollIbcCop({
  baseSalaryCop,
  extrasCop = 0,
  bonusCop = 0,
  overtimeCop = 0,
  integralSalary = false,
  diasCorte = 30,
  smmlv = CO_PAYROLL.smmlv
}) {
  const base = Math.max(0, parseNum(baseSalaryCop));
  const ex = Math.max(0, parseNum(extrasCop));
  const bo = Math.max(0, parseNum(bonusCop));
  const ot = Math.max(0, parseNum(overtimeCop));
  const days = Math.max(1, Math.min(30, Math.floor(parseNum(diasCorte)) || 30));
  const sm = Math.max(0, parseNum(smmlv));
  let raw = base + ex + bo + ot;
  if (integralSalary) raw = Math.round(raw * CO_INTEGRAL_SALARY_IBC_FACTOR);
  const floor = sm > 0 ? Math.round((sm / 30) * days) : 0;
  const cap = sm > 0 ? Math.round(((sm * CO_PAYROLL_IBC_MAX_SMMLV) / 30) * days) : raw;
  return Math.max(floor, Math.min(cap, Math.round(raw)));
}

/**
 * Fondo de solidaridad pensional progresivo (trabajador, IBC ≥ 4 SMMLV — Ley 100 art. 204).
 */
export function calcColombiaPensionSolidarityCop(ibc, smmlv = CO_PAYROLL.smmlv) {
  const b = Math.max(0, parseNum(ibc));
  const sm = Math.max(0, parseNum(smmlv));
  if (sm <= 0 || b < sm * 4) return { solidarityCop: 0, ratePct: 0, tramo: "exento" };
  const smmlvCount = b / sm;
  let rate = 0.01;
  let tramo = "4-16 SMMLV";
  if (smmlvCount > 20) {
    rate = 0.02;
    tramo = ">20 SMMLV";
  } else if (smmlvCount > 19) {
    rate = 0.018;
    tramo = "19-20 SMMLV";
  } else if (smmlvCount > 18) {
    rate = 0.016;
    tramo = "18-19 SMMLV";
  } else if (smmlvCount > 17) {
    rate = 0.014;
    tramo = "17-18 SMMLV";
  } else if (smmlvCount > 16) {
    rate = 0.012;
    tramo = "16-17 SMMLV";
  }
  return { solidarityCop: Math.round(b * rate), ratePct: rate * 100, tramo };
}

/**
 * Subsistencia pensional (0,5% sobre IBC cuando ≥ 4 SMMLV — complemento Ley 100).
 */
export function calcColombiaPensionSubsistenceCop(ibc, smmlv = CO_PAYROLL.smmlv) {
  const b = Math.max(0, parseNum(ibc));
  const sm = Math.max(0, parseNum(smmlv));
  if (sm <= 0 || b < sm * 4) return { subsistenceCop: 0, ratePct: 0 };
  return { subsistenceCop: Math.round(b * 0.005), ratePct: 0.5 };
}

/** Deducciones empleado: salud, pensión, solidaridad, subsistencia. */
export function calcColombiaEmployeeDeductionsCop({
  ibc,
  smmlv = CO_PAYROLL.smmlv,
  healthRate = CO_PAYROLL.healthEmployeeRate,
  pensionRate = CO_PAYROLL.pensionEmployeeRate,
  contributorType = "dependiente"
}) {
  const ct = String(contributorType || "dependiente").trim().toLowerCase();
  const b = Math.max(0, parseNum(ibc));
  if (ct.includes("aprendiz") && ct.includes("lectivo")) {
    return {
      health: 0,
      pension: 0,
      solidarity: 0,
      subsistence: 0,
      total: 0,
      note: "Aprendiz SENA en etapa lectiva: sin aportes a cargo del aprendiz."
    };
  }
  const health = Math.round(b * Math.max(0, parseNum(healthRate)));
  const pension = Math.round(b * Math.max(0, parseNum(pensionRate)));
  const sol = calcColombiaPensionSolidarityCop(b, smmlv);
  const sub = calcColombiaPensionSubsistenceCop(b, smmlv);
  const total = health + pension + sol.solidarityCop + sub.subsistenceCop;
  return {
    health,
    pension,
    solidarity: sol.solidarityCop,
    solidarityTramo: sol.tramo,
    solidarityRatePct: sol.ratePct,
    subsistence: sub.subsistenceCop,
    total,
    note: ""
  };
}

/**
 * Retención en la fuente orientativa (procedimiento 1 simplificado con UVT).
 * Ingresos < 95 UVT/mes: 0. No reemplaza retención certificada DIAN.
 */
export function calcColombiaWithholdingTaxOrientativeCop({
  ibc,
  uvt = 0,
  healthDeduction = 0,
  pensionDeduction = 0,
  dependents = 0
}) {
  const uvtVal = Math.max(0, parseNum(uvt));
  if (uvtVal <= 0) return { withholdingCop: 0, taxableUvt: 0, note: "Sin UVT configurada en parámetros legales." };
  const gross = Math.max(0, parseNum(ibc));
  const ded = Math.max(0, parseNum(healthDeduction)) + Math.max(0, parseNum(pensionDeduction));
  const depDed = Math.max(0, Math.floor(parseNum(dependents))) * 32 * uvtVal;
  const taxable = Math.max(0, gross - ded - depDed);
  const taxableUvt = taxable / uvtVal;
  if (taxableUvt <= 95) {
    return { withholdingCop: 0, taxableUvt, note: "Base gravable ≤ 95 UVT (procedimiento 1 orientativo): sin retención." };
  }
  const excessUvt = taxableUvt - 95;
  const withholdingCop = Math.round(excessUvt * uvtVal * 0.19);
  return {
    withholdingCop,
    taxableUvt,
    note: "Estimación orientativa 19% sobre excedente de 95 UVT. Validar tabla Art. 383 ET y dependientes."
  };
}

/** Aportes patronales orientativos sobre IBC. */
export function calcColombiaEmployerContributionsCop({
  ibc,
  arlRiskLevel = "I",
  contributorType = "dependiente",
  healthEmployerRate = 0.085,
  pensionEmployerRate = 0.12,
  includeParafiscales = true
}) {
  const b = Math.max(0, parseNum(ibc));
  const ct = String(contributorType || "").trim().toLowerCase();
  const arlKey = normalizeArlRiskLevelKey(arlRiskLevel);
  const arlRate = CO_ARL_EMPLOYER_RATES[arlKey] ?? CO_ARL_EMPLOYER_RATES.I;
  if (ct.includes("aprendiz") && ct.includes("lectivo")) {
    return {
      health: Math.round(b * 0.125),
      pension: Math.round(b * 0.12),
      arl: Math.round(b * arlRate),
      sena: 0,
      icbf: 0,
      caja: 0,
      total: Math.round(b * (0.125 + 0.12 + arlRate)),
      note: "Aprendiz lectivo: EPS 12,5% + pensión 12% empleador (orientativo)."
    };
  }
  const health = Math.round(b * healthEmployerRate);
  const pension = Math.round(b * pensionEmployerRate);
  const arl = Math.round(b * arlRate);
  const sena = includeParafiscales ? Math.round(b * 0.02) : 0;
  const icbf = includeParafiscales ? Math.round(b * 0.03) : 0;
  const caja = includeParafiscales ? Math.round(b * 0.04) : 0;
  return {
    health,
    pension,
    arl,
    sena,
    icbf,
    caja,
    total: health + pension + arl + sena + icbf + caja,
    arlRatePct: arlRate * 100,
    note: "Parafiscales SENA 2%, ICBF 3%, caja 4% cuando aplica (empresa ≥ 5 trabajadores — validar)."
  };
}

/** Valor hora ordinaria desde salario mensual. */
export function calcColombiaHourlyRateFromMonthly(baseSalaryMonthly, weeklyHours = CO_HR_RULES.legalWeeklyHours) {
  const sal = Math.max(0, parseNum(baseSalaryMonthly));
  const wh = Math.max(1, parseNum(weeklyHours)) || 46;
  return sal > 0 ? sal / (wh * (30 / 7)) : 0;
}

/** Horas extras y recargos (COP). */
export function calcColombiaOvertimeBreakdownCop({
  baseSalaryMonthly,
  hed = 0,
  hen = 0,
  hrdf = 0,
  hrnf = 0,
  recargoNocturnoHoras = 0,
  weeklyHours = CO_HR_RULES.legalWeeklyHours
}) {
  const hourly = calcColombiaHourlyRateFromMonthly(baseSalaryMonthly, weeklyHours);
  const lines = [];
  const add = (code, label, hours, rate) => {
    const h = Math.max(0, parseNum(hours));
    if (h <= 0) return 0;
    const amount = Math.round(hourly * h * (1 + rate));
    lines.push({ code, label, hours: h, hourlyRate: Math.round(hourly), ratePct: rate * 100, amount });
    return amount;
  };
  let total = 0;
  total += add("HED", "Hora extra diurna (+25%)", hed, CO_OVERTIME_RATES.hed);
  total += add("HEN", "Hora extra nocturna (+75%)", hen, CO_OVERTIME_RATES.hen);
  total += add("HRDF", "Hora recargo dominical/festivo (+100%)", hrdf, CO_OVERTIME_RATES.hrdf);
  total += add("HRNF", "Hora recargo nocturno festivo (+75%)", hrnf, CO_OVERTIME_RATES.hrnf);
  total += add("RN", "Recargo nocturno (+35%)", recargoNocturnoHoras, CO_OVERTIME_RATES.recargoNocturno);
  return { totalCop: total, hourlyRate: Math.round(hourly), lines };
}

/**
 * Ajuste salarial por día de incapacidad EPS (origen común) — tabla orientativa Dec. 780/2016.
 * dayIndexInEpisode: 1 = primer día del episodio.
 */
export function calcColombiaIncapacityEpsDayAdjustmentCop({
  dailySalary,
  dayIndexInEpisode,
  monthlySalary,
  smmlv = CO_PAYROLL.smmlv
}) {
  const daily = Math.max(0, parseNum(dailySalary));
  const idx = Math.max(1, Math.floor(parseNum(dayIndexInEpisode)));
  const monthly = Math.max(0, parseNum(monthlySalary));
  const sm = Math.max(0, parseNum(smmlv));
  if (daily <= 0) return { adjustCop: 0, payer: "—", pct: 0 };
  if (monthly > 0 && monthly <= sm) {
    const pct = idx <= 2 ? 1 : idx <= 90 ? 0.6667 : idx <= 180 ? 0.5 : 0.5;
    return { adjustCop: Math.round(-daily * (1 - pct)), payer: idx <= 2 ? "Empleador 100%" : "EPS", pct };
  }
  if (idx <= 2) {
    return { adjustCop: Math.round(-daily * (1 / 3)), payer: "Empleador ~66,7%", pct: 0.6667 };
  }
  if (idx <= 90) {
    return { adjustCop: -Math.round(daily), payer: "EPS 66,7%", pct: 0 };
  }
  if (idx <= 180) {
    return { adjustCop: -Math.round(daily), payer: "EPS 50%", pct: 0 };
  }
  return { adjustCop: -Math.round(daily), payer: "EPS 50% (prorrogado)", pct: 0 };
}

/** Provisión mensual cesantías: salario × días ÷ 360. */
export function calcColombiaCesantiasMonthlyProvisionCop(baseSalaryMonthly, daysInPeriod = 30) {
  const s = Math.max(0, parseNum(baseSalaryMonthly));
  const d = Math.max(0, Math.min(30, parseNum(daysInPeriod)));
  return Math.round((s * d) / 360);
}

/** Provisión mensual prima: salario × días ÷ 360 (acumulación orientativa). */
export function calcColombiaPrimaMonthlyProvisionCop(baseSalaryMonthly, daysInPeriod = 30) {
  return calcColombiaCesantiasMonthlyProvisionCop(baseSalaryMonthly, daysInPeriod);
}

/** Provisión vacaciones: salario × días ÷ 720 (15 días hábiles/año orientativo). */
export function calcColombiaVacationMonthlyProvisionCop(baseSalaryMonthly, daysInPeriod = 30) {
  const s = Math.max(0, parseNum(baseSalaryMonthly));
  const d = Math.max(0, Math.min(30, parseNum(daysInPeriod)));
  return Math.round((s * d) / 720);
}

/** Alerta consignación cesantías al fondo (28 de febrero). */
export function payrollCesantiasConsignmentAlert(calendarMonthYm) {
  const ym = String(calendarMonthYm || "").trim().slice(0, 7);
  const m = Number(ym.slice(5, 7));
  if (m === 2) {
    return {
      level: "warning",
      message:
        "Febrero: recuerde la consignación de cesantías al fondo a más tardar el 28 de febrero (Ley 50/1990). Los intereses se liquidan aparte en enero."
    };
  }
  if (m === 1) {
    return {
      level: "info",
      message: "Enero: plazo habitual para pagar intereses de cesantías al trabajador (Ley 52/1975)."
    };
  }
  return null;
}

/** Lee UVT desde parámetros del sistema en memoria. */
export function readActiveUvtCop() {
  try {
    const raw = read(KEYS.systemParameters, null);
    if (typeof window !== "undefined" && typeof window.normalizeSystemParametersPayload === "function") {
      const norm = window.normalizeSystemParametersPayload(raw);
      const uvt = parseNum(norm?.uvtCop);
      return uvt > 0 ? uvt : 0;
    }
  } catch {
    /* noop */
  }
  return 0;
}

/**
 * Liquidación completa orientativa (portal manual + referencia API).
 */
export function buildColombiaPayrollLiquidation({
  employee,
  position,
  baseSalaryCop,
  diasCorte = 30,
  extrasManualCop = 0,
  bonusCop = 0,
  overtimeInput = {},
  auxCop = 0,
  travelAllowanceCop = 0,
  fuelReimbursementCop = 0,
  incapacityAdjustCop = 0,
  primaServiciosCop = 0,
  interesesCesantiasCop = 0,
  smmlv = CO_PAYROLL.smmlv,
  healthEmployeeRate = CO_PAYROLL.healthEmployeeRate,
  pensionEmployeeRate = CO_PAYROLL.pensionEmployeeRate,
  withholdingDependents = 0,
  applyWithholding = true
}) {
  const integral = resolveIntegralSalaryFlag(employee, position);
  const ot = calcColombiaOvertimeBreakdownCop({
    baseSalaryMonthly: parseNum(employee?.baseSalary),
    ...overtimeInput
  });
  const extrasTotal = Math.max(0, parseNum(extrasManualCop)) + ot.totalCop;
  const ibc = calcColombiaPayrollIbcCop({
    baseSalaryCop,
    extrasCop: extrasTotal,
    bonusCop,
    integralSalary: integral,
    diasCorte,
    smmlv
  });
  const ded = calcColombiaEmployeeDeductionsCop({
    ibc,
    smmlv,
    healthRate: healthEmployeeRate,
    pensionRate: pensionEmployeeRate,
    contributorType: employee?.contributorType
  });
  const uvt = readActiveUvtCop();
  const withholding = applyWithholding
    ? calcColombiaWithholdingTaxOrientativeCop({
        ibc,
        uvt,
        healthDeduction: ded.health,
        pensionDeduction: ded.pension,
        dependents: withholdingDependents
      })
    : { withholdingCop: 0, taxableUvt: 0, note: "" };
  const employer = calcColombiaEmployerContributionsCop({
    ibc,
    arlRiskLevel: employee?.arlRiskLevel || position?.arlRiskLevel,
    contributorType: employee?.contributorType
  });
  const provisions = {
    cesantias: calcColombiaCesantiasMonthlyProvisionCop(parseNum(employee?.baseSalary), diasCorte),
    prima: calcColombiaPrimaMonthlyProvisionCop(parseNum(employee?.baseSalary), diasCorte),
    vacaciones: calcColombiaVacationMonthlyProvisionCop(parseNum(employee?.baseSalary), diasCorte)
  };
  const gross =
    Math.max(0, parseNum(baseSalaryCop)) +
    extrasTotal +
    Math.max(0, parseNum(bonusCop)) +
    Math.max(0, parseNum(auxCop)) +
    Math.max(0, parseNum(travelAllowanceCop)) +
    Math.max(0, parseNum(fuelReimbursementCop)) +
    Math.max(0, parseNum(incapacityAdjustCop)) +
    Math.max(0, parseNum(primaServiciosCop)) +
    Math.max(0, parseNum(interesesCesantiasCop));
  const totalDeductions = ded.total + withholding.withholdingCop;
  const net = gross - totalDeductions;
  return {
    ibc,
    integralSalaryApplied: integral,
    overtime: ot,
    extrasTotalCop: extrasTotal,
    employeeDeductions: ded,
    withholding,
    employerContributions: employer,
    provisions,
    gross,
    totalDeductions,
    net,
    legalDisclaimer:
      "Liquidación orientativa Colombia. Validar con contador, fondo de cesantías, EPS/ARL y DIAN antes de pagar o transmitir PILA."
  };
}
