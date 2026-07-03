/**
 * Transporte · Camiones (`transport-vehicles`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
function normalizeVehicleFleetLayout(raw) {
  if (typeof AntaresVehiclesDomain !== "undefined" && AntaresVehiclesDomain.normalizeVehicleFleetLayout) {
    return AntaresVehiclesDomain.normalizeVehicleFleetLayout(raw);
  }
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
  const vehiclesUi = state.vehiclesUi || { workspace: "data", section: "fleet" };
  const fleetSearchRaw = String(vehiclesUi.fleetSearch ?? "");
  const fleetSearchNorm = fleetSearchRaw.trim().toLowerCase();
  const fleetLayout = normalizeVehicleFleetLayout(vehiclesUi.fleetLayout);
  const filteredVehicles = fleetSearchNorm
    ? vehicles.filter((v) => vehicleMatchesFleetSearch(v, fleetSearchNorm))
    : vehicles;
  const vehicleRenderWindowSize = Number(window.RENDER_WINDOW_SIZE) || 30;
  const vehicleRenderLimit = Number(state.vehiclesRenderLimit) || vehicleRenderWindowSize;
  const visibleVehicles = filteredVehicles.slice(0, vehicleRenderLimit);
  const vehiclesMoreBar =
    typeof renderWindowMoreBar === "function"
      ? renderWindowMoreBar(filteredVehicles.length, visibleVehicles.length, "vehicles-render-more")
      : filteredVehicles.length > visibleVehicles.length
        ? `<div class="render-window-more"><button type="button" class="btn btn-outline btn-sm" data-action="vehicles-render-more">Ver más · mostrando ${visibleVehicles.length} de ${filteredVehicles.length}</button></div>`
        : "";
  const canEditVeh = canEditVehicle();
  const canToggleVeh = canToggleVehicleStatus();
  const canDeleteVeh = canDeleteVehicle();
  const canCreateVeh = canCreateVehicle();
  const canFuelLogs = hasPermission(currentUser(), PERMISSIONS.TRANSPORT_HISTORY);
  const canTechnicalLogs = canFuelLogs;
  const vehicleOperateTabs = [];
  if (canCreateVeh) vehicleOperateTabs.push({ id: "create", label: "Registrar vehículo" });
  if (canFuelLogs) vehicleOperateTabs.push({ id: "fuel", label: "Combustible", count: readFuelLogs().length });
  if (canTechnicalLogs) vehicleOperateTabs.push({ id: "technical", label: "Taller", count: readVehicleTechnicalLogs().length });
  let vehicleWorkspace = normalizeVehicleWorkspace(vehiclesUi.workspace);
  let vehicleSection = resolveVehicleSection(vehiclesUi);
  if (vehicleWorkspace === "operate" && !vehicleOperateTabs.length) {
    vehicleWorkspace = "data";
    vehicleSection = "fleet";
  } else if (vehicleWorkspace === "operate" && !vehicleOperateTabs.some((tab) => tab.id === vehicleSection)) {
    vehicleSection = String(vehicleOperateTabs[0]?.id || "fleet");
    if (!vehicleOperateTabs.length) {
      vehicleWorkspace = "data";
      vehicleSection = "fleet";
    }
  }
  if (vehicleWorkspace === "data") vehicleSection = "fleet";
  const vehiclesCreateUi = buildVehiclesCreatePanelsState(vehicleSection, state.createPanels || {}, {
    expandActive: false
  });
  state.vehiclesUi = {
    ...vehiclesUi,
    workspace: vehicleWorkspace,
    section: vehicleSection,
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
  const vehicleCards = visibleVehicles
    .map((v) => {
      const soat = docExpiryStatus(v.soatExpeditionDate, v.soatExpiryDate);
      const tecno = docExpiryStatus(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
      const isRefrigerated = vehicleHasTermokingEquipment(v);
      const occupancy = resolveVehicleOccupancy(v.id);
      const occupancySlug = isManuallyUnavailable(v)
        ? "no-disponible"
        : occupancy.tone === "busy"
          ? "ocupado"
          : occupancy.tone === "scheduled"
            ? "reservado"
            : "disponible";
      const availabilityLabel = isManuallyUnavailable(v)
        ? "No disponible"
        : occupancy.tone === "busy"
          ? "Ocupado"
          : occupancy.tone === "scheduled"
            ? "Reservado"
            : "Disponible";
      const plate = String(v.plate || "—").toUpperCase();
      const typeLabel = String(v.type || "Vehículo").trim().toUpperCase() || "VEHÍCULO";
      const brandTitle =
        `${String(v.brand || "").trim()}${v.brand && v.model ? " " : ""}${String(v.model || "").trim()}`.trim() || "Sin marca/modelo";
      const yearLabel = v.year ? String(v.year) : "";
      const soatTone = directoryToneFromBucket(soat.cls);
      const tecnoTone = directoryToneFromBucket(tecno.cls);
      const gpsEnabled = String(v.hasGps ?? "true").trim().toLowerCase() !== "false";
      const gpsProvider = String(v.gpsProvider || "").trim();
      const gpsSubLabel = gpsEnabled ? gpsProvider || "Trazabilidad activa" : "Sin trazabilidad";
      const occupancyDetail = occupancy.trip
        ? String(occupancy.trip.clientName || occupancy.trip.companyName || occupancy.trip.request?.clientName || "").trim() || occupancy.detail
        : occupancy.detail;
      const capacityLabel = parseNum(v.capacityKg) > 0 ? `${parseNum(v.capacityKg).toLocaleString("es-CO")} kg` : "Sin capacidad";
      const ownershipCardLabel = String(v.ownershipCard || "").trim() || "Sin tarjeta";
      const bodyTypeLabel = String(v.bodyType || "").trim() || "Sin carrocería";
      const lastUpdateLabel = formatPortalOpsCardTimestamp(v.updatedAt || v.createdAt || "");
      const statusBadgeHtml = buildPortalOpsCardStatusPill(availabilityLabel, occupancySlug);
      const termokingBadgeHtml = isRefrigerated
        ? `<span class="portal-ops-card-doc-pill portal-ops-card-doc-pill--ok vehicle-card-equip-pill vehicle-card-equip-pill--tk" title="Equipo Termoking">
            <span class="vehicle-card-equip-pill__icon" aria-hidden="true">❄</span>
            <span>TERMOKING</span>
          </span>`
        : "";
      const primaryButtons = [
        `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--outline" data-action="view-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Ver ficha técnica del vehículo">${IC.eye} Ver detalles</button>`,
        canEditVeh
          ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--solid" data-action="edit-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Editar datos del vehículo">${IC.edit} Editar información</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      const fullWidthButtons = [
        canToggleVeh
          ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--soft" data-action="toggle-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Alternar disponibilidad manual">${IC.toggle} Cambiar estado</button>`
          : "",
        canDeleteVeh
          ? `<button type="button" class="btn btn-sm trip-ops-card-btn trip-ops-card-btn--danger" data-action="delete-vehicle" data-id="${escapeAttr(String(v.id || ""))}" title="Eliminar del catálogo">${IC.trash} Eliminar camión</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      const fullWidthActionsHtml = fullWidthButtons
        ? `<div class="portal-ops-card-actions-stack">${fullWidthButtons}</div>`
        : "";
      return `<article class="trip-ops-card portal-ops-card trip-ops-card--vehicle trip-ops-card--vehicle-${escapeAttr(occupancySlug)}" data-vehicle-id="${escapeAttr(String(v.id || ""))}">
        <header class="trip-ops-card-head trip-ops-card-head--vehicle">
          <div class="trip-ops-card-head-main">
            <div class="vehicle-plate-badge" title="Placa ${escapeAttr(plate)}" aria-label="Placa ${escapeAttr(plate)}">
              <span class="vehicle-plate-badge__icon" aria-hidden="true">${IC.truck}</span>
              <span class="vehicle-plate-badge__text">${escapeHtml(plate)}</span>
            </div>
            <div class="trip-ops-card-head-info">
              <p class="trip-ops-card-kicker">${escapeHtml(typeLabel)}</p>
              <h4 class="trip-ops-card-title vehicle-plate-title" title="${escapeAttr(brandTitle)}">${escapeHtml(brandTitle)}</h4>
              ${yearLabel ? `<p class="vehicle-card-year">${escapeHtml(yearLabel)}</p>` : ""}
            </div>
          </div>
          <div class="portal-ops-card-badges vehicle-card-badges">
            ${statusBadgeHtml}
            ${termokingBadgeHtml}
          </div>
        </header>
        <div class="vehicle-availability-bar portal-ops-card-highlight vehicle-availability-bar--${escapeAttr(occupancySlug)}" role="status">
          <div class="vehicle-availability-bar__main">
            <span class="vehicle-availability-bar__dot portal-ops-card-highlight__dot" aria-hidden="true"></span>
            <div class="vehicle-availability-bar__copy portal-ops-card-highlight__copy">
              <strong>${escapeHtml(availabilityLabel)}</strong>
              <span class="vehicle-availability-bar__detail">${escapeHtml(occupancyDetail)}</span>
            </div>
          </div>
          <div class="vehicle-availability-bar__update" title="Última actualización: ${escapeAttr(lastUpdateLabel)}">
            <span class="vehicle-availability-bar__update-label">${IC.calendar}<span>Actualización</span></span>
            <strong>${escapeHtml(lastUpdateLabel)}</strong>
          </div>
        </div>
        <div class="trip-ops-card-grid portal-ops-card-spec-grid vehicle-card-spec-grid">
          ${buildPortalOpsCardGridItem("Capacidad", IC.scale, capacityLabel)}
          ${buildPortalOpsCardGridItem("Carrocería", IC.package || IC.file, bodyTypeLabel)}
          ${buildPortalOpsCardGridItem("SOAT", IC.shield, soat.label, { tone: soatTone })}
          ${buildPortalOpsCardGridItem("Tecnomecánica", IC.file, tecno.label, { tone: tecnoTone })}
          ${buildPortalOpsCardGridItem("GPS", IC.mapPin, gpsEnabled ? "Activo" : "Inactivo", { tone: gpsEnabled ? "ok" : "warn", subValue: gpsSubLabel, subTone: gpsEnabled ? "ok" : "warn" })}
          ${buildPortalOpsCardGridItem("Tarjeta de Operación", IC.card, ownershipCardLabel)}
        </div>
        ${buildPortalOpsCardActions(primaryButtons, fullWidthActionsHtml)}
        ${buildPortalOpsCardFoot("Última actualización", lastUpdateLabel)}
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
  const formBody =
    typeof window.AppModules?.vehicles?.vehicleCreateFormBodyHtml === "function"
      ? window.AppModules.vehicles.vehicleCreateFormBodyHtml({
          bodyTypeOptions,
          fuelTypeOptions,
          axleOptions,
          colorOptions,
          currentYear: new Date().getFullYear()
        })
      : "";
  const vehicleListRows = visibleVehicles
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
      <div class="driver-fleet-toolbar-top">
        <label class="transport-ops-search">
          <span class="muted">${IC.search || IC.eye} Buscar en flota</span>
          <input type="search" data-action="vehicles-fleet-search" value="${escapeAttr(fleetSearchRaw)}" placeholder="Placa, marca, modelo, VIN, motor, GPS, tarjeta…" autocomplete="off" />
        </label>
        <div class="driver-fleet-view-field">
          <span class="driver-fleet-field-eyebrow muted">${IC.layers || IC.grid || ""} Vista</span>
          <div class="transport-ops-layout driver-fleet-view-toggle" role="group" aria-label="Vista de flota">
            <button type="button" class="btn btn-sm ${fleetLayout === "cards" ? "btn-primary" : "btn-outline"}" data-action="vehicles-fleet-layout" data-layout="cards">Tarjetas</button>
            <button type="button" class="btn btn-sm ${fleetLayout === "list" ? "btn-primary" : "btn-outline"}" data-action="vehicles-fleet-layout" data-layout="list">Lista</button>
          </div>
        </div>
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
  const fleetCardsGrid = fleetLayout === "cards" && vehicleCards ? `<div class="trip-ops-cards portal-ops-cards vehicle-ops-cards">${vehicleCards}</div>` : "";
  let fleetMainBody;
  if (!totalCount) {
    fleetMainBody = emptyState("No hay vehículos registrados.");
  } else if (!filteredVehicles.length) {
    fleetMainBody = `${fleetToolbar}${emptyState("Ningún vehículo coincide con la búsqueda. Pruebe otras palabras o borre el filtro.")}`;
  } else {
    fleetMainBody = `${fleetToolbar}${fleetLayout === "list" ? fleetListTable : fleetCardsGrid}${vehiclesMoreBar}`;
  }
  const fleetCardSubtitle = fleetSearchNorm
    ? `${filteredVehicles.length} de ${totalCount} vehículos${filteredVehicles.length > visibleVehicles.length ? ` · ${visibleVehicles.length} visibles` : ""}`
    : fleetLayout === "list"
      ? `${totalCount} vehículos · vista lista${filteredVehicles.length > visibleVehicles.length ? ` · ${visibleVehicles.length} visibles` : ""}`
      : `${totalCount} vehículos${filteredVehicles.length > visibleVehicles.length ? ` · ${visibleVehicles.length} visibles` : ""}`;
  const heroStrip = moduleFleetHeroStrip([
    { label: "Flota", value: totalCount },
    { label: "Disponibles", value: availableCount },
    { label: "Ocupados", value: occupiedCount, tone: occupiedCount ? "warn" : undefined },
    { label: "Reservados", value: scheduledCount },
    { label: "Offline", value: offlineCount },
    { label: "Termoking", value: thermokingCount },
    { label: "Docs riesgo", value: documentRiskCount, tone: documentRiskCount ? "alert" : undefined }
  ]);
  const vehiclesHrTabs = [
    ...(vehicleOperateTabs.length
      ? [{ id: "operate", label: "Registrar", icon: "plus", hint: "Alta de flota, combustible y taller" }]
      : []),
    { id: "data", label: "Consultar", icon: "eye", hint: "Flota y disponibilidad" }
  ];
  const vehiclesTabsNav = renderHrWorkspaceTabs({
    module: "transport-vehicles",
    ariaLabel: "Secciones del módulo Transporte · Camiones",
    activeId: vehicleWorkspace,
    variant: "switch",
    tabs: vehiclesHrTabs
  });
  const vehiclesWorkspaceHeader = renderHrWorkspaceHeader(heroStrip, vehiclesTabsNav, "payroll");
  const vehiclesEnabledSections = vehicleOperateTabs.map((tab) => String(tab.id || ""));
  const vehicleOperateNav = renderVehiclesOperateSectionNav(vehicleSection, {
    enabledSections: vehiclesEnabledSections
  });
  const vehicleDataNav = renderModuleWindowTabs({
    ariaLabel: "Consultas de flota",
    activeId: vehicleSection,
    action: "vehicles-section",
    valueAttr: "section",
    tabs: [{ id: "fleet", label: "Flota", count: vehicles.length }]
  });
  const createPanel = canCreateVeh
    ? `<div class="auth-tab-panel${vehicleSection === "create" ? "" : " hidden"}" data-vehicle-operate-pane="create">${createHrActionCard("create-vehicle", "truck", "Registrar vehículo", "Ficha técnica, documentación legal y trazabilidad GPS (Colombia)", formBody, "Abrir ficha", { createPanels: vehiclesCreateUi })}</div>`
    : "";
  const fuelPanel = canFuelLogs
    ? `<div class="auth-tab-panel${vehicleSection === "fuel" ? "" : " hidden"}" data-vehicle-operate-pane="fuel">${createHrActionCard("create-fuel-log", "fuel", "Combustible", `${fuelLogsCount} carga${fuelLogsCount === 1 ? "" : "s"} registrada${fuelLogsCount === 1 ? "" : "s"} — litros, costo y estación`, historyFleetFuelFormHtml(todayIsoDate, vehicleSelectOptions, driverSelectOptions), "Abrir registro", { createPanels: vehiclesCreateUi })}</div>`
    : "";
  const technicalPanel = canTechnicalLogs
    ? `<div class="auth-tab-panel${vehicleSection === "technical" ? "" : " hidden"}" data-vehicle-operate-pane="technical">${createHrActionCard("create-technical-log", "activity", "Taller", `${technicalLogsCount} novedad${technicalLogsCount === 1 ? "" : "es"} de mantenimiento — preventivo o correctivo`, historyFleetTechnicalFormHtml(todayIsoDate, vehicleSelectOptions), "Abrir formulario", { createPanels: vehiclesCreateUi })}</div>`
    : "";
  const vehicleRailCollapsed = isOperateRailCollapsed("vehicles");
  const vehicleOperatePanel =
    vehicleOperateTabs.length > 0
      ? `<div class="hr-workspace-panel vehicles-workspace-panel${vehicleWorkspace === "operate" ? "" : " hidden"}" role="tabpanel" data-vehicle-panel="operate">
      <section class="vehicles-operate vehicles-operate-panel${vehicleRailCollapsed ? " is-rail-collapsed" : ""}">
        <aside class="vehicles-operate__rail" aria-label="Trámites de registro">
          <div class="vehicles-operate__rail-head">
            <p class="vehicles-operate__rail-label">Tipo de trámite</p>
            <button type="button" class="vehicles-operate__rail-toggle" data-action="vehicles-operate-rail-toggle" aria-expanded="${vehicleRailCollapsed ? "false" : "true"}" title="${vehicleRailCollapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite"}">
              <span class="vehicles-operate__rail-toggle-ico" aria-hidden="true">${IC.chevronLeft}</span>
            </button>
          </div>
          ${vehicleOperateNav}
        </aside>
        <div class="vehicles-operate__main auth-tab-panels">${createPanel}${fuelPanel}${technicalPanel}</div>
      </section>
    </div>`
      : "";
  const fleetDataPane = `<div class="vehicles-data-pane${vehicleSection === "fleet" ? "" : " hidden"}" data-vehicle-data-pane="fleet">
      ${pcardWrap("truck", "Flota de camiones", fleetCardSubtitle, fleetMainBody)}
    </div>`;
  const vehicleDataPanel = `<div class="hr-workspace-panel vehicles-workspace-panel${vehicleWorkspace === "data" ? "" : " hidden"}" role="tabpanel" data-vehicle-panel="data">
      <section class="vehicles-data-panel">
        <div class="vehicles-data-toolbar payroll-data-toolbar payroll-data-toolbar--compact">${vehicleDataNav}</div>
        <div class="vehicles-data-panes">${fleetDataPane}</div>
      </section>
    </div>`;
  return `<section class="vehicles-studio vehicles-shell vehicles-shell--workspace hr-flow-shell" data-hr-workspace="${escapeAttr(vehicleWorkspace)}">${vehiclesWorkspaceHeader}
      <div class="hr-workspace-panels">
        ${vehicleOperatePanel}
        ${vehicleDataPanel}
      </div>
    </section>`;
}


(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ vehiclesHtml });
})();

(function registerTransportVehiclesPortalBinds() {
  "use strict";

  function bindTransportVehiclesPortalControls() {
    if (String(state.currentView || "") !== "transport-vehicles" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='transport-vehicles']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = String(btn.dataset.tab || "");
        if (!tab) return;
        const ws = normalizeVehicleWorkspace(tab);
        if (!HR_VALID_TRANSPORT_VEHICLES_WS.has(ws)) return;
        state.vehiclesUi = { ...(state.vehiclesUi || {}), workspace: ws };
        if (ws === "data") state.vehiclesUi.section = "fleet";
        if (ws === "operate") {
          const section = resolveVehicleSection(state.vehiclesUi);
          const panelId = vehiclesCreatePanelForSection(section);
          state.createPanels = buildVehiclesCreatePanelsState(section, state.createPanels || {}, { expandActive: false });
          persistHrWorkspace("transport-vehicles", ws);
          if (
            switchHrWorkspacePanels({
              root: nodes.viewRoot,
              moduleId: "transport-vehicles",
              workspace: ws,
              panelAttr: "data-vehicle-panel"
            })
          ) {
            if (panelId) syncVehiclesCreatePanelsInDom(nodes.viewRoot, panelId, { expandActive: false });
            return;
          }
          renderPortalView();
          return;
        }
        persistHrWorkspace("transport-vehicles", ws);
        if (
          switchHrWorkspacePanels({
            root: nodes.viewRoot,
            moduleId: "transport-vehicles",
            workspace: ws,
            panelAttr: "data-vehicle-panel"
          })
        ) {
          return;
        }
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-section']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = normalizeVehicleSection(btn.dataset.section);
        const panelId = vehiclesCreatePanelForSection(section);
        const ws = section === "fleet" ? "data" : "operate";
        state.vehiclesUi = { ...(state.vehiclesUi || {}), workspace: ws, section };
        if (ws === "operate" && panelId) {
          state.createPanels = buildVehiclesCreatePanelsState(section, state.createPanels || {}, { expandActive: false });
        }
        persistHrWorkspace("transport-vehicles", ws);
        switchHrWorkspacePanels({
          root: nodes.viewRoot,
          moduleId: "transport-vehicles",
          workspace: ws,
          panelAttr: "data-vehicle-panel"
        });
        const panelAttr = ws === "data" ? "data-vehicle-data-pane" : "data-vehicle-operate-pane";
        if (
          switchModuleTabPanels({
            root: nodes.viewRoot,
            action: "vehicles-section",
            activeValue: section,
            panelAttr,
            tabActiveClass: "is-active"
          })
        ) {
          if (ws === "operate" && panelId) {
            syncVehiclesCreatePanelsInDom(nodes.viewRoot, panelId, { expandActive: false });
          }
          return;
        }
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-operate-rail-toggle']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.closest(".vehicles-operate");
        if (!panel) return;
        const collapsed = panel.classList.toggle("is-rail-collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.setAttribute("title", collapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite");
        setOperateRailCollapsed("vehicles", collapsed);
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.vehiclesUi = { ...(state.vehiclesUi || {}), fleetSearch: String(el.value || "") };
        state.vehiclesRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        state.__vehiclesFleetSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = Number(window.RENDER_WINDOW_SIZE) || 30;
        state.vehiclesRenderLimit = (Number(state.vehiclesRenderLimit) || step) + step;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='vehicles-fleet-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeVehicleFleetLayout(btn.dataset.layout);
        state.vehiclesUi = { ...(state.vehiclesUi || {}), fleetLayout: layout };
        state.vehiclesRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
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
            const changedRequests = [];
            const nextRequests = reqRead().map((request) => {
              if (!request.trip || String(request.trip.vehicleId || "") !== vehicleId) return request;
              const nextRequest = {
                ...request,
                trip: {
                  ...request.trip,
                  vehicleId: null,
                  vehiclePlate: "CAMION ELIMINADO",
                  updatedAt: nowIso()
                }
              };
              changedRequests.push(nextRequest);
              return nextRequest;
            });
            await reqWriteAwait(nextRequests, changedRequests);
            recalculateResourceAvailability();
            notify(userMessage("vehicleDeleted"), "success");
            renderPortalView();
          }
        });
      });
    });

    const vehicleForm = document.getElementById("form-vehicle");
    if (vehicleForm) {
      bindHrFormWizard(vehicleForm);
      bindVehicleDocExpiryAutoFill(vehicleForm);
      wireFormSubmitGuard(vehicleForm, async (event) => {
        if (abortUnlessCanCreateVehicle()) return;
        const data = readFormEntriesNormalized(vehicleForm);
        const plate = String(data.plate || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (!/^[A-Z]{3}[0-9]{3}$/.test(plate)) {
          failPortalField(vehicleForm, "plate", userMessage("vehiclePlateInvalid"));
          return;
        }
        const modelYear = parseNum(data.year);
        const currentYear = new Date().getFullYear();
        if (modelYear < 1990 || modelYear > currentYear + 1) {
          failPortalField(vehicleForm, "year", userMessage("vehicleYearInvalid"));
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
        const createdVehicle = stampCreatedRecord({
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
        });
        list.push(createdVehicle);
        try {
          await writeAwaitServerCreate(KEYS.vehicles, list, createdVehicle);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
          return;
        }
        appendPortalEntityAuditLog(
          "create",
          "vehicles",
          "Camiones",
          createdVehicle,
          `${String(createdVehicle.type || "Vehículo")} · ${String(createdVehicle.brand || "")} ${String(createdVehicle.model || "")}`.trim(),
          {
            entityLabel: String(createdVehicle.plate || "").toUpperCase(),
            actor: getPortalAuditActorLabel()
          }
        );
        if (createdVehicle.updatedAt) {
          recordEntityHistoryActor(
            "Camiones",
            createdVehicle.id,
            createdVehicle.updatedAt,
            getPortalAuditActorLabel()
          );
        }
        notify(userMessage("vehicleRegistered"), "success");
        collapseCreatePanel("create-vehicle");
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) {}
        const refreshedVehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(createdVehicle.id));
        const createActor = getPortalAuditActorLabel();
        if (refreshedVehicle?.updatedAt && createActor) {
          recordEntityHistoryActor(
            "Camiones",
            refreshedVehicle.id,
            refreshedVehicle.updatedAt,
            createActor
          );
        }
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
            const freshVehicles = read(KEYS.vehicles, []);
            if (!freshVehicles.some((v) => String(v.id) === String(target.id))) {
              notify("El vehículo ya no está disponible. Actualice la página.", "error");
              return false;
            }
            const nextVehicles = freshVehicles.map((v) =>
              String(v.id) === String(target.id)
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
              await writeAwaitServerEdit(KEYS.vehicles, nextVehicles, target.id);
            } catch (err) {
              notify(String(err?.message || "No fue posible guardar el vehículo en el servidor."), "error");
              return false;
            }
            const updatedVehicle = nextVehicles.find((row) => row.id === target.id);
            const vehicleActor = getPortalAuditActorLabel();
            if (updatedVehicle) {
              appendPortalEntityAuditLog(
                "update",
                "vehicles",
                "Camiones",
                updatedVehicle,
                `${updatedVehicle.refrigerated ? "Termoking" : "Carga seca"} · ${parseNum(updatedVehicle.capacityKg).toLocaleString("es-CO")} kg`,
                {
                  entityLabel: String(updatedVehicle.plate || "").toUpperCase(),
                  actor: vehicleActor
                }
              );
              if (updatedVehicle.updatedAt && vehicleActor) {
                recordEntityHistoryActor("Camiones", updatedVehicle.id, updatedVehicle.updatedAt, vehicleActor);
              }
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
        if (!vehicle) {
          failPortalField(fuelLogForm, "vehicleId", userMessage("fuelSelectBoth"));
          return;
        }
        if (!driver) {
          failPortalField(fuelLogForm, "driverId", userMessage("fuelSelectBoth"));
          return;
        }
        const liters = parseNum(data.liters);
        const totalCost = parseMoneyFieldValue(data.totalCost);
        if (liters <= 0) {
          failPortalField(fuelLogForm, "liters", userMessage("fuelInvalidAmounts"));
          return;
        }
        if (totalCost < 0) {
          failPortalField(fuelLogForm, "totalCost", userMessage("fuelInvalidAmounts"));
          return;
        }
        try {
          const savedFuelLog = await appendFuelLogAwait({
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
          logPortalAuditEvent?.("vehicles", "create", {
            entityId: String(savedFuelLog?.id || ""),
            entityLabel: String(savedFuelLog?.vehiclePlate || vehicle.plate || "").toUpperCase(),
            summary: formatFuelLogAuditSummary(savedFuelLog),
            at: savedFuelLog?.createdAt
          });
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el combustible en el servidor."), "error");
          return;
        }
        notify(userMessage("fuelLogged"), "success");
        collapseCreatePanel("create-fuel-log");
        state.historyUi = { ...(state.historyUi || defaultHistoryUi()), moduleFilter: "Camiones", actionFilter: "create" };
        setView("history");
      });
    }

    const technicalLogForm = document.getElementById("form-technical-log");
    if (technicalLogForm) {
      wireMoneyInputs(technicalLogForm);
      wireFormSubmitGuard(technicalLogForm, async (event) => {
        const data = readFormEntriesNormalized(technicalLogForm);
        const vehicle = read(KEYS.vehicles, []).find((v) => String(v.id) === String(data.vehicleId || ""));
        if (!vehicle) {
          failPortalField(technicalLogForm, "vehicleId", userMessage("fuelSelectVehicle"));
          return;
        }
        const cost = parseMoneyFieldValue(data.cost);
        if (!String(data.description || "").trim()) {
          failPortalField(technicalLogForm, "description", "Indique una descripción de la novedad de taller.");
          return;
        }
        try {
          const savedTechLog = await appendVehicleTechnicalLogAwait({
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
          logPortalAuditEvent?.("vehicles", "create", {
            entityId: String(savedTechLog?.id || ""),
            entityLabel: String(savedTechLog?.vehiclePlate || vehicle.plate || "").toUpperCase(),
            summary: formatTechnicalLogAuditSummary(savedTechLog),
            at: savedTechLog?.createdAt
          });
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el mantenimiento en el servidor."), "error");
          return;
        }
        notify(userMessage("technicalLogged"), "success");
        collapseCreatePanel("create-technical-log");
        state.historyUi = { ...(state.historyUi || defaultHistoryUi()), moduleFilter: "Camiones", actionFilter: "create" };
        setView("history");
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
