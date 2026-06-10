import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  positions: "antares_positions_v2",
  session: "antares_session_v2"
};

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  [KEYS.users]: [
    {
      id: "admin-1",
      name: "Admin QA",
      email: "admin.qa@antares.test",
      role: "admin",
      accountStatus: "aprobado",
      companyId: "co-antares",
      permissions: []
    }
  ],
  [KEYS.companies]: [
    {
      id: "co-antares",
      name: "Transportes Antares",
      taxId: "900000001-0",
      companyKind: "propia",
      phone: "6011111111",
      email: "operaciones@antares.test",
      contactName: "Operaciones",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Sede principal"
    }
  ],
  [KEYS.positions]: [
    {
      id: "pos-analista",
      name: "Analista de operaciones",
      workerRole: "empleado",
      baseSalary: 2200000,
      contractTypeDefault: "Termino indefinido",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel I",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  [KEYS.session]: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now()
  }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript((payload) => {
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => {
    const raw = key === "antares_portal_data_ver" || key === "antares_users_storage_ver";
    localStorage.setItem(key, raw ? String(value) : JSON.stringify(value));
  });
}, seedStore);

const page = await context.newPage();
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.evaluate(() => {
  window.location.hash = "#portal/payroll";
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});
await page.waitForTimeout(900);

const before = await page.evaluate(() => {
  const form = document.getElementById("form-employee");
  const wizard = form?.querySelector("[data-hr-wizard]");
  const steps = wizard ? [...wizard.querySelectorAll(".hr-form-step")] : [];
  return {
    form: Boolean(form),
    steps: steps.length,
    bound: form?.dataset?.hrWizardBound === "1",
    progress: document.querySelector("[data-hr-wizard-progress]")?.textContent?.trim() || ""
  };
});
console.log("before:", before);

if (!before.form || before.steps < 2) {
  console.error("FAIL: form or steps missing");
  await browser.close();
  process.exit(1);
}
if (!before.bound) {
  console.error("FAIL: wizard not bound");
  await browser.close();
  process.exit(1);
}

await page.fill("#form-employee input[name='name']", "Test QA Wizard");
await page.fill("#form-employee input[name='idDoc']", "9998887776");
await page.selectOption("#form-employee select[name='bloodType']", { index: 1 });

await page.click("#form-employee [data-hr-wizard-next]");
await page.waitForTimeout(500);

const afterNext = await page.evaluate(() => ({
  stepIndex: document.querySelector("#form-employee .hr-form-step.is-active")?.dataset?.stepIndex,
  progress: document.querySelector("[data-hr-wizard-progress]")?.textContent?.trim() || ""
}));
console.log("after next:", afterNext);

await page.click("#form-employee [data-hr-wizard-dot='0']");
await page.waitForTimeout(300);

const afterDot = await page.evaluate(() => ({
  stepIndex: document.querySelector("#form-employee .hr-form-step.is-active")?.dataset?.stepIndex
}));
console.log("after dot 0:", afterDot);

const ok = afterNext.stepIndex === "1" && afterDot.stepIndex === "0";
console.log(ok ? "OK: wizard buttons work" : "FAIL: wizard navigation broken");
await browser.close();
process.exit(ok ? 0 : 1);
