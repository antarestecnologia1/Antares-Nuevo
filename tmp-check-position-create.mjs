import { chromium } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  positions: "antares_positions_v2",
  vacancies: "antares_vacancies_v2",
  candidates: "antares_candidates_v2",
  interviews: "antares_interviews_v2",
  contracts: "antares_contracts_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  emails: "antares_emails_v2",
  session: "antares_session_v2",
  hiringWorkspace: "antares_hr_hiring_workspace_v1"
};

function plusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

function ymdhm(date) {
  return date.toISOString().slice(0, 16);
}

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
      address: "Sede principal",
      logoUrl: "https://example.com/logo-antares.png"
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
  [KEYS.vacancies]: [],
  [KEYS.candidates]: [],
  [KEYS.interviews]: [],
  [KEYS.contracts]: [],
  [KEYS.payrollEmployees]: [],
  [KEYS.emails]: [],
  [KEYS.session]: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now(),
    profileSnapshot: {
      id: "admin-1",
      name: "Admin QA",
      email: "admin.qa@antares.test",
      role: "admin"
    }
  },
  [KEYS.hiringWorkspace]: "operate"
};

const rawKeys = new Set([
  "antares_portal_data_ver",
  "antares_users_storage_ver",
  "antares_hr_hiring_workspace_v1"
]);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.addInitScript(({ payload, raw }) => {
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => {
    localStorage.setItem(key, raw.includes(key) ? String(value) : JSON.stringify(value));
  });
}, { payload: seedStore, raw: [...rawKeys] });

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.evaluate(() => {
  window.location.hash = "#portal/hiring";
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});
await page.waitForTimeout(700);
await page.locator("[data-action='hiring-operate-section'][data-section='position']").click();
await page.waitForSelector("#form-position");

const form = page.locator("#form-position");
await form.locator('input[name="name"]').fill("Coordinador QA Integral");
await form.locator('select[name="workerRole"]').selectOption("empleado");
await form.locator('input[name="baseSalary"]').fill("2600000");
await form.locator('select[name="contractTypeDefault"]').selectOption("Termino fijo");
await form.locator('select[name="workSchedule"]').selectOption("Mixta");
await form.locator('select[name="arlRiskLevel"]').selectOption("II");
await form.locator('select[name="integralSalary"]').selectOption("true");
await form.locator('input[name="legalBasis"]').fill("CST QA Integral");

const beforeSubmit = await page.evaluate(() => {
  const formEl = document.querySelector("#form-position");
  const data = Object.fromEntries(new FormData(formEl).entries());
  return {
    formData: data,
    integralValue: formEl?.querySelector('select[name="integralSalary"]')?.value || null,
    arlValue: formEl?.querySelector('select[name="arlRiskLevel"]')?.value || null
  };
});
console.log(JSON.stringify({ beforeSubmit }, null, 2));

await form.locator('button[type="submit"]').click();
await page.waitForTimeout(800);

const afterSubmit = await page.evaluate((key) => {
  const rows = window.AntaresPersistence?.read
    ? window.AntaresPersistence.read(key, [])
    : JSON.parse(localStorage.getItem(key) || "[]");
  return rows.find((row) => row.name === "Coordinador QA Integral") || null;
}, KEYS.positions);
console.log(JSON.stringify({ afterSubmit }, null, 2));

await browser.close();
