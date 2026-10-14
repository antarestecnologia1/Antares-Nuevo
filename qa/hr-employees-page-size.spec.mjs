import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  counters: "antares_counters_v2",
  positions: "antares_positions_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  payrollRuns: "antares_payroll_runs_v2",
  hrAbsences: "antares_hr_absences_v2",
  session: "antares_session_v2",
  payrollWorkspace: "antares_hr_payroll_workspace_v1"
};

const now = new Date();

function makeEmployee(i) {
  return {
    id: `33333333-3333-4333-8333-${String(i).padStart(12, "0")}`,
    name: `Colaborador QA ${i}`,
    idDoc: String(1000000000 + i),
    documentType: "CC",
    companyId: "co-antares",
    city: "Bogota D.C.",
    department: "Bogota",
    address: "Cra 1 # 1-1",
    phone: "3001112233",
    emergencyContact: "Contacto",
    emergencyPhone: "3001112234",
    emergencyRelation: "Hermano",
    positionId: "pos-analista",
    position: "Analista de operaciones",
    workerRole: "empleado",
    baseSalary: 1800000,
    contractType: "Termino fijo",
    contractEndDate: "2027-05-01",
    bankName: "Bancolombia",
    bankAccountType: "Ahorros",
    bankAccount: "1234567890",
    startDate: "2025-01-15",
    workSchedule: "Diurna",
    payFrequency: "Mensual",
    eps: "Sura",
    pensionFund: "Porvenir",
    arl: "Sura",
    transportAllowance: 162000,
    active: true
  };
}

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  [KEYS.users]: [
    {
      id: "admin-1",
      requiresDataPolicyAcceptance: false,
      requiresTermsAcceptance: false,
      dataPolicyAcceptedAt: now.toISOString(),
      termsAcceptedAt: now.toISOString(),
      dataPolicyVersion: "2025-v1",
      name: "Admin QA",
      firstName: "Admin",
      lastName: "QA",
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
      birthDate: "1990-01-01",
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
  [KEYS.counters]: {},
  [KEYS.positions]: [
    {
      id: "pos-analista",
      name: "Analista de operaciones",
      workerRole: "empleado",
      baseSalary: 1800000,
      contractTypeDefault: "Termino fijo",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel I",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: now.toISOString()
    }
  ],
  [KEYS.payrollEmployees]: Array.from({ length: 24 }, (_, i) => makeEmployee(i + 1)),
  [KEYS.payrollRuns]: [],
  [KEYS.hrAbsences]: [],
  [KEYS.session]: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now(),
    profileSnapshot: {
      id: "admin-1",
      name: "Admin QA",
      email: "admin.qa@antares.test",
      role: "admin",
      requiresDataPolicyAcceptance: false,
      requiresTermsAcceptance: false,
      dataPolicyAcceptedAt: now.toISOString(),
      termsAcceptedAt: now.toISOString(),
      dataPolicyVersion: "2025-v1",
      firstName: "Admin"
    }
  },
  [KEYS.payrollWorkspace]: "data"
};

test("paginación de colaboradores: registros por página", async ({ page, context }) => {
  await context.addInitScript((payload) => {
    const rawKeys = new Set([
      "antares_portal_data_ver",
      "antares_users_storage_ver",
      "antares_hr_payroll_workspace_v1"
    ]);
    localStorage.clear();
    Object.entries(payload).forEach(([key, value]) => {
      localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
    });
  }, seedStore);

  await page.goto(`${BASE_URL}#portal/payroll`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#payroll-employees-page-size", { timeout: 20000 });
  await page.locator("[data-action='hr-workspace-tab'][data-module='payroll'][data-tab='data']").click();
  await page.locator("[data-action='payroll-data-section'][data-section='employees']").click();
  await page.waitForSelector(".hr-cred-grid .hr-cred, .ag-roster .ag-roster-card", { timeout: 15000 });

  const countCards = () =>
    page.locator(".hr-cred-grid .hr-cred, .ag-roster .ag-roster-card").count();

  await expect(page.locator(".payroll-contracts-pagination__meta")).toContainText("de 24");
  const initial = await countCards();
  expect(initial).toBe(10);

  expect(await page.evaluate(() => Boolean(window.__payrollEmployeesPagingBound))).toBe(true);

  await page.locator("#payroll-employees-page-size").selectOption("20");
  await expect.poll(async () => page.locator(".payroll-contracts-pagination__meta").textContent()).toMatch(/1 a 20 de 24/);
  await expect(page.locator("#payroll-employees-page-size")).toHaveValue("20");
  expect(await countCards()).toBe(20);

  await page.locator("#payroll-employees-page-size").selectOption("5");
  await expect.poll(async () => page.locator(".payroll-contracts-pagination__meta").textContent()).toMatch(/1 a 5 de 24/);
  await expect(page.locator("#payroll-employees-page-size")).toHaveValue("5");
  expect(await countCards()).toBe(5);
});
