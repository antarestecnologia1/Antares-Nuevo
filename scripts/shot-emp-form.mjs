/* Capturas del formulario Crear empleado (claro/oscuro, varios pasos). */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
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
  antares_companies_v2: [
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
  antares_positions_v2: [
    {
      id: "pos-conductor",
      name: "Conductor",
      workerRole: "conductor",
      baseSalary: 2500000,
      contractTypeDefault: "Termino fijo",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel IV",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  antares_session_v2: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now(),
    profileSnapshot: { id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin" }
  }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
await context.addInitScript((payload) => {
  const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => {
    localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
  });
}, seedStore);

const page = await context.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 200)));
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.waitForTimeout(700);

await page.evaluate(() => {
  window.state.payrollUi = { ...(window.state.payrollUi || {}), workspace: "operate", operateSection: "employee" };
  window.state.createPanels = { ...(window.state.createPanels || {}), "create-employee": true };
  window.state.currentView = "payroll";
  window.renderPortalView();
});
await page.waitForTimeout(800);

const showStep = (idx) =>
  page.evaluate((i) => {
    const form = document.querySelector("#form-employee");
    form.querySelectorAll(".hr-form-step").forEach((s) => {
      const on = s.dataset.stepIndex === String(i);
      s.classList.toggle("hidden", !on);
      s.classList.toggle("is-active", on);
    });
    form.querySelectorAll(".hr-form-wizard-dot").forEach((d, di) => {
      d.classList.toggle("is-active", di === i);
      d.classList.toggle("is-done", di < i);
    });
    const fill = form.querySelector("[data-hr-wizard-progress-fill]");
    if (fill) fill.style.width = `${((i + 1) / 6) * 100}%`;
    const lbl = form.querySelector("[data-hr-wizard-progress]");
    if (lbl) lbl.textContent = `Paso ${i + 1} de 6`;
    form.closest("[data-create-panel]")?.scrollIntoView({ block: "start" });
    window.scrollBy(0, -10);
  }, idx);

const wizardTop = page.locator("#form-employee .hr-form-wizard-toolbar");

await showStep(0);
await page.waitForTimeout(350);
await wizardTop.scrollIntoViewIfNeeded();
await page.screenshot({ path: "test-results/emp360-step1-light.png" });

await showStep(2);
await page.evaluate(() => {
  const form = document.querySelector("#form-employee");
  const pos = form.querySelector("#emp-position-select");
  if (pos && pos.options.length > 1) {
    pos.value = pos.options[1].value;
    pos.dispatchEvent(new Event("change", { bubbles: true }));
  }
});
await page.waitForTimeout(450);
await wizardTop.scrollIntoViewIfNeeded();
await page.screenshot({ path: "test-results/emp360-step3-light.png" });

await page.evaluate(() => {
  document.body.setAttribute("data-theme", "dark");
});
await page.waitForTimeout(350);
await wizardTop.scrollIntoViewIfNeeded();
await page.screenshot({ path: "test-results/emp360-step3-dark.png" });

await showStep(0);
await page.waitForTimeout(300);
await wizardTop.scrollIntoViewIfNeeded();
await page.screenshot({ path: "test-results/emp360-step1-dark.png" });

console.log("ok");
await browser.close();
