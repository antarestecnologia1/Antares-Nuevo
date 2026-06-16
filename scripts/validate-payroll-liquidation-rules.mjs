/**
 * Reglas prima (jun/dic) e intereses cesantías (ene/feb) — quincenal sin duplicar.
 * node scripts/validate-payroll-liquidation-rules.mjs
 */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

async function ensureServer() {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
    if (res.ok) return;
  } catch {
    /* server started by playwright config or manual */
  }
}

async function main() {
  await ensureServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.payrollValidatePrimaForManualCut === "function");

  const results = await page.evaluate(() => {
    const out = [];
    const record = (name, ok, detail = "") => out.push({ name, ok, detail });

    const empId = "emp-q1";
    const runsQ1Prima = [
      { employeeId: empId, month: "2026-06-Q1", payPrimaServicios: true, primaServiciosCop: 500000 }
    ];
    const runsJanInt = [
      { employeeId: empId, month: "2026-01-Q1", payInteresesCesantias: true, interesesCesantiasCop: 120000 }
    ];

    record(
      "Quincenal jun: Q1 con prima bloquea Q2",
      window.payrollSemesterPrimaAlreadyPaidInMonth(runsQ1Prima, empId, "2026-06", "2026-06-Q2")
    );
    record(
      "Autogen quincenal: prima en Q2 no en Q1",
      window.payrollAutogenShouldIncludePrima({
        calendarMonthYm: "2026-06",
        periodKey: "2026-06-Q2",
        payFrequency: "quincenal",
        periodEndIsMonthLastDay: true,
        primaAlreadyPaidInSemesterMonth: false
      }) &&
        !window.payrollAutogenShouldIncludePrima({
          calendarMonthYm: "2026-06",
          periodKey: "2026-06-Q1",
          payFrequency: "quincenal",
          periodEndIsMonthLastDay: false,
          primaAlreadyPaidInSemesterMonth: false
        })
    );
    record(
      "Autogen Q2 sin prima si Q1 ya pagó",
      !window.payrollAutogenShouldIncludePrima({
        calendarMonthYm: "2026-06",
        periodKey: "2026-06-Q2",
        payFrequency: "quincenal",
        periodEndIsMonthLastDay: true,
        primaAlreadyPaidInSemesterMonth: true
      })
    );
    record(
      "Manual Q2 rechazado si Q1 tiene prima",
      !window.payrollValidatePrimaForManualCut({
        employeeId: empId,
        calendarMonthYm: "2026-06",
        periodKey: "2026-06-Q2",
        payFrequency: "quincenal",
        existingRuns: runsQ1Prima
      }).ok
    );
    record(
      "Manual Q1 permitido",
      window.payrollValidatePrimaForManualCut({
        employeeId: empId,
        calendarMonthYm: "2026-06",
        periodKey: "2026-06-Q1",
        payFrequency: "quincenal",
        existingRuns: []
      }).ok
    );
    record(
      "Ene intereses bloquea feb Q2",
      window.payrollCesantiasInterestAlreadyPaidInYear(runsJanInt, empId, "2026-02", "2026-02-Q2")
    );
    record(
      "Autogen intereses omitir si año pagado",
      !window.payrollAutogenShouldIncludeCesantiasInterest({
        calendarMonthYm: "2026-02",
        cesantiasBaseCop: 1000000,
        cesantiasInterestAlreadyPaidInYear: true
      })
    );
    record(
      "Manual feb Q2 rechazado tras ene Q1",
      !window.payrollValidateCesantiasInterestForManualCut({
        employeeId: empId,
        calendarMonthYm: "2026-02",
        periodKey: "2026-02-Q2",
        payFrequency: "quincenal",
        existingRuns: runsJanInt
      }).ok
    );
    return out;
  });

  for (const r of results) {
    console.log(`[${r.ok ? "PASS" : "FAIL"}] ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} OK ===`);
  await browser.close();
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
