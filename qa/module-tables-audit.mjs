/**
 * Auditoría estática: tablas y vistas de datos por módulo del portal.
 * Ejecutar: node qa/module-tables-audit.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

/** @type {Array<{id:string, label:string, viewId:string, htmlFn:string, files:string[], tablePatterns:string[], bindPattern?:string, uiType:'table'|'cards'|'mixed'|'settings'}>} */
const MODULES = [
  {
    id: "1",
    label: "Dashboard",
    viewId: "dashboard",
    htmlFn: "viewDashboard",
    files: ["modules/app/dashboard.js"],
    tablePatterns: ["table-wrap", "<table", "<thead"],
    bindPattern: "__portalModuleAfterRender.dashboard",
    uiType: "mixed"
  },
  {
    id: "2",
    label: "Mis solicitudes",
    viewId: "requests",
    htmlFn: "requestsHtml",
    files: ["modules/app/solicitudes-html.js", "modules/app/mis-solicitudes.js"],
    tablePatterns: ["table-wrap", "request-ops-fleet-table", "buildRequestOpsListRow"],
    bindPattern: "__portalModuleAfterRender.requests",
    uiType: "mixed"
  },
  {
    id: "3",
    label: "Viajes",
    viewId: "transport-trips",
    htmlFn: "transportTripsHtml",
    files: ["modules/app/viajes.js"],
    tablePatterns: ["table-wrap", "trips-table-wrap", "route-rates-table"],
    bindPattern: '__portalModuleAfterRender["transport-trips"]',
    uiType: "mixed"
  },
  {
    id: "4",
    label: "Camiones",
    viewId: "transport-vehicles",
    htmlFn: "vehiclesHtml",
    files: ["modules/app/camiones.js"],
    tablePatterns: ["table-wrap", "vehicle-fleet-table"],
    bindPattern: '__portalModuleAfterRender["transport-vehicles"]',
    uiType: "mixed"
  },
  {
    id: "5",
    label: "Conductores",
    viewId: "transport-drivers",
    htmlFn: "driversHtml",
    files: ["modules/app/conductores.js"],
    tablePatterns: ["table-wrap", "driver-fleet-table"],
    bindPattern: '__portalModuleAfterRender["transport-drivers"]',
    uiType: "mixed"
  },
  {
    id: "6",
    label: "Calendario",
    viewId: "transport-calendar",
    htmlFn: "transportCalendarHtml",
    files: ["modules/app/calendario.js"],
    tablePatterns: ["calendar-shell", "cal-day-list"],
    bindPattern: '__portalModuleAfterRender["transport-calendar"]',
    uiType: "cards"
  },
  {
    id: "7",
    label: "Historial",
    viewId: "history",
    htmlFn: "historyHtml",
    files: ["modules/app/historial.js", "modules/core/portal-runtime.js"],
    tablePatterns: ["hist-table-wrap", "renderHistoryAuditList", "history-layout"],
    bindPattern: "__portalModuleAfterRender.history",
    uiType: "mixed"
  },
  {
    id: "8",
    label: "Reportería",
    viewId: "reports",
    htmlFn: "reportsHtml",
    files: ["modules/app/reporteria.js", "modules/core/portal-runtime.js"],
    tablePatterns: ["report-preview-table", "reports-workspace"],
    bindPattern: "__portalModuleAfterRender.reports",
    uiType: "mixed"
  },
  {
    id: "9",
    label: "Gestión humana",
    viewId: "payroll",
    htmlFn: "payrollHtml",
    files: ["modules/app/gestion-humana.js", "modules/app/gestion-humana-html.js"],
    tablePatterns: ["table-wrap", "payroll-table-wrap", "payroll-runs-list-view"],
    bindPattern: "__portalModuleAfterRender.payroll",
    uiType: "mixed"
  },
  {
    id: "10",
    label: "Contratación",
    viewId: "hiring",
    htmlFn: "hiringHtml",
    files: ["modules/app/contratacion.js", "modules/app/contratacion-html.js"],
    tablePatterns: ["hiring-table-wrap", "hiring-table--"],
    bindPattern: "__portalModuleAfterRender.hiring",
    uiType: "mixed"
  },
  {
    id: "11",
    label: "Cumplimiento laboral y SST",
    viewId: "labor-compliance",
    htmlFn: "laborComplianceHtml",
    files: ["modules/app/cumplimiento-laboral.js"],
    tablePatterns: ["table-wrap", "<thead><tr><th>Control</th>"],
    bindPattern: '__portalModuleAfterRender["labor-compliance"]',
    uiType: "table"
  },
  {
    id: "12",
    label: "Contacto web (B2B)",
    viewId: "contact-leads",
    htmlFn: "contactLeadsHtml",
    files: ["modules/app/contacto-b2b.js"],
    tablePatterns: ["b2b-leads-mosaic", "b2b-leads-card"],
    bindPattern: null,
    uiType: "cards"
  },
  {
    id: "13",
    label: "Usuarios y permisos",
    viewId: "admin-users",
    htmlFn: "adminUsersHtml",
    files: ["modules/app/usuarios-permisos.js"],
    tablePatterns: ["directory-card", "table-wrap"],
    bindPattern: '__portalModuleAfterRender["admin-users"]',
    uiType: "mixed"
  },
  {
    id: "14",
    label: "Autorizaciones",
    viewId: "authorizations",
    htmlFn: "authorizationsHtml",
    files: ["modules/app/autorizaciones.js", "modules/core/auth.js"],
    tablePatterns: ["auth-pending-table", "buildPendingApprovalsTableHtml"],
    bindPattern: "__portalModuleAfterRender.authorizations",
    uiType: "mixed"
  },
  {
    id: "15",
    label: "Mi perfil",
    viewId: "profile",
    htmlFn: "profileHtml",
    files: ["modules/app/mi-perfil.js"],
    tablePatterns: ["profile-shell", "profile-hero-card"],
    bindPattern: "__portalModuleAfterRender.profile",
    uiType: "cards"
  },
  {
    id: "16",
    label: "Timbre",
    viewId: "notifications",
    htmlFn: "notificationsHtml",
    files: ["modules/app/notificaciones.js", "modules/domain/notificaciones.domain.js"],
    tablePatterns: ["ntf-bell-toggle", "toggleNotificationSoundMuted"],
    bindPattern: "__portalModuleAfterRender.notifications",
    uiType: "settings"
  },
  {
    id: "17",
    label: "Avisos",
    viewId: "notifications",
    htmlFn: "notificationsHtml",
    files: ["modules/app/notificaciones.js", "modules/domain/notificaciones.domain.js"],
    tablePatterns: ["ntf-card", "toggleNotificationAlertsEnabled"],
    bindPattern: "__portalModuleAfterRender.notifications",
    uiType: "settings"
  },
  {
    id: "18",
    label: "Notificaciones",
    viewId: "notifications",
    htmlFn: "notificationsHtml",
    files: ["modules/app/notificaciones.js"],
    tablePatterns: ["ntf-list", "ntf-card"],
    bindPattern: "__portalModuleAfterRender.notifications",
    uiType: "cards"
  }
];

