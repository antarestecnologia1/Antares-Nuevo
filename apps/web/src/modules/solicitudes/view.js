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
      const headToolbar = `<div class="toolbar request-admin-toolbar">
        <span class="muted">${selectedCompany ? `Empresa seleccionada: ${escapeHtml(selectedCompany.name || "Cliente")}` : "Vista general multiempresa"}</span>
        <button class="btn btn-sm btn-outline" data-action="request-company-clear" ${selectedCompanyId ? "" : "disabled"}>${IC.x} Ver todas</button>
      </div>`;
      const body = rows
        ? `${headToolbar}<div class="table-wrap trips-table-wrap requests-table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : emptyState(selectedCompany ? "No hay solicitudes para esta empresa." : "Aun no hay solicitudes creadas.");
      return `${pcardWrap("briefcase", "Panel de solicitudes por cliente", `${requests.length} solicitudes totales`, hub)}${pcardWrap("file", selectedCompany ? `Solicitudes · ${selectedCompany.name || "Cliente"}` : "Todas las solicitudes", `${filtered.length} registradas`, body)}`;
    }
    const rows = requestRowsHtml(requests, user);
    const body = rows
      ? `<div class="table-wrap trips-table-wrap requests-table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : emptyState("Aun no hay solicitudes creadas.");
    return pcardWrap("file", "Mis solicitudes", requests.length + " registradas", body);
  }

  window.AppModules.solicitudes.requestFormHtml = requestFormHtml;
  window.AppModules.solicitudes.requestListClientHtml = requestListClientHtml;
})();
