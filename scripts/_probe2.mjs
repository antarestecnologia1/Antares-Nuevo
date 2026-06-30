import { chromium } from "playwright";
const BASE_URL = "http://127.0.0.1:4173/";
const seed = {
  antares_portal_data_ver: "v8-server-backed-memory-only", antares_users_storage_ver: "v5-memory",
  antares_users_v2: [{ id: "admin-1", name: "Admin QA", email: "a@b.c", role: "admin", accountStatus: "aprobado", companyId: "co-antares", company: "Transportes Antares", documentType: "CC", taxId: "1", phone: "3", department: "Bogota", city: "Bogota", address: "x", permissions: [] }],
  antares_companies_v2: [{ id: "co-antares", name: "Transportes Antares", taxId: "9", companyKind: "propia", active: true }],
  antares_session_v2: { userId: "admin-1", token: "t", expiresAt: new Date(Date.now() + 86400000).toISOString() },
  antares_counters_v2: {}, antares_requests_v2: [], antares_vehicles_v2: [], antares_drivers_v2: [], antares_notifications_v2: [], antares_payroll_employees_v2: [], antares_payroll_runs_v2: [], antares_positions_v2: [], antares_vacancies_v2: [], antares_candidates_v2: [], antares_interviews_v2: [], antares_contracts_v2: [], antares_hr_absences_v2: [], antares_sst_compliance_v2: [], antares_approvals_v2: [], antares_portal_contacts_v1: []
};
const browser = await chromium.launch({ headless: true });
async function probe(theme, view, selectors) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((d) => { for (const [k, v] of Object.entries(d.s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); localStorage.setItem("antares_theme_v1", d.t); }, { s: seed, t: theme });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(`[data-view="${view}"]`).first().click();
  await page.waitForTimeout(700);
  const out = await page.evaluate((sels) => sels.map((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, missing: true };
    const cs = getComputedStyle(el);
    return { sel, color: cs.color, bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 90), text: (el.textContent || "").trim().slice(0, 24) };
  }), selectors);
  console.log(`\n== ${theme} / ${view} ==`);
  for (const o of out) console.log(JSON.stringify(o));
  await ctx.close();
}
await probe("dark", "admin-users", ["#view-root .auth-tab-btn:not(.is-active) .auth-tab-badge"]);
await probe("light", "admin-users", ["#view-root .admin-users-hero-chips .status", "#view-root .directory-card .status-viaje_asignado"]);
await probe("dark", "history", ["#view-root .hist-trace-hero__badge"]);
await probe("dark", "hiring", ["#view-root .hiring-studio-head__badge"]);
await browser.close();
