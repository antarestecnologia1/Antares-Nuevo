/**
 * Historial operativo y auditoría.
 * Extraído desde app.js — carga con defer después de app.js.
 */
function historyHtml() {
  const allRequests = reqRead();
  const histUi = state.historyUi || { workspace: "explore", quickFilter: "all" };
  histUi.workspace = normalizeHistoryWorkspace(histUi.workspace);
  state.historyUi = histUi;
  const workspace = String(histUi.workspace || "explore");
  const quickFilter = String(histUi.quickFilter || "all");
  const counts = historyQuickFilterCounts(allRequests);
  const filteredExplore = applyHistoryFilters(allRequests, { quickFilter });
  const closedCount = counts.closed;
  const operationalCount = counts.active;
  const pendingTripCount = counts.pending;
  const histHero = moduleFleetHeroStrip([
    { label: "Total registros", value: allRequests.length },
    { label: "Cerradas", value: closedCount },
    { label: "En operación", value: operationalCount },
    {
      label: "Pendientes de viaje",
      value: pendingTripCount,
      tone: pendingTripCount ? "warn" : undefined
    }
  ]);
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

  const histTab = (id, label, iconKey) => {
    const active = workspace === id;
    return `<button type="button" role="tab" class="history-workspace-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="history-workspace" data-workspace="${escapeAttr(id)}">${IC[iconKey] || ""}<span>${escapeHtml(label)}</span></button>`;
  };
  const workspaceNav = `<nav class="history-workspace-nav" role="tablist" aria-label="Secciones del historial">
    ${histTab("explore", "Solicitudes y viajes", "clock")}
    ${histTab("fleet", `Flota técnica (${fuelLogsAll.length + technicalLogsAll.length})`, "fuel")}
    ${histTab("audit", `Trazabilidad (${auditEntries.length})`, "activity")}
  </nav>`;

  const quickPill = (key, label) =>
    `<button type="button" class="ops-filter-pill${quickFilter === key ? " is-active" : ""}" data-action="history-quick-filter" data-filter="${escapeAttr(key)}"><span>${escapeHtml(label)}</span><strong>${counts[key] ?? 0}</strong></button>`;

  const filterBody = `<form id="history-filter" class="history-filter-form" novalidate>
    <div class="history-toolbar">
      <label class="history-toolbar-search">
        <span class="visually-hidden">Buscar</span>
        ${IC.search || IC.filter}
        <input type="search" name="q" placeholder="Solicitud, cliente, ruta, placa, viaje..." autocomplete="off" />
      </label>
      <details class="history-advanced-filters">
        <summary class="btn btn-sm btn-action">${IC.filter} Filtros</summary>
        <div class="history-advanced-filters-body">
          <label>${fieldLabel(IC.calendar, "Desde")}<input type="date" name="from" /></label>
          <label>${fieldLabel(IC.calendar, "Hasta")}<input type="date" name="to" /></label>
          <label>${fieldLabel(IC.user, "Cliente")}<select name="client"><option value="">Todos</option>${clientOptions}</select></label>
          <label>${fieldLabel(IC.activity, "Estado exacto")}<select name="status">${historyStatusFilterOptions()}</select></label>
          <button class="btn btn-sm btn-action" type="reset">${IC.x} Limpiar</button>
        </div>
      </details>
    </div>
  </form>`;

  const topClientsList = topClients(allRequests);
  const topVehiclesList = topVehicles(allRequests);
  const explorePanel = `<div class="history-panel${workspace === "explore" ? "" : " hidden"}" data-history-panel="explore" role="tabpanel">
    <div class="history-quick-bar ops-filters-bar" role="group" aria-label="Filtro rápido">
      ${quickPill("all", "Todo")}
      ${quickPill("active", "En ruta")}
      ${quickPill("closed", "Cerradas")}
      ${quickPill("pending", "Pend. viaje")}
      ${quickPill("cancelled", "Anuladas")}
    </div>
    <aside class="history-insight-strip" aria-label="Resumen rápido">
      <div class="history-insight-item">
        <span class="history-insight-label">${IC.user} Clientes activos</span>
        <p class="history-insight-value">${topClientsList.length ? escapeHtml(topClientsList.join(" · ")) : "Sin datos"}</p>
      </div>
      <div class="history-insight-item">
        <span class="history-insight-label">${IC.truck} Flota asignada</span>
        <p class="history-insight-value">${topVehiclesList.length ? escapeHtml(topVehiclesList.join(" · ")) : "Sin datos"}</p>
      </div>
      <div class="history-insight-item">
        <span class="history-insight-label">${IC.dollar} Viático interdepartamental</span>
        <p class="history-insight-value">$${parseNum(rules.interDepartmentTripAmount).toLocaleString("es-CO")} <span class="muted">/ viaje</span></p>
        <p class="muted" style="margin:0.25rem 0 0">Actualizado: ${escapeHtml(rulesUpdatedLabel)}</p>
      </div>
    </aside>
    ${filterBody}
    <p class="history-result-meta"><span id="history-result-count">${filteredExplore.length}</span> resultado${filteredExplore.length === 1 ? "" : "s"} · orden: más recientes primero</p>
    <div id="history-results">${renderHistoryResultsList(filteredExplore)}</div>
  </div>`;

  const fleetTabBtn = (id, label, iconKey, count) => {
    const active = fleetTab === id;
    return `<button type="button" role="tab" class="history-fleet-tab${active ? " is-active" : ""}" aria-selected="${active ? "true" : "false"}" data-action="history-fleet-tab" data-fleet-tab="${escapeAttr(id)}">${IC[iconKey] || ""}<span>${escapeHtml(label)}</span><strong class="history-fleet-tab-count">${count}</strong></button>`;
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

  const fuelKpiStrip = historyFleetKpiStrip([
    { label: "Cargas registradas", value: fuelKpisAll.count },
    { label: "Litros", value: `${fuelKpisAll.liters.toLocaleString("es-CO", { maximumFractionDigits: 1 })} L` },
    { label: "Costo total", value: `$${fuelKpisAll.cost.toLocaleString("es-CO")}` },
    {
      label: "Promedio $/L",
      value: fuelKpisAll.avgPerLiter > 0 ? `$${fuelKpisAll.avgPerLiter.toLocaleString("es-CO")}` : "—"
    },
    {
      label: "Reembolso conductor",
      value: `$${fuelKpisAll.reimburse.toLocaleString("es-CO")}`,
      tone: fuelKpisAll.reimburse > 0 ? "warn" : undefined
    }
  ]);

  const techKpiStrip = historyFleetKpiStrip([
    { label: "Novedades", value: techKpisAll.count },
    { label: "Costo taller", value: `$${techKpisAll.cost.toLocaleString("es-CO")}` },
    { label: "Horas fuera de servicio", value: `${techKpisAll.downtime.toLocaleString("es-CO")} h` },
    { label: "Abiertas", value: techKpisAll.open, tone: techKpisAll.open > 0 ? "warn" : "ok" }
  ]);

  const fleetPanel = `<div class="history-panel history-panel--fleet${workspace === "fleet" ? "" : " hidden"}" data-history-panel="fleet" role="tabpanel">
    <div class="history-panel-intro history-fleet-intro">
      <p>Consulta técnica de flota: cargas en <strong>registros_combustible</strong> y novedades en <strong>registros_mantenimiento_vehiculo</strong>. Las altas nuevas viven en <strong>Camiones</strong>.</p>
    </div>
    <nav class="history-fleet-tabs" role="tablist" aria-label="Combustible o taller">
      ${fleetTabBtn("fuel", "Combustible", "fuel", fuelLogsAll.length)}
      ${fleetTabBtn("technical", "Taller", "activity", technicalLogsAll.length)}
    </nav>
    <div class="history-fleet-panel${fleetTab === "fuel" ? "" : " hidden"}" data-fleet-panel="fuel" role="tabpanel">
      ${fuelKpiStrip}
      ${historyFleetFilterToolbar("history-fuel-filter", fuelFilterFields)}
      <p class="history-result-meta history-fleet-result-meta"><span id="history-fuel-result-count">${fuelLogsAll.length}</span> carga${fuelLogsAll.length === 1 ? "" : "s"} · más recientes primero</p>
      <div id="history-fuel-results">${renderHistoryFuelLogsList(fuelLogsAll)}</div>
    </div>
    <div class="history-fleet-panel${fleetTab === "technical" ? "" : " hidden"}" data-fleet-panel="technical" role="tabpanel">
      ${techKpiStrip}
      ${historyFleetFilterToolbar("history-technical-filter", techFilterFields)}
      <p class="history-result-meta history-fleet-result-meta"><span id="history-technical-result-count">${technicalLogsAll.length}</span> novedad${technicalLogsAll.length === 1 ? "" : "es"} · más recientes primero</p>
      <div id="history-technical-results">${renderHistoryTechnicalLogsList(technicalLogsAll)}</div>
    </div>
  </div>`;

  const auditPanel = `<div class="history-panel${workspace === "audit" ? "" : " hidden"}" data-history-panel="audit" role="tabpanel">
    <div class="history-panel-intro">
      <p class="muted">Bitácora central de creaciones, actualizaciones y eliminaciones para usuarios, empresas, camiones, conductores, solicitudes, viajes y registros de flota.</p>
    </div>
    ${historyFleetKpiStrip([
      { label: "Eventos", value: auditEntries.length },
      { label: "Creaciones", value: auditCreateCount, tone: auditCreateCount ? "ok" : undefined },
      { label: "Actualizaciones", value: auditUpdateCount, tone: auditUpdateCount ? "warn" : undefined },
      { label: "Eliminaciones", value: auditDeleteCount, tone: auditDeleteCount ? "warn" : undefined }
    ])}
    <p class="history-result-meta"><span id="history-audit-result-count">${auditEntries.length}</span> evento${auditEntries.length === 1 ? "" : "s"} más reciente${auditEntries.length === 1 ? "" : "s"} primero</p>
    <div id="history-audit-results">${renderHistoryAuditList(auditEntries)}</div>
  </div>`;

  const moduleHead = `<header class="ops-module-head ops-module-head--rich history-module-head">
    <div class="ops-module-title">
      <span class="ops-module-kicker">Transporte · Consulta</span>
      <h2>Historial operativo</h2>
      <p class="ops-module-subtitle">Separe la revisión en tres vistas: solicitudes y viajes, flota técnica y trazabilidad central de movimientos.</p>
    </div>
  </header>`;

  return (
    histHero +
    `<div class="history-module history-module--v2">${moduleHead}${workspaceNav}${explorePanel}${fleetPanel}${auditPanel}</div>`
  );
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({historyHtml});
})();
