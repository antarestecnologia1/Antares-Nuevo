import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  counters: "antares_counters_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  notifications: "antares_notifications_v2",
  emails: "antares_emails_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  payrollRuns: "antares_payroll_runs_v2",
  fuelLogs: "antares_fuel_logs_v2",
  vehicleTechnicalLogs: "antares_vehicle_technical_logs_v2",
  vacancies: "antares_vacancies_v2",
  candidates: "antares_candidates_v2",
  positions: "antares_positions_v2",
  interviews: "antares_interviews_v2",
  contracts: "antares_contracts_v2",
  hrAbsences: "antares_hr_absences_v2",
  sstCompliance: "antares_sst_compliance_v2",
  tripRouteRates: "antares_trip_route_rates_v2",
  approvals: "antares_approvals_v2",
  session: "antares_session_v2",
  payrollWorkspace: "antares_hr_payroll_workspace_v1",
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
const nextWeek = plusDays(7);
const nextWeek2 = plusDays(8);
const tripCreatePickup = plusDays(10);
const tripCreateDelivery = plusDays(11);
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const secondNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 1);
const afterTomorrow = plusDays(2);

const adminUser = {
  id: "admin-1",
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
};

const clientUser = {
  id: "client-1",
  name: "Cliente Demo",
  email: "cliente.demo@flores.test",
  role: "client",
  accountStatus: "aprobado",
  companyId: "co-flores",
  company: "Flores del Valle",
  documentType: "CC",
  taxId: "2020202020",
  phone: "3002223344",
  department: "Bogota",
  city: "Bogota D.C.",
  address: "Calle 2 # 2-2",
  permissions: []
};

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  [KEYS.users]: [
    adminUser,
    clientUser
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
      id: "co-flores",
      name: "Flores del Valle",
      taxId: "900000002-0",
      companyKind: "cliente",
      phone: "6012222222",
      email: "logistica@flores.test",
      contactName: "Laura Cliente",
      department: "Bogota",
      city: "Bogota D.C.",
      address: "Zona Franca",
      logoUrl: "https://example.com/logo-flores.png"
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
      id: "emp-1",
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
      bankAccount: "123456789012",
      startDate: ymd(plusDays(-90)),
      workSchedule: "Diurna",
      eps: "Sura",
      pensionFund: "Porvenir",
      arl: "Sura",
      transportAllowance: 162000
    }
  ],
  [KEYS.vehicles]: [
    {
      id: "veh-1",
      plate: "ABC123",
      brand: "Chevrolet",
      model: "FTR",
      year: now.getFullYear(),
      type: "Camion",
      color: "Blanco",
      capacityKg: 8000,
      refrigerated: false,
      bodyType: "Furgon",
      fuelType: "Diesel",
      axleConfig: "4x2",
      engineNumber: "ENG001",
      vin: "VIN000000000001",
      ownershipCard: "TP001",
      soatExpeditionDate: ymd(plusDays(-20)),
      soatExpiryDate: ymd(plusDays(340)),
      techInspectionExpeditionDate: ymd(plusDays(-20)),
      techInspectionExpiryDate: ymd(plusDays(340)),
      rcPolicyContract: "RCC-1",
      rcPolicyExtra: "RCE-1",
      rcPolicyExpiry: ymd(plusDays(340)),
      hasGps: true,
      gpsProvider: "Satrack",
      satelliteProviderUser: "antares",
      satelliteProviderPassword: "secret",
      available: true,
      createdAt: now.toISOString()
    }
  ],
  [KEYS.drivers]: [
    {
      id: "drv-1",
      name: "Jairo Ruta",
      fullName: "Jairo Ruta",
      companyId: "co-antares",
      phone: "3006667788",
      documentType: "CC",
      idDoc: "555666777",
      license: "C2-8899",
      licenseCategory: "C2",
      licenseExpiry: ymd(plusDays(180)),
      bloodType: "O+",
      eps: "Sura",
      arl: "Sura",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Av 3 # 4-5",
      emergencyContact: "Rosa",
      emergencyPhone: "3006667799",
      contractType: "Indefinido",
      baseSalary: 2500000,
      available: true,
      hiredAt: now.toISOString()
    }
  ],
  [KEYS.requests]: [
    {
      id: "req-edit",
      requestNumber: "SOL-001",
      clientUserId: "client-1",
      clientName: "Flores del Valle",
      clientCompanyId: "co-flores",
      clientCompanyLogoUrl: "https://example.com/logo-flores.png",
      requestedByName: "Cliente Demo",
      originDepartment: "Bogota",
      originCity: "Bogota D.C.",
      originAddress: "Bodega 1",
      destinationDepartment: "Antioquia",
      destinationCity: "Medellin",
      destinationAddress: "Centro logístico Medellín",
      pickupAt: `${ymd(nextWeek)}T09:00:00.000Z`,
      etaDelivery: `${ymd(nextWeek2)}T15:00:00.000Z`,
      serviceType: "Transporte nacional",
      cargoDescription: "Flores de exportación",
      requiresThermoking: false,
      refrigeracionTermoking: false,
      requiredTruckType: "Camión",
      tripValue: 0,
      siteContactName: "Patio Norte",
      siteContactPhone: "3001234567",
      notes: "Solicitud editable",
      status: "Pendiente",
      createdAt: now.toISOString()
    },
    {
      id: "req-trip-create",
      requestNumber: "SOL-002",
      clientUserId: "client-1",
      clientName: "Flores del Valle",
      clientCompanyId: "co-flores",
      requestedByName: "Cliente Demo",
      originDepartment: "Bogota",
      originCity: "Bogota D.C.",
      originAddress: "Bodega 2",
      destinationDepartment: "Antioquia",
      destinationCity: "Medellin",
      destinationAddress: "Patio Medellín",
      pickupAt: `${ymd(tripCreatePickup)}T11:00:00.000Z`,
      etaDelivery: `${ymd(tripCreateDelivery)}T19:00:00.000Z`,
      serviceType: "Transporte nacional",
      cargoDescription: "Carga general",
      requiresThermoking: false,
      refrigeracionTermoking: false,
      requiredTruckType: "Camión",
      tripValue: 0,
      siteContactName: "Cliente 2",
      siteContactPhone: "3001234568",
      notes: "Pendiente para asignar",
      status: "Pendiente",
      createdAt: now.toISOString()
    },
    {
      id: "req-trip-edit",
      requestNumber: "SOL-003",
      clientUserId: "client-1",
      clientName: "Flores del Valle",
      clientCompanyId: "co-flores",
      requestedByName: "Cliente Demo",
      originDepartment: "Bogota",
      originCity: "Bogota D.C.",
      originAddress: "Bodega 3",
      destinationDepartment: "Antioquia",
      destinationCity: "Medellin",
      destinationAddress: "Patio 3",
      pickupAt: `${ymd(nextWeek)}T13:00:00.000Z`,
      etaDelivery: `${ymd(nextWeek2)}T16:00:00.000Z`,
      serviceType: "Transporte nacional",
      cargoDescription: "Insumos",
      requiresThermoking: false,
      refrigeracionTermoking: false,
      requiredTruckType: "Camión",
      tripValue: 1200000,
      siteContactName: "Cliente 3",
      siteContactPhone: "3001234569",
      notes: "Ya asignada",
      status: "Viaje asignado",
      trip: {
        tripNumber: "VIA-001",
        vehicleId: "veh-1",
        vehiclePlate: "ABC123",
        vehicleType: "Camion",
        driverId: "drv-1",
        driverName: "Jairo Ruta",
        driverPhone: "3006667788",
        etaPickup: `${ymd(nextWeek)}T13:00:00.000Z`,
        etaDelivery: `${ymd(nextWeek2)}T16:00:00.000Z`,
        route: "Bogota D.C. - Medellin"
      },
      createdAt: now.toISOString()
    }
  ],
  [KEYS.notifications]: [
    { id: "not-1", userId: "admin-1", title: "Aviso", body: "Prueba bandeja", createdAt: now.toISOString(), readAt: null },
    { id: "not-2", userId: "admin-1", title: "Leída", body: "Prueba leída", createdAt: now.toISOString(), readAt: now.toISOString() }
  ],
  [KEYS.emails]: [],
  [KEYS.payrollRuns]: [],
  [KEYS.fuelLogs]: [],
  [KEYS.vehicleTechnicalLogs]: [],
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
  [KEYS.hrAbsences]: [
    {
      id: "abs-1",
      employeeId: "emp-1",
      employeeName: "Carlos Operativo",
      absenceType: "incapacidad",
      startDate: ymd(plusDays(-3)),
      endDate: ymd(plusDays(-1)),
      days: 3,
      supportNumber: "SUP-001",
      epsEntity: "Sura",
      notes: "Reposo",
      createdAt: now.toISOString()
    }
  ],
  [KEYS.sstCompliance]: [
    {
      id: "sst-1",
      employeeId: "emp-1",
      employeeName: "Carlos Operativo",
      recordType: "Capacitacion SST",
      provider: "ARL Sura",
      dueDate: ymd(plusDays(25)),
      status: "Pendiente",
      documentCode: "SST-001",
      notes: "Pendiente de cierre",
      createdAt: now.toISOString(),
      createdBy: "Admin QA"
    }
  ],
  [KEYS.tripRouteRates]: {},
  [KEYS.approvals]: [
    {
      id: "app-1",
      type: "create_driver",
      title: "Creación conductor pendiente",
      payload: {
        name: "Conductor Aprobación",
        companyId: "co-antares",
        phone: "3008889900",
        documentType: "CC",
        idDoc: "1122334455",
        license: "C2-7777",
        licenseCategory: "C2",
        licenseExpiry: ymd(plusDays(120)),
        city: "Bogota D.C.",
        department: "Bogota",
        address: "Calle 8 # 8-8",
        emergencyContact: "Marta",
        emergencyPhone: "3008889911",
        contractType: "Indefinido",
        baseSalary: 2500000
      },
      status: "pendiente",
      requestedByUserId: "client-1",
      requestedByName: "Cliente Demo",
      requestedAt: now.toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: ""
    }
  ],
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
  [KEYS.payrollWorkspace]: "data",
  [KEYS.hiringWorkspace]: "data"
};

