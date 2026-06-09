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
  const tripsSearch = String(transportTripsUi.search || "").trim().toLowerCase();
  const tripsSort = normalizeTransportTripsSort(transportTripsUi.sort);
  const tripsLayout = normalizeTransportTripsLayout(transportTripsUi.layout);

  /**
   * Filtros rápidos del módulo: dejamos una sola vista (tarjetas) reemplazando
   * la antigua tabla densa. El usuario puede saltar entre "Activos", "Hoy",
   * "Cerrados" y "Todos" sin perder contexto.
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
    return `<article class="trip-ops-card trip-ops-card--${escapeAttr(statusSlug)}${tripsLayout === "compact" ? " trip-ops-card--compact" : ""}" data-trip-id="${escapeAttr(String(r.id || ""))}">
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
    <div class="transport-ops-layout" role="group" aria-label="Vista de tarjetas">
      <button type="button" class="btn btn-sm ${tripsLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="transport-trips-layout" data-layout="cards">Detallada</button>
      <button type="button" class="btn btn-sm ${tripsLayout === "compact" ? "btn-primary" : "btn-outline"}" data-action="transport-trips-layout" data-layout="compact">Compacta</button>
    </div>
  </div>`;

  const tripsRenderLimit = Number(state.tripsRenderLimit) || RENDER_WINDOW_SIZE;
  const tripsToRender = renderWindowSlice(sortedFilteredTrips, tripsRenderLimit);
  const tripsMoreBar = renderWindowMoreBar(sortedFilteredTrips.length, tripsToRender.length, "trips-render-more");
  const opsCards = sortedFilteredTrips.length
    ? `${opsFiltersBar}${opsToolbar}<div class="trip-ops-cards${tripsLayout === "compact" ? " trip-ops-cards--compact" : ""}">${tripsToRender.map(buildTripOpsCard).join("")}</div>${tripsMoreBar}`
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
  const formatRateAuditCell = (entry) => {
    const fullId = String(entry?.id || "").trim();
    const shortId = fullId ? `${fullId.slice(0, 8)}...` : "Pendiente";
    const createdLbl = fmtDateOr(entry?.createdAt, "—");
    const updatedLbl = fmtDateOr(entry?.updatedAt || entry?.createdAt, "—");
    return `<div title="${escapeAttr(fullId || "Sin ID persistido")}">
      <strong>${escapeHtml(shortId)}</strong><br />
      <span class="muted">Creada ${escapeHtml(createdLbl)}</span><br />
      <span class="muted">Actualizada ${escapeHtml(updatedLbl)}</span>
    </div>`;
  };
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

  const routeRateForm = `<form id="form-route-rate" class="p-form p-form-colored transport-route-form" autocomplete="off">
    ${renderHrFormHero({
      eyebrow: "Catálogo de trayectos",
      title: "Configura trayectos y tarifas sugeridas",
      description: "Define la ruta, el alcance por cliente y el valor pactado para que el sistema sugiera el precio correcto al asignar nuevos viajes.",
      badges: [
        renderHrFormHeroBadge("Ruta", "origen y destino"),
        renderHrFormHeroBadge("Clientes", "general o específico"),
        renderHrFormHeroBadge("COP", "autocompletado")
      ]
    })}
    <input type="hidden" name="editingRateKey" id="route-rate-editing-key" value="" />
    <fieldset class="form-section form-section-blue transport-route-form-fieldset transport-route-form-fieldset--origin">
      <legend>${IC.mapPin} Paso 1 · Ciudad de origen</legend>
      <p class="muted form-section-hint">Indica desde dónde sale el viaje. Selecciona primero el departamento y luego la ciudad.</p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento de origen")}<select name="originDepartment" id="route-rate-origin-dept" required><option value="">Seleccione departamento...</option>${departmentsOpts}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad de origen")}<select name="originCity" id="route-rate-origin-city" required><option value="">Primero elige departamento...</option></select></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet transport-route-form-fieldset transport-route-form-fieldset--destination">
      <legend>${IC.mapPin} Paso 2 · Ciudad de destino</legend>
      <p class="muted form-section-hint">Indica hasta dónde llega el viaje.</p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.mapPin, "Departamento de destino")}<select name="destinationDepartment" id="route-rate-dest-dept" required><option value="">Seleccione departamento...</option>${departmentsOpts}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad de destino")}<select name="destinationCity" id="route-rate-dest-city" required><option value="">Primero elige departamento...</option></select></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald transport-route-form-fieldset transport-route-form-fieldset--price">
      <legend>${IC.dollar} Paso 3 · Tarifa pactada</legend>
      <p class="muted form-section-hint">Valor en pesos colombianos (COP) que se autocompletará cada vez que se asigne un viaje en esta ruta.</p>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.dollar, "Valor del viaje (COP)")}<input type="number" name="tripRateCop" min="1" step="1" required placeholder="Ejemplo: 4.200.000" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full route-rate-scope-fieldset transport-route-form-fieldset transport-route-form-fieldset--scope">
      <legend>${IC.briefcase} Paso 4 · ¿A qué clientes aplica?</legend>
      <p class="muted form-section-hint">Elija <strong>General</strong> si la tarifa es la misma para todos, o <strong>Por empresa</strong> y marque los clientes. Use la búsqueda si tiene muchas empresas registradas.</p>
      <div class="route-rate-scope-mount" data-route-rate-scope-mount>
        ${buildRouteRateScopeStepInnerHtml(companiesForRates)}
      </div>
      <p class="muted full" id="route-rate-editing-hint" style="margin:0.35rem 0 0;display:none">Estás editando una tarifa existente. Al guardar se sobrescribirá el valor anterior.</p>
    </fieldset>
    ${renderManagedCreateFormActions(
      "create-route-rate",
      `<button class="btn btn-primary" id="route-rate-submit-btn" type="submit">${IC.plus} Guardar tarifa de trayecto</button>`,
      {
        className: "form-flow-actions full transport-route-form-actions",
        extraActionsHtml: `<button class="btn btn-sm btn-action btn-danger-soft module-panel-btn module-panel-btn--cancel module-panel-btn--cancel-edit" id="route-rate-cancel-edit" type="button" style="display:none" title="Salir del modo edición sin guardar cambios">${renderModulePanelBtnInner(IC.x, "Cancelar edición")}</button>`
      }
    )}
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
  const pendingSelectOpts = [
    canApproveInViajes && pendingApproveTrip.length
      ? `<optgroup label="Pendientes (puede aprobar y asignar)">${pendingApproveTrip.map(tripAssignOptionHtml).join("")}</optgroup>`
      : "",
    pendingAssignTrip.length
      ? `<optgroup label="Aprobadas · por asignar">${pendingAssignTrip.map(tripAssignOptionHtml).join("")}</optgroup>`
      : pendingForTrip.map(tripAssignOptionHtml).join("")
  ]
    .filter(Boolean)
    .join("");
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
  const topTripActions = `<div class="module-panel-actions module-panel-actions--footer form-flow-actions full create-trip-top-actions">
    <div class="module-panel-actions__bar">
      <div class="module-panel-actions__group module-panel-actions__group--secondary">
        ${renderModulePanelToggleBtn({ expanded: true, toggleAction: "toggle-create-panel", panelId: "create-trip", expandLabel: "Abrir formulario" })}
        ${renderModulePanelCancelBtn({ cancelAction: "cancel-create-panel", panelId: "create-trip" })}
      </div>
    </div>
  </div>`;
  const createTripForm = `<form id="form-create-trip" class="p-form p-form-colored assign-trip-form assign-trip-form--revamp create-trip-form transport-trip-create-form" autocomplete="off">
    ${topTripActions}
    <div class="assign-trip-top">
      <ol class="create-trip-stepper create-trip-stepper--track assign-trip-stepper" aria-label="Pasos para asignar viaje">
        <li class="create-trip-step create-trip-step--current" data-step="1" aria-current="step"><span class="create-trip-step-n">1</span><span class="create-trip-step-t">Solicitud</span></li>
        <li class="create-trip-step create-trip-step--locked" data-step="2"><span class="create-trip-step-n">2</span><span class="create-trip-step-t">Recursos</span></li>
        <li class="create-trip-step create-trip-step--locked" data-step="3"><span class="create-trip-step-n">3</span><span class="create-trip-step-t">Tarifa</span></li>
      </ol>
      ${pendingBadge}
    </div>
    <section class="assign-trip-block transport-trip-create-form__request" aria-labelledby="assign-trip-request-title">
      <header class="assign-trip-block-head">
        <h4 id="assign-trip-request-title" class="assign-trip-block-title">${IC.compass} Solicitud</h4>
      </header>
      <div class="assign-trip-block-body">
        <label class="assign-trip-field assign-trip-field--request">
          <span class="assign-trip-field-label">${fieldLabel(IC.inbox, "Solicitud", { required: true })}</span>
          <select name="requestId" id="create-trip-request-select" ${pendingForTrip.length ? "required" : "disabled"}>
            <option value="">${pendingForTrip.length ? "Seleccione…" : pendingExpired.length ? "Sin asignables hoy" : canApproveInViajes ? "Sin solicitudes pendientes" : "Apruebe solicitudes en Autorizaciones primero"}</option>
            ${pendingSelectOpts}
            ${expiredPendingOpts ? `<optgroup label="Vencidas (no asignables)">${expiredPendingOpts}</optgroup>` : ""}
          </select>
        </label>
        <div id="trip-request-preview" class="assign-trip-preview create-trip-summary-panel">
          ${createTripEmptyHint("inbox", "Seleccione una solicitud")}
        </div>
      </div>
    </section>
    <section class="assign-trip-block assign-trip-block--fleet transport-trip-create-form__resources" aria-labelledby="assign-trip-fleet-title">
      <header class="assign-trip-block-head">
        <h4 id="assign-trip-fleet-title" class="assign-trip-block-title">${IC.truck} Vehículo y conductor</h4>
        <div class="create-trip-flag-legend assign-trip-flags" role="list" aria-label="Banderas en listas">
          <span class="create-trip-flag create-trip-flag--busy" role="listitem" title="Ocupado en otra ventana"><span class="create-trip-flag-dot"></span>Ocup.</span>
          <span class="create-trip-flag create-trip-flag--offline" role="listitem" title="No disponible"><span class="create-trip-flag-dot"></span>No disp.</span>
          <span class="create-trip-flag create-trip-flag--expired" role="listitem" title="Documentación vencida"><span class="create-trip-flag-dot"></span>Doc.</span>
        </div>
      </header>
      <div class="assign-trip-block-body">
        <div id="create-trip-fleet-stats" class="create-trip-fleet-stats assign-trip-fleet-stats" aria-live="polite"></div>
        <div class="assign-trip-fleet-grid create-trip-fleet-grid">
          <label class="assign-trip-fleet-field create-trip-fleet-field assign-trip-resource">
            <span class="assign-trip-resource-label">${fieldLabel(IC.truck, "Vehículo", { required: true })}</span>
            <select name="vehicleId" id="create-trip-vehicle-select" class="create-trip-resource-select searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Placa, tipo o capacidad…" disabled><option value="">Elija solicitud primero</option></select>
          </label>
          <label class="assign-trip-fleet-field create-trip-fleet-field assign-trip-resource">
            <span class="assign-trip-resource-label">${fieldLabel(IC.user, "Conductor", { required: true })}</span>
            <select name="driverId" id="create-trip-driver-select" class="create-trip-resource-select searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Nombre, documento o teléfono…" disabled><option value="">Elija solicitud primero</option></select>
          </label>
        </div>
      </div>
    </section>
    <section class="assign-trip-block assign-trip-block--rate transport-trip-create-form__pricing" aria-labelledby="assign-trip-rate-title">
      <header class="assign-trip-block-head">
        <h4 id="assign-trip-rate-title" class="assign-trip-block-title">${IC.dollar} Precio</h4>
      </header>
      <div id="create-trip-rate-fields" class="assign-trip-rate create-trip-rate-surface">
        ${createTripEmptyHint("dollar", "Tarifa pendiente")}
      </div>
    </section>
    <footer class="assign-trip-footer create-trip-submit-wrap">
      <ul class="assign-trip-checklist create-trip-readiness" data-create-trip-readiness aria-label="Requisitos para asignar"></ul>
      <div class="module-panel-actions module-panel-actions--footer form-flow-actions create-trip-submit-actions assign-trip-submit-actions">
        <div class="module-panel-actions__bar">
          <div class="module-panel-actions__group module-panel-actions__group--primary">
            <button class="btn btn-primary create-trip-submit-btn" type="submit" ${pendingForTrip.length ? "" : "disabled"}>${IC.check} Crear viaje</button>
          </div>
        </div>
      </div>
    </footer>
  </form>`;

  const workspaceNav = renderModuleWindowTabs({
    ariaLabel: "Secciones del módulo Viajes y trayectos",
    activeId: transportTripsWorkspace,
    action: "transport-trips-workspace",
    valueAttr: "workspace",
    tabs: [
      { id: "trips", label: "Viajes", count: trips.length },
      { id: "routes", label: "Trayectos", count: rateEntries.length }
    ]
  });
  const tripsCreateCard = createCollapsibleProCard(
    "create-trip",
    "truck",
    "Asignar viaje",
    `${pendingForTrip.length} disponible${pendingForTrip.length === 1 ? "" : "s"} · 3 pasos`,
    createTripForm,
    "hr-form-card hr-form-card--xl transport-form-card transport-form-card--trip",
    "Abrir formulario",
    { createPanels: state.createPanels }
  );
  const routesCreateCard = createCollapsibleProCard(
    "create-route-rate",
    "mapPin",
    "Configurar trayecto y tarifa",
    `${rateEntries.length} ${rateEntries.length === 1 ? "ruta catalogada" : "rutas catalogadas"} para autocompletado`,
    routeRateForm,
    "hr-form-card hr-form-card--xl transport-form-card transport-form-card--route",
    "Abrir formulario",
    { createPanels: state.createPanels }
  );
  const tripsPanel = `<div class="auth-tab-panel${transportTripsWorkspace === "trips" ? "" : " hidden"} transport-workspace-panel" data-transport-trips-panel="trips"${transportTripsWorkspace === "trips" ? "" : " hidden"}>
      <section class="ops-block transport-workspace-stack">

        ${tripsCreateCard}
        ${pcardWrap("activity", "Panel operativo de viajes", `${sortedFilteredTrips.length} viajes en vista actual`, opsCards)}
      </section>
    </div>`;
  const routesPanel = `<div class="auth-tab-panel${transportTripsWorkspace === "routes" ? "" : " hidden"} transport-workspace-panel" data-transport-trips-panel="routes"${transportTripsWorkspace === "routes" ? "" : " hidden"}>
      <section class="ops-block transport-workspace-stack">
        <header class="payroll-panel-intro ops-block-head">
          <h3>Trayectos</h3>
          <p class="ops-block-lead muted">Mantén aparte el catálogo de rutas y tarifas por cliente para que el equipo configure precios sugeridos sin interferir con la operación diaria de viajes.</p>
        </header>
        ${routesCreateCard}
        ${pcardWrap("mapPin", "Rutas y tarifas configuradas", `${rateEntries.length} ${rateEntries.length === 1 ? "ruta configurada" : "rutas configuradas"} · usadas para autocompletar tarifas al asignar viajes`, ratesTable)}
      </section>
    </div>`;
  return `${workspaceNav}<div class="auth-tab-panels transport-trips-tab-panels">${tripsPanel}${routesPanel}</div>`;
}


(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({transportTripsHtml, buildDeletedTransportTripsLogSection, buildDeletedTransportRequestsLogSection});
})();

(function registerTransportTripsPortalBinds() {
  "use strict";

  function bindTransportTripsPortalControls() {
    if (String(state.currentView || "") !== "transport-trips" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-workspace']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const workspace = normalizeTransportTripsWorkspace(btn.dataset.workspace);
        state.transportTripsUi = { ...(state.transportTripsUi || {}), workspace };
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
      const onCreateTripProgress = () => updateCreateTripStepper(createTripForm);
      createTripForm.addEventListener("change", (ev) => {
        const t = ev.target;
        if (t?.matches?.("select[name='vehicleId'], select[name='driverId']")) onCreateTripProgress();
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
          notify(userMessage("bulkSelectPending"), "error");
          return;
        }
        const actor = currentUser();
        const request = reqRead().find((item) => item.id === requestId);
        if (!request) {
          notify(userMessage("bulkRequestMissing"), "error");
          return;
        }
        if (!transportRequestBelongsToUserScope(request, actor) && !canViewAllTransportRequests(actor)) {
          notify(userMessage("requestAssignOutOfScope"), "error");
          return;
        }
        const allowApproveAndAssign =
          request.status === STATUS.PENDIENTE && canApproveTransportRequests(actor);
        if (!canAssignTripFromViajesModule(request, actor)) {
          notify(
            request.status === STATUS.PENDIENTE
              ? userMessage("requestMustBeApprovedBeforeAssign")
              : userMessage("requestNotReadyForTripAssign"),
            "error"
          );
          return;
        }
        if (!isRequestPickupSameDayOrFuture(request)) {
          notify(userMessage("assignPastRequestDate"), "error");
          return;
        }
        await refreshTransportScheduleBusyFromApi(request, requestId);
        const compatibleVehicles = getCompatibleVehiclesForRequest(request, requestId);
        const compatibleDrivers = getCompatibleDriversForRequest(request, requestId);
        const vehicleId = String(data.vehicleId || "").trim();
        const driverId = String(data.driverId || "").trim();
        const schedPickup = requestSchedulingPickupIso(request);
        const schedDelivery = requestSchedulingDeliveryIso(request);
        if (!vehicleId || !driverId) {
          notify(userMessage("assignSelectResources"), "error");
          return;
        }
        if (
          notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "vehículo", (t) =>
            String(t.vehicleId || "").trim() === vehicleId
          )
        ) {
          return;
        }
        if (
          notifyScheduleConflictIfAny(schedPickup, schedDelivery, requestId, "conductor", (t) =>
            String(t.driverId || "").trim() === driverId
          )
        ) {
          return;
        }
        if (!compatibleVehicles.length || !compatibleDrivers.length) {
          notify(userMessage("tripAssignNoMatch"), "error");
          return;
        }
        if (!compatibleVehicles.some((v) => v.id === vehicleId) || !compatibleDrivers.some((d) => d.id === driverId)) {
          notify(userMessage("assignResourcesBusy"), "error");
          return;
        }
        const tripValue = parseMoneyFieldValue(data.tripValue);
        if (tripValue <= 0) {
          notify(userMessage("assignPriceRequired"), "error");
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
      const cancelEditBtn = routeRateFormEl.querySelector("#route-rate-cancel-edit");
      const editingHint = routeRateFormEl.querySelector("#route-rate-editing-hint");
      const scopeMount = routeRateFormEl.querySelector("[data-route-rate-scope-mount]");
      const companies = read(KEYS.companies, []);
      const fillRouteRateCities = (departmentSelect, citySelect) => {
        const department = String(departmentSelect?.value || "");
        const cities = COLOMBIA_LOCATIONS[department] || [];
        citySelect.innerHTML = `<option value="">Seleccione...</option>${cities
          .map((c) => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`)
          .join("")}`;
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
        if (submitBtn) submitBtn.textContent = `${IC.plus} Guardar tarifa de trayecto`;
        if (cancelEditBtn) cancelEditBtn.style.display = "none";
        if (editingHint) editingHint.style.display = "none";
        resetRateScopeMount();
      };
      nodes.viewRoot.querySelectorAll("[data-action='edit-route-rate']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const encoded = String(btn.dataset.rateKey || "");
          const key = decodeURIComponent(encoded);
          if (!key) return;
          openRouteRateInlineEdit(key);
        });
      });
      if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", () => {
          routeRateFormEl.reset();
          if (originCity) originCity.innerHTML = `<option value="">Seleccione departamento...</option>`;
          if (destCity) destCity.innerHTML = `<option value="">Seleccione departamento...</option>`;
          resetRateEditMode();
        });
      }
      if (originDept && originCity) {
        originDept.addEventListener("change", () => fillRouteRateCities(originDept, originCity));
      }
      if (destDept && destCity) {
        destDept.addEventListener("change", () => fillRouteRateCities(destDept, destCity));
      }
      wireRouteRateScopeSection(routeRateFormEl);
      const pendingEditKey = state.pendingRouteRateEditKey;
      if (pendingEditKey) {
        state.pendingRouteRateEditKey = null;
        populateRouteRateInlineForm(pendingEditKey);
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
        const tripRateCop = parseNum(data.tripRateCop);
        if (!od || !oc || !dd || !dc) {
          notify(userMessage("routeRateSelectRoute"), "error");
          return;
        }
        if (tripRateCop <= 0) {
          notify(userMessage("routeRateInvalidCop"), "error");
          return;
        }
        if (scope === "specific" && !companyIds.length) {
          notify("Selecciona al menos una empresa para una tarifa específica.", "error");
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
