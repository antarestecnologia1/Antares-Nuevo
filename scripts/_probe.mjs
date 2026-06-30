import { chromium } from "playwright";

const BASE_URL = "http://127.0.0.1:4173/";
const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  antares_theme_v1: "light",
  antares_users_v2: [
    { id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin", accountStatus: "aprobado", companyId: "co-antares", company: "Transportes Antares", documentType: "CC", taxId: "1010101010", phone: "3001112233", department: "Bogota", city: "Bogota D.C.", address: "Cra 1 # 1-1", permissions: [] }
  ],
  antares_companies_v2: [{ id: "co-antares", name: "Transportes Antares", taxId: "900000001-0", companyKind: "propia", active: true }],
  antares_session_v2: { userId: "admin-1", token: "qa-token", expiresAt: new Date(Date.now() + 86400000).toISOString() },
  antares_counters_v2: {}, antares_requests_v2: [], antares_vehicles_v2: [], antares_drivers_v2: [], antares_notifications_v2: [],
  antares_payroll_employees_v2: [], antares_payroll_runs_v2: [], antares_positions_v2: [], antares_vacancies_v2: [], antares_candidates_v2: [],
  antares_interviews_v2: [], antares_contracts_v2: [], antares_hr_absences_v2: [], antares_sst_compliance_v2: [], antares_approvals_v2: [], antares_portal_contacts_v1: []
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
await page.evaluate((store) => { for (const [k, v] of Object.entries(store)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, seedStore);
await page.reload({ waitUntil: "networkidle" });
await page.locator('[data-view="transport-vehicles"]').first().click();
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const strip = document.querySelector("#view-root .fleet-hero-strip");
  if (!strip) return { error: "no strip" };
  const cs = getComputedStyle(strip);
  const metric = strip.querySelector(".fleet-hero-metric");
  const span = metric?.querySelector("span");
  const strong = metric?.querySelector("strong");
  const dump = (el) => el ? { color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor, bgImg: getComputedStyle(el).backgroundImage.slice(0,80) } : null;
  return {
    theme: document.body.getAttribute("data-theme"),
    strip: { bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 120), color: cs.color, classes: strip.className },
    metric: dump(metric),
    span: dump(span),
    strong: dump(strong),
    spanText: span?.textContent,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
