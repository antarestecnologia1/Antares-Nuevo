import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4174;

async function startServer() {
  const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".mjs": "text/javascript" };
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const rel = decodeURIComponent(String(req.url || "/").split("?")[0]).replace(/^\/+/, "") || "index.html";
      const filePath = path.normalize(path.join(ROOT, rel));
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      try {
        const body = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

const seed = {
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
      permissions: []
    }
  ],
  antares_companies_v2: [{ id: "co-antares", name: "Transportes Antares", taxId: "900000001-0", companyKind: "propia" }],
  antares_session_v2: { userId: "admin-1", role: "admin", email: "admin.qa@antares.test", lastActivityAt: Date.now() },
  antares_vehicles_v2: [
    {
      id: "veh-1",
      plate: "ABC123",
      brand: "Chevrolet",
      model: "FTR",
      year: 2024,
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
      soatExpeditionDate: "2025-06-01",
      soatExpiryDate: "2026-12-01",
      techInspectionExpeditionDate: "2025-06-01",
      techInspectionExpiryDate: "2026-12-01",
      rcPolicyExpiry: "2026-12-01",
      hasGps: true,
      gpsProvider: "Satrack",
      available: true,
      createdAt: new Date().toISOString()
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
    }
  ],
  antares_payroll_employees_v2: [{ id: "emp-1", name: "Carlos", idDoc: "1234567890", companyId: "co-antares", positionId: "pos-analista" }],
  antares_sst_compliance_v2: [
    {
      id: "sst-1",
      employeeId: "emp-1",
      employeeName: "Carlos",
      recordType: "Capacitacion SST",
      provider: "ARL Sura",
      dueDate: "2026-07-01",
      status: "Pendiente",
      documentCode: "SST-001",
      notes: "Test",
      createdAt: new Date().toISOString()
    }
  ]
};

async function debugCase(name, fn) {
  try {
    await fn();
    console.log("OK", name);
  } catch (err) {
    console.log("FAIL", name, err.message);
  }
}

const server = await startServer();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
await context.addInitScript((payload) => {
  localStorage.clear();
  for (const [k, v] of Object.entries(payload)) {
    localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  }
}, seed);
const page = await context.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("[browser]", msg.text());
});
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.waitForTimeout(800);

await debugCase("camiones-edit", async () => {
  await page.evaluate(() => {
    location.hash = "#portal/transport-vehicles";
    dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.waitForTimeout(600);
  await page.click("[data-action='hr-workspace-tab'][data-module='transport-vehicles'][data-tab='data']");
  await page.waitForTimeout(400);
  await page.click("[data-action='edit-vehicle'][data-id='veh-1']");
  await page.waitForSelector("#crud-form");
  const fieldCount = await page.locator("#crud-form [name]").count();
  console.log("  crud fields:", fieldCount);
  const invalid = await page.evaluate(() => {
    const form = document.getElementById("crud-form");
    const V = window.AntaresValidation;
    const r = V.validateDomForm(form);
    if (r.ok) return null;
    return {
      name: r.firstInvalid?.name,
      msg: r.firstInvalid?.validationMessage || r.firstInvalid?.closest("label")?.textContent?.slice(0, 80)
    };
  });
  if (invalid) console.log("  validation:", invalid);
  await page.evaluate(() => {
    document.querySelector("#crud-form [name=brand]").value = "Chevrolet QA";
    document.getElementById("crud-form").requestSubmit();
  });
  await page.waitForTimeout(1500);
  const row = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("antares_vehicles_v2") || "[]").find((r) => r.id === "veh-1")
  );
  console.log("  row after:", row);
  if (row?.brand !== "Chevrolet QA") throw new Error(`brand=${row?.brand}`);
});

await debugCase("profile-edit", async () => {
  await page.evaluate(() => {
    location.hash = "#portal/profile";
    dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const form = document.getElementById("form-profile");
    form.querySelector("[name=name]").value = "Admin QA Perfil";
    form.requestSubmit();
  });
  await page.waitForTimeout(1500);
  const row = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("antares_users_v2") || "[]").find((r) => r.id === "admin-1")
  );
  if (row?.name !== "Admin QA Perfil") throw new Error(`name=${row?.name}`);
});

await debugCase("sst-edit", async () => {
  await page.evaluate(() => {
    location.hash = "#portal/labor-compliance";
    dispatchEvent(new HashChangeEvent("hashchange"));
  });
  await page.waitForTimeout(600);
  await page.click("[data-action='edit-sst-record'][data-id='sst-1']");
  await page.waitForSelector("#crud-form");
  const invalid = await page.evaluate(() => {
    const form = document.getElementById("crud-form");
    const V = window.AntaresValidation;
    const r = V.validateDomForm(form);
    if (r.ok) return null;
    return { name: r.firstInvalid?.name, msg: r.firstInvalid?.validationMessage };
  });
  if (invalid) console.log("  validation:", invalid);
  await page.evaluate(() => {
    document.querySelector("#crud-form [name=provider]").value = "ARL QA Edit";
    document.getElementById("crud-form").requestSubmit();
  });
  await page.waitForTimeout(1500);
  const row = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("antares_sst_compliance_v2") || "[]").find((r) => r.id === "sst-1")
  );
  if (row?.provider !== "ARL QA Edit") throw new Error(`provider=${row?.provider}`);
});

await browser.close();
server.close();
