/**
 * Centro de reportería (`reports`): HTML y listeners del módulo (tabs export/BI, gráficas).
 * Carga con `defer` después de `app.js`.
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
  return `<section class="reports-studio">${reportsHero}${workspace}</section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ reportsHtml });
})();

function bindReportsWorkspaceControls() {
  if (String(state.currentView || "") !== "reports" || !nodes.viewRoot) return;
  const root = nodes.viewRoot.querySelector(".reports-workspace");
  if (!root) return;

  root.querySelectorAll("[data-action='reports-set-tab']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "export").trim();
      if (!["export", "bi"].includes(tab)) return;
      const prevTab = String(state.reportsUi?.tab || "export");
      state.reportsUi = { ...state.reportsUi, tab };
      if (
        switchModuleTabPanels({
          root,
          action: "reports-set-tab",
          activeValue: tab,
          valueAttr: "tab",
          panelAttr: "data-reports-panel",
          tabActiveClass: "is-active"
        })
      ) {
        if (prevTab === "bi" && tab !== "bi") destroyReportsCharts();
        if (tab === "bi") {
          const user = currentUser();
          const layout = loadReportsBiLayout();
          const snapshot = buildReportsAnalyticsSnapshot(user, state.reportsUi?.period || "90d");
          loadChartJsLib()
            .then(() => wireReportsCharts(snapshot, layout))
            .catch(() => {});
        }
        return;
      }
      destroyReportsCharts();
      renderPortalView();
    });
  });

  const applyExportPeriod = (period) => {
    const filters = normalizeReportsExportFilters({ ...(state.reportsUi?.exportFilters || {}), period });
    state.reportsUi = { ...state.reportsUi, exportFilters: filters };
    renderPortalView();
  };

  root.querySelectorAll("[data-action='reports-export-period-chip']").forEach((btn) => {
    btn.addEventListener("click", () => applyExportPeriod(btn.dataset.period));
  });

  const applyBiPeriod = (period) => {
    const p = String(period || "90d").trim();
    if (!["30d", "90d", "month", "ytd", "all"].includes(p)) return;
    state.reportsUi = { ...state.reportsUi, period: p, tab: "bi" };
    destroyReportsCharts();
    renderPortalView();
  };

  root.querySelectorAll("[data-action='reports-bi-period-chip']").forEach((btn) => {
    btn.addEventListener("click", () => applyBiPeriod(btn.dataset.period));
  });

  root.querySelector("[data-action='reports-bi-refresh']")?.addEventListener("click", () => {
    destroyReportsCharts();
    renderPortalView();
  });

  const applyBiLayout = (layout, notifyUser = true) => {
    persistReportsBiLayout(layout);
    destroyReportsCharts();
    renderPortalView();
    if (notifyUser) notify(userMessage("reportBiLayoutSaved"), "success");
  };

  root.querySelector("[data-action='reports-bi-layout-apply']")?.addEventListener("click", () => {
    applyBiLayout(reportsBiLayoutFromPanel(root));
  });

  root.querySelectorAll("[data-action='reports-bi-layout-preset']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = String(btn.dataset.preset || "all");
      applyBiLayout(reportsBiLayoutPreset(preset));
    });
  });

  root.querySelector("[data-action='reports-bi-export-excel']")?.addEventListener("click", async () => {
    const user = currentUser();
    if (!user || !isViewAllowedForUser(user, "reports")) {
      notify(userMessage("reportNoPermission"), "error");
      return;
    }
    const biRoot = root.querySelector(".reports-bi");
    const layout = loadReportsBiLayout();
    const snapshot = buildReportsAnalyticsSnapshot(user, state.reportsUi?.period || "90d");
    try {
      await exportReportsBiToExcel(snapshot, biRoot, layout);
      notify(userMessage("reportBiExcelExported"), "success");
    } catch (_e) {
      notify(userMessage("reportBiExcelError"), "error");
    }
  });

  if (String(state.reportsUi?.tab || "export") !== "bi") return;

  const user = currentUser();
  const layout = loadReportsBiLayout();
  const snapshot = buildReportsAnalyticsSnapshot(user, state.reportsUi?.period || "90d");
  loadChartJsLib()
    .then(() => wireReportsCharts(snapshot, layout))
    .catch(() => {
      const foot = root.querySelector(".reports-bi-foot");
      if (foot) foot.textContent = "No se pudieron cargar las gráficas. Verifique su conexión o recargue la página.";
    });
}

(function registerReportsPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.reports = bindReportsWorkspaceControls;
})();
