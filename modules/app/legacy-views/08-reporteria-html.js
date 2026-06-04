/**
 * Reportería — exportación y BI.
 * Extraído desde app.js — carga con defer después de app.js.
 */
function reportsHtml() {
  const user = currentUser();
  if (!state.reportsUi || typeof state.reportsUi !== "object") {
    state.reportsUi = { tab: "export", period: "90d", layout: null, exportFilters: reportsExportDefaultFilters() };
  }
  const biLayout = loadReportsBiLayout();
  state.reportsUi = {
    ...state.reportsUi,
    layout: biLayout,
    exportFilters: normalizeReportsExportFilters(state.reportsUi?.exportFilters || { period: state.reportsUi?.period || "90d" })
  };
  const tab = String(state.reportsUi.tab || "export");
  const cards = [
    { id: "executive_control_tower" },
    { id: "service_levels" },
    { id: "fleet_summary" },
    { id: "trips_operations" },
    { id: "requests_lifecycle" },
    { id: "drivers_performance" },
    { id: "fuel_operations" },
    { id: "maintenance_fleet" },
    { id: "revenue_by_route" },
    { id: "request_funnel" },
    { id: "document_compliance" },
    { id: "payroll_summary" },
    { id: "hiring_pipeline" },
    { id: "labor_compliance" },
    { id: "users_access" },
    { id: "authorizations_traceability" }
  ];
  const visibleCount = cards.filter((c) => canAccessReport(user, c.id)).length;
  const reportsHero = moduleFleetHeroStrip([
    { label: "Reportes disponibles", value: visibleCount },
    { label: "Catálogo", value: cards.length },
    { label: "Vista activa", value: tab === "bi" ? "Analítica" : "Exportar" },
    { label: "Formatos", value: "PDF + Excel" }
  ]);
  const exportActive = tab === "export";
  const biActive = tab === "bi";
  const snapshot = buildReportsAnalyticsSnapshot(user, state.reportsUi.period || "90d");
  const workspace = `<div class="reports-workspace">
    <nav class="reports-workspace-tabs" aria-label="Secciones de reportería">
      <button type="button" class="reports-workspace-tab${exportActive ? " is-active" : ""}" data-action="reports-set-tab" data-tab="export" aria-current="${exportActive ? "page" : "false"}">${IC.download} Exportar reportes</button>
      <button type="button" class="reports-workspace-tab${biActive ? " is-active" : ""}" data-action="reports-set-tab" data-tab="bi" aria-current="${biActive ? "page" : "false"}">${IC.activity} Analítica operativa</button>
    </nav>
    <div class="reports-workspace-panel${exportActive ? "" : " hidden"}" data-reports-panel="export" role="tabpanel"${exportActive ? "" : " hidden"}>
      ${pcardWrap("file", "Catálogo de reportes", "Descargue PDF o Excel (CSV) por área de negocio", reportsExportPanelHtml(user))}
    </div>
    <div class="reports-workspace-panel${biActive ? "" : " hidden"}" data-reports-panel="bi" role="tabpanel"${biActive ? "" : " hidden"}>
      ${reportsAnalyticsPanelHtml(snapshot, biLayout)}
    </div>
  </div>`;
  return reportsHero + workspace;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({reportsHtml});
})();
