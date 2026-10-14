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

function plusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

const now = new Date();

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
      baseSalary: 2200000,
      contractTypeDefault: "Termino indefinido",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel I",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: now.toISOString()
    },
    {
      id: "pos-conductor",
      name: "Conductor C2",
      workerRole: "conductor",
      baseSalary: 2500000,
      contractTypeDefault: "Termino indefinido",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel III",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: now.toISOString()
    }
  ],
  [KEYS.payrollEmployees]: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Carlos Operativo",
      idDoc: "1234567890",
      documentType: "CC",
      companyId: "co-antares",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Cra 10 # 20-30",
      phone: "3005556677",
      emergencyContact: "Ana",
      emergencyPhone: "3005556678",
      emergencyRelation: "Hermana",
      positionId: "pos-analista",
      position: "Analista de operaciones",
      workerRole: "empleado",
      baseSalary: 2200000,
      contractType: "Termino indefinido",
      bankName: "Bancolombia",
      bankAccountType: "Ahorros",
      bankAccount: "123456789012",
      startDate: ymd(plusDays(-90)),
      workSchedule: "Diurna",
      payFrequency: "Mensual",
      eps: "Sura",
      pensionFund: "Porvenir",
      arl: "Sura",
      transportAllowance: 162000,
      active: true
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Luis Conductor",
      idDoc: "1098765432",
      documentType: "CC",
      companyId: "co-antares",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Cra 8 # 8-8",
      phone: "3004445566",
      emergencyContact: "Marta",
      emergencyPhone: "3004445567",
      emergencyRelation: "Madre",
      positionId: "pos-conductor",
      position: "Conductor C2",
      workerRole: "conductor",
      baseSalary: 0,
      contractType: "Prestacion de servicios",
      contractTemplateKind: "prestacion",
      startDate: ymd(plusDays(-40)),
      payFrequency: "Mensual",
      active: true
    }
  ],
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
  [KEYS.payrollWorkspace]: "operate"
};

async function setDate(page, formSelector, name, iso) {
  const [year, month, day] = iso.split("-");
  const dmy = `${day}/${month}/${year}`;
  await page.evaluate(
    ({ formSelector: sel, name: fieldName, iso: value, dmy: shown }) => {
      const form = document.querySelector(sel);
      if (!form) throw new Error(`No está el formulario ${sel}`);
      const V = window.AntaresValidation;
      if (typeof V?.setPortalFormDateByName === "function") V.setPortalFormDateByName(form, fieldName, value);
      const named = form.querySelector(`[name="${fieldName}"]`);
      if (!named) throw new Error(`No está el campo ${fieldName}`);
      const visible = named.previousElementSibling?.classList?.contains("portal-date-dmy")
        ? named.previousElementSibling
        : named;
      if (visible.classList.contains("portal-date-dmy")) visible.value = shown;
      else if (visible.type !== "hidden") visible.value = value;
      visible.dispatchEvent(new Event("input", { bubbles: true }));
      visible.dispatchEvent(new Event("change", { bubbles: true }));
      V?.clearFieldError?.(visible);
      if (named.type === "hidden") named.value = value;
    },
    { formSelector, name, iso, dmy }
  );
}

async function ensureCreatePanelOpen(page, panelId) {
  const panel = page.locator(`[data-create-panel='${panelId}']`);
  const open = await panel.evaluate(
    (el) => Boolean(el) && !el.classList.contains("hidden") && !el.hasAttribute("hidden")
  );
  if (!open) {
    await page.locator(`[data-action='toggle-create-panel'][data-panel='${panelId}'].module-panel-btn--expand`).click();
  }
  await expect(panel).toBeVisible();
}

async function clickEmployeeNext(page, expectedStep) {
  await page.locator("#form-employee [data-hr-wizard-next]").click();
  const progress = page.locator("#form-employee [data-hr-wizard-progress]");
  try {
    await expect(progress).toHaveText(`Paso ${expectedStep} de 6`, { timeout: 4000 });
  } catch (error) {
    const detail = await page.evaluate(() => {
      const step = document.querySelector("#form-employee .hr-form-step.is-active");
      const errors = [...(step?.querySelectorAll(".field-error") || [])].map((node) => node.textContent.trim());
      const invalid = [...(step?.querySelectorAll("input, select, textarea") || [])]
        .filter((el) => typeof el.checkValidity === "function" && !el.checkValidity())
        .map((el) => `${el.name}: ${el.validationMessage} (valor: ${el.value})`);
      const values = [...(step?.querySelectorAll("[name]") || [])].map((el) => `${el.name}=${el.value}`);
      return { errors, invalid, values };
    });
    throw new Error(`${error.message}\n${JSON.stringify(detail, null, 2)}`);
  }
}

async function openOperateSection(page, section) {
  const operateTab = page.locator("[data-action='hr-workspace-tab'][data-module='payroll'][data-tab='operate']");
  if ((await operateTab.getAttribute("aria-selected")) !== "true") {
    await operateTab.click();
  }
  const tab = page.locator(`[data-action='payroll-operate-section'][data-section='${section}']`);
  await tab.click();
  await page.waitForFunction((id) => {
    const btn = document.querySelector(`[data-action='payroll-operate-section'][data-section='${id}']`);
    return btn && btn.classList.contains("is-active");
  }, section);
}

