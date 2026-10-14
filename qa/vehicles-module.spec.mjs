import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

function ymd(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const now = new Date();
const pickup = new Date(now.getTime() + 3 * 86400000);
const delivery = new Date(now.getTime() + 4 * 86400000);

const seed = {
  antares_portal_data_ver: "v8-server-backed-memory-only",
  antares_users_storage_ver: "v5-memory",
  antares_users_v2: [
    {
      id: "admin-1",
      requiresDataPolicyAcceptance: false,
      requiresTermsAcceptance: false,
      name: "Admin QA",
      email: "admin.qa@antares.test",
      role: "admin",
      accountStatus: "aprobado",
      companyId: "co-antares",
      permissions: []
    }
  ],
  antares_companies_v2: [
    {
      id: "co-antares",
      name: "Transportes Antares",
      taxId: "900000001-0",
      companyKind: "propia",
      active: true
    }
  ],
  antares_vehicles_v2: [
    {
      id: "veh-ok",
      plate: "ABC123",
      brand: "Chevrolet",
      model: "NPR",
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
      soatExpeditionDate: ymd(new Date(now.getTime() - 20 * 86400000)),
      soatExpiryDate: ymd(new Date(now.getTime() + 340 * 86400000)),
      techInspectionExpeditionDate: ymd(new Date(now.getTime() - 20 * 86400000)),
      techInspectionExpiryDate: ymd(new Date(now.getTime() + 340 * 86400000)),
      hasGps: true,
      gpsProvider: "Satrack",
      available: true,
      createdAt: now.toISOString()
    },
    {
      id: "veh-off",
      plate: "DEF456",
      brand: "Hino",
      model: "500",
      year: now.getFullYear() - 1,
      type: "Turbo",
      color: "Blanco",
      capacityKg: 4500,
      refrigerated: true,
      bodyType: "Furgon",
      fuelType: "Diesel",
      axleConfig: "4x2",
      engineNumber: "ENG002",
      vin: "VIN000000000002",
      ownershipCard: "TP002",
      soatExpeditionDate: ymd(new Date(now.getTime() - 400 * 86400000)),
      soatExpiryDate: ymd(new Date(now.getTime() - 30 * 86400000)),
      techInspectionExpeditionDate: ymd(new Date(now.getTime() - 400 * 86400000)),
      techInspectionExpiryDate: ymd(new Date(now.getTime() - 30 * 86400000)),
      hasGps: false,
      gpsProvider: "",
      available: false,
      autoBusy: false,
      createdAt: now.toISOString()
    }
  ],
  antares_drivers_v2: [],
  antares_requests_v2: [
    {
      id: "req-off-trip",
      requestNumber: "SOL-OFF",
      clientName: "Flores del Valle",
      status: "Viaje asignado",
      pickupAt: `${ymd(pickup)}T08:00:00.000Z`,
      etaDelivery: `${ymd(delivery)}T18:00:00.000Z`,
      trip: {
        tripNumber: "VIA-OFF",
        vehicleId: "veh-off",
        vehiclePlate: "DEF456",
        vehicleType: "Turbo",
        etaPickup: `${ymd(pickup)}T08:00:00.000Z`,
        etaDelivery: `${ymd(delivery)}T18:00:00.000Z`
      },
      createdAt: now.toISOString()
    }
  ],
  antares_session_v2: {
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

test("módulo camiones: alta, filtros y disponibilidad", async ({ page, context }) => {
  await context.addInitScript((payload) => {
    const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
    localStorage.clear();
    Object.entries(payload).forEach(([key, value]) => {
      localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
    });
  }, seed);

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#portal-app", { timeout: 20000 });
  await page.evaluate(() => {
    window.location.hash = "#portal/transport-vehicles";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.waitForSelector(".vehicles-studio", { timeout: 15000 });

  const metrics = await page.locator(".fleet-hero-metric").evaluateAll((nodes) =>
    nodes.map((node) => ({
      label: node.querySelector("span")?.textContent?.trim() || "",
      value: node.querySelector("strong")?.textContent?.trim() || ""
    }))
  );
  const metric = (label) => metrics.find((item) => item.label === label)?.value;
  expect(metric("Flota")).toBe("2");
  expect(metric("Disponibles")).toBe("1");
  expect(metric("Reservados")).toBe("0");
  expect(metric("No disponibles")).toBe("1");

  await expect(page.locator(".module-filters-title")).toHaveCount(0);
  await expect(page.locator(".vehicle-ops-cards")).toContainText("Tarjeta de propiedad");
  await expect(page.locator("[data-vehicle-id='veh-off']")).toContainText("No disponible");
  await expect(page.locator("[data-vehicle-id='veh-off']")).toContainText("Marcado manualmente como no disponible");

  const typeLabels = await page.locator("[data-action='vehicles-fleet-filter'][data-filter='type'] option").allTextContents();
  expect(typeLabels.some((label) => label.includes("Camión"))).toBe(true);
  expect(typeLabels.some((label) => label.includes("Turbo"))).toBe(true);
  expect(typeLabels.some((label) => label.includes("Bus"))).toBe(false);

  await page.locator("[data-action='vehicles-fleet-status'][data-status='offline']").click();
  await expect(page.locator(".vehicle-ops-cards [data-vehicle-id='veh-off']")).toBeVisible();
  await expect(page.locator(".vehicle-ops-cards [data-vehicle-id='veh-ok']")).toHaveCount(0);
  await page.locator("[data-action='vehicles-fleet-clear']").click();
  await expect(page.locator(".vehicle-ops-cards [data-vehicle-id='veh-ok']")).toBeVisible();

  await page.locator("[data-action='vehicles-fleet-filter'][data-filter='soat']").selectOption("expired");
  await expect(page.locator(".vehicle-ops-cards [data-vehicle-id='veh-off']")).toBeVisible();
  await expect(page.locator(".vehicle-ops-cards [data-vehicle-id='veh-ok']")).toHaveCount(0);
  await page.locator("[data-action='vehicles-fleet-clear']").click();

  await page.locator("[data-action='vehicles-fleet-layout'][data-layout='list']").click();
  await expect(page.locator(".module-filters-title")).toHaveCount(0);
  await expect(page.locator(".vehicle-fleet-table")).toContainText("ABC123");
  await expect(page.locator(".vehicle-fleet-table")).toContainText("DEF456");
  await page.locator("[data-action='vehicles-fleet-layout'][data-layout='cards']").click();

  await page.locator("[data-action='hr-workspace-tab'][data-module='transport-vehicles'][data-tab='operate']").click();
  await page.waitForSelector("#form-vehicle", { state: "attached" });
  const defaults = await page.locator("#form-vehicle").evaluate((form) => ({
    refrigerated: form.querySelector("[name='refrigerated']")?.value || "",
    hasGps: form.querySelector("[name='hasGps']")?.value || ""
  }));
  expect(defaults.refrigerated).toBe("");
  expect(defaults.hasGps).toBe("false");

  const gpsGate = await page.locator("#form-vehicle").evaluate((form) => {
    const provider = form.querySelector("[name='gpsProvider']");
    return {
      providerDisabled: Boolean(provider?.disabled),
      providerRequired: Boolean(provider?.required)
    };
  });
  expect(gpsGate.providerDisabled).toBe(true);
  expect(gpsGate.providerRequired).toBe(false);

  await page.locator("#form-vehicle").evaluate((form) => {
    const body = form.querySelector("[name='bodyType']");
    const refr = form.querySelector("[name='refrigerated']");
    if (!body || !refr) throw new Error("campos Termoking no encontrados");
    body.value = "Furgon refrigerado (Termoking)";
    body.dispatchEvent(new Event("change", { bubbles: true }));
    return refr.value;
  });
  await expect
    .poll(async () => page.locator("#form-vehicle [name='refrigerated']").inputValue())
    .toBe("true");

  const catalogs = await page.locator("#form-vehicle").evaluate((form) => {
    const first = (name) =>
      [...form.querySelectorAll(`[name="${name}"] option`)]
        .map((option) => option.value)
        .find((value) => value) || "";
    return {
      color: first("color"),
      bodyType: first("bodyType"),
      fuelType: first("fuelType"),
      axleConfig: first("axleConfig")
    };
  });

  await page.locator("[data-action='vehicles-section'][data-section='create']").click();
  await page.locator("[data-vehicle-operate-pane='create'] [data-action='toggle-create-panel'][data-panel='create-vehicle']").first().click();
  await page.waitForSelector("#form-vehicle", { state: "visible" });

  await page.locator("#form-vehicle").evaluate((form, values) => {
    const set = (name, value) => {
      const field = form.querySelector(`[name="${name}"]`);
      if (!field) throw new Error(`Campo no encontrado: ${name}`);
      const hidden = form.querySelector(`input[type="hidden"][name="${name}"][data-portal-date-iso="1"]`);
      if (hidden && window.AntaresValidation?.setPortalFormDateByName) {
        window.AntaresValidation.setPortalFormDateByName(form, name, String(value).slice(0, 10));
        return;
      }
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    };
    Object.entries(values).forEach(([name, value]) => set(name, value));
    form.requestSubmit();
  }, {
    plate: "ABC123",
    brand: "Kenworth",
    model: "T800",
    year: String(now.getFullYear()),
    type: "Camion",
    color: catalogs.color,
    capacityKg: "18000",
    refrigerated: "false",
    bodyType: catalogs.bodyType,
    fuelType: catalogs.fuelType,
    axleConfig: catalogs.axleConfig,
    engineNumber: "ENG-DUP",
    vin: "1XKADB9X6CJ123456",
    ownershipCard: "TP-DUP",
    soatExpeditionDate: ymd(new Date(now.getTime() - 10 * 86400000)),
    soatExpiryDate: ymd(new Date(now.getTime() + 350 * 86400000)),
    techInspectionExpeditionDate: ymd(new Date(now.getTime() - 10 * 86400000)),
    techInspectionExpiryDate: ymd(new Date(now.getTime() + 350 * 86400000)),
    hasGps: "false"
  });

  await expect(page.locator("#form-vehicle")).toContainText("ya está registrada");
  const count = await page.evaluate(() => {
    const rows = window.AntaresPersistence?.read?.("antares_vehicles_v2", []) || [];
    return Array.isArray(rows) ? rows.length : 0;
  });
  expect(count).toBe(2);
});
