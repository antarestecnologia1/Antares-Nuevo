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
const context = await browser.newContext({ viewport: { width: 1400, height: 1100 } });
await context.addInitScript((payload) => {
  const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value)));
}, seedStore);
const page = await context.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 300)));
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.waitForTimeout(800);
await page.evaluate(() => { window.state.currentView = "document-management"; window.state.documentsUi = { ...(window.state.documentsUi||{}), workspace: "data" }; window.renderPortalView(); });
await page.waitForTimeout(600);

const info = await page.evaluate(() => {
  const panel = document.querySelector('[data-doc-panel="data"]');
  const row = panel?.querySelector(".doc-filter-bar__row");
  if (!row) return { error: "not found", panelClass: panel?.className };
  const cs = getComputedStyle(row);
  const fieldRects = [...row.children].map((el) => ({
    tag: el.tagName,
    cls: el.className,
    rect: el.getBoundingClientRect()
  }));
  return {
    panelClass: panel.className,
    display: cs.display,
    gridTemplateColumns: cs.gridTemplateColumns,
    width: row.getBoundingClientRect().width,
    fieldRects
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