test("formularios de creación de Gestión Humana", async ({ page, context }) => {
  test.setTimeout(150000);

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
  await page.waitForFunction(
    () => typeof window.bindHrFormWizard === "function" && typeof window.writeAwaitServerCreate === "function",
    null,
    { timeout: 20000 }
  );
  await page.waitForSelector("[data-action='hr-workspace-tab'][data-module='payroll'][data-tab='operate']", {
    timeout: 20000
  });
  const wizardReady = await page.evaluate(
    () => document.querySelector("#form-employee")?.dataset.hrWizardBound === "1"
  );
  if (!wizardReady) {
    await page.evaluate(() => {
      window.location.hash = "#portal/dashboard";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      window.location.hash = "#portal/payroll";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
  await page.waitForFunction(() => document.querySelector("#form-employee")?.dataset.hrWizardBound === "1", null, {
    timeout: 15000
  });
  await expect(page.locator("#form-data-policy-accept")).toHaveCount(0);

  const operateTab = page.locator("[data-action='hr-workspace-tab'][data-module='payroll'][data-tab='operate']");
  await operateTab.click();
  await page.waitForSelector("#form-employee", { state: "attached", timeout: 15000 });
  await ensureCreatePanelOpen(page, "create-employee");

  const genderBlanks = await page.locator("#form-employee select[name='gender'] option[value='']").count();
  expect(genderBlanks).toBe(1);
  const requiredMarks = await page.locator("#form-employee .field-required-mark").count();
  expect(requiredMarks).toBeGreaterThan(10);

  await page.locator("#form-employee [data-hr-wizard-next]").click();
  await expect(page.locator("#form-employee .field-error").first()).toBeVisible();
  await expect(page.locator("#form-employee [data-hr-wizard-progress]")).toHaveText("Paso 1 de 6");

  const form = page.locator("#form-employee");
  await form.locator("[name='name']").fill("Ana Prueba Ui");
  await form.locator("[name='documentType']").selectOption("CC");
  await form.locator("[name='idDoc']").fill("1036785371");
  await setDate(page, "#form-employee", "birthDate", "1995-03-15");
  await form.locator("[name='gender']").selectOption("Femenino");
  await form.locator("[name='bloodType']").selectOption("O+");
  await clickEmployeeNext(page, 2);

  await form.locator("[name='department']").selectOption("Bogota");
  await page.waitForFunction(() => {
    const city = document.querySelector("#employee-city");
    return city && [...city.options].some((opt) => opt.value === "Bogota D.C.");
  });
  await form.locator("[name='city']").selectOption("Bogota D.C.");
  await form.locator("[name='address']").fill("Carrera 15 # 6-56");
  await form.locator("[name='phone']").fill("3001234567");
  await form.locator("[name='emergencyContact']").fill("Laura Prueba");
  await form.locator("[name='emergencyPhone']").fill("3001234568");
  await form.locator("[name='emergencyRelation']").fill("Hermana");
  await clickEmployeeNext(page, 3);

  await expect(page.locator("#form-employee")).toContainText("Resolución 2346 de 2007");
  await form.locator("[name='companyId']").selectOption("co-antares");
  await form.locator("[name='positionId']").selectOption("pos-analista");
  await setDate(page, "#form-employee", "startDate", ymd(plusDays(-10)));
  await form.locator("[name='contractTemplateKind']").selectOption("oficina");
  await clickEmployeeNext(page, 4);

  await form.locator("[name='eps']").selectOption("Sura");
  await form.locator("[name='pensionFund']").selectOption("Porvenir");
  await form.locator("[name='arl']").selectOption("Sura");
  await clickEmployeeNext(page, 5);

  await form.locator("[name='bankName']").selectOption("Bancolombia");
  await form.locator("[name='bankAccountType']").selectOption("Ahorros");
  await form.locator("[name='bankAccount']").fill("1234567890");
  await clickEmployeeNext(page, 6);

  const conductorFields = page.locator("#hr-conductor-fields");
  await expect(conductorFields).toBeHidden();
  await expect(page.locator("#hr-conductor-skip-note")).toContainText("no es de conductor");
  const licenseRequiredWhenAnalyst = await page.locator("#form-employee [name='licenseIssueDate']").getAttribute("required");
  expect(licenseRequiredWhenAnalyst).toBeNull();
  await expect(page.locator("#form-employee .hr-form-wizard-submit")).toBeEnabled();

  await page.locator("#form-employee [data-hr-wizard-dot='2']").click();
  await expect(page.locator("#form-employee [data-hr-wizard-progress]")).toHaveText("Paso 3 de 6");
  await form.locator("[name='positionId']").selectOption("pos-conductor");
  await form.locator("[name='contractTemplateKind']").selectOption("oficina");
  for (let step = 4; step <= 6; step += 1) {
    await clickEmployeeNext(page, step);
  }
  await expect(conductorFields).toBeVisible();
  await expect(page.locator("#hr-conductor-skip-note")).toBeHidden();
  await expect(page.locator("#form-employee [name='license']")).toHaveAttribute("required", "required");
  await expect(page.locator("#form-employee [name='licenseCategory']")).toHaveAttribute("required", "required");
  await expect(page.locator("#form-employee [name='licenseIssueDate']")).toHaveAttribute("required", "required");

  await openOperateSection(page, "payroll");
  await page.waitForSelector("#form-payroll", { state: "attached" });
  await ensureCreatePanelOpen(page, "create-payroll");
  await expect(page.locator("#form-payroll")).toContainText("Dom./festivo · +90%");
  const withholdingHelp = await page.locator("#form-payroll [name='withholdingDependents']").evaluate((input) => {
    const label = input.closest("label");
    const help = label?.querySelector(".field-help");
    return help?.getAttribute("title") || help?.getAttribute("aria-label") || "";
  });
  expect(withholdingHelp).toContain("32 UVT");
  expect(withholdingHelp).toContain("no se multiplica");

  await page.locator("#payroll-employee-select").selectOption("11111111-1111-4111-8111-111111111111");
  await page.locator("#form-payroll [name='hedHours']").fill("2");
  await page.locator("#form-payroll [name='extras']").fill("100000");

  await page.evaluate(() => {
    window.__qaPayrollCreate = null;
    window.portalCanRefreshFromApi = () => true;
    window.applyPortalBootstrapFromApi = async () => {};
    window.writeAwaitServerCreate = async (_key, _list, record) => {
      window.__qaPayrollCreate = record;
      return record;
    };
  });
  await page.locator("#payroll-submit-btn").click();
  try {
    await page.waitForFunction(
      () => window.__qaPayrollCreate && window.__qaPayrollCreate.employeeId === "11111111-1111-4111-8111-111111111111",
      null,
      { timeout: 15000 }
    );
  } catch (error) {
    const detail = await page.evaluate(() => ({
      toasts: [...document.querySelectorAll("#toast-container .toast")].map((node) => node.textContent.trim()),
      errors: [...document.querySelectorAll("#form-payroll .field-error")].map((node) => node.textContent.trim())
    }));
    throw new Error(`${error.message}\n${JSON.stringify(detail)}`);
  }
  const payrollRun = await page.evaluate(() => window.__qaPayrollCreate);
  const lineCodes = (payrollRun.devengosLines || []).map((line) => line.code || line.codigo || line.concept || line.label);
  expect(payrollRun.extras).toBeGreaterThan(100000);
  expect(JSON.stringify(payrollRun.noveltiesDetail?.overtime || {})).toContain("HED");
  expect(JSON.stringify(lineCodes)).toMatch(/HED/);
  expect(JSON.stringify(payrollRun.devengosLines || [])).toMatch(/EXTRAS|Otros extras/);
  expect(Number.isFinite(Number(payrollRun.withholding))).toBe(true);
  expect(Number(payrollRun.gross)).toBeGreaterThan(2200000);

  await openOperateSection(page, "driverPay");
  await page.waitForSelector("#form-driver-trip-payment", { state: "attached" });
  await ensureCreatePanelOpen(page, "create-driver-trip-payment");
  expect(await page.locator("#form-driver-trip-payment [name='employeeId']").getAttribute("required")).not.toBeNull();
  expect(await page.locator("#form-driver-trip-payment [name='month']").getAttribute("required")).not.toBeNull();
  await page.locator("#form-driver-trip-payment button[type='submit']").click();
  await expect(page.locator("#form-driver-trip-payment .field-error").first()).toBeVisible();

  await openOperateSection(page, "settlement");
  await page.waitForSelector("#form-payroll-settlement", { state: "attached" });
  await ensureCreatePanelOpen(page, "create-payroll-settlement");
  const settlementHelp = await page.locator("#form-payroll-settlement [name='withholdingDependents']").evaluate((input) => {
    const label = input.closest("label");
    const help = label?.querySelector(".field-help");
    return help?.getAttribute("title") || "";
  });
  expect(settlementHelp).toContain("32 UVT");
  expect(settlementHelp).toContain("no se multiplica");

  await openOperateSection(page, "absence");
  await page.waitForSelector("#form-hr-absence", { state: "attached" });
  await ensureCreatePanelOpen(page, "create-hr-absence");
  const periodicHelp = await page.locator("#form-hr-absence [name='periodicAbsence']").evaluate((input) => {
    const help = input.closest("label")?.querySelector(".field-help");
    return help?.getAttribute("title") || help?.getAttribute("aria-label") || "";
  });
  expect(periodicHelp).toContain("No genera repeticiones automáticas");
  await page.locator("#form-hr-absence button[type='submit']").click();
  await expect(page.locator("#form-hr-absence .field-error").first()).toBeVisible();
  const absenceCount = await page.evaluate(() => {
    const rows = window.AntaresPersistence?.read?.("antares_hr_absences_v2", []) || [];
    return Array.isArray(rows) ? rows.length : 0;
  });
  expect(absenceCount).toBe(0);
});
