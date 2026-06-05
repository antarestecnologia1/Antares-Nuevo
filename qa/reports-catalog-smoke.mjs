/**
 * Smoke tests estáticos del catálogo de reportería (`app.js` + `modules/core/portal-runtime.js`).
 * Ejecutar: node qa/reports-catalog-smoke.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const appJs = readFileSync(path.join(ROOT, "app.js"), "utf8");
const portalRuntimeJs = readFileSync(path.join(ROOT, "modules", "core", "portal-runtime.js"), "utf8");
const publicSiteI18nJs = readFileSync(path.join(ROOT, "modules", "domain", "public-site.i18n.js"), "utf8");
const reportsCatalogSource = `${appJs}\n${portalRuntimeJs}\n${publicSiteI18nJs}`;

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

function includesAll(needles, area) {
  const missing = needles.filter((n) => !reportsCatalogSource.includes(n));
  ok(missing.length === 0, `[${area}] Faltan: ${missing.join(", ")}`);
}

includesAll(
  [
    "Resumen ejecutivo de gestión",
    "Cumplimiento de nivel de servicio",
    "Disponibilidad y productividad de flota",
    "Trazabilidad de solicitudes",
    "Desempeño y habilitación de conductores",
    "Consumo y costos de combustible",
    "Conversión operativa de solicitudes",
    "Gobierno de usuarios y accesos",
    "Trazabilidad de autorizaciones",
    "Consolidado de nómina",
    "Corte exportable",
    "Periodo de análisis"
  ],
  "professional-report-names"
);

includesAll(
  [
    'return "En curso";',
    "function slaDelayMinutesForRequest(",
    "delayMinutes",
    "lifecycleNote",
    "licenseRisk",
    "contractDate",
    "employeeDoc",
    "joinDate",
    "costPerDowntimeHour",
    "sharePct",
    "soatStatus",
    "Costo / hora fuera",
    "function normalizeReportsExportFilters(",
    "function reportsExportFiltersHtml(",
    'data-action="reports-export-period-chip"',
    "reportsFilterItemsByPeriod("
  ],
  "report-data-coverage"
);

ok(!reportsCatalogSource.includes("Embudo de solicitudes"), "legacy-funnel-name-still-present");
ok(!reportsCatalogSource.includes("Costos conductor"), "legacy-driver-report-name-still-present");
ok(
  !reportsCatalogSource.includes("request.deliveredAt || request.closedAt || request.trip.etaDelivery"),
  "sla-fallback-still-uses-eta-as-delivery"
);

console.log("OK reports-catalog-smoke — catálogo y datasets de reportería verificados estáticamente");
