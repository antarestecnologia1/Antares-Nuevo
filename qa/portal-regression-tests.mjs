import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

function read(relPath) {
  return readFileSync(path.join(ROOT, relPath), "utf8");
}

function ok(condition, message) {
  if (!condition) throw new Error(message);
}

function includesAll(content, needles, area) {
  const missing = needles.filter((needle) => !content.includes(needle));
  ok(missing.length === 0, `[${area}] Faltan: ${missing.join(", ")}`);
}

function regexCount(content, pattern) {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function run() {
  const indexHtml = read("index.html");
  const appJs = read("app.js");
  const portalArchitectureJs = read("modules/portal/architecture.js");
  const stylesCss = read("styles.css");
  const portalSource = `${appJs}\n${portalArchitectureJs}`;

  // 1) Index integrity
  includesAll(
    indexHtml,
    [
      './modules/core/persistence.js',
      './modules/portal/application.js',
      'id="hero"',
      'id="trusted"',
      'id="about"',
      'id="services"',
      'id="fleet"',
      'id="process"',
      'id="coverage"',
      'id="news"',
      'id="testimonials"',
      'id="careers"',
      'id="contact"'
    ],
    "index-sections"
  );

  // 2) Public translation engine presence
  includesAll(
    appJs,
    ["const PUBLIC_ES_EN_DICT", "function translatePublicText", "normalizePublicKey", "applyPublicLanguage"],
    "translation-core"
  );
  includesAll(
    appJs,
    [
      "Companies that trust us",
      "New automated Word contracts",
      "Send B2B request",
      "Track your shipment",
      "Enterprise standard"
    ],
    "translation-key-coverage"
  );

  // 3) Dark theme hardening (portal + public)
  includesAll(
    stylesCss,
    [
      'body[data-theme="dark"] .portal-main',
      'body[data-theme="dark"] .module-filters',
      'body[data-theme="dark"] .p-card',
      'body[data-theme="dark"] .kpi',
      'body[data-theme="dark"] .table-wrap',
      'body[data-theme="dark"] .user-card',
      'body[data-theme="dark"] .company-chip',
      'body[data-theme="dark"] .trip-preview',
      'body[data-theme="dark"] .perm-fieldset',
      'body[data-theme="dark"] .tabs'
    ],
    "dark-theme-selectors"
  );

  ok(
    regexCount(stylesCss, /body\[data-theme="dark"\]/g) >= 50,
    "[dark-theme-density] Se esperaban al menos 50 reglas dark-theme"
  );

  // 4) Portal modules coverage
  includesAll(
    portalSource,
    [
      "dashboard:",
      'title: "Dashboard"',
      "requests:",
      'title: "Solicitudes"',
      '"transport-requests":',
      'title: "Transporte · Solicitudes"',
      '"transport-trips":',
      'title: "Transporte · Viajes"',
      '"transport-vehicles":',
      'title: "Transporte · Camiones"',
      '"transport-drivers":',
      'title: "Transporte · Conductores"',
      '"transport-calendar":',
      'title: "Transporte · Calendario"',
      "history:",
      'title: "Transporte · Historial y reportes"',
      "reports:",
      'title: "Centro de reporteria"',
      "payroll:",
      'title: "Nomina"',
      "hiring:",
      'title: "Contratacion"',
      '"admin-users":',
      'title: "Administración · Usuarios y permisos"',
      "authorizations:",
      'title: "Autorizaciones"',
      "profile:",
      'title: "Mi perfil"',
      "notifications:",
      'title: "Notificaciones"'
    ],
    "portal-modules"
  );

  // 5) Contract flow: candidate + employee selection
  includesAll(
    appJs,
    [
      "const contractPeopleOptions",
      'name="personRef"',
      'value="candidate:',
      'value="employee:',
      'sourceType === "employee"',
      'sourceType === "candidate"'
    ],
    "contract-source-selection"
  );

  console.log("OK portal-regression-tests");
}

run();
