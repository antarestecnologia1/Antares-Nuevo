/* Reproduce: crear empleado con cargo CONDUCTOR y revisar el paso «Extras». */
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
      name: "CONDUCTOR",
      workerRole: "empleado",
      baseSalary: 2500000,
      contractTypeDefault: "Termino fijo",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel IV",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "pos-analista",
      name: "Analista",
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

const report = await page.evaluate(() => {
  const form = document.querySelector("#form-employee");
  if (!form) return "no-form";
  const pos = form.querySelector("#emp-position-select");
  const condOpt = [...pos.options].find((o) => /conductor/i.test(o.textContent));
  pos.value = condOpt ? condOpt.value : pos.options[1]?.value;
  pos.dispatchEvent(new Event("change", { bubbles: true }));

  // Mostrar paso 6 (Extras) directamente
  form.querySelectorAll(".hr-form-step").forEach((s) => {
    const on = s.dataset.stepIndex === "5";
    s.classList.toggle("hidden", !on);
    s.classList.toggle("is-active", on);
  });

  const block = form.querySelector("#hr-conductor-fields");
  const cs = block ? getComputedStyle(block) : null;
  const fields = block
    ? [...block.querySelectorAll("input, select, textarea")].map((el) => {
        const elCs = getComputedStyle(el);
        return `${el.name || el.id}: disabled=${el.disabled} readOnly=${el.readOnly ?? "-"} display=${elCs.display} visible=${Boolean(el.offsetParent)} required=${el.required}`;
      })
    : [];
  const occLaboral = form.querySelector(".hr-form-step[data-step-index='2'] [name='occupationalExamDate']");
  return {
    positionValue: pos.value,
    blockExists: Boolean(block),
    blockClasses: block?.className || "",
    blockHiddenAttr: block?.hasAttribute("hidden"),
    blockDisplay: cs?.display,
    blockVisible: Boolean(block?.offsetParent),
    occupationalExamInLaboralStep: Boolean(occLaboral),
    fields
  };
});
console.log(JSON.stringify(report, null, 2));

const step = page.locator("#form-employee .hr-form-step[data-step-index='5']");
await step.scrollIntoViewIfNeeded();
await page.screenshot({ path: "test-results/emp-conductor-step6.png" });
await browser.close();
