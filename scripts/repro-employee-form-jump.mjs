import { chromium } from "playwright";

const BASE_URL = process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/";

const KEYS = {
  users: "antares_users_v2",
  companies: "antares_companies_v2",
  positions: "antares_positions_v2",
  session: "antares_session_v2"
};

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
      address: "Sede principal"
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
  [KEYS.session]: {
    userId: "admin-1",
    role: "admin",
    email: "admin.qa@antares.test",
    lastActivityAt: Date.now(),
    profileSnapshot: { id: "admin-1", name: "Admin QA", email: "admin.qa@antares.test", role: "admin" }
  }
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.addInitScript((payload) => {
  const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
  localStorage.clear();
  Object.entries(payload).forEach(([key, value]) => {
    localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
  });
}, seedStore);

const page = await context.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 200)));

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.waitForTimeout(800);

await page.evaluate(() => {
  window.location.hash = "#portal/payroll";
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});
await page.waitForTimeout(800);

// Expand the create-employee panel if collapsed
const expanded = await page.evaluate(() => {
  const form = document.querySelector("#form-employee");
  if (form && form.offsetParent) return "already-visible";
  const btn = document.querySelector("[data-create-panel='create-employee'] button, [data-action='toggle-create-panel'][data-panel='create-employee']");
  if (btn) {
    btn.click();
    return "clicked-toggle";
  }
  return "no-toggle-found";
});
console.log("expand:", expanded);
await page.waitForTimeout(900);

const visible = await page.evaluate(() => {
  const form = document.querySelector("#form-employee");
  return form ? Boolean(form.offsetParent) : false;
});
console.log("form visible:", visible);

if (!visible) {
  // dump candidates for toggle
  const dump = await page.evaluate(() =>
    [...document.querySelectorAll("button")].slice(0, 200).map((b) => `${b.className}|${(b.textContent || "").trim().slice(0, 40)}|${b.dataset ? JSON.stringify({ ...b.dataset }) : ""}`).filter((s) => /abrir|crear|empleado|panel/i.test(s))
  );
  console.log(dump.join("\n"));
  await page.screenshot({ path: "test-results/repro-emp-novisible.png", fullPage: false });
  await browser.close();
  process.exit(1);
}

await page.screenshot({ path: "test-results/repro-emp-0.png" });

// Now click through visible fields in step 1 and record scroll positions + form top
const fieldSelectors = await page.evaluate(() => {
  const step = document.querySelector("#form-employee .hr-form-step.is-active");
  const els = [...step.querySelectorAll("input, select, textarea")].filter((el) => el.offsetParent && el.type !== "file" && el.type !== "hidden");
  return els.map((el, i) => {
    el.setAttribute("data-repro-idx", String(i));
    return `${el.tagName}[name=${el.name || "?"}]`;
  });
});
console.log("fields:", fieldSelectors.join(", "));

const snap = () =>
  page.evaluate(() => {
    const form = document.querySelector("#form-employee");
    const rect = form.getBoundingClientRect();
    const scroller = document.scrollingElement;
    return {
      scrollY: Math.round(scroller.scrollTop),
      formTopViewport: Math.round(rect.top),
      formTopDoc: Math.round(rect.top + scroller.scrollTop),
      formHeight: Math.round(rect.height)
    };
  });

let prev = await snap();
console.log("initial:", JSON.stringify(prev));

for (let i = 0; i < fieldSelectors.length; i++) {
  const sel = `#form-employee .hr-form-step.is-active [data-repro-idx="${i}"]`;
  try {
    await page.click(sel, { timeout: 3000 });
  } catch (e) {
    console.log(`click ${i} (${fieldSelectors[i]}) failed: ${e.message.split("\n")[0]}`);
    continue;
  }
  await page.waitForTimeout(450);
  const cur = await snap();
  const dScroll = cur.scrollY - prev.scrollY;
  const dHeight = cur.formHeight - prev.formHeight;
  const dTopDoc = cur.formTopDoc - prev.formTopDoc;
  const flag = Math.abs(dScroll) > 2 || Math.abs(dHeight) > 2 || Math.abs(dTopDoc) > 2 ? "  <-- MOVED" : "";
  console.log(`after click ${i} ${fieldSelectors[i]}: ${JSON.stringify(cur)} dScroll=${dScroll} dHeight=${dHeight} dTopDoc=${dTopDoc}${flag}`);
  if (flag) await page.screenshot({ path: `test-results/repro-emp-moved-${i}.png` });
  prev = cur;
}

await browser.close();
