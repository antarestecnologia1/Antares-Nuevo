/* Reproduce visualmente el paso «Datos laborales» de Crear empleado con contrato a término fijo. */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  positions: "antares_positions_v2",
  session: "antares_session_v2"
};

const now = new Date();
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
      createdAt: now.toISOString()
    }
  ],
  [KEYS.session]: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now(),
    profileSnapshot: { id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin" }
  }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
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

// Mostrar directamente el paso «Datos laborales» y elegir cargo + término fijo
const info = await page.evaluate(() => {
  const form = document.querySelector("#form-employee");
  if (!form) return "no-form";
  form.querySelectorAll(".hr-form-step").forEach((s) => {
    const on = s.dataset.stepIndex === "2";
    s.classList.toggle("hidden", !on);
    s.classList.toggle("is-active", on);
    s.setAttribute("aria-hidden", on ? "false" : "true");
  });
  const pos = form.querySelector("#emp-position-select");
  if (pos && pos.options.length > 1) {
    pos.value = pos.options[1].value;
    pos.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const ct = form.querySelector("#emp-contract-type");
  const fixedOpt = [...(ct?.options || [])].find((o) => /fijo/i.test(o.value || o.textContent));
  if (ct && fixedOpt) {
    ct.value = fixedOpt.value;
    ct.dispatchEvent(new Event("change", { bubbles: true }));
  }
  return { contract: ct?.value || "?", position: pos?.value || "?" };
});
console.log("estado:", JSON.stringify(info));
await page.waitForTimeout(700);

const layout = await page.evaluate(() => {
  const ids = [
    "emp-contract-duration-block",
    "emp-contract-vigente-start-wrap",
    "emp-contract-end-wrap",
    "emp-contract-renewal-hint"
  ];
  const out = {};
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      out[id] = null;
      continue;
    }
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out[id] = {
      hidden: el.classList.contains("hidden") || el.hasAttribute("hidden"),
      display: cs.display,
      position: cs.position,
      rect: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }
    };
  }
  // Vecinos de la grilla para detectar solapamiento
  const grid = document.getElementById("emp-contract-end-wrap")?.parentElement;
  out.gridChildren = grid
    ? [...grid.children].map((c) => {
        const r = c.getBoundingClientRect();
        return `${c.id || c.tagName.toLowerCase()}.${String(c.className).split(" ").slice(0, 2).join(".")} -> top=${Math.round(r.top)} h=${Math.round(r.height)}`;
      })
    : [];
  return out;
});
console.log(JSON.stringify(layout, null, 2));

const step = page.locator("#form-employee .hr-form-step[data-step-index='2']");
await step.scrollIntoViewIfNeeded();
await page.screenshot({ path: "test-results/emp-contract-overlay.png", fullPage: false });
const wrap = page.locator("#emp-contract-end-wrap");
if (await wrap.isVisible()) {
  await wrap.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/emp-contract-overlay-end.png" });
}
await browser.close();
