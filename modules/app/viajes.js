/**
 * Transporte · Viajes (`#portal/transport-trips`): HTML, ventana de render y listeners del módulo.
 * Carga con `defer` después de `app.js` (antes de `mis-solicitudes.js` para exponer `RENDER_WINDOW_SIZE`).
 */
function buildDeletedTransportTripsLogSection() {
  const rows = read(KEYS.deletedTransportTripLogs, []);
  const minimized = Boolean(state.deletedTransportTripsLogMinimized);
  const expanded = !minimized;
  const subtitle = rows.length ? `${rows.length} en historial` : "Registro de auditoría";

  const tableOrEmpty = !rows.length
    ? `<p class="muted">Aún no hay registros. Al eliminar o desasignar un viaje se guardará motivo, fecha, usuario y copia del viaje.</p>`
    : `<div class="table-wrap trips-table-wrap"><table><thead><tr>
    <th>Fecha</th><th>Solicitud</th><th>Viaje</th><th>Resumen (copia)</th><th>Motivo</th><th>Usuario</th><th></th>
  </tr></thead><tbody>${rows
    .map((row) => {
      const when = fmtDate(row.deletedAt || "");
      const reqN = escapeHtml(String(row.requestNumber || row.requestId || "-"));
      const tripN = escapeHtml(String(row.tripNumber || "-"));
      const snap = deletedTripSnapshotForTableRow(row);
      const summary = escapeHtml(formatDeletedTripSnapshotTableSummary(snap));
      const reason = escapeHtml(String(row.reason || "").slice(0, 500));
      const who = escapeHtml(String(row.deletedByEmail || "—"));
      const rid = escapeAttr(String(row.id || ""));
      return `<tr><td>${escapeHtml(when)}</td><td>${reqN}</td><td>${tripN}</td><td class="muted" style="max-width:20rem;word-break:break-word;font-size:0.92em">${summary}</td><td>${reason}</td><td class="muted">${who}</td><td><button type="button" class="btn btn-sm btn-outline" data-action="deleted-trip-snapshot-detail" data-id="${rid}" title="Ver copia completa del viaje">${IC.eye} Detalle</button></td></tr>`;
    })
    .join("")}</tbody></table></div>`;

  const cardBody = `${renderModulePanelToolbar({ expanded, toggleAction: "toggle-deleted-trips-log", expandLabel: "Mostrar historial", showWhen: "always" })}
  <div class="${expanded ? "" : "hidden"}" data-deleted-trips-log-panel>
    ${tableOrEmpty}
  </div>`;

  return pcardWrap("trash", "Viajes eliminados o desasignados", subtitle, cardBody, expanded ? "p-card--expanded" : "p-card--collapsed");
}

/** Tabla de auditoría: solicitudes borradas físicamente (colapsable; resumen liviano en bootstrap, copia JSON al abrir detalle). */
function buildDeletedTransportRequestsLogSection() {
  const rows = read(KEYS.deletedTransportRequestLogs, []);
  const minimized = Boolean(state.deletedTransportRequestsLogMinimized);
  const expanded = !minimized;
  const subtitle = rows.length ? `${rows.length} en historial` : "Registro de auditoría";

  const tableOrEmpty = !rows.length
    ? `<p class="muted">Aún no hay registros. Al eliminar una solicitud se guardará motivo, fecha, usuario y copia de la solicitud.</p>`
    : `<div class="table-wrap trips-table-wrap"><table><thead><tr>
    <th>Fecha</th><th>Número</th><th>Resumen (copia)</th><th>Motivo</th><th>Usuario</th><th></th>
  </tr></thead><tbody>${rows
    .map((row) => {
      const when = fmtDate(row.deletedAt || "");
      const reqN = escapeHtml(String(row.requestNumber || row.requestId || "-"));
      const snap = deletedRequestSnapshotForTableRow(row);
      const summary = escapeHtml(formatDeletedRequestSnapshotTableSummary(snap));
      const reason = escapeHtml(String(row.reason || "").slice(0, 500));
      const who = escapeHtml(String(row.deletedByEmail || "—"));
      const rid = escapeAttr(String(row.id || ""));
      return `<tr><td>${escapeHtml(when)}</td><td>${reqN}</td><td class="muted" style="max-width:22rem;word-break:break-word;font-size:0.92em">${summary}</td><td>${reason}</td><td class="muted">${who}</td><td><button type="button" class="btn btn-sm btn-outline" data-action="deleted-request-snapshot-detail" data-id="${rid}" title="Ver copia completa de la solicitud">${IC.eye} Detalle</button></td></tr>`;
    })
    .join("")}</tbody></table></div>`;

  const cardBody = `${renderModulePanelToolbar({ expanded, toggleAction: "toggle-deleted-requests-log", expandLabel: "Mostrar historial", showWhen: "always" })}
  <div class="${expanded ? "" : "hidden"}" data-deleted-requests-log-panel>
    ${tableOrEmpty}
  </div>`;

  return pcardWrap("file", "Solicitudes eliminadas", subtitle, cardBody, expanded ? "p-card--expanded" : "p-card--collapsed");
}

/**
 * Ventana de render para listas grandes: evita construir miles de tarjetas/filas de una
 * sola vez (lo que hacía lento "mostrar los datos"). NO oculta datos del servidor ni filtra
 * nada: solo difiere el render del resto tras un botón "Ver más". El límite vive en `state`
 * por módulo y se reinicia al cambiar filtros/búsqueda.
 */
const RENDER_WINDOW_SIZE = 30;
function renderWindowSlice(list, limit) {
  const arr = Array.isArray(list) ? list : [];
  const max = Number.isFinite(limit) && limit > 0 ? limit : RENDER_WINDOW_SIZE;
  return arr.slice(0, max);
}
function renderWindowMoreBar(total, shown, action) {
  if (total <= shown) return "";
  return `<div class="render-window-more"><button type="button" class="btn btn-outline btn-sm" data-action="${escapeAttr(
    action
  )}">${IC.chevronDown || ""} Ver más · mostrando ${shown} de ${total}</button></div>`;
}

