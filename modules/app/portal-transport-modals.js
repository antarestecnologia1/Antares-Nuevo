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
    persistHrWorkspace, scrollToCreatePanelForm, colombiaTodayIsoDate
  } = globalThis;

function openAssignedTripInfoModal(req) {
  if (!req?.trip) return;
  const canEditTrip = canAdminEditTrip(req);
  const secondaryActions = [
    `<button type="button" class="btn btn-outline" data-trip-info-action="view-request">${IC.eye} Ver solicitud</button>`,
    canEditTrip ? `<button type="button" class="btn btn-action" data-trip-info-action="edit-trip">${IC.edit} Editar viaje</button>` : ""
  ].filter(Boolean).join("");
  openInfoModal({
    title: `Viaje ${req.trip.tripNumber}`,
    subtitleHtml: prettyStatus(req.status, "trip"),
    wide: true,
    secondaryActionsHtml: secondaryActions,
    afterMount: (contentEl) => {
      contentEl
        .querySelector("[data-trip-info-action='view-request']")
        ?.addEventListener("click", () => {
          /**
           * Salta del detalle del viaje al detalle de la solicitud. Se hace
           * fire-and-forget vía el handler global de `data-action=detail`.
           * Como `data-action=detail` está en cards del módulo y aquí el
           * botón es modal, abrimos el modal de info directamente.
           */
          openRequestDetailModal(req);
        });
      contentEl
        .querySelector("[data-trip-info-action='edit-trip']")
        ?.addEventListener("click", () => {
          openEditTripModal(req);
        });
    },
    bodyHtml: `
          <div class="dash-grid">
            <div><strong>Solicitud:</strong> ${escapeHtml(String(req.requestNumber || req.id))}</div>
            <div><strong>Cliente:</strong> ${escapeHtml(String(req.clientName || "-"))}</div>
            <div class="full"><strong>Ruta:</strong> ${escapeHtml(formatRoute(req))}</div>
            <div><strong>Carga:</strong> ${escapeHtml(String(req.cargoDescription || "-"))} · ${requestTruckRequirementSummaryHtml(req)}</div>
            <div><strong>Valor viaje:</strong> $${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}</div>
            ${parseNum(req.insuredValue || 0) > 0 ? `<div><strong>Valor asegurado:</strong> $${parseNum(req.insuredValue).toLocaleString("es-CO")}</div>` : ""}
            ${parseNum(req.distanceKm || 0) > 0 ? `<div><strong>Distancia estimada:</strong> ${parseNum(req.distanceKm).toLocaleString("es-CO")} km</div>` : ""}
            <div><strong>Camión:</strong> ${escapeHtml(String(req.trip.vehiclePlate || ""))} (${escapeHtml(String(req.trip.vehicleType || "-"))})</div>
            <div><strong>Conductor:</strong> ${escapeHtml(String(req.trip.driverName || ""))} · ${escapeHtml(String(req.trip.driverPhone || "-"))}</div>
            <div><strong>Asignado por:</strong> ${escapeHtml(String(req.trip.assignedBy || req.approvedBy || "-"))}</div>
            <div><strong>Fecha asignación:</strong> ${fmtDate(req.trip.assignedAt || req.approvedAt || req.createdAt)}</div>
            <div><strong>Creado</strong> ${escapeHtml(fmtDateOr(req.trip.createdAt || req.createdAt, "—"))}</div>
            <div><strong>Última actualización</strong> ${escapeHtml(fmtDateOr(req.trip.updatedAt || req.trip.createdAt || req.updatedAt, "—"))}</div>
            ${req.autoApproved ? `<div><strong>Aprobación:</strong> Automática</div>` : ""}
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
            ${req.closedAt ? `<div><strong>Cierre:</strong> ${fmtDate(req.closedAt)}</div>` : ""}
            ${req.trip.invoice ? `<div><strong>Factura:</strong> ${escapeHtml(String(req.trip.invoice.number))} · $${parseNum(req.trip.invoice.total).toLocaleString("es-CO")}</div>` : ""}
          </div>
          ${parseNum(req.standbyChargeTotal) > 0 ? `<p style="margin-top:0.6rem"><strong>Standby acumulado:</strong> $${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</p>` : ""}
        `
  });
}

function openRequestDetailModal(req) {
  if (!req) return;
  const company = typeof getCompanyById === "function" ? getCompanyById(req.clientCompanyId) : null;
  const clientLogoUrl =
    companyProfileLogoUrl(company) || String(req.clientCompanyLogoUrl || "").trim();
  const clientDisplayName = String(req.clientName || company?.name || "-").trim() || "-";
  const clientBlock =
    clientLogoUrl && !/^data:/i.test(clientLogoUrl)
      ? `<div class="solicitud-detail-client-row"><span class="request-company-logo request-company-logo--sm" role="img" aria-label="Logo de ${escapeAttr(clientDisplayName)}"><img src="${escapeAttr(clientLogoUrl)}" alt="" loading="lazy" /></span><span class="muted">${escapeHtml(clientDisplayName)}</span></div>`
      : `<span class="muted">${escapeHtml(clientDisplayName)}</span>`;
  const thermokingReq = requestRequiresTermoking(req);
  const obs = String(req.notes || req.observations || "").trim();
  const origAddr = String(req.originAddress || "").trim();
  const destAddr = String(req.destinationAddress || "").trim();
  const modoTransporte = escapeHtml(requestTransportModeFromRequest(req));
  const tripDetail = req.trip
    ? `<div class="dash-grid solicitud-trip-summary">
            <div class="full"><strong>Resumen del viaje asignado</strong></div>
            <div><strong>Código:</strong> ${escapeHtml(String(req.trip.tripNumber || ""))}</div>
            <div><strong>Camión:</strong> ${escapeHtml(String(req.trip.vehiclePlate || ""))} (${escapeHtml(String(req.trip.vehicleType || "-"))})</div>
            <div><strong>Conductor:</strong> ${escapeHtml(String(req.trip.driverName || ""))} · ${escapeHtml(String(req.trip.driverPhone || "-"))}</div>
            <div><strong>Recogida:</strong> ${fmtDate(req.trip.etaPickup)}</div>
            <div><strong>Entrega:</strong> ${fmtDate(req.trip.etaDelivery)}</div>
            <div class="full solicitud-trip-summary-actions">
              <button type="button" class="btn btn-action" data-action="solicitud-trip-open">${IC.eye} Abrir detalle del viaje</button>
            </div>
          </div>`
    : `<p class="muted" style="margin:0.35rem 0 0">Aún no tiene viaje asignado.</p>`;
  openInfoModal({
    title: `Solicitud ${req.requestNumber || req.id}`,
    subtitleHtml: prettyStatus(req.status, "request"),
    wide: true,
    afterMount: req.trip
      ? (contentEl) => {
          contentEl.querySelector("[data-action='solicitud-trip-open']")?.addEventListener("click", () => {
            openAssignedTripInfoModal(req);
          });
        }
      : undefined,
    bodyHtml: `
      <section aria-label="Viaje asignado principal">
        <h3 class="solicitud-detail-heading">Viaje asignado</h3>
        ${tripDetail}
      </section>
      <hr style="border:0;border-top:1px solid var(--line);margin:1rem 0;" />
      <section class="solicitud-detail-section" aria-label="Datos de la solicitud">
        <h3 class="solicitud-detail-heading">Solicitud de transporte</h3>
        <div class="dash-grid">
          <div class="full"><strong>Cliente</strong><br />${clientBlock}</div>
          <div><strong>Modo de transporte</strong><br /><span class="muted">${modoTransporte}</span></div>
          <div><strong>Refrigeración Termoking</strong><br /><span class="muted">${thermokingReq ? "Sí, requerida" : "No"}</span></div>
          <div><strong>Ruta</strong><br /><span class="muted">${escapeHtml(formatRoute(req))}</span></div>
          ${origAddr ? `<div class="full"><strong>Origen (dirección)</strong><br /><span class="muted">${escapeHtml(origAddr)}</span></div>` : ""}
          ${destAddr ? `<div class="full"><strong>Destino (dirección)</strong><br /><span class="muted">${escapeHtml(destAddr)}</span></div>` : ""}
          <div><strong>Recogida programada</strong><br /><span class="muted">${fmtDate(req.pickupAt || `${req.pickupDate || ""}T${req.pickupTime || ""}`)}</span></div>
          <div><strong>Entrega estimada</strong><br /><span class="muted">${fmtDate(req.etaDelivery || `${req.deliveryDate || ""}T${req.deliveryTime || ""}`)}</span></div>
          <div><strong>Solicita</strong><br /><span class="muted">${escapeHtml(String(req.requestedByName || "-"))}</span></div>
          <div><strong>Contacto en sitio</strong><br /><span class="muted">${escapeHtml(String(req.siteContactName || req.contactName || "-"))} · ${escapeHtml(String(req.siteContactPhone || req.contactPhone || "-"))}</span></div>
          <div><strong>Carga</strong><br /><span class="muted">${escapeHtml(String(req.cargoDescription || "-"))}</span></div>
          <div><strong>Requisitos de camión</strong><br /><span class="muted">${requestTruckRequirementSummaryHtml(req)}</span></div>
          <div><strong>Valor del viaje</strong><br /><span class="muted">$${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}</span></div>
          ${parseNum(req.insuredValue || 0) > 0 ? `<div><strong>Valor asegurado</strong><br /><span class="muted">$${parseNum(req.insuredValue).toLocaleString("es-CO")}</span></div>` : ""}
          ${parseNum(req.distanceKm || 0) > 0 ? `<div><strong>Distancia estimada</strong><br /><span class="muted">${parseNum(req.distanceKm).toLocaleString("es-CO")} km</span></div>` : ""}
          ${req.autoApproved ? `<div><strong>Aprobación</strong><br /><span class="muted">Automática</span></div>` : ""}
          ${parseNum(req.standbyChargeTotal) > 0 ? `<div class="full"><strong>Standby</strong><br /><span class="muted">$${parseNum(req.standbyChargeTotal).toLocaleString("es-CO")}</span></div>` : ""}
          ${req.rejectionReason ? `<div class="full"><strong>Motivo rechazo</strong><br /><span class="muted">${escapeHtml(String(req.rejectionReason))}</span></div>` : ""}
        </div>
        ${obs ? `<div class="solicitud-detail-notes full"><strong>Observaciones</strong><p class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0">${escapeHtml(obs)}</p></div>` : ""}
      </section>
      ${renderRequestModificationLogSectionHtml(req)}
    `
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
    <span class="muted">Usuario:</span> ${escapeHtml(String(logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${escapeHtml(String(logRow.reason || "—"))}`;
  if (!snap) {
    openInfoModal({
      title: `Solicitud eliminada ${reqN}`,
      subtitleHtml: `${baseAuditSubtitle}<br /><span class="muted">Estado al eliminar:</span> —`,
      wide: true,
      bodyHtml:
        '<p class="muted">No hay copia JSON de la solicitud en este registro de auditoría (registros antiguos o sin snapshot).</p>'
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
  openInfoModal({
    title: `Solicitud eliminada ${reqN}`,
    subtitleHtml: fullSubtitleHtml,
    wide: true,
    bodyHtml: `
      <section class="solicitud-detail-section" aria-label="Copia de la solicitud eliminada">
        <div class="dash-grid">
          <div class="full"><strong>Cliente</strong><br /><span class="muted">${escapeHtml(
            snapPick(snap, "nombre_cliente", "clientName") || "—"
          )}</span></div>
          <div><strong>Modo de transporte</strong><br /><span class="muted">${modo}</span></div>
          <div><strong>Refrigeración Termoking</strong><br /><span class="muted">${thermoking ? "Sí, requerida" : "No"}</span></div>
          <div><strong>Tipo de vehículo solicitado</strong><br /><span class="muted">${tipoVeh}</span></div>
          <div><strong>Ruta (ciudad / depto.)</strong><br /><span class="muted">${routeLine}</span></div>
          ${origAddr ? `<div class="full"><strong>Origen (dirección)</strong><br /><span class="muted">${origAddr}</span></div>` : ""}
          ${destAddr ? `<div class="full"><strong>Destino (dirección)</strong><br /><span class="muted">${destAddr}</span></div>` : ""}
          <div><strong>Recogida programada</strong><br /><span class="muted">${escapeHtml(fmtDate(pickupIso))}</span></div>
          <div><strong>Entrega estimada</strong><br /><span class="muted">${escapeHtml(fmtDate(deliveryIso))}</span></div>
          <div><strong>Solicita</strong><br /><span class="muted">${requestedBy}</span></div>
          <div><strong>Contacto en sitio</strong><br /><span class="muted">${contactName} · ${contactPhone}</span></div>
          <div><strong>Carga</strong><br /><span class="muted">${cargo}</span></div>
          <div><strong>Peso / cajas</strong><br /><span class="muted">${peso.toLocaleString("es-CO")} kg · ${cajas.toLocaleString("es-CO")} cajas</span></div>
        </div>
        ${obs ? `<div class="solicitud-detail-notes"><strong>Observaciones</strong><p class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0">${escapeHtml(obs)}</p></div>` : ""}
      </section>
    `
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
    <span class="muted">Usuario:</span> ${escapeHtml(String(logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${escapeHtml(String(logRow.reason || "—"))}<br />
    <span class="muted">Solicitud:</span> ${escapeHtml(reqLabel)} · <span class="muted">Viaje:</span> ${escapeHtml(tripLabel)}`;
  if (!snap) {
    openInfoModal({
      title: `Viaje desasignado ${tripLabel}`,
      subtitleHtml: baseAuditSubtitle,
      wide: true,
      bodyHtml:
        '<p class="muted">No hay copia JSON del viaje en este registro de auditoría (registros antiguos o sin snapshot).</p>'
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
  openInfoModal({
    title: `Viaje desasignado ${numViajeRaw}`,
    subtitleHtml: fullSubtitleHtml,
    wide: true,
    bodyHtml: `
      <section class="solicitud-detail-section" aria-label="Copia del viaje desasignado">
        <div class="dash-grid">
          <div><strong>Número de viaje</strong><br /><span class="muted">${numViaje}</span></div>
          <div class="full"><strong>ID solicitud asociada</strong><br /><span class="muted">${idSol}</span></div>
          <div><strong>Vehículo (placa)</strong><br /><span class="muted">${plate}</span></div>
          <div><strong>Tipo vehículo asignado</strong><br /><span class="muted">${tipoVeh}</span></div>
          <div><strong>Conductor</strong><br /><span class="muted">${driver}</span></div>
          <div><strong>Teléfono conductor</strong><br /><span class="muted">${driverPhone}</span></div>
          <div class="full"><strong>Descripción de ruta / observaciones</strong><br /><span class="muted">${routeDesc}</span></div>
          <div><strong>Recogida programada</strong><br /><span class="muted">${escapeHtml(fmtDate(pickup))}</span></div>
          <div><strong>Entrega programada</strong><br /><span class="muted">${escapeHtml(fmtDate(delivery))}</span></div>
          <div><strong>Asignado por</strong><br /><span class="muted">${assignedBy}</span></div>
          <div><strong>Fecha de asignación</strong><br /><span class="muted">${escapeHtml(fmtDate(assignedAt))}</span></div>
        </div>
        ${invoiceBlock}
      </section>
    `
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
      const updated = requests.map((r) => (r.id === req.id ? { ...r, ...updates } : r));
      try {
        await reqWriteAwait(updated);
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
        await writeAwaitServer(KEYS.tripRouteRates, next);
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
