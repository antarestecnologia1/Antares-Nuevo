/**
 * Motor legal orientativo nómina Colombia (API — espejo de payroll-colombia-legal.domain.js).
 */

export const CO_PAYROLL_IBC_MAX_SMMLV = 25;
export const CO_INTEGRAL_SALARY_IBC_FACTOR = 0.7;

export const CO_ARL_EMPLOYER_RATES: Record<string, number> = {
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

export function normalizeArlRiskLevelKey(raw: unknown): string {
  const t = String(raw ?? "").trim().toUpperCase();
  const m = /(I|II|III|IV|V)/.exec(t.replace(/NIVEL\s*/i, ""));
  return m ? m[1]! : "I";
}

export function calcColombiaPayrollIbcCop(opts: {
  baseSalaryCop: number;
  extrasCop?: number;
  bonusCop?: number;
  overtimeCop?: number;
  integralSalary?: boolean;
  diasCorte?: number;
  smmlv: number;
}): number {
  const base = Math.max(0, Number(opts.baseSalaryCop) || 0);
  const ex = Math.max(0, Number(opts.extrasCop) || 0);
  const bo = Math.max(0, Number(opts.bonusCop) || 0);
  const ot = Math.max(0, Number(opts.overtimeCop) || 0);
  const days = Math.max(1, Math.min(30, Math.floor(Number(opts.diasCorte) || 30)));
  const sm = Math.max(0, Number(opts.smmlv) || 0);
  let raw = base + ex + bo + ot;
  if (opts.integralSalary) raw = Math.round(raw * CO_INTEGRAL_SALARY_IBC_FACTOR);
  const floor = sm > 0 ? Math.round((sm / 30) * days) : 0;
  const cap = sm > 0 ? Math.round(((sm * CO_PAYROLL_IBC_MAX_SMMLV) / 30) * days) : raw;
  return Math.max(floor, Math.min(cap, Math.round(raw)));
}

export function calcColombiaPensionSolidarityCop(
  ibc: number,
  smmlv: number
): { solidarityCop: number; ratePct: number; tramo: string } {
  const b = Math.max(0, Number(ibc) || 0);
  const sm = Math.max(0, Number(smmlv) || 0);
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

export function calcColombiaPensionSubsistenceCop(ibc: number, smmlv: number): number {
  const b = Math.max(0, Number(ibc) || 0);
  const sm = Math.max(0, Number(smmlv) || 0);
  if (sm <= 0 || b < sm * 4) return 0;
  return Math.round(b * 0.005);
}

export function calcColombiaEmployeeDeductionsCop(opts: {
  ibc: number;
  smmlv: number;
  healthRate: number;
  pensionRate: number;
  contributorType?: string | null;
}): {
  health: number;
  pension: number;
  solidarity: number;
  subsistence: number;
  total: number;
} {
  const ct = String(opts.contributorType ?? "dependiente").trim().toLowerCase();
  const b = Math.max(0, Number(opts.ibc) || 0);
  if (ct.includes("aprendiz") && ct.includes("lectivo")) {
    return { health: 0, pension: 0, solidarity: 0, subsistence: 0, total: 0 };
  }
  const health = Math.round(b * Math.max(0, Number(opts.healthRate) || 0));
  const pension = Math.round(b * Math.max(0, Number(opts.pensionRate) || 0));
  const sol = calcColombiaPensionSolidarityCop(b, opts.smmlv);
  const subsistence = calcColombiaPensionSubsistenceCop(b, opts.smmlv);
  return {
    health,
    pension,
    solidarity: sol.solidarityCop,
    subsistence,
    total: health + pension + sol.solidarityCop + subsistence
  };
}

export function calcColombiaWithholdingProcedimiento1Cop(opts: {
  taxableIncomeCop: number;
  uvt: number;
  healthDeduction: number;
  pensionDeduction: number;
  dependents?: number;
}): { withholdingCop: number; taxableUvt: number; procedure: string; note: string } {
  const uvtVal = Math.max(0, Number(opts.uvt) || 0);
  if (uvtVal <= 0) {
    return { withholdingCop: 0, taxableUvt: 0, procedure: "1", note: "Sin UVT en parámetros legales." };
  }
  const gross = Math.max(0, Number(opts.taxableIncomeCop) || 0);
  const ded = Math.max(0, Number(opts.healthDeduction) || 0) + Math.max(0, Number(opts.pensionDeduction) || 0);
  const depDed = Math.max(0, Math.floor(Number(opts.dependents) || 0)) * 32 * uvtVal;
  const taxable = Math.max(0, gross - ded - depDed);
  const bgUvt = taxable / uvtVal;
  if (bgUvt <= 95) {
    return { withholdingCop: 0, taxableUvt: bgUvt, procedure: "1", note: "Base gravable ≤ 95 UVT: tarifa 0%." };
  }
  let taxUvt = 0;
  if (bgUvt > 95) taxUvt += Math.min(bgUvt - 95, 55) * 0.19;
  if (bgUvt > 150) taxUvt += Math.min(bgUvt - 150, 210) * 0.28;
  if (bgUvt > 360) taxUvt += Math.min(bgUvt - 360, 280) * 0.33;
  if (bgUvt > 640) taxUvt += Math.min(bgUvt - 640, 305) * 0.35;
  if (bgUvt > 945) taxUvt += Math.min(bgUvt - 945, 1355) * 0.37;
  if (bgUvt > 2300) taxUvt += (bgUvt - 2300) * 0.39;
  return {
    withholdingCop: Math.round(taxUvt * uvtVal),
    taxableUvt: bgUvt,
    procedure: "1",
    note: "Procedimiento 1 Art. 383 ET (tabla marginal UVT)."
  };
}

export function calcColombiaWithholdingTaxOrientativeCop(opts: {
  ibc: number;
  uvt: number;
  healthDeduction: number;
  pensionDeduction: number;
  dependents?: number;
}): { withholdingCop: number; taxableUvt: number; note: string } {
  const r = calcColombiaWithholdingProcedimiento1Cop({
    taxableIncomeCop: opts.ibc,
    uvt: opts.uvt,
    healthDeduction: opts.healthDeduction,
    pensionDeduction: opts.pensionDeduction,
    dependents: opts.dependents
  });
  return { withholdingCop: r.withholdingCop, taxableUvt: r.taxableUvt, note: r.note };
}

export function calcColombiaEmployerContributionsCop(opts: {
  ibc: number;
  arlRiskLevel?: string | null;
  contributorType?: string | null;
}): Record<string, number> & { total: number; arlRatePct: number } {
  const b = Math.max(0, Number(opts.ibc) || 0);
  const ct = String(opts.contributorType ?? "").trim().toLowerCase();
  const arlKey = normalizeArlRiskLevelKey(opts.arlRiskLevel);
  const arlRate = CO_ARL_EMPLOYER_RATES[arlKey] ?? CO_ARL_EMPLOYER_RATES.I!;
  if (ct.includes("aprendiz") && ct.includes("lectivo")) {
    const health = Math.round(b * 0.125);
    const pension = Math.round(b * 0.12);
    const arl = Math.round(b * arlRate);
    return { health, pension, arl, sena: 0, icbf: 0, caja: 0, total: health + pension + arl, arlRatePct: arlRate * 100 };
  }
  const health = Math.round(b * 0.085);
  const pension = Math.round(b * 0.12);
  const arl = Math.round(b * arlRate);
  const sena = Math.round(b * 0.02);
  const icbf = Math.round(b * 0.03);
  const caja = Math.round(b * 0.04);
  return {
    health,
    pension,
    arl,
    sena,
    icbf,
    caja,
    total: health + pension + arl + sena + icbf + caja,
    arlRatePct: arlRate * 100
  };
}

export function calcColombiaIncapacityEpsDayAdjustmentCop(opts: {
  dailySalary: number;
  dayIndexInEpisode: number;
  monthlySalary: number;
  smmlv: number;
}): { adjustCop: number; payer: string } {
  const daily = Math.max(0, Number(opts.dailySalary) || 0);
  const idx = Math.max(1, Math.floor(Number(opts.dayIndexInEpisode) || 1));
  const monthly = Math.max(0, Number(opts.monthlySalary) || 0);
  const sm = Math.max(0, Number(opts.smmlv) || 0);
  if (daily <= 0) return { adjustCop: 0, payer: "—" };
  if (monthly > 0 && monthly <= sm) {
    const pct = idx <= 2 ? 1 : idx <= 90 ? 0.6667 : 0.5;
    return { adjustCop: Math.round(-daily * (1 - pct)), payer: idx <= 2 ? "Empleador 100%" : "EPS" };
  }
  if (idx <= 2) return { adjustCop: Math.round(-daily * (1 / 3)), payer: "Empleador ~66,7%" };
  return { adjustCop: -Math.round(daily), payer: idx <= 90 ? "EPS 66,7%" : "EPS 50%" };
}

export function calcColombiaCesantiasMonthlyProvisionCop(baseSalaryMonthly: number, daysInPeriod = 30): number {
  const s = Math.max(0, Number(baseSalaryMonthly) || 0);
  const d = Math.max(0, Math.min(30, Number(daysInPeriod) || 30));
  return Math.round((s * d) / 360);
}
