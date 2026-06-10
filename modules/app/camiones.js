/**
 * Transporte · Camiones (`transport-vehicles`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
function normalizeVehicleFleetLayout(raw) {
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

/** Texto agregado para filtrar en la flota (insensible a mayúsculas). */
function vehicleFleetSearchHaystack(v) {
  const parts = [
    v.plate,
    v.brand,
    v.model,
    v.type,
    v.year,
    v.color,
    v.vin,
    v.engineNumber,
    v.ownershipCard,
    v.gpsProvider,
    v.bodyType,
    v.fuelType,
    v.axleConfig,
    v.capacityKg,
    v.rcPolicyContract,
    v.rcPolicyExtra
  ];
  return parts.map((x) => String(x ?? "").toLowerCase()).join(" ");
}

function vehicleMatchesFleetSearch(v, qNorm) {
  if (!qNorm) return true;
  return vehicleFleetSearchHaystack(v).includes(qNorm);
}

function vehiclesHtml() {
  const vehicles = read(KEYS.vehicles, []);
  const drivers = read(KEYS.drivers, []);
  const vehiclesUi = state.vehiclesUi || { workspace: "fleet" };
  const fleetSearchRaw = String(vehiclesUi.fleetSearch ?? "");
  const fleetSearchNorm = fleetSearchRaw.trim().toLowerCase();
  const fleetLayout = normalizeVehicleFleetLayout(vehiclesUi.fleetLayout);
  const filteredVehicles = fleetSearchNorm
    ? vehicles.filter((v) => vehicleMatchesFleetSearch(v, fleetSearchNorm))
    : vehicles;
  const canEditVeh = canEditVehicle();
  const canToggleVeh = canToggleVehicleStatus();
  const canDeleteVeh = canDeleteVehicle();
  const canCreateVeh = canCreateVehicle();
  const canFuelLogs = hasPermission(currentUser(), PERMISSIONS.TRANSPORT_HISTORY);
  const canTechnicalLogs = canFuelLogs;
  let vehicleWorkspace = normalizeVehicleWorkspaceSection(vehiclesUi.workspace);
  if (vehicleWorkspace === "create" && !canCreateVeh) vehicleWorkspace = "fleet";
  if (vehicleWorkspace === "fuel" && !canFuelLogs) vehicleWorkspace = "fleet";
  if (vehicleWorkspace === "technical" && !canTechnicalLogs) vehicleWorkspace = "fleet";
  state.vehiclesUi = {
    ...vehiclesUi,
    workspace: vehicleWorkspace,
    fleetSearch: fleetSearchRaw,
    fleetLayout
  };
  const activeTrips = getActiveTrips();
  const activeTripsByVehicleId = new Map();
  activeTrips.forEach((r) => {
    const key = String(r.trip?.vehicleId || "").trim();
    if (!key) return;
    if (!activeTripsByVehicleId.has(key)) activeTripsByVehicleId.set(key, []);
    activeTripsByVehicleId.get(key).push(r);
  });
  const nowTs = Date.now();
  const resolveVehicleOccupancy = (vehicleId) => {
    const list = activeTripsByVehicleId.get(String(vehicleId)) || [];
    if (!list.length) return { tone: "available", trip: null, detail: "Sin viaje activo" };
    const ongoing = list.find((r) => describeTripTimingVsNow(r, nowTs).timing === "ongoing") || null;
    if (ongoing) {
      const left = describeTripTimingVsNow(ongoing, nowTs).minutes;
      return {
        tone: "busy",
        trip: ongoing,
        detail: `En curso · ${left != null ? `${left} min restantes` : "Horario en curso"}`
      };
    }
    const upcoming = list
      .map((r) => ({ r, info: describeTripTimingVsNow(r, nowTs) }))
      .filter((x) => x.info.timing === "upcoming")
      .sort((a, b) => parseNum(a.info.minutes) - parseNum(b.info.minutes))[0];
    if (upcoming) {
      return {
        tone: "scheduled",
        trip: upcoming.r,
        detail: `Reservado · inicia en ${upcoming.info.minutes} min`
      };
    }
    const latestPast = list
      .map((r) => ({ r, info: describeTripTimingVsNow(r, nowTs) }))
      .filter((x) => x.info.timing === "past")
      .sort((a, b) => parseNum(a.info.minutes) - parseNum(b.info.minutes))[0];
    if (latestPast) {
      return {
        tone: "available",
        trip: latestPast.r,
        detail: `Último viaje terminó hace ${latestPast.info.minutes} min`
      };
    }
    return { tone: "available", trip: list[0] || null, detail: "Sin cruce horario activo" };
  };
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => resolveVehicleOccupancy(v.id).tone === "available" && !isManuallyUnavailable(v)).length;
  const occupiedCount = vehicles.filter((v) => resolveVehicleOccupancy(v.id).tone === "busy").length;
  const scheduledCount = vehicles.filter((v) => resolveVehicleOccupancy(v.id).tone === "scheduled").length;
  const offlineCount = vehicles.filter((v) => isManuallyUnavailable(v)).length;
  const thermokingCount = vehicles.filter((v) => vehicleHasTermokingEquipment(v)).length;
  const documentRiskCount = vehicles.filter((v) => {
    const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
    const tec = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
    return ["status-vencida", "status-rechazada", "status-pendiente"].includes(soat.cls) ||
      ["status-vencida", "status-rechazada", "status-pendiente"].includes(tec.cls);
  }).length;
  const vehicleCards = filteredVehicles
    .map((v) => {
      const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
      const tecno = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
      const isRefrigerated = vehicleHasTermokingEquipment(v);
      const occupancy = resolveVehicleOccupancy(v.id);
      const availabilityTag = isManuallyUnavailable(v)
        ? '<span class="status status-fleet-offline">No disponible</span>'
        : occupancy.tone === "busy"
          ? '<span class="status status-fleet-ocupado">Ocupado</span>'
          : occupancy.tone === "scheduled"
            ? '<span class="status status-fleet-programado">Reservado</span>'
            : '<span class="status status-fleet-disponible">Disponible</span>';
      const occupancySlug = isManuallyUnavailable(v)
        ? "no-disponible"
        : occupancy.tone === "busy"
          ? "ocupado"
          : occupancy.tone === "scheduled"
            ? "reservado"
            : "disponible";
      const plate = String(v.plate || "—").toUpperCase();
      const typeLabel = String(v.type || "Vehículo").trim() || "Vehículo";
      const brandModel = `${String(v.brand || "").trim()}${v.brand && v.model ? " · " : ""}${String(v.model || "").trim()}${v.year ? ` · ${v.year}` : ""}`.trim() || "Sin marca/modelo";
      const soatTone = directoryToneFromBucket(soat.cls);
      const tecnoTone = directoryToneFromBucket(tecno.cls);
      const gpsEnabled = String(v.hasGps ?? "true").trim().toLowerCase() !== "false";
      const gpsProvider = String(v.gpsProvider || "").trim();
      const gpsLabel = gpsEnabled ? (gpsProvider || "GPS activo") : "Sin GPS";
      const occupancyTitle = occupancy.trip
        ? `Viaje ${String(occupancy.trip.trip?.tripNumber || "-")}`
        : isManuallyUnavailable(v)
          ? "No disponible"
          : occupancy.tone === "scheduled"
            ? "Reservado"
            : "Disponible";
      const occupancyDetail = occupancy.trip
        ? String(occupancy.trip.clientName || occupancy.trip.companyName || occupancy.trip.request?.clientName || "").trim() || occupancy.detail
        : occupancy.detail;
      const opsTone = isManuallyUnavailable(v) ? "alert" : directoryOpsToneFromSlug(occupancySlug);
      const capacityLabel = parseNum(v.capacityKg) > 0 ? `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "Sin capacidad";
      const ownershipCardLabel = String(v.ownershipCard || "").trim() || "Sin tarjeta";
      const motorLabel = String(v.engineNumber || "").trim() || "Sin motor";
      const vinLabel = String(v.vin || "").trim() || "Sin VIN";
      return `<article class="directory-card directory-card--vehicle directory-card--${occupancySlug}" data-vehicle-id="${escapeAttr(String(v.id || ""))}">
        <header class="directory-card__head">
          <div class="directory-card__identity">
            ${renderColombianPlateBadgeHtml(plate)}
            <div class="directory-card__heading">
              <p class="directory-card__kicker">${escapeHtml(typeLabel)}</p>
              <h4 class="directory-card__title" title="${escapeAttr(plate)}">${escapeHtml(brandModel)}</h4>
            </div>
          </div>
          <div class="directory-card__status-stack">
            ${availabilityTag}
            ${directoryPillHtml(isRefrigerated ? "Termoking" : "Seco", isRefrigerated ? "ok" : "neutral")}
          </div>
        </header>
        ${directoryOpsHtml(occupancyTitle, occupancyDetail, opsTone)}
        <div class="directory-card__metrics">
          ${directoryChipHtml("Cap.", capacityLabel)}
          ${directoryChipHtml("SOAT", soat.label, soatTone)}
          ${directoryChipHtml("Tecno", tecno.label, tecnoTone)}
          ${directoryChipHtml("GPS", gpsEnabled ? "Activo" : "No", gpsEnabled ? "ok" : "warn")}
        </div>
        <dl class="directory-card__facts">
          ${directoryFactHtml("Tarjeta", ownershipCardLabel)}
          ${directoryFactHtml("Motor", motorLabel)}
          ${directoryFactHtml("VIN", vinLabel)}
          ${directoryFactHtml("Trazabilidad", gpsLabel)}
        </dl>
        <footer class="directory-card__actions">
          <button type="button" class="btn btn-sm btn-outline" data-action="view-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Ver ficha técnica del vehículo">${IC.eye} Ver</button>
          ${canEditVeh ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Editar datos del vehículo">${IC.edit} Editar</button>` : ""}
          ${canToggleVeh ? `<button type="button" class="btn btn-sm btn-action" data-action="toggle-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Alternar disponibilidad manual">${IC.toggle} Estado</button>` : ""}
          ${canDeleteVeh ? `<button class="btn btn-sm btn-reject" data-action="delete-vehicle" data-id="${v.id}" title="Eliminar del catálogo">${IC.trash} Eliminar</button>` : ""}
        </footer>
      </article>`;
    })
    .join("");
  const bodyTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.bodyTypes);
  const fuelTypeOptions = selectOptionsFromCatalog(CO_CATALOGS.fuelTypes);
  const axleOptions = selectOptionsFromCatalog(CO_CATALOGS.axleConfig);
  const colorOptions = selectOptionsFromCatalog(CO_CATALOGS.vehicleColors);
  const vehicleSelectOptions = vehicles
    .map((v) => `<option value="${escapeAttr(String(v.id || ""))}">${escapeHtml(`${String(v.plate || "").toUpperCase()} · ${String(v.type || "Vehículo")}`)}</option>`)
    .join("");
  const driverSelectOptions = drivers
    .map((d) => `<option value="${escapeAttr(String(d.id || ""))}">${escapeHtml(String(d.name || "Conductor"))}</option>`)
    .join("");
  const todayIsoDate = nowIso().slice(0, 10);
  const fuelLogsCount = readFuelLogs().length;
  const technicalLogsCount = readVehicleTechnicalLogs().length;
  const formBody = `<form id="form-vehicle" class="p-form p-form-colored">
    <fieldset class="form-section form-section-blue full">
      <legend>${IC.truck} Identificación del vehículo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.truck, "Placa")}<input name="plate" required placeholder="ABC123" data-antares-restrict="alnum-doc" maxlength="6" /></label>
        <label>${fieldLabel(IC.briefcase, "Marca")}<input name="brand" required placeholder="Ej: Kenworth, Chevrolet, Hino" /></label>
        <label>${fieldLabel(IC.grid, "Línea / Modelo")}<input name="model" required placeholder="Ej: T800, NPR" /></label>
        <label>${fieldLabel(IC.calendar, "Año modelo")}<input type="number" min="1990" max="2100" name="year" required placeholder="Ej: ${new Date().getFullYear()}" /></label>
        <label>${fieldLabel(IC.palette, "Color")}<select name="color" required>${colorOptions}</select></label>
        <label>${fieldLabel(IC.truck, "Tipo")}<select name="type" required><option value="">Seleccione...</option><option>Camion</option><option>Turbo</option><option>Tractomula</option><option>Bus</option></select></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-violet full">
      <legend>${IC.layers} Características del vehículo</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.package, "Tipo de carrocería")}<select name="bodyType" required>${bodyTypeOptions}</select></label>
        <label>${fieldLabel(IC.activity, "Termoking (refrigerado)")}<select name="refrigerated" required><option value="true">Sí, equipo Termoking</option><option value="false">No, carga seca</option></select></label>
        <label>${fieldLabel(IC.scale, "Capacidad (kg)")}<input type="number" min="1" name="capacityKg" required placeholder="Ej: 18000" /></label>
        <label>${fieldLabel(IC.fuel, "Tipo de combustible")}<select name="fuelType" required>${fuelTypeOptions}</select></label>
        <label>${fieldLabel(IC.layers, "Configuración de ejes")}<select name="axleConfig" required>${axleOptions}</select></label>
        <label>${fieldLabel(IC.hash, "Número de motor")}<input name="engineNumber" required placeholder="Ej: 6BT5.9" /></label>
        <label>${fieldLabel(IC.hash, "Número de chasis (VIN)")}<input name="vin" required maxlength="17" minlength="11" placeholder="17 caracteres" style="text-transform:uppercase" data-antares-restrict="alnum-doc" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-amber full">
      <legend>${IC.shield} Documentación legal vigente (Colombia)</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.card, "Tarjeta de propiedad N°")}<input name="ownershipCard" required placeholder="Ej: 12345678" /></label>
        <label>${fieldLabel(IC.calendar, "Expedición SOAT")}<input type="date" name="soatExpeditionDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Vence SOAT")}<input type="date" name="soatExpiryDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Expedición tecnomecánica")}<input type="date" name="techInspectionExpeditionDate" required /></label>
        <label>${fieldLabel(IC.calendar, "Vence tecnomecánica")}<input type="date" name="techInspectionExpiryDate" required /></label>
        <label>${fieldLabel(IC.shield, "Póliza RC contractual N°")}<input name="rcPolicyContract" placeholder="Ej: 0123456" /></label>
        <label>${fieldLabel(IC.shield, "Póliza RC extracontractual N°")}<input name="rcPolicyExtra" placeholder="Ej: 0654321" /></label>
        <label>${fieldLabel(IC.calendar, "Vence pólizas RCP")}<input type="date" name="rcPolicyExpiry" /></label>
      </div>
    </fieldset>

    <fieldset class="form-section form-section-emerald full">
      <legend>${IC.satellite} Equipos y trazabilidad</legend>
      <div class="form-section-grid">
        <label>${fieldLabel(IC.satellite, "GPS satelital")}<select name="hasGps"><option value="true">Sí, GPS activo</option><option value="false">Sin GPS</option></select></label>
        <label>${fieldLabel(IC.briefcase, "Proveedor GPS")}<input name="gpsProvider" placeholder="Ej: Detektor, Skyangel, Geolocator" /></label>
        <label>${fieldLabel(IC.user, "Usuario proveedor satélite")}<input type="text" name="satelliteProviderUser" placeholder="Usuario en el portal del GPS" autocomplete="off" /></label>
        <label>${fieldLabel(IC.lock, "Contraseña proveedor satélite")}<input type="text" name="satelliteProviderPassword" placeholder="Contraseña en el portal del GPS" autocomplete="off" /></label>
      </div>
    </fieldset>

    ${renderManagedCreateFormActions("create-vehicle", `<button class="btn btn-primary" type="submit">${IC.plus} Registrar vehículo</button>`)}
  </form>`;
  const vehicleListRows = filteredVehicles
    .map((v) => {
      const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
      const tecno = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
      const isRefrigerated = vehicleHasTermokingEquipment(v);
      const occupancy = resolveVehicleOccupancy(v.id);
      const availabilityTag = isManuallyUnavailable(v)
        ? '<span class="status status-fleet-offline">No disponible</span>'
        : occupancy.tone === "busy"
          ? '<span class="status status-fleet-ocupado">Ocupado</span>'
          : occupancy.tone === "scheduled"
            ? '<span class="status status-fleet-programado">Reservado</span>'
            : '<span class="status status-fleet-disponible">Disponible</span>';
      const plate = String(v.plate || "—").toUpperCase();
      const typeLabel = String(v.type || "Vehículo").trim() || "Vehículo";
      const brandModel =
        `${String(v.brand || "").trim()}${v.brand && v.model ? " · " : ""}${String(v.model || "").trim()}${v.year ? ` · ${v.year}` : ""}`.trim() ||
        "—";
      const capacityLabel = parseNum(v.capacityKg) > 0 ? `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "—";
      const cold = isRefrigerated ? "TK" : "Seco";
      return `<tr data-vehicle-id="${escapeAttr(String(v.id || ""))}">
        <td data-label="Placa"><strong class="vehicle-fleet-list-plate">${escapeHtml(plate)}</strong><div class="muted vehicle-fleet-list-sub">${escapeHtml(typeLabel)} · ${escapeHtml(cold)}</div></td>
        <td data-label="Marca / modelo">${escapeHtml(brandModel)}</td>
        <td data-label="Estado">${availabilityTag}</td>
        <td data-label="SOAT"><span class="vehicle-fleet-list-doc">${escapeHtml(soat.label)}</span></td>
        <td data-label="Tecno"><span class="vehicle-fleet-list-doc">${escapeHtml(tecno.label)}</span></td>
        <td data-label="Cap.">${escapeHtml(capacityLabel)}</td>
        <td data-label="Acciones" class="vehicle-fleet-list-actions"><div class="toolbar">
          <button type="button" class="btn btn-sm btn-outline" data-action="view-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Ver ficha">${IC.eye} Ver</button>
          ${canEditVeh ? `<button type="button" class="btn btn-sm btn-action" data-action="edit-vehicle" data-id="${escapeAttr(String(v.id || ""))}">${IC.edit} Editar</button>` : ""}
          ${canToggleVeh ? `<button type="button" class="btn btn-sm btn-action" data-action="toggle-vehicle" data-id="${escapeAttr(String(v.id || ""))}">${IC.toggle} Estado</button>` : ""}
          ${canDeleteVeh ? `<button type="button" class="btn btn-sm btn-reject" data-action="delete-vehicle" data-id="${escapeAttr(String(v.id))}">${IC.trash} Eliminar</button>` : ""}
        </div></td>
      </tr>`;
    })
    .join("");
  const fleetToolbar =
    totalCount > 0
      ? `<div class="transport-ops-toolbar vehicle-fleet-toolbar">
      <label class="transport-ops-search">
        <span class="muted">${IC.search || IC.eye} Buscar en flota</span>
        <input type="search" data-action="vehicles-fleet-search" value="${escapeAttr(fleetSearchRaw)}" placeholder="Placa, marca, modelo, VIN, motor, GPS, tarjeta…" autocomplete="off" />
      </label>
      <div class="transport-ops-layout" role="group" aria-label="Vista de flota">
        <button type="button" class="btn btn-sm ${fleetLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="vehicles-fleet-layout" data-layout="cards">Tarjetas</button>
        <button type="button" class="btn btn-sm ${fleetLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="vehicles-fleet-layout" data-layout="list">Lista</button>
      </div>
    </div>`
      : "";
  const fleetListTable =
    fleetLayout === "list" && filteredVehicles.length > 0
      ? `<div class="table-wrap vehicle-fleet-list-wrap"><table class="vehicle-fleet-table">
    <thead><tr>
      <th>Placa</th><th>Marca / modelo</th><th>Estado</th><th>SOAT</th><th>Tecnomecánica</th><th>Capacidad</th><th>Acciones</th>
    </tr></thead>
    <tbody>${vehicleListRows}</tbody>
  </table></div>`
      : "";
  const fleetCardsGrid = fleetLayout === "cards" && vehicleCards ? `<div class="trip-ops-cards vehicle-ops-cards directory-grid">${vehicleCards}</div>` : "";
  let fleetMainBody;
  if (!totalCount) {
    fleetMainBody = emptyState("No hay vehículos registrados.");
  } else if (!filteredVehicles.length) {
    fleetMainBody = `${fleetToolbar}${emptyState("Ningún vehículo coincide con la búsqueda. Pruebe otras palabras o borre el filtro.")}`;
  } else {
    fleetMainBody = `${fleetToolbar}${fleetLayout === "list" ? fleetListTable : fleetCardsGrid}`;
  }
  const fleetCardSubtitle = fleetSearchNorm
    ? `${filteredVehicles.length} de ${totalCount} vehículos`
    : fleetLayout === "list"
      ? `${totalCount} vehículos · vista lista`
      : `${totalCount} vehículos`;
  const heroStrip = moduleFleetHeroStrip([
    { label: "Flota", value: totalCount },
    { label: "Disponibles", value: availableCount },
    { label: "Ocupados", value: occupiedCount, tone: occupiedCount ? "warn" : undefined },
    { label: "Reservados", value: scheduledCount },
    { label: "Offline", value: offlineCount },
    { label: "Termoking", value: thermokingCount },
    { label: "Docs riesgo", value: documentRiskCount, tone: documentRiskCount ? "alert" : undefined }
  ]);
  const vehicleWorkspaceTabs = [{ id: "fleet", label: "Flota", count: vehicles.length }];
  if (canCreateVeh) vehicleWorkspaceTabs.push({ id: "create", label: "Registrar" });
  if (canFuelLogs) vehicleWorkspaceTabs.push({ id: "fuel", label: "Combustible", count: fuelLogsCount });
  if (canTechnicalLogs) vehicleWorkspaceTabs.push({ id: "technical", label: "Taller", count: technicalLogsCount });
  const workspaceNav = renderModuleWindowTabs({
    ariaLabel: "Opciones del módulo Camiones",
    activeId: vehicleWorkspace,
    action: "vehicles-workspace",
    valueAttr: "workspace",
    tabs: vehicleWorkspaceTabs
  });
  const fleetPanel = `<div class="auth-tab-panel${vehicleWorkspace === "fleet" ? "" : " hidden"}" data-vehicle-panel="fleet"${vehicleWorkspace === "fleet" ? "" : " hidden"}>${pcardWrap("truck", "Flota de camiones", fleetCardSubtitle, fleetMainBody)}</div>`;
  const createPanel = canCreateVeh
    ? `<div class="auth-tab-panel${vehicleWorkspace === "create" ? "" : " hidden"}" data-vehicle-panel="create"${vehicleWorkspace === "create" ? "" : " hidden"}>${createCollapsibleProCard("create-vehicle", "plus", "Registrar vehículo", "Alta de flota", formBody, "admin-users-data-card", "Abrir formulario", { createPanels: state.createPanels })}</div>`
    : "";
  const fuelPanel = canFuelLogs
    ? `<div class="auth-tab-panel${vehicleWorkspace === "fuel" ? "" : " hidden"}" data-vehicle-panel="fuel"${vehicleWorkspace === "fuel" ? "" : " hidden"}>${createCollapsibleProCard("create-fuel-log", "fuel", "Combustible", `${fuelLogsCount} carga${fuelLogsCount === 1 ? "" : "s"} registrada${fuelLogsCount === 1 ? "" : "s"}`, historyFleetFuelFormHtml(todayIsoDate, vehicleSelectOptions, driverSelectOptions), "admin-users-data-card", "Abrir formulario", { createPanels: state.createPanels })}</div>`
    : "";
  const technicalPanel = canTechnicalLogs
    ? `<div class="auth-tab-panel${vehicleWorkspace === "technical" ? "" : " hidden"}" data-vehicle-panel="technical"${vehicleWorkspace === "technical" ? "" : " hidden"}>${createCollapsibleProCard("create-technical-log", "activity", "Taller", `${technicalLogsCount} novedad${technicalLogsCount === 1 ? "" : "es"} de mantenimiento`, historyFleetTechnicalFormHtml(todayIsoDate, vehicleSelectOptions), "admin-users-data-card", "Abrir formulario", { createPanels: state.createPanels })}</div>`
    : "";
  return `${heroStrip}${workspaceNav}<div class="auth-tab-panels">${fleetPanel}${createPanel}${fuelPanel}${technicalPanel}</div>`;
}


