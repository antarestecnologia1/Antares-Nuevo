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
      const who = escapeHtml(
        String(
          (typeof formatTransportDeletionAuditUsuario === "function"
            ? formatTransportDeletionAuditUsuario(row)
            : "") ||
            row.deletedByName ||
            row.deletedByEmail ||
            "Sin registrar"
        )
      );
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
      const who = escapeHtml(
        String(
          (typeof formatTransportDeletionAuditUsuario === "function"
            ? formatTransportDeletionAuditUsuario(row)
            : "") ||
            row.deletedByName ||
            row.deletedByEmail ||
            "Sin registrar"
        )
      );
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
  const transportTripsCreateUi = buildTransportTripsCreatePanelsState(transportTripsSection, state.createPanels || {});
  const foldTransportSearchText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const tripsSearch = foldTransportSearchText(String(transportTripsUi.search || "").trim());
  const tripsSort = normalizeTransportTripsSort(transportTripsUi.sort);
  const tripsLayout = normalizeTransportTripsLayout(transportTripsUi.layout);
  /** Si un viaje trae datos corruptos, se omite ese viaje (y se registra el error) en vez de tumbar todo el módulo. */
  const safeBuild = (build, ...args) => {
    try {
      return build(...args);
    } catch (err) {
      if (typeof console !== "undefined" && console.error) console.error("[viajes] no se pudo pintar un viaje", err);
      return "";
    }
  };

  /** Filtros propios de Viajes: cliente, estado, conductor, placa, tipo de servicio y fecha de recogida. */
  const tripsFieldFilters = {
    client: String(transportTripsUi.fClient || ""),
    status: String(transportTripsUi.fStatus || ""),
    driver: String(transportTripsUi.fDriver || ""),
    plate: String(transportTripsUi.fPlate || ""),
    service: String(transportTripsUi.fService || ""),
    from: String(transportTripsUi.fFrom || ""),
    to: String(transportTripsUi.fTo || "")
  };
  const tripsFieldFiltersActive = Object.values(tripsFieldFilters).some(Boolean);

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
      const hay = foldTransportSearchText(
        [
          r.requestNumber,
          r.trip?.tripNumber,
          r.clientName,
          r.originCity,
          r.originDepartment,
          r.destinationCity,
          r.destinationDepartment,
          r.trip?.vehiclePlate,
          r.trip?.driverName,
          r.status,
          r.cargoDescription,
          r.serviceType,
          r.vehicleType,
          r.requiredTruckType
        ].join(" ")
      );
      return hay.includes(tripsSearch);
    })
    .filter((r) => {
      const f = tripsFieldFilters;
      if (f.client && String(r.clientName || "").trim() !== f.client) return false;
      if (f.status && String(r.status || "") !== f.status) return false;
      if (f.driver && String(r.trip?.driverName || "").trim() !== f.driver) return false;
      if (f.plate && String(r.trip?.vehiclePlate || "").trim() !== f.plate) return false;
      if (f.service && String(r.serviceType || "").trim() !== f.service) return false;
      if (f.from || f.to) {
        const pickupDay = String(requestPickupIsoDate(r) || "");
        if (!pickupDay) return false;
        if (f.from && pickupDay < f.from) return false;
        if (f.to && pickupDay > f.to) return false;
      }
      return true;
    });
  const sortedFilteredTrips = filteredTrips.slice().sort((a, b) => {
    if (tripsSort === "pickup_desc") return new Date(rSafePickup(b)).getTime() - new Date(rSafePickup(a)).getTime();
    if (tripsSort === "value_desc") return parseNum(b.tripValue || 0) - parseNum(a.tripValue || 0);
    if (tripsSort === "value_asc") return parseNum(a.tripValue || 0) - parseNum(b.tripValue || 0);
    if (tripsSort === "status") return String(a.status || "").localeCompare(String(b.status || ""), "es", { sensitivity: "base" });
    return new Date(rSafePickup(a)).getTime() - new Date(rSafePickup(b)).getTime();
  });

  const resolveTripCompanyLogoUrl = (r, company) => {
    const fromCompany =
      typeof companyProfileLogoUrl === "function"
        ? companyProfileLogoUrl(company)
        : String(company?.logoUrl ?? company?.url_logo ?? "").trim();
    if (fromCompany) return fromCompany;
    return String(r?.clientCompanyLogoUrl ?? "").trim();
  };

  const tripFarePresentation = (row) => {
    const amount = parseNum(row?.tripValue || 0);
    if (amount > 0) return { text: `$${amount.toLocaleString("es-CO")}`, tone: "value" };
    return { text: "Sin tarifa", tone: "warn" };
  };

  const buildTripMetaChips = (row, reqNo) => {
    const chips = [];
    if (reqNo) chips.push({ label: `Sol. #${reqNo}`, tone: "ref" });
    const mode = String(row?.serviceType || "").trim();
    if (mode) chips.push({ label: /sedes/i.test(mode) ? "Entre sedes" : "Nacional", tone: "mode" });
    if (row?.refrigeracionTermoking === true) chips.push({ label: "Termoking", tone: "cold" });
    else if (row?.refrigeracionTermoking === false) chips.push({ label: "Carga seca", tone: "dry" });
    if (!chips.length) return "";
    return `<div class="transport-trip-card-chips">${chips
      .map(
        (chip) =>
          `<span class="transport-trip-card-chip transport-trip-card-chip--${escapeAttr(chip.tone)}">${escapeHtml(chip.label)}</span>`
      )
      .join("")}</div>`;
  };

  const buildTripOpsCard = (r) => {
    const standby = parseNum(r.standbyChargeTotal);
    const originCity = String(r.originCity || r.originDepartment || "Origen").trim() || "Origen";
    const destinationCity = String(r.destinationCity || r.destinationDepartment || "Destino").trim() || "Destino";
    const statusSlug = slugStatus(r.status);
    const companies = read(KEYS.companies, []);
    const company = companies.find((c) => String(c.id) === String(r.clientCompanyId || "")) || null;
    const clientName = String(r.clientName || company?.name || "Cliente").trim() || "Cliente";
    const logoUrl = resolveTripCompanyLogoUrl(r, company);
    const clientLogoHtml = logoUrl
      ? `<span class="request-company-logo request-company-logo--sm request-ops-card-company-logo" role="img" aria-label="Logo de ${escapeAttr(clientName)}"><img src="${escapeAttr(logoUrl)}" alt="" loading="lazy" /></span>`
      : `<span class="request-company-logo request-company-logo--sm request-company-logo--fallback request-ops-card-company-logo" aria-hidden="true">${escapeHtml(String(clientName || "E").charAt(0).toUpperCase())}</span>`;
    const driverName = String(r.trip?.driverName || "Sin conductor").trim() || "Sin conductor";
    const plate = String(r.trip?.vehiclePlate || "—").trim() || "—";
    const pickupRaw = r.trip?.etaPickup || r.pickupAt || "";
    const pickupLabel = fmtDate(pickupRaw) || "Sin fecha";
    const cargoLabel = String(r.cargoDescription || "Carga").trim() || "Carga";
    const truckReq = typeof requestTruckRequirementSummaryHtml === "function" ? requestTruckRequirementSummaryHtml(r) : "";
    const fare = tripFarePresentation(r);
    const prePickupStatuses = [STATUS.VIAJE_ASIGNADO, STATUS.ESPERA_STANDBY];
    const pickupUrgency =
      pickupRaw && prePickupStatuses.includes(r.status) && typeof portalOpsCardPickupUrgency === "function"
        ? portalOpsCardPickupUrgency(pickupRaw)
        : { label: "", tone: "" };
    const isClosed = [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status);
    const transitions = [r.status, ...(STATUS_TRANSITIONS[r.status] || [])];
    const statusText =
      typeof prettyStatus === "function"
        ? prettyStatus(r.status, "trip")
        : String(r.status || "—").trim() || "—";
    const tripNo = String(r.trip?.tripNumber || "-");
    const reqNo = String(r.requestNumber || r.id || "-");
    const createdLabel = fmtDate(r.createdAt || "") || "—";
    const distanceKm = parseNum(r.distanceKm || 0);
    const metaChipsHtml = buildTripMetaChips(r, reqNo);
    const statusBadgeHtml = buildPortalOpsCardStatusPill(statusText, statusSlug);
    const fleetBar = `<div class="transport-trip-card-fleet-bar portal-ops-card-highlight" role="status">
          <span class="transport-trip-card-fleet-ico" aria-hidden="true">${IC.truck}</span>
          <div class="transport-trip-card-fleet-copy">
            <strong class="transport-trip-card-fleet-plate">${escapeHtml(plate)}</strong>
            <span class="transport-trip-card-fleet-meta"><span class="muted">${escapeHtml(driverName)}</span></span>
          </div>
        </div>`;
    const routeDistanceHtml =
      distanceKm > 0
        ? `<span class="trip-ops-card-route-distance" aria-label="Distancia ${escapeAttr(`${distanceKm.toLocaleString("es-CO")} kilómetros`)}">${escapeHtml(`${distanceKm.toLocaleString("es-CO")} km`)}</span>`
        : "";
    const statusBlockHtml =
      transitions.length > 1
        ? `<div class="trip-ops-card-status-block">
            <p class="trip-ops-card-status-label">${IC.activity}<span>Estado del viaje</span></p>
            <label class="trip-ops-card-status-picker trip-ops-card-status-picker--${escapeAttr(statusSlug)}">
              <span class="trip-ops-card-status-picker-leading" aria-hidden="true">${IC.truck}</span>
              <select class="trip-status-select trip-status-select--${escapeAttr(statusSlug)}" data-action="trip-status" data-id="${escapeAttr(String(r.id || ""))}" data-current-status="${escapeAttr(String(r.status || ""))}" aria-label="Cambiar estado del viaje">
                ${transitions.map((s) => `<option value="${escapeAttr(s)}" ${r.status === s ? "selected" : ""}>${escapeHtml(tripStatusOptionLabel(s))}</option>`).join("")}
              </select>
              <span class="trip-ops-card-status-picker-chevron" aria-hidden="true">${IC.chevronDown}</span>
            </label>
          </div>`
        : `<div class="trip-ops-card-status-block">
            <p class="trip-ops-card-status-label">${IC.activity}<span>Estado del viaje</span></p>
            <div class="trip-ops-card-status-picker trip-ops-card-status-picker--static trip-ops-card-status-picker--${escapeAttr(statusSlug)}" role="status">
              <span class="trip-ops-card-status-picker-leading" aria-hidden="true">${IC.truck}</span>
              <span class="trip-ops-card-status-picker-value">${escapeHtml(String(statusText).replace(/<[^>]*>/g, "").trim())}</span>
            </div>
          </div>`;
    const actionButtons = [
      `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--outline" data-action="trip-detail" data-id="${escapeAttr(String(r.id || ""))}" title="Ficha del viaje">${IC.truck} Viaje</button>`,
      `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--solid" data-action="detail" data-id="${escapeAttr(String(r.id || ""))}" title="Detalle de la solicitud">${IC.eye} Solicitud</button>`,
      canAdminEditTrip(r)
        ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--soft" data-action="edit-trip" data-id="${escapeAttr(String(r.id || ""))}" title="Editar viaje">${IC.edit} Editar</button>`
        : "",
      isClosed
        ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--soft" data-action="trip-invoice" data-id="${escapeAttr(String(r.id || ""))}" title="Generar factura">${IC.file} Factura</button>`
        : "",
      isAdmin
        ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--danger" data-action="delete-trip" data-id="${escapeAttr(String(r.id || ""))}" title="Eliminar viaje">${IC.trash} Eliminar</button>`
        : ""
    ]
      .filter(Boolean)
      .join("");
    return `<article class="trip-ops-card portal-ops-card transport-trip-card trip-ops-card--${escapeAttr(statusSlug)} transport-trip-card--${escapeAttr(statusSlug)}" data-trip-id="${escapeAttr(String(r.id || ""))}">
      <header class="trip-ops-card-head transport-trip-card-head">
        <div class="trip-ops-card-head-main">
          ${clientLogoHtml}
          <div class="trip-ops-card-head-info">
            <p class="trip-ops-card-kicker transport-trip-card-kicker">Viaje #${escapeHtml(tripNo)}</p>
            <h4 class="trip-ops-card-title" title="${escapeAttr(clientName)}">${escapeHtml(clientName)}</h4>
            ${metaChipsHtml}
          </div>
        </div>
        <div class="portal-ops-card-badges">${statusBadgeHtml}</div>
      </header>
      <div class="trip-ops-card-route transport-trip-card-route">
        <div class="trip-ops-card-route-node trip-ops-card-route-node--origin" title="${escapeAttr(originCity)}">
          <span class="trip-ops-card-route-label">Origen</span>
          <span class="trip-ops-card-route-city">
            <span class="trip-ops-card-route-pin trip-ops-card-route-pin--origin" aria-hidden="true">${IC.mapPin}</span>
            <strong>${escapeHtml(originCity)}</strong>
          </span>
        </div>
        <span class="trip-ops-card-route-connector">
          <span class="trip-ops-card-route-line" aria-hidden="true"></span>
          ${routeDistanceHtml}
          <span class="trip-ops-card-route-arrow" aria-hidden="true">${IC.chevronRight}</span>
        </span>
        <div class="trip-ops-card-route-node trip-ops-card-route-node--dest" title="${escapeAttr(destinationCity)}">
          <span class="trip-ops-card-route-label">Destino</span>
          <span class="trip-ops-card-route-city">
            <span class="trip-ops-card-route-pin trip-ops-card-route-pin--dest" aria-hidden="true">${IC.mapPin}</span>
            <strong>${escapeHtml(destinationCity)}</strong>
          </span>
        </div>
      </div>
      <div class="trip-ops-card-grid portal-ops-card-spec-grid transport-trip-card-spec-grid">
        ${buildPortalOpsCardGridItem("Recogida", IC.calendar, pickupLabel, {
          tone: pickupUrgency.tone || "",
          subValue: pickupUrgency.label,
          subTone: pickupUrgency.tone
        })}
        ${buildPortalOpsCardGridItem("Tarifa", IC.dollar, fare.text, { tone: fare.tone })}
        ${buildPortalOpsCardGridItem("Carga", IC.package || IC.file, cargoLabel)}
        ${buildPortalOpsCardGridItem("Camión / requisitos", IC.truck, truckReq, { raw: true })}
      </div>
      ${fleetBar}
      ${standby > 0 ? `<p class="transport-trip-card-standby" role="status"><span class="transport-trip-card-standby-ico" aria-hidden="true">${IC.clock || ""}</span><span class="transport-trip-card-standby-text">Standby acumulado: <strong>$${standby.toLocaleString("es-CO")}</strong></span></p>` : ""}
      ${statusBlockHtml}
      ${buildPortalOpsCardActions(actionButtons)}
      ${buildPortalOpsCardFoot("Creado", createdLabel)}
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
    const fare = tripFarePresentation(r);
    const tripIdAttr = escapeAttr(String(r.id || ""));
    const isClosed = [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status);
    const transitions = [r.status, ...(STATUS_TRANSITIONS[r.status] || [])];
    const statusSelectHtml =
      transitions.length > 1
        ? `<label class="trip-status-control trip-ops-card-status-control trip-ops-list-status">
          <span class="muted">${IC.activity} Estado</span>
          <select class="trip-status-select trip-status-select--${escapeAttr(statusSlug)}" data-action="trip-status" data-id="${escapeAttr(String(r.id || ""))}" data-current-status="${escapeAttr(String(r.status || ""))}" aria-label="${escapeAttr(`Cambiar estado del viaje ${String(r.trip?.tripNumber || r.requestNumber || "")}`.trim())}">
            ${transitions.map((s) => `<option value="${escapeAttr(s)}" ${r.status === s ? "selected" : ""}>${escapeHtml(tripStatusOptionLabel(s))}</option>`).join("")}
          </select>
        </label>`
        : tpStatusPill(r);
    const routeCell = `<span class="vehicle-fleet-list-sub">${escapeHtml(originCity)}</span> <span aria-hidden="true">→</span> <span class="vehicle-fleet-list-sub">${escapeHtml(destinationCity)}</span>`;
    const standbyLine =
      standby > 0 ? `<div class="muted vehicle-fleet-list-sub">${IC.clock || ""} Standby $${standby.toLocaleString("es-CO")}</div>` : "";
    const tripLine = `${String(r.trip?.tripNumber || "—")} · Sol. ${String(r.requestNumber || r.id || "—")}`;
    const fareCell =
      fare.tone === "warn"
        ? `<span class="muted">${escapeHtml(fare.text)}</span>`
        : `<span class="vehicle-fleet-list-doc">${escapeHtml(fare.text)}</span>`;
    return `<tr data-trip-id="${tripIdAttr}">
      <td data-label="Cliente / viaje"><strong class="vehicle-fleet-list-plate">${escapeHtml(clientName)}</strong><div class="muted vehicle-fleet-list-sub">${escapeHtml(tripLine)}</div></td>
      <td data-label="Ruta">${routeCell}</td>
      <td data-label="Estado">${statusSelectHtml}${tpLateChip(r)}</td>
      <td data-label="Recogida" class="rq-nowrap">${escapeHtml(tpShortDate(r.trip?.etaPickup || r.pickupAt || ""))}</td>
      <td data-label="Camión y conductor"><strong class="vehicle-fleet-list-plate">${escapeHtml(plate)}</strong><div class="muted vehicle-fleet-list-sub">${escapeHtml(driverName)}</div></td>
      <td data-label="Tarifa">${fareCell}${standbyLine}</td>
      <td data-label="Acciones" class="vehicle-fleet-list-actions"><div class="toolbar">
        <button type="button" class="btn btn-sm btn-outline" data-action="trip-detail" data-id="${tripIdAttr}" title="Ficha del viaje">${IC.truck} Viaje</button>
        <button type="button" class="btn btn-sm btn-action" data-action="detail" data-id="${tripIdAttr}" title="Detalle de la solicitud">${IC.eye} Solicitud</button>
        ${canAdminEditTrip(r) ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-trip" data-id="${tripIdAttr}" title="Editar asignación">${IC.edit} Editar</button>` : ""}
        ${canAdminEditTrip(r) ? `<button type="button" class="btn btn-sm btn-action" data-action="reassign-trip" data-id="${tripIdAttr}" title="Reasignar camión o conductor" aria-label="Reasignar camión o conductor del viaje ${escapeAttr(String(r.trip?.tripNumber || ""))}">${IC.repeat || IC.truck} Reasignar</button>` : ""}
        ${isClosed ? `<button type="button" class="btn btn-sm btn-approve" data-action="trip-invoice" data-id="${tripIdAttr}" title="Factura PDF">${IC.file} Factura</button>` : ""}
        ${isAdmin ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-trip" data-id="${tripIdAttr}" title="Eliminar viaje">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`;
  };

  /* ------------------------------------------------------------------
   * Bandeja + panel de detalle (misma lógica visual que Solicitudes).
   * Los botones del panel reutilizan los `data-action` existentes
   * (trip-detail / detail / edit-trip / trip-invoice / delete-trip /
   * trip-status), cableados tras cada render por `bindTransportTripsPortalControls`.
   * ------------------------------------------------------------------ */
  const TP_TABS = [
    { id: "general", label: "General" },
    { id: "route", label: "Ruta" },
    { id: "fleet", label: "Flota" },
    { id: "follow", label: "Seguimiento" }
  ];
  const tpTone = (status) => {
    if ([STATUS.COMPLETADA, STATUS.CERRADA].includes(status)) return "done";
    if ([STATUS.CANCELADA, STATUS.RECHAZADA].includes(status)) return "cancel";
    if ([STATUS.ESPERA_STANDBY, STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(status)) return "wait";
    return "live";
  };
  const tpStatusText = (r) =>
    String(typeof prettyStatus === "function" ? prettyStatus(r.status, "trip") : r.status || "—")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "—";
  const tpStatusPill = (r) =>
    `<span class="rq-status rq-status--${tpTone(r.status)}"><span class="rq-status__dot" aria-hidden="true"></span>${escapeHtml(tpStatusText(r))}</span>`;
  const tpShortDate = (raw) => {
    if (!raw) return "Sin fecha";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    const opts = { timeZone: "America/Bogota" };
    const day = d.toLocaleDateString("es-CO", { ...opts, day: "numeric", month: "short" }).replace(".", "");
    const time = d.toLocaleTimeString("es-CO", { ...opts, hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} · ${time}`;
  };
  /** Minutos que lleva vencida la entrega estimada de un viaje en curso (tolerancia de 15 min, igual que el Dashboard). */
  const tpLateMinutes = (r) => {
    if (![STATUS.VIAJE_ASIGNADO, STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY].includes(r.status)) return 0;
    const eta = Date.parse(r.trip?.etaDelivery || r.etaDelivery || "");
    if (!Number.isFinite(eta)) return 0;
    const over = Math.round((Date.now() - eta) / 60000);
    return over > 15 ? over : 0;
  };
  const tpLateChip = (r) => {
    const min = tpLateMinutes(r);
    if (!min) return "";
    const label = min >= 60 ? `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ""}`.trim() : `${min} min`;
    return `<span class="rq-late" role="status">Retraso ${escapeHtml(label)}</span>`;
  };
  /** Reasignaciones del viaje (la más reciente primero): qué cambió, cuándo, quién y por qué. */
  const tpReassignHistory = (r) => {
    const list = Array.isArray(r.trip?.reassignments) ? r.trip.reassignments.filter((x) => x && typeof x === "object") : [];
    if (!list.length) return "";
    const rows = list
      .slice()
      .reverse()
      .map((x) => {
        const changes = [];
        if (String(x.fromVehiclePlate || "") !== String(x.toVehiclePlate || "")) {
          changes.push(`Camión: <strong>${escapeHtml(String(x.fromVehiclePlate || "—"))}</strong> → <strong>${escapeHtml(String(x.toVehiclePlate || "—"))}</strong>`);
        }
        if (String(x.fromDriverName || "") !== String(x.toDriverName || "")) {
          changes.push(`Conductor: <strong>${escapeHtml(String(x.fromDriverName || "—"))}</strong> → <strong>${escapeHtml(String(x.toDriverName || "—"))}</strong>`);
        }
        const why = [String(x.reasonLabel || "").trim(), String(x.note || "").trim()].filter(Boolean).join(" — ");
        return `<li class="rq-reassign__item">
          <span class="rq-reassign__when">${escapeHtml(tpShortDate(x.at))} · ${escapeHtml(String(x.by || "—"))}</span>
          <span class="rq-reassign__what">${changes.join(" · ")}</span>
          ${why ? `<span class="rq-reassign__why">${escapeHtml(why)}</span>` : ""}
        </li>`;
      })
      .join("");
    return `<section class="rq-block rq-reassign"><h4 class="rq-block__title" aria-level="3">Reasignaciones</h4><ol class="rq-reassign__list">${rows}</ol></section>`;
  };
  const tpField = (label, valueHtml, opts = {}) => {
    const v = valueHtml == null || valueHtml === "" ? `<span class="rq-muted">—</span>` : valueHtml;
    return `<div class="rq-field${opts.wide ? " rq-field--wide" : ""}${opts.strong ? " rq-field--strong" : ""}"><dt>${escapeHtml(label)}</dt><dd>${v}</dd></div>`;
  };
  const tpSelectedId = (list) => {
    const sel = String(transportTripsUi.selectedId || "");
    if (sel && list.some((r) => String(r.id) === sel)) return sel;
    return list.length ? String(list[0].id) : "";
  };

  const buildTripInboxItem = (r, selected) => {
    const clientName = String(r.clientName || "Cliente").trim() || "Cliente";
    const origin = String(r.originCity || r.originDepartment || "Origen").trim();
    const dest = String(r.destinationCity || r.destinationDepartment || "Destino").trim();
    const fare = tripFarePresentation(r);
    const id = escapeAttr(String(r.id || ""));
    const plate = String(r.trip?.vehiclePlate || "—").trim() || "—";
    const driver = String(r.trip?.driverName || "Sin conductor").trim() || "Sin conductor";
    return `<li class="rq-list__li">
      <button type="button" class="rq-item rq-item--${tpTone(r.status)}${selected ? " is-selected" : ""}" data-action="trip-select" data-id="${id}" data-trip-id="${id}" aria-pressed="${selected ? "true" : "false"}">
        <span class="rq-item__top">
          <strong class="rq-item__client" title="${escapeAttr(clientName)}">${escapeHtml(clientName)}</strong>
          <span class="rq-item__no">${escapeHtml(String(r.trip?.tripNumber || "—"))}</span>
        </span>
        <span class="rq-item__route"><span>${escapeHtml(origin)}</span><span class="rq-item__arrow" aria-hidden="true">${IC.chevronRight}</span><span>${escapeHtml(dest)}</span></span>
        <span class="rq-item__fleet"><span class="rq-item__fleet-ico" aria-hidden="true">${IC.truck}</span><strong>${escapeHtml(plate)}</strong><span>${escapeHtml(driver)}</span></span>
        <span class="rq-item__meta">
          ${tpStatusPill(r)}${tpLateChip(r)}
          <span class="rq-item__when">${escapeHtml(tpShortDate(r.trip?.etaPickup || r.pickupAt))}</span>
          <span class="rq-item__fare${fare.tone === "warn" ? " is-pending" : ""}">${escapeHtml(fare.text)}</span>
        </span>
      </button>
    </li>`;
  };

  const tpTimeline = (r) => {
    const cancelled = [STATUS.CANCELADA, STATUS.RECHAZADA].includes(r.status);
    const closed = [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status);
    const moving = [STATUS.EN_TRANSITO, STATUS.ESPERA_STANDBY].includes(r.status) || closed;
    const steps = [
      { label: "Viaje asignado", detail: `${String(r.trip?.vehiclePlate || "").trim()} · ${String(r.trip?.driverName || "").trim()}`.replace(/^ · | · $/g, ""), done: true },
      { label: "En ruta", detail: moving ? `Recogida ${tpShortDate(r.trip?.etaPickup || r.pickupAt)}` : "", done: moving },
      { label: "Entregado", detail: closed && r.updatedAt ? fmtDate(r.updatedAt) : "", done: closed }
    ];
    if (parseNum(r.standbyChargeTotal) > 0) {
      steps.splice(2, 0, { label: "Espera en standby", detail: `Acumulado $${parseNum(r.standbyChargeTotal).toLocaleString("es-CO")}`, done: true, wait: true });
    }
    if (cancelled) {
      return [
        steps[0],
        { label: r.status === STATUS.RECHAZADA ? "Solicitud rechazada" : "Viaje cancelado", detail: r.updatedAt ? fmtDate(r.updatedAt) : "", done: true, cancel: true }
      ].map((s) => ({ ...s, state: s.cancel ? "cancel" : "done" }));
    }
    let currentSet = false;
    return steps.map((s) => {
      if (s.done) return { ...s, state: "done" };
      if (!currentSet) {
        currentSet = true;
        return { ...s, state: "current" };
      }
      return { ...s, state: "todo" };
    });
  };

  const buildTripDetailPane = (r) => {
    if (!r) {
      return `<aside class="rq-pane rq-pane--empty" aria-label="Detalle del viaje"><p class="rq-empty-pane">Seleccione un viaje para ver su detalle.</p></aside>`;
    }
    const tabIds = TP_TABS.map((t) => t.id);
    let activeTab = String(transportTripsUi.detailTab || "general");
    if (!tabIds.includes(activeTab)) activeTab = "general";
    const idAttr = escapeAttr(String(r.id || ""));
    const clientName = String(r.clientName || "Cliente").trim() || "Cliente";
    const originCity = String(r.originCity || r.originDepartment || "Origen").trim();
    const destCity = String(r.destinationCity || r.destinationDepartment || "Destino").trim();
    const distanceKm = parseNum(r.distanceKm || 0);
    const fare = tripFarePresentation(r);
    const standby = parseNum(r.standbyChargeTotal);
    const tripNo = String(r.trip?.tripNumber || "—");
    const reqNo = String(r.requestNumber || r.id || "—");
    const plate = String(r.trip?.vehiclePlate || "—").trim() || "—";
    const driver = String(r.trip?.driverName || "Sin conductor").trim() || "Sin conductor";
    const driverPhone = String(r.trip?.driverPhone || "").trim();
    const pickupRaw = r.trip?.etaPickup || r.pickupAt || "";
    const deliveryRaw = r.trip?.etaDelivery || r.etaDelivery || "";
    const truckReq = typeof requestTruckRequirementSummaryHtml === "function" ? requestTruckRequirementSummaryHtml(r) : "";
    const termoking = typeof requestRequiresTermoking === "function" ? requestRequiresTermoking(r) : r.refrigeracionTermoking === true;
    const isClosed = [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status);
    const transitions = [r.status, ...(STATUS_TRANSITIONS[r.status] || [])];
    const urgency =
      pickupRaw && [STATUS.VIAJE_ASIGNADO, STATUS.ESPERA_STANDBY].includes(r.status) && typeof portalOpsCardPickupUrgency === "function"
        ? portalOpsCardPickupUrgency(pickupRaw)
        : { label: "", tone: "" };
    const statusSlug = slugStatus(r.status);
    const statusControl =
      transitions.length > 1
        ? `<label class="rq-statusbox"><span class="rq-statusbox__label">Cambiar estado del viaje</span>
            <span class="rq-select"><select class="trip-status-select trip-status-select--${escapeAttr(statusSlug)}" data-action="trip-status" data-id="${idAttr}" data-current-status="${escapeAttr(String(r.status || ""))}" aria-label="Cambiar estado del viaje">
              ${transitions.map((s) => `<option value="${escapeAttr(s)}" ${r.status === s ? "selected" : ""}>${escapeHtml(tripStatusOptionLabel(s))}</option>`).join("")}
            </select><span class="rq-select__chev" aria-hidden="true">${IC.chevronDown}</span></span></label>`
        : "";
    const panels = {
      general: `${statusControl}
        <dl class="rq-fields">
          ${tpField("Cliente", escapeHtml(clientName), { wide: true })}
          ${tpField("Recogida", `${escapeHtml(tpShortDate(pickupRaw))}${urgency.label ? ` <span class="rq-chip rq-chip--${escapeAttr(urgency.tone || "ok")}">${escapeHtml(urgency.label)}</span>` : ""}`)}
          ${tpField("Entrega estimada", `${escapeHtml(deliveryRaw ? tpShortDate(deliveryRaw) : "")}${tpLateChip(r)}`)}
          ${tpField("Tarifa", fare.tone === "warn" ? `<span class="rq-muted">${escapeHtml(fare.text)}</span>` : escapeHtml(fare.text), { strong: fare.tone !== "warn" })}
          ${tpField("Solicitud", escapeHtml(reqNo))}
          ${tpField("Carga", escapeHtml(String(r.cargoDescription || "")))}
          ${tpField("Camión requerido", truckReq)}
          ${tpField("Termoking", termoking ? "Sí, con refrigeración" : "No, carga seca")}
          ${standby > 0 ? tpField("Standby acumulado", escapeHtml(`$${standby.toLocaleString("es-CO")}`)) : ""}
        </dl>`,
      route: `<ol class="rq-route">
          <li class="rq-route__stop rq-route__stop--origin"><span class="rq-route__dot" aria-hidden="true"></span>
            <div><span class="rq-route__kind">Recogida</span><strong>${escapeHtml(originCity)}</strong>
            <span class="rq-route__addr">${escapeHtml([r.originDepartment, r.originAddress].filter(Boolean).join(" · ") || "Sin dirección")}</span>
            <span class="rq-route__when">${escapeHtml(tpShortDate(pickupRaw))}</span></div></li>
          <li class="rq-route__stop rq-route__stop--dest"><span class="rq-route__dot" aria-hidden="true"></span>
            <div><span class="rq-route__kind">Entrega</span><strong>${escapeHtml(destCity)}</strong>
            <span class="rq-route__addr">${escapeHtml([r.destinationDepartment, r.destinationAddress].filter(Boolean).join(" · ") || "Sin dirección")}</span>
            <span class="rq-route__when">${escapeHtml(deliveryRaw ? tpShortDate(deliveryRaw) : "Sin fecha de entrega")}</span></div></li>
        </ol>
        ${distanceKm > 0 ? `<p class="rq-route__km">${escapeHtml(distanceKm.toLocaleString("es-CO"))} km estimados</p>` : ""}`,
      fleet: `<div class="rq-trip"><span class="rq-trip__ico" aria-hidden="true">${IC.truck}</span>
          <div class="rq-trip__body"><strong>${escapeHtml(plate)}</strong><span>Vehículo asignado</span></div></div>
        <dl class="rq-fields rq-fields--spaced">
          ${tpField("Conductor", escapeHtml(driver))}
          ${tpField("Teléfono", escapeHtml(driverPhone))}
          ${tpField("Salida programada", escapeHtml(tpShortDate(pickupRaw)))}
          ${tpField("Llegada estimada", escapeHtml(deliveryRaw ? tpShortDate(deliveryRaw) : ""))}
        </dl>`,
      follow: `<section class="rq-block"><h4 class="rq-block__title" aria-level="3">Seguimiento del viaje</h4>
        <ol class="rq-timeline">${tpTimeline(r)
          .map(
            (s) => `<li class="rq-timeline__step rq-timeline__step--${escapeAttr(s.state)}">
              <span class="rq-timeline__dot" aria-hidden="true"></span>
              <span class="rq-timeline__label">${escapeHtml(s.label)}</span>
              ${s.detail ? `<span class="rq-timeline__detail">${escapeHtml(s.detail)}</span>` : ""}
            </li>`
          )
          .join("")}</ol></section>
        ${tpReassignHistory(r)}
        <p class="rq-trace-foot">${r.updatedAt ? `Última actualización: ${escapeHtml(fmtDate(r.updatedAt))}` : ""}</p>`
    };
    const tabs = TP_TABS.map(
      (t) =>
        `<button type="button" role="tab" class="rq-tab${t.id === activeTab ? " is-active" : ""}" id="tp-tab-${t.id}" aria-controls="tp-panel-${t.id}" aria-selected="${t.id === activeTab ? "true" : "false"}" data-action="trip-detail-tab" data-tab="${t.id}">${escapeHtml(t.label)}</button>`
    ).join("");
    const panelsHtml = TP_TABS.map(
      (t) =>
        `<div class="rq-panel" role="tabpanel" id="tp-panel-${t.id}" aria-labelledby="tp-tab-${t.id}" data-panel="${t.id}"${t.id === activeTab ? "" : " hidden"}>${panels[t.id]}</div>`
    ).join("");
    const btn = (action, cls, icon, label, title) =>
      `<button type="button" class="rq-btn ${cls}" data-action="${action}" data-id="${idAttr}" title="${escapeAttr(title)}">${icon}<span>${label}</span></button>`;
    const main = [
      btn("trip-detail", "rq-btn--primary", IC.truck, "Ficha del viaje", "Abrir la ficha del viaje"),
      btn("detail", "rq-btn--ghost", IC.eye, "Ver solicitud", "Detalle de la solicitud"),
      canAdminEditTrip(r) ? btn("edit-trip", "rq-btn--ghost", IC.edit, "Editar", "Editar asignación") : "",
      canAdminEditTrip(r) ? btn("reassign-trip", "rq-btn--ghost", IC.repeat || IC.truck, "Reasignar", "Cambiar el camión o el conductor de este viaje") : "",
      isClosed ? btn("trip-invoice", "rq-btn--ghost", IC.file, "Factura", "Generar factura PDF") : ""
    ].filter(Boolean).join("");
    const danger = isAdmin ? btn("delete-trip", "rq-btn--danger", IC.trash, "Eliminar viaje", "Eliminar viaje") : "";
    return `<aside class="rq-pane rq-pane--${tpTone(r.status)}" aria-label="Detalle del viaje ${escapeAttr(tripNo)}" data-pane-trip-id="${idAttr}">
      <header class="rq-pane__head">
        <div class="rq-pane__id">
          <span class="rq-pane__avatar" aria-hidden="true">${escapeHtml(clientName.charAt(0).toUpperCase() || "V")}</span>
          <div class="rq-pane__title">
            <h4 aria-level="3">${escapeHtml(clientName)}</h4>
            <p>${escapeHtml(tripNo)} · Solicitud ${escapeHtml(reqNo)}</p>
            <div class="rq-pane__status">${tpStatusPill(r)}</div>
          </div>
        </div>
        <div class="rq-pane__route" aria-label="Ruta">
          <strong>${escapeHtml(originCity)}</strong><span class="rq-pane__route-arrow" aria-hidden="true">${IC.chevronRight}</span><strong>${escapeHtml(destCity)}</strong>
          ${distanceKm > 0 ? `<span class="rq-pane__route-km">${escapeHtml(distanceKm.toLocaleString("es-CO"))} km</span>` : ""}
        </div>
      </header>
      <div class="rq-tabs" role="tablist" aria-label="Secciones del viaje">${tabs}</div>
      <div class="rq-pane__body">${panelsHtml}</div>
      <footer class="rq-pane__actions"><div class="rq-pane__actions-main">${main}</div>${danger ? `<div class="rq-pane__actions-danger">${danger}</div>` : ""}</footer>
    </aside>`;
  };

  const filterPill = (key, label, count) =>
    `<button type="button" class="ops-filter-pill${filter === key ? " is-active" : ""}" data-action="trips-filter" data-filter="${escapeAttr(key)}"><span>${escapeHtml(label)}</span><strong>${count}</strong></button>`;
  const opsFiltersBar = `<div class="transport-data-filters ops-filters-bar" role="group" aria-label="Filtrar viajes">
    ${filterPill("active", "Activos", activeOps)}
    ${filterPill("today", "Hoy", todaysTrips)}
    ${filterPill("standby", "Standby", standbyTrips)}
    ${filterPill("closed", "Cerrados", completedTrips)}
    ${filterPill("all", "Todos", trips.length)}
  </div>`;
  const tripsActiveFieldCount = Object.values(tripsFieldFilters).filter(Boolean).length;
  const tripsFiltersOpenPref = transportTripsUi.filtersOpen;
  const tripsShowFilters = tripsFiltersOpenPref === true || (tripsFiltersOpenPref === undefined && tripsActiveFieldCount > 0);
  const tripsSeg = (layout, label) =>
    `<button type="button" class="rq-seg__btn${tripsLayout === layout ? " is-active" : ""}" data-action="transport-trips-layout" data-layout="${layout}" aria-pressed="${tripsLayout === layout ? "true" : "false"}">${label}</button>`;
  const opsToolbar = `<div class="rq-tools transport-ops-toolbar">
    <label class="rq-search transport-ops-search transport-data-search">
      <span class="rq-search__icon" aria-hidden="true">${IC.search || ""}</span>
      <input type="search" data-action="transport-trips-search" value="${escapeAttr(String(transportTripsUi.search || ""))}" placeholder="Buscar cliente, ruta, placa, conductor…" autocomplete="off" />
    </label>
    <label class="rq-sortbox">
      <span class="rq-sortbox__label">Ordenar</span>
      <select data-action="transport-trips-sort" aria-label="Ordenar viajes">
        <option value="pickup_asc" ${tripsSort === "pickup_asc" ? "selected" : ""}>Recogida: próxima primero</option>
        <option value="pickup_desc" ${tripsSort === "pickup_desc" ? "selected" : ""}>Recogida: más reciente primero</option>
        <option value="value_desc" ${tripsSort === "value_desc" ? "selected" : ""}>Tarifa: mayor a menor</option>
        <option value="value_asc" ${tripsSort === "value_asc" ? "selected" : ""}>Tarifa: menor a mayor</option>
        <option value="status" ${tripsSort === "status" ? "selected" : ""}>Estado (A-Z)</option>
      </select>
    </label>
    <button type="button" class="rq-filter-btn${tripsShowFilters ? " is-open" : ""}" data-action="trips-filters-toggle" aria-expanded="${tripsShowFilters ? "true" : "false"}" aria-controls="rq-filters-panel">${IC.filter || ""}<span>Filtros</span>${tripsActiveFieldCount ? `<span class="rq-filter-btn__count">${tripsActiveFieldCount}</span>` : ""}</button>
    <div class="rq-seg" role="group" aria-label="Forma de ver los viajes">${tripsSeg("cards", "Bandeja")}${tripsSeg("list", "Tabla")}</div>
  </div>`;
  const tripStatusLabel = (status) => {
    /* prettyStatus devuelve un chip HTML con icono: en un <option> solo sirve el texto. */
    const plain =
      typeof prettyStatus === "function"
        ? String(prettyStatus(status, "trip") || "").replace(/<[^>]*>/g, "").trim()
        : "";
    return plain || String(status || "—");
  };
  const tripsFieldFiltersBar = renderModuleFieldFilters({
    ariaLabel: "Filtros de viajes",
    action: "transport-trips-field",
    clearAction: "transport-trips-fields-clear",
    extraClass: "transport-trips-field-filters",
    fields: [
      { key: "client", label: "Cliente", value: tripsFieldFilters.client, allLabel: "Todos los clientes", options: uniqueSortedFilterValues(trips.map((r) => r.clientName)).map((v) => [v, v]) },
      { key: "status", label: "Estado", value: tripsFieldFilters.status, allLabel: "Todos los estados", options: uniqueSortedFilterValues(trips.map((r) => r.status)).map((v) => [v, tripStatusLabel(v)]) },
      { key: "driver", label: "Conductor", value: tripsFieldFilters.driver, allLabel: "Todos los conductores", options: uniqueSortedFilterValues(trips.map((r) => r.trip?.driverName)).map((v) => [v, v]) },
      { key: "plate", label: "Placa", value: tripsFieldFilters.plate, allLabel: "Todas las placas", options: uniqueSortedFilterValues(trips.map((r) => r.trip?.vehiclePlate)).map((v) => [v, v]) },
      { key: "service", label: "Tipo de servicio", value: tripsFieldFilters.service, allLabel: "Todos los servicios", options: uniqueSortedFilterValues(trips.map((r) => r.serviceType)).map((v) => [v, v]) },
      { key: "from", label: "Recogida desde", type: "date", value: tripsFieldFilters.from },
      { key: "to", label: "Recogida hasta", type: "date", value: tripsFieldFilters.to }
    ]
  });
  const opsToolbarBlock = `<div class="rq-toolbar transport-data-toolbar">${opsFiltersBar}${opsToolbar}<div class="rq-filters-panel" id="rq-filters-panel"${tripsShowFilters ? "" : " hidden"}>${tripsFieldFiltersBar}</div></div>`;

  const tripsRenderLimit = Number(state.tripsRenderLimit) || RENDER_WINDOW_SIZE;
  const tripsToRender = renderWindowSlice(sortedFilteredTrips, tripsRenderLimit);
  const tripsMoreBar = renderWindowMoreBar(sortedFilteredTrips.length, tripsToRender.length, "trips-render-more");
  const tripsListTable =
    tripsLayout === "list" && sortedFilteredTrips.length
      ? `<div class="table-wrap vehicle-fleet-list-wrap"><table class="vehicle-fleet-table trip-ops-fleet-table">
    <thead><tr>
      <th>Cliente / viaje</th><th>Ruta</th><th>Estado</th><th>Recogida</th><th>Camión y conductor</th><th>Tarifa</th><th>Acciones</th>
    </tr></thead>
    <tbody>${tripsToRender.map((r) => safeBuild(buildTripOpsListRow, r)).join("")}</tbody>
  </table></div>`
      : "";
  const tripsCardsGrid =
    tripsLayout === "cards" && sortedFilteredTrips.length
      ? (() => {
          const selId = tpSelectedId(tripsToRender);
          const selTrip = tripsToRender.find((r) => String(r.id) === selId) || null;
          return `<div class="rq-inbox rq-inbox--trips">
            <div class="rq-inbox__list"><ol class="rq-list" aria-label="Viajes">${tripsToRender.map((r) => safeBuild(buildTripInboxItem, r, String(r.id) === selId)).join("")}</ol>${tripsMoreBar}</div>
            ${safeBuild(buildTripDetailPane, selTrip) || `<aside class="rq-pane rq-pane--empty" aria-label="Detalle del viaje"><p class="rq-empty-pane">No se pudo mostrar el detalle de este viaje.</p></aside>`}
          </div>`;
        })()
      : "";
  const tripsEmptyCopy = tripsFieldFiltersActive
    ? "Ningún viaje coincide con los filtros aplicados. Use «Limpiar filtros» para ver todos."
    : tripsSearch
    ? "Ningún viaje coincide con la búsqueda. Pruebe con el cliente, la placa, la ciudad o el número."
    : filter !== "all"
      ? "No hay viajes en este filtro. Cambie el filtro o vea todos."
      : "Aún no hay viajes asignados. Cree el primero en Registrar.";
  const opsCards = sortedFilteredTrips.length
    ? `${opsToolbarBlock}${tripsLayout === "list" ? tripsListTable + tripsMoreBar : tripsCardsGrid}`
    : `${opsToolbarBlock}${emptyState(tripsEmptyCopy)}`;

  const RATE_LOWER_WORDS = new Set(["de", "del", "la", "las", "los", "y", "e"]);
  const formatRatePlaceLabel = (part) => {
    const s = String(part || "").trim();
    if (!s) return "—";
    return s
      .split(/\s+/)
      .filter(Boolean)
      .map((w, i) => {
        const lower = w.toLowerCase();
        if (lower === "d.c." || lower === "dc") return "D.C.";
        if (i > 0 && RATE_LOWER_WORDS.has(lower)) return lower;
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ");
  };
  /** Llave de almacenamiento «dpto|ciudad->dpto|ciudad@@alcance» → origen y destino legibles. */
  const parseRateRoute = (storageKey) => {
    const sepIdx = String(storageKey).lastIndexOf(TRIP_RATE_SCOPE_SEP);
    const routeOnly = sepIdx === -1 ? String(storageKey) : String(storageKey).slice(0, sepIdx);
    const [orig, dest] = String(routeOnly).split("->");
    const [od, oc] = String(orig || "").split("|");
    const [dd, dc] = String(dest || "").split("|");
    return {
      originCity: formatRatePlaceLabel(oc),
      originDept: formatRatePlaceLabel(od),
      destCity: formatRatePlaceLabel(dc),
      destDept: formatRatePlaceLabel(dd)
    };
  };
  const rateCompanyName = (id) => String(getCompanyById(id)?.name || id);
  const rateDateLabel = (value) =>
    (typeof fmtDateOr === "function" ? fmtDateOr(value, "—") : fmtDate(value) || "—") || "—";
  const rateScopeOf = (entry) => (Array.isArray(entry.companyIds) && entry.companyIds.length ? "company" : "general");
  const rateScope = ["general", "company"].includes(transportTripsUi.rateScope) ? transportTripsUi.rateScope : "all";
  const rateSearch = foldTransportSearchText(String(transportTripsUi.rateSearch || "").trim());
  const rateCounts = {
    all: rateEntries.length,
    general: rateEntries.filter((e) => rateScopeOf(e) === "general").length,
    company: rateEntries.filter((e) => rateScopeOf(e) === "company").length
  };
  const visibleRates = rateEntries.filter((entry) => {
    if (rateScope !== "all" && rateScopeOf(entry) !== rateScope) return false;
    if (!rateSearch) return true;
    const p = parseRateRoute(entry.storageKey);
    const hay = foldTransportSearchText(
      [p.originCity, p.originDept, p.destCity, p.destDept, ...(entry.companyIds || []).map(rateCompanyName)].join(" ")
    );
    return hay.includes(rateSearch);
  });
  const rateRowHtml = (entry) => {
    const { storageKey, value: val, companyIds } = entry;
    const safeKey = encodeURIComponent(storageKey);
    const p = parseRateRoute(storageKey);
    const deptLine = p.originDept === p.destDept ? p.originDept : `${p.originDept} → ${p.destDept}`;
    const ids = Array.isArray(companyIds) ? companyIds : [];
    const names = ids.map(rateCompanyName);
    const scopeBadge = ids.length
      ? '<span class="route-rate-scope-badge route-rate-scope-badge--specific" title="Solo aplica a las empresas indicadas">Por empresa</span>'
      : '<span class="route-rate-scope-badge route-rate-scope-badge--all" title="Tarifa estándar: aplica a todos los clientes">General</span>';
    const clientsCell = ids.length
      ? `<div class="route-rate-client-chips">${names
          .slice(0, 2)
          .map((n) => `<span class="route-rate-client-chip">${escapeHtml(n)}</span>`)
          .join("")}${
          names.length > 2
            ? `<span class="route-rate-client-chip route-rate-client-chip--more" title="${escapeAttr(names.slice(2).join(", "))}">+${names.length - 2}</span>`
            : ""
        }</div>`
      : '<span class="route-rate-clients-all">Todos los clientes</span>';
    const updated = rateDateLabel(entry.updatedAt || entry.createdAt);
    const created = rateDateLabel(entry.createdAt);
    const routeName = `${p.originCity} a ${p.destCity}`;
    const actions = isAdmin
      ? `<div class="toolbar route-rate-actions"><button type="button" class="btn btn-sm btn-action" data-action="edit-route-rate" data-rate-key="${safeKey}" title="Editar el valor o el alcance de esta tarifa" aria-label="${escapeAttr(`Editar la tarifa ${routeName}`)}">${IC.edit} Editar</button><button type="button" class="btn btn-sm btn-reject" data-action="delete-route-rate" data-rate-key="${safeKey}" title="Quitar esta tarifa del catálogo" aria-label="${escapeAttr(`Quitar la tarifa ${routeName}`)}">${IC.trash} Quitar</button></div>`
      : '<span class="muted">—</span>';
    return `<tr>
      <td data-label="Trayecto"><div class="route-rate-route"><strong class="route-rate-route__cities">${escapeHtml(p.originCity)}<span class="route-rate-route__arrow" aria-hidden="true">→</span>${escapeHtml(p.destCity)}</strong><span class="route-rate-route__depts">${escapeHtml(deptLine)}</span></div></td>
      <td data-label="Alcance">${scopeBadge}</td>
      <td data-label="Clientes">${clientsCell}</td>
      <td data-label="Tarifa" class="route-rate-col-money"><span class="route-rate-value">$${parseNum(val).toLocaleString("es-CO")}</span><span class="route-rate-value-unit">por viaje</span></td>
      <td data-label="Actualizada"><span class="route-rate-when">${escapeHtml(updated)}</span>${created !== "—" && created !== updated ? `<span class="route-rate-when route-rate-when--sub">Creada ${escapeHtml(created)}</span>` : ""}</td>
      <td data-label="Acciones" class="route-rate-col-actions">${actions}</td>
    </tr>`;
  };
  const rateScopePill = (key, label) =>
    `<button type="button" class="ops-filter-pill${rateScope === key ? " is-active" : ""}" data-action="rates-scope" data-scope="${key}" aria-pressed="${rateScope === key ? "true" : "false"}"><span>${label}</span><strong>${rateCounts[key]}</strong></button>`;
  const ratesToolbar = `<div class="route-rates-toolbar">
      <label class="rq-search route-rates-search">
        <span class="rq-search__icon" aria-hidden="true">${IC.search || ""}</span>
        <input type="search" data-action="transport-rates-search" value="${escapeAttr(String(transportTripsUi.rateSearch || ""))}" placeholder="Buscar origen, destino o cliente…" autocomplete="off" aria-label="Buscar trayecto" />
      </label>
      <div class="transport-data-filters ops-filters-bar" role="group" aria-label="Filtrar por alcance">${rateScopePill("all", "Todas")}${rateScopePill("general", "General")}${rateScopePill("company", "Por empresa")}</div>
      ${isAdmin ? `<button type="button" class="btn btn-primary route-rates-new" data-action="transport-focus-create-route">${IC.plus} Nuevo trayecto</button>` : ""}
    </div>`;
  const ratesTable = rateEntries.length
    ? `${ratesToolbar}${
        visibleRates.length
          ? `<div class="table-wrap route-rates-table-wrap">
        <table class="route-rates-table">
          <caption class="visually-hidden">Trayectos y tarifas pactadas</caption>
          <thead>
            <tr>
              <th scope="col">Trayecto</th>
              <th scope="col">Alcance</th>
              <th scope="col">Clientes</th>
              <th scope="col" class="route-rate-col-money">Tarifa</th>
              <th scope="col">Actualizada</th>
              <th scope="col"><span class="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>${visibleRates.map(rateRowHtml).join("")}</tbody>
        </table>
      </div>`
          : emptyState("Ningún trayecto coincide con la búsqueda o el filtro.")
      }<p class="route-rates-legend muted">Estas tarifas se sugieren al asignar un viaje en la misma ruta. «General» aplica a cualquier cliente; «Por empresa», solo a los clientes indicados.</p>`
    : `<div class="transport-empty-cta">${emptyState("Aún no hay tarifas por trayecto. Cree la primera para que el sistema sugiera el precio al asignar un viaje en esa ruta.")}${
        isAdmin
          ? `<button type="button" class="btn btn-primary" data-action="transport-focus-create-route">${IC.plus} Configurar trayecto y tarifa</button>`
          : ""
      }</div>`;

  const routeRateForm = `<form id="form-route-rate" class="p-form p-form-colored hr-form-flow transport-trip-create-form transport-route-form transport-route-form--revamp" autocomplete="off">
    <input type="hidden" name="editingRateKey" id="route-rate-editing-key" value="" />
    <div class="transport-form transport-form--single" data-transport-form="route-rate" aria-label="Configurar trayecto y tarifa">
      <header class="transport-wizard__head">
        <div class="transport-wizard__head-copy">
          <span class="transport-wizard__eyebrow">Catálogo de transporte</span>
          <h3 aria-level="2" class="transport-wizard__title">Trayecto y tarifa</h3>
          <p class="transport-wizard__desc">Defina origen, destino, valor pactado y alcance por cliente para autocompletar precios al asignar viajes.</p>
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
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Departamento de origen", { required: true })}<select name="originDepartment" id="route-rate-origin-dept" required><option value="">Seleccione…</option>${departmentsOpts}</select></label>
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Ciudad de origen", { required: true })}<select name="originCity" id="route-rate-origin-city" required><option value="">Elija departamento…</option></select></label>
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
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Departamento de destino", { required: true })}<select name="destinationDepartment" id="route-rate-dest-dept" required><option value="">Seleccione…</option>${departmentsOpts}</select></label>
                <label class="route-rate-field">${fieldLabel(IC.mapPin, "Ciudad de destino", { required: true })}<select name="destinationCity" id="route-rate-dest-city" required><option value="">Elija departamento…</option></select></label>
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
          `<button class="btn btn-primary" id="route-rate-submit-btn" type="submit" disabled aria-disabled="true">${IC.plus} Guardar tarifa de trayecto</button>`,
          { hideToggle: true }
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
  const tripRequestPickerGroup = (label, list) =>
    list.length
      ? `<div class="trip-request-picker__group"><p class="trip-request-picker__group-label">${escapeHtml(label)}<span class="trip-request-picker__group-count">${list.length}</span></p><div class="trip-request-picker__group-cards">${list.map((r) => buildTripRequestPickerCardHtml(r)).join("")}</div></div>`
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
  const createTripForm = `<form id="form-create-trip" class="p-form p-form-colored hr-form-flow antares-create-form transport-assign-form transport-trip-create-form assign-trip-form assign-trip-form--revamp create-trip-form-v2" autocomplete="off">
    <div class="transport-form transport-form--single create-trip-form-v2__shell" data-transport-form="trip-assign" aria-label="Asignar viaje">
      <header class="transport-wizard__head create-trip-form-v2__head">
        <div class="transport-wizard__head-copy">
          <span class="transport-wizard__eyebrow">Operación de transporte</span>
          <h3 aria-level="2" class="transport-wizard__title">Asignar viaje</h3>
          <p class="transport-wizard__desc">Seleccione la solicitud, asigne vehículo y conductor, y confirme la tarifa pactada para crear el viaje.</p>
        </div>
      </header>
      <div class="create-trip-form-v2__progress">
        <div class="create-trip-form-v2__progress-track">
          <div class="create-trip-form-v2__progress-fill" data-create-trip-progress style="width:0%"></div>
        </div>
        <ol class="create-trip-form-v2__milestones">
          <li class="create-trip-form-v2__milestone is-active" data-create-trip-milestone="request"><button type="button" class="create-trip-form-v2__milestone-btn" data-action="transport-trip-form-step" data-step="request"><span class="create-trip-form-v2__milestone-num">1</span><span class="create-trip-form-v2__milestone-copy"><strong>Solicitud</strong><small>Elija la ruta</small></span></button></li>
          <li class="create-trip-form-v2__milestone" data-create-trip-milestone="fleet"><button type="button" class="create-trip-form-v2__milestone-btn" data-action="transport-trip-form-step" data-step="fleet"><span class="create-trip-form-v2__milestone-num">2</span><span class="create-trip-form-v2__milestone-copy"><strong>Flota</strong><small>Vehículo y conductor</small></span></button></li>
          <li class="create-trip-form-v2__milestone" data-create-trip-milestone="rate"><button type="button" class="create-trip-form-v2__milestone-btn" data-action="transport-trip-form-step" data-step="rate"><span class="create-trip-form-v2__milestone-num">3</span><span class="create-trip-form-v2__milestone-copy"><strong>Tarifa</strong><small>Valor pactado</small></span></button></li>
        </ol>
      </div>
      <div class="transport-form__body antares-create-form__sections create-trip-form-v2__body">
        <section class="assign-trip-block transport-trip-create-form__request create-trip-form-v2__request" data-create-trip-step="request" aria-labelledby="create-trip-step-request">
          <div class="assign-trip-block-head">
            <h4 class="assign-trip-block-title" id="create-trip-step-request" aria-level="3">${IC.inbox} Elija la solicitud</h4>
          </div>
          <p class="muted form-section-hint create-trip-form-v2__hint">Busque y seleccione una solicitud aprobada o pendiente de asignación.</p>
          <div class="assign-trip-block-body create-trip-form-v2__request-grid">
            <div class="create-trip-form-v2__picker">${tripRequestPickerBody}</div>
            <div class="create-trip-form-v2__preview-wrap" aria-hidden="true">
              <p class="create-trip-form-v2__preview-label">Resumen de solicitud</p>
              <aside id="trip-request-preview" class="assign-trip-preview create-trip-summary-panel create-trip-form-v2__preview" aria-live="polite">
                ${createTripEmptyHint("inbox", "Seleccione una solicitud", "Al elegir una tarjeta verá el resumen de ruta, cliente y recogida.")}
              </aside>
            </div>
          </div>
        </section>
        <div class="create-trip-form-v2__assign-row is-locked">
          <section class="assign-trip-block transport-trip-create-form__resources create-trip-form-v2__resources" data-create-trip-step="fleet" aria-labelledby="create-trip-step-fleet">
            <div class="assign-trip-block-head">
              <h4 class="assign-trip-block-title" id="create-trip-step-fleet" aria-level="3">${IC.truck} Vehículo y conductor</h4>
              <span class="create-trip-lock-note">Se habilita al elegir la solicitud</span>
              <div class="create-trip-flag-legend assign-trip-flags create-trip-form-v2__flags" role="list" aria-label="Banderas en listas">
                <span class="create-trip-flag create-trip-flag--busy" role="listitem"><span class="create-trip-flag-dot"></span>Ocupado</span>
                <span class="create-trip-flag create-trip-flag--offline" role="listitem"><span class="create-trip-flag-dot"></span>No disponible</span>
                <span class="create-trip-flag create-trip-flag--expired" role="listitem"><span class="create-trip-flag-dot"></span>Doc. vencida</span>
              </div>
            </div>
            <div class="assign-trip-block-body">
              <div id="create-trip-fleet-stats" class="create-trip-fleet-stats assign-trip-fleet-stats create-trip-form-v2__fleet-stats" aria-live="polite"></div>
              <div class="assign-trip-fleet-grid create-trip-fleet-grid create-trip-form-v2__fleet-grid">
                <label class="assign-trip-resource create-trip-fleet-field">${fieldLabel(IC.truck, "Vehículo", { required: true })}
                  <select name="vehicleId" id="create-trip-vehicle-select" class="create-trip-resource-select searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Placa, tipo o capacidad…" disabled><option value="">Elija solicitud primero</option></select>
                </label>
                <label class="assign-trip-resource create-trip-fleet-field">${fieldLabel(IC.user, "Conductor", { required: true })}
                  <select name="driverId" id="create-trip-driver-select" class="create-trip-resource-select searchable-select-native" data-searchable-select="1" data-searchable-placeholder="Nombre, documento o teléfono…" disabled><option value="">Elija solicitud primero</option></select>
                </label>
              </div>
            </div>
          </section>
          <section class="assign-trip-block transport-trip-create-form__pricing create-trip-form-v2__pricing" data-create-trip-step="rate" aria-labelledby="create-trip-step-rate">
            <div class="assign-trip-block-head">
              <h4 class="assign-trip-block-title" id="create-trip-step-rate" aria-level="3">${IC.dollar} Tarifa del viaje</h4>
              <span class="create-trip-lock-note">Se habilita al elegir la solicitud</span>
            </div>
            <p class="muted form-section-hint create-trip-form-v2__hint">Confirme el valor pactado en COP. Se sugerirá automáticamente si existe tarifa de catálogo.</p>
            <div id="create-trip-rate-fields" class="assign-trip-rate create-trip-rate-surface create-trip-form-v2__rate-surface">
              ${createTripEmptyHint("dollar", "Tarifa pendiente", "Complete los pasos anteriores para habilitar el precio.")}
            </div>
          </section>
        </div>
      </div>
      <div class="transport-form__footer create-trip-form-v2__footer">
        <ul class="create-trip-readiness create-trip-readiness--bar transport-readiness create-trip-form-v2__readiness" data-create-trip-readiness aria-label="Requisitos para asignar"></ul>
        ${renderManagedCreateFormActions(
          "create-trip",
          `<button class="btn btn-primary create-trip-submit-btn create-trip-form-v2__submit" type="submit" disabled aria-disabled="true">${IC.check} Crear viaje</button>`,
          { hideToggle: true, cancelLabel: "Limpiar formulario" }
        )}
      </div>
    </div>
  </form>`;

  const pendingAssignAlert = "";
  const tripCreatedNotice = state.tripCreatedNotice && typeof state.tripCreatedNotice === "object" ? state.tripCreatedNotice : null;
  const tripCreatedNoticeHtml = tripCreatedNotice
    ? `<div class="create-trip-done" role="status">
        <span class="create-trip-done__ico" aria-hidden="true">${IC.check}</span>
        <div class="create-trip-done__copy">
          <strong>Viaje creado</strong>
          <span>${escapeHtml(String(tripCreatedNotice.summary || ""))}</span>
        </div>
        <div class="create-trip-done__actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="transport-created-view">Ver en Consultar</button>
          <button type="button" class="btn btn-sm btn-ghost" data-action="transport-created-dismiss" aria-label="Cerrar aviso">${IC.x || "×"}</button>
        </div>
      </div>`
    : "";
  const transportModuleHead = moduleFleetHeroStrip([
    { label: "Viajes", value: trips.length },
    { label: "Activos", value: activeOps },
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
  const transportOperateNav = renderTransportOperateSectionNav(transportTripsSection);
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
  const tripsCreateCard = createHrActionCard(
    "create-trip",
    "truck",
    "Asignar viaje",
    `${pendingForTrip.length} disponible${pendingForTrip.length === 1 ? "" : "s"}`,
    `${tripCreatedNoticeHtml}${createTripForm}`,
    "Abrir formulario",
    { createPanels: transportTripsCreateUi, alwaysOpen: true }
  );
  const routesCreateCard = createHrActionCard(
    "create-route-rate",
    "mapPin",
    "Configurar trayecto y tarifa",
    `${rateEntries.length} catalogada${rateEntries.length === 1 ? "" : "s"}`,
    routeRateForm,
    "Abrir formulario",
    { createPanels: transportTripsCreateUi, alwaysOpen: true }
  );
  const tripsOperatePane = `<div class="auth-tab-panel${transportTripsSection === "trips" ? "" : " hidden"}" data-transport-trips-operate-pane="trips">${tripsCreateCard}</div>`;
  const routesOperatePane = `<div class="auth-tab-panel${transportTripsSection === "routes" ? "" : " hidden"}" data-transport-trips-operate-pane="routes">${routesCreateCard}</div>`;
  const transportRailCollapsed = isOperateRailCollapsed("transport");
  const transportOperatePanel = `<div class="hr-workspace-panel transport-workspace-panel${transportTripsWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-transport-trips-panel="operate">
      ${pendingAssignAlert}
      <section class="transport-operate transport-operate-panel${transportRailCollapsed ? " is-rail-collapsed" : ""}">
        <aside class="transport-operate__rail" aria-label="Flujos de registro">
          <div class="transport-operate__rail-head">
            <p class="transport-operate__rail-label">Tipo de trámite</p>
            <button type="button" class="transport-operate__rail-toggle" data-action="transport-operate-rail-toggle" aria-expanded="${transportRailCollapsed ? "false" : "true"}" title="${transportRailCollapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite"}">
              <span class="transport-operate__rail-toggle-ico" aria-hidden="true">${IC.chevronLeft}</span>
            </button>
          </div>
          ${transportOperateNav}
        </aside>
        <div class="transport-operate__main auth-tab-panels">${tripsOperatePane}${routesOperatePane}</div>
      </section>
    </div>`;
  const tripsDataPane = `<div class="transport-data-pane transport-data-pane--trips${transportTripsSection === "trips" ? "" : " hidden"}" data-transport-trips-data-pane="trips">
      <header class="transport-data-pane__head">
        <div class="transport-data-pane__head-copy">
          <h3 aria-level="2" class="transport-data-pane__title">Operación de viajes</h3>
          <p class="transport-data-pane__lead muted">${sortedFilteredTrips.length} viaje${sortedFilteredTrips.length === 1 ? "" : "s"} con los filtros actuales</p>
        </div>
      </header>
      <div class="transport-data-pane__body">${opsCards}</div>
    </div>`;
  const routesDataPane = `<div class="transport-data-pane transport-data-pane--routes${transportTripsSection === "routes" ? "" : " hidden"}" data-transport-trips-data-pane="routes">
      <header class="transport-data-pane__head">
        <div class="transport-data-pane__head-copy">
          <h3 aria-level="2" class="transport-data-pane__title">Trayectos y tarifas</h3>
          <p class="transport-data-pane__lead muted">Catálogo de rutas usado para autocompletar precios al asignar viajes.</p>
        </div>
      </header>
      <div class="transport-data-pane__body transport-data-pane__body--routes">${ratesTable}</div>
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

  let transportTripsSearchTimer = 0;

  function clearTransportTripsSearchTimer() {
    window.clearTimeout(transportTripsSearchTimer);
    transportTripsSearchTimer = 0;
  }

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
        if (
          switchHrWorkspacePanels({
            root: nodes.viewRoot,
            moduleId: "transport-trips",
            workspace: ws,
            panelAttr: "data-transport-trips-panel"
          })
        ) {
          return;
        }
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-operate-rail-toggle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.closest(".transport-operate");
        if (!panel) return;
        const collapsed = panel.classList.toggle("is-rail-collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.setAttribute("title", collapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite");
        setOperateRailCollapsed("transport", collapsed);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-focus-create-trip']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          workspace: "operate",
          section: "trips"
        };
        state.createPanels = buildTransportTripsCreatePanelsState("trips", state.createPanels || {}, { expandActive: true });
        persistHrWorkspace("transport-trips", "operate");
        switchHrWorkspacePanels({
          root: nodes.viewRoot,
          moduleId: "transport-trips",
          workspace: "operate",
          panelAttr: "data-transport-trips-panel"
        });
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "transport-trips-section",
          activeValue: "trips",
          panelAttrs: ["data-transport-trips-operate-pane", "data-transport-trips-data-pane"],
          tabActiveClass: "is-active"
        });
        syncTransportTripsCreatePanelsInDom(nodes.viewRoot, "create-trip");
        requestAnimationFrame(() => scrollToCreatePanelForm("create-trip"));
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-created-dismiss']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tripCreatedNotice = null;
        btn.closest(".create-trip-done")?.remove();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-created-view']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tripCreatedNotice = null;
        state.transportTripsUi = { ...(state.transportTripsUi || {}), workspace: "data", section: "trips" };
        persistHrWorkspace("transport-trips", "data");
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-focus-create-route']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          workspace: "operate",
          section: "routes"
        };
        state.createPanels = buildTransportTripsCreatePanelsState("routes", state.createPanels || {}, { expandActive: true });
        persistHrWorkspace("transport-trips", "operate");
        switchHrWorkspacePanels({
          root: nodes.viewRoot,
          moduleId: "transport-trips",
          workspace: "operate",
          panelAttr: "data-transport-trips-panel"
        });
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "transport-trips-section",
          activeValue: "routes",
          panelAttrs: ["data-transport-trips-operate-pane", "data-transport-trips-data-pane"],
          tabActiveClass: "is-active"
        });
        syncTransportTripsCreatePanelsInDom(nodes.viewRoot, "create-route-rate");
        requestAnimationFrame(() => scrollToCreatePanelForm("create-route-rate"));
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-section']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = normalizeTransportTripsSection(btn.dataset.section);
        const inOperate = Boolean(btn.closest("[data-transport-trips-panel='operate']"));
        state.transportTripsUi = { ...(state.transportTripsUi || {}), section };
        const panelId = inOperate ? transportTripsCreatePanelForSection(section) : "";
        if (inOperate) {
          state.transportTripsUi.workspace = "operate";
          state.createPanels = buildTransportTripsCreatePanelsState(section, state.createPanels || {}, { expandActive: true });
        }
        persistHrWorkspace("transport-trips", state.transportTripsUi.workspace || "operate");
        if (
          switchModuleTabPanels({
            root: nodes.viewRoot,
            action: "transport-trips-section",
            activeValue: section,
            panelAttrs: ["data-transport-trips-operate-pane", "data-transport-trips-data-pane"],
            tabActiveClass: "is-active"
          })
        ) {
          if (inOperate && panelId) {
            syncTransportTripsCreatePanelsInDom(nodes.viewRoot, panelId);
            requestAnimationFrame(() => scrollToCreatePanelForm(panelId));
          }
          return;
        }
        renderPortalView();
        if (inOperate && panelId) {
          requestAnimationFrame(() => scrollToCreatePanelForm(panelId));
        }
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='trips-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearTransportTripsSearchTimer();
        state.tripsRenderLimit = (Number(state.tripsRenderLimit) || RENDER_WINDOW_SIZE) + RENDER_WINDOW_SIZE;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='trips-filter']").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearTransportTripsSearchTimer();
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
        clearTransportTripsSearchTimer();
        transportTripsSearchTimer = window.setTimeout(() => {
          transportTripsSearchTimer = 0;
          if (String(state.currentView || "") !== "transport-trips") return;
          renderPortalView();
        }, 180);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='rates-scope']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const scope = ["general", "company"].includes(btn.dataset.scope) ? btn.dataset.scope : "all";
        state.transportTripsUi = { ...(state.transportTripsUi || {}), rateScope: scope };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-rates-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.transportTripsUi = { ...(state.transportTripsUi || {}), rateSearch: String(el.value || "") };
        state.__transportRatesSearchRestore = { start, end };
        clearTransportTripsSearchTimer();
        transportTripsSearchTimer = window.setTimeout(() => {
          transportTripsSearchTimer = 0;
          if (String(state.currentView || "") !== "transport-trips") return;
          renderPortalView();
        }, 180);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-sort']").forEach((select) => {
      select.addEventListener("change", () => {
        clearTransportTripsSearchTimer();
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          sort: normalizeTransportTripsSort(select.value)
        };
        state.tripsRenderLimit = RENDER_WINDOW_SIZE;
        renderPortalView();
      });
    });

    const TRIPS_FIELD_FILTER_KEYS = {
      client: "fClient",
      status: "fStatus",
      driver: "fDriver",
      plate: "fPlate",
      service: "fService",
      from: "fFrom",
      to: "fTo"
    };
    bindModuleFieldFilters(nodes.viewRoot, {
      action: "transport-trips-field",
      clearAction: "transport-trips-fields-clear",
      onChange: (field, value) => {
        clearTransportTripsSearchTimer();
        const key = TRIPS_FIELD_FILTER_KEYS[field];
        if (!key) return;
        state.transportTripsUi = { ...(state.transportTripsUi || {}), [key]: value };
        state.tripsRenderLimit = RENDER_WINDOW_SIZE;
        renderPortalView();
      },
      onClear: () => {
        clearTransportTripsSearchTimer();
        const cleared = {};
        Object.values(TRIPS_FIELD_FILTER_KEYS).forEach((key) => {
          cleared[key] = "";
        });
        state.transportTripsUi = { ...(state.transportTripsUi || {}), ...cleared };
        state.tripsRenderLimit = RENDER_WINDOW_SIZE;
        renderPortalView();
      }
    });

    /* Bandeja: elegir viaje (re-render conservando el scroll de la lista). */
    nodes.viewRoot.querySelectorAll("[data-action='trip-select']").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearTransportTripsSearchTimer();
        const list = nodes.viewRoot.querySelector(".rq-inbox__list");
        state.__tripsInboxScroll = list ? list.scrollTop : 0;
        state.transportTripsUi = { ...(state.transportTripsUi || {}), selectedId: String(btn.dataset.id || "") };
        renderPortalView();
        if (window.matchMedia && window.matchMedia("(max-width: 1100px)").matches) {
          queueMicrotask(() => nodes.viewRoot.querySelector(".rq-pane")?.scrollIntoView({ block: "start", behavior: "smooth" }));
        }
      });
    });

    /* Panel de detalle: pestañas sin re-render. */
    nodes.viewRoot.querySelectorAll("[data-action='trip-detail-tab']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = String(btn.dataset.tab || "general");
        const pane = btn.closest(".rq-pane");
        if (!pane) return;
        pane.querySelectorAll("[data-action='trip-detail-tab']").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        pane.querySelectorAll(".rq-panel").forEach((panel) => {
          panel.hidden = panel.dataset.panel !== tab;
        });
        state.transportTripsUi = { ...(state.transportTripsUi || {}), detailTab: tab };
      });
    });

    /* Filtros plegables sin re-render. */
    nodes.viewRoot.querySelectorAll("[data-action='trips-filters-toggle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = nodes.viewRoot.querySelector("#rq-filters-panel");
        if (!panel) return;
        const open = panel.hidden;
        panel.hidden = !open;
        btn.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        state.transportTripsUi = { ...(state.transportTripsUi || {}), filtersOpen: open };
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trips-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearTransportTripsSearchTimer();
        state.transportTripsUi = {
          ...(state.transportTripsUi || {}),
          layout: normalizeTransportTripsLayout(btn.dataset.layout)
        };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='transport-trip-form-step']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = String(btn.dataset.step || "");
        const target = nodes.viewRoot.querySelector(`[data-create-trip-step="${step}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          message: "Esta ruta dejará de sugerir precio al asignar viajes.",
          confirmText: "Quitar tarifa",
          onConfirm: async () => {
            const rates = { ...getTripRouteRatesNormalized() };
            const removed = rates[key];
            const removedId =
              removed && typeof removed === "object" ? String(removed.id || "").trim() : "";
            delete rates[key];
            try {
              await writeAwaitServerDelete(
                KEYS.tripRouteRates,
                rates,
                removedId ? [removedId] : undefined
              );
            } catch (err) {
              notify(String(err?.message || "No se pudo actualizar las tarifas en el servidor."), "error");
              return;
            }
            if (removed && typeof removed === "object") {
              const parts = parseTripRateStorageKeyToRouteParts(key);
              const origin = String(parts.originCity || "?").trim();
              const destination = String(parts.destinationCity || "?").trim();
              const originDept = String(parts.originDepartment || "").trim();
              const destDept = String(parts.destinationDepartment || "").trim();
              const routeLabel = `${origin} → ${destination}`;
              const amount = parseNum(removed.value);
              const amountLabel = `$${amount.toLocaleString("es-CO")}`;
              appendModuleAuditLog({
                action: "delete",
                moduleId: "trips",
                moduleLabel: "Viajes",
                entityId: String(removed.id || key),
                entityKind: "route_rate",
                entityLabel: routeLabel,
                summary: `Eliminación de tarifa de trayecto · ${routeLabel} · ${amountLabel}`,
                changesText: [
                  `Ruta: ${routeLabel}`,
                  originDept || destDept
                    ? `Departamentos: ${originDept || "—"} → ${destDept || "—"}`
                    : "",
                  `Valor: ${amountLabel} COP`,
                  "Impacto: deja de sugerirse precio al asignar viajes en esta ruta"
                ]
                  .filter(Boolean)
                  .join(" · ")
              });
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
        const ok = await approveRequest(requestId, actor?.name || "Administrador", false, vehicleId, driverId, tripValue, {
          allowApproveAndAssign
        });
        if (!ok) return;
        suppressSelfInboxPollToastIfRecipientIsCurrentUser(request.clientUserId);
        notify(userMessage("tripCreatedAssigned"), "success");
        const optLabel = (name) => String(createTripForm.querySelector(`select[name='${name}'] option:checked`)?.textContent || "").split(" · ")[0].trim();
        const doneReq = reqRead().find((r) => r.id === requestId) || request;
        state.tripCreatedNotice = {
          requestId,
          summary: [
            doneReq?.requestNumber || requestId,
            String(doneReq?.clientName || "").trim(),
            [doneReq?.originCity, doneReq?.destinationCity].filter(Boolean).join(" → "),
            [optLabel("vehicleId"), optLabel("driverId")].filter(Boolean).join(" · ")
          ]
            .filter(Boolean)
            .join(" · ")
        };
        state.createPanels = { ...(state.createPanels || {}), "create-trip": true };
        renderPortalView();
        requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(".create-trip-done")?.scrollIntoView({ block: "center", behavior: "smooth" })));
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
          await writeAwaitServer(KEYS.tripRouteRates, next, {
            syncData: syncPayloadForEditedObjectKeys(next, storageKey),
            deletedIds:
              editingKey &&
              editingKey !== storageKey &&
              previousEntry &&
              typeof previousEntry === "object" &&
              String(previousEntry.id || "").trim()
                ? [String(previousEntry.id).trim()]
                : undefined
          });
        } catch (err) {
          notify(String(err?.message || userMessage("genericError")), "error");
          return;
        }
        notify(editingKey ? "Tarifa por trayecto actualizada." : userMessage("routeRateSaved"), "success");
        resetRateEditMode();
        state.createPanels = { ...(state.createPanels || {}), "create-route-rate": true };
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

    nodes.viewRoot.querySelectorAll("[data-action='reassign-trip']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const req = reqRead().find((r) => r.id === btn.dataset.id);
        if (!req || !req.trip) return;
        openReassignTripModal(req);
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
            "Se quitará la asignación de camión y conductor. La solicitud volverá a estado aprobada pendiente de asignación. El motivo quedará registrado.",
          confirmText: "Eliminar viaje",
          onConfirm: async (motivo) => {
            const reqBefore = reqRead().find((request) => request.id === requestId);
            const tripLabel = String(reqBefore?.trip?.tripNumber || reqBefore?.requestNumber || requestId);
            try {
              await postPortalAuthorized("/portal/admin-clear-trip", { requestId, motivo });
            } catch (err) {
              notify(String(err?.message || "No fue posible quitar el viaje en el servidor."), "error");
              return;
            }
            const cleared = reqRead().map((request) =>
                request.id === requestId
                  ? {
                      ...request,
                      status: STATUS.APROBADA_PENDIENTE_ASIGNACION,
                      trip: null,
                      deliveredAt: null,
                      closedAt: null
                    }
                  : request
              );
            const clearedRow = cleared.find((request) => request.id === requestId);
            await reqWriteAwait(cleared, clearedRow);
            recalculateResourceAvailability();
            const actor = currentUser();
            logPortalAuditEvent?.("trips", "delete", {
              entityId: requestId,
              entityLabel: tripLabel,
              summary: `Viaje desasignado · Motivo: ${String(motivo || "").trim()}`,
              actor: String(actor?.email || actor?.name || ""),
              actorEmail: String(actor?.email || ""),
              actorUserId: String(actor?.id || "")
            });
            try {
              await applyPortalBootstrapFromApi();
            } catch (_e) { window.AntaresLogSilentError?.("viajes.js:1710", _e); }
            notify(userMessage("tripRemoved"), "success");
            renderPortalView();
          }
        });
      });
    });

    if (typeof state.__tripsInboxScroll === "number") {
      const keep = state.__tripsInboxScroll;
      delete state.__tripsInboxScroll;
      const list = nodes.viewRoot.querySelector(".rq-inbox__list");
      if (list) list.scrollTop = keep;
    }

    const ratesSearchRestore = state.__transportRatesSearchRestore;
    if (ratesSearchRestore && typeof ratesSearchRestore.start === "number") {
      delete state.__transportRatesSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "transport-trips") return;
        const inp = root.querySelector("[data-action='transport-rates-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          inp.setSelectionRange(Math.min(ratesSearchRestore.start, n), Math.min(ratesSearchRestore.end ?? ratesSearchRestore.start, n));
        }
      });
    }

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
