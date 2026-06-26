/**
 * Modales de transporte (viajes, solicitudes, tarifas, auditoría).
 * Carga con defer después de portal-runtime.js; registra en globalThis.__antaresPortalTransportModals
 */
(function registerPortalModals() {
  "use strict";
  const G = globalThis;
  const {
    read, write, writeAwaitServer, KEYS, IC, STATUS, ROLES,
    state, openInfoModal, openEditModal, escapeHtml, escapeAttr, fmtDate, fmtDateOr,
    parseNum, notify, renderPortalView, reqRead, reqWriteAwait, canAdminEditTrip,
    formatRoute, requestTruckRequirementSummaryHtml, prettyStatus, companyProfileLogoUrl,
    getCompanyById, requestRequiresTermoking, requestTransportModeFromRequest,
    renderRequestModificationLogSectionHtml, parsePortalJsonSnapshot, snapPick,
    toInputDate, currentUser, nowIso, recalculateResourceAvailability,
    getTripRouteRatesNormalized, parseTripRateStorageKeyToRouteParts,
    formatRouteRateAuditSummary, buildRouteRateScopeStepInnerHtml, COLOMBIA_LOCATIONS,
    setSelectValueInsensitive, attachDepartmentCitySelects, wireRouteRateScopeSection,
    failPortalField, userMessage, buildTripRouteRateKey, tripRateStorageKey,
    buildRouteRateEntry, humanTripRateRouteLabelFromStorageKey,
    formatPayrollPeriodLabel, payrollRunTypeLabel, payrollRunIsDriverTripPayment,
    payrollRunHasAbsenceDetail, ensureCrudModalElement, renderModalHead,
    renderModalFooterActions, wireModalDismiss, scrollOpenCrudModalIntoView,
    persistHrWorkspace, scrollToCreatePanelForm, colombiaTodayIsoDate,
    portalDetailTileMarkup, portalDetailRenderRows, portalDetailBuildGrid,
    portalDetailHighlightHtml, openPortalDetailSheet
  } = globalThis;

function transportDetailRow(pairs, opts = {}) {
  return portalDetailRenderRows(pairs, { skipEmpty: opts.skipEmpty !== false, ...opts });
}

function openAssignedTripInfoModal(req) {
  if (!req?.trip) return;
  const canEditTrip = canAdminEditTrip(req);
  const tripNo = String(req.trip.tripNumber || "—");
  const reqNo = String(req.requestNumber || req.id || "—");
  const clientName = String(req.clientName || "—");
  const route = formatRoute(req);
  const tripValue = `$${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}`;
  const insuredValue = parseNum(req.insuredValue || 0);
  const distanceKm = parseNum(req.distanceKm || 0);
  const standbyTotal = parseNum(req.standbyChargeTotal || 0);
  const secondaryActions = [
    `<button type="button" class="btn btn-outline" data-trip-info-action="view-request">${IC.eye} Ver solicitud</button>`,
    canEditTrip ? `<button type="button" class="btn btn-action" data-trip-info-action="edit-trip">${IC.edit} Editar viaje</button>` : ""
  ].filter(Boolean).join("");
  const heroHtml = `<div class="portal-detail-hero portal-detail-hero--trip">
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.truck} Viaje operativo</p>
      <div class="portal-detail-badges">${prettyStatus(req.status, "trip")}</div>
      <p class="portal-detail-meta"><strong>Solicitud #${escapeHtml(reqNo)}</strong> · ${escapeHtml(clientName)}</p>
      <p class="portal-detail-loc-line portal-detail-route-line">${IC.mapPin} ${escapeHtml(route)}</p>
      <ul class="portal-detail-stats" aria-label="Resumen del viaje">
        <li><strong>${escapeHtml(tripValue)}</strong><span>Valor viaje</span></li>
        <li><strong>${escapeHtml(String(req.trip.vehiclePlate || "—"))}</strong><span>Camión</span></li>
        <li><strong>${escapeHtml(String(req.trip.driverName || "—"))}</strong><span>Conductor</span></li>
      </ul>
    </div>
  </div>`;
  const tilesHtml = [
    portalDetailTileMarkup(
      IC.package,
      "Carga",
      `${escapeHtml(String(req.cargoDescription || "—"))} · ${requestTruckRequirementSummaryHtml(req)}`
    ),
    portalDetailTileMarkup(
      IC.phone,
      "Contacto conductor",
      `${escapeHtml(String(req.trip.driverName || "—"))} · ${escapeHtml(String(req.trip.driverPhone || "-"))}`
    ),
    portalDetailTileMarkup(IC.clock, "Recogida", escapeHtml(fmtDate(req.trip.etaPickup))),
    portalDetailTileMarkup(IC.clock, "Entrega", escapeHtml(fmtDate(req.trip.etaDelivery)))
  ].join("");
  const assignmentRows = transportDetailRow([
    ["Camión asignado", `<strong>${escapeHtml(String(req.trip.vehiclePlate || "—"))}</strong> (${escapeHtml(String(req.trip.vehicleType || "-"))})`],
    ["Conductor", `${escapeHtml(String(req.trip.driverName || "—"))} · ${escapeHtml(String(req.trip.driverPhone || "-"))}`],
    ["Asignado por", escapeHtml(String(req.trip.assignedBy || req.approvedBy || "-"))],
    ["Fecha de asignación", escapeHtml(fmtDate(req.trip.assignedAt || req.approvedAt || req.createdAt))],
    req.autoApproved ? ["Aprobación", "Automática"] : null
  ].filter(Boolean));
  const scheduleRows = transportDetailRow([
    ["Recogida programada", escapeHtml(fmtDate(req.trip.etaPickup))],
    ["Entrega programada", escapeHtml(fmtDate(req.trip.etaDelivery))],
    ["Creado", escapeHtml(fmtDateOr(req.trip.createdAt || req.createdAt, "—"))],
    ["Última actualización", escapeHtml(fmtDateOr(req.trip.updatedAt || req.trip.createdAt || req.updatedAt, "—"))],
    req.closedAt ? ["Cierre", escapeHtml(fmtDate(req.closedAt))] : null
  ].filter(Boolean));
  const financeRows = transportDetailRow([
    ["Valor del viaje", `<strong>${escapeHtml(tripValue)}</strong>`],
    insuredValue > 0 ? ["Valor asegurado", `$${insuredValue.toLocaleString("es-CO")}`] : null,
    distanceKm > 0 ? ["Distancia estimada", `${distanceKm.toLocaleString("es-CO")} km`] : null,
    standbyTotal > 0 ? ["Standby acumulado", `$${standbyTotal.toLocaleString("es-CO")}`] : null,
    req.trip.invoice
      ? [
          "Factura",
          `${escapeHtml(String(req.trip.invoice.number))} · $${parseNum(req.trip.invoice.total).toLocaleString("es-CO")}`
        ]
      : null
  ].filter(Boolean), { skipEmpty: false });
  const sections = [
    { icon: "truck", title: "Asignación", rows: assignmentRows },
    { icon: "clock", title: "Programación", rows: scheduleRows },
    { icon: "dollar", title: "Tarifa y facturación", rows: financeRows }
  ];
  openPortalDetailSheet({
    title: `Viaje ${tripNo}`,
    subtitleHtml: prettyStatus(req.status, "trip"),
    heroHtml,
    tilesHtml,
    sectionsHtml: portalDetailBuildGrid(sections),
    secondaryActionsHtml: secondaryActions,
    afterMount: (contentEl) => {
      contentEl
        .querySelector("[data-trip-info-action='view-request']")
        ?.addEventListener("click", () => {
          openRequestDetailModal(req);
        });
      contentEl
        .querySelector("[data-trip-info-action='edit-trip']")
        ?.addEventListener("click", () => {
          openEditTripModal(req);
        });
    }
  });
}

function openRequestDetailModal(req) {
  if (!req) return;
  const company = typeof getCompanyById === "function" ? getCompanyById(req.clientCompanyId) : null;
  const clientLogoUrl =
    companyProfileLogoUrl(company) || String(req.clientCompanyLogoUrl || "").trim();
  const clientDisplayName = String(req.clientName || company?.name || "-").trim() || "-";
  const thermokingReq = requestRequiresTermoking(req);
  const obs = String(req.notes || req.observations || "").trim();
  const origAddr = String(req.originAddress || "").trim();
  const destAddr = String(req.destinationAddress || "").trim();
  const modoTransporte = escapeHtml(requestTransportModeFromRequest(req));
  const tripValue = `$${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}`;
  const insuredValue = parseNum(req.insuredValue || 0);
  const distanceKm = parseNum(req.distanceKm || 0);
  const standbyTotal = parseNum(req.standbyChargeTotal || 0);
  const logoBlock =
    clientLogoUrl && !/^data:/i.test(clientLogoUrl)
      ? `<div class="portal-detail-logo"><img src="${escapeAttr(clientLogoUrl)}" alt="" loading="lazy" decoding="async" /></div>`
      : `<div class="portal-detail-logo portal-detail-logo--fallback" aria-hidden="true"><span>${escapeHtml(String(clientDisplayName.charAt(0) || "C").toUpperCase())}</span></div>`;
  const heroHtml = `<div class="portal-detail-hero portal-detail-hero--request">
    ${logoBlock}
    <div class="portal-detail-hero-main">
      <p class="portal-detail-eyebrow">${IC.file} Solicitud de transporte</p>
      <div class="portal-detail-badges">${prettyStatus(req.status, "request")}</div>
      <p class="portal-detail-meta"><strong>${escapeHtml(clientDisplayName)}</strong></p>
      <p class="portal-detail-loc-line portal-detail-route-line">${IC.mapPin} ${escapeHtml(formatRoute(req))}</p>
      <ul class="portal-detail-stats" aria-label="Resumen de la solicitud">
        <li><strong>${escapeHtml(tripValue)}</strong><span>Valor viaje</span></li>
        <li><strong>${modoTransporte}</strong><span>Modo</span></li>
        <li><strong>${thermokingReq ? "Sí" : "No"}</strong><span>Termoking</span></li>
      </ul>
    </div>
  </div>`;
  const tripHighlight = req.trip
    ? portalDetailHighlightHtml(
        "Viaje asignado",
        `<p class="portal-detail-loc-line"><strong>Viaje ${escapeHtml(String(req.trip.tripNumber || "—"))}</strong> · ${escapeHtml(String(req.trip.vehiclePlate || "—"))} (${escapeHtml(String(req.trip.vehicleType || "-"))})</p>
        <p class="portal-detail-loc-sub muted">${IC.user} ${escapeHtml(String(req.trip.driverName || "—"))} · ${IC.clock} ${escapeHtml(fmtDate(req.trip.etaPickup))} → ${escapeHtml(fmtDate(req.trip.etaDelivery))}</p>
        <div class="portal-detail-highlight__actions">
          <button type="button" class="btn btn-action" data-action="solicitud-trip-open">${IC.eye} Abrir detalle del viaje</button>
        </div>`,
        "truck"
      )
    : portalDetailHighlightHtml(
        "Viaje asignado",
        `<p class="portal-detail-loc-line muted">Aún no tiene viaje asignado.</p>`,
        "truck"
      );
  const requestRows = transportDetailRow([
    ["Modo de transporte", modoTransporte],
    ["Refrigeración Termoking", thermokingReq ? "Sí, requerida" : "No"],
    ["Recogida programada", escapeHtml(fmtDate(req.pickupAt || `${req.pickupDate || ""}T${req.pickupTime || ""}`))],
    ["Entrega estimada", escapeHtml(fmtDate(req.etaDelivery || `${req.deliveryDate || ""}T${req.deliveryTime || ""}`))],
    ["Solicita", escapeHtml(String(req.requestedByName || "-"))],
    [
      "Contacto en sitio",
      `${escapeHtml(String(req.siteContactName || req.contactName || "-"))} · ${escapeHtml(String(req.siteContactPhone || req.contactPhone || "-"))}`
    ],
    ["Carga", escapeHtml(String(req.cargoDescription || "-"))],
    ["Requisitos de camión", requestTruckRequirementSummaryHtml(req)],
    ["Valor del viaje", `<strong>${escapeHtml(tripValue)}</strong>`],
    insuredValue > 0 ? ["Valor asegurado", `$${insuredValue.toLocaleString("es-CO")}`] : null,
    distanceKm > 0 ? ["Distancia estimada", `${distanceKm.toLocaleString("es-CO")} km`] : null,
    req.autoApproved ? ["Aprobación", "Automática"] : null,
    standbyTotal > 0 ? ["Standby", `$${standbyTotal.toLocaleString("es-CO")}`] : null,
    req.rejectionReason ? ["Motivo rechazo", escapeHtml(String(req.rejectionReason))] : null
  ].filter(Boolean));
  const routeRows = transportDetailRow([
    ["Ruta", escapeHtml(formatRoute(req))],
    origAddr ? ["Origen (dirección)", escapeHtml(origAddr)] : null,
    destAddr ? ["Destino (dirección)", escapeHtml(destAddr)] : null
  ].filter(Boolean), { skipEmpty: false });
  const sections = [
    { icon: "mapPin", title: "Ruta y ubicación", rows: routeRows },
    { icon: "package", title: "Datos de la solicitud", rows: requestRows }
  ];
  const notesExtra = obs
    ? `<section class="portal-detail-highlight portal-detail-highlight--notes" aria-label="Observaciones">
        <h4 class="portal-detail-highlight__title">${IC.file}<span>Observaciones</span></h4>
        <div class="portal-detail-highlight__body"><p class="detail-note">${escapeHtml(obs)}</p></div>
      </section>`
    : "";
  openPortalDetailSheet({
    title: `Solicitud ${req.requestNumber || req.id}`,
    subtitleHtml: prettyStatus(req.status, "request"),
    heroHtml,
    highlightHtml: tripHighlight,
    sectionsHtml: portalDetailBuildGrid(sections),
    extraHtml: `${notesExtra}${renderRequestModificationLogSectionHtml(req)}`,
    afterMount: req.trip
      ? (contentEl) => {
          contentEl.querySelector("[data-action='solicitud-trip-open']")?.addEventListener("click", () => {
            openAssignedTripInfoModal(req);
          });
        }
      : undefined
  });
}

function deletedTripSnapshotForTableRow(row) {
  const direct = parsePortalJsonSnapshot(row.snapshot);
  if (direct) return direct;
  const s = row.snapshotSummary;
  return s && typeof s === "object" ? s : null;
}

function deletedRequestSnapshotForTableRow(row) {
  const direct = parsePortalJsonSnapshot(row.snapshot);
  if (direct) return direct;
  const s = row.snapshotSummary;
  return s && typeof s === "object" ? s : null;
}

function formatDeletedRequestSnapshotRouteLine(snap) {
  if (!snap) return "Sin datos de ruta.";
  const od = snapPick(snap, "departamento_origen", "originDepartment");
  const oc = snapPick(snap, "ciudad_origen", "originCity");
  const dd = snapPick(snap, "departamento_destino", "destinationDepartment");
  const dc = snapPick(snap, "ciudad_destino", "destinationCity");
  const left = [oc, od].filter(Boolean).join(", ") || oc || od || "";
  const right = [dc, dd].filter(Boolean).join(", ") || dc || dd || "";
  if (left && right) return `${left} → ${right}`;
  return left || right || "Sin datos de ruta.";
}

function formatDeletedRequestSnapshotTableSummary(snap) {
  if (!snap) return "—";
  const route = formatDeletedRequestSnapshotRouteLine(snap);
  const cargo = snapPick(snap, "descripcion_carga", "cargoDescription");
  if (!cargo) return route;
  const short = cargo.length > 90 ? `${cargo.slice(0, 87)}…` : cargo;
  return `${route} · ${short}`;
}

function openDeletedTransportRequestAuditModal(logRow) {
  if (!logRow) return;
  const snap = parsePortalJsonSnapshot(logRow.snapshot);
  const reqN = String(logRow.requestNumber || logRow.requestId || "-").trim();
  const baseAuditSubtitle = `<span class="muted">Eliminada:</span> ${escapeHtml(fmtDate(logRow.deletedAt))}<br />
    <span class="muted">Usuario:</span> ${escapeHtml(String(logRow.deletedByName || logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${escapeHtml(String(logRow.reason || "—"))}`;
  if (!snap) {
    openPortalDetailSheet({
      title: `Solicitud eliminada ${reqN}`,
      subtitleHtml: `${baseAuditSubtitle}<br /><span class="muted">Estado al eliminar:</span> —`,
      highlightHtml: portalDetailHighlightHtml(
        "Registro de auditoría",
        `<p class="portal-detail-loc-line muted">No hay copia JSON de la solicitud en este registro (registros antiguos o sin snapshot).</p>`,
        "alertTriangle"
      )
    });
    return;
  }
  const modo = escapeHtml(snapPick(snap, "tipo_servicio", "serviceType") || "—");
  const tkRaw = snap.refrigeracion_termoking ?? snap.requiresThermoking;
  const thermoking =
    tkRaw === true ||
    String(tkRaw).toLowerCase() === "true" ||
    String(tkRaw).toLowerCase() === "yes";
  const routeLine = escapeHtml(formatDeletedRequestSnapshotRouteLine(snap));
  const origAddr = escapeHtml(snapPick(snap, "direccion_origen", "originAddress"));
  const destAddr = escapeHtml(snapPick(snap, "direccion_destino", "destinationAddress"));
  const pickupIso = snapPick(snap, "fecha_hora_recogida", "pickupAt");
  const deliveryIso = snapPick(snap, "fecha_hora_entrega_estimada", "etaDelivery");
  const requestedBy = escapeHtml(snapPick(snap, "nombre_quien_solicita", "requestedByName") || "—");
  const contactName = escapeHtml(snapPick(snap, "nombre_contacto_en_sitio", "siteContactName", "contactName") || "—");
  const contactPhone = escapeHtml(snapPick(snap, "telefono_contacto_en_sitio", "siteContactPhone", "contactPhone") || "—");
  const cargo = escapeHtml(snapPick(snap, "descripcion_carga", "cargoDescription") || "—");
  const peso = parseNum(snap.peso_kg ?? snap.weightKg);
  const cajas = parseNum(snap.numero_cajas ?? snap.boxes ?? snap.boxesCount);
  const estadoPlain = snapPick(snap, "estado", "status") || "—";
  const estado = escapeHtml(estadoPlain);
  const tipoVeh = escapeHtml(
    snapPick(snap, "tipo_vehiculo_requerido", "tipo_vehiculo_solicitado", "vehicleType", "requiredTruckType") || "—"
  );
  const obs = String(snapPick(snap, "observaciones", "notes") || "").trim();
  const fullSubtitleHtml = `${baseAuditSubtitle}<br /><span class="muted">Estado al eliminar:</span> ${estado}`;
  const auditSections = [
    {
      icon: "briefcase",
      title: "Datos de la solicitud",
      rows: transportDetailRow([
        ["Cliente", escapeHtml(snapPick(snap, "nombre_cliente", "clientName") || "—")],
        ["Modo de transporte", modo],
        ["Refrigeración Termoking", thermoking ? "Sí, requerida" : "No"],
        ["Tipo de vehículo solicitado", tipoVeh],
        ["Ruta (ciudad / depto.)", routeLine],
        origAddr ? ["Origen (dirección)", origAddr] : null,
        destAddr ? ["Destino (dirección)", destAddr] : null,
        ["Recogida programada", escapeHtml(fmtDate(pickupIso))],
        ["Entrega estimada", escapeHtml(fmtDate(deliveryIso))],
        ["Solicita", requestedBy],
        ["Contacto en sitio", `${contactName} · ${contactPhone}`],
        ["Carga", cargo],
        ["Peso / cajas", `${peso.toLocaleString("es-CO")} kg · ${cajas.toLocaleString("es-CO")} cajas`]
      ].filter(Boolean), { skipEmpty: false })
    }
  ];
  const notesExtra = obs
    ? `<section class="portal-detail-highlight portal-detail-highlight--notes" aria-label="Observaciones">
        <h4 class="portal-detail-highlight__title">${IC.file}<span>Observaciones</span></h4>
        <div class="portal-detail-highlight__body"><p class="detail-note">${escapeHtml(obs)}</p></div>
      </section>`
    : "";
  openPortalDetailSheet({
    title: `Solicitud eliminada ${reqN}`,
    subtitleHtml: fullSubtitleHtml,
    sectionsHtml: portalDetailBuildGrid(auditSections),
    extraHtml: notesExtra
  });
}

function formatDeletedTripSnapshotTableSummary(snap) {
  if (!snap) return "—";
  const num = snapPick(snap, "numero_viaje", "tripNumber");
  const plate = snapPick(snap, "placa_vehiculo", "vehiclePlate");
  const driver = snapPick(snap, "nombre_conductor", "driverName");
  const route = snapPick(snap, "descripcion_ruta", "routeDescription", "notes");
  const parts = [];
  if (num) parts.push(`Viaje ${num}`);
  if (plate) parts.push(plate);
  if (driver) parts.push(driver);
  let line = parts.length ? parts.join(" · ") : "Viaje";
  if (route) {
    const rShort = route.length > 72 ? `${route.slice(0, 69)}…` : route;
    line += ` · ${rShort}`;
  }
  return line;
}

function openDeletedTransportTripAuditModal(logRow) {
  if (!logRow) return;
  const snap = parsePortalJsonSnapshot(logRow.snapshot);
  const tripLabel = String(logRow.tripNumber || "").trim() || "—";
  const reqLabel = String(logRow.requestNumber || logRow.requestId || "").trim() || "—";
  const baseAuditSubtitle = `<span class="muted">Registrado:</span> ${escapeHtml(fmtDate(logRow.deletedAt))}<br />
    <span class="muted">Usuario:</span> ${escapeHtml(String(logRow.deletedByName || logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${escapeHtml(String(logRow.reason || "—"))}<br />
    <span class="muted">Solicitud:</span> ${escapeHtml(reqLabel)} · <span class="muted">Viaje:</span> ${escapeHtml(tripLabel)}`;
  if (!snap) {
    openPortalDetailSheet({
      title: `Viaje desasignado ${tripLabel}`,
      subtitleHtml: baseAuditSubtitle,
      highlightHtml: portalDetailHighlightHtml(
        "Registro de auditoría",
        `<p class="portal-detail-loc-line muted">No hay copia JSON del viaje en este registro (registros antiguos o sin snapshot).</p>`,
        "alertTriangle"
      )
    });
    return;
  }
  const estadoOp = escapeHtml(snapPick(snap, "estado_operativo_en_vivo", "liveOperationalStatus") || "—");
  const fullSubtitleHtml = `${baseAuditSubtitle}<br /><span class="muted">Estado operativo (copia):</span> ${estadoOp}`;
  const pickup = snapPick(snap, "fecha_hora_recogida_programada", "etaPickup");
  const delivery = snapPick(snap, "fecha_hora_entrega_programada", "etaDelivery");
  const assignedBy = escapeHtml(snapPick(snap, "asignado_por", "assignedBy") || "—");
  const assignedAt = snapPick(snap, "fecha_hora_asignacion", "assignedAt");
  const tipoVeh = escapeHtml(snapPick(snap, "tipo_vehiculo_asignado", "vehicleType") || "—");
  const plate = escapeHtml(snapPick(snap, "placa_vehiculo", "vehiclePlate") || "—");
  const driver = escapeHtml(snapPick(snap, "nombre_conductor", "driverName") || "—");
  const driverPhone = escapeHtml(snapPick(snap, "telefono_conductor", "driverPhone") || "—");
  const routeDesc = escapeHtml(snapPick(snap, "descripcion_ruta", "routeDescription") || "—");
  const numViajeRaw = snapPick(snap, "numero_viaje", "tripNumber") || tripLabel;
  const numViaje = escapeHtml(numViajeRaw);
  const idSol = escapeHtml(snapPick(snap, "id_solicitud", "requestId") || String(logRow.requestId || "—"));
  const invoiceRaw = snap.datos_factura_json ?? snap.invoiceData;
  let invoiceBlock = "";
  if (invoiceRaw != null && invoiceRaw !== "") {
    try {
      const txt =
        typeof invoiceRaw === "string" ? invoiceRaw : JSON.stringify(invoiceRaw, null, 2);
      const short = txt.length > 1200 ? `${txt.slice(0, 1197)}…` : txt;
      invoiceBlock = `<div class="solicitud-detail-notes"><strong>Datos facturación (JSON)</strong><pre class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0;font-size:0.82em;max-height:14rem;overflow:auto">${escapeHtml(short)}</pre></div>`;
    } catch {
      invoiceBlock = "";
    }
  }
  const auditSections = [
    {
      icon: "truck",
      title: "Copia del viaje",
      rows: transportDetailRow([
        ["Número de viaje", numViaje],
        ["ID solicitud asociada", idSol],
        ["Vehículo (placa)", plate],
        ["Tipo vehículo asignado", tipoVeh],
        ["Conductor", driver],
        ["Teléfono conductor", driverPhone],
        ["Descripción de ruta / observaciones", routeDesc],
        ["Recogida programada", escapeHtml(fmtDate(pickup))],
        ["Entrega programada", escapeHtml(fmtDate(delivery))],
        ["Asignado por", assignedBy],
        ["Fecha de asignación", escapeHtml(fmtDate(assignedAt))]
      ], { skipEmpty: false })
    }
  ];
  openPortalDetailSheet({
    title: `Viaje desasignado ${numViajeRaw}`,
    subtitleHtml: fullSubtitleHtml,
    sectionsHtml: portalDetailBuildGrid(auditSections),
    extraHtml: invoiceBlock
  });
}

function openEditTripModal(req) {
  if (!req?.trip) return;
  if (!canAdminEditTrip(req)) {
    notify("Solo un administrador puede editar este viaje.", "error");
    return;
  }
  const vehicles = read(KEYS.vehicles, []);
  const drivers = read(KEYS.drivers, []);
  const vehicleOptions = [{ value: req.trip.vehicleId || "", label: `${req.trip.vehiclePlate || "—"} · ${req.trip.vehicleType || ""}` }]
    .concat(
      vehicles
        .filter((v) => String(v.id || "") !== String(req.trip.vehicleId || ""))
        .map((v) => ({ value: String(v.id || ""), label: `${v.plate} · ${v.type || ""}` }))
    );
  const driverOptions = [{ value: req.trip.driverId || "", label: req.trip.driverName || "—" }]
    .concat(
      drivers
        .filter((d) => String(d.id || "") !== String(req.trip.driverId || ""))
        .map((d) => ({ value: String(d.id || ""), label: `${d.fullName || d.name || ""}${d.taxId ? ` · ${d.taxId}` : ""}` }))
    );
  const etaPickupLocal = String(toInputDate(req.trip.etaPickup || "") || "").slice(0, 16);
  const etaDeliveryLocal = String(toInputDate(req.trip.etaDelivery || "") || "").slice(0, 16);
  openEditModal({
    title: `Editar viaje ${req.trip.tripNumber}`,
    subtitle: `Solicitud ${req.requestNumber || req.id} · ${req.clientName || ""}`,
    submitText: "Guardar cambios del viaje",
    extraModalCardClass: "modal-card-edit--trip",
    fields: [
      { type: "section", id: "edit-trip-assign", title: "Asignación", hint: "Vehículo y conductor actualmente asignados al viaje." },
      { name: "vehicleId", label: "Vehículo", type: "select", value: req.trip.vehicleId || "", required: true, options: vehicleOptions },
      { name: "driverId", label: "Conductor", type: "select", value: req.trip.driverId || "", required: true, options: driverOptions },
      { type: "section", id: "edit-trip-times", title: "Fechas estimadas", hint: "Permite reprogramar la recogida o la entrega del viaje." },
      { name: "etaPickup", label: "Recogida (fecha y hora)", type: "datetime-local", value: etaPickupLocal, required: true },
      { name: "etaDelivery", label: "Entrega (fecha y hora)", type: "datetime-local", value: etaDeliveryLocal, required: true },
      { type: "section", id: "edit-trip-money", title: "Tarifa y observaciones", hint: "Ajustes manuales que no exigen cambiar el estado del viaje." },
      { name: "tripValue", label: "Tarifa del viaje (COP)", type: "number", min: 0, value: parseNum(req.tripValue || 0), required: false },
      { name: "tripNotes", label: "Observaciones del viaje", type: "textarea", value: req.trip.notes || "", rows: 3 }
    ],
    onSubmit: async (form) => {
      const requests = reqRead();
      const targetId = String(req.id);
      if (!requests.some((r) => String(r.id) === targetId)) {
        notify("La solicitud del viaje ya no está disponible. Actualice la página.", "error");
        return false;
      }
      const targetVehicle = vehicles.find((v) => String(v.id || "") === String(form.vehicleId || ""));
      const targetDriver = drivers.find((d) => String(d.id || "") === String(form.driverId || ""));
      const updates = {
        tripValue: parseNum(form.tripValue) || parseNum(req.tripValue || 0),
        updatedAt: nowIso(),
        updatedBy: currentUser()?.name || "Admin",
        trip: {
          ...req.trip,
          vehicleId: String(form.vehicleId || req.trip.vehicleId || ""),
          vehiclePlate: targetVehicle?.plate || req.trip.vehiclePlate || "",
          vehicleType: targetVehicle?.type || req.trip.vehicleType || "",
          driverId: String(form.driverId || req.trip.driverId || ""),
          driverName: targetDriver?.fullName || targetDriver?.name || req.trip.driverName || "",
          driverPhone: targetDriver?.phone || req.trip.driverPhone || "",
          etaPickup: form.etaPickup ? new Date(form.etaPickup).toISOString() : req.trip.etaPickup,
          etaDelivery: form.etaDelivery ? new Date(form.etaDelivery).toISOString() : req.trip.etaDelivery,
          notes: String(form.tripNotes || "").trim(),
          updatedAt: nowIso(),
          updatedBy: currentUser()?.name || "Admin"
        }
      };
      const updated = requests.map((r) => (String(r.id) === targetId ? { ...r, ...updates } : r));
      const updatedRow = updated.find((r) => String(r.id) === targetId);
      try {
        await reqWriteAwait(updated, updatedRow);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar los cambios del viaje."), "error");
        return false;
      }
      recalculateResourceAvailability();
      notify("Viaje actualizado correctamente.", "success");
      renderPortalView();
      return true;
    }
  });
}

function openEditRouteRateModal(storageKey) {
  const key = String(storageKey || "").trim();
  if (!key) return;
  const entry = getTripRouteRatesNormalized()[key];
  if (!entry) return;
  const parts = parseTripRateStorageKeyToRouteParts(key);
  const companies = read(KEYS.companies, []);
  const selectedCompanyIds = (Array.isArray(entry.companyIds) ? entry.companyIds : [])
    .map((id) => String(id).trim())
    .filter(Boolean);
  const rateScopeValue = selectedCompanyIds.length ? "specific" : "all";
  const auditSummary = formatRouteRateAuditSummary(entry);
  const scopeStepHtml = buildRouteRateScopeStepInnerHtml(companies, {
    scopeValue: rateScopeValue,
    selectedCompanyIds
  });
  const deptOpts = [{ value: "", label: "Seleccione..." }, ...Object.keys(COLOMBIA_LOCATIONS).sort().map((d) => ({ value: d, label: d }))];
  const cityPlaceholder = [{ value: "", label: "Seleccione departamento..." }];
  openEditModal({
    title: "Editar tarifa de trayecto",
    subtitle: humanTripRateRouteLabelFromStorageKey(key),
    submitText: "Guardar cambios de tarifa",
    extraModalCardClass: "modal-card-edit--trip",
    fields: [
      { type: "hidden", name: "editingRateKey", value: key },
      { type: "section", id: "edit-rate-origin", title: "Origen", hint: "Departamento y ciudad desde los que se pactó el trayecto." },
      { name: "originDepartment", label: "Departamento de origen", type: "select", value: parts.originDepartment, required: true, options: deptOpts },
      { name: "originCity", label: "Ciudad de origen", type: "select", value: parts.originCity, required: true, options: cityPlaceholder },
      { type: "section", id: "edit-rate-dest", title: "Destino", hint: "Departamento y ciudad de entrega." },
      { name: "destinationDepartment", label: "Departamento de destino", type: "select", value: parts.destinationDepartment, required: true, options: deptOpts },
      { name: "destinationCity", label: "Ciudad de destino", type: "select", value: parts.destinationCity, required: true, options: cityPlaceholder },
      { type: "section", id: "edit-rate-money", title: "Tarifa pactada", hint: "Valor en COP que se sugiere al asignar un viaje en esta ruta." },
      { name: "tripRateCop", label: "Valor del viaje (COP)", type: "number", min: 1, step: 1, value: parseNum(entry.value), required: true },
      { type: "custom", full: true, html: `<p class="muted" style="margin:0">${escapeHtml(auditSummary)}</p>` },
      {
        type: "section",
        id: "edit-rate-scope",
        title: "¿A qué clientes aplica?",
        hint: "General para todos; por empresa solo para los clientes que marque abajo.",
        gridClass: "route-rate-scope-grid"
      },
      { type: "custom", full: true, html: `<div data-route-rate-scope-mount>${scopeStepHtml}</div>` }
    ],
    afterMount: (formEl) => {
      const od = formEl.querySelector("select[name='originDepartment']");
      const oc = formEl.querySelector("select[name='originCity']");
      const dd = formEl.querySelector("select[name='destinationDepartment']");
      const dc = formEl.querySelector("select[name='destinationCity']");
      setSelectValueInsensitive(od, parts.originDepartment);
      attachDepartmentCitySelects(formEl, {
        departmentSelector: "select[name='originDepartment']",
        citySelector: "select[name='originCity']",
        initialDepartment: parts.originDepartment,
        initialCity: parts.originCity
      });
      setSelectValueInsensitive(oc, parts.originCity);
      setSelectValueInsensitive(dd, parts.destinationDepartment);
      attachDepartmentCitySelects(formEl, {
        departmentSelector: "select[name='destinationDepartment']",
        citySelector: "select[name='destinationCity']",
        initialDepartment: parts.destinationDepartment,
        initialCity: parts.destinationCity
      });
      setSelectValueInsensitive(dc, parts.destinationCity);
      wireRouteRateScopeSection(formEl);
    },
    onSubmit: async (payload, formEl) => {
      const fd = new FormData(formEl);
      const scopeField = formEl.querySelector("[data-route-rate-scope-field]");
      const scope = String(scopeField?.value || payload.rateScope || "all");
      const companyIdsRaw = [...fd.getAll("rateClientCompanies")].map((v) => String(v || "").trim()).filter(Boolean);
      const companyIds = scope === "specific" ? companyIdsRaw : [];
      const od = String(payload.originDepartment || "").trim();
      const oc = String(payload.originCity || "").trim();
      const dd = String(payload.destinationDepartment || "").trim();
      const dc = String(payload.destinationCity || "").trim();
      const tripRateCop = parseNum(payload.tripRateCop);
      if (!od) {
        failPortalField(formEl, "originDepartment", userMessage("routeRateSelectRoute"));
        return false;
      }
      if (!oc) {
        failPortalField(formEl, "originCity", userMessage("routeRateSelectRoute"));
        return false;
      }
      if (!dd) {
        failPortalField(formEl, "destinationDepartment", userMessage("routeRateSelectRoute"));
        return false;
      }
      if (!dc) {
        failPortalField(formEl, "destinationCity", userMessage("routeRateSelectRoute"));
        return false;
      }
      if (tripRateCop <= 0) {
        failPortalField(formEl, "tripRateCop", userMessage("routeRateInvalidCop"));
        return false;
      }
      if (scope === "specific" && !companyIds.length) {
        const scopeEl =
          formEl.querySelector("[data-route-rate-companies-field]") || formEl.querySelector("[name='rateClientCompanies']");
        failPortalField(formEl, scopeEl || "rateClientCompanies", "Selecciona al menos una empresa para una tarifa específica.");
        return false;
      }
      const routeKey = buildTripRouteRateKey(od, oc, dd, dc);
      const normalized = getTripRouteRatesNormalized();
      const newStorageKey = tripRateStorageKey(routeKey, companyIds);
      const editingKey = String(payload.editingRateKey || "").trim();
      const previousEntry = editingKey ? normalized[editingKey] : normalized[newStorageKey];
      const next = { ...normalized, [newStorageKey]: buildRouteRateEntry(tripRateCop, companyIds, previousEntry) };
      if (editingKey && editingKey !== newStorageKey) delete next[editingKey];
      try {
        await writeAwaitServer(KEYS.tripRouteRates, next, {
          syncData: syncPayloadForEditedObjectKeys(next, newStorageKey),
          deletedIds:
            editingKey &&
            editingKey !== newStorageKey &&
            previousEntry &&
            typeof previousEntry === "object" &&
            String(previousEntry.id || "").trim()
              ? [String(previousEntry.id).trim()]
              : undefined
        });
      } catch (err) {
        notify(String(err?.message || userMessage("genericError")), "error");
        return false;
      }
      notify("Tarifa por trayecto actualizada.", "success");
      renderPortalView();
      return true;
    }
  });
}

  G.__antaresPortalTransportModals = {
    openAssignedTripInfoModal,
    openRequestDetailModal,
    deletedTripSnapshotForTableRow,
    deletedRequestSnapshotForTableRow,
    formatDeletedRequestSnapshotRouteLine,
    formatDeletedRequestSnapshotTableSummary,
    openDeletedTransportRequestAuditModal,
    formatDeletedTripSnapshotTableSummary,
    openDeletedTransportTripAuditModal,
    openEditTripModal,
    openEditRouteRateModal
  };
  Object.assign(G, G.__antaresPortalTransportModals);
})();
