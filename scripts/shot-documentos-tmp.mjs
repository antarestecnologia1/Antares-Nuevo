/* Capturas del módulo Gestión documental (todas las pestañas, claro/oscuro). */
import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const todayIso = new Date().toISOString().slice(0, 10);
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const employees = [
  { id: "emp-1", name: "Laura Andrea Gómez Pérez", documentType: "CC", idDoc: "1010101010", position: "Analista RRHH", workerRole: "administrativo" },
  { id: "emp-2", name: "Carlos Mario Restrepo Ruiz", documentType: "CC", idDoc: "1020304050", position: "Conductor", workerRole: "conductor" },
  { id: "emp-3", name: "Diana Patricia Salazar", documentType: "CC", idDoc: "43112233", position: "Auxiliar contable", workerRole: "administrativo" },
  { id: "emp-4", name: "Jhon Alexander Torres", documentType: "CC", idDoc: "80456123", position: "Conductor", workerRole: "conductor" }
];

const docs = [
  { id: "d1", employeeId: "emp-1", employeeName: employees[0].name, documentType: "cedula", folder: "General", fileName: "cedula_laura.pdf", mimeType: "application/pdf", sizeBytes: 245000, dueDate: null, uploadedBy: "Portal" },
  { id: "d2", employeeId: "emp-1", employeeName: employees[0].name, documentType: "contrato", folder: "Contratos", fileName: "contrato_laura_2024.pdf", mimeType: "application/pdf", sizeBytes: 512000, dueDate: addDays(-10), uploadedBy: "Portal" },
  { id: "d3", employeeId: "emp-1", employeeName: employees[0].name, documentType: "eps", folder: "Afiliaciones", fileName: "eps_laura.pdf", mimeType: "application/pdf", sizeBytes: 128000, dueDate: addDays(20), uploadedBy: "Portal" },
  { id: "d4", employeeId: "emp-2", employeeName: employees[1].name, documentType: "cedula", folder: "General", fileName: "cedula_carlos.jpg", mimeType: "image/jpeg", sizeBytes: 890000, dueDate: null, uploadedBy: "Portal" },
  { id: "d5", employeeId: "emp-2", employeeName: employees[1].name, documentType: "licencia_conduccion", folder: "Licencias", fileName: "licencia_carlos.pdf", mimeType: "application/pdf", sizeBytes: 310000, dueDate: addDays(5), uploadedBy: "Portal" },
  { id: "d6", employeeId: "emp-2", employeeName: employees[1].name, documentType: "soat", folder: "Licencias", fileName: "soat_carlos.pdf", mimeType: "application/pdf", sizeBytes: 220000, dueDate: addDays(-3), uploadedBy: "Portal" },
  { id: "d7", employeeId: "emp-3", employeeName: employees[2].name, documentType: "hoja_vida", folder: "General", fileName: "hoja_vida_diana.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 45000, dueDate: null, uploadedBy: "Portal" }
];

const folders = [
  { id: "f1", employeeId: "emp-1", employeeName: employees[0].name, folderName: "General", createdBy: "Portal", createdAt: new Date().toISOString() },
  { id: "f2", employeeId: "emp-1", employeeName: employees[0].name, folderName: "Contratos", createdBy: "Portal", createdAt: new Date().toISOString() },
  { id: "f3", employeeId: "emp-1", employeeName: employees[0].name, folderName: "Afiliaciones", createdBy: "Portal", createdAt: new Date().toISOString() }
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
      permissions: [],
      dataPolicyAcceptedAt: new Date().toISOString(),
      dataPolicyVersion: "2025-v1",
      termsAcceptedAt: new Date().toISOString()
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
  antares_session_v2: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now(),
    profileSnapshot: { id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin" }
  },
  antares_payroll_employees_v2: employees,
  antares_employee_documents_v1: docs,
  antares_employee_document_folders_v1: folders
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 1100 } });
await context.addInitScript((payload) => {
  const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => {
    localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
  });
}, seedStore);

const page = await context.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 300)));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("[console.error]", msg.text().slice(0, 300));
});
await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.waitForTimeout(700);

await page.evaluate(() => {
  window.state.documentsUi = { ...(window.state.documentsUi || {}), workspace: "upload" };
  window.state.currentView = "document-management";
  window.renderPortalView();
});
await page.waitForTimeout(600);
await page.screenshot({ path: "test-results/docs-01-upload-light.png", fullPage: true });

const gotoTab = (tab) =>
  page.evaluate((t) => {
    document.querySelector(`[data-action="hr-workspace-tab"][data-module="documents"][data-tab="${t}"]`)?.click();
  }, tab);

await gotoTab("consult");
await page.waitForTimeout(500);
await page.screenshot({ path: "test-results/docs-02-consult-light.png", fullPage: true });
await page.locator('[data-doc-panel="consult"] .hr-workspace-tabs, nav.hr-workspace-tabs').first().screenshot({ path: "test-results/docs-02b-tabs-zoom.png" }).catch(() => {});
await page.locator("nav.hr-workspace-tabs").first().screenshot({ path: "test-results/docs-02c-tabs-zoom.png" }).catch((e) => console.log("zoom-fail", e.message));

await page.evaluate(() => {
  document.querySelector('[data-action="doc-browse-employee"]')?.click();
});
await page.waitForTimeout(500);
await page.screenshot({ path: "test-results/docs-03-consult-employee-light.png", fullPage: true });

await gotoTab("dossier");
await page.waitForTimeout(300);
await page.evaluate(() => {
  window.state.documentsUi = { ...(window.state.documentsUi || {}), selectedEmployeeId: "emp-1" };
  window.renderPortalView();
});
await page.waitForTimeout(500);
await page.screenshot({ path: "test-results/docs-04-dossier-light.png", fullPage: true });

await gotoTab("data");
await page.waitForTimeout(500);
await page.screenshot({ path: "test-results/docs-05-data-light.png", fullPage: true });

await page.evaluate(() => {
  document.body.setAttribute("data-theme", "dark");
});
await page.waitForTimeout(400);
await page.screenshot({ path: "test-results/docs-06-data-dark.png", fullPage: true });

await gotoTab("dossier");
await page.waitForTimeout(400);
await page.screenshot({ path: "test-results/docs-07-dossier-dark.png", fullPage: true });

// mobile viewport check
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
await page.screenshot({ path: "test-results/docs-08-dossier-mobile-dark.png", fullPage: true });
await page.evaluate(() => document.body.setAttribute("data-theme", "light"));
await gotoTab("upload");
await page.waitForTimeout(400);
await page.screenshot({ path: "test-results/docs-09-upload-mobile-light.png", fullPage: true });

console.log("ok");
await browser.close();
