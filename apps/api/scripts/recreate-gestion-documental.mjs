/**
 * Regenera Gestión documental tras un purge:
 * carpetas + contratos/cartas oficiales + colillas pagadas.
 *
 * Requiere API + portal estáticos y credenciales de un admin con permiso de subida.
 *
 * Uso:
 *   set ANTARES_ADMIN_EMAIL=...
 *   set ANTARES_ADMIN_PASSWORD=...
 *   node apps/api/scripts/recreate-gestion-documental.mjs
 *
 * Opcional:
 *   ANTARES_PORTAL_BASE=http://localhost:4178
 *   ANTARES_API_BASE=http://localhost:4000
 *   ANTARES_PW_CHANNEL=chrome
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(API_ROOT, "..", "..");
const ENV_PATH = path.join(API_ROOT, ".env");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") process.env[key] = val;
  }
}

function log(msg) {
  console.log(`[recreate-dms] ${msg}`);
}

async function main() {
  loadEnvFile(ENV_PATH);

  const email = String(process.env.ANTARES_ADMIN_EMAIL || "").trim();
  const password = String(process.env.ANTARES_ADMIN_PASSWORD || "");
  const portalBase = String(process.env.ANTARES_PORTAL_BASE || "http://localhost:4178").replace(
    /\/+$/,
    ""
  );
  const apiBase = String(
    process.env.ANTARES_API_BASE || process.env.__ANTARES_API_BASE__ || "http://localhost:4000"
  ).replace(/\/+$/, "");

  if (!email || !password) {
    console.error(
      [
        "Faltan credenciales de administrador.",
        "Defina ANTARES_ADMIN_EMAIL y ANTARES_ADMIN_PASSWORD e intente de nuevo.",
        "",
        "PowerShell:",
        '  $env:ANTARES_ADMIN_EMAIL="su@correo.com"',
        '  $env:ANTARES_ADMIN_PASSWORD="su-clave"',
        "  node apps/api/scripts/recreate-gestion-documental.mjs"
      ].join("\n")
    );
    process.exit(1);
  }

  // Smoke API
  const health = await fetch(`${apiBase}/api/health`).catch((e) => ({ ok: false, error: e }));
  if (!health?.ok) {
    throw new Error(
      `API no responde en ${apiBase}/api/health. Arranque la API (apps/api) e intente de nuevo.`
    );
  }
  log(`API OK (${apiBase})`);

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.ANTARES_PW_CHANNEL || "chrome"
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(120000);

  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err?.message || err)));

  // Forzar API base en localhost (antares.public.js)
  await page.addInitScript((base) => {
    try {
      localStorage.setItem("antares_api_base", base);
    } catch (_e) {
      /* noop */
    }
    window.__ANTARES_API_BASE__ = base;
  }, apiBase);

  log(`Abriendo portal ${portalBase}`);
  await page.goto(`${portalBase}/index.html`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForFunction(
    () => typeof window.AntaresApi?.postJsonPublic === "function" || typeof window.AntaresApi?.getBase === "function",
    null,
    { timeout: 60000 }
  );

  await page.evaluate((base) => {
    try {
      localStorage.setItem("antares_api_base", base);
      localStorage.removeItem("antares_company_documents_v1");
      localStorage.removeItem("antares_company_document_folders_v1");
      localStorage.removeItem("antares_employee_documents_v1");
      localStorage.removeItem("antares_employee_document_folders_v1");
    } catch (_e) {
      /* noop */
    }
    if (window.AntaresApi) {
      window.AntaresApi.getBase = () => base;
    }
    window.__ANTARES_API_BASE__ = base;
  }, apiBase);

  log("Login…");
  await page.click("#open-auth");
  await page.waitForSelector("#form-login", { timeout: 20000 });
  await page.fill('#form-login input[name="email"]', email);
  await page.fill('#form-login input[name="password"]', password);
  await page.click('#form-login [data-login-submit], #form-login button[type="submit"]');

  await page.waitForFunction(
    () =>
      document.body.classList.contains("portal-mode") ||
      Boolean(document.getElementById("portal-app") && !document.getElementById("portal-app").classList.contains("hidden")),
    null,
    { timeout: 90000 }
  );
  log("Portal abierto");

  // Esperar helpers DMS (módulo se carga al entrar / al navegar)
  await page.waitForFunction(
    () => typeof window.resetAndRecreateCompanyDocuments === "function" || typeof window.ensureCompanyDocumentStructure === "function",
    null,
    { timeout: 120000 }
  ).catch(async () => {
    // Navegar al módulo si aún no cargó
    await page.evaluate(() => {
      if (typeof window.navigate === "function") window.navigate("document-management");
      else if (typeof window.renderPortalView === "function") {
        try {
          // state puede no estar expuesto; intentar click de menú
        } catch (_e) {}
      }
    });
    const link = page.locator('[data-view="document-management"], a[href*="document-management"], [data-nav="document-management"]').first();
    if (await link.count()) await link.click();
  });

  // Intentar abrir vista DMS por menú
  const dmsNav = page.locator('[data-view="document-management"]').first();
  if (await dmsNav.count()) {
    await dmsNav.click().catch(() => {});
  } else {
    await page.evaluate(() => {
      try {
        if (window.state) window.state.currentView = "document-management";
        window.renderPortalView?.();
      } catch (_e) {
        /* noop */
      }
    });
  }

  await page.waitForFunction(() => typeof window.resetAndRecreateCompanyDocuments === "function", null, {
    timeout: 120000
  });

  log("Ejecutando resetAndRecreateCompanyDocuments({ force: true })…");
  const result = await page.evaluate(async () => {
    const out = await window.resetAndRecreateCompanyDocuments({ force: true });
    return out || { ok: false, message: "sin resultado" };
  });

  // Contar docs locales post-regeneración
  const counts = await page.evaluate(() => {
    const docsKey = "antares_company_documents_v1";
    const foldersKey = "antares_company_document_folders_v1";
    const read = (k) => {
      try {
        const raw = localStorage.getItem(k);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr.length : 0;
      } catch (_e) {
        return -1;
      }
    };
    return { docs: read(docsKey), folders: read(foldersKey), result };
  });

  console.log(JSON.stringify({ ok: Boolean(result?.ok), result, counts, consoleErrors: consoleErrors.slice(0, 10) }, null, 2));

  if (!result?.ok) {
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  log("Listo.");
}

main().catch((err) => {
  console.error("RECREATE_FAILED:", err?.message || err);
  process.exit(1);
});
