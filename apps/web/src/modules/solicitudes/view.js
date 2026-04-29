(function registerSolicitudesModule() {
  if (!window.AppModules) window.AppModules = {};
  if (!window.AppModules.solicitudes) window.AppModules.solicitudes = {};

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
    const body = `<form id="form-request" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.briefcase} Empresa y ruta</legend>
      <div class="form-section-grid">
        <label class="full">${fieldLabel(IC.briefcase, "Empresa asociada")}
          <input value="${escapeHtml(companyName)}" disabled />
          <input type="hidden" name="companyId" value="${escapeAttr(user?.companyId || "")}" />
        </label>
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
      <legend>${IC.truck} Carga y vehiculo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.truck, "Tipo vehiculo")}<select name="vehicleType" required><option value="">Seleccione...</option><option>Turbo</option><option>Camion</option><option>Tractocamion</option></select></label>
        <label>${fieldLabel(IC.file, "Descripcion carga")}<input name="cargoDescription" required /></label>
        <label>${fieldLabel(IC.briefcase, "Tipo de servicio")}<select name="serviceType" required><option value="">Seleccione...</option><option>Transporte nacional</option><option>Ultima milla</option><option>Carga refrigerada</option><option>Carga seca</option></select></label>
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
    <p class="muted full legal-form-note">La solicitud queda sujeta a aprobacion operativa y disponibilidad de flota.</p>
    <button class="btn btn-primary full" type="submit">${IC.send} Crear solicitud</button>
  </form>`;
    return clientHero + createCollapsibleCard("create-request", "plus", "Nueva solicitud de viaje", "Selecciona origen, destino, fecha y hora de forma guiada", body, "Crear solicitud");
  }

  function requestListClientHtml(user) {
    const requests = getVisibleRequestsForUser(user);
    const rows = requests
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
    const body = rows
      ? `<div class="table-wrap"><table><thead><tr><th>Solicitud</th><th>Ruta</th><th>Estado</th><th>Viaje</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : emptyState("Aun no hay solicitudes creadas.");
    return pcardWrap("file", "Mis solicitudes", requests.length + " registradas", body);
  }

  window.AppModules.solicitudes.requestFormHtml = requestFormHtml;
  window.AppModules.solicitudes.requestListClientHtml = requestListClientHtml;
})();
