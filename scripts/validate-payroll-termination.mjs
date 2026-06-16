/**
 * Pruebas liquidación contractual por terminación (Colombia).
 * node scripts/validate-payroll-termination.mjs
 */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.computeColombiaTerminationSettlement === "function");

  const results = await page.evaluate(() => {
    const out = [];
    const record = (name, ok, detail = "") => out.push({ name, ok, detail });

    const emp = { id: "e1", baseSalary: 3_000_000, startDate: "2020-01-15" };
    const days = window.calcColombiaTerminationEmployedDays("2020-01-15", "2026-03-15");
    record("Días laborados > 0", days > 2000, String(days));

    const cesYear = window.calcColombiaTerminationCesantiasDaysYear("2020-01-15", "2026-03-15");
    record("Días cesantías año parcial", cesYear > 0 && cesYear < 360, String(cesYear));

    const vac = window.calcColombiaTerminationVacationDaysAccrued(days, 5);
    record("Vacaciones acumuladas", vac > 0, String(vac));

    const ind = window.calcColombiaIndemnizacionDespidoSinJustaCop(3_000_000, days);
    record("Indemnización despido sin justa", ind.cop > 3_000_000, String(ind.cop));

    const ren = window.computeColombiaTerminationSettlement({
      employee: emp,
      terminationDateYmd: "2026-03-15",
      terminationCause: "renuncia_voluntaria",
      absencesAll: []
    });
    record("Renuncia sin indemnización", ren.indemnizacionDespido === 0 && ren.gross > 0);

    const desp = window.computeColombiaTerminationSettlement({
      employee: emp,
      terminationDateYmd: "2026-03-15",
      terminationCause: "despido_sin_justa",
      avisoPrevioDaysWorked: 0,
      absencesAll: []
    });
    record(
      "Despido sin justa con indemnización y aviso",
      desp.indemnizacionDespido > 0 && desp.indemnizacionAviso > 0 && desp.gross > ren.gross
    );

    const justa = window.computeColombiaTerminationSettlement({
      employee: emp,
      terminationDateYmd: "2026-03-15",
      terminationCause: "despido_justa",
      absencesAll: []
    });
    record("Despido justa sin indemnización", justa.indemnizacionDespido === 0);

    record("Salario pendiente en devengos", ren.salarioPendiente > 0);
    record("Retención/deducciones sobre salario", ren.deductions >= 0);

    const elig = window.terminationCauseEligibility("despido_sin_justa");
    record("Causal despido habilita indemnización", elig.indemnizacionDespido === true);

    const tax = window.classifyColombiaTerminationTaxBases({
      salarioPendiente: 1_000_000,
      primaProporcional: 500_000,
      vacaciones: 300_000
    });
    record("Clasificación tributaria finiquito", tax.baseRetencion > tax.ibcSeguridadSocial);

    return out;
  });

  await browser.close();
  let failed = 0;
  for (const r of results) {
    console.log(`[${r.ok ? "OK" : "FAIL"}] ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
    if (!r.ok) failed += 1;
  }
  console.log(`\n${results.length - failed}/${results.length} pruebas OK`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
