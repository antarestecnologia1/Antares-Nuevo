/**
 * Detecta solapamiento significativo de campos de formulario en viewport móvil (390×844).
 */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const VIEWPORT = { width: 390, height: 844 };

const MODULES = [
  { id: "dashboard", label: "1. Dashboard" },
  { id: "requests", label: "2. Mis solicitudes" },
  { id: "transport-trips", label: "3. Viajes" },
  { id: "transport-vehicles", label: "4. Camiones" },
  { id: "transport-drivers", label: "5. Conductores" },
  { id: "transport-calendar", label: "6. Calendario" },
  { id: "history", label: "7. Historial" },
  { id: "reports", label: "8. Reportería" },
  { id: "payroll", label: "9. Gestión humana" },
  { id: "hiring", label: "10. Contratación" },
  { id: "labor-compliance", label: "11. Cumplimiento laboral y SST" },
  { id: "contact-leads", label: "12. Contacto web (B2B)" },
  { id: "admin-users", label: "13. Usuarios y permisos" },
  { id: "authorizations", label: "14. Autorizaciones" },
  { id: "profile", label: "15. Mi perfil" },
  { id: "notifications", label: "18. Notificaciones" }
];

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

function overlapRatio(a, b) {
  const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const area = x * y;
  if (!area) return 0;
  const minArea = Math.min(a.width * a.height, b.width * b.height);
  return minArea > 0 ? area / minArea : 0;
}

async function detectFormOverlaps(page) {
  return page.evaluate(() => {
    const root = document.querySelector("#view-root");
    if (!root) return { overlaps: [], count: 0 };

    const selector =
      "label:not([hidden]):not(.hidden), input:not([type='hidden']):not([hidden]), select:not([hidden]), textarea:not([hidden]), .field-label, .form-section legend";
    const nodes = [...root.querySelectorAll(selector)].filter((el) => {
      const st = getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden") return false;
      if (el.matches(".profile-avatar-file-input, .sr-only, [aria-hidden='true']")) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return false;
      if (Number(st.opacity) === 0 && !el.matches("input, select, textarea")) return false;
      return true;
    });

    const overlaps = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const x = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left));
        const y = Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
        const area = x * y;
        if (!area) continue;
        const minArea = Math.min(ra.width * ra.height, rb.width * rb.height);
        const ratio = minArea > 0 ? area / minArea : 0;
        if (ratio < 0.2) continue;
        const tag = (el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${String(el.className || "").split(/\s+/).slice(0, 2).join(".")}`;
        overlaps.push({ ratio: Math.round(ratio * 100), a: tag(a), b: tag(b) });
      }
    }
    return { overlaps: overlaps.slice(0, 8), count: overlaps.length };
  });
}

async function expandPanels(page) {
  await page.evaluate(() => {
    const tabs = [
      ...document.querySelectorAll(
        '#view-root [data-hr-workspace-tab], #view-root .hr-workspace-tab[data-panel], #view-root .auth-tab-btn'
      )
    ];
    tabs.forEach((tab) => tab.click());
    document.querySelectorAll('#view-root [data-action="toggle-create-panel"][aria-expanded="false"]').forEach((btn, i) => {
      if (i < 8) btn.click();
    });
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message || err}`));

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate((store) => {
    for (const [k, v] of Object.entries(store)) {
      localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
    }
  }, seedStore);
  await page.reload({ waitUntil: "networkidle", timeout: 45000 });

  const results = [];

  for (const mod of MODULES) {
    consoleErrors.length = 0;
    const navigated = await page.evaluate((viewId) => {
      if (typeof window.setView !== "function") return false;
      window.setView(viewId);
      return true;
    }, mod.id);
    if (!navigated) {
      results.push({ ...mod, status: "FAIL", issues: ["setView no disponible"] });
      continue;
    }
    await page.waitForTimeout(900);
    await expandPanels(page);
    await page.waitForTimeout(400);

    const { overlaps, count } = await detectFormOverlaps(page);
    const issues = [];
    if (count > 0) issues.push(`${count} solapamiento(s) de campos (≥20%)`);
    if (overlaps.length) issues.push(...overlaps.map((o) => `${o.ratio}%: ${o.a} ↔ ${o.b}`));
    if (consoleErrors.length) issues.push(...consoleErrors.slice(0, 2).map((e) => `console: ${e}`));

    results.push({
      ...mod,
      status: issues.length ? "FAIL" : "OK",
      overlapCount: count,
      issues
    });
  }

  await browser.close();
  const failed = results.filter((r) => r.status === "FAIL");
  console.log(JSON.stringify({ viewport: VIEWPORT, total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