function transportTripsHtml() {
  const isAdmin = isAdminActor();
  const tripUser = currentUser();
  const visibleRequests = getVisibleRequestsForUser(tripUser);
  const rates = getTripRouteRatesNormalized();
  const companiesForRates = readArray(KEYS.companies);
  const rateEntries = Object.entries(rates)
    .map(([storageKey, entry]) => ({ storageKey, ...entry, value: parseNum(entry.value) }))
    .sort((a, b) => String(a.storageKey).localeCompare(String(b.storageKey)));
  const pendingRaw = pendingRequestsForTripAssignment(tripUser);
  const pendingForTrip = pendingRaw.filter((r) => isRequestPickupSameDayOrFuture(r));
  const pendingExpired = pendingRaw.filter((r) => !isRequestPickupSameDayOrFuture(r));
  const trips = visibleRequests.filter((r) => r.trip);
  const activeOps = trips.filter((r) => tripRequestStatusIsOperational(r.status)).length;
  const completedTrips = trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
  const standbyTrips = trips.filter((r) => parseNum(r.standbyChargeTotal) > 0).length;
  const todayIso = colombiaTodayIsoDate();
  const todaysTrips = trips.filter((r) => requestPickupIsoDate(r) === todayIso).length;
  const departmentsOpts = departmentOptions();
  const transportTripsUi = state.transportTripsUi || {};
  const transportTripsWorkspace = normalizeTransportTripsWorkspace(transportTripsUi.workspace);
  const transportTripsSection = resolveTransportTripsSection(transportTripsUi);
  const tripsSearch = String(transportTripsUi.search || "").trim().toLowerCase();
  const tripsSort = normalizeTransportTripsSort(transportTripsUi.sort);
  const tripsLayout = normalizeTransportTripsLayout(transportTripsUi.layout);

  /**
   * Filtros rápidos del módulo: el listado puede verse en tarjetas o en tabla
   * (mismo estilo que Camiones). Los filtros Activos / Hoy / etc. se mantienen.
   */
  const filter = String(state?.tripsFilter || "active");
  const filteredTrips = (() => {
    if (filter === "today") return trips.filter((r) => requestPickupIsoDate(r) === todayIso);
    if (filter === "closed") return trips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status));
    if (filter === "standby") return trips.filter((r) => parseNum(r.standbyChargeTotal) > 0);
    if (filter === "all") return trips;
    return trips.filter((r) => tripRequestStatusIsOperational(r.status));
  })()
    .filter((r) => {
      if (!tripsSearch) return true;
      const hay = [
        r.requestNumber,
        r.trip?.tripNumber,
        r.clientName,
        r.originCity,
        r.originDepartment,
        r.destinationCity,
        r.destinationDepartment,
        r.trip?.vehiclePlate,
        r.trip?.driverName,
        r.status
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");
      return hay.includes(tripsSearch);
    });
  const sortedFilteredTrips = filteredTrips.slice().sort((a, b) => {
    if (tripsSort === "pickup_desc") return new Date(rSafePickup(b)).getTime() - new Date(rSafePickup(a)).getTime();
    if (tripsSort === "value_desc") return parseNum(b.tripValue || 0) - parseNum(a.tripValue || 0);
    if (tripsSort === "value_asc") return parseNum(a.tripValue || 0) - parseNum(b.tripValue || 0);
    if (tripsSort === "status") return String(a.status || "").localeCompare(String(b.status || ""), "es", { sensitivity: "base" });
    return new Date(rSafePickup(a)).getTime() - new Date(rSafePickup(b)).getTime();
  });

  const buildTripOpsCard = (r) => {
    const standby = parseNum(r.standbyChargeTotal);
    const originCity = String(r.originCity || r.originDepartment || "Origen").trim() || "Origen";
    const destinationCity = String(r.destinationCity || r.destinationDepartment || "Destino").trim() || "Destino";
    const statusSlug = slugStatus(r.status);
    const clientName = String(r.clientName || "Cliente").trim() || "Cliente";
    const driverName = String(r.trip?.driverName || "Sin conductor").trim() || "Sin conductor";
    const plate = String(r.trip?.vehiclePlate || "—").trim() || "—";
    const pickupLabel = fmtDate(r.trip?.etaPickup || r.pickupAt || "") || "Sin fecha";
    const tripValueFmt = `$${parseNum(r.tripValue || 0).toLocaleString("es-CO")}`;
    const isClosed = [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status);
    const transitions = [r.status, ...(STATUS_TRANSITIONS[r.status] || [])];
    const statusSelectHtml = transitions.length > 1
      ? `<label class="trip-status-control trip-ops-card-status-control">
          <span>${IC.activity} Cambiar estado</span>
          <select class="trip-status-select trip-status-select--${escapeAttr(statusSlug)}" data-action="trip-status" data-id="${escapeAttr(String(r.id || ""))}" data-current-status="${escapeAttr(String(r.status || ""))}">
            ${transitions.map((s) => `<option value="${escapeAttr(s)}" ${r.status === s ? "selected" : ""}>${escapeHtml(tripStatusOptionLabel(s))}</option>`).join("")}
          </select>
        </label>`
      : "";
    return `<article class="trip-ops-card trip-ops-card--${escapeAttr(statusSlug)}" data-trip-id="${escapeAttr(String(r.id || ""))}">
      <header class="trip-ops-card-head">
        <div class="trip-ops-card-head-info">
          <p class="trip-ops-card-kicker">Viaje ${escapeHtml(String(r.trip?.tripNumber || "-"))} · Solicitud ${escapeHtml(String(r.requestNumber || r.id || "-"))}</p>
          <h4 class="trip-ops-card-title" title="${escapeAttr(clientName)}">${escapeHtml(clientName)}</h4>
        </div>
        <span class="trip-ops-card-status trip-ops-card-status--${escapeAttr(statusSlug)}">${prettyStatus(r.status, "trip")}</span>
      </header>
      <div class="trip-ops-card-route">
        <span class="trip-ops-card-route-node trip-ops-card-route-node--origin" title="${escapeAttr(originCity)}">
          <span class="trip-ops-card-route-dot" aria-hidden="true"></span>
          <span class="trip-ops-card-route-label">Origen</span>
          <strong>${escapeHtml(originCity)}</strong>
        </span>
        <span class="trip-ops-card-route-arrow" aria-hidden="true">→</span>
        <span class="trip-ops-card-route-node trip-ops-card-route-node--dest" title="${escapeAttr(destinationCity)}">
          <span class="trip-ops-card-route-dot" aria-hidden="true"></span>
          <span class="trip-ops-card-route-label">Destino</span>
          <strong>${escapeHtml(destinationCity)}</strong>
        </span>
      </div>
      <dl class="trip-ops-card-grid">
        <div class="trip-ops-card-item"><dt>${IC.truck}<span>Camión</span></dt><dd title="${escapeAttr(plate)}">${escapeHtml(plate)}</dd></div>
        <div class="trip-ops-card-item"><dt>${IC.user}<span>Conductor</span></dt><dd title="${escapeAttr(driverName)}">${escapeHtml(driverName)}</dd></div>
        <div class="trip-ops-card-item"><dt>${IC.calendar}<span>Recogida</span></dt><dd title="${escapeAttr(pickupLabel)}">${escapeHtml(pickupLabel)}</dd></div>
        <div class="trip-ops-card-item trip-ops-card-item--value"><dt>${IC.dollar}<span>Tarifa</span></dt><dd>${tripValueFmt}</dd></div>
      </dl>
      ${standby > 0 ? `<p class="trip-ops-card-standby">${IC.clock || ""}<span>Standby acumulado: <strong>$${standby.toLocaleString("es-CO")}</strong></span></p>` : ""}
      ${statusSelectHtml}
      <div class="toolbar trip-ops-card-actions">
        <button class="btn btn-sm btn-outline" data-action="trip-detail" data-id="${r.id}" title="Ficha del viaje: vehículo, conductor, horarios y standby">${IC.truck} Viaje</button>
        <button class="btn btn-sm btn-action" data-action="detail" data-id="${r.id}" title="Detalle completo de la solicitud asociada">${IC.eye} Solicitud</button>
        ${canAdminEditTrip(r) ? `<button class="btn btn-sm btn-action" data-action="edit-trip" data-id="${r.id}" title="Editar vehículo, conductor o fechas estimadas">${IC.edit} Editar</button>` : ""}
        ${isClosed ? `<button class="btn btn-sm btn-approve" data-action="trip-invoice" data-id="${r.id}" title="Generar factura PDF del viaje">${IC.file} Factura</button>` : ""}
        ${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="delete-trip" data-id="${r.id}" title="Solo administradores: eliminar el viaje">${IC.trash} Eliminar</button>` : ""}
      </div>
    </article>`;
  };

  const buildTripOpsListRow = (r) => {
    const standby = parseNum(r.standbyChargeTotal);
    const originCity = String(r.originCity || r.originDepartment || "Origen").trim() || "Origen";
    const destinationCity = String(r.destinationCity || r.destinationDepartment || "Destino").trim() || "Destino";
    const statusSlug = slugStatus(r.status);
    const clientName = String(r.clientName || "Cliente").trim() || "Cliente";
    const driverName = String(r.trip?.driverName || "Sin conductor").trim() || "Sin conductor";
    const plate = String(r.trip?.vehiclePlate || "—").trim() || "—";
    const pickupLabel = fmtDate(r.trip?.etaPickup || r.pickupAt || "") || "Sin fecha";
    const tripValueFmt = `$${parseNum(r.tripValue || 0).toLocaleString("es-CO")}`;
    const isClosed = [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status);
    const transitions = [r.status, ...(STATUS_TRANSITIONS[r.status] || [])];
    const statusSelectHtml =
      transitions.length > 1
        ? `<label class="trip-status-control trip-ops-card-status-control trip-ops-list-status">
          <span class="muted">${IC.activity} Estado</span>
          <select class="trip-status-select trip-status-select--${escapeAttr(statusSlug)}" data-action="trip-status" data-id="${escapeAttr(String(r.id || ""))}" data-current-status="${escapeAttr(String(r.status || ""))}">
            ${transitions.map((s) => `<option value="${escapeAttr(s)}" ${r.status === s ? "selected" : ""}>${escapeHtml(tripStatusOptionLabel(s))}</option>`).join("")}
          </select>
        </label>`
        : `<span class="trip-ops-card-status trip-ops-card-status--${escapeAttr(statusSlug)}">${prettyStatus(r.status, "trip")}</span>`;
    const routeCell = `<span class="vehicle-fleet-list-sub">${escapeHtml(originCity)}</span> <span aria-hidden="true">→</span> <span class="vehicle-fleet-list-sub">${escapeHtml(destinationCity)}</span>`;
    const standbyLine =
      standby > 0 ? `<div class="muted vehicle-fleet-list-sub">${IC.clock || ""} Standby $${standby.toLocaleString("es-CO")}</div>` : "";
    const tripLine = `${escapeHtml(String(r.trip?.tripNumber || "—"))} · Sol. ${escapeHtml(String(r.requestNumber || r.id || "—"))}`;
    return `<tr data-trip-id="${escapeAttr(String(r.id || ""))}">
      <td data-label="Cliente / viaje"><strong class="vehicle-fleet-list-plate">${escapeHtml(clientName)}</strong><div class="muted vehicle-fleet-list-sub">${escapeHtml(tripLine)}</div></td>
      <td data-label="Ruta">${routeCell}</td>
      <td data-label="Estado">${statusSelectHtml}</td>
      <td data-label="Recogida">${escapeHtml(pickupLabel)}</td>
      <td data-label="Camión">${escapeHtml(plate)}</td>
      <td data-label="Conductor">${escapeHtml(driverName)}</td>
      <td data-label="Tarifa"><span class="vehicle-fleet-list-doc">${tripValueFmt}</span>${standbyLine}</td>
      <td data-label="Acciones" class="vehicle-fleet-list-actions"><div class="toolbar">
        <button class="btn btn-sm btn-outline" data-action="trip-detail" data-id="${r.id}" title="Ficha del viaje">${IC.truck} Viaje</button>
        <button class="btn btn-sm btn-action" data-action="detail" data-id="${r.id}" title="Detalle de la solicitud">${IC.eye} Solicitud</button>
        ${canAdminEditTrip(r) ? `<button class="btn btn-sm btn-action" data-action="edit-trip" data-id="${r.id}" title="Editar asignación">${IC.edit} Editar</button>` : ""}
        ${isClosed ? `<button class="btn btn-sm btn-approve" data-action="trip-invoice" data-id="${r.id}" title="Factura PDF">${IC.file} Factura</button>` : ""}
        ${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="delete-trip" data-id="${r.id}" title="Eliminar viaje">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`;
  };

  const filterPill = (key, label, count) =>
    `<button type="button" class="ops-filter-pill${filter === key ? " is-active" : ""}" data-action="trips-filter" data-filter="${escapeAttr(key)}"><span>${escapeHtml(label)}</span><strong>${count}</strong></button>`;
  const opsFiltersBar = `<div class="ops-filters-bar">
    ${filterPill("active", "Activos", activeOps)}
    ${filterPill("today", "Hoy", todaysTrips)}
    ${filterPill("standby", "Standby", standbyTrips)}
    ${filterPill("closed", "Cerrados", completedTrips)}
    ${filterPill("all", "Todos", trips.length)}
  </div>`;
  const opsToolbar = `<div class="transport-ops-toolbar">
    <label class="transport-ops-search">
      <span class="muted">${IC.search || IC.eye} Buscar</span>
      <input type="search" data-action="transport-trips-search" value="${escapeAttr(String(transportTripsUi.search || ""))}" placeholder="Cliente, ruta, placa, conductor, estado..." />
    </label>
    <label class="transport-ops-sort">
      <span class="muted">${IC.filter || IC.activity} Orden</span>
      <select data-action="transport-trips-sort">
        <option value="pickup_asc" ${tripsSort === "pickup_asc" ? "selected" : ""}>Recogida (próxima primero)</option>
        <option value="pickup_desc" ${tripsSort === "pickup_desc" ? "selected" : ""}>Recogida (más reciente primero)</option>
        <option value="value_desc" ${tripsSort === "value_desc" ? "selected" : ""}>Tarifa (mayor a menor)</option>
        <option value="value_asc" ${tripsSort === "value_asc" ? "selected" : ""}>Tarifa (menor a mayor)</option>
        <option value="status" ${tripsSort === "status" ? "selected" : ""}>Estado (A-Z)</option>
      </select>
    </label>
    <div class="transport-ops-layout" role="group" aria-label="Tarjetas o lista">
      <button type="button" class="btn btn-sm ${tripsLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="transport-trips-layout" data-layout="cards">Tarjetas</button>
      <button type="button" class="btn btn-sm ${tripsLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="transport-trips-layout" data-layout="list">Lista</button>
    </div>
  </div>`;

  const tripsRenderLimit = Number(state.tripsRenderLimit) || RENDER_WINDOW_SIZE;
  const tripsToRender = renderWindowSlice(sortedFilteredTrips, tripsRenderLimit);
  const tripsMoreBar = renderWindowMoreBar(sortedFilteredTrips.length, tripsToRender.length, "trips-render-more");
  const tripsListTable =
    tripsLayout === "list" && sortedFilteredTrips.length
      ? `<div class="table-wrap vehicle-fleet-list-wrap"><table class="vehicle-fleet-table trip-ops-fleet-table">
    <thead><tr>
      <th>Cliente / viaje</th><th>Ruta</th><th>Estado</th><th>Recogida</th><th>Camión</th><th>Conductor</th><th>Tarifa</th><th>Acciones</th>
    </tr></thead>
    <tbody>${tripsToRender.map(buildTripOpsListRow).join("")}</tbody>
  </table></div>`
      : "";
  const tripsCardsGrid =
    tripsLayout === "cards" && sortedFilteredTrips.length
      ? `<div class="trip-ops-cards">${tripsToRender.map(buildTripOpsCard).join("")}</div>`
      : "";
  const opsCards = sortedFilteredTrips.length
    ? `${opsFiltersBar}${opsToolbar}${tripsLayout === "list" ? tripsListTable : tripsCardsGrid}${tripsMoreBar}`
    : `${opsFiltersBar}${opsToolbar}${emptyState("No hay viajes para el filtro seleccionado o búsqueda aplicada.")}`;

  const formatRatePlaceLabel = (part) => {
    const s = String(part || "").trim();
    if (!s) return "—";
    return s
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };
  const formatRateRouteCell = (storageKey) => {
    const sepIdx = String(storageKey).lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routeOnly = sepIdx === -1 ? String(storageKey) : String(storageKey).slice(0, sepIdx);
    const [orig, dest] = String(routeOnly).split("->");
    const [od, oc] = String(orig || "").split("|");
    const [dd, dc] = String(dest || "").split("|");
    const originCity = formatRatePlaceLabel(oc);
    const originDept = formatRatePlaceLabel(od);
    const destCity = formatRatePlaceLabel(dc);
    const destDept = formatRatePlaceLabel(dd);
    return `<div class="route-rate-route-cell">
      <div class="route-rate-route-leg">
        <span class="route-rate-route-label">Origen</span>
        <span class="route-rate-route-city">${escapeHtml(originCity)}</span>
        <span class="route-rate-route-dept">${escapeHtml(originDept)}</span>
      </div>
      <span class="route-rate-route-arrow" aria-hidden="true">${IC.mapPin}</span>
      <div class="route-rate-route-leg">
        <span class="route-rate-route-label">Destino</span>
        <span class="route-rate-route-city">${escapeHtml(destCity)}</span>
        <span class="route-rate-route-dept">${escapeHtml(destDept)}</span>
      </div>
    </div>`;
  };
  const formatRateClientsCell = (companyIds) => {
    const ids = Array.isArray(companyIds) ? companyIds : [];
    if (!ids.length) {
      return {
        scope: '<span class="route-rate-scope-badge route-rate-scope-badge--all" title="Esta tarifa es estándar y aplica a todos los clientes">General</span>',
        clients: '<span class="route-rate-clients-all">Todos los clientes</span>'
      };
    }
    const chips = ids
      .map((id) => `<span class="route-rate-client-chip">${escapeHtml(getCompanyById(id)?.name || String(id))}</span>`)
      .join("");
    return {
      scope: '<span class="route-rate-scope-badge route-rate-scope-badge--specific" title="Esta tarifa solo aplica a las empresas listadas">Por empresa</span>',
      clients: `<div class="route-rate-client-chips">${chips}</div>`
    };
  };
  const formatRateAuditCell = (entry) => formatRouteRateAuditCellHtml(entry);
  const ratesRows = rateEntries.length
    ? rateEntries
        .map((entry) => {
          const { storageKey, value: val, companyIds } = entry;
          const safeKey = encodeURIComponent(storageKey);
          const clientCell = formatRateClientsCell(companyIds);
          return `<tr>
          <td>${formatRateRouteCell(storageKey)}</td>
          <td>${clientCell.scope}</td>
          <td>${clientCell.clients}</td>
          <td><div class="route-rate-money-cell"><span class="route-rate-value">$${parseNum(val).toLocaleString("es-CO")}</span><span class="route-rate-value-unit">COP · por viaje</span></div></td>
          <td>${formatRateAuditCell(entry)}</td>
          <td>${isAdmin ? `<div class="toolbar route-rate-actions"><button type="button" class="btn btn-sm btn-action" data-action="edit-route-rate" data-rate-key="${safeKey}" title="Editar el valor o el alcance de esta tarifa">${IC.edit} Editar</button><button type="button" class="btn btn-sm btn-reject" data-action="delete-route-rate" data-rate-key="${safeKey}" title="Quitar esta tarifa del catálogo (solo administradores)">${IC.trash} Quitar</button></div>` : '<span class="muted">—</span>'}</td>
        </tr>`;
        })
        .join("")
    : "";
  const ratesTable = ratesRows
    ? `<div class="route-rates-intro">
        <p class="route-rates-intro-title">${IC.dollar} Catálogo de tarifas pactadas</p>
        <p class="route-rates-intro-body">Estos precios se autocompletan al crear un viaje en la misma ruta.</p>
        <p class="route-rates-intro-note"><span class="route-rate-scope-badge route-rate-scope-badge--all">General</span> aplica a cualquier cliente · <span class="route-rate-scope-badge route-rate-scope-badge--specific">Por empresa</span> solo a los clientes indicados.</p>
      </div>
      <div class="table-wrap route-rates-table-wrap">
        <table class="route-rates-table">
          <thead>
            <tr>
              <th scope="col">Trayecto</th>
              <th scope="col">Alcance</th>
              <th scope="col">Clientes</th>
              <th scope="col">Tarifa</th>
              <th scope="col">Trazabilidad</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>${ratesRows}</tbody>
        </table>
      </div>`
    : emptyState("Aún no has configurado tarifas por trayecto. Crea la primera para que el sistema sugiera el precio cuando asignes un viaje a esa ruta.");

  const routesCatalogBadge =
    rateEntries.length > 0
      ? `<span class="create-trip-hero-badge create-trip-hero-badge--ok">${rateEntries.length} en catálogo</span>`
      : `<span class="create-trip-hero-badge create-trip-hero-badge--muted">Catálogo vacío</span>`;
  const routeRateForm = `<form id="form-route-rate" class="p-form p-form-colored hr-form-flow transport-trip-create-form transport-route-form transport-route-form--revamp" autocomplete="off">
    <input type="hidden" name="editingRateKey" id="route-rate-editing-key" value="" />
    <div class="transport-form transport-form--single" data-transport-form="route-rate" aria-label="Configurar trayecto y tarifa">
      <header class="transport-wizard__head">
        <div class="transport-wizard__head-copy">
          <span class="transport-wizard__eyebrow">Catálogo de transporte</span>
          <h3 class="transport-wizard__title">Trayecto y tarifa</h3>
          <p class="transport-wizard__desc">Defina origen, destino, valor pactado y alcance por cliente para autocompletar precios al asignar viajes.</p>
        </div>
        <div class="transport-wizard__meta">
          ${routesCatalogBadge}
        </div>
      </header>
      <div class="transport-form__body">
        <fieldset class="form-section form-section-blue full transport-route-create-form__route transport-route-form-fieldset--origin">
          <legend>${IC.mapPin} Trayecto</legend>
          <p class="muted form-section-hint route-rate-block-lead">Defina origen y destino. La vista previa se actualiza al elegir ciudad.</p>
          <div class="route-rate-route-grid">
            <div class="route-rate-route-col route-rate-route-col--origin">
              <span class="route-rate-route-col-badge" aria-hidden="true">O</span>
              <div class="route-rate-route-col-fields">
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Departamento origen")}<select name="originDepartment" id="route-rate-origin-dept" required><option value="">Seleccione…</option>${departmentsOpts}</select></label>
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Ciudad origen")}<select name="originCity" id="route-rate-origin-city" required><option value="">Elija departamento…</option></select></label>
              </div>
            </div>
            <div class="route-rate-route-bridge" aria-hidden="true">
              <span class="route-rate-route-bridge-line"></span>
              <span class="route-rate-route-bridge-icon">${IC.mapPin}</span>
              <span class="route-rate-route-bridge-line"></span>
            </div>
            <div class="route-rate-route-col route-rate-route-col--dest">
              <span class="route-rate-route-col-badge route-rate-route-col-badge--dest" aria-hidden="true">D</span>
              <div class="route-rate-route-col-fields">
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Departamento destino")}<select name="destinationDepartment" id="route-rate-dest-dept" required><option value="">Seleccione…</option>${departmentsOpts}</select></label>
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Ciudad destino")}<select name="destinationCity" id="route-rate-dest-city" required><option value="">Elija departamento…</option></select></label>
              </div>
            </div>
          </div>
          <div class="full assign-trip-preview create-trip-summary-panel route-rate-preview" data-route-rate-preview aria-live="polite">
            <div class="route-rate-preview__leg">
              <span class="route-rate-preview__eyebrow">Origen</span>
              <span class="route-rate-preview__value" data-route-rate-preview-origin>Seleccione origen</span>
            </div>
            <span class="route-rate-preview__arrow" aria-hidden="true">${IC.mapPin}</span>
            <div class="route-rate-preview__leg">
              <span class="route-rate-preview__eyebrow">Destino</span>
              <span class="route-rate-preview__value" data-route-rate-preview-dest>Seleccione destino</span>
            </div>
          </div>
        </fieldset>
        <fieldset class="form-section form-section-violet full transport-route-create-form__price transport-route-form-fieldset--price">
          <legend>${IC.dollar} Tarifa pactada</legend>
          <div class="route-rate-price-surface">
            <label class="route-rate-price-field full">${fieldLabel(IC.dollar, "Valor del viaje", { required: true })}
              <div class="route-rate-price-input-wrap">
                <span class="route-rate-price-prefix" aria-hidden="true">$</span>
                <input type="text" name="tripRateCop" required placeholder="4.200.000" inputmode="numeric" autocomplete="off" data-money-input="1" />
                <span class="route-rate-price-suffix" aria-hidden="true">COP</span>
              </div>
              <span class="route-rate-price-hint muted">Este valor se sugerirá al asignar viajes en la misma ruta.</span>
            </label>
          </div>
        </fieldset>
        <fieldset class="form-section form-section-emerald full route-rate-scope-fieldset transport-route-create-form__scope">
          <legend>${IC.briefcase} Alcance por cliente</legend>
          <p class="muted form-section-hint create-trip-flag-legend">Elija <strong>General</strong> si aplica a todos los clientes, o <strong>Por empresa</strong> y marque los clientes con tarifa negociada.</p>
          <div class="route-rate-scope-mount" data-route-rate-scope-mount>
            ${buildRouteRateScopeStepInnerHtml(companiesForRates)}
          </div>
          <p class="route-rate-editing-hint muted" id="route-rate-editing-hint" hidden>Estás editando una tarifa existente. Al guardar se sobrescribirá el valor anterior.</p>
        </fieldset>
      </div>
      <div class="transport-form__footer">
        <ul class="create-trip-readiness create-trip-readiness--bar transport-readiness" data-route-rate-readiness aria-label="Requisitos para guardar"></ul>
        ${renderManagedCreateFormActions(
          "create-route-rate",
          `<button class="btn btn-primary" id="route-rate-submit-btn" type="submit" disabled aria-disabled="true">${IC.plus} Guardar tarifa de trayecto</button>`
        )}
      </div>
    </div>
  </form>`;

  const canApproveInViajes = canApproveTransportRequests(tripUser);
  const tripAssignOptionLabel = (r) => {
    const stateTag =
      r.status === STATUS.PENDIENTE ? "Pendiente" : "Aprobada";
    return `${escapeHtml(String(r.requestNumber || r.id))} · ${escapeHtml(stateTag)} · ${escapeHtml(r.clientName || "")} · ${escapeHtml(r.originCity || "")} → ${escapeHtml(r.destinationCity || "")}`;
  };
  const tripAssignOptionHtml = (r) =>
    `<option value="${escapeAttr(r.id)}" data-createdby="${escapeAttr(r.requestedByName || "-")}" data-route="${escapeAttr(`${r.originDepartment ? `${r.originDepartment}, ` : ""}${r.originCity} → ${r.destinationDepartment ? `${r.destinationDepartment}, ` : ""}${r.destinationCity}`)}" data-company="${escapeAttr(r.clientName || "-")}">${tripAssignOptionLabel(r)}</option>`;
  const pendingApproveTrip = pendingForTrip.filter((r) => r.status === STATUS.PENDIENTE);
  const pendingAssignTrip = pendingForTrip.filter((r) => r.status === STATUS.APROBADA_PENDIENTE_ASIGNACION);
  const pendingSelectParts = [];
  if (canApproveInViajes && pendingApproveTrip.length) {
    pendingSelectParts.push(
      `<optgroup label="Pendientes (puede aprobar y asignar)">${pendingApproveTrip.map(tripAssignOptionHtml).join("")}</optgroup>`
    );
  }
  if (pendingAssignTrip.length) {
    pendingSelectParts.push(
      `<optgroup label="Aprobadas · por asignar">${pendingAssignTrip.map(tripAssignOptionHtml).join("")}</optgroup>`
    );
  }
  if (!pendingSelectParts.length && pendingForTrip.length) {
    pendingSelectParts.push(pendingForTrip.map(tripAssignOptionHtml).join(""));
  }
  const pendingSelectOpts = pendingSelectParts.join("");
  const expiredPendingOpts = pendingExpired
    .map((r) => {
      const pickup = requestPickupIsoDate(r) || "sin fecha";
      return `<option value="${escapeAttr(r.id)}" disabled>${escapeHtml(String(r.requestNumber || r.id))} · ${escapeHtml(r.clientName || "")} · ${pickup} · 🔴 fecha vencida</option>`;
    })
    .join("");
  const pendingBadge =
    pendingForTrip.length > 0
      ? `<span class="create-trip-hero-badge create-trip-hero-badge--ok">${pendingForTrip.length} disponible${pendingForTrip.length === 1 ? "" : "s"}</span>`
      : `<span class="create-trip-hero-badge create-trip-hero-badge--muted">${canApproveInViajes ? "Sin solicitudes por asignar" : "Sin aprobadas por asignar"}</span>`;
  const tripRequestPickerGroup = (label, list) =>
    list.length
      ? `<div class="trip-request-picker__group"><p class="trip-request-picker__group-label">${escapeHtml(label)}</p><div class="trip-request-picker__group-cards">${list.map((r) => buildTripRequestPickerCardHtml(r)).join("")}</div></div>`
      : "";
  const tripRequestPickerCards = [
    canApproveInViajes ? tripRequestPickerGroup("Pendientes · puede aprobar y asignar", pendingApproveTrip) : "",
    tripRequestPickerGroup("Aprobadas · por asignar", pendingAssignTrip),
    !pendingApproveTrip.length && !pendingAssignTrip.length
      ? tripRequestPickerGroup("Disponibles", pendingForTrip)
      : ""
  ].join("");
  const tripRequestPickerEmptyDetail = pendingExpired.length
    ? "Hay solicitudes con fecha vencida que no se pueden asignar."
    : canApproveInViajes
      ? "Cuando haya solicitudes pendientes o aprobadas aparecerán aquí."
      : "Las solicitudes deben estar aprobadas en Autorizaciones antes de asignar.";
  const tripRequestPickerEmptyTitle = pendingExpired.length
    ? "Sin solicitudes asignables hoy"
    : canApproveInViajes
      ? "Sin solicitudes pendientes"
      : "Apruebe solicitudes primero";
  const tripRequestPickerBody = pendingForTrip.length
    ? `<div class="trip-request-picker" data-trip-request-picker>
        <label class="trip-request-picker__search-wrap full">${fieldLabel(IC.search || IC.eye, "Buscar solicitud")}
          <input type="search" class="trip-request-picker__search" data-trip-request-search placeholder="Cliente, ruta, número de solicitud…" autocomplete="off" />
        </label>
        <p class="trip-request-picker__empty muted hidden" data-trip-request-empty role="status"></p>
        <div class="trip-request-picker__list" data-trip-request-list role="listbox" aria-label="Solicitudes para asignar">${tripRequestPickerCards}</div>
        <select name="requestId" id="create-trip-request-select" class="visually-hidden" required tabindex="-1" aria-hidden="true">
          <option value="">Seleccione…</option>
          ${pendingSelectOpts}
        </select>
      </div>`
    : `<div class="trip-request-picker-empty">${createTripEmptyHint("inbox", tripRequestPickerEmptyTitle, tripRequestPickerEmptyDetail)}</div>
      <select name="requestId" id="create-trip-request-select" disabled hidden aria-hidden="true"><option value=""></option></select>`;
  const createTripForm = `<form id="form-create-trip" class="p-form p-form-colored hr-form-flow transport-trip-create-form assign-trip-form assign-trip-form--revamp" autocomplete="off">
    <div class="transport-form transport-form--single" data-transport-form="trip-assign" aria-label="Asignar viaje">
      <header class="transport-wizard__head">
        <div class="transport-wizard__head-copy">
          <span class="transport-wizard__eyebrow">Operación de transporte</span>
          <h3 class="transport-wizard__title">Asignar viaje</h3>
          <p class="transport-wizard__desc">Seleccione la solicitud, asigne vehículo y conductor, y confirme la tarifa pactada para crear el viaje.</p>
        </div>
        <div class="transport-wizard__meta">
          ${pendingBadge}
        </div>
      </header>
      <div class="transport-form__body">
        <div class="assign-trip-block transport-trip-create-form__request">
          <div class="assign-trip-block-head">
            <h4 class="assign-trip-block-title">${IC.inbox} Elija la solicitud</h4>
            <span class="muted trip-request-picker-count">${pendingForTrip.length} disponible${pendingForTrip.length === 1 ? "" : "s"}</span>
          </div>
          <div class="assign-trip-block-body">
            ${tripRequestPickerBody}
            <div id="trip-request-preview" class="assign-trip-preview create-trip-summary-panel" aria-live="polite">
              ${createTripEmptyHint("inbox", "Seleccione una solicitud", "Al elegir una tarjeta verá el resumen de ruta, cliente y recogida.")}
            </div>
          </div>
        </div>
        <div class="assign-trip-block transport-trip-create-form__resources">
          <div class="assign-trip-block-head">
            <h4 class="assign-trip-block-title">${IC.truck} Vehículo y conductor</h4>
            <p class="muted form-section-hint create-trip-flag-legend assign-trip-flags" role="list" aria-label="Banderas en listas">
              <span class="create-trip-flag create-trip-flag--busy" role="listitem"><span class="create-trip-flag-dot"></span>Ocupado</span>
              <span class="create-trip-flag create-trip-flag--offline" role="listitem"><span class="create-trip-flag-dot"></span>No disponible</span>
              <span class="create-trip-flag create-trip-flag--expired" role="listitem"><span class="create-trip-flag-dot"></span>Doc. vencida</span>
            </p>
          </div>
          <div class="assign-trip-block-body">
            <div id="create-trip-fleet-stats" class="create-trip-fleet-stats assign-trip-fleet-stats" aria-live="polite"></div>
            <div class="assign-trip-fleet-grid create-trip-fleet-grid">
              <label class="assign-trip-resource create-trip-fleet-field">${fieldLabel(IC.truck, "Vehículo", { required: true })}
                <select name="vehicleId" id="create-trip-vehicle-select" class="create-trip-resource-select searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Placa, tipo o capacidad…" disabled><option value="">Elija solicitud primero</option></select>
              </label>
              <label class="assign-trip-resource create-trip-fleet-field">${fieldLabel(IC.user, "Conductor", { required: true })}
                <select name="driverId" id="create-trip-driver-select" class="create-trip-resource-select searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Nombre, documento o teléfono…" disabled><option value="">Elija solicitud primero</option></select>
              </label>
            </div>
          </div>
        </div>
        <fieldset class="form-section form-section-emerald full transport-trip-create-form__pricing">
          <legend>${IC.dollar} Tarifa del viaje</legend>
          <div id="create-trip-rate-fields" class="assign-trip-rate create-trip-rate-surface">
            ${createTripEmptyHint("dollar", "Tarifa pendiente")}
          </div>
        </fieldset>
      </div>
      <div class="transport-form__footer">
        <ul class="create-trip-readiness create-trip-readiness--bar transport-readiness" data-create-trip-readiness aria-label="Requisitos para asignar"></ul>
        ${renderManagedCreateFormActions(
          "create-trip",
          `<button class="btn btn-primary create-trip-submit-btn" type="submit" disabled aria-disabled="true">${IC.check} Crear viaje</button>`
        )}
      </div>
    </div>
  </form>`;

  const transportModuleHead = moduleFleetHeroStrip([
    { label: "Viajes", value: trips.length },
    { label: "Activos", value: activeOps, tone: activeOps ? "warn" : undefined },
    { label: "Hoy", value: todaysTrips },
    { label: "Por asignar", value: pendingForTrip.length, tone: pendingForTrip.length ? "warn" : undefined },
    { label: "Trayectos", value: rateEntries.length }
  ]);
  const transportTripsTabsNav = renderHrWorkspaceTabs({
    module: "transport-trips",
    ariaLabel: "Secciones del módulo Transporte · Viajes",
    activeId: transportTripsWorkspace,
    variant: "switch",
    tabs: [
      { id: "operate", label: "Registrar", icon: "plus", hint: "Asignar viajes y tarifas" },
      { id: "data", label: "Consultar", icon: "eye", hint: "Operación y catálogo" }
    ]
  });
  const transportWorkspaceHeader = renderHrWorkspaceHeader(transportModuleHead, transportTripsTabsNav, "payroll");
  const transportOperateNav = renderModuleWindowTabs({
    ariaLabel: "Flujos de registro de transporte",
    activeId: transportTripsSection,
    action: "transport-trips-section",
    valueAttr: "section",
    tabs: [
      { id: "trips", label: "Asignar viaje" },
      { id: "routes", label: "Trayecto y tarifa" }
    ]
  });
  const transportDataNav = renderModuleWindowTabs({
    ariaLabel: "Consultas de viajes y trayectos",
    activeId: transportTripsSection,
    action: "transport-trips-section",
    valueAttr: "section",
    tabs: [
      { id: "trips", label: "Viajes", count: trips.length },
      { id: "routes", label: "Trayectos", count: rateEntries.length }
    ]
  });
  const tripsCreateCard = `<section id="create-trip" class="transport-operate-panel transport-operate-panel" data-create-panel="create-trip">
    ${pcardWrapPro(
      "truck",
      "Asignar viaje",
      `${pendingForTrip.length} disponible${pendingForTrip.length === 1 ? "" : "s"}`,
      createTripForm,
      "admin-users-data-card hr-form-card transport-form-card hr-form-card--xl hr-form-card--transport-trip"
    )}
  </section>`;
  const routesCreateCard = `<section id="create-route-rate" class="transport-operate-panel transport-operate-panel" data-create-panel="create-route-rate">
    ${pcardWrapPro(
      "mapPin",
      "Configurar trayecto y tarifa",
      `${rateEntries.length} catalogada${rateEntries.length === 1 ? "" : "s"}`,
      routeRateForm,
      "admin-users-data-card hr-form-card transport-form-card hr-form-card--xl hr-form-card--transport-route"
    )}
  </section>`;
  const tripsOperatePane = `<div class="auth-tab-panel${transportTripsSection === "trips" ? "" : " hidden"}" data-transport-trips-operate-pane="trips">${tripsCreateCard}</div>`;
  const routesOperatePane = `<div class="auth-tab-panel${transportTripsSection === "routes" ? "" : " hidden"}" data-transport-trips-operate-pane="routes">${routesCreateCard}</div>`;
  const transportOperatePanel = `<div class="hr-workspace-panel transport-workspace-panel${transportTripsWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-transport-trips-panel="operate">
      <section class="transport-operate transport-operate-panel">
        <aside class="transport-operate__rail" aria-label="Flujos de registro">
          <span class="transport-operate__rail-label">Registrar</span>
          ${transportOperateNav}
        </aside>
        <div class="transport-operate__main auth-tab-panels">${tripsOperatePane}${routesOperatePane}</div>
      </section>
    </div>`;
  const tripsDataPane = `<div class="transport-data-pane${transportTripsSection === "trips" ? "" : " hidden"}" data-transport-trips-data-pane="trips">
      ${pcardWrap("activity", "Panel operativo de viajes", `${sortedFilteredTrips.length} viajes${tripsLayout === "list" ? " · vista lista" : ""} en vista actual`, opsCards)}
    </div>`;
  const routesDataPane = `<div class="transport-data-pane${transportTripsSection === "routes" ? "" : " hidden"}" data-transport-trips-data-pane="routes">
      <header class="payroll-panel-intro ops-block-head">
        <h3>Trayectos</h3>
        <p class="ops-block-lead muted">Catálogo de rutas y tarifas por cliente usadas para autocompletar precios al asignar viajes.</p>
      </header>
      ${pcardWrap("mapPin", "Rutas y tarifas configuradas", `${rateEntries.length} ${rateEntries.length === 1 ? "ruta configurada" : "rutas configuradas"} · usadas para autocompletar tarifas al asignar viajes`, ratesTable)}
    </div>`;
  const transportDataPanel = `<div class="hr-workspace-panel transport-workspace-panel${transportTripsWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-transport-trips-panel="data">
      <section class="transport-data-panel">
        <div class="transport-data-toolbar payroll-data-toolbar payroll-data-toolbar--compact">${transportDataNav}</div>
        <div class="transport-data-panes">${tripsDataPane}${routesDataPane}</div>
      </section>
    </div>`;
  return `<section class="transport-studio transport-shell transport-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(transportTripsWorkspace)}">${transportWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${transportOperatePanel}
        ${transportDataPanel}
      </div>
    </section>`;
}


(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({transportTripsHtml, buildDeletedTransportTripsLogSection, buildDeletedTransportRequestsLogSection});
})();

(function registerTransportTripsPortalBinds() {
  "use strict";

  function bindTransportTripsPortalControls() {
    if (String(state.currentView || "") !== "transport-trips" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='transport-trips']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = String(btn.dataset.tab || "");
        if (!tab) return;
        const ws = normalizeTransportTripsWorkspace(tab);
        if (!HR_VALID_TRANSPORT_TRIPS_WS.has(ws)) return;
        state.transportTripsUi = { ...(state.transportTripsUi || {}), workspace: ws };
        persistHrWorkspace("transport-trips", ws);
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-section']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = normalizeTransportTripsSection(btn.dataset.section);
        state.transportTripsUi = { ...(state.transportTripsUi || {}), section };
        persistHrWorkspace("transport-trips", state.transportTripsUi.workspace || "operate");
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='trips-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tripsRenderLimit = (Number(state.tripsRenderLimit) || RENDER_WINDOW_SIZE) + RENDER_WINDOW_SIZE;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='trips-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const filterKey = String(btn.dataset.filter || "active");
        state.tripsFilter = filterKey;
        state.tripsRenderLimit = RENDER_WINDOW_SIZE;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        const next = String(el.value || "");
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          search: next
        };
        state.tripsRenderLimit = RENDER_WINDOW_SIZE;
        state.__transportTripsSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-sort']").forEach((select) => {
      select.addEventListener("change", () => {
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          sort: normalizeTransportTripsSort(select.value)
        };
        state.tripsRenderLimit = RENDER_WINDOW_SIZE;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          layout: normalizeTransportTripsLayout(btn.dataset.layout)
        };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='toggle-deleted-requests-log']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (currentUser()?.role !== ROLES.ADMIN) return;
        state.deletedTransportRequestsLogMinimized = !Boolean(state.deletedTransportRequestsLogMinimized);
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='deleted-request-snapshot-detail']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (abortIfNotAdmin()) return;
        const id = String(btn.dataset.id || "").trim();
        if (!id) return;
        await ensureDeletedTransportRequestAuditSnapshotLoaded(id);
        const rows = read(KEYS.deletedTransportRequestLogs, []);
        const row = rows.find((r) => String(r.id) === id);
        if (!row) {
          notify("No se encontró el registro de auditoría.", "error");
          return;
        }
        openDeletedTransportRequestAuditModal(row);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='toggle-deleted-trips-log']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (currentUser()?.role !== ROLES.ADMIN) return;
        state.deletedTransportTripsLogMinimized = !Boolean(state.deletedTransportTripsLogMinimized);
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='deleted-trip-snapshot-detail']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (abortIfNotAdmin()) return;
        const id = String(btn.dataset.id || "").trim();
        if (!id) return;
        await ensureDeletedTransportTripAuditSnapshotLoaded(id);
        const rows = read(KEYS.deletedTransportTripLogs, []);
        const row = rows.find((r) => String(r.id) === id);
        if (!row) {
          notify("No se encontró el registro de auditoría.", "error");
          return;
        }
        openDeletedTransportTripAuditModal(row);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='delete-route-rate']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (abortIfNotAdmin()) return;
        const encoded = String(btn.dataset.rateKey || "");
        const key = decodeURIComponent(encoded);
        if (!key) return;
        openConfirmModal({
          title: "Quitar tarifa de trayecto",
          message: "Esta ruta dejara de sugerir precio al asignar viajes.",
          confirmText: "Quitar tarifa",
          onConfirm: async () => {
            const rates = { ...getTripRouteRatesNormalized() };
            const removed = rates[key];
            const removedId =
              removed && typeof removed === "object" ? String(removed.id || "").trim() : "";
            delete rates[key];
            try {
              await writeAwaitServer(
                KEYS.tripRouteRates,
                rates,
                removedId ? { deletedIds: [removedId] } : {}
              );
            } catch (err) {
              notify(String(err?.message || "No se pudo actualizar las tarifas en el servidor."), "error");
              return;
            }
            notify(userMessage("routeRateDeleted"), "success");
            renderPortalView();
          }
        });
      });
    });

    const createTripForm = document.getElementById("form-create-trip");
    if (createTripForm) {
      wireCreateTripRequestPicker(createTripForm);
      const onCreateTripProgress = () => updateCreateTripStepper(createTripForm);
      createTripForm.addEventListener("change", (ev) => {
        const t = ev.target;
        if (t?.matches?.("select[name='vehicleId'], select[name='driverId']")) {
          onCreateTripProgress();
        }
      });
      createTripForm.addEventListener("input", (ev) => {
        if (ev.target?.matches?.("input[name='tripValue']")) onCreateTripProgress();
      });
      const selectReq = createTripForm.querySelector("select[name='requestId']");
      if (selectReq) {
        selectReq.addEventListener("change", () => {
          const rid = String(selectReq.value || "").trim();
          const req = rid ? reqRead().find((r) => String(r.id) === rid) : null;
          if (req) wireTripAssignmentScheduleBusyRefresh(createTripForm, req, rid, requestRequiresTermoking(req));
          else refreshCreateTripModuleForm(createTripForm);
          onCreateTripProgress();
        });
        if (!createTripForm.dataset.scheduleBusyWired) {
          createTripForm.dataset.scheduleBusyWired = "1";
          const onBusy = (ev) => {
            const form = document.getElementById("form-create-trip");
            if (!form) return;
            const rid = String(form.querySelector("select[name='requestId']")?.value || "").trim();
            if (!rid || String(ev?.detail?.requestId || "") !== rid) return;
            refreshCreateTripModuleForm(form);
          };
          createTripForm._scheduleBusyHandler = onBusy;
          document.addEventListener("transport-schedule-busy-updated", onBusy);
        }
        refreshCreateTripModuleForm(createTripForm);
        const initRid = String(selectReq.value || "").trim();
        const initReq = initRid ? reqRead().find((r) => String(r.id) === initRid) : null;
        if (initReq) wireTripAssignmentScheduleBusyRefresh(createTripForm, initReq, initRid, requestRequiresTermoking(initReq));
      }

      wireFormSubmitGuard(createTripForm, async (event) => {
        const data = readFormEntriesNormalized(createTripForm);
        const requestId = String(data.requestId || "");
        if (!requestId) {
          failPortalField(createTripForm, "requestId", userMessage("bulkSelectPending"));
          return;
        }
        const actor = currentUser();
        const request = reqRead().find((item) => item.id === requestId);
        if (!request) {
          failPortalField(createTripForm, "requestId", userMessage("bulkRequestMissing"));
          return;
        }
        if (!transportRequestBelongsToUserScope(request, actor) && !canViewAllTransportRequests(actor)) {
          notify(userMessage("requestAssignOutOfScope"), "error");
          return;
        }
        const allowApproveAndAssign =
          request.status === STATUS.PENDIENTE && canApproveTransportRequests(actor);
        if (!canAssignTripFromViajesModule(request, actor)) {
          failPortalField(
            createTripForm,
            "requestId",
            request.status === STATUS.PENDIENTE
              ? userMessage("requestMustBeApprovedBeforeAssign")
              : userMessage("requestNotReadyForTripAssign")
          );
          return;
        }
        if (!isRequestPickupSameDayOrFuture(request)) {
          failPortalField(createTripForm, "requestId", userMessage("assignPastRequestDate"));
          return;
        }
        await refreshTransportScheduleBusyFromApi(request, requestId);
        const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
        const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
        const vehicleId = String(data.vehicleId || "").trim();
        const driverId = String(data.driverId || "").trim();
        const schedPickup = requestSchedulingPickupIso(request);
        const schedDelivery = requestSchedulingDeliveryIso(request);
        if (!vehicleId) {
          failPortalField(createTripForm, "vehicleId", userMessage("assignSelectResources"));
          return;
        }
        if (!driverId) {
          failPortalField(createTripForm, "driverId", userMessage("assignSelectResources"));
          return;
        }
        if (
          notifyScheduleConflictIfAny(
            schedPickup,
            schedDelivery,
            requestId,
            "vehículo",
            (t) => String(t.vehicleId || "").trim() === vehicleId,
            { form: createTripForm, field: "vehicleId" }
          )
        ) {
          return;
        }
        if (
          notifyScheduleConflictIfAny(
            schedPickup,
            schedDelivery,
            requestId,
            "conductor",
            (t) => String(t.driverId || "").trim() === driverId,
            { form: createTripForm, field: "driverId" }
          )
        ) {
          return;
        }
        if (!compatibleVehicles.length || !compatibleDrivers.length) {
          failPortalField(createTripForm, "requestId", userMessage("tripAssignNoMatch"));
          return;
        }
        if (!compatibleVehicles.some((v) => v.id === vehicleId)) {
          failPortalField(createTripForm, "vehicleId", userMessage("assignResourcesBusy"));
          return;
        }
        if (!compatibleDrivers.some((d) => d.id === driverId)) {
          failPortalField(createTripForm, "driverId", userMessage("assignResourcesBusy"));
          return;
        }
        const tripValue = parseMoneyFieldValue(data.tripValue);
        if (tripValue <= 0) {
          failPortalField(createTripForm, "tripValue", userMessage("assignPriceRequired"));
          return;
        }
        const ok = approveRequest(requestId, actor?.name || "Administrador", false, vehicleId, driverId, tripValue, {
          allowApproveAndAssign
        });
        if (!ok) return;
        suppressSelfInboxPollToastIfRecipientIsCurrentUser(request.clientUserId);
        notify(userMessage("tripCreatedAssigned"), "success");
        collapseCreatePanel("create-trip");
        renderPortalView();
      }, { busyText: "Asignando viaje…" });
    }

    const routeRateFormEl = document.getElementById("form-route-rate");
    if (routeRateFormEl) {
      const originDept = routeRateFormEl.querySelector("#route-rate-origin-dept");
      const originCity = routeRateFormEl.querySelector("#route-rate-origin-city");
      const destDept = routeRateFormEl.querySelector("#route-rate-dest-dept");
      const destCity = routeRateFormEl.querySelector("#route-rate-dest-city");
      const editingKeyInput = routeRateFormEl.querySelector("#route-rate-editing-key");
      const submitBtn = routeRateFormEl.querySelector("#route-rate-submit-btn");
      const editingHint = routeRateFormEl.querySelector("#route-rate-editing-hint");
      const scopeMount = routeRateFormEl.querySelector("[data-route-rate-scope-mount]");
      const companies = read(KEYS.companies, []);
      const fillRouteRateCities = (departmentSelect, citySelect) => {
        const department = String(departmentSelect?.value || "");
        const cities = COLOMBIA_LOCATIONS[department] || [];
        citySelect.innerHTML = `<option value="">Seleccione…</option>${cities
          .map((c) => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`)
          .join("")}`;
      };
      const formatRouteRatePreviewPlace = (deptSelect, citySelect) => {
        const city = String(citySelect?.selectedOptions?.[0]?.textContent || citySelect?.value || "").trim();
        const dept = String(deptSelect?.value || "").trim();
        if (city && city !== "Seleccione…" && city !== "Elija departamento…") {
          return dept ? `${city}, ${dept}` : city;
        }
        if (dept) return dept;
        return "";
      };
      const updateRouteRatePreview = () => {
        const preview = routeRateFormEl.querySelector("[data-route-rate-preview]");
        const originEl = routeRateFormEl.querySelector("[data-route-rate-preview-origin]");
        const destEl = routeRateFormEl.querySelector("[data-route-rate-preview-dest]");
        if (originEl && destEl) {
          const origin = formatRouteRatePreviewPlace(originDept, originCity);
          const dest = formatRouteRatePreviewPlace(destDept, destCity);
          originEl.textContent = origin || "Seleccione origen";
          destEl.textContent = dest || "Seleccione destino";
          if (preview) preview.classList.toggle("is-ready", Boolean(origin && dest));
        }
        const routeOk =
          Boolean(String(originDept?.value || "").trim()) &&
          Boolean(String(originCity?.value || "").trim()) &&
          Boolean(String(destDept?.value || "").trim()) &&
          Boolean(String(destCity?.value || "").trim());
        const priceOk = parseMoneyFieldValue(routeRateFormEl.querySelector("input[name='tripRateCop']")?.value || 0) > 0;
        const scope = String(routeRateFormEl.querySelector("[data-route-rate-scope-field]")?.value || "all");
        const scopeOk =
          scope === "all" ||
          routeRateFormEl.querySelectorAll('input[name="rateClientCompanies"]:checked').length > 0;
        const checklist = routeRateFormEl.querySelector("[data-route-rate-readiness]");
        if (checklist) {
          const items = [
            { done: routeOk, label: "Trayecto", short: "Trayecto" },
            { done: priceOk, label: "Tarifa", short: "Tarifa" },
            { done: scopeOk, label: "Alcance", short: "Alcance" }
          ];
          checklist.innerHTML = items
            .map(
              (it) =>
                `<li class="create-trip-readiness-item assign-trip-check${it.done ? " is-done" : ""}" title="${escapeAttr(it.label)}"><span class="create-trip-readiness-mark" aria-hidden="true">${it.done ? IC.check : ""}</span><span class="assign-trip-check-label">${escapeHtml(it.short)}</span></li>`
            )
            .join("");
        }
        if (submitBtn) {
          const ready = routeOk && priceOk && scopeOk;
          submitBtn.disabled = !ready;
          submitBtn.setAttribute("aria-disabled", ready ? "false" : "true");
        }
      };
      const resetRateScopeMount = () => {
        if (!scopeMount) return;
        scopeMount.innerHTML = buildRouteRateScopeStepInnerHtml(companies);
        delete routeRateFormEl.dataset.routeRateScopeWired;
        delete scopeMount.dataset.routeRateScopeWired;
        wireRouteRateScopeSection(routeRateFormEl);
      };
      const resetRateEditMode = () => {
        if (editingKeyInput) editingKeyInput.value = "";
        if (submitBtn) {
          submitBtn.textContent = `${IC.plus} Guardar tarifa de trayecto`;
          submitBtn.disabled = true;
          submitBtn.setAttribute("aria-disabled", "true");
        }
        if (editingHint) editingHint.hidden = true;
        resetRateScopeMount();
        updateRouteRatePreview();
      };
      nodes.viewRoot.querySelectorAll("[data-action='edit-route-rate']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const encoded = String(btn.dataset.rateKey || "");
          const key = decodeURIComponent(encoded);
          if (!key) return;
          openRouteRateInlineEdit(key);
        });
      });
      const onRouteFieldChange = () => {
        updateRouteRatePreview();
      };
      if (originDept && originCity) {
        originDept.addEventListener("change", () => {
          fillRouteRateCities(originDept, originCity);
          onRouteFieldChange();
        });
        originCity.addEventListener("change", onRouteFieldChange);
      }
      if (destDept && destCity) {
        destDept.addEventListener("change", () => {
          fillRouteRateCities(destDept, destCity);
          onRouteFieldChange();
        });
        destCity.addEventListener("change", onRouteFieldChange);
      }
      updateRouteRatePreview();
      wireMoneyInputs(routeRateFormEl);
      wireRouteRateScopeSection(routeRateFormEl);
      routeRateFormEl.addEventListener("change", (ev) => {
        const t = ev.target;
        if (
          t?.matches?.(
            "input[name='tripRateCop'], input[name='rateClientCompanies'], [data-route-rate-scope-pick], [data-route-rate-scope-field]"
          )
        ) {
          updateRouteRatePreview();
        }
      });
      routeRateFormEl.addEventListener("input", (ev) => {
        if (ev.target?.matches?.("input[name='tripRateCop']")) updateRouteRatePreview();
      });
      routeRateFormEl.addEventListener("click", (ev) => {
        if (
          ev.target?.closest?.(
            "[data-route-rate-scope-pick], [data-route-rate-select-visible], [data-route-rate-select-all], [data-route-rate-clear-all]"
          )
        ) {
          queueMicrotask(() => updateRouteRatePreview());
        }
      });
      const pendingEditKey = state.pendingRouteRateEditKey;
      if (pendingEditKey) {
        state.pendingRouteRateEditKey = null;
        populateRouteRateInlineForm(pendingEditKey);
        updateRouteRatePreview();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const formEl = document.getElementById("form-route-rate");
            if (formEl) scrollIntoViewSmoothBlockStart(formEl);
          });
        });
      }
      wireFormSubmitGuard(routeRateFormEl, async (event) => {
        const fd = new FormData(routeRateFormEl);
        const data = readFormEntriesNormalized(routeRateFormEl);
        const scopeField = routeRateFormEl.querySelector("[data-route-rate-scope-field]");
        const scope = String(scopeField?.value || data.rateScope || "all");
        const companyIdsRaw = [...fd.getAll("rateClientCompanies")]
          .map((v) => String(v || "").trim())
          .filter(Boolean);
        const companyIds = scope === "specific" ? companyIdsRaw : [];
        const od = normalizeLatinForDb(String(data.originDepartment || "").trim());
        const oc = normalizeLatinForDb(String(data.originCity || "").trim());
        const dd = normalizeLatinForDb(String(data.destinationDepartment || "").trim());
        const dc = normalizeLatinForDb(String(data.destinationCity || "").trim());
        const tripRateCop = parseMoneyFieldValue(data.tripRateCop);
        if (!od) {
          failPortalField(routeRateFormEl, "originDepartment", userMessage("routeRateSelectRoute"));
          return;
        }
        if (!oc) {
          failPortalField(routeRateFormEl, "originCity", userMessage("routeRateSelectRoute"));
          return;
        }
        if (!dd) {
          failPortalField(routeRateFormEl, "destinationDepartment", userMessage("routeRateSelectRoute"));
          return;
        }
        if (!dc) {
          failPortalField(routeRateFormEl, "destinationCity", userMessage("routeRateSelectRoute"));
          return;
        }
        if (tripRateCop <= 0) {
          failPortalField(routeRateFormEl, "tripRateCop", userMessage("routeRateInvalidCop"));
          return;
        }
        if (scope === "specific" && !companyIds.length) {
          const scopeEl = routeRateFormEl.querySelector("[data-route-rate-companies-field]") || routeRateFormEl.querySelector("[name='rateClientCompanies']");
          failPortalField(routeRateFormEl, scopeEl || "rateClientCompanies", "Selecciona al menos una empresa para una tarifa específica.");
          return;
        }
        const routeKey = buildTripRouteRateKey(od, oc, dd, dc);
        const normalized = getTripRouteRatesNormalized();
        const storageKey = tripRateStorageKey(routeKey, companyIds);
        const editingKey = String(data.editingRateKey || "").trim();
        const previousEntry = editingKey ? normalized[editingKey] : normalized[storageKey];
        const next = { ...normalized, [storageKey]: buildRouteRateEntry(tripRateCop, companyIds, previousEntry) };
        if (editingKey && editingKey !== storageKey) delete next[editingKey];
        try {
          await writeAwaitServer(KEYS.tripRouteRates, next);
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
        notify(editingKey ? "Tarifa por trayecto actualizada." : userMessage("routeRateSaved"), "success");
        resetRateEditMode();
        collapseCreatePanel("create-route-rate");
        renderPortalView();
      }, { busyText: "Guardando tarifa…" });
    }

    nodes.viewRoot.querySelectorAll("[data-action='trip-detail']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const req = reqRead().find((r) => r.id === btn.dataset.id);
        if (!req || !req.trip) return;
        openAssignedTripInfoModal(req);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='edit-trip']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const req = reqRead().find((r) => r.id === btn.dataset.id);
        if (!req || !req.trip) return;
        openEditTripModal(req);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='trip-invoice']").forEach((btn) => {
      btn.addEventListener("click", () => {
        openTripInvoicePdf(String(btn.dataset.id || ""));
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='trip-status']").forEach((select) => {
      select.addEventListener("change", async () => {
        if (abortUnlessCanManageTransportTrips()) {
          renderPortalView();
          return;
        }
        const actor = currentUser();
        const previousStatus = String(select.dataset.currentStatus || "");
        const selectedStatus = String(select.value || "");
        const nextClass = `trip-status-select--${slugStatus(selectedStatus)}`;
        [...select.classList]
          .filter((cls) => cls.startsWith("trip-status-select--"))
          .forEach((cls) => select.classList.remove(cls));
        select.classList.add(nextClass);
        const changed = await transitionRequestStatus(select.dataset.id, select.value, actor?.name || "Operación");
        if (!changed) {
          const fallbackStatus = previousStatus || selectedStatus;
          const fallbackClass = `trip-status-select--${slugStatus(fallbackStatus)}`;
          select.value = fallbackStatus;
          [...select.classList]
            .filter((cls) => cls.startsWith("trip-status-select--"))
            .forEach((cls) => select.classList.remove(cls));
          select.classList.add(fallbackClass);
        }
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='delete-trip']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (abortIfNotAdmin()) return;
        const requestId = String(btn.dataset.id || "");
        if (!requestId) return;
        openConfirmReasonModal({
          title: "Eliminar viaje",
          message:
            "Se quitara la asignacion de camion y conductor. La solicitud volvera a estado aprobada pendiente de asignacion. El motivo quedara registrado.",
          confirmText: "Eliminar viaje",
          onConfirm: async (motivo) => {
            try {
              await postPortalAuthorized("/portal/admin-clear-trip", { requestId, motivo });
            } catch (err) {
              notify(String(err?.message || "No fue posible quitar el viaje en el servidor."), "error");
              return;
            }
            await reqWriteAwait(
              reqRead().map((request) =>
                request.id === requestId
                  ? {
                      ...request,
                      status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
                      trip: null,
                      deliveredAt: null,
                      closedAt: null
                    }
                  : request
              )
            );
            recalculateResourceAvailability();
            try {
              await applyPortalBootstrapFromApi();
            } catch (_e) {}
            notify(userMessage("tripRemoved"), "success");
            renderPortalView();
          }
        });
      });
    });

    const tripsSearchRestore = state.__transportTripsSearchRestore;
    if (tripsSearchRestore && typeof tripsSearchRestore.start === "number") {
      delete state.__transportTripsSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "transport-trips") return;
        const inp = root.querySelector("[data-action='transport-trips-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          const s = Math.max(0, Math.min(tripsSearchRestore.start, n));
          const e = Math.max(0, Math.min(tripsSearchRestore.end ?? tripsSearchRestore.start, n));
          inp.setSelectionRange(s, e);
        }
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["transport-trips"] = bindTransportTripsPortalControls;
})();
