(function registerSolicitudesModule() {
  if (!window.AppModules) window.AppModules = {};
  if (!window.AppModules.solicitudes) window.AppModules.solicitudes = {};

  function requestRowsHtml(requests, user) {
    return requests
      .map((r) => {
        const allowEdit = canClientManageRequest(r);
        const trip = r.trip
          ? `<strong>${r.trip.tripNumber}</strong><br><span class="muted">${r.trip.vehiclePlate} · ${r.trip.driverName}</span>`
          : '<span class="muted">-</span>';
        return `<tr>
          <td><strong>${r.requestNumber || r.id}</strong></td>
          <td>${formatRoute(r)}<br><span class="muted">Creada por: ${r.requestedByName || r.clientName}</span></td>
          <td>${prettyStatus(r.status, "request")}</td>
          <td>${trip}</td>
          <td><div class="toolbar">
            <button class="btn btn-sm btn-action" data-action="detail" data-id="${r.id}">${IC.eye} Ver</button>
            ${allowEdit ? `<button class="btn btn-sm btn-action" data-action="edit" data-id="${r.id}">${IC.edit} Editar</button>` : ""}
            ${allowEdit ? `<button class="btn btn-sm btn-reject" data-action="cancel" data-id="${r.id}">${IC.x} Cancelar</button>` : ""}
            ${user?.role === ROLES.ADMIN ? `<button class="btn btn-sm btn-reject" data-action="delete-admin" data-id="${r.id}">${IC.trash} Eliminar</button>` : ""}
          </div></td>
        </tr>`;
      })
      .join("");
  }

  /**
   * Panel operativo de solicitudes: replica el look de "Panel operativo de viajes" para
   * que las solicitudes vigentes (pendientes, aprobadas, con viaje activo) se vean en
   * tarjetas modernas — sin desbordes — antes de la tabla densa. Comparte estilos con
   * `.trip-ops-card*` para mantener consistencia visual entre módulos.
   */
  function requestOpsCardsHtml(requests, user) {
    const activeStatuses = new Set([STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION]);
    const tripActive = typeof activeTripStatuses === "function" ? new Set(activeTripStatuses()) : new Set();
    const opsRequests = requests
      .filter((r) => activeStatuses.has(r.status) || (r.trip && tripActive.has(r.status)))
      .sort((a, b) => {
        const ta = new Date(
          a?.trip?.etaPickup || a?.pickupDate || a?.createdAt || 0
        ).getTime();
        const tb = new Date(
          b?.trip?.etaPickup || b?.pickupDate || b?.createdAt || 0
        ).getTime();
        return ta - tb;
      })
      .slice(0, 8);
    if (!opsRequests.length) {
      return emptyState("No hay solicitudes activas para mostrar en panel.");
    }
    const companies = read(KEYS.companies, []);
    const cards = opsRequests
      .map((r) => {
        const allowEdit = canClientManageRequest(r);
        const isAdmin = user?.role === ROLES.ADMIN;
        const company = companies.find((c) => String(c.id) === String(r.clientCompanyId || "")) || null;
        const clientName = String(r.clientName || company?.name || "Cliente").trim() || "Cliente";
        const statusSlug = typeof slugStatus === "function" ? slugStatus(r.status) : String(r.status || "").replace(/\W+/g, "-").toLowerCase();
        const originCity = String(r.originCity || r.originDepartment || "Origen").trim() || "Origen";
        const destinationCity = String(r.destinationCity || r.destinationDepartment || "Destino").trim() || "Destino";
        const pickupLabel = fmtDate(r.trip?.etaPickup || r.pickupDate || "") || "Sin fecha";
        const cargoLabel = String(r.cargoDescription || "Carga").trim() || "Carga";
        const weight = parseNum(r.weightKg).toLocaleString("es-CO");
        const boxes = parseNum(r.boxes ?? r.boxesCount).toLocaleString("es-CO");
        const insuredValue = parseNum(r.tripValue || r.insuredValue || 0).toLocaleString("es-CO");
        const tripBadge = r.trip
          ? `<p class="trip-ops-card-standby" style="background:linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.08));border-color:rgba(5,150,105,0.35);color:#0a6b3a">${IC.truck}<span>Viaje <strong>${escapeHtml(String(r.trip.tripNumber || "-"))}</strong> · ${escapeHtml(String(r.trip.vehiclePlate || "-"))}</span></p>`
          : "";
        return `<article class="trip-ops-card trip-ops-card--${escapeAttr(statusSlug)}" data-request-id="${escapeAttr(String(r.id || ""))}">
          <header class="trip-ops-card-head">
            <div class="trip-ops-card-head-info">
              <p class="trip-ops-card-kicker">Solicitud ${escapeHtml(String(r.requestNumber || r.id || "-"))}${r.requestedByName ? ` · ${escapeHtml(String(r.requestedByName))}` : ""}</p>
              <h4 class="trip-ops-card-title" title="${escapeAttr(clientName)}">${escapeHtml(clientName)}</h4>
            </div>
            <span class="trip-ops-card-status trip-ops-card-status--${escapeAttr(statusSlug)}">${prettyStatus(r.status, "request")}</span>
          </header>
          <div class="trip-ops-card-route">
            <span class="trip-ops-card-route-node trip-ops-card-route-node--origin" title="${escapeAttr(originCity)}">
              <span class="trip-ops-card-route-label">Origen</span>
              <strong>${escapeHtml(originCity)}</strong>
            </span>
            <span class="trip-ops-card-route-arrow" aria-hidden="true">→</span>
            <span class="trip-ops-card-route-node trip-ops-card-route-node--dest" title="${escapeAttr(destinationCity)}">
              <span class="trip-ops-card-route-label">Destino</span>
              <strong>${escapeHtml(destinationCity)}</strong>
            </span>
          </div>
          <dl class="trip-ops-card-grid">
            <div class="trip-ops-card-item"><dt>${IC.file}<span>Carga</span></dt><dd title="${escapeAttr(cargoLabel)}">${escapeHtml(cargoLabel)}</dd></div>
            <div class="trip-ops-card-item"><dt>${IC.scale}<span>Peso/Cajas</span></dt><dd>${weight} kg · ${boxes}</dd></div>
            <div class="trip-ops-card-item"><dt>${IC.calendar}<span>Recogida</span></dt><dd>${escapeHtml(pickupLabel)}</dd></div>
            <div class="trip-ops-card-item trip-ops-card-item--value"><dt>${IC.dollar}<span>Valor</span></dt><dd>$${insuredValue}</dd></div>
          </dl>
          ${tripBadge}
          <div class="toolbar trip-ops-card-actions">
            <button class="btn btn-sm btn-action" data-action="detail" data-id="${escapeAttr(String(r.id || ""))}" title="Ver detalle completo de la solicitud">${IC.eye} Detalle</button>
            ${allowEdit ? `<button class="btn btn-sm btn-outline" data-action="edit" data-id="${escapeAttr(String(r.id || ""))}" title="Editar la solicitud">${IC.edit} Editar</button>` : ""}
            ${isAdmin && !r.trip ? `<button class="btn btn-sm btn-reject" data-action="cancel" data-id="${escapeAttr(String(r.id || ""))}" title="Cancelar la solicitud">${IC.x} Cancelar</button>` : ""}
          </div>
        </article>`;
      })
      .join("");
    return `<div class="trip-ops-cards request-ops-cards">${cards}</div>`;
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
        const logoUrl = String(company?.logoUrl || "").trim();
        const logoHtml = logoUrl
          ? `<span class="request-company-hub-logo" role="img" aria-label="Logo de ${escapeAttr(name)}"><img src="${escapeAttr(logoUrl)}" alt="Logo de ${escapeAttr(name)}" loading="lazy" /></span>`
          : `<span class="request-company-hub-logo request-company-hub-logo--fallback" aria-hidden="true">${escapeHtml(String(name || "E").charAt(0).toUpperCase())}</span>`;
        const pending = list.filter((r) =>
          [STATUS.PENDIENTE, STATUS.APROBADA_PENDIENTE_ASIGNACION].includes(r.status)
        ).length;
        const active = list.filter((r) => r.trip && activeTripStatuses().includes(r.status)).length;
        const isSelected = String(selectedCompanyId || "") === String(companyId);
        return `<article class="request-company-hub-card${isSelected ? " is-active" : ""}">
          <header>
            <div class="request-company-hub-head">${logoHtml}<h4>${escapeHtml(name)}</h4></div>
            <span class="status ${pending ? "status-pendiente" : "status-viaje_asignado"}">${pending ? `${pending} pendientes` : "Al día"}</span>
          </header>
          <div class="request-company-hub-metrics">
            <span><strong>${list.length}</strong><small>Solicitudes</small></span>
            <span><strong>${active}</strong><small>En operación</small></span>
          </div>
          <div class="toolbar">
            <button class="btn btn-sm ${isSelected ? "btn-primary" : "btn-outline"}" data-action="request-company-filter" data-company-id="${escapeAttr(companyId)}">
              ${IC.briefcase} ${isSelected ? "Viendo" : "Ver"}
            </button>
          </div>
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
    if (user?.role === ROLES.ADMIN) {
      const selectedCompanyId = String(window.AppModules?.solicitudes?.adminCompanyFilterId || "");
      const companies = read(KEYS.companies, []);
      const selectedCompany = companies.find((c) => String(c.id) === selectedCompanyId) || null;
      const filtered = selectedCompanyId
        ? requests.filter((r) => String(r.clientCompanyId || "") === selectedCompanyId)
        : requests;
      const rows = requestRowsHtml(filtered, user);
      const hub = requestAdminCompanyHubHtml(requests, selectedCompanyId);
      const opsCards = requestOpsCardsHtml(filtered, user);
      const headToolbar = `<div class="toolbar request-admin-toolbar">
        <span class="muted">${selectedCompany ? `Empresa seleccionada: ${escapeHtml(selectedCompany.name || "Cliente")}` : "Vista general multiempresa"}</span>
        <button class="btn btn-sm btn-outline" data-action="request-company-clear" ${selectedCompanyId ? "" : "disabled"}>${IC.x} Ver todas</button>
      </div>`;
      const tableBody = rows
        ? `${headToolbar}<div class="table-wrap trips-table-wrap requests-table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : emptyState(selectedCompany ? "No hay solicitudes para esta empresa." : "Aun no hay solicitudes creadas.");
      const opsPanel = pcardWrap(
        "activity",
        "Panel operativo de solicitudes",
        `${Math.min(filtered.length, 8)} solicitudes priorizadas`,
        opsCards
      );
      const tablePanel = pcardWrap(
        "file",
        selectedCompany ? `Solicitudes · ${selectedCompany.name || "Cliente"}` : "Todas las solicitudes",
        `${filtered.length} registradas`,
        tableBody
      );
      return `${pcardWrap("briefcase", "Panel de solicitudes por cliente", `${requests.length} solicitudes totales`, hub)}${opsPanel}${tablePanel}`;
    }
    const rows = requestRowsHtml(requests, user);
    const opsCards = requestOpsCardsHtml(requests, user);
    const tableBody = rows
      ? `<div class="table-wrap trips-table-wrap requests-table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : emptyState("Aun no hay solicitudes creadas.");
    const opsPanel = pcardWrap(
      "activity",
      "Panel operativo de solicitudes",
      `${Math.min(requests.length, 8)} solicitudes priorizadas`,
      opsCards
    );
    const tablePanel = pcardWrap("file", "Mis solicitudes", requests.length + " registradas", tableBody);
    return `${opsPanel}${tablePanel}`;
  }

  window.AppModules.solicitudes.requestFormHtml = requestFormHtml;
  window.AppModules.solicitudes.requestListClientHtml = requestListClientHtml;
})();
