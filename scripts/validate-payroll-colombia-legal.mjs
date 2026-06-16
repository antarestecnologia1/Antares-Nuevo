/**
 * Motor legal nómina Colombia — pruebas orientativas en browser.
 * node scripts/validate-payroll-colombia-legal.mjs
 */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const SMMLV = 1_750_905;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.calcColombiaPayrollIbcCop === "function");

  const results = await page.evaluate((smmlv) => {
    const out = [];
    const record = (name, ok, detail = "") => out.push({ name, ok, detail });

    const ibcIntegral = window.calcColombiaPayrollIbcCop({
      baseSalaryCop: 20_000_000,
      integralSalary: true,
      diasCorte: 30,
      smmlv
    });
    record("IBC salario integral 70%", ibcIntegral === Math.round(20_000_000 * 0.7));

    const ibcFloor = window.calcColombiaPayrollIbcCop({
      baseSalaryCop: 500_000,
      diasCorte: 30,
      smmlv
    });
    record("IBC piso 1 SMMLV", ibcFloor === smmlv);

    const sol16 = window.calcColombiaPensionSolidarityCop(smmlv * 17, smmlv);
    record("Solidaridad tramo 16-17 SMMLV", sol16.ratePct === 1.2);

    const sub = window.calcColombiaPensionSubsistenceCop(smmlv * 5, smmlv);
    record("Subsistencia 0,5%", sub.subsistenceCop === Math.round(smmlv * 5 * 0.005));

    const ot = window.calcColombiaOvertimeBreakdownCop({
      baseSalaryMonthly: 3_000_000,
      hed: 2,
      hen: 1
    });
    record("Horas extras HED+HEN > 0", ot.totalCop > 0 && ot.lines.length >= 2);

    const incD3 = window.calcColombiaIncapacityEpsDayAdjustmentCop({
      dailySalary: 100_000,
      dayIndexInEpisode: 3,
      monthlySalary: 3_000_000,
      smmlv
    });
    record("Incapacidad día 3 descuento completo", incD3.adjustCop === -100_000);

    const prov = window.calcColombiaCesantiasMonthlyProvisionCop(3_000_000, 30);
    record("Provisión cesantías mensual", prov === Math.round((3_000_000 * 30) / 360));

    const febAlert = window.payrollCesantiasConsignmentAlert("2026-02");
    record("Alerta consignación febrero", febAlert?.level === "warning");

    const liq = window.buildColombiaPayrollLiquidation({
      employee: { baseSalary: 5_000_000, arlRiskLevel: "III" },
      baseSalaryCop: 5_000_000,
      diasCorte: 30,
      applyWithholding: false
    });
    record(
      "Liquidación completa neto < bruto",
      liq.gross > liq.net && liq.employerContributions.total > 0
    );

    return out;
  }, SMMLV);

  await browser.close();
  let failed = 0;
  for (const r of results) {
    const mark = r.ok ? "OK" : "FAIL";
    if (!r.ok) failed += 1;
    console.log(`[${mark}] ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }
  console.log(`\n${results.length - failed}/${results.length} pruebas OK`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