function run() {
  const arch = read("modules/portal/architecture.js");
  ok(arch, "Falta modules/portal/architecture.js");

  const results = [];
  const errors = [];

  for (const mod of MODULES) {
    const bundle = mod.files.map((f) => read(f)).filter(Boolean).join("\n");
    const issues = [];

    if (!bundle) {
      issues.push(`Sin archivos legibles: ${mod.files.join(", ")}`);
    } else {
      if (!bundle.includes(`function ${mod.htmlFn}`) && !bundle.includes(`${mod.htmlFn}(`)) {
        issues.push(`No se encontró renderer ${mod.htmlFn}`);
      }
      const missingPatterns = mod.tablePatterns.filter((p) => !bundle.includes(p));
      if (missingPatterns.length) {
        issues.push(`Patrones UI faltantes: ${missingPatterns.join(", ")}`);
      }
      if (mod.bindPattern && !bundle.includes(mod.bindPattern.split(".")[0])) {
        issues.push(`Sin binding post-render (${mod.bindPattern})`);
      }
    }

    const viewDef =
      new RegExp(`["']?${mod.viewId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?\\s*:\\s*\\{`).test(arch) ||
      arch.includes(`${mod.viewId}:`);
    if (!viewDef) {
      issues.push(`Vista ${mod.viewId} no registrada en architecture.js`);
    }

    const syntaxOk = mod.files.every((f) => {
      try {
        execSync(`node --check "${path.join(ROOT, f)}"`, { stdio: "pipe" });
        return true;
      } catch {
        return false;
      }
    });

    if (!syntaxOk) issues.push("Error de sintaxis JS en algún archivo");

    const status = issues.length ? "FAIL" : "OK";
    if (issues.length) errors.push({ mod, issues });
    results.push({ ...mod, status, issues });
  }

  console.log("\n=== Auditoría de tablas / vistas de datos — Portal Antares ===\n");
  for (const r of results) {
    const icon = r.status === "OK" ? "✓" : "✗";
    const ui = { table: "Tabla", cards: "Tarjetas/lista", mixed: "Tabla + tarjetas", settings: "Preferencias" }[r.uiType];
    console.log(`${icon} ${r.id.padStart(2)}. ${r.label} [${ui}] — ${r.status}`);
    if (r.issues.length) r.issues.forEach((i) => console.log(`      · ${i}`));
  }

  console.log(`\nResumen: ${results.filter((r) => r.status === "OK").length}/${results.length} módulos OK\n`);

  if (errors.length) {
    process.exitCode = 1;
    throw new Error(`${errors.length} módulo(s) con problemas`);
  }
}

run();
