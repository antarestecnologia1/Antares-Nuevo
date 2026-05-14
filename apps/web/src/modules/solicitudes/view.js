(function registerSolicitudesModule() {
  if (!window.AppModules) window.AppModules = {};
  if (!window.AppModules.solicitudes) window.AppModules.solicitudes = {};

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
   * Convierte una solicitud en una tarjeta moderna del panel operativo.
   * Esta tarjeta es ahora la vista única del módulo: incluye todas las
   * acciones (detalle, editar, cancelar, eliminar) — ya no hay tabla densa
   * duplicando información.
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
    const weight = parseNum(r.weightKg).toLocaleString("es-CO");
    const boxes = parseNum(r.boxes ?? r.boxesCount).toLocaleString("es-CO");
    const tripAssigned = Boolean(r.trip);
    const valueDd = tripAssigned
      ? `$${parseNum(r.tripValue || r.insuredValue || 0).toLocaleString("es-CO")}`
      : `<span class="muted">${escapeHtml("Pendiente")}</span>`;
    const requestedBy = String(r.requestedByName || "").trim();
    const tripBadge = r.trip
      ? `<p class="trip-ops-card-standby request-ops-card-trip"><span class="request-ops-card-trip-ico">${IC.truck}</span><span>Viaje <strong>${escapeHtml(String(r.trip.tripNumber || "-"))}</strong> · ${escapeHtml(String(r.trip.vehiclePlate || "-"))} · <span class="muted">${escapeHtml(String(r.trip.driverName || "-"))}</span></span></p>`
      : "";
    return `<article class="trip-ops-card trip-ops-card--${escapeAttr(statusSlug)} request-ops-card" data-request-id="${escapeAttr(String(r.id || ""))}">
      <header class="trip-ops-card-head">
        <div class="trip-ops-card-head-main">
          ${clientLogoHtml}
          <div class="trip-ops-card-head-info">
            <p class="trip-ops-card-kicker">Solicitud ${escapeHtml(String(r.requestNumber || r.id || "-"))}${requestedBy ? ` · ${escapeHtml(requestedBy)}` : ""}</p>
            <h4 class="trip-ops-card-title" title="${escapeAttr(clientName)}">${escapeHtml(clientName)}</h4>
          </div>
        </div>
        <span class="trip-ops-card-status trip-ops-card-status--${escapeAttr(statusSlug)}">${prettyStatus(r.status, "request")}</span>
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
        <div class="trip-ops-card-item"><dt>${IC.file}<span>Carga</span></dt><dd title="${escapeAttr(cargoLabel)}">${escapeHtml(cargoLabel)}</dd></div>
        <div class="trip-ops-card-item"><dt>${IC.scale}<span>Peso/Cajas</span></dt><dd>${weight} kg · ${boxes}</dd></div>
        <div class="trip-ops-card-item"><dt>${IC.calendar}<span>Recogida</span></dt><dd>${escapeHtml(pickupLabel)}</dd></div>
        <div class="trip-ops-card-item trip-ops-card-item--value"><dt>${IC.dollar}<span>Valor</span></dt><dd>${valueDd}</dd></div>
      </dl>
      ${tripBadge}
      <div class="toolbar trip-ops-card-actions">
        <button class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(String(r.id || ""))}" title="Ver detalle completo de la solicitud">${IC.eye} Detalle</button>
        ${allowEdit ? `<button class="btn btn-sm btn-outline" data-action="edit-request" data-id="${escapeAttr(String(r.id || ""))}" title="Editar la solicitud">${IC.edit} Editar</button>` : ""}
        ${allowEdit && !r.trip ? `<button class="btn btn-sm btn-reject" data-action="cancel-request" data-id="${escapeAttr(String(r.id || ""))}" title="Marcar solicitud como cancelada">${IC.x} Cancelar</button>` : ""}
        ${allowClientHardDeletePending ? `<button class="btn btn-sm btn-reject" data-action="delete-client-request" data-id="${escapeAttr(String(r.id || ""))}" title="Eliminar solicitud antes de aprobacion">${IC.trash} Eliminar</button>` : ""}
        ${isAdmin
          ? `<button class="btn btn-sm btn-reject" data-action="delete-admin" data-id="${escapeAttr(String(r.id || ""))}" title="Solo administradores: eliminar (si hay viaje, se desasigna primero con el mismo motivo)">${IC.trash} Eliminar</button>`
          : ""}
      </div>
    </article>`;
  }

  /**
   * Renderiza el grid completo de solicitudes como tarjetas (vista única).
   * @param {Array} requests lista ya filtrada
   * @param {Object} user usuario actual
   */
  function requestOpsCardsHtml(requests, user) {
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
    return `<div class="trip-ops-cards request-ops-cards">${sorted.map((r) => buildRequestOpsCard(r, user)).join("")}</div>`;
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
    return `<div class="ops-filters-bar">
      ${pill("all", "Todas", counts.all)}
      ${pill("pending", "Pendientes", counts.pending)}
      ${pill("active", "En operación", counts.active)}
      ${pill("closed", "Cerradas", counts.closed)}
      ${pill("cancelled", "Canceladas", counts.cancelled)}
    </div>`;
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

  function requestAdminCompanyHubHtml(requests, selectedCompanyId) {
    const companies = read(KEYS.companies, []);
    const grouped = requests.reduce((acc, req) => {
      const cid = String(req.clientCompanyId || "");
      if (!cid) return acc;
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push(req);
      return acc;
    }, {});
    const cards = Object.entries(grouped)
      .map(([companyId, list]) => {
        const company = companies.find((c) => String(c.id) === companyId) || null;
        const name = company?.name || list[0]?.clientName || "Empresa sin nombre";
        const logoFromReq = list.map((x) => resolveRequestCompanyLogoUrl(x, company)).find((u) => u) || "";
        const logoUrl = logoFromReq || String(company?.logoUrl || "").trim();
        const logoHtml = logoUrl
          ? `<span class="request-company-hub-logo" role="img" aria-label="Logo de ${escapeAttr(name)}"><img src="${escapeAttr(logoUrl)}" alt="Logo de ${escapeAttr(name)}" loading="lazy" /></span>`
          : `<span class="request-company-hub-logo request-company-hub-logo--fallback" aria-hidden="true">${escapeHtml(String(name || "E").charAt(0).toUpperCase())}</span>`;
        const pending = list.filter((r) =>
          [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status)
        ).length;
        const active = list.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
        const closed = list.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
        const isSelected = String(selectedCompanyId || "") === String(companyId);
        /**
         * Toda el área del card (logo + nombre + métricas) actúa como botón
         * — `data-action="request-company-filter"`. Esto cumple con el pedido
         * del usuario: hacer click en el logo del cliente filtra al instante.
         */
        return `<article class="request-company-hub-card${isSelected ? " is-active" : ""}" data-action="request-company-filter" data-company-id="${escapeAttr(companyId)}" role="button" tabindex="0" aria-pressed="${isSelected ? "true" : "false"}" title="Ver solo solicitudes de ${escapeAttr(name)}">
          <header>
            <div class="request-company-hub-head">${logoHtml}<div class="request-company-hub-titlestack"><h4>${escapeHtml(name)}</h4><span class="status ${pending ? "status-pendiente" : "status-viaje_asignado"}">${pending ? `${pending} pendientes` : "Al día"}</span></div></div>
          </header>
          <div class="request-company-hub-metrics">
            <span><strong>${list.length}</strong><small>Solicitudes</small></span>
            <span><strong>${active}</strong><small>En operación</small></span>
            <span><strong>${closed}</strong><small>Cerradas</small></span>
          </div>
          <p class="request-company-hub-cta">${isSelected ? `${IC.check} Filtro activo` : `${IC.eye} Click para filtrar`}</p>
        </article>`;
      })
      .join("");
    return cards
      ? `<div class="request-company-hub-grid">${cards}</div>`
      : `<p class="muted">No hay solicitudes agrupables por empresa todavía.</p>`;
  }

  function requestFormHtml() {
    const user = currentUser();
    const list = getVisibleRequestsForUser(user);
    const pend = list.filter((r) => [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status)).length;
    const conViaje = list.filter((r) => r.trip).length;
    const enOp = list.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
    const clientHero = moduleFleetHeroStrip([
      { label: "Mis solicitudes", value: list.length },
      { label: "Con viaje", value: conViaje },
      { label: "En operacion", value: enOp },
      { label: "Pendientes", value: pend, tone: pend ? "warn" : undefined }
    ]);
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
    const body = `<form id="form-request" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.briefcase} Empresa y ruta</legend>
      <div class="form-section-grid">
        ${companyField}
        <label>${fieldLabel(IC.mapPin, "Departamento origen")}<select name="originDepartment" id="origin-department" required><option value="">Seleccione...</option>${departments}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad origen")}<select name="originCity" id="origin-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Origen direccion")}<input name="originAddress" required /></label>
        <label>${fieldLabel(IC.mapPin, "Departamento destino")}<select name="destinationDepartment" id="destination-department" required><option value="">Seleccione...</option>${departments}</select></label>
        <label>${fieldLabel(IC.mapPin, "Ciudad destino")}<select name="destinationCity" id="destination-city" required><option value="">Seleccione un departamento...</option></select></label>
        <label class="full">${fieldLabel(IC.compass, "Destino direccion")}<input name="destinationAddress" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-violet full">
      <legend>${IC.calendar} Ventanas de servicio</legend>
      <div class="form-section-grid datetime-group">
        <label>${fieldLabel(IC.calendar, "Fecha de recogida")}<input type="date" name="pickupDate" id="pickup-date" required /></label>
        <label>${fieldLabel(IC.clock, "Hora de recogida")}<input type="time" name="pickupTime" id="pickup-time" required /></label>
        <label>${fieldLabel(IC.calendar, "Fecha de entrega")}<input type="date" name="deliveryDate" id="delivery-date" required /></label>
        <label>${fieldLabel(IC.clock, "Hora de entrega")}<input type="time" name="deliveryTime" id="delivery-time" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.truck} Carga y servicio</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.briefcase, "Modo de transporte", { required: true })}<select name="serviceType" id="request-service-type" required><option value="">Seleccione...</option><option value="Transporte nacional">Transporte nacional</option><option value="Transporte entre sedes del cliente">Transporte entre sedes del cliente</option></select></label>
        <label>${fieldLabel(IC.file, "Descripcion carga")}<input name="cargoDescription" required /></label>
        <label class="full">${fieldLabel(IC.truck, "Refrigeracion Termoking", { required: true })}<select name="requiresThermoking" id="request-thermoking" required><option value="">Seleccione...</option><option value="yes">Si, requiere equipo Termoking (refrigerado)</option><option value="no">No, carga seca (sin Termoking)</option></select></label>
        <label>${fieldLabel(IC.grid, "Volumen cajas")}<input type="number" min="0" name="boxes" required /></label>
        <label>${fieldLabel(IC.scale, "Peso kg")}<input type="number" min="0" name="weightKg" required /></label>
      </div>
    </fieldset>
    <fieldset class="form-section form-section-amber full">
      <legend>${IC.user} Contacto en sitio</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.user, "Contacto en sitio")}<input name="siteContactName" required /></label>
        <label>${fieldLabel(IC.phone, "Telefono contacto")}<input name="siteContactPhone" required /></label>
      </div>
    </fieldset>
    <label class="full">Observaciones <textarea name="notes" rows="3"></textarea></label>
    <label class="full">Adjuntos opcionales <input type="file" name="attachments" multiple /></label>
    <button class="btn btn-primary full" type="submit">${IC.send} Crear solicitud</button>
  </form>`;
    return clientHero + createCollapsibleCard("create-request", "plus", "Nueva solicitud de viaje", "Selecciona origen, destino, fecha y hora de forma guiada", body, "Crear solicitud");
  }

  function requestListClientHtml(user) {
    const requests = getVisibleRequestsForUser(user);
    /**
     * Lectura defensiva de state.requestsFilter: ambos scripts comparten el
     * mismo script-scope (classic <script>), pero protegemos con try/catch
     * por si en algún flujo se llama antes de inicializar el state.
     */
    let activeFilter = "all";
    try { activeFilter = String((typeof state !== "undefined" && state?.requestsFilter) || "all"); } catch (_) { /* noop */ }
    if (user?.role === ROLES.ADMIN) {
      const selectedCompanyId = String(window.AppModules?.solicitudes?.adminCompanyFilterId || "");
      const companies = read(KEYS.companies, []);
      const selectedCompany = companies.find((c) => String(c.id) === selectedCompanyId) || null;
      const byCompany = selectedCompanyId
        ? requests.filter((r) => String(r.clientCompanyId || "") === selectedCompanyId)
        : requests;
      const afterFilter = applyRequestFilter(byCompany, activeFilter);
      const hub = requestAdminCompanyHubHtml(requests, selectedCompanyId);
      const filtersBar = requestFiltersBarHtml(byCompany, activeFilter);
      const opsCards = requestOpsCardsHtml(afterFilter, user);
      const headToolbar = `<div class="toolbar request-admin-toolbar">
        <span class="request-admin-toolbar-status">${selectedCompany ? `${IC.briefcase} Filtrando por: <strong>${escapeHtml(selectedCompany.name || "Cliente")}</strong>` : `${IC.briefcase} Vista general multiempresa`}</span>
        <button class="btn btn-sm btn-outline" data-action="request-company-clear" ${selectedCompanyId ? "" : "disabled"}>${IC.x} Ver todas las empresas</button>
      </div>`;
      const opsTitle = selectedCompany ? `Solicitudes · ${selectedCompany.name || "Cliente"}` : "Todas las solicitudes";
      const opsSubtitle = `${afterFilter.length} de ${byCompany.length} ${selectedCompany ? "del cliente" : "totales"}`;
      const opsPanel = pcardWrap("activity", opsTitle, opsSubtitle, `${headToolbar}${filtersBar}${opsCards}`);
      const delLog =
        typeof window.AppLegacyViews?.deletedTransportRequestsLogSection === "function"
          ? window.AppLegacyViews.deletedTransportRequestsLogSection()
          : "";
      return `${pcardWrap("briefcase", "Panel de empresas clientes", `${Object.keys(requests.reduce((acc, r) => ({ ...acc, [r.clientCompanyId || ""]: true }), {})).filter(Boolean).length} empresas activas`, hub)}${opsPanel}${delLog}`;
    }
    const filtered = applyRequestFilter(requests, activeFilter);
    const filtersBar = requestFiltersBarHtml(requests, activeFilter);
    const opsCards = requestOpsCardsHtml(filtered, user);
    const opsPanel = pcardWrap("activity", "Mis solicitudes", `${filtered.length} de ${requests.length} registradas`, `${filtersBar}${opsCards}`);
    return opsPanel;
  }

  window.AppModules.solicitudes.requestFormHtml = requestFormHtml;
  window.AppModules.solicitudes.requestListClientHtml = requestListClientHtml;
})();
