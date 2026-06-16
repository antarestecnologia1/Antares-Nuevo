/**
 * Validación paso a paso: creación de empleado (payload + formulario wizard).
 * Ejecutar: node scripts/validate-employee-creation.mjs
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const KEYS = { payrollEmployees: "antares_payroll_employees_v2", positions: "antares_positions_v2" };

function plusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function minusYears(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d.toISOString().slice(0, 10);
}

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
  antares_positions_v2: [
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
      createdAt: new Date().toISOString()
    },
    {
      id: "pos-conductor",
      name: "CONDUCTOR",
      workerRole: "empleado",
      baseSalary: 2500000,
      contractTypeDefault: "Termino fijo",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel IV",
      integralSalary: false,
      legalBasis: "CST",
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "pos-integral",
      name: "Gerente integral",
      workerRole: "empleado",
      baseSalary: 52000000,
      contractTypeDefault: "Termino indefinido",
      workSchedule: "Diurna",
      arlRiskLevel: "Nivel I",
      integralSalary: true,
      legalBasis: "CST",
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "pos-inactivo",
      name: "Cargo inactivo",
      workerRole: "empleado",
      baseSalary: 2200000,
      contractTypeDefault: "Termino indefinido",
      active: false,
      createdAt: new Date().toISOString()
    }
  ],
  antares_payroll_employees_v2: [
    {
      id: "emp-existente",
      name: "Empleado Existente",
      idDoc: "1234567890",
      documentType: "CC",
      companyId: "co-antares"
    }
  ],
  antares_session_v2: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now(),
    profileSnapshot: { id: "admin-1", name: "Admin QA", role: "admin" }
  }
};

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function ensureServer() {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
    if (res.ok) return null;
  } catch {
    /* start server */
  }
  const child = spawn("node", ["scripts/portal-static-server.mjs"], {
    cwd: ROOT,
    stdio: "ignore",
    detached: true
  });
  child.unref();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return child;
    } catch {
      /* retry */
    }
  }
  throw new Error("No se pudo iniciar portal-static-server");
}

function baseRaw(overrides = {}) {
  return {
    name: "Juan Pérez Validación",
    documentType: "CC",
    idDoc: "9876543210",
    birthDate: minusYears(30),
    bloodType: "O+",
    hasIllness: "no",
    department: "Bogota",
    city: "Bogota D.C.",
    address: "Calle 10 # 20-30",
    phone: "3001234567",
    emergencyContact: "María Pérez",
    emergencyPhone: "3007654321",
    companyId: "co-antares",
    positionId: "pos-analista",
    contractType: "Termino indefinido",
    startDate: plusDays(-10),
    baseSalary: "2300000",
    transportAllowance: "162000",
    contractTemplateKind: "oficina",
    eps: "Sura",
    pensionFund: "Porvenir",
    arl: "Sura",
    bankName: "Bancolombia",
    bankAccount: "1234567890",
    ...overrides
  };
}

async function openEmployeeForm(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("#portal-app", { timeout: 15000 });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    window.state.payrollUi = { ...(window.state.payrollUi || {}), workspace: "operate", operateSection: "employee" };
    window.state.createPanels = { ...(window.state.createPanels || {}), "create-employee": true };
    window.state.currentView = "payroll";
    window.renderPortalView();
  });
  await page.waitForSelector("#form-employee", { timeout: 8000 });
}

