/**
 * Smoke test del formulario de registro (#form-register).
 * Sirve index estático y mockea POST /auth/register-portal.
 */
import { chromium } from "playwright";

const BASE = process.env.ANTARES_TEST_BASE || "http://localhost:4178";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const log = (m) => console.error("[reg-test]", m);
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.ANTARES_PW_CHANNEL || "chrome"
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err?.message || err)));

  let capturedPayload = null;
  await page.route("**/api/auth/register-portal", async (route) => {
    const req = route.request();
    assert(req.method() === "POST", "register-portal debe ser POST");
    capturedPayload = req.postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Solicitud de registro recibida (test).",
        pendingApproval: true
      })
    });
  });

  log("goto");
  await page.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
  log("wait helpers");
  for (let i = 0; i < 60; i++) {
    const ready = await page.evaluate(() => {
      const api = window.AntaresApi;
      return (
        typeof window.departmentOptions === "function" &&
        typeof window.attachDepartmentCitySelects === "function" &&
        typeof window.syncPhoneHiddenFull === "function" &&
        typeof window.validateColombianDocument === "function" &&
        !!(api && typeof api.postJsonPublic === "function")
      );
    });
    if (ready) break;
    if (i === 59) throw new Error("Helpers de registro no cargaron a tiempo");
    await page.waitForTimeout(250);
  }

  log("open auth");
  await page.click("#open-auth");
  await page.waitForSelector("#auth-tab-register", { timeout: 15000 });
  log("click register tab");
  await page.click("#auth-tab-register");
  await page.waitForSelector("#form-register", { timeout: 20000 });
  log("form ready");

  const helpers = await page.evaluate(() => ({
    deptOptionsLen: typeof window.departmentOptions === "function" ? window.departmentOptions().length : 0,
    phoneOptsLen:
      typeof window.registerPhoneCountryOptionsHtml === "function"
        ? window.registerPhoneCountryOptionsHtml().length
        : 0,
    hasApiBase: Boolean(window.AntaresApi?.getBase?.())
  }));
  assert(helpers.deptOptionsLen > 100, `departmentOptions vacío (${helpers.deptOptionsLen})`);
  assert(helpers.phoneOptsLen > 20, `phone options vacío (${helpers.phoneOptsLen})`);

  // Tipo de vínculo
  await page.click('[data-registration-kind="empleado_interno"]');
  const kindEmp = await page.inputValue("#register-registration-kind");
  assert(kindEmp === "empleado_interno", `registrationKind interno: ${kindEmp}`);
  await page.click('[data-registration-kind="cliente"]');
  assert((await page.inputValue("#register-registration-kind")) === "cliente", "kind cliente");

  // Natural vs jurídica
  await page.selectOption('select[name="personType"]', "juridica");
  await page.waitForTimeout(100);
  const empresaVisible = await page.isVisible("#register-doc-empresa");
  const personaHidden = await page.locator("#register-doc-persona").isHidden();
  assert(empresaVisible, "bloque empresa debe verse en jurídica");
  assert(personaHidden, "bloque persona debe ocultarse en jurídica");
  await page.selectOption('select[name="personType"]', "natural");
  await page.waitForTimeout(100);
  assert(await page.isVisible("#register-doc-persona"), "bloque persona visible en natural");
  assert(await page.locator("#register-doc-empresa").isHidden(), "bloque empresa oculto en natural");

  // Departamento → ciudad
  log("dept/city");
  const deptSelect = page.locator("#register-department");
  const deptValues = await deptSelect.locator("option").evaluateAll((opts) =>
    opts.map((o) => o.value).filter(Boolean)
  );
  assert(deptValues.includes("Cundinamarca") || deptValues.includes("Antioquia"), "catálogo de departamentos");
  const dept = deptValues.includes("Cundinamarca") ? "Cundinamarca" : deptValues[0];
  await deptSelect.selectOption(dept);
  await page.waitForTimeout(300);
  let cityValues = await page.locator("#register-city option").evaluateAll((opts) =>
    opts.map((o) => o.value).filter(Boolean)
  );
  if (!cityValues.length) {
    // Reatachar por si el bind inicial no corrió (runtime tarde).
    await page.evaluate((d) => {
      const form = document.getElementById("form-register");
      if (form && typeof window.attachDepartmentCitySelects === "function") {
        window.attachDepartmentCitySelects(form, {
          departmentSelector: "select[name='department']",
          citySelector: "select[name='city']"
        });
      }
      const deptEl = form?.querySelector("select[name='department']");
      if (deptEl) {
        deptEl.value = d;
        deptEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, dept);
    await page.waitForTimeout(300);
    cityValues = await page.locator("#register-city option").evaluateAll((opts) =>
      opts.map((o) => o.value).filter(Boolean)
    );
  }
  assert(cityValues.length > 0, `ciudades para ${dept}: ${cityValues.length}`);
  const city = cityValues.includes("Bogotá")
    ? "Bogotá"
    : cityValues.includes("Bogota")
      ? "Bogota"
      : cityValues[0];
  await page.selectOption("#register-city", city);
  log(`dept=${dept} city=${city}`);

  // Teléfono
  await page.fill(".js-register-phone-national", "3001234567");
  await page.waitForTimeout(150);
  const phoneFull = await page.inputValue(".js-register-phone-full");
  const phoneDigits = String(phoneFull || "").replace(/\D/g, "");
  assert(phoneDigits.startsWith("57") && phoneDigits.length === 12, `phone sync: ${phoneFull}`);

  // Resto del formulario (persona natural)
  await page.fill('input[name="firstName"]', "Carlos");
  await page.fill('input[name="middleName"]', "Andres");
  await page.fill('input[name="lastName"]', "Perez");
  await page.fill('input[name="secondLastName"]', "Lopez");
  await page.selectOption('select[name="documentType"]', "CC");
  await page.fill('input[name="taxId"]', "1020304050");
  await page.fill('input[name="birthDate"]', "1990-05-15");
  await page.selectOption('select[name="gender"]', "Masculino");
  await page.fill('input[name="position"]', "Analista");
  await page.fill('input[name="workArea"]', "Operaciones");
  await page.fill('input[name="address"]', "Calle 100 # 10-20");
  const email = `reg.test.${Date.now()}@example.com`;
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "Segura123!");
  await page.fill('input[name="passwordConfirm"]', "Segura123!");
  await page.check('input[name="acceptTerms"]');

  // Interceptar API pública y rellenar valores vía DOM (evita restrict/handlers de Playwright fill).
  const formSnapshot = await page.evaluate(
    ({ email, dept, city }) => {
      const api = window.AntaresApi;
      if (!api) throw new Error("AntaresApi ausente");
      const stubBase = api.getBase?.() || "http://127.0.0.1:9";
      window.__ANTARES_API_BASE__ = stubBase;
      api.getBase = () => stubBase;
      window.__REGISTER_TEST_PAYLOAD__ = null;
      const orig = api.postJsonPublic?.bind(api);
      api.postJsonPublic = async (path, body) => {
        window.__REGISTER_TEST_PAYLOAD__ = { path, body };
        if (String(path).includes("register-portal")) {
          return { message: "Solicitud de registro recibida (test).", pendingApproval: true };
        }
        return orig ? orig(path, body) : {};
      };

      const form = document.getElementById("form-register");
      const set = (name, value) => {
        const el = form.querySelector(`[name="${name}"]`);
        if (!el) return false;
        if (el.type === "checkbox") el.checked = Boolean(value);
        else el.value = String(value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      };
      set("firstName", "Carlos");
      set("middleName", "Andres");
      set("lastName", "Perez");
      set("secondLastName", "Lopez");
      set("personType", "natural");
      form.querySelector("select[name='personType']")?.dispatchEvent(new Event("change", { bubbles: true }));
      set("documentType", "CC");
      set("taxId", "1020304050");
      set("birthDate", "1990-05-15");
      set("gender", "Masculino");
      set("position", "Analista");
      set("workArea", "Operaciones");
      set("department", dept);
      form.querySelector("select[name='department']")?.dispatchEvent(new Event("change", { bubbles: true }));
      set("city", city);
      set("address", "Calle 100 # 10-20");
      set("email", email);
      set("password", "Segura123!");
      set("passwordConfirm", "Segura123!");
      set("acceptTerms", true);
      const nat = form.querySelector(".js-register-phone-national");
      if (nat) {
        nat.value = "3001234567";
        nat.dispatchEvent(new Event("input", { bubbles: true }));
      }
      window.syncPhoneHiddenFull?.(form, "register");

      const values = {};
      for (const name of [
        "firstName",
        "taxId",
        "position",
        "email",
        "phone",
        "department",
        "city",
        "password",
        "acceptTerms"
      ]) {
        const el = form.querySelector(`[name="${name}"]`);
        values[name] = el?.type === "checkbox" ? el.checked : el?.value;
      }
      return { values, checkValidity: form.checkValidity() };
    },
    { email, dept, city }
  );
  log(`pre-submit ${JSON.stringify(formSnapshot)}`);

  await page.evaluate(() => {
    window.__REGISTER_TEST_TRACE__ = [];
    const push = (m) => window.__REGISTER_TEST_TRACE__.push(m);
    const prevNotify = window.notify;
    window.notify = (msg, type, ...rest) => {
      push(`notify:${type}:${msg}`);
      return typeof prevNotify === "function" ? prevNotify(msg, type, ...rest) : undefined;
    };
    const form = document.getElementById("form-register");
    form?.addEventListener(
      "submit",
      () => push("submit-event"),
      true
    );
    const api = window.AntaresApi;
    const prevPost = api.postJsonPublic;
    api.postJsonPublic = async (path, body) => {
      push(`post:${path}`);
      window.__REGISTER_TEST_PAYLOAD__ = { path, body };
      if (String(path).includes("register-portal")) {
        return { message: "Solicitud de registro recibida (test).", pendingApproval: true };
      }
      return prevPost ? prevPost.call(api, path, body) : {};
    };
  });

  log("submit");
  await page.locator("#form-register button.register-submit-btn[type='submit']").click();
  for (let i = 0; i < 40; i++) {
    const got = await page.evaluate(() => window.__REGISTER_TEST_PAYLOAD__ != null);
    if (got) break;
    if (i === 39) {
      const hint = await page.evaluate(() => ({
        trace: window.__REGISTER_TEST_TRACE__ || [],
        invalid: [...document.querySelectorAll("#form-register .field-invalid, #form-register :invalid")]
          .slice(0, 8)
          .map((el) => el.name || el.className),
        phone: document.querySelector(".js-register-phone-full")?.value || "",
        apiBase: window.AntaresApi?.getBase?.() || null,
        tab: document.querySelector("#auth-tab-login")?.className || ""
      }));
      throw new Error(`No llegó payload de registro: ${JSON.stringify(hint)}`);
    }
    await page.waitForTimeout(250);
  }
  log("payload ok");

  const result = await page.evaluate(() => window.__REGISTER_TEST_PAYLOAD__);
  assert(String(result.path).includes("register-portal"), `path: ${result.path}`);
  const body = result.body || {};
  assert(body.firstName === "CARLOS" || body.firstName === "Carlos", `firstName: ${body.firstName}`);
  assert(body.lastName === "PEREZ" || body.lastName === "Perez", `lastName: ${body.lastName}`);
  assert(String(body.personType).toLowerCase().includes("natural") || body.personType === "Natural", `personType: ${body.personType}`);
  assert(String(body.documentType).toUpperCase() === "CC", `documentType: ${body.documentType}`);
  assert(String(body.taxId).replace(/\D/g, "") === "1020304050", `taxId: ${body.taxId}`);
  assert(body.email === email, `email: ${body.email}`);
  assert(body.registrationKind === "cliente", `registrationKind: ${body.registrationKind}`);
  assert(body.acceptTerms === true, "acceptTerms");
  assert(body.password === "Segura123!", "password");
  assert(String(body.department).includes(dept.split(" ")[0]) || body.department === dept, `department: ${body.department}`);
  assert(body.city, `city missing`);
  const bodyPhoneDigits = String(body.phone || "").replace(/\D/g, "");
  assert(bodyPhoneDigits.includes("3001234567"), `phone payload: ${body.phone}`);

  // Tras éxito debe volver a tab login / banner
  await page.waitForTimeout(500);
  const onLoginTab = await page.evaluate(() => {
    const loginTab = document.getElementById("auth-tab-login");
    return loginTab?.classList?.contains("active") || loginTab?.getAttribute("aria-selected") === "true";
  });
  assert(onLoginTab, "tras registro exitoso debe activar tab Ingresar");

  // Segundo recorrido: jurídica (UI + submit)
  log("juridica");
  await page.click("#auth-tab-register");
  await page.waitForSelector("#form-register", { timeout: 10000 });
  const emailJur = `reg.jur.${Date.now()}@example.com`;
  const jurPayload = await page.evaluate(
    ({ emailJur, dept, city }) => {
      window.__REGISTER_TEST_PAYLOAD__ = null;
      const form = document.getElementById("form-register");
      const set = (name, value) => {
        const el = form.querySelector(`[name="${name}"]`);
        if (!el) return;
        if (el.type === "checkbox") el.checked = Boolean(value);
        else el.value = String(value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      set("personType", "juridica");
      form.querySelector("select[name='personType']")?.dispatchEvent(new Event("change", { bubbles: true }));
      set("firstName", "Ana");
      set("lastName", "Gomez");
      set("companyNit", "900123456-7");
      set("personalDocumentType", "CC");
      set("personalTaxId", "1020304051");
      set("birthDate", "1988-01-20");
      set("gender", "Femenino");
      set("position", "Gerente");
      set("workArea", "Comercial");
      set("department", dept);
      form.querySelector("select[name='department']")?.dispatchEvent(new Event("change", { bubbles: true }));
      set("city", city);
      set("address", "Carrera 7 # 1-1");
      set("email", emailJur);
      set("password", "Segura123!");
      set("passwordConfirm", "Segura123!");
      set("acceptTerms", true);
      set("registrationKind", "cliente");
      const nat = form.querySelector(".js-register-phone-national");
      if (nat) {
        nat.value = "3109876543";
        nat.dispatchEvent(new Event("input", { bubbles: true }));
      }
      window.syncPhoneHiddenFull?.(form, "register");
      form.requestSubmit();
      return {
        empresaVisible: !form.querySelector("#register-doc-empresa")?.hidden,
        companyRequired: form.querySelector("input[name='companyNit']")?.required === true
      };
    },
    { emailJur, dept, city }
  );
  assert(jurPayload.empresaVisible, "bloque empresa visible");
  assert(jurPayload.companyRequired, "companyNit required");
  for (let i = 0; i < 40; i++) {
    const got = await page.evaluate(() => window.__REGISTER_TEST_PAYLOAD__ != null);
    if (got) break;
    if (i === 39) {
      const trace = await page.evaluate(() => window.__REGISTER_TEST_TRACE__ || []);
      throw new Error(`Jurídica sin payload: ${JSON.stringify(trace.slice(-8))}`);
    }
    await page.waitForTimeout(250);
  }
  const jurBody = await page.evaluate(() => window.__REGISTER_TEST_PAYLOAD__?.body || {});
  assert(String(jurBody.personType).toLowerCase().includes("juridica") || jurBody.personType === "Juridica", `jur personType: ${jurBody.personType}`);
  assert(String(jurBody.documentType).toUpperCase() === "NIT", `jur documentType: ${jurBody.documentType}`);
  assert(String(jurBody.companyNit || "").includes("900123456"), `jur companyNit: ${jurBody.companyNit}`);
  assert(String(jurBody.personalTaxId || "").replace(/\D/g, "") === "1020304051", `jur personalTaxId: ${jurBody.personalTaxId}`);

  const criticalConsole = consoleErrors.filter(
    (t) =>
      !/favicon|turnstile|cloudflare|Failed to load resource/i.test(t) &&
      !/net::ERR_/i.test(t) &&
      !/font-size:0/i.test(t)
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        email,
        emailJur,
        department: dept,
        city,
        phoneFull,
        payloadKeys: Object.keys(body).sort(),
        personType: body.personType,
        jurPersonType: jurBody.personType,
        jurDocumentType: jurBody.documentType,
        registrationKind: body.registrationKind,
        consoleErrors: criticalConsole.slice(0, 8)
      },
      null,
      2
    )
  );

  await browser.close();
}

main().catch((err) => {
  console.error("REGISTER_TEST_FAILED:", err?.message || err);
  process.exit(1);
});
