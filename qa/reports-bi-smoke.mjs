/**
 * Smoke tests estáticos del módulo Reportería / BI (app.js).
 * Ejecutar: node qa/reports-bi-smoke.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const appJs = readFileSync(path.join(ROOT, "app.js"), "utf8");

function ok(cond, msg) {
  if (!cond) throw new Error(msg);
}

function includesAll(needles, area) {
  const missing = needles.filter((n) => !appJs.includes(n));
  ok(missing.length === 0, `[${area}] Faltan: ${missing.join(", ")}`);
}

// 1) Funciones y wiring del módulo
includesAll(
  [
    "function reportsHtml(",
    "function bindReportsWorkspaceControls(",
    "function buildReportsAnalyticsSnapshot(",
    "function reportsAnalyticsPanelHtml(",
    "function wireReportsCharts(",
    "function exportReportsBiToExcel(",
    "function normalizeReportsBiLayout(",
    "function persistReportsBiLayout(",
    "function reportsBiLayoutFromPanel(",
    'if (String(view || "") === "reports") bindReportsWorkspaceControls()',
    "else destroyReportsCharts()"
  ],
  "reports-functions"
);

// 2) KPIs con slaOk/slaTotal/activeOps (evita undefined en UI)
ok(appJs.includes("slaOk,") && appJs.includes("slaTotal: trips.length"), "kpis-sla-fields");
ok(appJs.includes("activeOps: requests.filter"), "kpis-activeOps");
ok(appJs.includes("reportsBiDisplayVal("), "display-val-helper");

// 3) Personalizador y acciones
includesAll(
  [
    "reports-bi-customizer",
    "data-action=\"reports-bi-layout-apply\"",
    "data-action=\"reports-bi-layout-preset\"",
    "data-action=\"reports-bi-export-excel\"",
    "data-action=\"reports-bi-period-chip\"",
    "readChecked(",
    "isViewAllowedForUser(user, \"reports\")"
  ],
  "reports-bi-customizer"
);

// 4) Mensajes de feedback
includesAll(
  [
    "reportBiLayoutSaved",
    "reportBiExcelExported",
    "reportBiExcelChartsPending"
  ],
  "feedback-keys"
);

// 5) Gráficas condicionadas al layout
ok(
  appJs.includes("if (L.charts.revenue)") && appJs.includes("if (L.scores.thermoking)"),
  "charts-respect-layout"
);

// 6) HTML balance básico en panel BI (aperturas/cierres section)
const panelStart = appJs.indexOf('function reportsAnalyticsPanelHtml(snapshot, layout)');
ok(panelStart > 0, "reportsAnalyticsPanelHtml exists");
const panelChunk = appJs.slice(panelStart, panelStart + 12000);
const opens = (panelChunk.match(/<section class="reports-bi"/g) || []).length;
const closes = (panelChunk.match(/<\/section>/g) || []).length;
ok(opens === 1 && closes >= 1, `reports-bi section balance (opens=${opens}, closes=${closes})`);

console.log("OK reports-bi-smoke — módulo reportería/BI verificado estáticamente");
