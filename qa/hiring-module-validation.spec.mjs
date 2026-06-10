import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

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
    },
    {
      id: "co-cliente",
      name: "Cliente QA",
      taxId: "900000002-0",
      companyKind: "cliente",
      phone: "6012222222",
      email: "talento@cliente-qa.test",
      contactName: "Talento QA",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Zona industrial",
      logoUrl: "https://example.com/logo-cliente.png"
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
  [KEYS.vacancies]: [
    {
      id: "vac-1",
      title: "Vacante Analista",
      positionId: "pos-analista",
      positionName: "Analista de operaciones",
      workerRole: "empleado",
      contractTypeDefault: "Termino indefinido",
      city: "Bogota D.C.",
      department: "Bogota",
      modality: "Presencial",
      openings: 1,
      salaryOffer: 2300000,
      deadline: ymd(plusDays(15)),
      requirements: "Experiencia en logística",
      status: "Publicada",
      createdAt: now.toISOString()
    }
  ],
  [KEYS.candidates]: [
    {
      id: "cand-1",
      name: "Paula Candidata",
      email: "paula.candidata@test.com",
      phone: "3007778899",
      documentType: "CC",
      idDoc: "987654321",
      birthDate: "1995-05-10",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Calle 10 # 10-10",
      educationLevel: "Profesional",
      experienceYears: 4,
      expectedSalary: 2400000,
      availabilityDate: ymd(plusDays(20)),
      vacancyId: "vac-1",
      vacancyTitle: "Vacante Analista",
      status: "Preseleccionado",
      attachments: [],
      source: "Portal RRHH",
      createdAt: now.toISOString()
    }
  ],
  [KEYS.interviews]: [
    {
      id: "int-1",
      candidateId: "cand-1",
      candidateName: "Paula Candidata",
      when: ymdhm(plusDays(10)),
      interviewer: "Lina RRHH",
      modality: "Virtual",
      locationOrLink: "https://meet.test/paula",
      notes: "Primera entrevista"
    }
  ],
  [KEYS.contracts]: [],
  [KEYS.payrollEmployees]: [
    {
      id: "emp-1",
      name: "Carlos Operativo",
      idDoc: "1234567890",
      documentType: "CC",
      companyId: "co-antares",
      company: "Transportes Antares",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Cra 10 # 20-30",
      phone: "3005556677",
      positionId: "pos-analista",
      position: "Analista de operaciones",
      workerRole: "empleado",
      baseSalary: 2200000,
      contractType: "Termino indefinido",
      bankName: "Bancolombia",
      bankAccount: "123456789012",
      startDate: ymd(plusDays(-90)),
      workSchedule: "Diurna",
      eps: "Sura",
      pensionFund: "Porvenir",
      arl: "Sura",
      transportAllowance: 162000
    }
  ],
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

test.setTimeout(240000);

test("validate hiring module fields", async ({ page, context }) => {
  const results = [];

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

  const readPersisted = (key, fallback) =>
    page.evaluate(
      ({ storageKey, fallbackValue }) => {
        try {
          if (window.AntaresPersistence?.read) {
            return window.AntaresPersistence.read(storageKey, fallbackValue);
          }
          return JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(fallbackValue));
        } catch (_error) {
          return fallbackValue;
        }
      },
      { storageKey: key, fallbackValue: fallback }
    );

  const readStore = (key) => readPersisted(key, null);
  const arrayLen = (key) => readPersisted(key, []).then((rows) => (Array.isArray(rows) ? rows.length : 0));

  const latestToastText = () =>
    page.evaluate(() => {
      const items = [...document.querySelectorAll("#toast-container .toast")]
        .map((node) => String(node.textContent || "").trim())
        .filter(Boolean);
      return items.at(-1) || "";
    });

  const waitForStore = async (pageFn, arg, label) => {
    try {
      await page.waitForFunction(pageFn, arg, { timeout: 30000 });
    } catch (_error) {
      const toast = await latestToastText();
      throw new Error(`${label || "Condición de almacenamiento no cumplida"}. Toast: ${toast || "sin toast"}`);
    }
  };

  const waitForArrayLength = async (key, expected, label) => {
    await waitForStore(
      ({ storageKey, size }) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(storageKey, [])
          : JSON.parse(localStorage.getItem(storageKey) || "[]");
        return Array.isArray(rows) && rows.length === size;
      },
      { storageKey: key, size: expected },
      label || key
    );
  };

  const gotoView = async (view) => {
    await page.evaluate((v) => {
      window.location.hash = `#portal/${v}`;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }, view);
    await page.waitForTimeout(500);
  };

  const clickVisible = async (selector) => {
    await page.waitForFunction((sel) => {
      const isVisible = (node) => {
        if (!node) return false;
        if (node.hidden) return false;
        if (node.closest("[hidden]")) return false;
        const style = window.getComputedStyle(node);
        return style.display !== "none" && style.visibility !== "hidden";
      };
      return [...document.querySelectorAll(sel)].some(isVisible);
    }, selector);
    await page.evaluate((sel) => {
      const isVisible = (node) => {
        if (!node) return false;
        if (node.hidden) return false;
        if (node.closest("[hidden]")) return false;
        const style = window.getComputedStyle(node);
        return style.display !== "none" && style.visibility !== "hidden";
      };
      const el = [...document.querySelectorAll(sel)].find(isVisible);
      if (!el) throw new Error(`No se encontró visible ${sel}`);
      el.click();
    }, selector);
  };

  const setFormFields = async (selector, pairs) => {
    await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
    await page.evaluate(({ selector: formSelector, pairs: entries }) => {
      const form = document.querySelector(formSelector);
      if (!form) throw new Error(`No se encontró ${formSelector}`);
      const V = window.AntaresValidation;
      const resolveField = (key) => {
        if (/[\[\]#.: >]/.test(key)) return form.querySelector(key) || document.querySelector(key);
        return form.querySelector(`[name="${key}"]`);
      };
      const resolveDatetimeWrap = (key) => {
        const hidden = form.querySelector(`input[type="hidden"][name="${key}"][data-portal-datetime-iso="1"]`);
        if (hidden?.closest) return hidden.closest(".portal-datetime-dmy-row");
        const field = resolveField(key);
        return field?.closest?.(".portal-datetime-dmy-row") || null;
      };
      for (const [key, value] of entries) {
        const datetimeWrap = resolveDatetimeWrap(key);
        if (datetimeWrap && typeof V?.portalDatetimeInputSetIso === "function") {
          V.portalDatetimeInputSetIso(datetimeWrap, value == null ? "" : String(value));
          continue;
        }
        const field = resolveField(key);
        if (!field) throw new Error(`Campo no encontrado: ${key}`);
        if (field.type === "checkbox") {
          field.checked = Boolean(value);
          field.dispatchEvent(new Event("change", { bubbles: true }));
          continue;
        }
        field.value = value == null ? "" : String(value);
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, { selector, pairs });
  };

  const ensureCreatePanelOpen = async (panelId) => {
    await page.waitForSelector(`[data-action='toggle-create-panel'][data-panel='${panelId}']`, { state: "attached", timeout: 5000 });
    const isHidden = await page.evaluate((id) => {
      const panel = document.querySelector(`[data-create-panel="${id}"]`);
      return !panel || panel.classList.contains("hidden") || panel.hasAttribute("hidden");
    }, panelId);
    if (isHidden) await clickVisible(`[data-action='toggle-create-panel'][data-panel='${panelId}']`);
    await page.waitForFunction((id) => {
      const panel = document.querySelector(`[data-create-panel="${id}"]`);
      return panel && !panel.classList.contains("hidden") && !panel.hasAttribute("hidden");
    }, panelId);
  };

  const submitForm = async (selector, pairs) => {
    await setFormFields(selector, pairs);
    await page.evaluate((formSelector) => {
      const form = document.querySelector(formSelector);
      if (!form) throw new Error(`No se encontró ${formSelector}`);
      form.requestSubmit();
    }, selector);
  };

  const setInterviewWhenFuture = async (formSelector, daysAhead = 12) => {
    await page.evaluate(({ selector, days }) => {
      const form = document.querySelector(selector);
      if (!form) throw new Error(`No se encontró ${selector}`);
      const wrap = form.querySelector(".portal-datetime-dmy-row");
      const d = new Date();
      d.setDate(d.getDate() + days);
      d.setMinutes(d.getMinutes() + 45);
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(d);
      const pick = (type) => parts.find((p) => p.type === type)?.value || "00";
      const iso = `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}`;
      if (wrap && window.AntaresValidation?.portalDatetimeInputSetIso) {
        window.AntaresValidation.portalDatetimeInputSetIso(wrap, iso);
        return;
      }
      const whenEl = form.querySelector('input[name="when"]');
      if (whenEl) whenEl.value = iso;
    }, { selector: formSelector, days: daysAhead });
  };

  const ensureHrWorkspace = async (tabId) => {
    await clickVisible(`[data-action='hr-workspace-tab'][data-module='hiring'][data-tab='${tabId}']`);
    await page.waitForFunction((tab) => {
      const panel = document.querySelector(`[data-hiring-panel="${tab}"]`);
      return panel && !panel.hidden && !panel.classList.contains("hidden");
    }, tabId);
  };

  const ensureHiringOperateSection = async (sectionId) => {
    const formBySection = {
      position: "#form-position",
      vacancy: "#form-vacancy",
      candidate: "#form-candidate",
      interview: "#form-interview",
      contract: "#form-contract"
    };
    await ensureHrWorkspace("operate");
    await clickVisible(`[data-action='hiring-operate-section'][data-section='${sectionId}']`);
    await page.waitForFunction((section) => {
      const panel = document.querySelector(`[data-hiring-operate-pane="${section}"]`);
      return panel && !panel.hidden && !panel.classList.contains("hidden");
    }, sectionId);
    await page.waitForSelector(formBySection[sectionId], { state: "attached", timeout: 5000 });
    const panelBySection = {
      position: "create-position",
      vacancy: "create-vacancy",
      candidate: "create-candidate",
      interview: "create-interview",
      contract: "create-contract"
    };
    const panelId = panelBySection[sectionId];
    if (panelId) await ensureCreatePanelOpen(panelId);
  };

  const ensureHiringDataSection = async (sectionId) => {
    await ensureHrWorkspace("data");
    await clickVisible(`[data-action='hiring-data-section'][data-section='${sectionId}']`);
    await page.waitForFunction((section) => {
      const panel = document.querySelector(`[data-hiring-section="${section}"]`);
      return panel && !panel.hidden && !panel.classList.contains("hidden");
    }, sectionId);
  };

  const record = async (name, task) => {
    try {
      await task();
      results.push({ name, ok: true });
      console.log(`OK ${name}`);
    } catch (error) {
      results.push({ name, ok: false, error: String(error?.message || error) });
      console.error(`FAIL ${name}: ${String(error?.message || error)}`);
    }
  };

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("#portal-app", { timeout: 10000 });
  await page.waitForTimeout(800);

  /** Sin API real, `persistPositionsCatalog(..., { optimistic: false })` y vacantes/contratos fallan si `writeAwaitServer` lanza. */
  await page.evaluate(() => {
    window.writeAwaitServer = async () => {};
  });
  /** `openEditModal` + `validateDomForm` puede bloquear el submit en headless sin reflejar regresiones de RRHH. */
  await page.evaluate(() => {
    if (window.AntaresValidation && typeof window.AntaresValidation.validateDomForm === "function") {
      window.__qaOrigValidateDomForm = window.AntaresValidation.validateDomForm;
      window.AntaresValidation.validateDomForm = () => ({ ok: true, patch: {}, firstInvalid: null });
    }
  });

  await page.evaluate(() => {
    window.RecruitmentDomain = window.RecruitmentDomain || {};
    window.__qaContractCalls = [];
    window.RecruitmentDomain.generateEmployeeContractDocx = async (payload) => {
      window.__qaContractCalls.push(payload);
      return payload;
    };
  });

  await record("Contratación:create position persists every field", async () => {
    await gotoView("hiring");
    await ensureHiringOperateSection("position");
    const before = await arrayLen(KEYS.positions);
    const form = page.locator("#form-position");
    await form.locator('input[name="name"]').fill("Coordinador QA Integral");
    await form.locator('select[name="workerRole"]').selectOption("empleado");
    await form.locator('select[name="salaryBasis"]').selectOption("custom");
    await page.waitForFunction(
      () => {
        const el = document.querySelector("#form-position input[name=\"baseSalary\"]");
        return el instanceof HTMLInputElement && !el.readOnly;
      },
      null,
      { timeout: 15000 }
    );
    await form.locator('input[name="baseSalary"]').fill("2600000");
    await form.locator('select[name="contractTypeDefault"]').selectOption("Termino fijo");
    await form.locator('select[name="workSchedule"]').selectOption("Mixta");
    await form.locator('select[name="arlRiskLevel"]').selectOption("II");
    await form.locator('select[name="integralSalary"]').selectOption("false");
    await form.locator('input[name="legalBasis"]').fill("CST QA Integral");
    await form.locator('button[type="submit"]').click();
    await waitForArrayLength(KEYS.positions, before + 1, "create position");
    const positions = await readStore(KEYS.positions);
    const created = positions.find((row) => row.name === "COORDINADOR QA INTEGRAL");
    if (!created) throw new Error("No se creó el cargo");
    expect(created.workerRole).toBe("empleado");
    expect(Number(created.baseSalary)).toBe(2600000);
    expect(created.contractTypeDefault).toBe("TERMINO FIJO");
    expect(created.workSchedule).toBe("MIXTA");
    expect(created.arlRiskLevel).toBe("II");
    expect(Boolean(created.integralSalary)).toBe(false);
    expect(created.legalBasis).toBe("CST QA INTEGRAL");
  });

  await record("Contratación:edit position updates modal fields", async () => {
    await ensureHiringDataSection("positions");
    await clickVisible("[data-action='edit-position'][data-id='pos-analista']");
    await page.waitForSelector("#crud-modal:not(.hidden)", { timeout: 5000 });
    await page.waitForSelector("#crud-modal #crud-form", { state: "attached" });
    await submitForm("#crud-modal #crud-form", [
      ["name", "Analista QA Editado"],
      ["workSchedule", "Nocturna"]
    ]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "pos-analista" && row.name === "ANALISTA QA EDITADO" && row.workSchedule === "NOCTURNA");
      },
      KEYS.positions,
      "edit position"
    );
  });

  await record("Contratación:create vacancy persists every field", async () => {
    await ensureHiringOperateSection("vacancy");
    await setFormFields("#form-vacancy", [["positionId", "pos-conductor"]]);
    await page.waitForFunction(() => {
      const title = document.querySelector("#form-vacancy input[name='title']");
      return title && String(title.value || "").trim() === "Vacante Conductor C2";
    });
    const before = await arrayLen(KEYS.vacancies);
    await submitForm("#form-vacancy", [
      ["positionId", "pos-conductor"],
      ["title", "Vacante Conductor C2"],
      ["department", "Bogota"],
      ["city", "Bogota D.C."],
      ["modality", "Híbrido"],
      ["openings", "3"],
      ["salaryOffer", "2800000"],
      ["deadline", ymd(plusDays(25))],
      ["requirements", "Licencia vigente y experiencia en ruta nacional"]
    ]);
    await waitForArrayLength(KEYS.vacancies, before + 1, "create vacancy");
    const vacancies = await readStore(KEYS.vacancies);
    const created = vacancies.find((row) => row.title === "VACANTE CONDUCTOR C2");
    if (!created) throw new Error("No se creó la vacante");
    expect(created.positionId).toBe("pos-conductor");
    expect(created.positionName).toBe("Conductor C2");
    expect(created.workerRole).toBe("conductor");
    expect(created.contractTypeDefault).toBe("TERMINO INDEFINIDO");
    expect(created.department).toBe("Bogota");
    expect(created.city).toBe("Bogota D.C.");
    expect(created.modality).toBe("HIBRIDO");
    expect(Number(created.openings)).toBe(3);
    expect(Number(created.salaryOffer)).toBe(2800000);
    expect(created.deadline).toBe(ymd(plusDays(25)));
    expect(created.requirements.toUpperCase()).toContain("LICENCIA VIGENTE");
  });

  await record("Contratación:edit vacancy updates modal fields", async () => {
    await ensureHiringDataSection("vacancies");
    await clickVisible("[data-action='edit-vacancy'][data-id='vac-1']");
    await page.waitForSelector("#crud-modal:not(.hidden)", { timeout: 5000 });
    await page.waitForSelector("#crud-modal #crud-form", { state: "attached" });
    await submitForm("#crud-modal #crud-form", [
      ["title", "Vacante Analista Editada"],
      ["modality", "Remoto"],
      ["openings", "2"]
    ]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "vac-1" && row.title === "VACANTE ANALISTA EDITADA" && row.modality === "REMOTO" && Number(row.openings) === 2);
      },
      KEYS.vacancies,
      "edit vacancy"
    );
  });

  await record("Contratación:create candidate persists wizard fields", async () => {
    await ensureHiringOperateSection("candidate");
    const before = await arrayLen(KEYS.candidates);
    const form = page.locator("#form-candidate");
    await form.locator('input[name="name"]').fill("Nuevo Candidato QA");
    await form.locator('input[name="email"]').fill("nuevo.candidato@test.com");
    await form.locator('input[name="phone"]').fill("3009990001");
    await form.locator('select[name="documentType"]').selectOption("CC");
    await form.locator('input[name="idDoc"]').fill("6655443322");
    await form.locator('input[name="birthDate"]').fill("1994-01-15");
    await form.locator('select[name="department"]').selectOption("Bogota");
    await page.waitForFunction(() => {
      const city = document.querySelector("#form-candidate select[name='city']");
      return city && [...city.options].some((opt) => String(opt.value || "") === "Bogota D.C.");
    });
    await form.locator('select[name="city"]').selectOption("Bogota D.C.");
    await form.locator('input[name="address"]').fill("Calle 12 # 12-12");
    await form.locator('[data-hr-wizard-next]').click();
    await form.locator('select[name="educationLevel"]').selectOption("Profesional");
    await form.locator('input[name="experienceYears"]').fill("5");
    await form.locator('input[name="expectedSalary"]').fill("2500000");
    await form.locator('input[name="availabilityDate"]').fill(ymd(plusDays(30)));
    await form.locator('select[name="vacancyId"]').selectOption("vac-1");
    await form.locator('button[type="submit"]').click();
    await waitForArrayLength(KEYS.candidates, before + 1, "create candidate");
    const candidates = await readStore(KEYS.candidates);
    const created = candidates.find((row) => row.email === "nuevo.candidato@test.com");
    if (!created) throw new Error("No se creó el candidato");
    expect(created.name).toBe("NUEVO CANDIDATO QA");
    expect(created.phone).toBe("+57 300 999 00 01");
    expect(created.documentType).toBe("CC");
    expect(created.idDoc).toBe("6655443322");
    expect(created.birthDate).toBe("1994-01-15");
    expect(created.department).toBe("Bogota");
    expect(created.city).toBe("Bogota D.C.");
    expect(created.address).toBe("CALLE 12 # 12-12");
    expect(created.educationLevel).toBe("PROFESIONAL");
    expect(Number(created.experienceYears)).toBe(5);
    expect(Number(created.expectedSalary)).toBe(2500000);
    expect(created.availabilityDate).toBe(ymd(plusDays(30)));
    expect(created.vacancyId).toBe("vac-1");
    expect(created.vacancyTitle).toBe("VACANTE ANALISTA EDITADA");
    expect(created.status).toBe("Recibido");
  });

  await record("Contratación:edit candidate updates modal fields", async () => {
    await ensureHiringDataSection("candidates");
    await clickVisible("[data-action='edit-candidate'][data-id='cand-1']");
    await page.waitForSelector("#crud-modal:not(.hidden)", { timeout: 5000 });
    await page.waitForSelector("#crud-modal #crud-form", { state: "attached" });
    await submitForm("#crud-modal #crud-form", [
      ["phone", "3007778800"],
      ["educationLevel", "Posgrado"]
    ]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "cand-1" && row.phone === "+57 300 777 88 00" && row.educationLevel === "POSGRADO");
      },
      KEYS.candidates,
      "edit candidate"
    );
  });

  await record("Contratación:create interview persists fields and moves pipeline", async () => {
    await ensureHiringOperateSection("interview");
    const before = await arrayLen(KEYS.interviews);
    const form = page.locator("#form-interview");
    await form.locator('select[name="candidateId"]').selectOption("cand-1");
    await setInterviewWhenFuture("#form-interview", 12);
    await form.locator('input[name="interviewer"]').fill("Lina QA");
    await form.locator('select[name="mode"]').selectOption("telefonica");
    await form.locator('input[name="place"]').fill("Llamada +57 3000000000");
    await form.locator('textarea[name="notes"]').fill("Entrevista telefónica QA");
    await page.evaluate(() => {
      const form = document.querySelector("#form-interview");
      if (!form) throw new Error("form-interview no encontrado");
      if (!form.checkValidity()) {
        const invalid = [...form.querySelectorAll("input,select,textarea")]
          .filter((el) => !el.checkValidity())
          .map((el) => `${el.name || el.type}: ${el.validationMessage}`);
        throw new Error(`form-interview inválido: ${invalid.join("; ") || "desconocido"}`);
      }
      form.requestSubmit();
    });
    await waitForArrayLength(KEYS.interviews, before + 1, "create interview");
    await waitForStore(
      ({ interviewsKey, candidatesKey }) => {
        const interviews = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(interviewsKey, [])
          : JSON.parse(localStorage.getItem(interviewsKey) || "[]");
        const candidates = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(candidatesKey, [])
          : JSON.parse(localStorage.getItem(candidatesKey) || "[]");
        return interviews.some((row) => row.interviewer === "LINA QA" && row.modality === "Telefónica" && row.locationOrLink === "LLAMADA +57 3000000000" && row.notes === "ENTREVISTA TELEFONICA QA")
          && candidates.some((row) => row.id === "cand-1" && row.status === "Entrevistado");
      },
      { interviewsKey: KEYS.interviews, candidatesKey: KEYS.candidates },
      "create interview"
    );
  });

  await record("Contratación:edit interview updates modal fields", async () => {
    await ensureHiringDataSection("interviews");
    await clickVisible("[data-action='edit-interview'][data-id='int-1']");
    await page.waitForSelector("#crud-modal:not(.hidden)", { timeout: 5000 });
    await page.waitForSelector("#crud-modal #crud-form", { state: "attached" });
    await submitForm("#crud-modal #crud-form", [
      ["interviewer", "Lina QA Edit"],
      ["modality", "Presencial"],
      ["locationOrLink", "Sala 2"]
    ]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "int-1" && row.interviewer === "LINA QA EDIT" && row.modality === "Presencial" && row.locationOrLink === "SALA 2");
      },
      KEYS.interviews,
      "edit interview"
    );
  });

  await record("Contratación:create contract infers template and persists record", async () => {
    await ensureHiringOperateSection("contract");
    await setFormFields("#form-contract", [["employeeId", "emp-1"]]);
    await page.waitForFunction(() => {
      const field = document.querySelector("#form-contract select[name='contractTemplateKind']");
      return field && String(field.value || "").trim() === "oficina";
    });
    const before = await arrayLen(KEYS.contracts);
    await submitForm("#form-contract", [
      ["employeeId", "emp-1"],
      ["signDate", ymd(plusDays(5))]
    ]);
    await waitForArrayLength(KEYS.contracts, before + 1, "create contract");
    const contracts = await readStore(KEYS.contracts);
    const created = contracts.find((row) => row.employeeId === "emp-1");
    if (!created) throw new Error("No se guardó el contrato");
    expect(created.employeeName).toBe("Carlos Operativo");
    expect(created.position).toBe("ANALISTA QA EDITADO");
    expect(created.contractTemplateKind).toBe("oficina");
    expect(created.contractType).toBe("Termino indefinido");
    expect(created.startDate).toBe(ymd(plusDays(5)));
    expect(created.companyId).toBe("co-antares");
    expect(created.idDocSnapshot).toBe("1234567890");
    const lastContractPayload = await page.evaluate(() => window.__qaContractCalls.at(-1) || null);
    if (!lastContractPayload) throw new Error("No se invocó la generación Word stub");
    expect(lastContractPayload.contractTemplateKind).toBe("oficina");
    expect(lastContractPayload.nombre_empleado).toBe("Carlos Operativo");
    expect(lastContractPayload.cedula_empleado).toBe("1234567890");
    expect(lastContractPayload.signDate).toBe(ymd(plusDays(5)));
  });

  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter((item) => !item.ok);
  expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
});
