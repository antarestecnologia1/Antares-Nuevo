/**
 * Auditoría móvil: landing pública, modal auth y portal en 320px.
 */
import { chromium } from "playwright";

const BASE = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  antares_users_v2: [
    {
      id: "admin-1",
      name: "Admin QA",
      email: "admin.qa@antares.test",
      role: "admin",
      accountStatus: "aprobado",
      companyId: "co-antares",
      company: "Transportes Antares",
      documentType: "CC",
      taxId: "1010101010",
      phone: "3001112233",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Cra 1 # 1-1",
      permissions: []
    }
  ],
  antares_companies_v2: [{ id: "co-antares", name: "Transportes Antares", taxId: "900000001-0", companyKind: "propia", active: true }],
  antares_session_v2: { userId: "admin-1", token: "qa-token", expiresAt: new Date(Date.now() + 86400000).toISOString() },
  antares_counters_v2: {},
  antares_requests_v2: [],
  antares_vehicles_v2: [],
  antares_drivers_v2: [],
  antares_notifications_v2: [],
  antares_payroll_employees_v2: [],
  antares_payroll_runs_v2: [],
  antares_positions_v2: [{ id: "pos-conductor", name: "CONDUCTOR", baseSalary: 2500000, active: true, workerRole: "empleado" }],
  antares_vacancies_v2: [],
  antares_candidates_v2: [],
  antares_interviews_v2: [],
  antares_contracts_v2: [],
  antares_hr_absences_v2: [],
  antares_sst_compliance_v2: [],
  antares_approvals_v2: [],
  antares_portal_contacts_v1: []
};

async function openAuth(page) {
  await page.locator("#open-auth, #open-auth-hero").first().click();
  await page.waitForFunction(
    () => {
      const modal = document.getElementById("auth-modal");
      return modal && !modal.classList.contains("hidden");
    },
    null,
    { timeout: 5000 }
  ).catch(() => {});
}

const results = [];
const browser = await chromium.launch({ headless: true });

for (const vp of [
  { width: 390, height: 844, name: "390x844" },
  { width: 320, height: 568, name: "320x568" }
]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(600);

  const landing = await page.evaluate(() => {
    const vw = window.innerWidth;
    const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const issues = [];
    if (sw > vw + 8) issues.push(`overflow horizontal (${sw}px > ${vw}px)`);
    return { issues, vw, sw };
  });
  results.push({ scope: `${vp.name} landing`, status: landing.issues.length ? "FAIL" : "OK", ...landing });

  await openAuth(page);
  await page.waitForTimeout(700);
  const auth = await page.evaluate(() => {
    const issues = [];
    const modal = document.getElementById("auth-modal");
    const card = modal?.querySelector(".modal-card-auth");
    const vw = window.innerWidth;
    const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if (sw > vw + 8) issues.push(`overflow horizontal (${sw}px > ${vw}px)`);
    if (!modal || modal.classList.contains("hidden")) issues.push("auth modal no visible");
    if (card) {
      const r = card.getBoundingClientRect();
      if (r.right > vw + 2) issues.push("modal desborda derecha");
      if (r.left < -2) issues.push("modal desborda izquierda");
    }
    return { issues, vw, sw };
  });
  results.push({ scope: `${vp.name} auth-login`, status: auth.issues.length ? "FAIL" : "OK", ...auth });

  await ctx.close();
}

const ctx2 = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
const page2 = await ctx2.newPage();
await page2.goto(BASE, { waitUntil: "networkidle" });
await page2.evaluate((store) => {
  for (const [k, v] of Object.entries(store)) {
    localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  }
}, seedStore);
await page2.reload({ waitUntil: "networkidle" });
await page2.locator("#portal-app").waitFor({ state: "visible", timeout: 30000 });

for (const view of ["dashboard", "requests", "payroll", "transport-vehicles", "hiring"]) {
  await page2.evaluate(async (viewId) => {
    const mod = await import("/modules/core/router.js");
    mod.setView(viewId);
  }, view);
  await page2.waitForTimeout(700);
  const check = await page2.evaluate(() => {
    const vw = window.innerWidth;
    const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const issues = [];
    if (sw > vw + 8) issues.push(`overflow horizontal (${sw}px > ${vw}px)`);
    const main = document.querySelector(".portal-main");
    if (main && main.getBoundingClientRect().top >= window.innerHeight - 40) {
      issues.push("portal-main fuera de pantalla");
    }
    const swTabs = document.querySelector(".hr-workspace-tabs--switch");
    if (swTabs && getComputedStyle(swTabs).flexDirection === "column") {
      issues.push("switch en columna");
    }
    const tab = swTabs?.querySelector(".hr-workspace-tab--switch");
    if (tab && parseFloat(getComputedStyle(tab).borderRadius) > 40) {
      issues.push("switch ovalado");
    }
    return { issues, vw, sw };
  });
  results.push({ scope: `320 portal ${view}`, status: check.issues.length ? "FAIL" : "OK", ...check });
}

await browser.close();

console.log(JSON.stringify({ results }, null, 2));
const failed = results.filter((r) => r.status === "FAIL");
process.exit(failed.length ? 1 : 0);
