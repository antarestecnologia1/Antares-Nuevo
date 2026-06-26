/**
 * Modales de transporte (viajes, solicitudes, tarifas, auditoría).
 * Carga con defer después de portal-runtime.js; registra en globalThis.__antaresPortalTransportModals
 */
(function registerPortalModals() {
  "use strict";
  const G = globalThis;
  const {
    read, write, writeAwaitServer, KEYS, IC, STATUS, ROLES,
    state, openEditModal, escapeHtml, escapeAttr, fmtDate, fmtDateOr,
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
    openDetailViewSheet, detailViewCardsFromPairs, detailViewCardMarkup,
    syncPayloadForEditedObjectKeys, writeAwaitServerEdit
  } = globalThis;

function openAssignedTripInfoModal(req) {
  if (!req?.trip) return;
  const canEditTrip = canAdminEditTrip(req);
  const tripNo = String(req.trip.tripNumber || "—");
  const clientName = String(req.clientName || "—");
  const tripValue = `$${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}`;
  const insuredValue = parseNum(req.insuredValue || 0);
  const distanceKm = parseNum(req.distanceKm || 0);
  const standbyTotal = parseNum(req.standbyChargeTotal || 0);
  const driverName = String(req.trip.driverName || "—");
  const driverPhone = String(req.trip.driverPhone || "-");
  const secondaryActions = [
    `<button type="button" class="btn btn-outline" data-trip-info-action="view-request">${IC.eye} Ver solicitud</button>`,
    canEditTrip ? `<button type="button" class="btn btn-action" data-trip-info-action="edit-trip">${IC.edit} Editar viaje</button>` : ""
  ].filter(Boolean).join("");
  const pairs = [
    [
      "Carga",
      `${escapeHtml(String(req.cargoDescription || "—"))} · ${requestTruckRequirementSummaryHtml(req)}`,
      { iconKey: "package", tone: "blue" }
    ],
    ["Valor viaje", `<strong class="detail-view-money">${escapeHtml(tripValue)}</strong>`, { iconKey: "dollar", tone: "green", highlight: true }],
    [
      "Camión",
      `${escapeHtml(String(req.trip.vehiclePlate || "—"))} (${escapeHtml(String(req.trip.vehicleType || "-"))})`,
      { iconKey: "truck", tone: "orange" }
    ],
    [
      "Conductor",
      escapeHtml(driverName),
      { iconKey: "user", tone: "purple", subHtml: escapeHtml(driverPhone) }
    ],
    ["Asignado por", escapeHtml(String(req.trip.assignedBy || req.approvedBy || "-")), { iconKey: "layers", tone: "teal" }],
    [
      "Fecha asignación",
      escapeHtml(fmtDate(req.trip.assignedAt || req.approvedAt || req.createdAt)),
      { iconKey: "calendar", tone: "blue" }
    ],
    ["Creado", escapeHtml(fmtDateOr(req.trip.createdAt || req.createdAt, "—")), { iconKey: "calendar", tone: "rose" }],
    [
      "Última actualización",
      escapeHtml(fmtDateOr(req.trip.updatedAt || req.trip.createdAt || req.updatedAt, "—")),
      { iconKey: "clock", tone: "orange" }
    ],
    ["Recogida", escapeHtml(fmtDate(req.trip.etaPickup)), { iconKey: "clock", tone: "blue" }],
    ["Entrega", escapeHtml(fmtDate(req.trip.etaDelivery)), { iconKey: "package", tone: "green" }]
  ];
  if (insuredValue > 0) {
    pairs.splice(2, 0, ["Valor asegurado", `$${insuredValue.toLocaleString("es-CO")}`, { iconKey: "shield", tone: "teal" }]);
  }
  if (distanceKm > 0) {
    pairs.push(["Distancia estimada", `${distanceKm.toLocaleString("es-CO")} km`, { iconKey: "mapPin", tone: "purple" }]);
  }
  if (standbyTotal > 0) {
    pairs.push(["Standby acumulado", `$${standbyTotal.toLocaleString("es-CO")}`, { iconKey: "dollar", tone: "orange" }]);
  }
  if (req.closedAt) {
    pairs.push(["Cierre", escapeHtml(fmtDate(req.closedAt)), { iconKey: "calendar", tone: "rose" }]);
  }
  if (req.trip.invoice) {
    pairs.push([
      "Factura",
      `${escapeHtml(String(req.trip.invoice.number))} · $${parseNum(req.trip.invoice.total).toLocaleString("es-CO")}`,
      { iconKey: "file", tone: "blue" }
    ]);
  }
  openDetailViewSheet({
    title: `Viaje ${tripNo}`,
    sheetTitle: `Viaje ${tripNo}`,
    subtitleHtml: `${IC.briefcase} ${escapeHtml(clientName)}`,
    statusHtml: prettyStatus(req.status, "trip"),
    moduleIcon: "truck",
    moduleTone: "blue",
    cardsHtml: detailViewCardsFromPairs(pairs, { skipEmpty: false }),
    secondaryActionsHtml: secondaryActions,
    afterMount: (contentEl) => {
      contentEl.querySelector("[data-trip-info-action='view-request']")?.addEventListener("click", () => {
        openRequestDetailModal(req);
      });
      contentEl.querySelector("[data-trip-info-action='edit-trip']")?.addEventListener("click", () => {
        openEditTripModal(req);
      });
    }
  });
}

function openRequestDetailModal(req) {
  if (!req) return;
  const clientDisplayName = String(req.clientName || getCompanyById?.(req.clientCompanyId)?.name || "-").trim() || "-";
  const thermokingReq = requestRequiresTermoking(req);
  const obs = String(req.notes || req.observations || "").trim();
  const origAddr = String(req.originAddress || "").trim();
  const destAddr = String(req.destinationAddress || "").trim();
  const modoTransporte = escapeHtml(requestTransportModeFromRequest(req));
  const tripValue = `$${parseNum(req.tripValue || req.insuredValue || 0).toLocaleString("es-CO")}`;
  const insuredValue = parseNum(req.insuredValue || 0);
  const distanceKm = parseNum(req.distanceKm || 0);
  const standbyTotal = parseNum(req.standbyChargeTotal || 0);
  const pairs = [
    ["Cliente", escapeHtml(clientDisplayName), { iconKey: "briefcase", tone: "blue", full: true }],
    ["Ruta", escapeHtml(formatRoute(req)), { iconKey: "mapPin", tone: "teal", full: true }],
    ["Modo de transporte", modoTransporte, { iconKey: "truck", tone: "orange" }],
    ["Termoking", thermokingReq ? "Sí, requerida" : "No", { iconKey: "activity", tone: "blue" }],
    [
      "Recogida programada",
      escapeHtml(fmtDate(req.pickupAt || `${req.pickupDate || ""}T${req.pickupTime || ""}`)),
      { iconKey: "clock", tone: "blue" }
    ],
    [
      "Entrega estimada",
      escapeHtml(fmtDate(req.etaDelivery || `${req.deliveryDate || ""}T${req.deliveryTime || ""}`)),
      { iconKey: "package", tone: "green" }
    ],
    ["Solicita", escapeHtml(String(req.requestedByName || "-")), { iconKey: "user", tone: "purple" }],
    [
      "Contacto en sitio",
      `${escapeHtml(String(req.siteContactName || req.contactName || "-"))} · ${escapeHtml(String(req.siteContactPhone || req.contactPhone || "-"))}`,
      { iconKey: "phone", tone: "rose" }
    ],
    ["Carga", escapeHtml(String(req.cargoDescription || "-")), { iconKey: "package", tone: "blue" }],
    ["Requisitos de camión", requestTruckRequirementSummaryHtml(req), { iconKey: "truck", tone: "orange" }],
    ["Valor del viaje", `<strong class="detail-view-money">${escapeHtml(tripValue)}</strong>`, { iconKey: "dollar", tone: "green", highlight: true }]
  ];
  if (origAddr) pairs.push(["Origen (dirección)", escapeHtml(origAddr), { iconKey: "mapPin", tone: "teal", full: true }]);
  if (destAddr) pairs.push(["Destino (dirección)", escapeHtml(destAddr), { iconKey: "mapPin", tone: "purple", full: true }]);
  if (insuredValue > 0) pairs.push(["Valor asegurado", `$${insuredValue.toLocaleString("es-CO")}`, { iconKey: "shield", tone: "teal" }]);
  if (distanceKm > 0) pairs.push(["Distancia estimada", `${distanceKm.toLocaleString("es-CO")} km`, { iconKey: "mapPin", tone: "orange" }]);
  if (req.autoApproved) pairs.push(["Aprobación", "Automática", { iconKey: "activity", tone: "green" }]);
  if (standbyTotal > 0) pairs.push(["Standby", `$${standbyTotal.toLocaleString("es-CO")}`, { iconKey: "dollar", tone: "orange" }]);
  if (req.rejectionReason) pairs.push(["Motivo rechazo", escapeHtml(String(req.rejectionReason)), { iconKey: "alertTriangle", tone: "rose", full: true }]);
  const tripExtra = req.trip
    ? detailViewCardMarkup({
        iconKey: "truck",
        label: "Viaje asignado",
        valueHtml: `<strong>${escapeHtml(String(req.trip.tripNumber || "—"))}</strong> · ${escapeHtml(String(req.trip.vehiclePlate || "—"))}`,
        tone: "blue",
        full: true,
        subHtml: `${escapeHtml(String(req.trip.driverName || "—"))} · ${escapeHtml(fmtDate(req.trip.etaPickup))} → ${escapeHtml(fmtDate(req.trip.etaDelivery))}`
      }) +
      `<div class="detail-view-inline-action">
        <button type="button" class="btn btn-action" data-action="solicitud-trip-open">${IC.eye} Abrir detalle del viaje</button>
      </div>`
    : detailViewCardMarkup({
        iconKey: "truck",
        label: "Viaje asignado",
        valueHtml: `<span class="muted">Aún no tiene viaje asignado.</span>`,
        tone: "orange",
        full: true
      });
  openDetailViewSheet({
    title: `Solicitud ${req.requestNumber || req.id}`,
    sheetTitle: `Solicitud ${req.requestNumber || req.id}`,
    subtitleHtml: `${IC.briefcase} ${escapeHtml(clientDisplayName)}`,
    statusHtml: prettyStatus(req.status, "request"),
    moduleIcon: "file",
    moduleTone: "blue",
    cardsHtml: tripExtra + detailViewCardsFromPairs(pairs, { skipEmpty: false }),
    notesHtml: obs,
    extraHtml: renderRequestModificationLogSectionHtml(req),
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
  const baseAuditSubtitle = `${IC.clock} ${escapeHtml(fmtDate(logRow.deletedAt))} · ${escapeHtml(String(logRow.deletedByName || logRow.deletedByEmail || "—"))}`;
  if (!snap) {
    openDetailViewSheet({
      title: `Solicitud eliminada ${reqN}`,
      sheetTitle: `Solicitud eliminada ${reqN}`,
      subtitleHtml: baseAuditSubtitle,
      moduleIcon: "alertTriangle",
      moduleTone: "rose",
      cardsHtml: detailViewCardMarkup({
        iconKey: "file",
        label: "Auditoría",
        valueHtml: `<span class="muted">No hay copia JSON de la solicitud en este registro.</span>`,
        tone: "orange",
        full: true
      })
    });
    return;
  }
  const modo = escapeHtml(snapPick(snap, "tipo_servicio", "serviceType") || "—");
  const tkRaw = snap.refrigeracion_termoking ?? snap.requiresThermoking;
  const thermoking =
    tkRaw === true || String(tkRaw).toLowerCase() === "true" || String(tkRaw).toLowerCase() === "yes";
  const routeLine = escapeHtml(formatDeletedRequestSnapshotRouteLine(snap));
  const obs = String(snapPick(snap, "observaciones", "notes") || "").trim();
  const pairs = [
    ["Cliente", escapeHtml(snapPick(snap, "nombre_cliente", "clientName") || "—"), { iconKey: "briefcase", tone: "blue" }],
    ["Modo de transporte", modo, { iconKey: "truck", tone: "orange" }],
    ["Termoking", thermoking ? "Sí, requerida" : "No", { iconKey: "activity", tone: "teal" }],
    ["Ruta", routeLine, { iconKey: "mapPin", tone: "purple", full: true }],
    ["Recogida", escapeHtml(fmtDate(snapPick(snap, "fecha_hora_recogida", "pickupAt"))), { iconKey: "clock", tone: "blue" }],
    ["Entrega", escapeHtml(fmtDate(snapPick(snap, "fecha_hora_entrega_estimada", "etaDelivery"))), { iconKey: "package", tone: "green" }],
    ["Carga", escapeHtml(snapPick(snap, "descripcion_carga", "cargoDescription") || "—"), { iconKey: "package", tone: "blue" }]
  ];
  openDetailViewSheet({
    title: `Solicitud eliminada ${reqN}`,
    sheetTitle: `Solicitud eliminada ${reqN}`,
    subtitleHtml: baseAuditSubtitle,
    statusHtml: `<span class="muted">Estado al eliminar:</span> ${escapeHtml(snapPick(snap, "estado", "status") || "—")}`,
    moduleIcon: "file",
    moduleTone: "rose",
    cardsHtml: detailViewCardsFromPairs(pairs, { skipEmpty: false }),
    notesHtml: obs
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
  const baseAuditSubtitle = `${IC.clock} ${escapeHtml(fmtDate(logRow.deletedAt))} · Solicitud ${escapeHtml(reqLabel)}`;
  if (!snap) {
    openDetailViewSheet({
      title: `Viaje desasignado ${tripLabel}`,
      sheetTitle: `Viaje desasignado ${tripLabel}`,
      subtitleHtml: baseAuditSubtitle,
      moduleIcon: "alertTriangle",
      moduleTone: "rose",
      cardsHtml: detailViewCardMarkup({
        iconKey: "truck",
        label: "Auditoría",
        valueHtml: `<span class="muted">No hay copia JSON del viaje en este registro.</span>`,
        tone: "orange",
        full: true
      })
    });
    return;
  }
  const numViajeRaw = snapPick(snap, "numero_viaje", "tripNumber") || tripLabel;
  const pairs = [
    ["Número de viaje", escapeHtml(numViajeRaw), { iconKey: "truck", tone: "blue" }],
    ["Vehículo", escapeHtml(snapPick(snap, "placa_vehiculo", "vehiclePlate") || "—"), { iconKey: "truck", tone: "orange" }],
    ["Conductor", escapeHtml(snapPick(snap, "nombre_conductor", "driverName") || "—"), { iconKey: "user", tone: "purple" }],
    ["Teléfono", escapeHtml(snapPick(snap, "telefono_conductor", "driverPhone") || "—"), { iconKey: "phone", tone: "rose" }],
    ["Recogida", escapeHtml(fmtDate(snapPick(snap, "fecha_hora_recogida_programada", "etaPickup"))), { iconKey: "clock", tone: "blue" }],
    ["Entrega", escapeHtml(fmtDate(snapPick(snap, "fecha_hora_entrega_programada", "etaDelivery"))), { iconKey: "package", tone: "green" }],
    ["Asignado por", escapeHtml(snapPick(snap, "asignado_por", "assignedBy") || "—"), { iconKey: "layers", tone: "teal" }],
    ["Fecha asignación", escapeHtml(fmtDate(snapPick(snap, "fecha_hora_asignacion", "assignedAt"))), { iconKey: "calendar", tone: "blue" }]
  ];
  openDetailViewSheet({
    title: `Viaje desasignado ${numViajeRaw}`,
    sheetTitle: `Viaje desasignado ${numViajeRaw}`,
    subtitleHtml: baseAuditSubtitle,
    statusHtml: `<span class="muted">Estado:</span> ${escapeHtml(snapPick(snap, "estado_operativo_en_vivo", "liveOperationalStatus") || "—")}`,
    moduleIcon: "truck",
    moduleTone: "rose",
    cardsHtml: detailViewCardsFromPairs(pairs, { skipEmpty: false })
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