async function fillForm(page, pairs) {
  await page.evaluate(({ entries }) => {
    const form = document.querySelector("#form-employee");
    if (!form) throw new Error("form-employee no encontrado");
    for (const [key, value] of entries) {
      const field = form.querySelector(`[name="${key}"]`);
      if (!field) throw new Error(`Campo no encontrado: ${key}`);
      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value == null ? "" : String(value);
      }
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, { entries: pairs });
}

async function goToLastWizardStep(page) {
  await page.evaluate(() => {
    const form = document.querySelector("#form-employee");
    const wizard = form?.querySelector("[data-hr-wizard]");
    const steps = [...wizard.querySelectorAll(".hr-form-step")];
    const last = steps.length - 1;
    steps.forEach((s, i) => {
      const on = i === last;
      s.classList.toggle("is-active", on);
      s.classList.toggle("hidden", !on);
    });
    const submit = wizard?.querySelector(".hr-form-wizard-submit");
    if (submit) {
      submit.disabled = false;
      submit.removeAttribute("aria-disabled");
    }
    wizard?.querySelectorAll("[data-hr-wizard-submit-sync]").forEach((btn) => {
      btn.disabled = false;
      btn.removeAttribute("aria-disabled");
    });
  });
}

async function submitEmployeeForm(page) {
  await goToLastWizardStep(page);
  await page.evaluate(() => {
    document.querySelector("#form-employee")?.requestSubmit();
  });
  await page.waitForTimeout(600);
}

async function employeeCount(page) {
  return page.evaluate((key) => {
    const rows = window.AntaresPersistence?.read
      ? window.AntaresPersistence.read(key, [])
      : JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(rows) ? rows.length : 0;
  }, KEYS.payrollEmployees);
}

async function lastFieldError(page) {
  return page.evaluate(() => {
    const err = document.querySelector("#form-employee .field-error, #form-employee [aria-invalid='true']");
    const toast = [...document.querySelectorAll("#toast-container .toast")]
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .at(-1);
    return {
      field: err?.getAttribute("name") || err?.id || "",
      message: err?.closest("label")?.querySelector(".field-error")?.textContent?.trim() || toast || ""
    };
  });
}

async function runPayloadTests(page) {
  const payloadCtx = {
    base: baseRaw(),
    birthMinor: minusYears(16),
    licenseFuture: plusDays(365),
    examDate: "2025-06-01"
  };
  const payloadResults = await page.evaluate((ctx) => {
    const out = [];
    const doc = (type, val) => window.validateColombianDocument(type, val);
    const build = (raw, norm) => window.buildPayrollEmployeePayloadFromWizard(raw, norm, {});
    const merge = (overrides) => ({ ...ctx.base, ...overrides });

    const cases = [
      {
        name: "CC válida normaliza dígitos",
        fn: () => {
          const r = doc("CC", "1.234.567");
          return { ok: r.ok && r.normalized === "1234567" };
        }
      },
      {
        name: "CC inválida (5 dígitos)",
        fn: () => {
          const r = doc("CC", "12345");
          return { ok: !r.ok };
        }
      },
      {
        name: "Payload empleado oficina válido",
        fn: () => {
          const raw = merge({});
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return {
            ok: p.ok && p.payload.workerRole === "empleado" && p.payload.baseSalary >= 2200000,
            detail: p.ok ? "" : p.msg
          };
        }
      },
      {
        name: "Salario bajo SMMLV rechazado",
        fn: () => {
          const raw = merge({ baseSalary: "100000" });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return { ok: !p.ok && p.field === "baseSalary", detail: p.msg };
        }
      },
      {
        name: "Menor de 18 rechazado",
        fn: () => {
          const raw = merge({ birthDate: ctx.birthMinor });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return { ok: !p.ok && p.field === "birthDate", detail: p.msg };
        }
      },
      {
        name: "Cargo inactivo rechazado",
        fn: () => {
          const raw = merge({ positionId: "pos-inactivo" });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return { ok: !p.ok && p.field === "positionId", detail: p.msg };
        }
      },
      {
        name: "Conductor por nombre de cargo",
        fn: () => {
          const raw = merge({
            positionId: "pos-conductor",
            contractType: "Termino fijo",
            contractDurationUnit: "anios",
            contractDurationAmount: "1",
            license: "LIC123",
            licenseCategory: "C2",
            licenseExpiry: ctx.licenseFuture
          });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return {
            ok: p.ok && p.payload.workerRole === "conductor" && p.payload.contractDuration === "1 año",
            detail: p.ok ? `role=${p.payload.workerRole}` : p.msg
          };
        }
      },
      {
        name: "Término fijo sin duración usa default 1 año",
        fn: () => {
          const raw = merge({
            positionId: "pos-conductor",
            contractType: "Termino fijo",
            contractDurationUnit: "",
            contractDurationAmount: ""
          });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return {
            ok: p.ok && p.payload.contractDuration === "1 año",
            detail: p.ok ? p.payload.contractDuration : p.msg
          };
        }
      },
      {
        name: "Prestación servicios requiere duración explícita",
        fn: () => {
          const raw = merge({
            contractType: "Prestacion de servicios",
            contractDurationUnit: "",
            contractDurationAmount: ""
          });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return { ok: !p.ok && p.field === "contractDurationUnit", detail: p.msg };
        }
      },
      {
        name: "Salario integral bajo piso rechazado",
        fn: () => {
          const raw = merge({ positionId: "pos-integral", baseSalary: "3000000" });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return { ok: !p.ok && p.field === "baseSalary", detail: p.msg };
        }
      },
      {
        name: "hasIllness si normaliza a 'si'",
        fn: () => {
          const raw = merge({ hasIllness: "si", illnessDescription: "Asma leve" });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return { ok: p.ok && p.payload.hasIllness === "si" };
        }
      },
      {
        name: "Fechas ocupacional/instruvial +1 año vigencia",
        fn: () => {
          const raw = merge({
            occupationalExamDate: ctx.examDate,
            instruvialExamDate: ctx.examDate
          });
          const d = doc(raw.documentType, raw.idDoc);
          const p = build(raw, d.normalized);
          return {
            ok:
              p.ok &&
              p.payload.occupationalExamExpiry === "2026-06-01" &&
              p.payload.instruvialExamExpiry === "2026-06-01",
            detail: p.ok ? `occ=${p.payload.occupationalExamExpiry}` : p.msg
          };
        }
      },
      {
        name: "firstEmployeeContractDocFieldFromMissing mapea EPS",
        fn: () => {
          const f = window.firstEmployeeContractDocFieldFromMissing(["EPS", "banco"]);
          return { ok: f === "eps", detail: f };
        }
      }
    ];

    for (const c of cases) {
      try {
        const r = c.fn();
        out.push({ name: c.name, ...r });
      } catch (err) {
        out.push({ name: c.name, ok: false, detail: String(err?.message || err) });
      }
    }
    return out;
  }, payloadCtx);

  for (const r of payloadResults) {
    record(`Payload: ${r.name}`, r.ok, r.detail || "");
  }
}

async function runFormTests(page) {
  const scenarios = [
    {
      name: "E2E: empleado oficina término indefinido",
      doc: "1112223334",
      fields: baseRaw({ idDoc: "1112223334" }),
      expectCreate: true
    },
    {
      name: "E2E: conductor con licencia vigente",
      doc: "2223334445",
      fields: baseRaw({
        idDoc: "2223334445",
        positionId: "pos-conductor",
        contractType: "Termino fijo",
        contractDurationUnit: "anios",
        contractDurationAmount: "2",
        contractVigenteStartDate: plusDays(-5),
        license: "C2-998877",
        licenseCategory: "C2",
        licenseExpiry: plusDays(200),
        instruvialExamDate: plusDays(-30),
        defensiveCourse: "vigente",
        defensiveCourseExpiry: plusDays(100),
        comparendos: "0",
        experienceYears: "5"
      }),
      expectCreate: true,
      afterFill: async (pg) => {
        const vis = await pg.evaluate(() => {
          const block = document.querySelector("#hr-conductor-fields");
          return {
            hidden: block?.classList.contains("hidden") || block?.hasAttribute("hidden"),
            licenseRequired: document.querySelector("[name='license']")?.required
          };
        });
        record("UI: bloque conductor visible para cargo CONDUCTOR", !vis.hidden, JSON.stringify(vis));
        record("UI: licencia requerida en conductor", Boolean(vis.licenseRequired));
      }
    },
    {
      name: "E2E: CC inválida bloquea guardado",
      doc: "123",
      fields: baseRaw({ idDoc: "123" }),
      expectCreate: false,
      expectField: "idDoc"
    },
    {
      name: "E2E: documento duplicado bloquea guardado",
      doc: "1234567890",
      fields: baseRaw({ idDoc: "1234567890" }),
      expectCreate: false
    },
    {
      name: "E2E: conductor sin licencia bloquea guardado",
      doc: "3334445556",
      fields: baseRaw({
        idDoc: "3334445556",
        positionId: "pos-conductor",
        contractType: "Termino fijo",
        contractDurationUnit: "anios",
        contractDurationAmount: "1",
        license: "",
        licenseCategory: "",
        licenseExpiry: ""
      }),
      expectCreate: false,
      expectField: "license"
    },
    {
      name: "E2E: enfermedad sí sin descripción (paso 1 HTML5)",
      doc: "4445556667",
      fields: baseRaw({ idDoc: "4445556667", hasIllness: "si", illnessDescription: "" }),
      expectCreate: false
    },
    {
      name: "E2E: prestación servicios con duración en meses",
      doc: "5556667778",
      fields: baseRaw({
        idDoc: "5556667778",
        contractType: "Prestacion de servicios",
        contractDurationUnit: "meses",
        contractDurationAmount: "6"
      }),
      expectCreate: true
    }
  ];

  for (const sc of scenarios) {
    await openEmployeeForm(page);
    const before = await employeeCount(page);
    try {
      await fillForm(page, Object.entries(sc.fields));
      if (sc.afterFill) await sc.afterFill(page);
      await submitEmployeeForm(page);
      const after = await employeeCount(page);
      const created = after > before;
      const err = await lastFieldError(page);
      const ok = sc.expectCreate ? created : !created;
      let detail = sc.expectCreate
        ? created
          ? `empleados ${before}→${after}`
          : `no creó. Error: ${err.message || err.field}`
        : created
          ? "creó cuando debía fallar"
          : `rechazado OK (${err.field || "validación"}: ${err.message || "—"})`;
      if (!sc.expectCreate && sc.expectField && err.field && !String(err.field).includes(sc.expectField)) {
        detail += ` [campo esperado: ${sc.expectField}]`;
      }
      record(sc.name, ok, detail);
    } catch (err) {
      record(sc.name, false, String(err?.message || err));
    }
  }
}

async function runStepConsistencyTests(page) {
  await openEmployeeForm(page);
  const stepReport = await page.evaluate(() => {
    const form = document.querySelector("#form-employee");
    const steps = [...form.querySelectorAll(".hr-form-step")];
    const names = [
      "name",
      "documentType",
      "idDoc",
      "department",
      "companyId",
      "positionId",
      "eps",
      "bankName",
      "license"
    ];
    const found = {};
    for (const n of names) {
      const el = form.querySelector(`[name="${n}"]`);
      found[n] = el
        ? { step: el.closest(".hr-form-step")?.dataset?.stepIndex ?? "?", type: el.type || el.tagName }
        : null;
    }
    return { stepCount: steps.length, fields: found };
  });
  record("Wizard: 6 pasos configurados", stepReport.stepCount === 6, `count=${stepReport.stepCount}`);
  const expectedSteps = {
    name: "0",
    documentType: "0",
    idDoc: "0",
    department: "1",
    companyId: "2",
    positionId: "2",
    eps: "3",
    bankName: "4",
    license: "5"
  };
  let mappingOk = true;
  for (const [field, step] of Object.entries(expectedSteps)) {
    const actual = stepReport.fields[field]?.step;
    if (actual !== step) {
      mappingOk = false;
      record(`Campo ${field} en paso ${step}`, false, `actual paso ${actual}`);
    }
  }
  if (mappingOk) record("Campos distribuidos en pasos correctos", true);
}

async function main() {
  console.log("=== Validación creación de empleado ===\n");
  await ensureServer();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript((payload) => {
    const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
    localStorage.clear();
    Object.entries(payload).forEach(([key, value]) => {
      localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
    });
  }, seedStore);

  const page = await context.newPage();
  page.on("pageerror", (e) => console.error("[pageerror]", e.message.slice(0, 180)));

  try {
    await openEmployeeForm(page);
    await runPayloadTests(page);
    await runStepConsistencyTests(page);
    await runFormTests(page);
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Resumen: ${passed}/${results.length} OK ===`);
  if (failed.length) {
    console.log("\nFallos:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail || "sin detalle"}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
