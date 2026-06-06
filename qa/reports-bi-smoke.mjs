/**
 * Smoke tests estáticos del módulo Reportería / BI
 * (`app.js`, `portal-runtime.js`, `router.js`, `reporteria.domain.js`, `reporteria.js`).
 * Ejecutar: node qa/reports-bi-smoke.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const appJs = readFileSync(path.join(ROOT, "app.js"), "utf8");
const portalRuntimeJs = readFileSync(path.join(ROOT, "modules", "core", "portal-runtime.js"), "utf8");
const routerJs = readFileSync(path.join(ROOT, "modules", "core", "router.js"), "utf8");
const reporteriaDomainJs = readFileSync(path.join(ROOT, "modules", "domain", "reporteria.domain.js"), "utf8");
const reportsRuntimeBundle = `${appJs}\n${portalRuntimeJs}\n${routerJs}\n${reporteriaDomainJs}`;
const reporteriaJs = readFileSync(path.join(ROOT, "modules", "app", "reporteria.js"), "utf8");
const feedbackJs = readFileSync(path.join(ROOT, "modules", "core", "feedback-messages.js"), "utf8");

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

function includesAll(needles, haystack, area) {
  const missing = needles.filter((n) => !haystack.includes(n));
  ok(missing.length === 0, `[${area}] Faltan: ${missing.join(", ")}`);
}

// 1) HTML y binds en reporteria.js; lógica pesada en portal-runtime + enganche en router
includesAll(
  ["function reportsHtml(", "function bindReportsWorkspaceControls(", "__portalModuleAfterRender.reports"],
  reporteriaJs,
  "reporteria-module"
);
includesAll(
  [
    "function buildReportsAnalyticsSnapshot(",
    "function reportsAnalyticsPanelHtml(",
    "export function wireReportsCharts(",
    "export async function exportReportsBiToExcel(",
    "export function normalizeReportsBiLayout(",
    "function persistReportsBiLayout(",
    "function reportsBiLayoutFromPanel(",
    'invokePortalViewAfterRenderHook(view)',
    'if (String(view || "") !== "reports") callApp("destroyReportsCharts")'
  ],
  reportsRuntimeBundle,
  "reports-functions-app"
);

// 2) KPIs con slaOk/slaTotal/activeOps (evita undefined en UI)
ok(
  reportsRuntimeBundle.includes("slaOk,") && reportsRuntimeBundle.includes("slaTotal: trips.length"),
  "kpis-sla-fields"
);
ok(reportsRuntimeBundle.includes("activeOps: requests.filter"), "kpis-activeOps");
ok(reportsRuntimeBundle.includes("reportsBiDisplayVal("), "display-val-helper");

// 3) Personalizador y acciones (plantillas en portal-runtime; permiso de export en reporteria.js)
includesAll(
  [
    "reports-bi-customizer",
    'data-action="reports-bi-layout-apply"',
    'data-action="reports-bi-layout-preset"',
    'data-action="reports-bi-export-excel"',
    'data-action="reports-bi-period-chip"',
    "readChecked("
  ],
  reportsRuntimeBundle,
  "reports-bi-customizer"
);
ok(reporteriaJs.includes('isViewAllowedForUser(user, "reports")'), "reports-export-permission-check");

// 4) Mensajes de feedback (definiciones en feedback-messages.js; uso en app/reporteria)
includesAll(
  ["reportBiLayoutSaved", "reportBiExcelExported", "reportBiExcelChartsPending"],
  feedbackJs + appJs + reporteriaJs,
  "feedback-keys"
);

// 5) Gráficas condicionadas al layout
ok(
  reportsRuntimeBundle.includes("if (L.charts.revenue)") &&
    reportsRuntimeBundle.includes("if (L.scores.thermoking)"),
  "charts-respect-layout"
);

// 6) HTML balance básico en panel BI (aperturas/cierres section)
const panelStart = portalRuntimeJs.indexOf("function reportsAnalyticsPanelHtml(snapshot, layout)");
ok(panelStart > 0, "reportsAnalyticsPanelHtml exists");
const panelChunk = portalRuntimeJs.slice(panelStart, panelStart + 12000);
const opens = (panelChunk.match(/<section class="reports-bi"/g) || []).length;
const closes = (panelChunk.match(/<\/section>/g) || []).length;
ok(opens === 1 && closes >= 1, `reports-bi section balance (opens=${opens}, closes=${closes})`);

console.log("OK reports-bi-smoke — módulo reportería/BI verificado estáticamente");
