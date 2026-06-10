/* Mide los elementos internos de los bloques de contrato en Crear empleado. */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const seedStore = JSON.parse(process.env.SEED || "null") || {
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
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript((payload) => {
  const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => {
    localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
  });
}, seedStore);

const page = await context.newPage();
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

await page.evaluate(() => {
  const form = document.querySelector("#form-employee");
  form.querySelectorAll(".hr-form-step").forEach((s) => {
    const on = s.dataset.stepIndex === "2";
    s.classList.toggle("hidden", !on);
    s.classList.toggle("is-active", on);
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
});
await page.waitForTimeout(700);

const detail = await page.evaluate(() => {
  const dump = (el, name) => {
    if (!el) return `${name}: null`;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return `${name}: top=${Math.round(r.top)} bottom=${Math.round(r.bottom)} h=${Math.round(r.height)} display=${cs.display} pos=${cs.position} mt=${cs.marginTop} mb=${cs.marginBottom} overflow=${cs.overflow} minH=${cs.minHeight} gridRow=${cs.gridRow}`;
  };
  const out = [];
  for (const wid of ["emp-contract-vigente-start-wrap", "emp-contract-end-wrap"]) {
    const wrap = document.getElementById(wid);
    out.push(dump(wrap, `WRAP ${wid}`));
    if (wrap) {
      [...wrap.children].forEach((c, i) => out.push("  " + dump(c, `child${i} <${c.tagName.toLowerCase()} class=${String(c.className).slice(0, 60)}>`)));
      const lbl = wrap.querySelector("label");
      if (lbl) [...lbl.children].forEach((c, i) => out.push("    " + dump(c, `labelChild${i} <${c.tagName.toLowerCase()} class=${String(c.className).slice(0, 40)}>`)));
    }
  }
  const grid = document.getElementById("emp-contract-end-wrap")?.parentElement;
  if (grid) {
    const cs = getComputedStyle(grid);
    out.push(`GRID: display=${cs.display} rows=${cs.gridTemplateRows.split(" ").length} autoRows=${cs.gridAutoRows} gap=${cs.gap} alignItems=${cs.alignItems}`);
  }
  return out.join("\n");
});
console.log(detail);
await browser.close();
