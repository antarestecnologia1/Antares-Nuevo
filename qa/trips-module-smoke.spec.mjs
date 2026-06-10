import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  requests: "antares_requests_v2",
  vehicles: "antares_vehicles_v2",
  drivers: "antares_drivers_v2",
  tripRouteRates: "antares_trip_route_rates_v2",
  session: "antares_session_v2"
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
      eps: "Sura",
      arl: "Sura",
      city: "Bogota D.C.",
      department: "Bogota",
      address: "Av 3 # 4-5",
      available: true,
      hiredAt: now.toISOString()
    }
  ],
  [KEYS.requests]: [
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
      pickupAt: `${ymd(plusDays(10))}T11:00:00.000Z`,
      etaDelivery: `${ymd(plusDays(11))}T19:00:00.000Z`,
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
  [KEYS.tripRouteRates]: {},
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
  }
};

test("transport trips flow smoke", async ({ page, context }) => {
  await context.addInitScript((payload) => {
    const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
    localStorage.clear();
    Object.entries(payload).forEach(([key, value]) => {
      localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
    });
  }, seedStore);

  const latestToastText = () =>
    page.evaluate(() => {
      const items = [...document.querySelectorAll("#toast-container .toast")]
        .map((node) => String(node.textContent || "").trim())
        .filter(Boolean);
      return items.at(-1) || "";
    });

  const waitForStore = async (pageFn, arg, label) => {
    try {
      await page.waitForFunction(pageFn, arg, { timeout: 10000 });
    } catch (_error) {
      const toast = await latestToastText();
      throw new Error(`${label || "Condición no cumplida"}. Toast: ${toast || "sin toast"}`);
    }
  };

  const gotoView = async (view) => {
    await page.evaluate((v) => {
      window.location.hash = `#portal/${v}`;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }, view);
    await page.waitForTimeout(450);
  };

  const clickDom = async (selector) => {
    await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
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
  };

  const goCreateTripWizardStep = async (stepIndex) => {
    await clickDom(`#form-create-trip [data-hr-wizard-dot="${stepIndex}"]`);
    await page.waitForFunction(
      (idx) => {
        const step = document.querySelector(`#form-create-trip .hr-form-step[data-step-index="${idx}"]`);
        return step && !step.classList.contains("hidden");
      },
      stepIndex,
      { timeout: 5000 }
    );
  };

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForSelector("#portal-app", { timeout: 10000 });

  await gotoView("transport-trips");
  await ensureCreatePanelOpen("create-trip");
  await page.locator('#form-create-trip select[name="requestId"]').selectOption("req-trip-create");
  await page.waitForFunction(() => {
    const vehicleOptions = [...document.querySelectorAll('#form-create-trip select[name="vehicleId"] option')];
    const driverOptions = [...document.querySelectorAll('#form-create-trip select[name="driverId"] option')];
    return vehicleOptions.some((opt) => opt.value === "veh-1" && !opt.disabled)
      && driverOptions.some((opt) => opt.value === "drv-1" && !opt.disabled);
  }, { timeout: 10000 });
  await goCreateTripWizardStep(1);
  await page.locator('#form-create-trip select[name="vehicleId"]').selectOption("veh-1");
  await page.locator('#form-create-trip select[name="driverId"]').selectOption("drv-1");
  await goCreateTripWizardStep(2);
  await page.locator('#form-create-trip input[name="tripValue"]').fill("1450000");
  await page.locator('#form-create-trip button[type="submit"]').click();
  await waitForStore(
    (key) => {
      const rows = window.AntaresPersistence?.read
        ? window.AntaresPersistence.read(key, [])
        : JSON.parse(localStorage.getItem(key) || "[]");
      return rows.some((row) => row.id === "req-trip-create" && row.trip && String(row.trip.driverId || "") === "drv-1");
    },
    KEYS.requests,
    "Viajes:create"
  );

  await clickDom("[data-action='edit-trip'][data-id='req-trip-edit']");
  await page.waitForSelector("#crud-form", { state: "attached", timeout: 5000 });
  await page.locator('#crud-form input[name="tripValue"]').fill("1550000");
  await page.locator('#crud-form textarea[name="tripNotes"]').fill("Ajuste QA");
  await page.locator('#crud-form button[type="submit"]').click();
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

  const storedRequests = await page.evaluate((key) => {
    return window.AntaresPersistence?.read
      ? window.AntaresPersistence.read(key, [])
      : JSON.parse(localStorage.getItem(key) || "[]");
  }, KEYS.requests);
  expect(storedRequests.find((row) => row.id === "req-trip-create")?.trip?.vehicleId).toBe("veh-1");
  expect(storedRequests.find((row) => row.id === "req-trip-edit")?.tripValue).toBe(1550000);
});
