import { chromium } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  payrollEmployees: "antares_payroll_employees_v2",
  positions: "antares_positions_v2",
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
const nextWeek = plusDays(7);
const nextWeek2 = plusDays(8);

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

const seedStore = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  [KEYS.users]: [adminUser],
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
      pickupAt: `${ymd(nextWeek)}T11:00:00.000Z`,
      etaDelivery: `${ymd(nextWeek2)}T19:00:00.000Z`,
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
  [KEYS.payrollWorkspace]: "data"
};

async function gotoView(page, view) {
  await page.evaluate((v) => {
    window.location.hash = `#portal/${v}`;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, view);
  await page.waitForTimeout(500);
}

async function clickDom(page, selector) {
  await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
  await page.evaluate((targetSelector) => {
    const el = document.querySelector(targetSelector);
    if (!el) throw new Error(`No se encontró ${targetSelector}`);
    el.click();
  }, selector);
}

async function invalidFields(page, selector) {
  return page.evaluate((formSelector) => {
    const form = document.querySelector(formSelector);
    if (!form) return { missing: true };
    const all = [...form.querySelectorAll("input, select, textarea")];
    return all
      .filter((el) => typeof el.checkValidity === "function" && !el.checkValidity())
      .map((el) => ({
        name: el.getAttribute("name"),
        type: el.tagName.toLowerCase(),
        value: el.value,
        required: el.required,
        hidden: el.hidden || el.closest("[hidden]") !== null,
        disabled: el.disabled,
        validationMessage: el.validationMessage
      }));
  }, selector);
}

async function persistedRow(page, key, id) {
  return page.evaluate(
    ({ storageKey, rowId }) => {
      const rows = window.AntaresPersistence?.read
        ? window.AntaresPersistence.read(storageKey, [])
        : JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(rows) ? rows.find((row) => row.id === rowId) || null : null;
    },
    { storageKey: key, rowId: id }
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
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
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("#portal-app", { timeout: 10000 });
  await page.waitForTimeout(700);

  await gotoView(page, "requests");
  await clickDom(page, "[data-action='edit-request'][data-id='req-edit']");
  console.log("request-edit invalid", JSON.stringify(await invalidFields(page, "#crud-form"), null, 2));
  await page.evaluate(() => {
    const form = document.querySelector("#crud-form");
    const fuelles = form?.querySelector('input[name="fuelles"]');
    const pickupDate = form?.querySelector('input[name="pickupDate"]');
    const pickupTime = form?.querySelector('input[name="pickupTime"]');
    const deliveryDate = form?.querySelector('input[name="deliveryDate"]');
    const deliveryTime = form?.querySelector('input[name="deliveryTime"]');
    if (fuelles) fuelles.value = "0";
    if (pickupDate) pickupDate.value = "2026-06-05";
    if (pickupTime) pickupTime.value = "10:30";
    if (deliveryDate) deliveryDate.value = "2026-06-06";
    if (deliveryTime) deliveryTime.value = "16:15";
    form?.requestSubmit();
  });
  await page.waitForTimeout(500);
  console.log(
    "request-edit stored",
    JSON.stringify(await persistedRow(page, KEYS.requests, "req-edit"), null, 2)
  );

  await gotoView(page, "transport-trips");
  await page.evaluate(() => {
    const form = document.querySelector("#form-create-trip");
    const request = form?.querySelector('select[name="requestId"]');
    if (request) {
      request.value = "req-trip-create";
      request.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await page.waitForTimeout(1200);
  console.log(
    "trip-create state",
    JSON.stringify(
      await page.evaluate(() => {
        const form = document.querySelector("#form-create-trip");
        const vehicle = form?.querySelector('select[name="vehicleId"]');
        const driver = form?.querySelector('select[name="driverId"]');
        return {
          requestId: form?.querySelector('select[name="requestId"]')?.value || "",
          vehicleValue: vehicle?.value || "",
          driverValue: driver?.value || "",
          vehicleOptions: [...(vehicle?.options || [])].map((opt) => ({
            value: opt.value,
            disabled: opt.disabled,
            text: opt.textContent
          })),
          driverOptions: [...(driver?.options || [])].map((opt) => ({
            value: opt.value,
            disabled: opt.disabled,
            text: opt.textContent
          }))
        };
      }),
      null,
      2
    )
  );
  console.log("trip-create invalid before", JSON.stringify(await invalidFields(page, "#form-create-trip"), null, 2));
  await page.evaluate(() => {
    const form = document.querySelector("#form-create-trip");
    const vehicle = form?.querySelector('select[name="vehicleId"]');
    const driver = form?.querySelector('select[name="driverId"]');
    const tripValue = form?.querySelector('input[name="tripValue"]');
    if (vehicle) {
      vehicle.value = "veh-1";
      vehicle.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (driver) {
      driver.value = "drv-1";
      driver.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (tripValue) {
      tripValue.value = "1450000";
      tripValue.dispatchEvent(new Event("input", { bubbles: true }));
      tripValue.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await page.waitForTimeout(1500);
  console.log("trip-create invalid after", JSON.stringify(await invalidFields(page, "#form-create-trip"), null, 2));
  console.log(
    "trip-create values after wait",
    JSON.stringify(
      await page.evaluate(() => {
        const form = document.querySelector("#form-create-trip");
        return {
          vehicleValue: form?.querySelector('select[name="vehicleId"]')?.value || "",
          driverValue: form?.querySelector('select[name="driverId"]')?.value || "",
          tripValue: form?.querySelector('input[name="tripValue"]')?.value || ""
        };
      }),
      null,
      2
    )
  );
  await page.evaluate(() => document.querySelector("#form-create-trip")?.requestSubmit());
  await page.waitForTimeout(800);
  console.log(
    "trip-create stored",
    JSON.stringify(await persistedRow(page, KEYS.requests, "req-trip-create"), null, 2)
  );

  await gotoView(page, "transport-vehicles");
  await clickDom(page, "[data-action='edit-vehicle'][data-id='veh-1']");
  console.log("vehicle-edit invalid", JSON.stringify(await invalidFields(page, "#crud-form"), null, 2));
  await page.evaluate(() => {
    const form = document.querySelector("#crud-form");
    const brand = form?.querySelector('input[name="brand"]');
    if (brand) brand.value = "Chevrolet QA";
    form?.requestSubmit();
  });
  await page.waitForTimeout(800);
  console.log(
    "vehicle-edit stored",
    JSON.stringify(await persistedRow(page, KEYS.vehicles, "veh-1"), null, 2)
  );
  console.log(
    "vehicle-edit post-submit",
    JSON.stringify(
      await page.evaluate(() => ({
        modalHidden: document.getElementById("crud-modal")?.classList.contains("hidden") || false,
        toasts: [...document.querySelectorAll("#toast-container .toast")]
          .map((node) => String(node.textContent || "").trim())
          .filter(Boolean)
          .slice(-3),
        invalid: [...document.querySelectorAll('#crud-form [aria-invalid="true"]')].map((node) => ({
          name: node.getAttribute("name"),
          value: node.value
        }))
      })),
      null,
      2
    )
  );

  await gotoView(page, "payroll");
  await clickDom(page, "[data-action='hr-workspace-tab'][data-module='payroll'][data-tab='data']");
  await page.waitForTimeout(500);
  await clickDom(page, "[data-action='edit-employee'][data-id='emp-1']");
  console.log("employee-edit invalid", JSON.stringify(await invalidFields(page, "#crud-form"), null, 2));
  await page.evaluate(() => {
    const form = document.querySelector("#crud-form");
    const phone = form?.querySelector('input[name="phone"]');
    const bloodType = form?.querySelector('select[name="bloodType"]');
    if (phone) phone.value = "3005556600";
    if (bloodType) bloodType.value = "O+";
    form?.requestSubmit();
  });
  await page.waitForTimeout(800);
  console.log(
    "employee-edit stored",
    JSON.stringify(await persistedRow(page, KEYS.payrollEmployees, "emp-1"), null, 2)
  );

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
