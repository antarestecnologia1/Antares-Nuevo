import { chromium } from "playwright";
const BASE_URL = "http://127.0.0.1:4173/";
const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  antares_users_v2: [{ id:"admin-1", name:"Admin QA", email:"admin.qa@antares.test", role:"admin", accountStatus:"aprobado", companyId:"co-antares", company:"Transportes Antares", documentType:"CC", taxId:"1010101010", phone:"3001112233", department:"Bogota", city:"Bogota D.C.", address:"Cra 1 # 1-1", permissions:[], dataPolicyAcceptedAt:new Date().toISOString(), dataPolicyVersion:"2025-v1", termsAcceptedAt:new Date().toISOString() }],
  antares_companies_v2: [{ id:"co-antares", name:"Transportes Antares", taxId:"900000001-0", companyKind:"propia", phone:"6011111111", email:"operaciones@antares.test", contactName:"Operaciones", department:"Bogota", city:"Bogota D.C.", address:"Sede principal" }],
  antares_session_v2: { userId:"admin-1", role:"admin", email:"admin.qa@antares.test", lastActivityAt: Date.now(), profileSnapshot: { id:"admin-1", name:"Admin QA", email:"admin.qa@antares.test", role:"admin" } },
  antares_payroll_employees_v2: [], antares_employee_documents_v1: [], antares_employee_document_folders_v1: []
};
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 3 });
await context.addInitScript((payload) => {
  const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value)));
}, seedStore);
const page = await context.newPage();
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.waitForTimeout(600);
await page.evaluate(() => { window.state.currentView = "document-management"; window.renderPortalView(); });
await page.waitForTimeout(500);
await page.locator('.hr-workspace-tab[data-tab="upload"]').screenshot({ path: "test-results/docs-tab1-zoom3x.png" });
const overflow = await page.evaluate(() => {
  const el = document.querySelector('.hr-workspace-tab[data-tab="upload"] .hr-workspace-tab-label');
  const body = document.querySelector('.hr-workspace-tab[data-tab="upload"] .hr-workspace-tab-body');
  return {
    labelScrollWidth: el.scrollWidth, labelClientWidth: el.clientWidth,
    bodyScrollWidth: body.scrollWidth, bodyClientWidth: body.clientWidth,
    labelOverflowStyle: getComputedStyle(el).overflow,
    labelWhiteSpace: getComputedStyle(el).whiteSpace,
    bodyOverflowStyle: getComputedStyle(body).overflow
  };
});
console.log(JSON.stringify(overflow, null, 2));
await browser.close();
