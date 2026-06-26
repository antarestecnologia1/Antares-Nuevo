/**
 * Solicitudes — HTML de la vista (`requestsHtml`) y builders de tarjetas.
 * Listeners en `modules/app/mis-solicitudes.js`.
 */
(function registerSolicitudesModule() {
  if (!window.AppModules) window.AppModules = {};
  if (!window.AppModules.solicitudes) window.AppModules.solicitudes = {};

  /** Misma convención que Camiones / Viajes: `cards` | `list`. */
  function normalizeRequestsListLayout(raw) {
    return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
  }

  function formatTimePresetLabel(hhmm) {
    if (typeof window.formatTimeDisplay === "function") {
      const label = window.formatTimeDisplay(hhmm);
      if (label) return label;
    }
    const t = String(hhmm || "").trim().slice(0, 5);
    if (!/^\d{1,2}:\d{2}$/.test(t)) return t;
    const [h, m] = t.split(":").map((n) => parseInt(n, 10));
    const dt = new Date(2000, 0, 1, h, m);
    if (Number.isNaN(dt.getTime())) return t;
    return dt.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  function acfScheduleTimePresets(targetId, times) {
    return `<div class="acf-time-presets" role="group" aria-label="Horas sugeridas">
      ${times
        .map(
          (t) =>
            `<button type="button" class="acf-time-preset" data-acf-time-preset="${escapeAttr(t)}" data-acf-time-target="${escapeAttr(targetId)}" aria-label="Usar ${escapeAttr(formatTimePresetLabel(t))}">${escapeHtml(formatTimePresetLabel(t))}</button>`
        )
        .join("")}
    </div>`;
  }

  function acfScheduleDatePresets(targetId) {
    return `<div class="acf-date-presets" role="group" aria-label="Fechas rápidas">
      <button type="button" class="acf-date-preset" data-acf-date-offset="0" data-acf-date-target="${escapeAttr(targetId)}">Hoy</button>
      <button type="button" class="acf-date-preset" data-acf-date-offset="1" data-acf-date-target="${escapeAttr(targetId)}">Mañana</button>
      <button type="button" class="acf-date-preset" data-acf-date-offset="2" data-acf-date-target="${escapeAttr(targetId)}">+2 días</button>
    </div>`;
  }

  function acfScheduleDateField(inputId, inputName, label) {
    return `<div class="acf-schedule-field acf-schedule-field--date">
      <label>${fieldLabel(IC.calendar, label, { required: true })}
        <div class="acf-picker acf-picker--date" data-acf-picker="date" data-acf-picker-target="${escapeAttr(inputId)}">
          <input type="hidden" name="${escapeAttr(inputName)}" id="${escapeAttr(inputId)}" required data-portal-date-enhanced="1" data-antares-validate-blur="date-iso" />
          <div class="acf-date-shell acf-picker__shell">
            <span class="acf-date-shell__icon" aria-hidden="true">${IC.calendar}</span>
            <button type="button" class="acf-picker__trigger" data-acf-picker-open aria-haspopup="dialog" aria-expanded="false">
              <span class="acf-picker__placeholder">Seleccione fecha</span>
              <span class="acf-picker__value" data-acf-picker-display hidden></span>
            </button>
            <span class="acf-picker__chevron" aria-hidden="true">${IC.chevronDown}</span>
          </div>
          <div class="acf-picker__panel acf-picker__panel--date" data-acf-picker-panel hidden role="dialog" aria-label="Elegir ${escapeAttr(label)}"></div>
        </div>
      </label>
      ${acfScheduleDatePresets(inputId)}
    </div>`;
  }

  function acfScheduleTimeField(inputId, inputName, label, presetTimes) {
    return `<div class="acf-schedule-field acf-schedule-field--time">
      <label>${fieldLabel(IC.clock, label, { required: true })}
        <div class="acf-picker acf-picker--time" data-acf-picker="time" data-acf-picker-target="${escapeAttr(inputId)}">
          <input
            type="hidden"
            name="${escapeAttr(inputName)}"
            id="${escapeAttr(inputId)}"
            required
            data-antares-validate-blur="time-hhmm"
          />
          <div class="acf-time-shell acf-picker__shell">
            <span class="acf-time-shell__icon" aria-hidden="true">${IC.clock}</span>
            <button type="button" class="acf-picker__trigger" data-acf-picker-open aria-haspopup="dialog" aria-expanded="false" aria-label="Abrir selector de ${escapeAttr(label)}">
              <span class="acf-picker__placeholder">Seleccione hora</span>
              <span class="acf-picker__value" data-acf-picker-display hidden></span>
            </button>
            <span class="acf-picker__chevron" aria-hidden="true">${IC.chevronDown}</span>
          </div>
          <div class="acf-picker__panel acf-picker__panel--time" data-acf-picker-panel hidden role="dialog" aria-label="Elegir ${escapeAttr(label)}"></div>
        </div>
      </label>
      ${acfScheduleTimePresets(inputId, presetTimes)}
    </div>`;
  }

  function requestScheduleWindowsHtml() {
    return `<div class="acf-schedule" data-request-schedule>
      <div class="acf-schedule__preview" data-request-schedule-preview role="status" aria-live="polite">
        <span class="acf-schedule__preview-icon" aria-hidden="true">${IC.calendar}</span>
        <div class="acf-schedule__preview-copy">
          <strong class="acf-schedule__preview-title">Defina recogida y entrega</strong>
          <p class="acf-schedule__preview-detail muted">Elija fecha y hora estimadas; puede usar los accesos rápidos debajo.</p>
        </div>
      </div>
      <div class="acf-schedule__grid">
        <article class="acf-schedule-card acf-schedule-card--pickup">
          <header class="acf-schedule-card__head">
            <span class="acf-schedule-card__badge acf-schedule-card__badge--pickup">${IC.mapPin} Recogida</span>
            <span class="acf-schedule-card__step">Inicio del servicio</span>
          </header>
          <div class="acf-schedule-card__body">
            ${acfScheduleDateField("pickup-date", "pickupDate", "Fecha de recogida")}
            ${acfScheduleTimeField("pickup-time", "pickupTime", "Hora de recogida", ["06:00", "08:00", "10:00", "12:00", "14:00"])}
          </div>
        </article>
        <div class="acf-schedule__connector" aria-hidden="true">
          <span class="acf-schedule__connector-line"></span>
          <span class="acf-schedule__connector-chip" data-request-schedule-duration>—</span>
          <span class="acf-schedule__connector-arrow">${IC.chevronRight || "→"}</span>
        </div>
        <article class="acf-schedule-card acf-schedule-card--delivery">
          <header class="acf-schedule-card__head">
            <span class="acf-schedule-card__badge acf-schedule-card__badge--delivery">${IC.compass || IC.mapPin} Entrega</span>
            <span class="acf-schedule-card__step">Fin del servicio</span>
          </header>
          <div class="acf-schedule-card__body">
            ${acfScheduleDateField("delivery-date", "deliveryDate", "Fecha de entrega")}
            ${acfScheduleTimeField("delivery-time", "deliveryTime", "Hora de entrega", ["10:00", "12:00", "14:00", "16:00", "18:00"])}
          </div>
        </article>
      </div>
      <p class="acf-schedule__footnote muted">La entrega debe ser posterior a la recogida. Horario referencial en zona Colombia (COT).</p>
    </div>`;
  }

  /** Logo cliente: prioriza caché de empresa (logo actualizado), luego URL del JOIN en API. */
  function resolveRequestCompanyLogoUrl(r, company) {
    const fromCompany =
      typeof companyProfileLogoUrl === "function"
        ? companyProfileLogoUrl(company)
        : String(company?.logoUrl ?? company?.url_logo ?? "").trim();
    if (fromCompany) return fromCompany;
    return String(r?.clientCompanyLogoUrl ?? "").trim();
  }

  /**
   * Convierte una solicitud en una tarjeta del panel operativo (vista tarjetas).
   * Incluye las acciones (detalle, editar, cancelar, eliminar); la vista lista
   * usa `buildRequestOpsListRow` con la misma tabla estilada que Camiones.
   */
  function buildRequestOpsCard(r, user) {
    const allowEdit = typeof canPortalUserEditTransportRequest === "function" ? canPortalUserEditTransportRequest(r, user) : false;
    const allowClientHardDeletePending =
      user?.role === ROLES.CLIENT &&
      typeof canClientEditOwnPendingTransportRequest === "function" &&
      canClientEditOwnPendingTransportRequest(r, user);
    const isAdmin = user?.role === ROLES.ADMIN;
    const companies = read(KEYS.companies, []);
    const company = companies.find((c) => String(c.id) === String(r.clientCompanyId || "")) || null;
    const clientName = String(r.clientName || company?.name || "Cliente").trim() || "Cliente";
    const logoUrl = resolveRequestCompanyLogoUrl(r, company);
    const clientLogoHtml = logoUrl
      ? `<span class="request-company-logo request-company-logo--sm request-ops-card-company-logo" role="img" aria-label="Logo de ${escapeAttr(clientName)}"><img src="${escapeAttr(logoUrl)}" alt="" loading="lazy" /></span>`
      : `<span class="request-company-logo request-company-logo--sm request-company-logo--fallback request-ops-card-company-logo" aria-hidden="true">${escapeHtml(String(clientName || "E").charAt(0).toUpperCase())}</span>`;
    const statusSlug = typeof slugStatus === "function" ? slugStatus(r.status) : String(r.status || "").replace(/\W+/g, "-").toLowerCase();
    const originCity = String(r.originCity || r.originDepartment || "Origen").trim() || "Origen";
    const destinationCity = String(r.destinationCity || r.destinationDepartment || "Destino").trim() || "Destino";
    const pickupLabel = fmtDate(r.trip?.etaPickup || r.pickupAt || r.pickupDate || "") || "Sin fecha";
    const cargoLabel = String(r.cargoDescription || "Carga").trim() || "Carga";
    const truckReq = typeof requestTruckRequirementSummaryHtml === "function" ? requestTruckRequirementSummaryHtml(r) : "";
    const tripAssigned = Boolean(r.trip);
    const valueDd = tripAssigned
      ? `$${parseNum(r.tripValue || r.insuredValue || 0).toLocaleString("es-CO")}`
      : `<span class="muted">${escapeHtml("Pendiente")}</span>`;
    const requestedBy = String(r.requestedByName || "").trim();
    const metaHints = [
      r.autoApproved ? "Autoaprobada" : "",
      parseNum(r.distanceKm || 0) > 0 ? `${parseNum(r.distanceKm).toLocaleString("es-CO")} km` : ""
    ]
      .filter(Boolean)
      .join(" · ");
    const statusText = String(r.status || "—").trim() || "—";
    const reqNo = String(r.requestNumber || r.id || "-");
    const createdLabel = fmtDate(r.createdAt || "") || "—";
    const headerRefs = [{ label: "Solicitud", value: `#${reqNo}` }];
    if (r.trip?.tripNumber) {
      headerRefs.push({ label: "Viaje", value: String(r.trip.tripNumber) });
    }
    if (requestedBy) {
      headerRefs.push({ label: "Solicitó", value: requestedBy });
    }
    const headerRefsHtml = buildPortalOpsCardRefs(headerRefs);
    const statusBadgeHtml = buildPortalOpsCardStatusPill(statusText, statusSlug);
    const tripBadge = r.trip
      ? `<p class="trip-ops-card-standby request-ops-card-trip portal-ops-card-highlight"><span class="request-ops-card-trip-ico">${IC.truck}</span><span>Viaje <strong>${escapeHtml(String(r.trip.tripNumber || "-"))}</strong> · ${escapeHtml(String(r.trip.vehiclePlate || "-"))} · <span class="muted">${escapeHtml(String(r.trip.driverName || "-"))}</span></span></p>`
      : "";
    const actionButtons = [
      `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--solid" data-action="detail" data-id="${escapeAttr(String(r.id || ""))}" title="Ver detalle completo">${IC.eye} Detalle</button>`,
      allowEdit
        ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--soft" data-action="edit-request" data-id="${escapeAttr(String(r.id || ""))}" title="${r.trip ? "Editar (requiere justificación: viaje asignado)" : "Editar la solicitud"}">${IC.edit} Editar</button>`
        : "",
      allowEdit && !r.trip
        ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--danger" data-action="cancel-request" data-id="${escapeAttr(String(r.id || ""))}" title="Marcar como cancelada">${IC.x} Cancelar</button>`
        : "",
      allowClientHardDeletePending
        ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--danger" data-action="delete-client-request" data-id="${escapeAttr(String(r.id || ""))}" title="Eliminar solicitud">${IC.trash} Eliminar</button>`
        : "",
      isAdmin
        ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--danger" data-action="delete-admin" data-id="${escapeAttr(String(r.id || ""))}" title="Eliminar solicitud">${IC.trash} Eliminar</button>`
        : ""
    ]
      .filter(Boolean)
      .join("");
    return `<article class="trip-ops-card portal-ops-card trip-ops-card--${escapeAttr(statusSlug)} request-ops-card" data-request-id="${escapeAttr(String(r.id || ""))}">
      <header class="trip-ops-card-head">
        <div class="trip-ops-card-head-main">
          ${clientLogoHtml}
          <div class="trip-ops-card-head-info">
            ${headerRefsHtml}
            <h4 class="trip-ops-card-title" title="${escapeAttr(clientName)}">${escapeHtml(clientName)}</h4>
            ${metaHints ? `<p class="muted request-ops-card-meta">${escapeHtml(metaHints)}</p>` : ""}
          </div>
        </div>
        <div class="portal-ops-card-badges">${statusBadgeHtml}</div>
      </header>
      <div class="trip-ops-card-route">
        <div class="trip-ops-card-route-node trip-ops-card-route-node--origin" title="${escapeAttr(originCity)}">
          <span class="trip-ops-card-route-label">Origen</span>
          <span class="trip-ops-card-route-city">
            <span class="trip-ops-card-route-pin" aria-hidden="true">${IC.mapPin}</span>
            <strong>${escapeHtml(originCity)}</strong>
          </span>
        </div>
        <span class="trip-ops-card-route-connector" aria-hidden="true">
          <span class="trip-ops-card-route-line"></span>
          <span class="trip-ops-card-route-arrow">${IC.chevronRight}</span>
        </span>
        <div class="trip-ops-card-route-node trip-ops-card-route-node--dest" title="${escapeAttr(destinationCity)}">
          <span class="trip-ops-card-route-label">Destino</span>
          <span class="trip-ops-card-route-city">
            <span class="trip-ops-card-route-pin" aria-hidden="true">${IC.mapPin}</span>
            <strong>${escapeHtml(destinationCity)}</strong>
          </span>
        </div>
      </div>
      <div class="trip-ops-card-grid portal-ops-card-spec-grid">
        ${buildPortalOpsCardGridItem("Carga", IC.package || IC.file, cargoLabel)}
        ${buildPortalOpsCardGridItem("Camión / requisitos", IC.truck, truckReq, { raw: true })}
        ${buildPortalOpsCardGridItem("Recogida", IC.calendar, pickupLabel)}
        ${buildPortalOpsCardGridItem("Valor", IC.dollar, valueDd, { tone: "value", raw: true })}
      </div>
      ${tripBadge}
      ${buildPortalOpsCardActions(actionButtons)}
      ${buildPortalOpsCardFoot("Creado", createdLabel)}
    </article>`;
  }

  function buildRequestOpsListRow(r, user) {
    const allowEdit = typeof canPortalUserEditTransportRequest === "function" ? canPortalUserEditTransportRequest(r, user) : false;
    const allowClientHardDeletePending =
      user?.role === ROLES.CLIENT &&
      typeof canClientEditOwnPendingTransportRequest === "function" &&
      canClientEditOwnPendingTransportRequest(r, user);
    const isAdmin = user?.role === ROLES.ADMIN;
    const companies = read(KEYS.companies, []);
    const company = companies.find((c) => String(c.id) === String(r.clientCompanyId || "")) || null;
    const clientName = String(r.clientName || company?.name || "Cliente").trim() || "Cliente";
    const statusSlug = typeof slugStatus === "function" ? slugStatus(r.status) : String(r.status || "").replace(/\W+/g, "-").toLowerCase();
    const originCity = String(r.originCity || r.originDepartment || "Origen").trim() || "Origen";
    const destinationCity = String(r.destinationCity || r.destinationDepartment || "Destino").trim() || "Destino";
    const pickupLabel = fmtDate(r.trip?.etaPickup || r.pickupAt || r.pickupDate || "") || "Sin fecha";
    const cargoLabel = String(r.cargoDescription || "Carga").trim() || "Carga";
    const tripAssigned = Boolean(r.trip);
    const valueCell = tripAssigned
      ? `$${parseNum(r.tripValue || r.insuredValue || 0).toLocaleString("es-CO")}`
      : "Pendiente";
    const tripCell = r.trip
      ? `${escapeHtml(String(r.trip.tripNumber || "—"))} · ${escapeHtml(String(r.trip.vehiclePlate || "—"))}`
      : `<span class="muted">Sin viaje</span>`;
    const reqNo = String(r.requestNumber || r.id || "—");
    const cargoShort = cargoLabel.length > 56 ? `${cargoLabel.slice(0, 53)}…` : cargoLabel;
    return `<tr data-request-id="${escapeAttr(String(r.id || ""))}">
      <td data-label="Solicitud"><strong class="vehicle-fleet-list-plate">${escapeHtml(reqNo)}</strong></td>
      <td data-label="Cliente">${escapeHtml(clientName)}</td>
      <td data-label="Ruta"><span class="vehicle-fleet-list-sub">${escapeHtml(originCity)}</span> → <span class="vehicle-fleet-list-sub">${escapeHtml(destinationCity)}</span></td>
      <td data-label="Carga"><span class="vehicle-fleet-list-doc" title="${escapeAttr(cargoLabel)}">${escapeHtml(cargoShort)}</span></td>
      <td data-label="Estado"><span class="trip-ops-card-status trip-ops-card-status--${escapeAttr(statusSlug)}">${prettyStatus(r.status, "request")}</span></td>
      <td data-label="Recogida">${escapeHtml(pickupLabel)}</td>
      <td data-label="Valor">${tripAssigned ? escapeHtml(valueCell) : `<span class="muted">${escapeHtml(valueCell)}</span>`}</td>
      <td data-label="Viaje">${tripCell}</td>
      <td data-label="Acciones" class="vehicle-fleet-list-actions"><div class="toolbar">
        <button class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(String(r.id || ""))}" title="Ver detalle">${IC.eye} Detalle</button>
        ${allowEdit ? `<button class="btn btn-sm btn-outline" data-action="edit-request" data-id="${escapeAttr(String(r.id || ""))}">${IC.edit} Editar</button>` : ""}
        ${allowEdit && !r.trip ? `<button class="btn btn-sm btn-reject" data-action="cancel-request" data-id="${escapeAttr(String(r.id || ""))}">${IC.x} Cancelar</button>` : ""}
        ${allowClientHardDeletePending ? `<button class="btn btn-sm btn-reject" data-action="delete-client-request" data-id="${escapeAttr(String(r.id || ""))}">${IC.trash} Eliminar</button>` : ""}
        ${isAdmin ? `<button class="btn btn-sm btn-reject" data-action="delete-admin" data-id="${escapeAttr(String(r.id || ""))}">${IC.trash} Eliminar</button>` : ""}
      </div></td>
    </tr>`;
  }

  /**
   * Lista de solicitudes: tarjetas o tabla tipo flota (Camiones).
   * @param {Array} requests lista ya filtrada
   * @param {Object} user usuario actual
   * @param {string} [layoutRaw] `cards` | `list` (desde `state.requestsUi.listLayout`)
   */
  function requestOpsCardsHtml(requests, user, layoutRaw) {
    const layout = normalizeRequestsListLayout(layoutRaw);
    if (!requests.length) {
      return emptyState("No hay solicitudes para el filtro seleccionado.");
    }
    const sorted = requests
      .slice()
      .sort((a, b) => {
        const ta = new Date(a?.trip?.etaPickup || a?.pickupAt || a?.pickupDate || a?.createdAt || 0).getTime();
        const tb = new Date(b?.trip?.etaPickup || b?.pickupAt || b?.pickupDate || b?.createdAt || 0).getTime();
        return tb - ta; // Más recientes/próximas primero
      });
    /**
     * Ventana de render: no construimos cientos de tarjetas de una sola vez (lo que
     * hacía lento "mostrar los datos"). No se oculta ningún dato del servidor; el resto
     * se muestra con "Ver más". El límite vive en `state.requestsRenderLimit` y se
     * reinicia al cambiar filtro (manejadores en `modules/app/mis-solicitudes.js`).
     */
    const WIN = 30;
    let limit = WIN;
    try {
      limit = Number(typeof state !== "undefined" && state?.requestsRenderLimit) || WIN;
    } catch (_) {
      /* noop */
    }
    if (!(limit > 0)) limit = WIN;
    const shown = sorted.slice(0, limit);
    const moreBar =
      typeof renderWindowMoreBar === "function"
        ? renderWindowMoreBar(sorted.length, shown.length, "requests-render-more")
        : "";
    if (layout === "list") {
      const rows = shown.map((r) => buildRequestOpsListRow(r, user)).join("");
      return `<div class="table-wrap vehicle-fleet-list-wrap"><table class="vehicle-fleet-table request-ops-fleet-table">
        <thead><tr>
          <th>Solicitud</th><th>Cliente</th><th>Ruta</th><th>Carga</th><th>Estado</th><th>Recogida</th><th>Valor</th><th>Viaje</th><th>Acciones</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>${moreBar}`;
    }
    return `<div class="trip-ops-cards portal-ops-cards request-ops-cards">${shown.map((r) => buildRequestOpsCard(r, user)).join("")}</div>${moreBar}`;
  }

  /**
   * Construye las pills de filtros rápidos sobre estado de la solicitud.
   */
  function requestFiltersBarHtml(allRequests, activeFilter) {
    const tripActive = typeof activeTripStatuses === "function" ? new Set(activeTripStatuses()) : new Set();
    const counts = {
      all: allRequests.length,
      pending: allRequests.filter((r) => [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status) && !r.trip).length,
      active: allRequests.filter((r) => r.trip && tripActive.has(r.status)).length,
      closed: allRequests.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length,
      cancelled: allRequests.filter((r) => [STATUS.CANCELADA, STATUS.RECHAZADA].includes(r.status)).length
    };
    const pill = (key, label, count) =>
      `<button type="button" class="ops-filter-pill${activeFilter === key ? " is-active" : ""}" data-action="requests-filter" data-filter="${escapeAttr(key)}"><span>${escapeHtml(label)}</span><strong>${count}</strong></button>`;
    return `<div class="requests-data-filters ops-filters-bar" role="group" aria-label="Filtrar por estado">
      ${pill("all", "Todas", counts.all)}
      ${pill("pending", "Pendientes", counts.pending)}
      ${pill("active", "En operación", counts.active)}
      ${pill("closed", "Cerradas", counts.closed)}
      ${pill("cancelled", "Canceladas", counts.cancelled)}
    </div>`;
  }

  function requestDataHeadHtml({ eyebrow, title, meta, actionsHtml }) {
    return `<header class="requests-data-head">
      <div class="requests-data-head__copy">
        ${eyebrow ? `<span class="requests-data-head__eyebrow">${eyebrow}</span>` : ""}
        <h3 class="requests-data-head__title">${escapeHtml(title)}</h3>
        ${meta ? `<p class="requests-data-head__meta muted">${escapeHtml(meta)}</p>` : ""}
      </div>
      ${actionsHtml || ""}
    </header>`;
  }

  function requestDataToolbarHtml(filtersBar, listSearchRaw, listLayout) {
    return `<div class="requests-data-toolbar">
      <div class="requests-data-toolbar__filters">${filtersBar}</div>
      <div class="requests-data-toolbar__tools">
        <label class="requests-data-search transport-ops-search">
          <span class="requests-data-search__icon" aria-hidden="true">${IC.search || ""}</span>
          <input type="search" data-action="requests-list-search" value="${escapeAttr(listSearchRaw)}" placeholder="Buscar cliente, ruta, número, conductor…" autocomplete="off" />
        </label>
        <div class="requests-data-layout transport-ops-layout" role="group" aria-label="Tarjetas o lista">
          <button type="button" class="btn btn-sm ${listLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="requests-list-layout" data-layout="cards">${IC.grid || ""} Tarjetas</button>
          <button type="button" class="btn btn-sm ${listLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="requests-list-layout" data-layout="list">${IC.layers || ""} Lista</button>
        </div>
      </div>
    </div>`;
  }

  function requestDataResultMetaHtml(shown, total, { listSearchNorm, listLayout, scopeLabel }) {
    const scope = scopeLabel ? ` · ${escapeHtml(scopeLabel)}` : "";
    const search = listSearchNorm ? " · búsqueda activa" : "";
    const layout = listLayout === "list" ? " · vista lista" : "";
    return `<p class="requests-data-result-meta" aria-live="polite">Mostrando <strong>${shown}</strong> de <strong>${total}</strong> solicitud${total === 1 ? "" : "es"}${scope}${search}${layout}</p>`;
  }

  function requestDataConsultShell({ user, headHtml, toolbarHtml, resultMetaHtml, resultsHtml, adminHubHtml, companyCount }) {
    const isAdmin = user?.role === ROLES.ADMIN && adminHubHtml;
    if (!isAdmin) {
      return `<section class="requests-data-panel requests-data-panel">
        ${headHtml}
        ${toolbarHtml}
        ${resultMetaHtml}
        <div class="requests-data-results">${resultsHtml}</div>
      </section>`;
    }
    return `<section class="requests-data-panel requests-data-panel">
      <div class="requests-data-layout requests-data-layout--admin">
        <aside class="requests-data-sidebar" aria-label="Empresas clientes">
          <div class="requests-data-sidebar__head">
            <div>
              <span class="requests-data-sidebar__eyebrow">Clientes</span>
              <h4 class="requests-data-sidebar__title">Empresas</h4>
            </div>
            <span class="requests-data-sidebar__count">${companyCount}</span>
          </div>
          <p class="requests-data-sidebar__hint muted">${companyCount > 12 ? "Use la búsqueda para ubicar un cliente entre muchas empresas." : "Seleccione una empresa para filtrar la bandeja."}</p>
          <div class="requests-data-sidebar__hub">${adminHubHtml}</div>
        </aside>
        <div class="requests-data-main">
          ${headHtml}
          ${toolbarHtml}
          ${resultMetaHtml}
          <div class="requests-data-results">${resultsHtml}</div>
        </div>
      </div>
    </section>`;
  }

  function applyRequestFilter(requests, filterKey) {
    const tripActive = typeof activeTripStatuses === "function" ? new Set(activeTripStatuses()) : new Set();
    switch (filterKey) {
      case "pending":
        return requests.filter((r) => [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status) && !r.trip);
      case "active":
        return requests.filter((r) => r.trip && tripActive.has(r.status));
      case "closed":
        return requests.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status));
      case "cancelled":
        return requests.filter((r) => [STATUS.CANCELADA, STATUS.RECHAZADA].includes(r.status));
      case "all":
      default:
        return requests;
    }
  }

  const REQUESTS_COMPANY_RENDER_WINDOW = 25;

  function requestsCompanyRenderWindowSize() {
    if (typeof RENDER_WINDOW_SIZE !== "undefined" && RENDER_WINDOW_SIZE > 0) {
      return Math.min(REQUESTS_COMPANY_RENDER_WINDOW, RENDER_WINDOW_SIZE);
    }
    return REQUESTS_COMPANY_RENDER_WINDOW;
  }

  function buildAdminCompanyDirectoryEntries(requests) {
    const companies = read(KEYS.companies, []);
    const grouped = requests.reduce((acc, req) => {
      const cid = String(req.clientCompanyId || "");
      if (!cid) return acc;
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push(req);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([companyId, list]) => {
        const company = companies.find((c) => String(c.id) === companyId) || null;
        const name = String(company?.name || list[0]?.clientName || "Empresa sin nombre").trim() || "Empresa sin nombre";
        const logoFromReq = list.map((x) => resolveRequestCompanyLogoUrl(x, company)).find((u) => u) || "";
        const logoUrl = logoFromReq || String(company?.logoUrl || "").trim();
        const pending = list.filter((r) =>
          [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status) && !r.trip
        ).length;
        const active = list.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
        const closed = list.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
        return {
          companyId: String(companyId),
          name,
          nameNorm: name.toLowerCase(),
          logoUrl,
          total: list.length,
          pending,
          active,
          closed
        };
      })
      .sort((a, b) => a.nameNorm.localeCompare(b.nameNorm, "es"));
  }

  function sortAdminCompanyDirectoryEntries(entries, sortKey) {
    const sort = String(sortKey || "pending");
    const copy = entries.slice();
    if (sort === "name") {
      return copy.sort((a, b) => a.nameNorm.localeCompare(b.nameNorm, "es"));
    }
    if (sort === "volume") {
      return copy.sort((a, b) => b.total - a.total || a.nameNorm.localeCompare(b.nameNorm, "es"));
    }
    return copy.sort(
      (a, b) =>
        b.pending - a.pending ||
        b.total - a.total ||
        a.nameNorm.localeCompare(b.nameNorm, "es")
    );
  }

  function sliceAdminCompanyDirectoryWindow(entries, selectedCompanyId, limit) {
    const cap = Math.max(1, Number(limit) || requestsCompanyRenderWindowSize());
    const selected = selectedCompanyId
      ? entries.find((entry) => String(entry.companyId) === String(selectedCompanyId))
      : null;
    const rest = selected
      ? entries.filter((entry) => String(entry.companyId) !== String(selectedCompanyId))
      : entries;
    if (!selected) return { shown: entries.slice(0, cap), total: entries.length };
    return { shown: [selected, ...rest.slice(0, Math.max(0, cap - 1))], total: entries.length };
  }

  function buildAdminCompanyDirectoryRow(entry, selectedCompanyId) {
    const isSelected = String(selectedCompanyId || "") === String(entry.companyId);
    const initial = escapeHtml(String(entry.name || "E").charAt(0).toUpperCase());
    const logoHtml = entry.logoUrl
      ? `<span class="requests-company-row__logo" role="img" aria-label="Logo de ${escapeAttr(entry.name)}"><img src="${escapeAttr(entry.logoUrl)}" alt="" loading="lazy" /></span>`
      : `<span class="requests-company-row__logo requests-company-row__logo--fallback" aria-hidden="true">${initial}</span>`;
    const pendingBadge =
      entry.pending > 0
        ? `<span class="requests-company-row__pending" title="${entry.pending} pendiente${entry.pending === 1 ? "" : "s"}">${entry.pending}</span>`
        : "";
    return `<button type="button" class="requests-company-row${isSelected ? " is-active" : ""}" data-action="request-company-filter" data-company-id="${escapeAttr(entry.companyId)}" role="option" aria-selected="${isSelected ? "true" : "false"}" title="Ver solicitudes de ${escapeAttr(entry.name)}">
      ${logoHtml}
      <span class="requests-company-row__body">
        <span class="requests-company-row__name">${escapeHtml(entry.name)}</span>
        <span class="requests-company-row__meta">${entry.total} sol. · ${entry.active} en op.${entry.closed ? ` · ${entry.closed} cerr.` : ""}</span>
      </span>
      ${pendingBadge}
    </button>`;
  }

  /** Directorio admin escalable: búsqueda, orden y ventana de render para muchas empresas. */
  function requestAdminCompanySidebarHtml(requests, selectedCompanyId) {
    const entries = buildAdminCompanyDirectoryEntries(requests);
    if (!entries.length) {
      return `<p class="requests-company-directory__empty muted">No hay solicitudes agrupables por empresa todavía.</p>`;
    }

    let companySearchRaw = "";
    let companySearchNorm = "";
    let companySort = "pending";
    let companyPendingOnly = false;
    let companyRenderLimit = requestsCompanyRenderWindowSize();
    try {
      companySearchRaw = String((typeof state !== "undefined" && state?.requestsUi?.companySearch) || "");
      companySearchNorm = companySearchRaw.trim().toLowerCase();
      companySort = String((typeof state !== "undefined" && state?.requestsUi?.companySort) || "pending");
      companyPendingOnly = Boolean(typeof state !== "undefined" && state?.requestsUi?.companyPendingOnly);
      companyRenderLimit =
        Number(typeof state !== "undefined" && state?.requestsCompanyRenderLimit) || requestsCompanyRenderWindowSize();
    } catch (_) {
      /* noop */
    }

    const filtered = entries.filter((entry) => {
      if (companyPendingOnly && entry.pending <= 0) return false;
      if (!companySearchNorm) return true;
      return entry.nameNorm.includes(companySearchNorm);
    });
    const sorted = sortAdminCompanyDirectoryEntries(filtered, companySort);
    const { shown, total } = sliceAdminCompanyDirectoryWindow(sorted, selectedCompanyId, companyRenderLimit);
    const pendingCompanies = entries.filter((entry) => entry.pending > 0).length;
    const rows = shown.map((entry) => buildAdminCompanyDirectoryRow(entry, selectedCompanyId)).join("");
    const moreBar =
      typeof renderWindowMoreBar === "function"
        ? renderWindowMoreBar(total, shown.length, "requests-company-render-more")
        : "";
    const sortBtn = (id, label) =>
      `<button type="button" class="requests-company-directory__sort-btn${companySort === id ? " is-active" : ""}" data-action="requests-company-sort" data-sort="${escapeAttr(id)}">${escapeHtml(label)}</button>`;
    const allActive = !String(selectedCompanyId || "").trim();

    return `<div class="requests-company-directory">
      <div class="requests-company-directory__tools">
        <label class="requests-company-directory__search">
          <span class="visually-hidden">Buscar empresa</span>
          <input type="search" data-action="requests-company-search" value="${escapeAttr(companySearchRaw)}" placeholder="Buscar entre ${entries.length} empresas…" autocomplete="off" />
        </label>
        <div class="requests-company-directory__sort" role="group" aria-label="Ordenar empresas">
          ${sortBtn("pending", "Pendientes")}
          ${sortBtn("name", "A-Z")}
          ${sortBtn("volume", "Volumen")}
        </div>
        <label class="requests-company-directory__pending-only">
          <input type="checkbox" data-action="requests-company-pending-only"${companyPendingOnly ? " checked" : ""} />
          <span>Solo con pendientes <strong>(${pendingCompanies})</strong></span>
        </label>
      </div>
      <p class="requests-company-directory__meta muted">Mostrando <strong>${shown.length}</strong> de <strong>${total}</strong> empresa${total === 1 ? "" : "s"}${companySearchNorm ? " · búsqueda activa" : ""}</p>
      <div class="requests-company-directory__list" role="listbox" aria-label="Empresas clientes">
        <button type="button" class="requests-company-row requests-company-row--all${allActive ? " is-active" : ""}" data-action="request-company-clear"${allActive ? ' aria-current="true"' : ""}>
          <span class="requests-company-row__logo requests-company-row__logo--all" aria-hidden="true">${IC.briefcase || ""}</span>
          <span class="requests-company-row__body">
            <span class="requests-company-row__name">Todas las empresas</span>
            <span class="requests-company-row__meta">${entries.length} cliente${entries.length === 1 ? "" : "s"} · vista consolidada</span>
          </span>
        </button>
        ${rows || `<p class="requests-company-directory__empty muted">Ninguna empresa coincide con el filtro.</p>`}
      </div>
      ${moreBar}
    </div>`;
  }

  /** Alcance cliente + franja de métricas (siempre arriba del módulo). */
  function requestModuleHeadHtml() {
    const user = currentUser();
    const list = getVisibleRequestsForUser(user);
    const pend = list.filter((r) => [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status)).length;
    const conViaje = list.filter((r) => r.trip).length;
    const enOp = list.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
    const scopeBar =
      typeof clientDataScopeBarHtml === "function" && typeof isPortalClientUser === "function" && isPortalClientUser(user)
        ? clientDataScopeBarHtml(typeof getClientDataScope === "function" ? getClientDataScope() : "company")
        : "";
    const heroPrimary =
      typeof clientRequestsScopePrimaryLabel === "function" ? clientRequestsScopePrimaryLabel() : "Mis solicitudes";
    const clientHero = moduleFleetHeroStrip([
      { label: heroPrimary, value: list.length },
      { label: "Con viaje", value: conViaje },
      { label: "En operacion", value: enOp },
      { label: "Pendientes", value: pend, tone: pend ? "warn" : undefined }
    ]);
    return scopeBar + clientHero;
  }

  /** Cuerpo del formulario de nueva solicitud (sin envoltorio de pantalla). */
  function requestCreateFormBodyHtml() {
    const user = currentUser();
    const companyName = getCompanyById(user?.companyId)?.name || user?.company || "-";
    const departments = Object.keys(COLOMBIA_LOCATIONS)
      .map((dept) => `<option value="${dept}">${dept}</option>`)
      .join("");
    const companyField =
      typeof buildRequestCompanySelectHtml === "function"
        ? buildRequestCompanySelectHtml(user)
        : `<label class="full">${fieldLabel(IC.briefcase, "Empresa asociada")}
          <input value="${escapeHtml(companyName)}" disabled />
          <input type="hidden" name="companyId" value="${escapeAttr(user?.companyId || "")}" />
        </label>`;
    return `<form id="form-request" class="p-form p-form-colored hr-form-flow antares-create-form requests-create-form" autocomplete="off" novalidate lang="es">
    ${renderHrFormHero({
      eyebrow: "Solicitudes de transporte",
      title: "Nueva solicitud de viaje",
      description: "Registre la ruta, ventanas de servicio y especificaciones de carga. La solicitud quedará pendiente de aprobación operativa.",
      tone: "brand",
      badges: [
        renderHrFormHeroBadge("4 pasos", "guiados"),
        renderHrFormHeroBadge("Ruta", "origen y destino"),
        renderHrFormHeroBadge("Carga", "especificaciones")
      ]
    })}
    <div class="antares-create-form__sections">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.briefcase} Empresa y ruta</legend>
      <p class="muted form-section-hint">Identifique el cliente y la ruta completa del servicio de transporte.</p>
      <div class="form-section-grid">
        ${companyField}
        <label>${fieldLabel(IC.mapPin, "Departamento origen")}<select name="originDepartment" id="origin-department" required><option value="">Seleccione...</option>${departments}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad origen")}<select name="originCity" id="origin-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Origen direccion")}<input name="originAddress" required data-antares-field="db-upper" data-antares-validate-blur="db-upper" /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento destino")}<select name="destinationDepartment" id="destination-department" required><option value="">Seleccione...</option>${departments}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad destino")}<select name="destinationCity" id="destination-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Destino direccion")}<input name="destinationAddress" required data-antares-field="db-upper" data-antares-validate-blur="db-upper" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full acf-schedule-fieldset">
      <legend>${IC.calendar} Ventanas de servicio</legend>
      <p class="muted form-section-hint">Programe cuándo debe recogerse y entregarse la carga. Use el calendario o los accesos rápidos.</p>
      ${requestScheduleWindowsHtml()}
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.truck} Carga y servicio</legend>
      <p class="muted form-section-hint">Defina el tipo de servicio, refrigeración y vehículo requerido para la operación.</p>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.briefcase, "Modo de transporte", { required: true })}<select name="serviceType" id="request-service-type" required><option value="">Seleccione...</option><option value="Transporte nacional">Transporte nacional</option><option value="Transporte entre sedes del cliente">Transporte entre sedes del cliente</option></select></label>
        <label>${fieldLabel(IC.file, "Descripcion carga")}<input name="cargoDescription" required data-antares-field="db-upper" data-antares-validate-blur="db-upper" /></label>
        <label class="full">${fieldLabel(IC.truck, "Refrigeracion Termoking", { required: true })}<select name="requiresThermoking" id="request-thermoking" required><option value="">Seleccione...</option><option value="yes">Si, requiere equipo Termoking (refrigerado)</option><option value="no">No, carga seca (sin Termoking)</option></select></label>
        <label class="full">${fieldLabel(IC.truck, "Tipo de camion requerido", { required: true })}<select name="requiredTruckType" id="request-required-truck-type" required><option value="">Seleccione...</option><option value="Turbo">Turbo</option><option value="Camión">Camión</option><option value="Tractomula">Tractomula</option></select></label>
        <label class="request-truck-field request-truck-field--fuelles" hidden>${fieldLabel(IC.grid, "Cantidad de fuelles", { required: true })}<input type="number" min="0" step="1" name="fuelles" id="request-fuelles-input" /></label>
        <label class="request-truck-field request-truck-field--kg" hidden>${fieldLabel(IC.scale, "Peso kg (tractomula)", { required: true })}<input type="number" min="0" step="0.01" name="weightKg" id="request-tractomula-kg" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.user} Contacto en sitio</legend>
      <p class="muted form-section-hint">Persona de referencia en el punto de recogida o entrega.</p>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Contacto en sitio")}<input name="siteContactName" required data-antares-restrict="person-name" data-antares-field="person-name" /></label>
        <label>${fieldLabel(IC.phone, "Telefono contacto")}<input name="siteContactPhone" required data-antares-restrict="digits" data-antares-validate-blur="phone-loose" /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-slate full antares-create-form__notes">
      <legend>${IC.file} Observaciones</legend>
      <p class="muted form-section-hint">Información adicional para el equipo de operaciones (opcional).</p>
      <label class="full"><textarea name="notes" rows="3" placeholder="Instrucciones especiales, restricciones de acceso, etc." data-antares-field="db-upper-multiline" data-antares-validate-blur="db-upper-multiline"></textarea></label>
    </fieldset>
    </div>
    <footer class="antares-create-form__footer">
      ${renderManagedCreateFormActions("create-request", `<button class="btn btn-primary antares-create-form__submit" type="submit">${IC.send} Crear solicitud</button>`)}
    </footer>
  </form>`;
  }

  /** Pantalla Registrar: formulario de alta (siempre visible). */
  function requestCreateFormPanelHtml() {
    const createPanelsSeed = { ...(state.createPanels || {}) };
    if (!Object.prototype.hasOwnProperty.call(createPanelsSeed, "create-request")) {
      createPanelsSeed["create-request"] = true;
    }
    const requestsCreateUi = buildModuleCreatePanelsState(["create-request"], "create-request", createPanelsSeed);
    return createHrActionCard(
      "create-request",
      "plus",
      "Nueva solicitud de viaje",
      "Selecciona origen, destino, fecha y hora de forma guiada",
      requestCreateFormBodyHtml(),
      "Abrir formulario",
      { createPanels: requestsCreateUi }
    );
  }

  /** Compatibilidad: solo el panel de creación. */
  function requestCreateFormHtml() {
    return requestCreateFormPanelHtml();
  }

  /** Compatibilidad: cabecera + formulario en un solo bloque (orden antiguo). */
  function requestFormHtml() {
    return requestModuleHeadHtml() + requestCreateFormHtml();
  }

  /** Texto para filtrar solicitudes por búsqueda (coincide con `requests-list-search`). */
  function requestListSearchHaystack(r) {
    const trip = r.trip || null;
    const route =
      typeof formatRoute === "function"
        ? String(formatRoute(r) || "")
        : `${String(r.originCity || "")} ${String(r.destinationCity || "")}`;
    return [
      r.requestNumber,
      r.id,
      r.clientName,
      r.originCity,
      r.originDepartment,
      r.destinationCity,
      r.destinationDepartment,
      r.cargoDescription,
      r.status,
      r.requestedByName,
      trip?.tripNumber,
      trip?.vehiclePlate,
      trip?.driverName,
      route
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function requestListClientHtml(user) {
    const requests = getVisibleRequestsForUser(user);
    let activeFilter = "all";
    try {
      activeFilter = String((typeof state !== "undefined" && state?.requestsFilter) || "all");
    } catch (_) {
      /* noop */
    }
    let listSearchRaw = "";
    let listSearchNorm = "";
    let listLayout = "cards";
    try {
      listSearchRaw = String((typeof state !== "undefined" && state?.requestsUi?.listSearch) || "");
      listSearchNorm = listSearchRaw.trim().toLowerCase();
      listLayout = normalizeRequestsListLayout(typeof state !== "undefined" && state?.requestsUi?.listLayout);
    } catch (_) {
      /* noop */
    }

    if (user?.role === ROLES.ADMIN) {
      let selectedCompanyId = "";
      try {
        selectedCompanyId = String(
          (typeof state !== "undefined" && state?.requestsUi?.companyId) ||
            window.AppModules?.solicitudes?.adminCompanyFilterId ||
            ""
        );
      } catch (_) {
        selectedCompanyId = String(window.AppModules?.solicitudes?.adminCompanyFilterId || "");
      }
      const companies = read(KEYS.companies, []);
      const selectedCompany = companies.find((c) => String(c.id) === selectedCompanyId) || null;
      const byCompany = selectedCompanyId
        ? requests.filter((r) => String(r.clientCompanyId || "") === selectedCompanyId)
        : requests;
      const statusFiltered = applyRequestFilter(byCompany, activeFilter);
      const afterFilter = listSearchNorm
        ? statusFiltered.filter((r) => requestListSearchHaystack(r).includes(listSearchNorm))
        : statusFiltered;
      const companyCount = Object.keys(
        requests.reduce((acc, r) => ({ ...acc, [r.clientCompanyId || ""]: true }), {})
      ).filter(Boolean).length;
      const hub = requestAdminCompanySidebarHtml(requests, selectedCompanyId);
      const filtersBar = requestFiltersBarHtml(byCompany, activeFilter);
      const toolbarHtml = requestDataToolbarHtml(filtersBar, listSearchRaw, listLayout);
      const resultsHtml = requestOpsCardsHtml(afterFilter, user, listLayout);
      const scopeBadge = selectedCompany
        ? `<span class="requests-data-scope-badge requests-data-scope-badge--active">${IC.briefcase} ${escapeHtml(selectedCompany.name || "Cliente")}</span>`
        : `<span class="requests-data-scope-badge">${IC.briefcase} Vista multiempresa</span>`;
      const headActions = `<div class="requests-data-head__actions">
        ${scopeBadge}
        <button type="button" class="btn btn-sm btn-outline" data-action="request-company-clear" ${selectedCompanyId ? "" : "disabled"}>${IC.x} Limpiar filtro</button>
      </div>`;
      const headHtml = requestDataHeadHtml({
        eyebrow: "Bandeja operativa",
        title: selectedCompany ? selectedCompany.name || "Cliente" : "Todas las solicitudes",
        meta: selectedCompany
          ? "Solicitudes de transporte del cliente seleccionado."
          : "Resumen consolidado de solicitudes por empresa.",
        actionsHtml: headActions
      });
      const resultMetaHtml = requestDataResultMetaHtml(afterFilter.length, byCompany.length, {
        listSearchNorm,
        listLayout,
        scopeLabel: selectedCompany ? "cliente filtrado" : "todas las empresas"
      });
      return requestDataConsultShell({
        user,
        headHtml,
        toolbarHtml,
        resultMetaHtml,
        resultsHtml,
        adminHubHtml: hub,
        companyCount
      });
    }

    const panelTitle =
      typeof clientRequestsScopePrimaryLabel === "function" ? clientRequestsScopePrimaryLabel() : "Mis solicitudes";
    const statusFiltered = applyRequestFilter(requests, activeFilter);
    const filtered = listSearchNorm
      ? statusFiltered.filter((r) => requestListSearchHaystack(r).includes(listSearchNorm))
      : statusFiltered;
    const filtersBar = requestFiltersBarHtml(requests, activeFilter);
    const toolbarHtml = requestDataToolbarHtml(filtersBar, listSearchRaw, listLayout);
    const resultsHtml = requestOpsCardsHtml(filtered, user, listLayout);
    const headHtml = requestDataHeadHtml({
      eyebrow: "Bandeja operativa",
      title: panelTitle,
      meta: "Seguimiento de solicitudes, estados y viajes asociados."
    });
    const resultMetaHtml = requestDataResultMetaHtml(filtered.length, requests.length, {
      listSearchNorm,
      listLayout,
      scopeLabel: activeFilter === "all" ? "todos los estados" : "filtro activo"
    });
    return requestDataConsultShell({
      user,
      headHtml,
      toolbarHtml,
      resultMetaHtml,
      resultsHtml
    });
  }

  /** Vista principal: Registrar | Consultar (mismo patrón que Gestión humana). */
  function requestsHtml(user) {
    const requestsUi = state.requestsUi || { workspace: "operate" };
    const requestsWorkspace =
      typeof normalizeHrWorkspace === "function"
        ? normalizeHrWorkspace("requests", requestsUi.workspace)
        : String(requestsUi.workspace || "operate") === "data"
          ? "data"
          : "operate";
    const moduleHead = requestModuleHeadHtml();
    const requestsTabsNav = renderHrWorkspaceTabs({
      module: "requests",
      ariaLabel: "Secciones del módulo Solicitudes",
      activeId: requestsWorkspace,
      variant: "switch",
      tabs: [
        { id: "operate", label: "Registrar", icon: "plus", hint: "Nueva solicitud de viaje" },
        { id: "data", label: "Consultar", icon: "eye", hint: "Listado y filtros" }
      ]
    });
    const workspaceHeader = renderHrWorkspaceHeader(moduleHead, requestsTabsNav, "payroll");
    const operatePanel = `<div class="hr-workspace-panel requests-workspace-panel${requestsWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-requests-panel="operate">
      <section class="req-operate req-operate-panel">
        <aside class="req-operate__rail" aria-label="Tipo de registro">
          <p class="req-operate__rail-label">Tipo de trámite</p>
          ${renderRequestsOperateSectionNav()}
        </aside>
        <div class="req-operate__main">${requestCreateFormPanelHtml()}</div>
      </section>
    </div>`;
    const dataPanel = `<div class="hr-workspace-panel requests-workspace-panel${requestsWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-requests-panel="data">
      ${requestListClientHtml(user)}
    </div>`;
    return `<section class="requests-studio requests-shell requests-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(requestsWorkspace)}">${workspaceHeader}
      <div class="hr-workspace-panels">
        ${operatePanel}
        ${dataPanel}
      </div>
    </section>`;
  }

  window.AppModules.solicitudes.requestModuleHeadHtml = requestModuleHeadHtml;
  window.AppModules.solicitudes.requestCreateFormHtml = requestCreateFormHtml;
  window.AppModules.solicitudes.requestFormHtml = requestFormHtml;
  window.AppModules.solicitudes.requestListClientHtml = requestListClientHtml;
  window.AppModules.solicitudes.requestsHtml = requestsHtml;
})();
