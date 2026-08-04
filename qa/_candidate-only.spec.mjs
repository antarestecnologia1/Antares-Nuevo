import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const now = new Date();
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

function ymd(date) {
  return date.toISOString().slice(0, 10);
}
function plusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

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
      address: "Cra 1",
      permissions: [],
      dataPolicyAcceptedAt: now.toISOString(),
      dataPolicyVersion: "2025-v1",
      termsAcceptedAt: now.toISOString()
    }
  ],
  [KEYS.companies]: [
    {
      id: "co-antares",
      name: "Transportes Antares",
      taxId: "900000001-0",
      companyKind: "propia",
      phone: "6011111111",
      email: "op@test",
      contactName: "Op",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Sede",
      logoUrl: "https://example.com/a.png"
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
  [KEYS.vacancies]: [
    {
      id: "vac-1",
      title: "VACANTE ANALISTA EDITADA",
      positionId: "pos-analista",
      positionName: "Analista de operaciones",
      workerRole: "empleado",
      contractTypeDefault: "Termino indefinido",
      city: "Bogota D.C.",
      department: "Bogota",
      modality: "REMOTO",
      openings: 2,
      salaryOffer: 2300000,
      deadline: ymd(plusDays(15)),
      requirements: "Experiencia en logística",
      status: "Publicada",
      createdAt: now.toISOString()
    }
  ],
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
      role: "admin",
      dataPolicyAcceptedAt: now.toISOString(),
      dataPolicyVersion: "2025-v1",
      termsAcceptedAt: now.toISOString()
    }
  },
  [KEYS.hiringWorkspace]: JSON.stringify({
    workspace: "operate",
    dataSection: "candidates",
    candidateFilter: "active",
    vacancyFilter: "open",
    candidateSort: "recent",
    candidateView: "board",
    pipelineStage: ""
  })
};

test.setTimeout(90000);

test("candidate create only", async ({ page, context }) => {
  await context.addInitScript((payload) => {
    const rawKeys = new Set([
      "antares_portal_data_ver",
      "antares_users_storage_ver",
      "antares_hr_hiring_workspace_v1"
    ]);
    localStorage.clear();
    Object.entries(payload).forEach(([key, value]) => {
      localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
    });
  }, seedStore);

  const log = (msg) => console.log(`[cand] ${msg}`);

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#portal-app", { timeout: 10000 });
  log("portal ready");

  await page.evaluate(() => {
    document.body.classList.remove("data-policy-gate-open");
    document.getElementById("data-policy-modal")?.classList.add("hidden");
    const noopWrite = async () => {};
    window.writeAwaitServer = noopWrite;
    window.writeAwaitServerCreate = noopWrite;
    window.writeAwaitServerEdit = noopWrite;
    if (window.AntaresPortalSync) {
      window.AntaresPortalSync.flushStorageKeyNow = noopWrite;
    }
    if (window.AntaresValidation) {
      window.AntaresValidation.validateDomForm = () => ({ ok: true, patch: {}, firstInvalid: null });
    }
  });
  log("stubs ok");

  await page.evaluate(() => {
    window.location.hash = "#portal/hiring";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.waitForTimeout(600);
  log("hash hiring");

  await page.evaluate(() => {
    document
      .querySelector("[data-action='hr-workspace-tab'][data-module='hiring'][data-tab='operate']")
      ?.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.querySelector("[data-action='hiring-operate-section'][data-section='candidate']")?.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const panel = document.querySelector('[data-create-panel="create-candidate"]');
    if (panel && (panel.classList.contains("hidden") || panel.hasAttribute("hidden"))) {
      document
        .querySelector("[data-action='toggle-create-panel'][data-panel='create-candidate']")
        ?.click();
    }
  });
  await page.waitForSelector("#form-candidate", { state: "attached", timeout: 10000 });
  log("form attached");

  const probe = await page.evaluate(() => ({
    hasForm: Boolean(document.querySelector("#form-candidate")),
    hasSync: Boolean(window.AntaresPortalSync),
    flushType: typeof window.AntaresPortalSync?.flushStorageKeyNow,
    apiBase: window.AntaresApi?.getBase?.() || null,
    configured: window.AntaresApi?.isConfigured?.() || false
  }));
  log(`probe ${JSON.stringify(probe)}`);

  await page.evaluate(() => {
    const form = document.querySelector("#form-candidate");
    if (form) form.__antaresDupDocCheck = async () => true;
  });

  const form = page.locator("#form-candidate");
  log("fill start");
  await form.locator('input[name="name"]').fill("Nuevo Candidato QA");
  await form.locator('input[name="email"]').fill("nuevo.candidato@test.com");
  await form.locator('input[name="phone"]').fill("3009990001");
  await form.locator('select[name="documentType"]').selectOption("CC");
  await form.locator('input[name="idDoc"]').fill("6655443322");
  await form.locator('input[name="birthDate"]').fill("1994-01-15");
  await form.locator('select[name="department"]').selectOption("Bogota");
  log("wait city");
  await page.waitForFunction(() => {
    const city = document.querySelector("#form-candidate select[name='city']");
    return city && [...city.options].some((opt) => String(opt.value || "") === "Bogota D.C.");
  }, null, { timeout: 15000 });
  await form.locator('select[name="city"]').selectOption("Bogota D.C.");
  await form.locator('input[name="address"]').fill("Calle 12 # 12-12");
  log("step1 filled");

  log("click next via evaluate");
  const nextInfo = await page.evaluate(async () => {
    const formEl = document.querySelector("#form-candidate");
    formEl.__antaresDupDocCheck = async () => true;
    const next = formEl.querySelector("[data-hr-wizard-next]");
    next.click();
    await new Promise((r) => setTimeout(r, 100));
    return {
      step: formEl.querySelector(".hr-form-step.is-active")?.dataset?.stepIndex,
      hasEducation: Boolean(formEl.querySelector('.hr-form-step.is-active select[name="educationLevel"]'))
    };
  });
  log(`nextInfo ${JSON.stringify(nextInfo)}`);
  expect(nextInfo.hasEducation).toBeTruthy();

  await form.locator('select[name="educationLevel"]').selectOption("Profesional");
  await form.locator('input[name="experienceYears"]').fill("5");
  await form.locator('input[name="expectedSalary"]').fill("2500000");
  await form.locator('input[name="availabilityDate"]').fill(ymd(plusDays(30)));
  await form.locator('select[name="vacancyId"]').selectOption("vac-1");
  log("step2 filled");

  log("submit evaluate");
  const submitInfo = await page.evaluate(async () => {
    const formEl = document.querySelector("#form-candidate");
    formEl.__antaresDupDocCheck = async () => true;
    const readRows = () =>
      window.AntaresPersistence?.read
        ? window.AntaresPersistence.read("antares_candidates_v2", [])
        : JSON.parse(localStorage.getItem("antares_candidates_v2") || "[]");
    const before = readRows().length;
    formEl.requestSubmit();
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 200));
      const rows = readRows();
      if (rows.length > before) {
        return { ok: true, email: rows.find((r) => r.email === "nuevo.candidato@test.com")?.email || rows[0]?.email };
      }
    }
    return {
      ok: false,
      before,
      len: readRows().length,
      submitting: formEl.dataset.submitting || "",
      fieldErrors: [...formEl.querySelectorAll(".field-error, .is-invalid")].map((el) => el.textContent || el.name)
    };
  });
  log(`submitInfo ${JSON.stringify(submitInfo)}`);
  expect(submitInfo.ok).toBeTruthy();
});
