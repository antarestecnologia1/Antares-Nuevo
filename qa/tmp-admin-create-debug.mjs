import { chromium } from "playwright";

const BASE = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";
const KEYS = { users: "antares_users_v2", companies: "antares_companies_v2", session: "antares_session_v2" };
const seed = {
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
      permissions: []
    }
  ],
  [KEYS.companies]: [
    { id: "co-flores", name: "Flores del Valle", taxId: "900000002-0" },
    { id: "co-antares", name: "Transportes Antares", taxId: "900000001-0" }
  ],
  [KEYS.session]: { userId: "admin-1", role: "admin", email: "admin.qa@antares.test", lastActivityAt: Date.now() }
};

const pairs = [
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
  ["systemJoinDate", "2026-05-26"],
  ["department", "Bogota"],
  ["city", "Bogota D.C."],
  ["address", "Carrera smoke"],
  ["company", "Flores del Valle"]
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.addInitScript((p) => {
  localStorage.clear();
  Object.entries(p).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
}, seed);
await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => {
  location.hash = "#portal/admin-users";
  dispatchEvent(new HashChangeEvent("hashchange"));
});
await page.waitForTimeout(800);
await page.click('[data-action="toggle-admin-panel"][data-panel="create-user"]');
await page.waitForSelector("#form-admin-user-create");
await page.waitForTimeout(500);

const report = await page.evaluate((entries) => {
  const form = document.querySelector("#form-admin-user-create");
  for (const [k, v] of entries) {
    const f = form.querySelector(`[name="${k}"]`);
    if (!f) return { err: `missing ${k}` };
    f.value = v;
    f.dispatchEvent(new Event("input", { bubbles: true }));
    f.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const invalid = [...form.querySelectorAll(":invalid")].map((el) => ({
    name: el.name,
    msg: el.validationMessage,
    value: el.value
  }));
  const toolbar = document.querySelector('[data-action="toggle-admin-create-user-panel"]')?.closest(".toolbar");
  const panelHidden = toolbar?.nextElementSibling?.classList.contains("hidden");
  const deptVal = form.querySelector("select[name='department']")?.value;
  const compOpts = [...form.querySelectorAll("select[name='companyId'] option")].map((o) => o.value);
  form.requestSubmit();
  return {
    invalid,
    panelHidden,
    deptVal,
    compOpts,
    cityOptions: [...form.querySelectorAll("select[name='city'] option")].map((o) => o.value)
  };
}, pairs);

await page.waitForTimeout(2500);
const after = await page.evaluate(() => ({
  users: JSON.parse(localStorage.getItem("antares_users_v2") || "[]").length,
  toast: [...document.querySelectorAll("#toast-container .toast")]
    .map((n) => n.textContent.trim())
    .filter(Boolean)
}));

console.log(JSON.stringify({ report, after }, null, 2));
await browser.close();
