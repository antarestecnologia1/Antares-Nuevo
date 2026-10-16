/**
 * Transporte · Conductores (`transport-drivers`): HTML y listeners del módulo.
 * Carga con `defer` después de `app.js`.
 */
function normalizeDriverFleetLayout(raw) {
  if (typeof AntaresDriversDomain !== "undefined" && AntaresDriversDomain.normalizeDriversFleetLayout) {
    return AntaresDriversDomain.normalizeDriversFleetLayout(raw);
  }
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

function normalizeDriverStatusFilter(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (["available", "busy", "scheduled", "offline"].includes(v)) return v;
  return "all";
}

function normalizeDriverDocFilter(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (["ok", "warning", "expired", "missing"].includes(v)) return v;
  return "all";
}

function normalizeDriverVehicleFilter(raw) {
  const v = String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (v === "mula") return "tractomula";
  if (["camion", "turbo", "tractomula", "none"].includes(v)) return v;
  return "all";
}

function driverMatchesVehicleFilter(driver, filter) {
  const f = normalizeDriverVehicleFilter(filter);
  if (f === "all") return true;
  const csv = String(driver?.vehicleTypes || driver?.tipos_vehiculo || "").trim();
  if (f === "none") return !csv;
  const typeByFilter = { camion: "Camion", turbo: "Turbo", tractomula: "Tractomula" };
  const type = typeByFilter[f];
  if (typeof driverHasCanonicalVehicleType === "function" && type) {
    return driverHasCanonicalVehicleType(driver, type);
  }
  const blob = csv
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (f === "tractomula") return blob.includes("tractomula") || /\bmula\b/.test(blob);
  return Boolean(type && blob.includes(f));
}

/** Texto agregado para buscar en conductores (insensible a mayúsculas). */
function driverFleetSearchHaystack(item) {
  const d = item.raw;
  const parts = [
    d.name,
    d.idDoc,
    d.phone,
    d.license,
    d.licenseCategory,
    d.vehicleTypes,
    typeof driverVehicleTypesCsvToLabel === "function" ? driverVehicleTypesCsvToLabel(d.vehicleTypes, "") : "",
    item.companyName,
    d.email,
    d.city,
    d.address,
    item.tripHeadline,
    item.tripDetail
  ];
  return parts.map((x) => String(x ?? "").toLowerCase()).join(" ");
}

function driversHtml() {
  const drivers = read(KEYS.drivers, []);
  const canEditDriver = canEditFleetDriverAsAdmin();
  const activeTrips = getActiveTrips();
  const activeTripsByDriverId = new Map();
  activeTrips.forEach((r) => {
    const key = String(r.trip?.driverId || "").trim();
    if (!key) return;
    if (!activeTripsByDriverId.has(key)) activeTripsByDriverId.set(key, []);
    activeTripsByDriverId.get(key).push(r);
  });
  const nowTs = Date.now();
  const resolveDriverOccupancy = (driverId) => {
    const list = activeTripsByDriverId.get(String(driverId)) || [];
    if (!list.length) return { tone: "available", trip: null, detail: "Sin viaje activo" };
    const ongoing = list.find((r) => describeTripTimingVsNow(r, nowTs).timing === "ongoing") || null;
    if (ongoing) {
      const ongoingInfo = describeTripTimingVsNow(ongoing, nowTs);
      return {
        tone: "busy",
        trip: ongoing,
        overdue: Boolean(ongoingInfo.overdue),
        detail: formatTripOngoingDetail(ongoingInfo)
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
        detail: `Reservado · inicia en ${formatTripMinutes(upcoming.info.minutes)}`
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
        detail: `Último viaje terminó hace ${formatTripMinutes(latestPast.info.minutes)}`
      };
    }
    return { tone: "available", trip: list[0] || null, detail: "Sin cruce horario activo" };
  };
  const buildDateMeta = (rawValue, missingLabel = "Sin fecha", warnDays = 60) => {
    const value = normalizePortalDateYmd(rawValue);
    if (!value) {
      return {
        bucket: "missing",
        label: missingLabel
      };
    }
    const days = daysUntil(value);
    if (days < 0) {
      return {
        bucket: "expired",
        label: `Vencida hace ${Math.abs(days)}d`,
        days
      };
    }
    if (days <= warnDays) {
      return {
        bucket: "warning",
        label: days === 0 ? "Vence hoy" : `Vence en ${days}d`,
        days
      };
    }
    return {
      bucket: "ok",
      label: `Vigente · ${days}d`,
      days
    };
  };
  const summaries = drivers.map((driver) => {
    const occupancy = resolveDriverOccupancy(driver.id);
    const companyName = String(getCompanyById(driver.companyId)?.name || "").trim() || "Sin empresa";
    const licenseMeta = buildDateMeta(driver.licenseExpiry, "Sin fecha");
    const hasSocialSecurity = Boolean(String(driver.eps || "").trim() && String(driver.arl || "").trim());
    const comparendos = Math.max(0, parseNum(driver.comparendos || 0));
    const experienceYears = Math.max(0, parseNum(driver.experienceYears || 0));
    const statusSlug = isManuallyUnavailable(driver)
      ? "offline"
      : occupancy.tone === "busy"
        ? "busy"
        : occupancy.tone === "scheduled"
          ? "scheduled"
          : "available";
    const statusTag = statusSlug === "offline"
      ? '<span class="status status-fleet-offline">No disponible</span>'
      : statusSlug === "busy"
        ? '<span class="status status-fleet-ocupado">Ocupado</span>'
        : statusSlug === "scheduled"
          ? '<span class="status status-fleet-programado">Reservado</span>'
          : '<span class="status status-fleet-disponible">Disponible</span>';
    const docBucket = (() => {
      if (licenseMeta.bucket === "expired") return "expired";
      if (licenseMeta.bucket === "missing" || !hasSocialSecurity) return "missing";
      if (licenseMeta.bucket === "warning" || comparendos > 0) return "warning";
      return "ok";
    })();
    const docBadge = docBucket === "expired"
      ? "Critico"
      : docBucket === "missing"
        ? "Incompleto"
        : docBucket === "warning"
          ? "Por vencer"
          : "Al dia";
    const tripHeadline = occupancy.trip
      ? `Viaje ${String(occupancy.trip.trip?.tripNumber || "-")}`
      : statusSlug === "offline"
        ? "No disponible"
        : "Disponible";
    const tripDetail = occupancy.trip
      ? String(occupancy.trip.clientName || occupancy.trip.companyName || occupancy.trip.request?.clientName || "").trim() || occupancy.detail
      : occupancy.detail;
    return {
      raw: driver,
      companyName,
      statusSlug,
      statusTag,
      occupancy,
      licenseMeta,
      hasSocialSecurity,
      comparendos,
      experienceYears,
      docBucket,
      docBadge,
      tripHeadline,
      tripDetail
    };
  });
  const totalDrivers = summaries.length;
  const availableDrivers = summaries.filter((item) => item.statusSlug === "available").length;
  const occupiedDrivers = summaries.filter((item) => item.statusSlug === "busy").length;
  const scheduledDrivers = summaries.filter((item) => item.statusSlug === "scheduled").length;
  const offlineDrivers = summaries.filter((item) => item.statusSlug === "offline").length;
  const docRiskCount = summaries.filter((item) => item.docBucket !== "ok").length;
  const expiredDocsCount = summaries.filter((item) => item.docBucket === "expired").length;
  const camionDrivers = summaries.filter((item) => driverMatchesVehicleFilter(item.raw, "camion")).length;
  const mulaDrivers = summaries.filter((item) => driverMatchesVehicleFilter(item.raw, "tractomula")).length;

  const driversUi = state.driversUi || {};
  const fleetSearchRaw = String(driversUi.fleetSearch ?? "");
  const fleetSearchNorm = fleetSearchRaw.trim().toLowerCase();
  const fleetLayout = normalizeDriverFleetLayout(driversUi.fleetLayout);
  const statusFilter = normalizeDriverStatusFilter(driversUi.statusFilter);
  const docFilter = normalizeDriverDocFilter(driversUi.docFilter);
  const vehicleFilter = normalizeDriverVehicleFilter(driversUi.vehicleType);
  const companyFilter = String(driversUi.companyId ?? "").trim();
  const licenseStateFilter = String(driversUi.licenseState ?? "").trim();
  const licenseCatFilter = String(driversUi.licenseCat ?? "").trim();
  const socialFilter = String(driversUi.socialSecurity ?? "").trim();
  const finesFilter = String(driversUi.fines ?? "").trim();
  const expFilter = String(driversUi.experience ?? "").trim();
  const getCompaniesForFilter = () =>
    (typeof read === "function" ? read(KEYS.companies, []) : [])
      .filter((c) => isCompanyRecordActive(c))
      .map((c) => [String(c.id), String(c.name || "")])
      .sort((x, y) => x[1].localeCompare(y[1], "es", { sensitivity: "base" }));
  const expBucketOf = (y) => (y < 2 ? "0-2" : y < 5 ? "2-5" : y < 10 ? "5-10" : "10+");

  const filteredSummaries = summaries.filter((item) => {
    if (licenseStateFilter && item.licenseMeta.bucket !== licenseStateFilter) return false;
    if (licenseCatFilter && String(item.raw.licenseCategory || "").trim() !== licenseCatFilter) return false;
    if (socialFilter === "ok" && !item.hasSocialSecurity) return false;
    if (socialFilter === "missing" && item.hasSocialSecurity) return false;
    if (finesFilter === "none" && item.comparendos > 0) return false;
    if (finesFilter === "some" && item.comparendos === 0) return false;
    if (expFilter && expBucketOf(item.experienceYears) !== expFilter) return false;
    if (statusFilter !== "all" && item.statusSlug !== statusFilter) return false;
    if (docFilter !== "all" && item.docBucket !== docFilter) return false;
    if (vehicleFilter !== "all" && !driverMatchesVehicleFilter(item.raw, vehicleFilter)) return false;
    if (companyFilter && String(item.raw.companyId ?? "").trim() !== companyFilter) return false;
    if (fleetSearchNorm && !driverFleetSearchHaystack(item).includes(fleetSearchNorm)) return false;
    return true;
  });
  const driversRenderWindowSize = Number(window.RENDER_WINDOW_SIZE) || 30;
  const driversRenderLimit = Number(state.driversRenderLimit) || driversRenderWindowSize;
  const visibleDriverSummaries = filteredSummaries.slice(0, driversRenderLimit);
  const driversMoreBar =
    typeof renderWindowMoreBar === "function"
      ? renderWindowMoreBar(filteredSummaries.length, visibleDriverSummaries.length, "drivers-render-more")
      : filteredSummaries.length > visibleDriverSummaries.length
        ? `<div class="render-window-more"><button type="button" class="btn btn-outline btn-sm" data-action="drivers-render-more">Ver más · mostrando ${visibleDriverSummaries.length} de ${filteredSummaries.length}</button></div>`
        : "";

  const optSel = (value, current) => (String(value) === String(current) ? "selected" : "");
  const statusLabelOf = (slug) =>
    slug === "offline" ? "No disponible" : slug === "busy" ? "Ocupado" : slug === "scheduled" ? "Reservado" : "Disponible";
  const docLabelOf = (bucket) =>
    bucket === "expired" ? "Crítico" : bucket === "missing" ? "Incompleto" : bucket === "warning" ? "Por vencer" : "Al día";
  const docToneOf = (bucket) =>
    bucket === "expired" ? "alert" : bucket === "missing" || bucket === "warning" ? "warn" : "ok";
  const hueOf = (name) => (typeof agAvatarHue === "function" ? agAvatarHue(name) : 0);
  const initialsOf = (name) =>
    String(name || "C")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "C";
  const photoOf = (d) => {
    const url = String(d.photoUrl || "").trim();
    return url && (/^https?:\/\//i.test(url) || /^data:image\//i.test(url)) ? url : "";
  };
  const avatarHtml = (d, statusSlug, size = "") => {
    const photo = photoOf(d);
    const name = String(d.name || "");
    return `<span class="ag-avatar ag-avatar--hue-${hueOf(name)} ag-avatar--ring-${escapeAttr(statusSlug)}${size ? ` ag-avatar--${size}` : ""}" aria-hidden="true">${
      photo ? `<img src="${escapeAttr(photo)}" alt="" loading="lazy" />` : escapeHtml(initialsOf(name))
    }</span>`;
  };
  const vehicleChipsHtml = (csv) => {
    const label = driverVehicleTypesCsvToLabel(csv, "");
    if (!label) return '<span class="ag-tag ag-tag--muted">Sin categoría</span>';
    return label
      .split(/\s*,\s*/)
      .filter(Boolean)
      .map((v) => `<span class="ag-tag ag-tag--vehicle">${IC.truck}${escapeHtml(v)}</span>`)
      .join("");
  };

  const renderDriverCard = (item) => {
    const d = item.raw;
    const id = String(d.id ?? "");
    const name = String(d.name || "Conductor");
    const statusLabel = statusLabelOf(item.statusSlug);
    const licenseCategory = String(d.licenseCategory || "").trim() || "—";
    const licenseNumber = String(d.license || "").trim() || "Sin número";
    const days = item.licenseMeta.days;
    const licenseTone =
      item.licenseMeta.bucket === "expired" ? "alert" : item.licenseMeta.bucket === "ok" ? "ok" : "warn";
    const licenseCaption =
      item.licenseMeta.bucket === "missing"
        ? "Sin fecha de vencimiento"
        : item.licenseMeta.bucket === "expired"
          ? `Vencida hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`
          : days === 0
            ? "Vence hoy"
            : `Vence en ${days} día${days === 1 ? "" : "s"}`;
    const licensePct =
      typeof days === "number" && days > 0 ? Math.min(100, Math.max(4, Math.round((days / 365) * 100))) : 0;
    const expiryYmd = normalizePortalDateYmd(d.licenseExpiry);
    const phoneRaw = String(d.phone || "").replace(/[^\d+]/g, "");
    const phoneLabel = d.phone ? formatPortalPhoneForDisplay(String(d.phone)) : "";
    const trip = item.occupancy.trip;
    const tripRequestId = trip ? String(trip.id || "").trim() : "";
    const tripNumber = trip ? String(trip.trip?.tripNumber || "—") : "";
    const tripClient = trip
      ? String(trip.clientName || trip.companyName || trip.request?.clientName || "").trim() || item.tripDetail
      : "";
    const tripStrip = trip
      ? `<div class="ag-pass__trip ag-pass__trip--${escapeAttr(item.statusSlug)}">
          <span class="ag-pass__trip-ico" aria-hidden="true">${IC.mapPin}</span>
          <div class="ag-pass__trip-copy">
            <strong>Viaje ${escapeHtml(tripNumber)}</strong>
            <span>${escapeHtml(tripClient)} · ${escapeHtml(item.occupancy.detail)}</span>
          </div>
          ${
            tripRequestId
              ? `<button type="button" class="ag-link-btn" data-action="trip-detail" data-id="${escapeAttr(tripRequestId)}">Ver viaje</button>`
              : ""
          }
        </div>`
      : `<div class="ag-pass__trip ag-pass__trip--${escapeAttr(item.statusSlug)} ag-pass__trip--idle">
          <span class="ag-status__dot" aria-hidden="true"></span>
          <div class="ag-pass__trip-copy"><span>${escapeHtml(item.tripDetail)}</span></div>
        </div>`;
    const checks = [
      {
        icon: IC.shield,
        label: item.hasSocialSecurity ? "EPS y ARL" : "Falta EPS/ARL",
        tone: item.hasSocialSecurity ? "ok" : "warn"
      },
      {
        icon: IC.scale,
        label: item.comparendos > 0 ? `${item.comparendos} comparendo${item.comparendos === 1 ? "" : "s"}` : "Sin comparendos",
        tone: item.comparendos > 0 ? "warn" : "ok"
      },
      {
        icon: IC.award,
        label: item.experienceYears ? `${item.experienceYears} año${item.experienceYears === 1 ? "" : "s"} exp.` : "Exp. sin dato",
        tone: "neutral"
      }
    ]
      .map((c) => `<span class="ag-check ag-check--${c.tone}">${c.icon}<span>${escapeHtml(c.label)}</span></span>`)
      .join("");

    return `<article class="ag-pass ag-pass--${escapeAttr(item.statusSlug)} ag-pass--doc-${escapeAttr(item.docBucket)}" data-driver-id="${escapeAttr(id)}">
      <header class="ag-pass__head">
        ${avatarHtml(d, item.statusSlug, "lg")}
        <div class="ag-pass__who">
          <h4 class="ag-pass__name" title="${escapeAttr(name)}">${escapeHtml(name)}</h4>
          <p class="ag-pass__meta">${escapeHtml(String(d.idDoc || "—"))} · ${escapeHtml(item.companyName)}</p>
        </div>
        <span class="ag-status ag-status--${escapeAttr(item.statusSlug)}"><span class="ag-status__dot" aria-hidden="true"></span>${escapeHtml(statusLabel)}</span>
      </header>
      <div class="ag-pass__license ag-pass__license--${licenseTone}">
        <span class="ag-pass__cat" title="Categoría de licencia">${escapeHtml(licenseCategory)}</span>
        <div class="ag-pass__license-body">
          <div class="ag-pass__license-top">
            <span class="ag-pass__license-num">${escapeHtml(licenseNumber)}</span>
            <span class="ag-pass__doc ag-pass__doc--${docToneOf(item.docBucket)}" title="Estado documental">${escapeHtml(docLabelOf(item.docBucket))}</span>
          </div>
          <div class="ag-meter" role="img" aria-label="Licencia: ${escapeAttr(licenseCaption)}"><span style="width:${licensePct}%"></span></div>
          <div class="ag-pass__license-foot">
            <span>${escapeHtml(licenseCaption)}</span>
            ${expiryYmd ? `<span>${escapeHtml(fmtDateOr(expiryYmd))}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="ag-pass__checks">${checks}</div>
      <div class="ag-pass__vehicles">${vehicleChipsHtml(d.vehicleTypes)}</div>
      ${tripStrip}
      <footer class="ag-pass__foot">
        ${
          phoneLabel
            ? `<a class="ag-pass__phone" href="tel:${escapeAttr(phoneRaw)}" title="Llamar">${IC.phone}<span>${escapeHtml(phoneLabel)}</span></a>`
            : '<span class="ag-pass__phone ag-pass__phone--muted">Sin teléfono</span>'
        }
        <div class="ag-pass__actions">
          ${
            canEditDriver
              ? `<button type="button" class="ag-icon-btn" data-action="toggle-driver" data-id="${escapeAttr(id)}" title="${item.statusSlug === "offline" ? "Marcar disponible" : "Marcar no disponible"}" aria-label="Cambiar disponibilidad">${IC.toggle}</button>
          <button type="button" class="ag-icon-btn" data-action="edit-driver" data-id="${escapeAttr(id)}" title="Editar datos operativos" aria-label="Editar ${escapeAttr(name)}">${IC.edit}</button>`
              : ""
          }
          <button type="button" class="ag-btn ag-btn--primary" data-action="view-driver" data-id="${escapeAttr(id)}">${IC.eye}<span>Ver ficha</span></button>
        </div>
      </footer>
    </article>`;
  };

  const cardsHtml = visibleDriverSummaries.map(renderDriverCard).join("");

  const driverListRows = visibleDriverSummaries
    .map((item) => {
      const d = item.raw;
      const id = String(d.id ?? "");
      const days = item.licenseMeta.days;
      const licenseText =
        item.licenseMeta.bucket === "missing"
          ? "Sin fecha"
          : item.licenseMeta.bucket === "expired"
            ? `Vencida · ${Math.abs(days)}d`
            : `${days}d restantes`;
      return `<tr data-driver-id="${escapeAttr(id)}" class="ag-row ag-row--${escapeAttr(item.statusSlug)}">
        <td data-label="Conductor">
          <div class="ag-row__who">
            ${avatarHtml(d, item.statusSlug, "sm")}
            <div><strong>${escapeHtml(String(d.name || "—"))}</strong><span>${escapeHtml(String(d.idDoc || "—"))} · ${escapeHtml(item.companyName)}</span></div>
          </div>
        </td>
        <td data-label="Estado"><span class="ag-status ag-status--${escapeAttr(item.statusSlug)}"><span class="ag-status__dot" aria-hidden="true"></span>${escapeHtml(statusLabelOf(item.statusSlug))}</span></td>
        <td data-label="Licencia"><strong class="ag-row__mono">${escapeHtml(String(d.licenseCategory || "—"))}</strong> <span class="ag-row__sub">${escapeHtml(licenseText)}</span></td>
        <td data-label="Documentación"><span class="ag-pass__doc ag-pass__doc--${docToneOf(item.docBucket)}">${escapeHtml(docLabelOf(item.docBucket))}</span></td>
        <td data-label="Vehículos"><div class="ag-row__tags">${vehicleChipsHtml(d.vehicleTypes)}</div></td>
        <td data-label="Disponibilidad"><span class="ag-row__strong">${escapeHtml(item.tripHeadline)}</span><span class="ag-row__sub">${escapeHtml(item.tripDetail)}</span></td>
        <td data-label="Acciones" class="ag-row__actions">
          ${
            canEditDriver
              ? `<button type="button" class="ag-icon-btn" data-action="toggle-driver" data-id="${escapeAttr(id)}" title="Cambiar disponibilidad" aria-label="Cambiar disponibilidad">${IC.toggle}</button>
          <button type="button" class="ag-icon-btn" data-action="edit-driver" data-id="${escapeAttr(id)}" title="Editar" aria-label="Editar">${IC.edit}</button>`
              : ""
          }
          <button type="button" class="ag-icon-btn ag-icon-btn--primary" data-action="view-driver" data-id="${escapeAttr(id)}" title="Ver ficha" aria-label="Ver ficha">${IC.eye}</button>
        </td>
      </tr>`;
    })
    .join("");

  const fleetListTable =
    fleetLayout === "list" && filteredSummaries.length > 0
      ? `<div class="ag-fleet-table-wrap"><table class="ag-table driver-fleet-table">
    <thead><tr>
      <th>Conductor</th><th>Estado</th><th>Licencia</th><th>Documentación</th><th>Vehículos</th><th>Disponibilidad</th><th><span class="visually-hidden">Acciones</span></th>
    </tr></thead>
    <tbody>${driverListRows}</tbody>
  </table></div>`
      : "";

  const fleetCardsGrid = fleetLayout === "cards" && cardsHtml ? `<div class="ag-pass-grid">${cardsHtml}</div>` : "";

  const companies = read(KEYS.companies, []);
  const companyOptions = [`<option value="" ${companyFilter ? "" : "selected"}>Todas las empresas</option>`]
    .concat(
      companies
        .filter((c) => isCompanyRecordActive(c))
        .map(
          (c) =>
            `<option value="${escapeAttr(String(c.id))}" ${optSel(String(c.id), companyFilter)}>${escapeHtml(String(c.name || ""))}</option>`
        )
    )
    .join("");

  const filtersActive =
    Boolean(fleetSearchNorm) ||
    statusFilter !== "all" ||
    docFilter !== "all" ||
    vehicleFilter !== "all" ||
    Boolean(companyFilter || licenseStateFilter || licenseCatFilter || socialFilter || finesFilter || expFilter);
  const driverFieldFilters = renderModuleFieldFilters({
    ariaLabel: "Filtros de conductores",
    action: "drivers-field",
    clearAction: "drivers-fields-clear",
    extraClass: "drivers-field-filters",
    fields: [
      { key: "licenseState", label: "Vigencia de licencia", value: licenseStateFilter, allLabel: "Cualquiera",
        options: [["ok", "Vigente"], ["warning", "Por vencer (≤ 60 días)"], ["expired", "Vencida"], ["missing", "Sin fecha registrada"]] },
      { key: "licenseCat", label: "Categoría de licencia", value: licenseCatFilter, allLabel: "Todas las categorías",
        options: uniqueSortedFilterValues(drivers.map((d) => d.licenseCategory)).map((v) => [v, v]) },
      { key: "vehicleType", label: "Tipo de vehículo", value: vehicleFilter === "all" ? "" : vehicleFilter, allLabel: "Todos los vehículos",
        options: [["camion", "Camión"], ["turbo", "Turbo"], ["tractomula", "Tractomula"], ["none", "Sin categoría"]] },
      { key: "experience", label: "Experiencia", value: expFilter, allLabel: "Cualquiera",
        options: [["0-2", "Menos de 2 años"], ["2-5", "2 a 5 años"], ["5-10", "5 a 10 años"], ["10+", "Más de 10 años"]] },
      { key: "socialSecurity", label: "EPS y ARL", value: socialFilter, allLabel: "Todas",
        options: [["ok", "Completas"], ["missing", "Incompletas"]] },
      { key: "fines", label: "Comparendos", value: finesFilter, allLabel: "Todos",
        options: [["none", "Sin comparendos"], ["some", "Con comparendos"]] },
      { key: "docFilter", label: "Estado documental", value: docFilter === "all" ? "" : docFilter, allLabel: "Cualquiera",
        options: [["ok", "Al día"], ["warning", "Por vencer"], ["missing", "Incompleto"], ["expired", "Crítico"]] },
      { key: "companyId", label: "Empresa", value: companyFilter, allLabel: "Todas las empresas",
        options: getCompaniesForFilter() }
    ]
  });
  const statusPills = [
    ["all", "Todos", totalDrivers],
    ["available", "Disponibles", availableDrivers],
    ["busy", "Ocupados", occupiedDrivers],
    ["scheduled", "Reservados", scheduledDrivers],
    ["offline", "No disponibles", offlineDrivers]
  ]
    .map(
      ([value, label, count]) =>
        `<button type="button" class="ag-seg__btn ag-seg__btn--${value}${statusFilter === value ? " is-active" : ""}" data-action="drivers-status-pill" data-status="${value}" aria-pressed="${statusFilter === value}"><span class="ag-seg__dot" aria-hidden="true"></span>${label}<span class="ag-seg__count">${count}</span></button>`
    )
    .join("");

  const fleetToolbar =
    totalDrivers > 0
      ? `<div class="ag-fleet__controls">
      <div class="ag-fleet__row">
        <div class="ag-seg" role="group" aria-label="Filtrar por estado operativo">${statusPills}</div>
        <div class="ag-fleet__view" role="group" aria-label="Vista de conductores">
          <button type="button" class="ag-icon-btn${fleetLayout === "cards" ? " is-active" : ""}" data-action="drivers-fleet-layout" data-layout="cards" title="Tarjetas" aria-label="Vista en tarjetas" aria-pressed="${fleetLayout === "cards"}">${IC.grid}</button>
          <button type="button" class="ag-icon-btn${fleetLayout === "list" ? " is-active" : ""}" data-action="drivers-fleet-layout" data-layout="list" title="Lista" aria-label="Vista en lista" aria-pressed="${fleetLayout === "list"}">${IC.list}</button>
        </div>
      </div>
      <div class="ag-fleet__row ag-fleet__row--filters">
        <label class="ag-search">
          ${IC.search}
          <span class="visually-hidden">Buscar conductor</span>
          <input type="search" data-action="drivers-fleet-search" value="${escapeAttr(fleetSearchRaw)}" placeholder="Nombre, documento, teléfono, empresa…" autocomplete="off" />
        </label>
      </div>
      ${driverFieldFilters}
    </div>`
      : "";

  let fleetMainBody;
  if (!totalDrivers) {
    fleetMainBody = emptyState("No hay conductores registrados.");
  } else if (!filteredSummaries.length) {
    fleetMainBody = `${fleetToolbar}${emptyState("Ningún conductor coincide con la búsqueda o los filtros.")}`;
  } else {
    fleetMainBody = `${fleetToolbar}${fleetLayout === "list" ? fleetListTable : fleetCardsGrid}${driversMoreBar}`;
  }

  const moduleHint = canEditDriver
    ? "Alta, baja y ficha completa en Gestión humana. Aquí puede ajustar datos operativos (se copian a GH)."
    : "Solo consulta. La ficha completa se edita en Gestión humana.";
  const availablePct = totalDrivers ? Math.round((availableDrivers / totalDrivers) * 100) : 0;
  const resultLine = filtersActive
    ? `${filteredSummaries.length} de ${totalDrivers} conductores`
    : `${totalDrivers} conductor${totalDrivers === 1 ? "" : "es"} registrados`;
  const kpi = (label, value, sub, tone = "") =>
    `<div class="ag-kpi${tone ? ` ag-kpi--${tone}` : ""}"><span class="ag-kpi__label">${escapeHtml(label)}</span><strong class="ag-kpi__value">${value}</strong><span class="ag-kpi__sub">${escapeHtml(sub)}</span></div>`;
  const header = `<header class="ag-fleet__head">
    <div class="ag-fleet__title">
      <p class="ag-eyebrow">Transporte · Flota humana</p>
      <h2>Conductores</h2>
      <p class="ag-fleet__hint">${escapeHtml(resultLine)} · ${escapeHtml(moduleHint)}</p>
    </div>
    <div class="ag-fleet__kpis">
      <div class="ag-kpi ag-kpi--ring">
        <span class="ag-ring" style="--pct:${availablePct}" role="img" aria-label="${availablePct}% disponibles"><span>${availablePct}%</span></span>
        <div><span class="ag-kpi__label">Disponibles</span><strong class="ag-kpi__value">${availableDrivers}<small>/${totalDrivers}</small></strong></div>
      </div>
      ${kpi("En ruta", occupiedDrivers + scheduledDrivers, `${occupiedDrivers} en curso · ${scheduledDrivers} reservados`)}
      ${kpi("Riesgo documental", docRiskCount, expiredDocsCount ? `${expiredDocsCount} crítico${expiredDocsCount === 1 ? "" : "s"}` : "Sin críticos", expiredDocsCount ? "alert" : docRiskCount ? "warn" : "ok")}
      ${kpi("Por categoría", camionDrivers, `camión · ${mulaDrivers} mula`)}
    </div>
  </header>`;
  return `<section class="drivers-studio ag-fleet">${header}<div class="ag-fleet__body">${fleetMainBody}</div></section>`;
}

(function registerLegacyViewChunk() {
  if (typeof window.registerLegacyPortalViews !== "function") return;
  window.registerLegacyPortalViews({ driversHtml });
})();

(function registerTransportDriversPortalBinds() {
  "use strict";

  function bindTransportDriversPortalControls() {
    if (String(state.currentView || "") !== "transport-drivers" || !nodes.viewRoot) return;

    nodes.viewRoot.querySelectorAll("[data-action='delete-driver']").forEach((btn) => {
      btn.addEventListener("click", () => {
        notify(userMessage("driverDeleteUseHr"), "error");
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-fleet-search']").forEach((input) => {
      input.addEventListener("input", () => {
        const el = /** @type {HTMLInputElement} */ (input);
        const len = String(el.value || "").length;
        const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        state.driversUi = { ...(state.driversUi || {}), fleetSearch: String(el.value || "") };
        state.driversRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        state.__driversFleetSearchRestore = { start, end };
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-render-more']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = Number(window.RENDER_WINDOW_SIZE) || 30;
        state.driversRenderLimit = (Number(state.driversRenderLimit) || step) + step;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-fleet-layout']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const layout = normalizeDriverFleetLayout(btn.dataset.layout);
        state.driversUi = { ...(state.driversUi || {}), fleetLayout: layout };
        state.driversRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-status-pill']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.driversUi = { ...(state.driversUi || {}), statusFilter: normalizeDriverStatusFilter(btn.dataset.status) };
        state.driversRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-fleet-clear']").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.driversUi = {
          ...(state.driversUi || {}),
          fleetSearch: "",
          statusFilter: "all",
          docFilter: "all",
          vehicleType: "all",
          companyId: "",
          licenseState: "",
          licenseCat: "",
          socialSecurity: "",
          fines: "",
          experience: ""
        };
        state.driversRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    bindModuleFieldFilters(nodes.viewRoot, {
      action: "drivers-field",
      clearAction: "drivers-fields-clear",
      onChange: (key, value) => {
        const prev = state.driversUi || {};
        const keys = ["licenseState", "licenseCat", "vehicleType", "experience", "socialSecurity", "fines", "docFilter", "companyId"];
        if (!keys.includes(key)) return;
        let v = value;
        if (key === "vehicleType") v = value ? normalizeDriverVehicleFilter(value) : "all";
        if (key === "docFilter") v = value ? normalizeDriverDocFilter(value) : "all";
        state.driversUi = { ...prev, [key]: v };
        state.driversRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      },
      onClear: () => {
        state.driversUi = {
          ...(state.driversUi || {}),
          docFilter: "all",
          vehicleType: "all",
          companyId: "",
          licenseState: "",
          licenseCat: "",
          socialSecurity: "",
          fines: "",
          experience: ""
        };
        state.driversRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      }
    });

    nodes.viewRoot.querySelectorAll("[data-action='drivers-fleet-filter']").forEach((el) => {
      el.addEventListener("change", () => {
        const sel = /** @type {HTMLSelectElement} */ (el);
        const filter = String(sel.dataset.filter || "");
        const value = String(sel.value || "");
        const prev = state.driversUi || {};
        if (filter === "status") {
          state.driversUi = { ...prev, statusFilter: normalizeDriverStatusFilter(value) };
        } else if (filter === "doc") {
          state.driversUi = { ...prev, docFilter: normalizeDriverDocFilter(value) };
        } else if (filter === "company") {
          state.driversUi = { ...prev, companyId: value };
        } else if (filter === "vehicle") {
          state.driversUi = { ...prev, vehicleType: normalizeDriverVehicleFilter(value) };
        }
        state.driversRenderLimit = Number(window.RENDER_WINDOW_SIZE) || 30;
        renderPortalView();
      });
    });

    nodes.viewRoot.querySelectorAll("[data-action='trip-detail']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const req = reqRead().find((r) => String(r.id) === String(btn.dataset.id || ""));
        if (!req || !req.trip) return;
        openAssignedTripInfoModal(req);
      });
    });

    const driverForm = document.getElementById("form-driver");
    if (driverForm) {
      attachDepartmentCitySelects(driverForm, {
        departmentSelector: "select[name='department']",
        citySelector: "select[name='city']"
      });
      wireFormSubmitGuard(driverForm, async (event) => {
        const actor = currentUser();
        const data = readFormEntriesNormalized(driverForm);
        if (!/^\d{10,15}$/.test(String(data.phone || "").trim())) {
          failPortalField(driverForm, "phone", userMessage("driverPhoneInvalid"));
          return;
        }
        const docValidation = validateColombianDocument(data.documentType, data.idDoc);
        if (!docValidation.ok) {
          failPortalField(driverForm, "idDoc", docValidation.message);
          return;
        }
        data.idDoc = docValidation.normalized;
        const normalizedPreview = normalizeDriverFormPayloadForStorage(data);
        if (!normalizedPreview.licenseIssueDate) {
          failPortalField(driverForm, "licenseIssueDate", userMessage("driverLicenseRegister"));
          return;
        }
        if (
          !normalizedPreview.licenseExpiry ||
          new Date(String(normalizedPreview.licenseExpiry || "")).getTime() <= Date.now()
        ) {
          failPortalField(driverForm, "licenseIssueDate", userMessage("driverLicenseRegister"));
          return;
        }
        if (actor?.role !== ROLES.ADMIN) {
          await queueApproval({
            type: "create_driver",
            title: `Creacion de conductor ${normalizeLatinUpperForDb(data.name)}`,
            payload: normalizedPreview,
            requestedByUserId: actor?.id || "",
            requestedByName: actor?.name || "Usuario"
          });
          notify(userMessage("driverApprovalQueued"), "info");
          renderPortalView();
          return;
        }
        const driverPayload = normalizedPreview;
        const list = read(KEYS.drivers, []);
        const createdDriver = stampCreatedRecord({
          id: newUuidV4(),
          ...driverPayload,
          available: true,
          hiredAt: nowIso()
        });
        list.push(createdDriver);
        try {
          await writeAwaitServerCreate(KEYS.drivers, list, createdDriver);
        } catch (err) {
          notify(String(err?.message || "No fue posible guardar el conductor en el servidor."), "error");
          return;
        }
        appendPortalEntityAuditLog("create", "drivers", "Conductores", createdDriver, `${String(createdDriver.licenseCategory || "Sin categoría")} · ${String(createdDriver.city || "Sin ciudad")}`, {
          actor: getPortalAuditActorLabel()
        });
        const employees = read(KEYS.payrollEmployees, []);
        const existsEmployee = employees.some((e) => String(e.idDoc || "") === String(data.idDoc || ""));
        if (!existsEmployee) {
          const createdEmployee = stampCreatedRecord({
            id: newUuidV4(),
            name: driverPayload.name || normalizeLatinUpperForDb(data.name),
            idDoc: data.idDoc,
            documentType: data.documentType,
            position: "CONDUCTOR",
            contractType: normalizeLatinUpperForDb(data.contractType || "Indefinido"),
            workerRole: "conductor",
            city: driverPayload.city || normalizeLatinForDb(data.city || ""),
            address: driverPayload.address || normalizeLatinUpperForDb(data.address || ""),
            phone: driverPayload.phone || normalizePortalPhoneForStorage(data.phone || ""),
            emergencyContact:
              driverPayload.emergencyContact || normalizeLatinUpperForDb(data.emergencyContact || ""),
            emergencyPhone:
              driverPayload.emergencyPhone || normalizePortalPhoneForStorage(data.emergencyPhone || ""),
            companyId: data.companyId || "",
            baseSalary: parseNum(data.baseSalary),
            startDate: data.startDate || nowIso().slice(0, 10)
          });
          employees.push(createdEmployee);
          try {
            await writeAwaitServerCreate(KEYS.payrollEmployees, employees, createdEmployee);
            appendPayrollEmployeeAuditLog("create", createdEmployee, {
              summary: "CONDUCTOR · vinculado al crear conductor en flota"
            });
            const propagate = await propagateEmployeeChanges(createdEmployee, {
              license: createdEmployee.license,
              licenseCategory: createdEmployee.licenseCategory,
              licenseExpiry: createdEmployee.licenseExpiry,
              isNewHire: true
            });
            if (typeof window.archiveEmployeeHirePackageToFolder === "function") {
              void window.archiveEmployeeHirePackageToFolder(createdEmployee, {
                includeContract: true,
                includeLaborLetter: true
              });
            }
            if (!propagate.ok) {
              notify(
                propagate.message ||
                  "Conductor guardado; no fue posible registrar el contrato del empleado vinculado.",
                "error"
              );
            }
          } catch (err) {
            notify(String(err?.message || "Conductor guardado; no fue posible crear el vínculo de empleado en el servidor."), "error");
          }
        }
        notify(userMessage("driverCreated"), "success");
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) { window.AntaresLogSilentError?.("conductores.js:824", _e); }
        const refreshedCreate = read(KEYS.drivers, []).find((d) => String(d.id) === String(createdDriver.id));
        const createActor = getPortalAuditActorLabel();
        if (refreshedCreate?.updatedAt && createActor) {
          recordEntityHistoryActor("Conductores", refreshedCreate.id, refreshedCreate.updatedAt, createActor);
        }
        renderPortalView();
      }, { busyText: "Registrando conductor…" });
    }

    /* Conductor Ver/Estado: installDriverCardActionsDelegation() */

    nodes.viewRoot.querySelectorAll("[data-action='edit-driver']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (abortUnlessAdminForFleetDriverEdit()) return;
        const did = String(btn.dataset.id || "").trim();
        if (!did) return;
        if (btn.dataset.busy === "1") return;
        btn.dataset.busy = "1";
        btn.disabled = true;
        btn.setAttribute("aria-busy", "true");
        try {
          if (portalCanRefreshFromApi()) await applyPortalBootstrapFromApi();
        } catch (_e) {
        } finally {
          btn.dataset.busy = "0";
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
        }
        const all = read(KEYS.drivers, []);
        const rawTarget = all.find((v) => String(v.id ?? "").trim() === did);
        const target = normalizeDriverRowForEditor(rawTarget);
        if (!target) {
          notify("No se encontro el conductor en el servidor. Actualice la pagina o verifique su conexion.", "error");
          return;
        }
        const initials = String(target.name || "C")
          .split(/\s+/)
          .map((p) => p.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("");
        const existingPhoto = String(target.photoUrl || "").trim();
        const hasEditPhoto =
          Boolean(existingPhoto && (/^https?:\/\//i.test(existingPhoto) || /^data:image\//i.test(existingPhoto)));
        const photoOvalInner = hasEditPhoto
          ? `<img src="${escapeAttr(existingPhoto)}" alt="" />`
          : `<span class="driver-edit-photo-oval--placeholder" aria-hidden="true">${escapeHtml(
              initials.slice(0, 1) || "C"
            )}</span>`;

        const licenseCatOpts = editModalCatalogSelectOptions(
          CO_CATALOGS.licenseCategories,
          target.licenseCategory
        );
        const bloodOpts = editModalCatalogSelectOptions(CO_CATALOGS.bloodTypes, target.bloodType);
        const epsOpts = editModalCatalogSelectOptions(CO_CATALOGS.eps, target.eps);
        const arlOpts = editModalCatalogSelectOptions(CO_CATALOGS.arl, target.arl);
        const linkedEmployee = findPayrollEmployeeByIdDoc(target.idDoc);
        const driverBirthYmd = normalizePortalDateYmd(target.birthDate || linkedEmployee?.birthDate);
        const hrLinkNotice = linkedEmployee
          ? `<p class="full muted modal-field-hint" style="margin:0 0 0.5rem">
              Vinculado a ${escapeHtml(String(linkedEmployee.name || linkedEmployee.idDoc || "empleado"))} en Gestión humana.
              Al guardar, solo <strong>datos básicos</strong> (nombre, contacto, licencia, exámenes, EPS/ARL, foto) se copian allí.
              Salario, contrato y baja no se modifican desde este módulo.
            </p>`
          : `<p class="full muted modal-field-hint" style="margin:0 0 0.5rem">
              No se encontró empleado con el mismo documento. Registre la persona en Gestión humana con rol conductor.
            </p>`;
        openEditModal({
          title: "Editar conductor",
          subtitle: target.name,
          submitText: "Actualizar conductor",
          fields: [
            ...(hrLinkNotice
              ? [{ type: "custom", id: "driver-hr-link-notice", html: hrLinkNotice }]
              : []),
            {
              type: "custom",
              id: "driver-edit-photo-slot",
              html: `<div class="driver-edit-photo-block full">
                <div class="driver-edit-photo-oval">${photoOvalInner}</div>
                <label class="full driver-edit-photo-hint">
                  <span>Foto del conductor</span>
                  <input type="file" name="driverPhotoFile" accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png" />
                  <input type="hidden" name="photoUrlExisting" value="${escapeAttr(existingPhoto)}" />
                </label>
                <p class="full muted modal-field-hint" style="text-align:center;font-size:0.8rem;margin:0">
                  JPG o PNG preferiblemente. Si no elige archivo, se conserva la foto actual.
                </p>
              </div>`
            },
            { name: "name", label: "Nombre completo", value: target.name, required: true },
            { name: "phone", label: "Teléfono celular", value: target.phone, required: true, placeholder: "Ej: 3001234567" },
            { name: "emergencyContact", label: "Contacto de emergencia", value: target.emergencyContact || "" },
            { name: "emergencyPhone", label: "Tel. emergencia", value: target.emergencyPhone || "" },
            { name: "bloodType", label: "Tipo de sangre (RH)", type: "select", value: target.bloodType || "", options: bloodOpts },
            { name: "license", label: "N° licencia de conducción", value: target.license || "", placeholder: "Ej: 12345678" },
            { name: "licenseCategory", label: "Categoría licencia", type: "select", value: target.licenseCategory || "", options: licenseCatOpts },
            { name: "licenseIssueDate", label: "Expedición / renovación licencia", type: "date", value: target.licenseIssueDate || globalThis.inferLicenseIssueDateFromExpiryYmd?.(target.licenseExpiry, target.licenseCategory, driverBirthYmd) || "" },
            { name: "licenseExpiry", label: "Vence licencia (calculado por categoría y edad)", type: "date", value: target.licenseExpiry || "", attrs: { readonly: "readonly", tabindex: "-1" } },
            { name: "occupationalExamDate", label: "Examen ocupacional", type: "date", value: target.occupationalExamDate || "" },
            { name: "instruvialExamDate", label: "Examen instruvial", type: "date", value: target.instruvialExamDate || "" },
            { name: "eps", label: "EPS", type: "select", value: target.eps || "", options: epsOpts },
            { name: "arl", label: "ARL", type: "select", value: target.arl || "", options: arlOpts },
            { name: "comparendos", label: "Comparendos pendientes (SIMIT)", type: "number", value: target.comparendos || 0 },
            { name: "experienceYears", label: "Años de experiencia conduciendo", type: "number", value: target.experienceYears || 0 },
            {
              type: "custom",
              id: "driver-edit-vehicle-types",
              label: "Categoría de vehículos que conduce",
              html: `<div class="hr-conductor-vehicle-types">${driverVehicleTypesCheckboxesHtml(target.vehicleTypes || "")}</div>
                <p class="full muted modal-field-hint" style="margin:0.4rem 0 0;font-size:0.82rem">Marque si es conductor de camión, turbo y/o mula. Puede tener más de una categoría.</p>`
            }
          ],
          afterMount: (formEl) => {
            if (!formEl) return;
            [
              ["bloodType", target.bloodType],
              ["licenseCategory", target.licenseCategory],
              ["eps", target.eps],
              ["arl", target.arl]
            ].forEach(([name, val]) => {
              const sel = formEl.querySelector(`select[name="${name}"]`);
              if (sel && val) setFormSelectValue(sel, val);
            });
            const applyVehicleTypes = () => {
              applyDriverVehicleTypesCheckboxes?.(formEl, target.vehicleTypes || target.tipos_vehiculo || "");
            };
            applyVehicleTypes();
            queueMicrotask(applyVehicleTypes);
          },
          onSubmit: async (_form, formEl) => {
            const getVal = (name) =>
              formEl instanceof HTMLFormElement
                ? String(new FormData(formEl).get(name) ?? "").trim()
                : "";

            if (!getVal("name")) {
              failPortalField(formEl, "name", "Indique el nombre completo del conductor.");
              return false;
            }
            if (!/^\d{10,15}$/.test(getVal("phone"))) {
              failPortalField(formEl, "phone", userMessage("driverPhoneInvalid"));
              return false;
            }

            const issueValue = String(formEl?.querySelector?.("input[name='licenseIssueDate']")?.value ?? "").trim();
            const licenseCategoryVal = getVal("licenseCategory");
            const licenseExpiryNorm =
              (typeof globalThis.resolveLicenseExpiryYmd === "function"
                ? globalThis.resolveLicenseExpiryYmd(issueValue, licenseCategoryVal, driverBirthYmd)
                : "") || normalizePortalDateYmd(issueValue);
            const todayYmd =
              typeof globalThis.colombiaTodayIsoDate === "function"
                ? globalThis.colombiaTodayIsoDate()
                : new Date().toISOString().slice(0, 10);
            if (issueValue && licenseExpiryNorm && licenseExpiryNorm <= todayYmd) {
              failPortalField(formEl, "licenseIssueDate", userMessage("driverLicenseFutureEdit"));
              return false;
            }

            let photoUrl = String(formEl?.querySelector?.("input[name='photoUrlExisting']")?.value ?? "").trim();
            const photoFile = formEl?.querySelector?.("input[name='driverPhotoFile']")?.files?.[0];
            if (photoFile) {
              try {
                photoUrl = await resolveEmployeeAvatarUrl(photoFile, photoUrl);
              } catch (_e) {
                failPortalField(formEl, "driverPhotoFile", "No se pudo subir la imagen seleccionada.");
                return false;
              }
              if (/^data:image\//i.test(photoUrl)) {
                failPortalField(
                  formEl,
                  "driverPhotoFile",
                  "Sin almacenamiento de fotos en el servidor (R2 / CF_R2_*), la imagen es demasiado grande para persistir aquí."
                );
                return false;
              }
            }

            const occDate = normalizePortalDateYmd(getVal("occupationalExamDate"));
            const intraDate = normalizePortalDateYmd(getVal("instruvialExamDate"));
            const occExpiry =
              typeof globalThis.resolveOccupationalExamExpiryYmd === "function"
                ? globalThis.resolveOccupationalExamExpiryYmd(occDate)
                : "";
            const intraExpiry =
              typeof globalThis.resolveInstruvialExamExpiryYmd === "function"
                ? globalThis.resolveInstruvialExamExpiryYmd(intraDate)
                : "";

            const nextDrivers = read(KEYS.drivers, []).map((d) =>
              String(d.id ?? "").trim() === String(target.id ?? "").trim()
                ? stampUpdatedRecord({
                    ...d,
                    name: getVal("name"),
                    phone: normalizePortalPhoneForStorage(getVal("phone")),
                    emergencyContact: getVal("emergencyContact"),
                    emergencyPhone: normalizePortalPhoneForStorage(getVal("emergencyPhone")),
                    bloodType: getVal("bloodType"),
                    license: getVal("license"),
                    licenseCategory: getVal("licenseCategory"),
                    licenseIssueDate: normalizePortalDateYmd(issueValue),
                    licenseExpiry: licenseExpiryNorm,
                    occupationalExamDate: occDate,
                    occupationalExamExpiry: occExpiry,
                    instruvialExamDate: intraDate,
                    instruvialExamExpiry: intraExpiry,
                    psychoTestDate: occDate,
                    psychoTestExpiry: occExpiry,
                    eps: getVal("eps"),
                    arl: getVal("arl"),
                    comparendos: parseNum(getVal("comparendos")),
                    experienceYears: parseNum(getVal("experienceYears")),
                    vehicleTypes: collectDriverVehicleTypesCsv(formEl instanceof HTMLFormElement ? formEl : {}),
                    photoUrl
                  })
                : d
            );
            try {
              await writeAwaitServerEdit(KEYS.drivers, nextDrivers, target.id);
            } catch (err) {
              notify(String(err?.message || "No fue posible guardar el conductor en el servidor."), "error");
              return false;
            }
            const updatedDriver = nextDrivers.find(
              (row) => String(row.id ?? "").trim() === String(target.id ?? "").trim()
            );
            const updateActor = getPortalAuditActorLabel();
            if (updatedDriver) {
              appendPortalEntityAuditLog(
                "update",
                "drivers",
                "Conductores",
                updatedDriver,
                `${String(updatedDriver.phone || "Sin teléfono")} · ${String(getCompanyById(updatedDriver.companyId)?.name || "Sin empresa")}`,
                { actor: updateActor }
              );
            }
            const employeeForSync =
              linkedEmployee || findPayrollEmployeeByIdDoc(updatedDriver?.idDoc || target.idDoc);
            let hrSync = { ok: true };
            if (employeeForSync && updatedDriver) {
              hrSync = await syncEmployeeFromDriver(employeeForSync, updatedDriver);
            }
            if (portalCanRefreshFromApi()) {
              try {
                await applyPortalBootstrapFromApi();
              } catch (_e) { window.AntaresLogSilentError?.("conductores.js:1072", _e); }
            }
            const refreshedUpdate = read(KEYS.drivers, []).find(
              (row) => String(row.id ?? "").trim() === String(target.id ?? "").trim()
            );
            if (refreshedUpdate?.updatedAt && updateActor) {
              recordEntityHistoryActor("Conductores", refreshedUpdate.id, refreshedUpdate.updatedAt, updateActor);
            }
            notify(
              hrSync.ok ? userMessage("driverUpdatedHrSynced") : userMessage("driverUpdatedHrSyncFailed"),
              hrSync.ok ? "success" : "error"
            );
            renderPortalView();
            return true;
          }
        });
      });
    });

    const fleetSearchRestore = state.__driversFleetSearchRestore;
    if (fleetSearchRestore && typeof fleetSearchRestore.start === "number") {
      delete state.__driversFleetSearchRestore;
      queueMicrotask(() => {
        const root = nodes.viewRoot;
        if (!root || String(state.currentView || "") !== "transport-drivers") return;
        const inp = root.querySelector("[data-action='drivers-fleet-search']");
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
  window.__portalModuleAfterRender["transport-drivers"] = bindTransportDriversPortalControls;
})();
