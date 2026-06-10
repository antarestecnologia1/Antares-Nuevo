/**
 * Transporte · Historial (`history`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
const HISTORY_RENDER_WINDOW = 40;

function normalizeHistoryLayout(raw) {
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

function historyViewToggleHtml(layout) {
  const viewLayout = normalizeHistoryLayout(layout);
  return `<div class="transport-ops-layout hist-view-toggle" role="group" aria-label="Vista del historial">
    <button type="button" class="btn btn-sm ${viewLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="history-layout" data-layout="cards">${IC.grid || IC.layers} Tarjetas</button>
    <button type="button" class="btn btn-sm ${viewLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="history-layout" data-layout="list">${IC.list || IC.file} Lista</button>
  </div>`;
}

globalThis.normalizeHistoryLayout = normalizeHistoryLayout;
globalThis.historyViewToggleHtml = historyViewToggleHtml;

function historyRenderWindowSlice(list, limit) {
  const arr = Array.isArray(list) ? list : [];
  const max = Number.isFinite(limit) && limit > 0 ? limit : HISTORY_RENDER_WINDOW;
  return arr.slice(0, max);
}

function historyRenderWindowMoreBar(total, shown, action) {
  if (total <= shown) return "";
  return `<div class="render-window-more hist-render-more"><button type="button" class="btn btn-outline btn-sm" data-action="${escapeAttr(action)}">${IC.chevronDown || ""} Ver más · ${shown} de ${total}</button></div>`;
}

function renderHistoryModuleHead(counts) {
  const kpis = [
    { label: "Registros", value: counts.all, tone: "neutral" },
    { label: "Cerradas", value: counts.closed, tone: "ok" },
    { label: "En operación", value: counts.active, tone: counts.active ? "warn" : "ok" },
    { label: "Pend. viaje", value: counts.pending, tone: counts.pending ? "warn" : "ok" }
  ];
  const items = kpis
    .map(({ label, value, tone }) => {
      const toneClass = tone && tone !== "neutral" ? ` gh-studio-kpi--${tone}` : "";
      return `<div class="gh-studio-kpi${toneClass}"><dt>${escapeHtml(label)}</dt><dd><strong>${escapeHtml(String(value))}</strong></dd></div>`;
    })
    .join("");
  return `<header class="gh-studio-head history-studio-head">
    <div class="gh-studio-head__brand">
      <span class="gh-studio-head__badge">Transporte · Consulta</span>
      <h2>Historial operativo</h2>
      <p class="gh-studio-head__tagline">Consulte solicitudes, viajes, registros de flota y la bitácora de cambios del sistema.</p>
    </div>
    <dl class="gh-studio-kpis" aria-label="Indicadores del historial">${items}</dl>
  </header>`;
}

function renderHistorySectionNav(activeId, counts) {
  const tabs = [
    { id: "explore", label: "Solicitudes", icon: "clock", count: counts.all, title: "Solicitudes y viajes" },
    { id: "fleet", label: "Flota técnica", icon: "fuel", count: counts.fleetLogs, title: "Combustible y taller" },
    { id: "audit", label: "Trazabilidad", icon: "activity", count: counts.audit, title: "Bitácora de movimientos" }
  ];
  return `<nav class="payroll-data-nav payroll-data-nav--minimal history-section-nav" role="tablist" aria-label="Secciones del historial">
    ${tabs
      .map((t) => {
        const active = activeId === t.id;
        const iconSvg = IC[t.icon] ? `<span class="payroll-data-nav-ico" aria-hidden="true">${IC[t.icon]}</span>` : "";
        return `<button type="button" role="tab" class="payroll-data-nav-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="history-workspace" data-workspace="${escapeAttr(t.id)}" title="${escapeAttr(t.title)}">${iconSvg}<span>${escapeHtml(t.label)}</span><span class="payroll-data-nav-count">${escapeHtml(String(t.count))}</span></button>`;
      })
      .join("")}
  </nav>`;
}

function renderHistoryQuickFilters(quickFilter, counts) {
  const pill = (key, label) =>
    `<button type="button" class="ops-filter-pill${quickFilter === key ? " is-active" : ""}" data-action="history-quick-filter" data-filter="${escapeAttr(key)}"><span>${escapeHtml(label)}</span><strong>${counts[key] ?? 0}</strong></button>`;
  return `<div class="hist-quick-filters ops-filters-bar" role="group" aria-label="Filtro rápido">
    ${pill("all", "Todo")}
    ${pill("active", "En ruta")}
    ${pill("closed", "Cerradas")}
    ${pill("pending", "Pend. viaje")}
    ${pill("cancelled", "Anuladas")}
  </div>`;
}

function renderHistoryExploreToolbar(viewLayout, clientOptions) {
  return `<form id="history-filter" class="hist-filter-form" novalidate>
    <div class="transport-ops-toolbar hist-toolbar">
      <label class="transport-ops-search hist-search">
        <span class="muted">${IC.search || IC.filter} Buscar</span>
        <input type="search" name="q" placeholder="Solicitud, cliente, ruta, placa, viaje…" autocomplete="off" />
      </label>
      ${historyViewToggleHtml(viewLayout)}
      <details class="hist-advanced-filters">
        <summary class="btn btn-sm btn-action">${IC.filter} Filtros</summary>
        <div class="hist-advanced-filters-body">
          <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
          <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
          <label>${fieldLabel(IC.user, "Cliente")}<select name="client"><option value="">Todos</option>${clientOptions}</select></label>
          <label>${fieldLabel(IC.activity, "Estado exacto")}<select name="status">${historyStatusFilterOptions()}</select></label>
          <button class="btn btn-sm btn-action" type="reset">${IC.x} Limpiar</button>
        </div>
      </details>
    </div>
  </form>`;
}

function renderHistoryInsightCards(topClientsList, topVehiclesList, rules, rulesUpdatedLabel) {
  return renderHrAlertCards([
    {
      label: "Clientes frecuentes",
      value: topClientsList.length ? topClientsList.join(" · ") : "Sin datos",
      icon: IC.user,
      tone: "info"
    },
    {
      label: "Flota asignada",
      value: topVehiclesList.length ? topVehiclesList.join(" · ") : "Sin datos",
      icon: IC.truck,
      tone: "info"
    },
    {
      label: "Viático interdepartamental",
      value: `$${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")} / viaje`,
      help: `Actualizado: ${rulesUpdatedLabel}`,
      icon: IC.dollar,
      tone: "ok"
    }
  ]);
}

function renderHistoryFleetSubNav(fleetTab, fuelCount, techCount) {
  const tab = (id, label, iconKey, count) => {
    const active = fleetTab === id;
    return `<button type="button" role="tab" class="auth-tab-btn${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="history-fleet-tab" data-fleet-tab="${escapeAttr(id)}">${IC[iconKey] || ""}<span>${escapeHtml(label)}</span><span class="auth-tab-badge">${count}</span></button>`;
  };
  return `<div class="auth-tabs-layout hist-fleet-subnav"><nav class="auth-tabs-bar" role="tablist" aria-label="Combustible o taller">
    ${tab("fuel", "Combustible", "fuel", fuelCount)}
    ${tab("technical", "Taller", "activity", techCount)}
  </nav></div>`;
}

function historyHtml() {
  const allRequests = reqRead();
  const histUi = state.historyUi || { workspace: "explore", quickFilter: "all", fleetTab: "fuel", layout: "cards" };
  histUi.workspace = normalizeHistoryWorkspace(histUi.workspace);
  state.historyUi = histUi;
  const workspace = String(histUi.workspace || "explore");
  const quickFilter = String(histUi.quickFilter || "all");
  const viewLayout = normalizeHistoryLayout(histUi.layout);
  const viewLayoutHint = viewLayout === "list" ? " · vista lista" : "";
  const counts = historyQuickFilterCounts(allRequests);
  const filteredExplore = applyHistoryFilters(allRequests, { quickFilter });
  const renderLimit = Number(state.historyRenderLimit) > 0 ? Number(state.historyRenderLimit) : HISTORY_RENDER_WINDOW;
  const exploreShown = historyRenderWindowSlice(filteredExplore, renderLimit);
  const users = readArray(KEYS.users);
  const drivers = readArray(KEYS.drivers);
  const vehicles = readArray(KEYS.vehicles);
  const rules = read(KEYS.travelAllowanceRules, { interDepartmentTripAmount: 85000 });
  const rulesUpdatedLabel = fmtDateOr(rules.updatedAt || rules.createdAt, "—");
  const clientOptions = users
    .filter((u) => u.role === ROLES.CLIENT)
    .map((u) => `<option value="${u.id}">${escapeHtml(String(u.company || u.name || ""))}</option>`)
    .join("");
  const driverOptions = drivers.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join("");
  const vehicleOptions = vehicles
    .map((v) => `<option value="${v.id}">${escapeHtml(`${v.plate} · ${v.type}`)}</option>`)
    .join("");

  const fuelLogsAll = readFuelLogs();
  const technicalLogsAll = readVehicleTechnicalLogs();
  const auditEntries = buildHistoryAuditEntries();
  const auditCreateCount = auditEntries.filter((entry) => entry.action === "create").length;
  const auditUpdateCount = auditEntries.filter((entry) => entry.action === "update").length;
  const auditDeleteCount = auditEntries.filter((entry) => entry.action === "delete").length;
  const fleetTab = String(histUi.fleetTab || "fuel");
  const fuelKpisAll = historyFleetFuelKpis(fuelLogsAll);
  const techKpisAll = historyFleetTechnicalKpis(technicalLogsAll);
  const fleetRenderLimit = Number(state.historyFleetRenderLimit) > 0 ? Number(state.historyFleetRenderLimit) : HISTORY_RENDER_WINDOW;
  const auditRenderLimit = Number(state.historyAuditRenderLimit) > 0 ? Number(state.historyAuditRenderLimit) : HISTORY_RENDER_WINDOW;
  const fuelShown = historyRenderWindowSlice(fuelLogsAll, fleetRenderLimit);
  const techShown = historyRenderWindowSlice(technicalLogsAll, fleetRenderLimit);
  const auditShown = historyRenderWindowSlice(auditEntries, auditRenderLimit);

  const sectionCounts = {
    all: allRequests.length,
    fleetLogs: fuelLogsAll.length + technicalLogsAll.length,
    audit: auditEntries.length
  };

  const fuelFilterFields = `
    <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
    <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
    <label>${fieldLabel(IC.truck, "Camión")}<select name="vehicleId"><option value="">Todos</option>${vehicleOptions}</select></label>
    <label>${fieldLabel(IC.user, "Conductor")}<select name="driverId"><option value="">Todos</option>${driverOptions}</select></label>
    <label>${fieldLabel(IC.briefcase, "Pagado por")}
      <select name="paidBy">
        <option value="">Todos</option>
        <option value="empresa">Empresa</option>
        <option value="conductor">Conductor (reembolso)</option>
      </select>
    </label>`;

  const techFilterFields = `
    <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
    <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
    <label>${fieldLabel(IC.truck, "Camión")}<select name="vehicleId"><option value="">Todos</option>${vehicleOptions}</select></label>
    <label>${fieldLabel(IC.activity, "Tipo")}
      <select name="type">
        <option value="">Todos</option>
        <option value="preventivo">Preventivo</option>
        <option value="correctivo">Correctivo</option>
        <option value="falla">Falla técnica</option>
      </select>
    </label>
    <label>${fieldLabel(IC.check, "Estado")}
      <select name="status">
        <option value="">Todos</option>
        <option>Pendiente</option>
        <option>En proceso</option>
        <option>Resuelto</option>
      </select>
    </label>`;

  const topClientsList = topClients(allRequests);
  const topVehiclesList = topVehicles(allRequests);

  const explorePanel = `<div class="hist-panel${workspace === "explore" ? "" : " hidden"}" data-history-panel="explore" role="tabpanel">
    <section class="gh-data-panel hist-data-panel">
      ${renderHistoryQuickFilters(quickFilter, counts)}
      ${renderHistoryInsightCards(topClientsList, topVehiclesList, rules, rulesUpdatedLabel)}
      ${renderHistoryExploreToolbar(viewLayout, clientOptions)}
      <div class="hist-result-bar">
        <p class="hist-result-meta"><span id="history-result-count">${filteredExplore.length}</span> resultado${filteredExplore.length === 1 ? "" : "s"}${escapeHtml(viewLayoutHint)}</p>
        <span class="muted hist-result-sort">Más recientes primero</span>
      </div>
      <div id="history-results">${renderHistoryResultsList(exploreShown, viewLayout)}</div>
      ${historyRenderWindowMoreBar(filteredExplore.length, exploreShown.length, "history-render-more")}
    </section>
  </div>`;

  const fuelKpiStrip = historyFleetKpiStrip([
    { label: "Cargas", value: fuelKpisAll.count },
    { label: "Litros", value: `${fuelKpisAll.liters.toLocaleString("es-CO", { maximumFractionDigits: 1 })} L` },
    { label: "Costo total", value: `$${fuelKpisAll.cost.toLocaleString("es-CO")}` },
    { label: "Promedio $/L", value: fuelKpisAll.avgPerLiter > 0 ? `$${fuelKpisAll.avgPerLiter.toLocaleString("es-CO")}` : "—" },
    { label: "Reembolso", value: `$${fuelKpisAll.reimburse.toLocaleString("es-CO")}`, tone: fuelKpisAll.reimburse > 0 ? "warn" : undefined }
  ]);

  const techKpiStrip = historyFleetKpiStrip([
    { label: "Novedades", value: techKpisAll.count },
    { label: "Costo taller", value: `$${techKpisAll.cost.toLocaleString("es-CO")}` },
    { label: "Horas inactivas", value: `${techKpisAll.downtime.toLocaleString("es-CO")} h` },
    { label: "Abiertas", value: techKpisAll.open, tone: techKpisAll.open > 0 ? "warn" : "ok" }
  ]);

  const fleetPanel = `<div class="hist-panel${workspace === "fleet" ? "" : " hidden"}" data-history-panel="fleet" role="tabpanel">
    <section class="gh-data-panel hist-data-panel hist-data-panel--fleet">
      <header class="payroll-panel-intro ops-block-head hist-panel-intro">
        <h3>Flota técnica</h3>
        <p class="ops-block-lead muted">Consulte cargas de combustible y novedades de taller. Los registros nuevos se crean desde <strong>Camiones</strong>.</p>
      </header>
      ${renderHistoryFleetSubNav(fleetTab, fuelLogsAll.length, technicalLogsAll.length)}
      <div class="hist-fleet-pane${fleetTab === "fuel" ? "" : " hidden"}" data-fleet-panel="fuel" role="tabpanel">
        ${fuelKpiStrip}
        ${historyFleetFilterToolbar("history-fuel-filter", fuelFilterFields, viewLayout)}
        <div class="hist-result-bar">
          <p class="hist-result-meta"><span id="history-fuel-result-count">${fuelLogsAll.length}</span> carga${fuelLogsAll.length === 1 ? "" : "s"}${escapeHtml(viewLayoutHint)}</p>
          <span class="muted hist-result-sort">Más recientes primero</span>
        </div>
        <div id="history-fuel-results">${renderHistoryFuelLogsList(fuelShown, viewLayout)}</div>
        ${historyRenderWindowMoreBar(fuelLogsAll.length, fuelShown.length, "history-fuel-render-more")}
      </div>
      <div class="hist-fleet-pane${fleetTab === "technical" ? "" : " hidden"}" data-fleet-panel="technical" role="tabpanel">
        ${techKpiStrip}
        ${historyFleetFilterToolbar("history-technical-filter", techFilterFields, viewLayout)}
        <div class="hist-result-bar">
          <p class="hist-result-meta"><span id="history-technical-result-count">${technicalLogsAll.length}</span> novedad${technicalLogsAll.length === 1 ? "" : "es"}${escapeHtml(viewLayoutHint)}</p>
          <span class="muted hist-result-sort">Más recientes primero</span>
        </div>
        <div id="history-technical-results">${renderHistoryTechnicalLogsList(techShown, viewLayout)}</div>
        ${historyRenderWindowMoreBar(technicalLogsAll.length, techShown.length, "history-technical-render-more")}
      </div>
    </section>
  </div>`;

  const auditPanel = `<div class="hist-panel${workspace === "audit" ? "" : " hidden"}" data-history-panel="audit" role="tabpanel">
    <section class="gh-data-panel hist-data-panel hist-data-panel--audit">
      <header class="payroll-panel-intro ops-block-head hist-panel-intro">
        <h3>Trazabilidad</h3>
        <p class="ops-block-lead muted">Bitácora de creaciones, actualizaciones y eliminaciones en usuarios, flota, solicitudes y viajes.</p>
      </header>
      ${historyFleetKpiStrip([
        { label: "Eventos", value: auditEntries.length },
        { label: "Creaciones", value: auditCreateCount, tone: auditCreateCount ? "ok" : undefined },
        { label: "Actualizaciones", value: auditUpdateCount, tone: auditUpdateCount ? "warn" : undefined },
        { label: "Eliminaciones", value: auditDeleteCount, tone: auditDeleteCount ? "warn" : undefined }
      ])}
      <div class="transport-ops-toolbar hist-toolbar hist-toolbar--audit">${historyViewToggleHtml(viewLayout)}</div>
      <div class="hist-result-bar">
        <p class="hist-result-meta"><span id="history-audit-result-count">${auditEntries.length}</span> evento${auditEntries.length === 1 ? "" : "s"}${escapeHtml(viewLayoutHint)}</p>
        <span class="muted hist-result-sort">Más recientes primero</span>
      </div>
      <div id="history-audit-results">${renderHistoryAuditList(auditShown, viewLayout)}</div>
      ${historyRenderWindowMoreBar(auditEntries.length, auditShown.length, "history-audit-render-more")}
    </section>
  </div>`;

  const moduleHead = renderHistoryModuleHead(counts);
  const sectionNav = renderHistorySectionNav(workspace, sectionCounts);

  return `<section class="gh-studio history-shell hr-flow-shell hr-module-pro--payroll" data-history-workspace="${escapeAttr(workspace)}">
    ${moduleHead}
    <div class="hist-shell-body">
      <div class="payroll-data-toolbar payroll-data-toolbar--compact hist-section-toolbar">${sectionNav}</div>
      <div class="hist-panels">${explorePanel}${fleetPanel}${auditPanel}</div>
    </div>
  </section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ historyHtml });
})();

(function registerHistoryPortalBinds() {
  "use strict";

  function bindHistoryPortalControls() {
    if (String(state.currentView || "") !== "history" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='history-workspace']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = normalizeHistoryWorkspace(btn.dataset.workspace);
        state.historyUi = { ...(state.historyUi || { quickFilter: "all", fleetTab: "fuel", layout: "cards" }), workspace: next };
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        state.historyFleetRenderLimit = HISTORY_RENDER_WINDOW;
        state.historyAuditRenderLimit = HISTORY_RENDER_WINDOW;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeHistoryLayout(btn.dataset.layout);
        state.historyUi = { ...(state.historyUi || { workspace: "explore", quickFilter: "all", fleetTab: "fuel" }), layout };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='history-fleet-tab']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = String(btn.dataset.fleetTab || "fuel");
        if (!["fuel", "technical"].includes(next)) return;
        state.historyUi = { ...(state.historyUi || { workspace: "fleet", quickFilter: "all" }), workspace: "fleet", fleetTab: next };
        state.historyFleetRenderLimit = HISTORY_RENDER_WINDOW;
        renderPortalView();
      });
    });

    const bindRenderMore = (action, stateKey) => {
      nodes.viewRoot.querySelectorAll(`[data-action='${action}']`).forEach((btn) => {
        btn.addEventListener("click", () => {
          state[stateKey] = (Number(state[stateKey]) || HISTORY_RENDER_WINDOW) + HISTORY_RENDER_WINDOW;
          renderPortalView();
        });
      });
    };
    bindRenderMore("history-render-more", "historyRenderLimit");
    bindRenderMore("history-fuel-render-more", "historyFleetRenderLimit");
    bindRenderMore("history-technical-render-more", "historyFleetRenderLimit");
    bindRenderMore("history-audit-render-more", "historyAuditRenderLimit");

    const bindHistoryFleetFilters = (formId, applyFn, countSelector, resultsSelector, kpiSelector, kpiBuilder, renderListFn) => {
      const form = document.getElementById(formId);
      if (!form) return;
      portalUpgradeDates(form);
      const renderFn = typeof renderListFn === "function" ? renderListFn : renderHistoryFuelLogsList;
      const refresh = () => {
        const items = applyFn(readFormEntriesNormalized(form));
        const layout = normalizeHistoryLayout((state.historyUi || {}).layout);
        const limit = Number(state.historyFleetRenderLimit) > 0 ? Number(state.historyFleetRenderLimit) : HISTORY_RENDER_WINDOW;
        const shown = historyRenderWindowSlice(items, limit);
        const mount = document.querySelector(resultsSelector);
        const countEl = document.querySelector(countSelector);
        if (countEl) countEl.textContent = String(items.length);
        if (mount) mount.innerHTML = renderFn(shown, layout);
        if (typeof kpiBuilder === "function" && kpiSelector) {
          refreshHistoryFleetKpiStrip(kpiSelector, kpiBuilder(items));
        }
      };
      form.addEventListener("change", refresh);
      form.addEventListener("input", (event) => {
        if (event.target?.matches?.("input[type='search']")) {
          state.historyFleetRenderLimit = HISTORY_RENDER_WINDOW;
          refresh();
        }
      });
      form.addEventListener("reset", () => {
        state.historyFleetRenderLimit = HISTORY_RENDER_WINDOW;
        setTimeout(refresh, 0);
      });
      refresh();
    };

    bindHistoryFleetFilters(
      "history-fuel-filter",
      (data) => applyHistoryFleetFuelFilters(readFuelLogs(), data),
      "#history-fuel-result-count",
      "#history-fuel-results",
      '[data-fleet-panel="fuel"] .hist-kpi-strip',
      (items) => {
        const kpis = historyFleetFuelKpis(items);
        return [
          { label: "Cargas", value: kpis.count },
          { label: "Litros", value: `${kpis.liters.toLocaleString("es-CO", { maximumFractionDigits: 1 })} L` },
          { label: "Costo total", value: `$${kpis.cost.toLocaleString("es-CO")}` },
          { label: "Promedio $/L", value: kpis.avgPerLiter > 0 ? `$${kpis.avgPerLiter.toLocaleString("es-CO")}` : "—" },
          { label: "Reembolso", value: `$${kpis.reimburse.toLocaleString("es-CO")}`, tone: kpis.reimburse > 0 ? "warn" : undefined }
        ];
      },
      renderHistoryFuelLogsList
    );

    bindHistoryFleetFilters(
      "history-technical-filter",
      (data) => applyHistoryFleetTechnicalFilters(readVehicleTechnicalLogs(), data),
      "#history-technical-result-count",
      "#history-technical-results",
      '[data-fleet-panel="technical"] .hist-kpi-strip',
      (items) => {
        const kpis = historyFleetTechnicalKpis(items);
        return [
          { label: "Novedades", value: kpis.count },
          { label: "Costo taller", value: `$${kpis.cost.toLocaleString("es-CO")}` },
          { label: "Horas inactivas", value: `${kpis.downtime.toLocaleString("es-CO")} h` },
          { label: "Abiertas", value: kpis.open, tone: kpis.open > 0 ? "warn" : "ok" }
        ];
      },
      renderHistoryTechnicalLogsList
    );

    nodes.viewRoot.querySelectorAll("[data-action='history-quick-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = String(btn.dataset.filter || "all");
        state.historyUi = { ...(state.historyUi || { workspace: "explore" }), quickFilter: next };
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        document.querySelectorAll("[data-action='history-quick-filter']").forEach((pill) => {
          pill.classList.toggle("is-active", String(pill.dataset.filter || "") === next);
        });
        const historyFilter = document.getElementById("history-filter");
        if (typeof window.__historyApplyFilters === "function") window.__historyApplyFilters();
        else if (historyFilter) historyFilter.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    const historyFilter = document.getElementById("history-filter");
    if (historyFilter) {
      portalUpgradeDates(historyFilter);
      const refreshHistoryResults = () => {
        const histUi = state.historyUi || { quickFilter: "all", layout: "cards" };
        const layout = normalizeHistoryLayout(histUi.layout);
        const data = readFormEntriesNormalized(historyFilter);
        const items = applyHistoryFilters(reqRead(), { quickFilter: histUi.quickFilter, formData: data });
        const limit = Number(state.historyRenderLimit) > 0 ? Number(state.historyRenderLimit) : HISTORY_RENDER_WINDOW;
        const shown = historyRenderWindowSlice(items, limit);
        const mount = document.getElementById("history-results");
        const countEl = document.getElementById("history-result-count");
        if (countEl) countEl.textContent = String(items.length);
        if (mount) mount.innerHTML = renderHistoryResultsList(shown, layout);
      };
      window.__historyApplyFilters = refreshHistoryResults;
      historyFilter.addEventListener("submit", (event) => {
        event.preventDefault();
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        refreshHistoryResults();
      });
      historyFilter.addEventListener("change", () => {
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        refreshHistoryResults();
      });
      historyFilter.querySelectorAll("select, input.portal-date-dmy, input[type='date']").forEach((field) => {
        field.addEventListener("change", () => {
          state.historyRenderLimit = HISTORY_RENDER_WINDOW;
          refreshHistoryResults();
        });
      });
      const liveSearch = historyFilter.querySelector("input[name='q']");
      if (liveSearch) {
        liveSearch.addEventListener("input", () => {
          state.historyRenderLimit = HISTORY_RENDER_WINDOW;
          refreshHistoryResults();
        });
      }
      historyFilter.addEventListener("reset", () => {
        state.historyRenderLimit = HISTORY_RENDER_WINDOW;
        window.requestAnimationFrame(() => refreshHistoryResults());
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.history = bindHistoryPortalControls;
})();