(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ vehiclesHtml });
})();

(function registerTransportVehiclesPortalBinds() {
  "use strict";

  function bindTransportVehiclesPortalControls() {
    if (String(state.currentView || "") !== "transport-vehicles" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-workspace']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const workspace = normalizeVehicleWorkspaceSection(btn.dataset.workspace);
        state.vehiclesUi = { ...(state.vehiclesUi || {}), workspace };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.vehiclesUi = { ...(state.vehiclesUi || {}), fleetSearch: String(el.value || "") };
        state.__vehiclesFleetSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeVehicleFleetLayout(btn.dataset.layout);
        state.vehiclesUi = { ...(state.vehiclesUi || {}), fleetLayout: layout };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='delete-vehicle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (abortUnlessCanDeleteVehicle()) return;
        const vehicleId = String(btn.dataset.id || "");
        if (!vehicleId) return;
        openConfirmModal({
          title: "Eliminar camion",
          message: "Se eliminara del catalogo y se limpiara su referencia en viajes historicos.",
          confirmText: "Eliminar camion",
          onConfirm: async () => {
            try {
              await postPortalAuthorized("/portal/admin-vehicle-delete", { vehicleId });
            } catch (err) {
              notify(String(err?.message || "No fue posible eliminar el vehiculo en el servidor."), "error");
              return;
            }
            const snapshotVehicle = read(KEYS.vehicles, []).find((vehicle) => String(vehicle.id) === vehicleId);
            const ok = await removeFromPortalListAwaitServer(KEYS.vehicles, vehicleId, { notifyOnFailure: false });
            if (!ok) {
              notify("El vehículo se eliminó en el servidor, pero no se pudo actualizar la vista local.", "error");
              if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
              recalculateResourceAvailability();
              renderPortalView();
              return;
            }
            if (snapshotVehicle) {
              appendModuleAuditLog({
                action: "delete",
                moduleId: "vehicles",
                moduleLabel: "Camiones",
                entityId: String(snapshotVehicle.id || ""),
                entityLabel: String(snapshotVehicle.plate || "Camión").toUpperCase(),
                summary: `${String(snapshotVehicle.type || "Vehículo")} · ${String(snapshotVehicle.brand || "")} ${String(snapshotVehicle.model || "")}`.trim()
              });
            }
            await reqWriteAwait(
              reqRead().map((request) => {
                if (!request.trip || String(request.trip.vehicleId || "") !== vehicleId) return request;
                return {
                  ...request,
                  trip: {
                    ...request.trip,
                    vehicleId: null,
                    vehiclePlate: "CAMION ELIMINADO",
                    updatedAt: nowIso()
                  }
                };
              })
            );
            recalculateResourceAvailability();
            notify(userMessage("vehicleDeleted"), "success");
            renderPortalView();
          }
        });
      });
    });

    const vehicleForm = document.getElementById("form-vehicle");
    if (vehicleForm) {
      bindVehicleDocExpiryAutoFill(vehicleForm);
      wireFormSubmitGuard(vehicleForm, async (event) => {
        if (abortUnlessCanCreateVehicle()) return;
        const data = readFormEntriesNormalized(vehicleForm);
        const plate = String(data.plate || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (!/^[A-Z]{3}[0-9]{3}$/.test(plate)) {
          notify(userMessage("vehiclePlateInvalid"), "error");
          return;
        }
        const modelYear = parseNum(data.year);
        const currentYear = new Date().getFullYear();
        if (modelYear < 1990 || modelYear > currentYear + 1) {
          notify(userMessage("vehicleYearInvalid"), "error");
          return;
        }
        let soatExpeditionDate = data.soatExpeditionDate;
        let soatExpiryDate = data.soatExpiryDate;
        if (soatExpeditionDate && (!soatExpiryDate || !String(soatExpiryDate).trim())) {
          soatExpiryDate = addCalendarYearsIsoDate(soatExpeditionDate, 1) || soatExpiryDate;
        }
        let techInspectionExpeditionDate = data.techInspectionExpeditionDate;
        let techInspectionExpiryDate = data.techInspectionExpiryDate;
        if (techInspectionExpeditionDate && (!techInspectionExpiryDate || !String(techInspectionExpiryDate).trim())) {
          techInspectionExpiryDate = addCalendarYearsIsoDate(techInspectionExpeditionDate, 1) || techInspectionExpiryDate;
        }
        const list = read(KEYS.vehicles, []);
        list.push(stampCreatedRecord({
          id: newUuidV4(),
          plate,
          brand: normalizeLatinUpperForDb(data.brand),
          model: normalizeLatinUpperForDb(data.model),
          year: modelYear,
          type: normalizeLatinUpperForDb(data.type),
          color: normalizeLatinUpperForDb(data.color),
          capacityKg: parseNum(data.capacityKg),
          refrigerated: data.refrigerated === "true",
          bodyType: normalizeLatinUpperForDb(data.bodyType),
          fuelType: normalizeLatinUpperForDb(data.fuelType),
          axleConfig: normalizeLatinUpperForDb(data.axleConfig),
          engineNumber: normalizeLatinUpperForDb(data.engineNumber),
          vin: String(data.vin || "").trim().toUpperCase(),
          ownershipCard: normalizeLatinUpperForDb(data.ownershipCard),
          soatExpeditionDate,
          soatExpiryDate,
          techInspectionExpeditionDate,
          techInspectionExpiryDate,
          rcPolicyContract: normalizeLatinUpperForDb(data.rcPolicyContract),
          rcPolicyExtra: normalizeLatinUpperForDb(data.rcPolicyExtra),
          rcPolicyExpiry: data.rcPolicyExpiry || "",
          hasGps: data.hasGps === "true",
          gpsProvider: normalizeLatinUpperForDb(data.gpsProvider),
          satelliteProviderUser: String(data.satelliteProviderUser || "").trim(),
          satelliteProviderPassword: String(data.satelliteProviderPassword || ""),
          available: true
        }));
        try {
          await writeAwaitServer(KEYS.vehicles, list);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
          return;
        }
        notify(userMessage("vehicleRegistered"), "success");
        collapseCreatePanel("create-vehicle");
        renderPortalView();
      }, { busyText: "Registrando vehículo…" });
    }

    nodes.viewRoot.querySelectorAll("[data-action='edit-vehicle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (abortUnlessCanEditVehicle()) return;
        const vid = String(btn.dataset.id || "").trim();
        const all = read(KEYS.vehicles, []);
        const rawTarget = all.find((v) => String(v.id || "").trim() === vid);
        const target = normalizeVehicleRowForEditor(rawTarget);
        if (!target) {
          notify("No se encontró el vehículo. Actualice la página.", "error");
          return;
        }
        const colorOpts = editModalCatalogSelectOptions(CO_CATALOGS.vehicleColors, target.color);
        const bodyOpts = editModalCatalogSelectOptions(CO_CATALOGS.bodyTypes, target.bodyType);
        const fuelOpts = editModalCatalogSelectOptions(CO_CATALOGS.fuelTypes, target.fuelType);
        const axleOpts = editModalCatalogSelectOptions(CO_CATALOGS.axleConfig, target.axleConfig);
        const vehicleTypeOpts = [
          { value: "", label: "Seleccione..." },
          { value: "Camion", label: "Camión / rígido" },
          { value: "Turbo", label: "Turbo" },
          { value: "Tractomula", label: "Tractomula" },
          { value: "Bus", label: "Bus" }
        ];
        if (target.type && !vehicleTypeOpts.some((o) => String(o.value) === String(target.type))) {
          vehicleTypeOpts.push({ value: target.type, label: target.type });
        }
        openEditModal({
          title: "Editar camión",
          subtitle: target.plate,
          submitText: "Guardar cambios",
          fields: [
            { name: "plate", label: "Placa", value: target.plate, required: true },
            { name: "brand", label: "Marca", value: target.brand || "", required: true },
            { name: "model", label: "Línea/Modelo", value: target.model || "", required: true },
            { name: "year", label: "Año modelo", type: "number", value: target.year || "", required: true },
            {
              name: "type",
              label: "Tipo",
              type: "select",
              required: true,
              value: String(target.type || "").trim(),
              options: vehicleTypeOpts
            },
            { name: "color", label: "Color", type: "select", value: target.color || "", options: colorOpts },
            { name: "capacityKg", label: "Capacidad (kg)", type: "number", value: target.capacityKg, required: true },
            { name: "bodyType", label: "Carrocería", type: "select", value: target.bodyType || "", options: bodyOpts },
            { name: "fuelType", label: "Combustible", type: "select", value: target.fuelType || "", options: fuelOpts },
            { name: "axleConfig", label: "Ejes", type: "select", value: target.axleConfig || "", options: axleOpts },
            { name: "engineNumber", label: "N° motor", value: target.engineNumber || "" },
            { name: "vin", label: "Chasis (VIN)", value: target.vin || "" },
            { name: "ownershipCard", label: "Tarjeta propiedad N°", value: target.ownershipCard || "" },
            {
              name: "refrigerated",
              label: "Termoking (refrigerado)",
              type: "select",
              value: target.refrigerated ? "true" : "false",
              options: [
                { value: "true", label: "Sí, equipo Termoking" },
                { value: "false", label: "No, carga seca" }
              ]
            },
            {
              name: "soatExpeditionDate",
              label: "Expedición SOAT",
              type: "date",
              value: target.soatExpeditionDate || "",
              required: true
            },
            { name: "soatExpiryDate", label: "Vence SOAT", type: "date", value: target.soatExpiryDate || "" },
            {
              name: "techInspectionExpeditionDate",
              label: "Expedición tecnomecánica",
              type: "date",
              value: target.techInspectionExpeditionDate || "",
              required: true
            },
            {
              name: "techInspectionExpiryDate",
              label: "Vence tecnomecánica",
              type: "date",
              value: target.techInspectionExpiryDate || ""
            },
            { name: "rcPolicyContract", label: "Póliza RC contractual N°", value: target.rcPolicyContract || "" },
            { name: "rcPolicyExtra", label: "Póliza RC extracontractual N°", value: target.rcPolicyExtra || "" },
            {
              name: "rcPolicyExpiry",
              label: "Vence pólizas RCP",
              type: "date",
              value: normalizePortalDateYmd(target.rcPolicyExpiry)
            },
            {
              name: "hasGps",
              label: "GPS satelital",
              type: "select",
              value: target.hasGps ? "true" : "false",
              options: [{ value: "true", label: "Sí" }, { value: "false", label: "No" }]
            },
            { name: "gpsProvider", label: "Proveedor GPS", value: target.gpsProvider || "" },
            { name: "satelliteProviderUser", label: "Usuario proveedor satélite", value: target.satelliteProviderUser || "" },
            {
              name: "satelliteProviderPassword",
              label: "Contraseña proveedor satélite",
              type: "text",
              value: target.satelliteProviderPassword || ""
            }
          ],
          afterMount: (formEl) => bindVehicleDocExpiryAutoFill(formEl),
          onSubmit: async (form) => {
            let soatExpiryDate = form.soatExpiryDate || "";
            if (form.soatExpeditionDate && (!soatExpiryDate || !String(soatExpiryDate).trim())) {
              soatExpiryDate = addCalendarYearsIsoDate(form.soatExpeditionDate, 1) || soatExpiryDate;
            }
            let techInspectionExpiryDate = form.techInspectionExpiryDate || "";
            if (
              form.techInspectionExpeditionDate &&
              (!techInspectionExpiryDate || !String(techInspectionExpiryDate).trim())
            ) {
              techInspectionExpiryDate =
                addCalendarYearsIsoDate(form.techInspectionExpeditionDate, 1) || techInspectionExpiryDate;
            }
            const nextVehicles = all.map((v) =>
              v.id === target.id
                ? stampUpdatedRecord({
                    ...v,
                    plate: String(form.plate || "").toUpperCase(),
                    brand: String(form.brand || "").trim(),
                    model: String(form.model || "").trim(),
                    year: parseNum(form.year),
                    color: String(form.color || "").trim(),
                    capacityKg: parseNum(form.capacityKg),
                    bodyType: String(form.bodyType || "").trim(),
                    fuelType: String(form.fuelType || "").trim(),
                    axleConfig: String(form.axleConfig || "").trim(),
                    engineNumber: String(form.engineNumber || "").trim(),
                    vin: String(form.vin || "").trim().toUpperCase(),
                    ownershipCard: String(form.ownershipCard || "").trim(),
                    type: String(form.type || target.type || "Camion").trim(),
                    refrigerated: String(form.refrigerated || "false") === "true",
                    soatExpeditionDate: form.soatExpeditionDate,
                    soatExpiryDate,
                    techInspectionExpeditionDate: form.techInspectionExpeditionDate,
                    techInspectionExpiryDate,
                    rcPolicyContract: String(form.rcPolicyContract || "").trim(),
                    rcPolicyExtra: String(form.rcPolicyExtra || "").trim(),
                    rcPolicyExpiry: form.rcPolicyExpiry || "",
                    hasGps: String(form.hasGps || "false") === "true",
                    gpsProvider: String(form.gpsProvider || "").trim(),
                    satelliteProviderUser: String(form.satelliteProviderUser || "").trim(),
                    satelliteProviderPassword: String(form.satelliteProviderPassword || "").trim()
                  })
                : v
            );
            try {
              await writeAwaitServer(KEYS.vehicles, nextVehicles);
            } catch (err) {
              notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
              return false;
            }
            notify(userMessage("vehicleUpdated"), "success");
            renderPortalView();
            return true;
          }
        });
      });
    });

    const fuelLogForm = document.getElementById("form-fuel-log");
    if (fuelLogForm) {
      wireMoneyInputs(fuelLogForm);
      const fuelLitersInput = fuelLogForm.querySelector("[data-fuel-liters-input]");
      const fuelCostInput = fuelLogForm.querySelector("input[name='totalCost']");
      const fuelHint = document.getElementById("fuel-price-per-liter-hint");
      const refreshFuelPerLiterHint = () => {
        if (!fuelHint) return;
        const liters = parseNum(fuelLitersInput?.value);
        const total = parseMoneyFieldValue(fuelCostInput?.value);
        if (liters > 0 && total > 0) {
          const per = Math.round(total / liters);
          fuelHint.hidden = false;
          fuelHint.textContent = `Precio estimado: $${per.toLocaleString("es-CO")} por litro`;
        } else {
          fuelHint.hidden = true;
          fuelHint.textContent = "";
        }
      };
      fuelLitersInput?.addEventListener("input", refreshFuelPerLiterHint);
      fuelCostInput?.addEventListener("input", refreshFuelPerLiterHint);
      wireFormSubmitGuard(fuelLogForm, async (event) => {
        const data = readFormEntriesNormalized(fuelLogForm);
        const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
        const driver = read(KEYS.drivers, []).find((d) => String(d.id) === String(data.driverId || ""));
        if (!vehicle || !driver) {
          notify(userMessage("fuelSelectBoth"), "error");
          return;
        }
        const liters = parseNum(data.liters);
        const totalCost = parseMoneyFieldValue(data.totalCost);
        if (liters <= 0 || totalCost < 0) {
          notify(userMessage("fuelInvalidAmounts"), "error");
          return;
        }
        try {
          await appendFuelLogAwait({
            id: newUuidV4(),
            date: data.date || nowIso().slice(0, 10),
            vehicleId: vehicle.id,
            plate: vehicle.plate,
            vehiclePlate: vehicle.plate,
            driverId: driver.id,
            driverName: driver.name,
            tripNumber: String(data.tripNumber || "").trim(),
            liters,
            totalCost,
            costPerLiter: liters > 0 ? Math.round(totalCost / liters) : 0,
            odometerKm: parseNum(data.odometerKm),
            station: normalizeLatinUpperForDb(data.station || ""),
            paidBy: String(data.paidBy || "empresa"),
            createdAt: nowIso()
          });
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el combustible en el servidor."), "error");
          return;
        }
        notify(userMessage("fuelLogged"), "success");
        state.historyUi = { ...(state.historyUi || { quickFilter: "all" }), workspace: "fleet", fleetTab: "fuel" };
        collapseCreatePanel("create-fuel-log");
        renderPortalView();
      });
    }

    const technicalLogForm = document.getElementById("form-technical-log");
    if (technicalLogForm) {
      wireMoneyInputs(technicalLogForm);
      wireFormSubmitGuard(technicalLogForm, async (event) => {
        const data = readFormEntriesNormalized(technicalLogForm);
        const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
        if (!vehicle) {
          notify(userMessage("fuelSelectVehicle"), "error");
          return;
        }
        const cost = parseMoneyFieldValue(data.cost);
        if (!String(data.description || "").trim()) {
          notify("Indique una descripción de la novedad de taller.", "error");
          return;
        }
        try {
          await appendVehicleTechnicalLogAwait({
            id: newUuidV4(),
            date: data.date || nowIso().slice(0, 10),
            vehicleId: vehicle.id,
            plate: vehicle.plate,
            vehiclePlate: vehicle.plate,
            interventionType: String(data.type || "preventivo"),
            type: String(data.type || "preventivo"),
            description: normalizeLatinUpperForDb(data.description || ""),
            cost,
            downtimeHours: parseNum(data.downtimeHours),
            followUpStatus: String(data.status || "Pendiente"),
            status: String(data.status || "Pendiente"),
            createdAt: nowIso()
          });
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el mantenimiento en el servidor."), "error");
          return;
        }
        notify(userMessage("technicalLogged"), "success");
        state.historyUi = { ...(state.historyUi || { quickFilter: "all" }), workspace: "fleet", fleetTab: "technical" };
        collapseCreatePanel("create-technical-log");
        renderPortalView();
      });
    }

    const fleetSearchRestore = state.__vehiclesFleetSearchRestore;
    if (fleetSearchRestore && typeof fleetSearchRestore.start === "number") {
      delete state.__vehiclesFleetSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "transport-vehicles") return;
        const inp = root.querySelector("[data-action='vehicles-fleet-search']");
        if (!inp || typeof inp.focus !== "function") return;
        inp.focus();
        if (typeof inp.setSelectionRange === "function") {
          const n = String(inp.value || "").length;
          const s = Math.max(0, Math.min(fleetSearchRestore.start, n));
          const e = Math.max(0, Math.min(fleetSearchRestore.end ?? fleetSearchRestore.start, n));
          inp.setSelectionRange(s, e);
        }
      });
    }
  }

  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender["transport-vehicles"] = bindTransportVehiclesPortalControls;
})();
