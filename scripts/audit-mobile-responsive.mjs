/**
 * Auditoría responsive móvil del portal (390×844).
 * - Contenido visible en viewport (no pantalla en blanco)
 * - Sin overflow horizontal
 * - Conmutador Registrar|Consultar compacto
 * - Solapamientos graves de formularios
 *
 * Uso: node scripts/audit-mobile-responsive.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "assets", "mobile-audit");
const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const VIEWPORT = { width: 390, height: 844 };

const MODULES = [
  { id: "dashboard", view: "dashboard", label: "Dashboard" },
  { id: "requests", view: "requests", label: "Mis solicitudes" },
  { id: "transport-trips", view: "transport-trips", label: "Viajes" },
  { id: "transport-vehicles", view: "transport-vehicles", label: "Camiones" },
  { id: "transport-drivers", view: "transport-drivers", label: "Conductores" },
  { id: "transport-calendar", view: "transport-calendar", label: "Calendario" },
  { id: "history", view: "history", label: "Historial" },
  { id: "reports", view: "reports", label: "Reportería" },
  { id: "payroll", view: "payroll", label: "Gestión humana" },
  { id: "hiring", view: "hiring", label: "Contratación" },
  { id: "labor-compliance", view: "labor-compliance", label: "Cumplimiento SST" },
  { id: "contact-leads", view: "contact-leads", label: "Contacto B2B" },
  { id: "admin-users", view: "admin-users", label: "Usuarios" },
  { id: "authorizations", view: "authorizations", label: "Autorizaciones" },
  { id: "profile", view: "profile", label: "Mi perfil" },
  { id: "notifications", view: "notifications", label: "Notificaciones" }
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
  antares_session_v2: {
    userId: "admin-1",
    token: "qa-token",
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  },
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

const LAYOUT_CHECK = () => {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const issues = [];

  const portalMain = document.querySelector(".portal-main");
  const viewRoot = document.getElementById("view-root");
  const portalApp = document.getElementById("portal-app");

  if (!portalApp || portalApp.classList.contains("hidden")) {
    issues.push("portal-app oculto");
  }
  if (!viewRoot || viewRoot.innerHTML.trim().length < 80) {
    issues.push("view-root vacío o casi vacío");
  }

  if (portalMain) {
    const mr = portalMain.getBoundingClientRect();
    if (mr.top >= vh - 40) issues.push(`portal-main fuera de pantalla (top=${Math.round(mr.top)})`);
    if (mr.height < 120) issues.push(`portal-main muy bajo (h=${Math.round(mr.height)}px)`);
  }

  if (viewRoot) {
    const vr = viewRoot.getBoundingClientRect();
    const visible = vr.top < vh && vr.bottom > 0 && vr.height > 40;
    if (!visible) issues.push(`contenido fuera de viewport (top=${Math.round(vr.top)})`);
  }

  const scrollW = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
    portalMain?.scrollWidth || 0
  );
  if (scrollW > vw + 8) {
    issues.push(`overflow horizontal (${scrollW}px > ${vw}px)`);
  }

  const switchTabs = document.querySelector(".hr-workspace-tabs--switch");
  if (switchTabs) {
    const cs = getComputedStyle(switchTabs);
    if (cs.flexDirection === "column") {
      issues.push("Registrar|Consultar apilados en columna");
    }
    const firstTab = switchTabs.querySelector(".hr-workspace-tab--switch");
    if (firstTab) {
      const br = parseFloat(getComputedStyle(firstTab).borderRadius);
      if (br > 40) issues.push(`botones switch muy ovalados (radius=${Math.round(br)}px)`);
    }
  }

  const sidebar = document.getElementById("portal-sidebar");
  if (sidebar && getComputedStyle(sidebar).position === "relative") {
    const sr = sidebar.getBoundingClientRect();
    if (sr.height > vh * 0.85 && sr.width > vw * 0.5) {
      issues.push("sidebar ocupa flujo del grid (position:relative)");
    }
  }

  return { issues, viewRootLen: viewRoot?.innerHTML?.length || 0 };
};

const OVERLAP_CHECK = () => {
  const root = document.querySelector("#view-root");
  if (!root) return { count: 0, samples: [] };

  const selector =
    "label:not([hidden]):not(.hidden), input:not([type='hidden']):not([hidden]), select:not([hidden]), textarea:not([hidden]), .field-label";
  const nodes = [...root.querySelectorAll(selector)].filter((el) => {
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width >= 8 && r.height >= 8;
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
      if (ratio < 0.25) continue;
      overlaps.push({ ratio: Math.round(ratio * 100) });
    }
  }
  return { count: overlaps.length, samples: overlaps.slice(0, 3) };
};

async function expandPanels(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#view-root [data-action="hr-workspace-tab"]').forEach((btn, i) => {
      if (i < 2) btn.click();
    });
    document.querySelectorAll('#view-root [data-action="toggle-create-panel"][aria-expanded="false"]').forEach((btn, i) => {
      if (i < 6) btn.click();
    });
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, isMobile: true, hasTouch: true });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.evaluate((store) => {
    for (const [k, v] of Object.entries(store)) {
      localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
    }
  }, seedStore);
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  await page.locator("#portal-app").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForFunction(
    () => document.getElementById("view-root")?.innerHTML?.trim().length > 80,
    null,
    { timeout: 30000 }
  );
  await page.waitForTimeout(800);

  const results = [];

  for (const mod of MODULES) {
    const navigated = await page.evaluate(async (viewId) => {
      try {
        const mod = await import("/modules/core/router.js");
        if (typeof mod.setView === "function") {
          mod.setView(viewId);
          return true;
        }
      } catch (_e) {
        /* fallback hash */
      }
      window.location.hash = `#portal/${viewId}`;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      return true;
    }, mod.view);
    if (!navigated) {
      results.push({ ...mod, status: "SKIP", issues: ["navegación fallida"] });
      continue;
    }
    await page.waitForTimeout(900);
    await expandPanels(page);
    await page.waitForTimeout(500);

    const layout = await page.evaluate(LAYOUT_CHECK);
    const overlap = await page.evaluate(OVERLAP_CHECK);
    const issues = [...layout.issues];
    if (overlap.count > 0) issues.push(`${overlap.count} solapamiento(s) de campos`);

    await page.screenshot({
      path: path.join(OUT_DIR, `${mod.id}.png`),
      fullPage: false
    }).catch(() => {});

    results.push({
      ...mod,
      status: issues.length ? "FAIL" : "OK",
      viewRootLen: layout.viewRootLen,
      overlapCount: overlap.count,
      issues
    });
  }

  await browser.close();

  const failed = results.filter((r) => r.status === "FAIL");
  const report = {
    viewport: VIEWPORT,
    total: results.length,
    passed: results.filter((r) => r.status === "OK").length,
    failed: failed.length,
    skipped: results.filter((r) => r.status === "SKIP").length,
    results
  };

  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
