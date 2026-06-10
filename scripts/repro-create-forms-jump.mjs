/**
 * Verifica que al hacer clic entre campos de los formularios de creación del portal
 * NO se mueva la pantalla (scroll) ni cambie la altura del formulario (salto de layout).
 *
 * Recorre cada módulo con formularios de alta, abre el panel correspondiente y hace
 * clic campo por campo midiendo scrollY / altura / posición del formulario.
 *
 * Uso: npx http-server -p 4173 -a 127.0.0.1 & node scripts/repro-create-forms-jump.mjs
 */
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

/**
 * Cada target: módulo (etiqueta), vista del portal, parche de estado UI,
 * paneles de creación a expandir y selector del formulario a recorrer.
 */
const TARGETS = [
  { module: "2. Mis solicitudes", view: "requests", patch: { requestsUi: { workspace: "operate" } }, panels: {}, form: "#form-request" },
  {
    module: "3. Viajes (asignar viaje)",
    view: "transport-trips",
    patch: { transportTripsUi: { workspace: "operate", section: "trips" } },
    panels: { "create-trip": true },
    form: "#form-create-trip"
  },
  {
    module: "3. Viajes (trayecto/tarifa)",
    view: "transport-trips",
    patch: { transportTripsUi: { workspace: "operate", section: "routes" } },
    panels: { "create-route-rate": true },
    form: "#form-route-rate"
  },
  {
    module: "4. Camiones (registrar vehículo)",
    view: "transport-vehicles",
    patch: { vehiclesUi: { workspace: "create" } },
    panels: { "create-vehicle": true },
    form: "#form-vehicle"
  },
  {
    module: "4. Camiones (combustible)",
    view: "transport-vehicles",
    patch: { vehiclesUi: { workspace: "fuel" } },
    panels: { "create-fuel-log": true },
    form: "[data-create-panel='create-fuel-log'] form"
  },
  {
    module: "4. Camiones (taller)",
    view: "transport-vehicles",
    patch: { vehiclesUi: { workspace: "technical" } },
    panels: { "create-technical-log": true },
    form: "[data-create-panel='create-technical-log'] form"
  },
  {
    module: "9. Gestión humana (crear empleado)",
    view: "payroll",
    patch: { payrollUi: { workspace: "operate", operateSection: "employee" } },
    panels: { "create-employee": true },
    form: "#form-employee"
  },
  {
    module: "9. Gestión humana (nómina)",
    view: "payroll",
    patch: { payrollUi: { workspace: "operate", operateSection: "payroll" } },
    panels: { "create-payroll": true },
    form: "#form-payroll"
  },
  {
    module: "9. Gestión humana (liquidar viajes conductor)",
    view: "payroll",
    patch: { payrollUi: { workspace: "operate", operateSection: "driverPay" } },
    panels: { "create-driver-trip-payment": true },
    form: "#form-driver-trip-payment"
  },
  {
    module: "9. Gestión humana (liquidación terminación)",
    view: "payroll",
    patch: { payrollUi: { workspace: "operate", operateSection: "settlement" } },
    panels: { "create-payroll-settlement": true },
    form: "#form-payroll-settlement"
  },
  {
    module: "9. Gestión humana (ausencias)",
    view: "payroll",
    patch: { payrollUi: { workspace: "operate", operateSection: "absence" } },
    panels: { "create-hr-absence": true },
    form: "#form-hr-absence"
  },
  {
    module: "10. Contratación (cargo)",
    view: "hiring",
    patch: { hiringUi: { workspace: "operate", operateSection: "position" } },
    panels: { "create-position": true },
    form: "#form-position"
  },
  {
    module: "10. Contratación (vacante)",
    view: "hiring",
    patch: { hiringUi: { workspace: "operate", operateSection: "vacancy" } },
    panels: { "create-vacancy": true },
    form: "#form-vacancy"
  },
  {
    module: "10. Contratación (candidato)",
    view: "hiring",
    patch: { hiringUi: { workspace: "operate", operateSection: "candidate" } },
    panels: { "create-candidate": true },
    form: "#form-candidate"
  },
  {
    module: "10. Contratación (entrevista)",
    view: "hiring",
    patch: { hiringUi: { workspace: "operate", operateSection: "interview" } },
    panels: { "create-interview": true },
    form: "#form-interview"
  },
  {
    module: "10. Contratación (contrato Word)",
    view: "hiring",
    patch: { hiringUi: { workspace: "operate", operateSection: "contract" } },
    panels: { "create-contract": true },
    form: "#form-contract"
  },
  {
    module: "11. Cumplimiento laboral y SST",
    view: "labor-compliance",
    patch: {},
    panels: { "create-sst-control": true },
    form: "#form-sst-compliance"
  },
  {
    module: "13. Usuarios y permisos (crear usuario)",
    view: "admin-users",
    patch: { adminUsersUi: { panel: "create-user", editUserId: "", editCompanyId: "", section: "actions", createUserMinimized: false } },
    panels: {},
    form: "#form-admin-user-create"
  },
  {
    module: "13. Usuarios y permisos (crear empresa)",
    view: "admin-users",
    patch: { adminUsersUi: { panel: "create-company", editUserId: "", editCompanyId: "", section: "actions", createCompanyMinimized: false } },
    panels: {},
    form: "#form-admin-company-create"
  },
  { module: "15. Mi perfil", view: "profile", patch: {}, panels: {}, form: "#form-profile" }
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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
await page.waitForTimeout(800);

let totalMoves = 0;
let totalClicks = 0;

for (const target of TARGETS) {
  const opened = await page.evaluate(({ view, patch, panels }) => {
    try {
      Object.entries(patch).forEach(([k, v]) => {
        window.state[k] = { ...(window.state[k] || {}), ...v };
      });
      window.state.createPanels = { ...(window.state.createPanels || {}), ...panels };
      window.state.currentView = view;
      window.renderPortalView();
      return true;
    } catch (e) {
      return String(e?.message || e);
    }
  }, target);
  await page.waitForTimeout(600);

  const formInfo = await page.evaluate((sel) => {
    const form = document.querySelector(sel);
    if (!form) return { found: false };
    const scope = form.querySelector(".hr-form-step.is-active") || form;
    const els = [...scope.querySelectorAll("input, select, textarea")].filter(
      (el) => el.offsetParent && el.type !== "file" && el.type !== "hidden" && !el.disabled && el.tabIndex !== -1
    );
    els.forEach((el, i) => el.setAttribute("data-repro-idx", String(i)));
    return { found: true, visible: Boolean(form.offsetParent), count: els.length };
  }, target.form);

  if (!formInfo.found || !formInfo.visible || !formInfo.count) {
    console.log(`\n[${target.module}] ${target.form} -> NO DISPONIBLE (found=${formInfo.found} visible=${formInfo.visible} fields=${formInfo.count ?? 0}, opened=${opened})`);
    continue;
  }

  const snap = () =>
    page.evaluate((sel) => {
      const form = document.querySelector(sel);
      const rect = form.getBoundingClientRect();
      const scroller = document.scrollingElement;
      return {
        scrollY: Math.round(scroller.scrollTop),
        formTopDoc: Math.round(rect.top + scroller.scrollTop),
        formHeight: Math.round(rect.height)
      };
    }, target.form);

  // Antes de cada clic se acerca el campo al viewport (como haría el usuario con la rueda)
  // y se toma la medida base; cualquier scroll/cambio de altura DESPUÉS del clic es de la app.
  let moves = 0;
  for (let i = 0; i < formInfo.count; i++) {
    const sel = `${target.form} [data-repro-idx="${i}"]`;
    const ready = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el || !el.offsetParent) return false;
      el.scrollIntoView({ block: "center", behavior: "instant" });
      return true;
    }, sel);
    if (!ready) continue;
    await page.waitForTimeout(160);
    const prev = await snap();
    try {
      await page.click(sel, { timeout: 2500 });
    } catch (_e) {
      continue;
    }
    await page.waitForTimeout(380);
    const cur = await snap();
    totalClicks += 1;
    const dScroll = cur.scrollY - prev.scrollY;
    const dHeight = cur.formHeight - prev.formHeight;
    const dTop = cur.formTopDoc - prev.formTopDoc;
    if (Math.abs(dScroll) > 2 || Math.abs(dHeight) > 2 || Math.abs(dTop) > 2) {
      moves += 1;
      totalMoves += 1;
      console.log(`  campo ${i}: dScroll=${dScroll} dHeight=${dHeight} dTop=${dTop}  <-- SE MUEVE`);
    }
  }
  console.log(`[${target.module}] ${target.form}: ${formInfo.count} campos, saltos=${moves} ${moves ? "✗" : "✓"}`);
}

console.log(`\nResumen: ${totalClicks} transiciones de campo medidas, ${totalMoves} con movimiento de pantalla.`);
await browser.close();
process.exit(totalMoves ? 1 : 0);