test.setTimeout(300000);

test("portal form smoke", async ({ page, context }) => {
  const results = [];

  await context.addInitScript((payload) => {
    const rawKeys = new Set([
      "antares_portal_data_ver",
      "antares_users_storage_ver",
      "antares_hr_payroll_workspace_v1",
      "antares_hr_hiring_workspace_v1"
    ]);
    localStorage.clear();
    Object.entries(payload).forEach(([key, value]) => {
      localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
    });
  }, seedStore);

  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("[browser:error]", msg.text());
  });

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

  const arrayLen = (key) =>
    readPersisted(key, []).then((parsed) => (Array.isArray(parsed) ? parsed.length : 0));

  const readStore = (key) => readPersisted(key, null);

  const latestToastText = () =>
    page.evaluate(() => {
      const items = [...document.querySelectorAll("#toast-container .toast")]
        .map((node) => String(node.textContent || "").trim())
        .filter(Boolean);
      return items.at(-1) || "";
    });

  const waitForArrayLength = async (key, expected, label) => {
    try {
      await page.waitForFunction(
        ({ storageKey, size }) => {
          const rows = window.AntaresPersistence?.read
            ? window.AntaresPersistence.read(storageKey, [])
            : JSON.parse(localStorage.getItem(storageKey) || "[]");
          return Array.isArray(rows) && rows.length === size;
        },
        { storageKey: key, size: expected },
        { timeout: 8000 }
      );
    } catch (_error) {
      const toast = await latestToastText();
      throw new Error(`${label || key}: no cambió la cantidad esperada. Toast: ${toast || "sin toast"}`);
    }
  };

  const waitForStore = async (pageFn, arg, label) => {
    try {
      await page.waitForFunction(pageFn, arg, { timeout: 8000 });
    } catch (_error) {
      const toast = await latestToastText();
      throw new Error(`${label || "Condición de almacenamiento no cumplida"}. Toast: ${toast || "sin toast"}`);
    }
  };

  const gotoView = async (view) => {
    await page.evaluate((v) => {
      window.location.hash = `#portal/${v}`;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }, view);
    await page.waitForTimeout(400);
  };

  const submitForm = async (selector, pairs) => {
    await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
    await page.evaluate(({ selector: formSelector, pairs: entries }) => {
      const form = document.querySelector(formSelector);
      if (!form) throw new Error(`No se encontró ${formSelector}`);
      const resolveField = (key) => {
        if (/[\[\]#.: >]/.test(key)) return form.querySelector(key) || document.querySelector(key);
        return form.querySelector(`[name="${key}"]`);
      };
      for (const [key, value] of entries) {
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
      form.requestSubmit();
    }, { selector, pairs });
  };

  const setFormFields = async (selector, pairs) => {
    await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
    await page.evaluate(({ selector: formSelector, pairs: entries }) => {
      const form = document.querySelector(formSelector);
      if (!form) throw new Error(`No se encontró ${formSelector}`);
      const resolveField = (key) => {
        if (/[\[\]#.: >]/.test(key)) return form.querySelector(key) || document.querySelector(key);
        return form.querySelector(`[name="${key}"]`);
      };
      for (const [key, value] of entries) {
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

  const submitExistingForm = async (selector) => {
    await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
    await page.evaluate((formSelector) => {
      const form = document.querySelector(formSelector);
      if (!form) throw new Error(`No se encontró ${formSelector}`);
      form.requestSubmit();
    }, selector);
  };

  const clickDom = async (selector) => {
    await page.waitForSelector(selector, { state: "attached", timeout: 4000 });
    await page.evaluate((targetSelector) => {
      const el = document.querySelector(targetSelector);
      if (!el) throw new Error(`No se encontró ${targetSelector}`);
      el.click();
    }, selector);
  };

  const ensureCreatePanelOpen = async (panelId) => {
    await page.waitForSelector(`[data-action='toggle-create-panel'][data-panel='${panelId}']`, { state: "attached", timeout: 5000 });
    const isHidden = await page.evaluate((id) => {
      const panel = document.querySelector(`[data-create-panel="${id}"]`);
      return !panel || panel.classList.contains("hidden") || panel.hasAttribute("hidden");
    }, panelId);
    if (isHidden) await clickDom(`[data-action='toggle-create-panel'][data-panel='${panelId}']`);
    await page.waitForFunction((id) => {
      const panel = document.querySelector(`[data-create-panel="${id}"]`);
      return panel && !panel.classList.contains("hidden") && !panel.hasAttribute("hidden");
    }, panelId);
  };

  const ensureHrWorkspace = async (moduleId, tabId) => {
    await clickDom(`[data-action='hr-workspace-tab'][data-module='${moduleId}'][data-tab='${tabId}']`);
    await page.waitForFunction(
      ({ module, tab }) => {
        const attr =
          module === "payroll"
            ? "data-payroll-panel"
            : module === "requests"
              ? "data-requests-panel"
              : "data-hiring-panel";
        const panel = document.querySelector(`[${attr}="${tab}"]`);
        return panel && !panel.classList.contains("hidden") && !panel.hasAttribute("hidden");
      },
      { module: moduleId, tab: tabId }
    );
  };

  const ensureAdminPanel = async (panelId) => {
    await clickDom(`[data-action='toggle-admin-panel'][data-panel='${panelId}']`);
    const formSelector =
      panelId === "create-user" ? "#form-admin-user-create" : panelId === "create-company" ? "#form-admin-company-create" : "#form-admin-user-permissions";
    await page.waitForSelector(formSelector, { state: "attached", timeout: 5000 });
  };

  const ensureAuthTab = async (tabId) => {
    await clickDom(`[data-auth-tab='${tabId}']`);
    await page.waitForFunction((id) => {
      const panel = document.querySelector(`[data-auth-panel="${id}"]`);
      return panel && !panel.hasAttribute("hidden");
    }, tabId);
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

  await record("Mis solicitudes:create", async () => {
    await gotoView("requests");
    await ensureHrWorkspace("requests", "operate");
    const before = await arrayLen(KEYS.requests);
    await submitForm("#form-request", [
      ["companyId", "co-flores"],
      ["originDepartment", "Bogota"],
      ["originCity", "Bogota D.C."],
      ["originAddress", "Bodega QA"],
      ["destinationDepartment", "Antioquia"],
      ["destinationCity", "Medellin"],
      ["destinationAddress", "Patio QA"],
      ["pickupDate", ymd(plusDays(12))],
      ["pickupTime", "09:00"],
      ["deliveryDate", ymd(plusDays(13))],
      ["deliveryTime", "18:00"],
      ["serviceType", "Transporte nacional"],
      ["cargoDescription", "Carga QA"],
      ["requiresThermoking", "no"],
      ["requiredTruckType", "Tractomula"],
      ["weightKg", "18000"],
      ["siteContactName", "Contacto QA"],
      ["siteContactPhone", "3001231234"],
      ["notes", "Creada por smoke"]
    ]);
    await waitForArrayLength(KEYS.requests, before + 1, "Mis solicitudes:create");
  });

  await record("Mis solicitudes:edit", async () => {
    await gotoView("requests");
    await ensureHrWorkspace("requests", "data");
    const beforeRows = await readStore(KEYS.requests);
    const beforeReq = (beforeRows || []).find((row) => row.id === "req-edit");
    await clickDom("[data-action='edit-request'][data-id='req-edit']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [
      ["pickupDate", ymd(plusDays(10))],
      ["pickupTime", "10:30"],
      ["deliveryDate", ymd(plusDays(11))],
      ["deliveryTime", "16:15"]
    ]);
    await waitForStore(
      ({ key, beforePickupAt, beforeEta }) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "req-edit" && row.pickupAt !== beforePickupAt && row.etaDelivery !== beforeEta);
      },
      { key: KEYS.requests, beforePickupAt: beforeReq?.pickupAt || "", beforeEta: beforeReq?.etaDelivery || "" },
      "Mis solicitudes:edit"
    );
  });

  await record("Viajes:create", async () => {
    await gotoView("transport-trips");
    await ensureCreatePanelOpen("create-trip");
    const before = await readStore(KEYS.requests);
    await setFormFields("#form-create-trip", [["requestId", "req-trip-create"]]);
    await page.waitForFunction(() => {
      const vehicle = document.querySelector("#form-create-trip select[name='vehicleId']");
      const driver = document.querySelector("#form-create-trip select[name='driverId']");
      return vehicle && driver && !vehicle.disabled && !driver.disabled;
    });
    await setFormFields("#form-create-trip", [["vehicleId", "veh-1"], ["driverId", "drv-1"]]);
    await page.waitForFunction(() => {
      const price = document.querySelector("#form-create-trip input[name='tripValue']");
      return price && !price.disabled;
    });
    await setFormFields("#form-create-trip", [["tripValue", "1450000"]]);
    await submitExistingForm("#form-create-trip");
    await waitForStore(
      ({ key, beforeRows }) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        const beforeReq = (beforeRows || []).find((row) => row.id === "req-trip-create");
        return rows.some(
          (row) =>
            row.id === "req-trip-create" &&
            row.status === "Viaje asignado" &&
            row.trip &&
            String(row.trip.driverId || "") === "drv-1" &&
            String(row.trip.tripNumber || "") !== String(beforeReq?.trip?.tripNumber || "")
        );
      },
      { key: KEYS.requests, beforeRows: before || [] },
      "Viajes:create"
    );
    if ((before || []).length < 1) throw new Error("Seed de solicitudes inválido");
  });

  await record("Viajes:edit", async () => {
    await gotoView("transport-trips");
    await clickDom("[data-action='edit-trip'][data-id='req-trip-edit']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["tripValue", "1550000"], ["tripNotes", "Ajuste QA"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "req-trip-edit" && Number(row.tripValue) === 1550000);
      },
      KEYS.requests,
      "Viajes:edit"
    );
  });

  await record("Camiones:create-edit", async () => {
    await gotoView("transport-vehicles");
    await ensureCreatePanelOpen("create-vehicle");
    const before = await arrayLen(KEYS.vehicles);
    await submitForm("#form-vehicle", [
      ["plate", "QWE123"],
      ["brand", "Hino"],
      ["model", "300"],
      ["year", String(now.getFullYear())],
      ["type", "Camion"],
      ["color", "Blanco"],
      ["capacityKg", "7000"],
      ["bodyType", "Furgon seco"],
      ["fuelType", "Diesel ACPM"],
      ["axleConfig", "2 ejes (4 llantas)"],
      ["engineNumber", "ENG-QA"],
      ["vin", "VINQA00000000001"],
      ["ownershipCard", "TC-QA"],
      ["refrigerated", "false"],
      ["soatExpeditionDate", ymd(plusDays(-10))],
      ["soatExpiryDate", ymd(plusDays(355))],
      ["techInspectionExpeditionDate", ymd(plusDays(-10))],
      ["techInspectionExpiryDate", ymd(plusDays(355))],
      ["rcPolicyExpiry", ymd(plusDays(355))],
      ["hasGps", "true"],
      ["gpsProvider", "Satrack"]
    ]);
    await waitForArrayLength(KEYS.vehicles, before + 1, "Camiones:create");
    const beforeVehicles = await readStore(KEYS.vehicles);
    const beforeVeh = (beforeVehicles || []).find((row) => row.id === "veh-1");
    await clickDom("[data-action='edit-vehicle'][data-id='veh-1']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["brand", "Chevrolet QA"]]);
    await waitForStore(
      ({ key, previousUpdatedAt }) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "veh-1" && row.brand === "Chevrolet QA" && row.updatedAt !== previousUpdatedAt);
      },
      { key: KEYS.vehicles, previousUpdatedAt: beforeVeh?.updatedAt || "" },
      "Camiones:edit"
    );
  });

  await record("Conductores:edit", async () => {
    await gotoView("transport-drivers");
    await clickDom("[data-action='edit-driver'][data-id='drv-1']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["phone", "3006667790"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "drv-1" && String(row.phone || "").replace(/\D/g, "").endsWith("3006667790"));
      },
      KEYS.drivers,
      "Conductores:edit"
    );
  });

  await record("Calendario:navigation", async () => {
    await gotoView("transport-calendar");
    await clickDom("[data-action='cal-view'][data-view='week']");
    await clickDom("[data-action='cal-nav'][data-step='1']");
  });

  await record("Historial:fuel-technical", async () => {
    await gotoView("transport-vehicles");
    await ensureCreatePanelOpen("create-fuel-log");
    const fuelBefore = await arrayLen(KEYS.fuelLogs);
    await submitForm("#form-fuel-log", [
      ["vehicleId", "veh-1"],
      ["driverId", "drv-1"],
      ["date", ymd(afterTomorrow)],
      ["tripNumber", "VIA-QA"],
      ["liters", "50"],
      ["totalCost", "600000"],
      ["odometerKm", "123456"],
      ["station", "EDS QA"],
      ["paidBy", "empresa"]
    ]);
    await waitForArrayLength(KEYS.fuelLogs, fuelBefore + 1, "Historial:create fuel");
    await ensureCreatePanelOpen("create-technical-log");
    const techBefore = await arrayLen(KEYS.vehicleTechnicalLogs);
    await submitForm("#form-technical-log", [
      ["vehicleId", "veh-1"],
      ["date", ymd(afterTomorrow)],
      ["type", "preventivo"],
      ["description", "Mantenimiento QA"],
      ["cost", "250000"],
      ["downtimeHours", "2"],
      ["status", "Pendiente"]
    ]);
    await waitForArrayLength(KEYS.vehicleTechnicalLogs, techBefore + 1, "Historial:create technical");
    await gotoView("history");
    await clickDom("[data-action='history-workspace'][data-workspace='fleet']");
    await page.waitForSelector("#history-fuel-results", { state: "attached", timeout: 5000 });
    await clickDom("[data-action='history-fleet-tab'][data-fleet-tab='technical']");
    await page.waitForSelector("#history-technical-results", { state: "attached", timeout: 5000 });
  });

  await record("Reporteria:bi-layout", async () => {
    await gotoView("reports");
    await clickDom("[data-action='reports-set-tab'][data-tab='bi']");
    await clickDom("[data-action='reports-bi-layout-preset'][data-preset='finance']");
    await clickDom("[data-action='reports-bi-layout-apply']");
    await page.waitForSelector(".reports-bi-customizer", { state: "attached" });
  });

  await record("Gestión humana:employee-edit-absence", async () => {
    await gotoView("payroll");
    await ensureHrWorkspace("payroll", "operate");
    await ensureCreatePanelOpen("create-employee");
    const empBefore = await arrayLen(KEYS.payrollEmployees);
    await submitForm("#form-employee", [
      ["name", "Empleado Smoke"],
      ["documentType", "CC"],
      ["idDoc", "4567891230"],
      ["bloodType", "O+"],
      ["hasIllness", "no"],
      ["department", "Bogota"],
      ["city", "Bogota D.C."],
      ["address", "Calle QA 123"],
      ["phone", "3004445566"],
      ["emergencyContact", "Nora"],
      ["emergencyPhone", "3004445567"],
      ["companyId", "co-antares"],
      ["positionId", "pos-analista"],
      ["contractType", "Termino indefinido"],
      ["baseSalary", "2300000"],
      ["contractTemplateKind", "oficina"],
      ["eps", "Sura"],
      ["pensionFund", "Porvenir"],
      ["arl", "Sura"],
      ["bankName", "Bancolombia"],
      ["bankAccount", "998877665544"],
      ["startDate", ymd(plusDays(-5))]
    ]);
    await waitForArrayLength(KEYS.payrollEmployees, empBefore + 1, "Gestión humana:create employee");
    await ensureHrWorkspace("payroll", "data");
    await clickDom("[data-action='edit-employee'][data-id='emp-1']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["phone", "3005556600"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "emp-1" && row.phone === "+57 300 555 66 00");
      },
      KEYS.payrollEmployees,
      "Gestión humana:edit employee"
    );
    await ensureHrWorkspace("payroll", "operate");
    await ensureCreatePanelOpen("create-hr-absence");
    const absBefore = await arrayLen(KEYS.hrAbsences);
    await submitForm("#form-hr-absence", [
      ["employeeId", "emp-1"],
      ["absenceType", "vacaciones"],
      ["startDate", ymd(plusDays(1))],
      ["endDate", ymd(plusDays(3))],
      ["supportNumber", "QA-ABS"],
      ["epsEntity", "Sura"],
      ["notes", "Ausencia smoke"]
    ]);
    await waitForArrayLength(KEYS.hrAbsences, absBefore + 1, "Gestión humana:create absence");
  });

  await record("Contratación:position-vacancy-candidate-interview", async () => {
    await gotoView("hiring");
    await ensureHrWorkspace("hiring", "operate");
    await ensureCreatePanelOpen("create-position");
    const posBefore = await arrayLen(KEYS.positions);
    await submitForm("#form-position", [
      ["name", "Coordinador QA"],
      ["workerRole", "empleado"],
      ["salaryBasis", "custom"],
      ["baseSalary", "2400000"],
      ["contractTypeDefault", "Termino indefinido"],
      ["workSchedule", "Diurna"],
      ["arlRiskLevel", "Nivel I"],
      ["integralSalary", "false"],
      ["legalBasis", "CST QA"]
    ]);
    await waitForArrayLength(KEYS.positions, posBefore + 1, "Contratación:create position");
    await ensureHrWorkspace("hiring", "data");
    await clickDom("[data-action='edit-position'][data-id='pos-analista']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["name", "Analista QA Editado"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "pos-analista" && row.name === "Analista QA Editado");
      },
      KEYS.positions,
      "Contratación:edit position"
    );
    await ensureHrWorkspace("hiring", "operate");
    await ensureCreatePanelOpen("create-vacancy");
    const vacBefore = await arrayLen(KEYS.vacancies);
    await submitForm("#form-vacancy", [
      ["positionId", "pos-analista"],
      ["title", "Vacante QA"],
      ["department", "Bogota"],
      ["city", "Bogota D.C."],
      ["modality", "Presencial"],
      ["openings", "1"],
      ["salaryOffer", "2400000"],
      ["deadline", ymd(plusDays(25))],
      ["requirements", "Perfil smoke"]
    ]);
    await waitForArrayLength(KEYS.vacancies, vacBefore + 1, "Contratación:create vacancy");
    await ensureHrWorkspace("hiring", "data");
    await clickDom("[data-action='edit-vacancy'][data-id='vac-1']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["title", "Vacante Analista Editada"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "vac-1" && row.title === "Vacante Analista Editada");
      },
      KEYS.vacancies,
      "Contratación:edit vacancy"
    );
    await ensureHrWorkspace("hiring", "operate");
    await ensureCreatePanelOpen("create-candidate");
    const candBefore = await arrayLen(KEYS.candidates);
    await submitForm("#form-candidate", [
      ["name", "Nuevo Candidato QA"],
      ["email", "nuevo.candidato@test.com"],
      ["phone", "3009990001"],
      ["documentType", "CC"],
      ["idDoc", "6655443322"],
      ["birthDate", "1994-01-15"],
      ["department", "Bogota"],
      ["city", "Bogota D.C."],
      ["address", "Calle 12 # 12-12"],
      ["educationLevel", "Profesional"],
      ["experienceYears", "5"],
      ["expectedSalary", "2500000"],
      ["availabilityDate", ymd(plusDays(30))],
      ["vacancyId", "vac-1"]
    ]);
    await waitForArrayLength(KEYS.candidates, candBefore + 1, "Contratación:create candidate");
    await ensureHrWorkspace("hiring", "data");
    await clickDom("[data-action='edit-candidate'][data-id='cand-1']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["phone", "3007778800"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "cand-1" && row.phone === "3007778800");
      },
      KEYS.candidates,
      "Contratación:edit candidate"
    );
    await ensureHrWorkspace("hiring", "operate");
    await ensureCreatePanelOpen("create-interview");
    const intBefore = await arrayLen(KEYS.interviews);
    await submitForm("#form-interview", [
      ["candidateId", "cand-1"],
      ["when", ymdhm(plusDays(12))],
      ["interviewer", "Lina QA"],
      ["mode", "virtual"],
      ["place", "https://meet.test/qa"],
      ["notes", "Entrevista smoke"]
    ]);
    await waitForArrayLength(KEYS.interviews, intBefore + 1, "Contratación:create interview");
    await ensureHrWorkspace("hiring", "data");
    await clickDom("[data-action='edit-interview'][data-id='int-1']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["interviewer", "Lina QA Edit"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "int-1" && row.interviewer === "Lina QA Edit");
      },
      KEYS.interviews,
      "Contratación:edit interview"
    );
  });

  await record("Cumplimiento laboral y SST:create-edit", async () => {
    await gotoView("labor-compliance");
    await ensureCreatePanelOpen("create-sst-control");
    const before = await arrayLen(KEYS.sstCompliance);
    await submitForm("#form-sst-compliance", [
      ["employeeId", "emp-1"],
      ["recordType", "Capacitacion SST"],
      ["provider", "ARL QA"],
      ["dueDate", ymd(plusDays(40))],
      ["status", "Pendiente"],
      ["documentCode", "QA-002"],
      ["notes", "Registro smoke"]
    ]);
    await waitForArrayLength(KEYS.sstCompliance, before + 1, "SST:create");
    await clickDom("[data-action='edit-sst-record'][data-id='sst-1']");
    await page.waitForSelector("#crud-form", { state: "attached" });
    await submitForm("#crud-form", [["provider", "ARL QA Edit"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "sst-1" && row.provider === "ARL QA Edit");
      },
      KEYS.sstCompliance,
      "SST:edit"
    );
  });

  await record("Contacto web (B2B):access", async () => {
    await gotoView("contact-leads");
    await page.waitForSelector("#view-root", { state: "attached" });
  });

  await record("Usuarios y permisos:create-edit", async () => {
    await gotoView("admin-users");
    await ensureAdminPanel("create-user");
    const before = await arrayLen(KEYS.users);
    await submitForm("#form-admin-user-create", [
      ["name", "Usuario Smoke"],
      ["email", "usuario.smoke@test.com"],
      ["password", "QaPass!2026"],
      ["documentType", "CC"],
      ["taxId", "7788990011"],
      ["phone", "3009990011"],
      ["role", "client"],
      ["registrationKind", "cliente"],
      ["companyId", "co-flores"],
      ["twoFactorEnabled", "false"],
      ["systemJoinDate", ymd(now)],
      ["department", "Bogota"],
      ["city", "Bogota D.C."],
      ["address", "Carrera smoke"],
      ["company", "Flores del Valle"]
    ]);
    await waitForArrayLength(KEYS.users, before + 1, "Usuarios:create");
    await clickDom("[data-action='open-edit-user'][data-id='client-1']");
    await page.waitForSelector("#form-admin-user-edit", { state: "attached" });
    await submitForm("#form-admin-user-edit", [["phone", "3002223300"]]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "client-1" && row.phone === "+57 300 222 33 00");
      },
      KEYS.users,
      "Usuarios:edit"
    );
    await ensureAdminPanel("set-permissions");
    await submitForm("#form-admin-user-permissions", [["userId", "client-1"]]);
  });

  await record("Autorizaciones:approve", async () => {
    await gotoView("authorizations");
    await ensureAuthTab("transport_fleet");
    const before = await arrayLen(KEYS.approvals);
    await clickDom("[data-action='approval-approve'][data-id='app-1']");
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "app-1" && row.status === "aprobado");
      },
      KEYS.approvals,
      "Autorizaciones:approve"
    );
    const after = await arrayLen(KEYS.approvals);
    if (after !== before) throw new Error("La fila de aprobación no se conservó tras aprobar");
  });

  await record("Mi perfil:edit", async () => {
    await gotoView("profile");
    await submitForm("#form-profile", [
      ["name", "Admin QA Perfil"],
      ["phone", "3001112200"],
      ["documentType", "CC"],
      ["taxId", "1010101010"],
      ["birthDate", "1990-01-01"],
      ["emergencyContact", "Sofía"],
      ["emergencyPhone", "3001112201"],
      ["emergencyRelation", "Hermana"],
      ["companyId", "co-antares"]
    ]);
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.some((row) => row.id === "admin-1" && row.name === "Admin QA Perfil");
      },
      KEYS.users,
      "Mi perfil:edit"
    );
  });

  await record("Notificaciones:alerts-sound", async () => {
    await gotoView("notifications");
    await clickDom("[data-action='notif-toggle-alerts']");
    await clickDom("[data-action='notif-toggle-sound']");
    await clickDom("[data-action='notif-read-all']");
    await waitForStore(
      (key) => {
        const rows = window.AntaresPersistence?.read
          ? window.AntaresPersistence.read(key, [])
          : JSON.parse(localStorage.getItem(key) || "[]");
        return rows.every((row) => row.readAt);
      },
      KEYS.notifications,
      "Notificaciones:read all"
    );
  });

  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter((item) => !item.ok);
  expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
});
