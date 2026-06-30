/**
 * Auditoría exhaustiva: recorre los 18 módulos del portal y reporta errores de consola,
 * fallos de render y elementos clave ausentes.
 */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const MODULES = [
  { id: "dashboard", label: "1. Dashboard", selector: "#view-root .dashboard-studio, #view-root .ops-dash" },
  { id: "requests", label: "2. Mis solicitudes", selector: "#view-root .requests-studio, #view-root .requests-shell" },
  { id: "transport-trips", label: "3. Viajes", selector: "#view-root .transport-studio, #view-root .transport-shell" },
  { id: "transport-vehicles", label: "4. Camiones", selector: "#view-root .vehicles-studio, #view-root .vehicles-shell" },
  { id: "transport-drivers", label: "5. Conductores", selector: "#view-root .drivers-studio, #view-root .directory-card" },
  { id: "transport-calendar", label: "6. Calendario", selector: "#view-root .calendar-studio, #view-root .calendar-shell" },
  { id: "history", label: "7. Historial", selector: "#view-root .history-studio, #view-root .history-shell" },
  { id: "reports", label: "8. Reportería", selector: "#view-root .reports-studio, #view-root .reports-workspace" },
  { id: "payroll", label: "9. Gestión humana", selector: "#view-root .payroll-studio, #view-root .payroll-shell" },
  { id: "hiring", label: "10. Contratación", selector: "#view-root .hiring-studio, #view-root .hiring-shell" },
  { id: "labor-compliance", label: "11. Cumplimiento laboral y SST", selector: "#view-root .sst-studio, #view-root #form-sst-compliance" },
  { id: "contact-leads", label: "12. Contacto web (B2B)", selector: "#view-root .b2b-studio, #view-root .b2b-leads-mosaic" },
  { id: "admin-users", label: "13. Usuarios y permisos", selector: "#view-root .admin-users-studio, #view-root .users-hero-strip" },
  { id: "authorizations", label: "14. Autorizaciones", selector: "#view-root .authorizations-studio, #view-root .auth-tabs-bar" },
  { id: "profile", label: "15. Mi perfil", selector: "#view-root .profile-studio, #view-root #form-profile" },
  { id: "notifications", label: "18. Notificaciones", selector: "#view-root .notifications-studio, #view-root .notif-list" }
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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err.message || err)));

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate((store) => {
    for (const [k, v] of Object.entries(store)) {
      localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
    }
  }, seedStore);

  await page.reload({ waitUntil: "networkidle", timeout: 45000 });

  const portal = page.locator("#portal");
  await portal.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});

  const results = [];

  for (const mod of MODULES) {
    consoleErrors.length = 0;
    pageErrors.length = 0;

    const nav = page.locator(`[data-view="${mod.id}"]`);
    const navCount = await nav.count();
    if (!navCount) {
      results.push({ ...mod, status: "FAIL", issues: ["Botón de navegación no encontrado"] });
      continue;
    }

    await nav.first().click();
    await page.waitForTimeout(600);

    const title = await page.locator("#view-title").textContent().catch(() => "");
    const rootHtml = await page.locator("#view-root").innerHTML().catch(() => "");
    const rootEmpty = !rootHtml || rootHtml.trim().length < 20;
    const hasSelector = await page.locator(mod.selector).first().isVisible().catch(() => false);
    const hasErrorState = /empty-state|No tiene permiso|error/i.test(rootHtml) && rootEmpty;

    const issues = [];
    if (rootEmpty) issues.push("view-root vacío o sin contenido");
    if (!hasSelector && !/empty-state|No tiene permiso/.test(rootHtml)) issues.push(`Selector clave no visible: ${mod.selector}`);
    if (pageErrors.length) issues.push(...pageErrors.map((e) => `pageerror: ${e}`));
    if (consoleErrors.length) issues.push(...consoleErrors.slice(0, 3).map((e) => `console: ${e}`));

    results.push({
      ...mod,
      status: issues.length ? "FAIL" : "OK",
      title: (title || "").trim(),
      issues
    });
  }

  // 16. Timbre y 17. Avisos — controles independientes en el módulo Notificaciones
  const notifNav = page.locator('[data-view="notifications"]').first();
  if (await notifNav.count()) {
    await notifNav.click();
    await page.waitForTimeout(400);
  }
  const avisosToggle = page.locator("[data-action='notif-toggle-alerts']");
  const timbreToggle = page.locator("[data-action='notif-toggle-sound']");
  const timbreIssues = [];
  const avisosIssues = [];
  if ((await timbreToggle.count()) < 1) timbreIssues.push("Control Timbre no encontrado");
  if ((await avisosToggle.count()) < 1) avisosIssues.push("Control Avisos no encontrado");
  else {
    const beforeChecked = await avisosToggle.first().getAttribute("aria-checked");
    await avisosToggle.first().click();
    await page.waitForTimeout(300);
    const afterChecked = await page.locator("[data-action='notif-toggle-alerts']").first().getAttribute("aria-checked");
    if (beforeChecked === afterChecked) avisosIssues.push("El toggle de Avisos no cambió de estado");
  }
  results.push({ id: "timbre", label: "16. Timbre", status: timbreIssues.length ? "FAIL" : "OK", issues: timbreIssues });
  results.push({ id: "avisos", label: "17. Avisos", status: avisosIssues.length ? "FAIL" : "OK", issues: avisosIssues });

  await browser.close();

  const failed = results.filter((r) => r.status === "FAIL");
  console.log(JSON.stringify({ total: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
