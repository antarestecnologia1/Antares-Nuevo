/**
 * Centro de reportería (`reports`): HTML y listeners del módulo (tabs export/métricas, gráficas).
 * Carga con `defer` después de `app.js`.
 */
function reportsHtml() {
  const user = currentUser();
  if (!state.reportsUi || typeof state.reportsUi !== "object") {
    state.reportsUi = { tab: "export", period: "all", layout: null, exportFilters: reportsExportDefaultFilters() };
  }
  const biLayout = loadReportsBiLayout();
  state.reportsUi = {
    ...state.reportsUi,
    layout: biLayout,
    exportFilters: normalizeReportsExportFilters(state.reportsUi?.exportFilters || { period: state.reportsUi?.period || "all" })
  };
  const tab = String(state.reportsUi.tab || "export");
  const cards = reportsBusinessCatalog();
  const visibleCount = cards.filter((c) => canAccessReport(user, c.id)).length;
  const period = state.reportsUi.period || state.reportsUi.exportFilters?.period || "all";
  let snapshot = { kpis: {}, periodLabel: typeof reportsPeriodLabel === "function" ? reportsPeriodLabel(period) : "Histórico completo" };
  try {
    if (typeof buildReportsAnalyticsSnapshot === "function") {
      snapshot = buildReportsAnalyticsSnapshot(user, period) || snapshot;
    }
  } catch (_e) {
    /* La cabecera usa ceros si el snapshot no está listo. */
  }
  const k = snapshot.kpis || {};
  const fmtCop = typeof snapshot.fmtCop === "function" ? snapshot.fmtCop : (n) => `$${Number(n || 0).toLocaleString("es-CO")}`;
  const reportsHero = moduleFleetHeroStrip([
    { label: "Solicitudes", value: k.requests ?? visibleCount },
    { label: "Viajes", value: k.trips ?? 0 },
    { label: "Recaudo", value: fmtCop(k.revenue || 0) },
    { label: "Flota libre", value: `${k.fleetAvailable ?? 0}/${k.fleetTotal ?? 0}` }
  ]);
  const exportActive = tab === "export";
  const biActive = tab === "bi";
  const analyticsPanel = biActive
    ? reportsAnalyticsPanelHtml(snapshot, biLayout)
    : `<div class="reports-bi reports-bi--lazy" data-reports-bi-lazy>
        ${emptyState("Los gráficos y métricas se cargarán al abrir esta pestaña para mantener rápida la vista de reportes.")}
      </div>`;
  const workspace = `<div class="reports-workspace">
    <nav class="reports-workspace-tabs" aria-label="Secciones de reportería">
      <button type="button" class="reports-workspace-tab${exportActive ? " is-active" : ""}" data-action="reports-set-tab" data-tab="export" aria-current="${exportActive ? "page" : "false"}">${IC.download} Reportes de negocio</button>
      <button type="button" class="reports-workspace-tab${biActive ? " is-active" : ""}" data-action="reports-set-tab" data-tab="bi" aria-current="${biActive ? "page" : "false"}">${IC.activity} Gráficos y métricas</button>
    </nav>
    <div class="reports-workspace-panel${exportActive ? "" : " hidden"}" data-reports-panel="export" role="tabpanel"${exportActive ? "" : " hidden"}>
      ${pcardWrap("file", "Catálogo de reportes", "Datos vivos de operación, flota, finanzas, RRHH y cumplimiento · PDF o Excel", reportsExportPanelHtml(user))}
    </div>
    <div class="reports-workspace-panel${biActive ? "" : " hidden"}" data-reports-panel="bi" role="tabpanel"${biActive ? "" : " hidden"}>
      ${analyticsPanel}
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
      if (tab === "bi" && root.querySelector("[data-reports-bi-lazy]")) {
        destroyReportsCharts();
        renderPortalView();
        return;
      }
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
          const snapshot = buildReportsAnalyticsSnapshot(user, state.reportsUi?.period || "all");
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
    state.reportsUi = { ...state.reportsUi, exportFilters: filters, period: filters.period };
    renderPortalView();
  };

  root.querySelectorAll("[data-action='reports-export-period-chip']").forEach((btn) => {
    btn.addEventListener("click", () => applyExportPeriod(btn.dataset.period));
  });

  const applyBiPeriod = (period) => {
    const p = String(period || "all").trim();
    if (!["30d", "90d", "month", "ytd", "all"].includes(p)) return;
    state.reportsUi = {
      ...state.reportsUi,
      period: p,
      tab: "bi",
      exportFilters: normalizeReportsExportFilters({ ...(state.reportsUi?.exportFilters || {}), period: p })
    };
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
    const snapshot = buildReportsAnalyticsSnapshot(user, state.reportsUi?.period || "all");
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
  const snapshot = buildReportsAnalyticsSnapshot(user, state.reportsUi?.period || "all");
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
