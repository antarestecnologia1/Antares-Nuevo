/**
 * Modales de transporte (solicitudes, viajes, tarifas, auditoría eliminados).
 * Extraído desde modules/core/portal-runtime.js.
 */
const G = globalThis;

/** Copia JSON de auditoría de viaje: bootstrap puede traer solo `snapshotSummary`. */
function deletedTripSnapshotForTableRow(row) {
  const direct = G.parsePortalJsonSnapshot(row.snapshot);
  if (direct) return direct;
  const s = row.snapshotSummary;
  return s && typeof s === "object" ? s : null;
}

/** Copia JSON de auditoría de solicitud: bootstrap puede traer solo `snapshotSummary`. */
function deletedRequestSnapshotForTableRow(row) {
  const direct = G.parsePortalJsonSnapshot(row.snapshot);
  if (direct) return direct;
  const s = row.snapshotSummary;
  return s && typeof s === "object" ? s : null;
}

/**
 * Hidrata `noveltiesDetail` / `settlementDetail` desde el API si el bootstrap solo trajo la fila resumida.
 * @returns {object|null} fila fusionada o null si no hay sesión API
 */
async function ensurePayrollRunHeavyJsonLoaded(runId) {
  const id = String(runId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return null;
  const runs = G.read(G.KEYS.payrollRuns, []);
  const idx = runs.findIndex((r) => String(r.id) === id);
  if (idx < 0) return null;
  const cur = runs[idx];
  if (cur.payrollRunHeavyOmitted !== true) return cur;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return cur;
  try {
    const detail = await api.getJson(`/portal/payroll-runs/${encodeURIComponent(id)}`);
    if (!detail || typeof detail !== "object") return cur;
    const merged = {
      ...cur,
      settlementDetail: detail.settlementDetail ?? cur.settlementDetail ?? null,
      noveltiesDetail: detail.noveltiesDetail ?? cur.noveltiesDetail ?? null,
      workedDays: detail.workedDays != null ? detail.workedDays : cur.workedDays,
      workedDaysPaymentCop:
        detail.workedDaysPaymentCop != null ? detail.workedDaysPaymentCop : cur.workedDaysPaymentCop,
      payrollRunHeavyOmitted: false
    };
    const next = [...runs];
    next[idx] = merged;
    write(G.KEYS.payrollRuns, next);
    return merged;
  } catch (err) {
    G.devWarn("Portal: detalle de liquidación no disponible.", err?.message || err);
    G.notify(String(err?.message || "No fue posible cargar el detalle de la liquidación."), "warn");
    return cur;
  }
}

async function ensureDeletedTransportTripAuditSnapshotLoaded(logId) {
  const id = String(logId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return false;
  const rows = G.read(G.KEYS.deletedTransportTripLogs, []);
  const row = rows.find((r) => String(r.id) === id);
  if (!row) return false;
  if (G.parsePortalJsonSnapshot(row.snapshot)) return true;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return false;
  try {
    const res = await api.getJson(`/portal/deleted-transport-trip-audit/${encodeURIComponent(id)}`);
    const snap = res && typeof res === "object" ? res.snapshot : null;
    const idx = rows.findIndex((r) => String(r.id) === id);
    if (idx < 0) return false;
    const next = [...rows];
    next[idx] = { ...next[idx], snapshot: snap };
    write(G.KEYS.deletedTransportTripLogs, next);
    return true;
  } catch (err) {
    G.devWarn("Portal: snapshot de auditoría (viaje) no disponible.", err?.message || err);
    G.notify(String(err?.message || "No fue posible cargar la copia del viaje."), "warn");
    return false;
  }
}

async function ensureDeletedTransportRequestAuditSnapshotLoaded(logId) {
  const id = String(logId || "").trim();
  if (!id || !portalCanRefreshFromApi()) return false;
  const rows = G.read(G.KEYS.deletedTransportRequestLogs, []);
  const row = rows.find((r) => String(r.id) === id);
  if (!row) return false;
  if (G.parsePortalJsonSnapshot(row.snapshot)) return true;
  const api = window.AntaresApi;
  if (!api || typeof api.getJson !== "function") return false;
  try {
    const res = await api.getJson(`/portal/deleted-transport-request-audit/${encodeURIComponent(id)}`);
    const snap = res && typeof res === "object" ? res.snapshot : null;
    const idx = rows.findIndex((r) => String(r.id) === id);
    if (idx < 0) return false;
    const next = [...rows];
    next[idx] = { ...next[idx], snapshot: snap };
    write(G.KEYS.deletedTransportRequestLogs, next);
    return true;
  } catch (err) {
    G.devWarn("Portal: snapshot de auditoría (solicitud) no disponible.", err?.message || err);
    G.notify(String(err?.message || "No fue posible cargar la copia de la solicitud."), "warn");
    return false;
  }
}

function formatDeletedRequestSnapshotRouteLine(snap) {
  if (!snap) return "Sin datos de ruta.";
  const od = G.snapPick(snap, "departamento_origen", "originDepartment");
  const oc = G.snapPick(snap, "ciudad_origen", "originCity");
  const dd = G.snapPick(snap, "departamento_destino", "destinationDepartment");
  const dc = G.snapPick(snap, "ciudad_destino", "destinationCity");
  const left = [oc, od].filter(Boolean).join(", ") || oc || od || "";
  const right = [dc, dd].filter(Boolean).join(", ") || dc || dd || "";
  if (left && right) return `${left} → ${right}`;
  return left || right || "Sin datos de ruta.";
}

function formatDeletedRequestSnapshotTableSummary(snap) {
  if (!snap) return "—";
  const route = formatDeletedRequestSnapshotRouteLine(snap);
  const cargo = G.snapPick(snap, "descripcion_carga", "cargoDescription");
  if (!cargo) return route;
  const short = cargo.length > 90 ? `${cargo.slice(0, 87)}…` : cargo;
  return `${route} · ${short}`;
}

/**
 * Ficha de solo lectura desde la fila de `auditoria_solicitudes_eliminadas`
 * (copia JSON al momento de borrar).
 */
function openDeletedTransportRequestAuditModal(logRow) {
  if (!logRow) return;
  const snap = G.parsePortalJsonSnapshot(logRow.snapshot);
  const reqN = String(logRow.requestNumber || logRow.requestId || "-").trim();
  const baseAuditSubtitle = `<span class="muted">Eliminada:</span> ${G.escapeHtml(G.fmtDate(logRow.deletedAt))}<br />
    <span class="muted">Usuario:</span> ${G.escapeHtml(String(logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${G.escapeHtml(String(logRow.reason || "—"))}`;
  if (!snap) {
    G.openInfoModal({
      title: `Solicitud eliminada ${reqN}`,
      subtitleHtml: `${baseAuditSubtitle}<br /><span class="muted">Estado al eliminar:</span> —`,
      wide: true,
      bodyHtml:
        '<p class="muted">No hay copia JSON de la solicitud en este registro de auditoría (registros antiguos o sin snapshot).</p>'
    });
    return;
  }
  const modo = G.escapeHtml(G.snapPick(snap, "tipo_servicio", "serviceType") || "—");
  const tkRaw = snap.refrigeracion_termoking ?? snap.requiresThermoking;
  const thermoking =
    tkRaw === true ||
    String(tkRaw).toLowerCase() === "true" ||
    String(tkRaw).toLowerCase() === "yes";
  const routeLine = G.escapeHtml(formatDeletedRequestSnapshotRouteLine(snap));
  const origAddr = G.escapeHtml(G.snapPick(snap, "direccion_origen", "originAddress"));
  const destAddr = G.escapeHtml(G.snapPick(snap, "direccion_destino", "destinationAddress"));
  const pickupIso = G.snapPick(snap, "fecha_hora_recogida", "pickupAt");
  const deliveryIso = G.snapPick(snap, "fecha_hora_entrega_estimada", "etaDelivery");
  const requestedBy = G.escapeHtml(G.snapPick(snap, "nombre_quien_solicita", "requestedByName") || "—");
  const contactName = G.escapeHtml(G.snapPick(snap, "nombre_contacto_en_sitio", "siteContactName", "contactName") || "—");
  const contactPhone = G.escapeHtml(G.snapPick(snap, "telefono_contacto_en_sitio", "siteContactPhone", "contactPhone") || "—");
  const cargo = G.escapeHtml(G.snapPick(snap, "descripcion_carga", "cargoDescription") || "—");
  const peso = G.parseNum(snap.peso_kg ?? snap.weightKg);
  const cajas = G.parseNum(snap.numero_cajas ?? snap.boxes ?? snap.boxesCount);
  const estadoPlain = G.snapPick(snap, "estado", "status") || "—";
  const estado = G.escapeHtml(estadoPlain);
  const tipoVeh = G.escapeHtml(
    G.snapPick(snap, "tipo_vehiculo_requerido", "tipo_vehiculo_solicitado", "vehicleType", "requiredTruckType") || "—"
  );
  const obs = String(G.snapPick(snap, "observaciones", "notes") || "").trim();
  const fullSubtitleHtml = `${baseAuditSubtitle}<br /><span class="muted">Estado al eliminar:</span> ${estado}`;
  G.openInfoModal({
    title: `Solicitud eliminada ${reqN}`,
    subtitleHtml: fullSubtitleHtml,
    wide: true,
    bodyHtml: `
      <section class="solicitud-detail-section" aria-label="Copia de la solicitud eliminada">
        <div class="dash-grid">
          <div class="full"><strong>Cliente</strong><br /><span class="muted">${G.escapeHtml(
            G.snapPick(snap, "nombre_cliente", "clientName") || "—"
          )}</span></div>
          <div><strong>Modo de transporte</strong><br /><span class="muted">${modo}</span></div>
          <div><strong>Refrigeración Termoking</strong><br /><span class="muted">${thermoking ? "Sí, requerida" : "No"}</span></div>
          <div><strong>Tipo de vehículo solicitado</strong><br /><span class="muted">${tipoVeh}</span></div>
          <div><strong>Ruta (ciudad / depto.)</strong><br /><span class="muted">${routeLine}</span></div>
          ${origAddr ? `<div class="full"><strong>Origen (dirección)</strong><br /><span class="muted">${origAddr}</span></div>` : ""}
          ${destAddr ? `<div class="full"><strong>Destino (dirección)</strong><br /><span class="muted">${destAddr}</span></div>` : ""}
          <div><strong>Recogida programada</strong><br /><span class="muted">${G.escapeHtml(G.fmtDate(pickupIso))}</span></div>
          <div><strong>Entrega estimada</strong><br /><span class="muted">${G.escapeHtml(G.fmtDate(deliveryIso))}</span></div>
          <div><strong>Solicita</strong><br /><span class="muted">${requestedBy}</span></div>
          <div><strong>Contacto en sitio</strong><br /><span class="muted">${contactName} · ${contactPhone}</span></div>
          <div><strong>Carga</strong><br /><span class="muted">${cargo}</span></div>
          <div><strong>Peso / cajas</strong><br /><span class="muted">${peso.toLocaleString("es-CO")} kg · ${cajas.toLocaleString("es-CO")} cajas</span></div>
        </div>
        ${obs ? `<div class="solicitud-detail-notes"><strong>Observaciones</strong><p class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0">${G.escapeHtml(obs)}</p></div>` : ""}
      </section>
    `
  });
}

function formatDeletedTripSnapshotTableSummary(snap) {
  if (!snap) return "—";
  const num = G.snapPick(snap, "numero_viaje", "tripNumber");
  const plate = G.snapPick(snap, "placa_vehiculo", "vehiclePlate");
  const driver = G.snapPick(snap, "nombre_conductor", "driverName");
  const route = G.snapPick(snap, "descripcion_ruta", "routeDescription", "notes");
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

/**
 * Ficha de solo lectura desde `auditoria_viajes_eliminados.datos_json`
 * (fila de viajes_transporte al momento de desasignar).
 */
function openDeletedTransportTripAuditModal(logRow) {
  if (!logRow) return;
  const snap = G.parsePortalJsonSnapshot(logRow.snapshot);
  const tripLabel = String(logRow.tripNumber || "").trim() || "—";
  const reqLabel = String(logRow.requestNumber || logRow.requestId || "").trim() || "—";
  const baseAuditSubtitle = `<span class="muted">Registrado:</span> ${G.escapeHtml(G.fmtDate(logRow.deletedAt))}<br />
    <span class="muted">Usuario:</span> ${G.escapeHtml(String(logRow.deletedByEmail || "—"))}<br />
    <span class="muted">Motivo:</span> ${G.escapeHtml(String(logRow.reason || "—"))}<br />
    <span class="muted">Solicitud:</span> ${G.escapeHtml(reqLabel)} · <span class="muted">Viaje:</span> ${G.escapeHtml(tripLabel)}`;
  if (!snap) {
    G.openInfoModal({
      title: `Viaje desasignado ${tripLabel}`,
      subtitleHtml: baseAuditSubtitle,
      wide: true,
      bodyHtml:
        '<p class="muted">No hay copia JSON del viaje en este registro de auditoría (registros antiguos o sin snapshot).</p>'
    });
    return;
  }
  const estadoOp = G.escapeHtml(G.snapPick(snap, "estado_operativo_en_vivo", "liveOperationalStatus") || "—");
  const fullSubtitleHtml = `${baseAuditSubtitle}<br /><span class="muted">Estado operativo (copia):</span> ${estadoOp}`;
  const pickup = G.snapPick(snap, "fecha_hora_recogida_programada", "etaPickup");
  const delivery = G.snapPick(snap, "fecha_hora_entrega_programada", "etaDelivery");
  const assignedBy = G.escapeHtml(G.snapPick(snap, "asignado_por", "assignedBy") || "—");
  const assignedAt = G.snapPick(snap, "fecha_hora_asignacion", "assignedAt");
  const tipoVeh = G.escapeHtml(G.snapPick(snap, "tipo_vehiculo_asignado", "vehicleType") || "—");
  const plate = G.escapeHtml(G.snapPick(snap, "placa_vehiculo", "vehiclePlate") || "—");
  const driver = G.escapeHtml(G.snapPick(snap, "nombre_conductor", "driverName") || "—");
  const driverPhone = G.escapeHtml(G.snapPick(snap, "telefono_conductor", "driverPhone") || "—");
  const routeDesc = G.escapeHtml(G.snapPick(snap, "descripcion_ruta", "routeDescription") || "—");
  const numViajeRaw = G.snapPick(snap, "numero_viaje", "tripNumber") || tripLabel;
  const numViaje = G.escapeHtml(numViajeRaw);
  const idSol = G.escapeHtml(G.snapPick(snap, "id_solicitud", "requestId") || String(logRow.requestId || "—"));
  const invoiceRaw = snap.datos_factura_json ?? snap.invoiceData;
  let invoiceBlock = "";
  if (invoiceRaw != null && invoiceRaw !== "") {
    try {
      const txt =
        typeof invoiceRaw === "string" ? invoiceRaw : JSON.stringify(invoiceRaw, null, 2);
      const short = txt.length > 1200 ? `${txt.slice(0, 1197)}…` : txt;
      invoiceBlock = `<div class="solicitud-detail-notes"><strong>Datos facturación (JSON)</strong><pre class="detail-note" style="white-space:pre-wrap;margin:0.35rem 0 0;font-size:0.82em;max-height:14rem;overflow:auto">${G.escapeHtml(short)}</pre></div>`;
    } catch {
      invoiceBlock = "";
    }
  }
  G.openInfoModal({
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
          <div><strong>Recogida programada</strong><br /><span class="muted">${G.escapeHtml(G.fmtDate(pickup))}</span></div>
          <div><strong>Entrega programada</strong><br /><span class="muted">${G.escapeHtml(G.fmtDate(delivery))}</span></div>
          <div><strong>Asignado por</strong><br /><span class="muted">${assignedBy}</span></div>
          <div><strong>Fecha de asignación</strong><br /><span class="muted">${G.escapeHtml(G.fmtDate(assignedAt))}</span></div>
        </div>
        ${invoiceBlock}
      </section>
    `
  });
}

/**
 * Editor del viaje (admin). Permite actualizar fechas estimadas, vehículo,
 * conductor y observaciones operativas. Las acciones destructivas como
 * cambiar el estado del viaje siguen ocurriendo a través del select de
 * estado en el card (transitionRequestStatus).
 */
function openEditTripModal(req) {
  if (!req?.trip) return;
  if (!G.canAdminEditTrip(req)) {
    G.notify("Solo un administrador puede editar este viaje.", "error");
    return;
  }
  const vehicles = G.read(G.KEYS.vehicles, []);
  const drivers = G.read(G.KEYS.drivers, []);
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
  const etaPickupLocal = String(G.toInputDate(req.trip.etaPickup || "") || "").slice(0, 16);
  const etaDeliveryLocal = String(G.toInputDate(req.trip.etaDelivery || "") || "").slice(0, 16);
  G.openEditModal({
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
      { name: "tripValue", label: "Tarifa del viaje (COP)", type: "number", min: 0, value: G.parseNum(req.tripValue || 0), required: false },
      { name: "tripNotes", label: "Observaciones del viaje", type: "textarea", value: req.trip.notes || "", rows: 3 }
    ],
    onSubmit: async (form) => {
      const requests = G.reqRead();
      const targetVehicle = vehicles.find((v) => String(v.id || "") === String(form.vehicleId || ""));
      const targetDriver = drivers.find((d) => String(d.id || "") === String(form.driverId || ""));
      const updates = {
        tripValue: G.parseNum(form.tripValue) || G.parseNum(req.tripValue || 0),
        updatedAt: G.nowIso(),
        updatedBy: G.currentUser()?.name || "Admin",
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
          updatedAt: G.nowIso(),
          updatedBy: G.currentUser()?.name || "Admin"
        }
      };
      const updated = requests.map((r) => (r.id === req.id ? { ...r, ...updates } : r));
      try {
        await G.reqWriteAwait(updated);
      } catch (err) {
        G.notify(String(err?.message || "No fue posible guardar los cambios del viaje."), "error");
        return false;
      }
      G.recalculateResourceAvailability();
      G.notify("Viaje actualizado correctamente.", "success");
      G.renderPortalView();
      return true;
    }
  });
}

/**
 * Edición de tarifa por trayecto (admin): mismo patrón visual que {@link openEditTripModal}
 * (secciones, `modal-card-edit--trip`), sin depender del formulario colapsable.
 */
function openEditRouteRateModal(storageKey) {
  const key = String(storageKey || "").trim();
  if (!key) return;
  const entry = G.getTripRouteRatesNormalized()[key];
  if (!entry) return;
  const parts = G.parseTripRateStorageKeyToRouteParts(key);
  const companies = G.read(G.KEYS.companies, []);
  const selectedCompanyIds = (Array.isArray(entry.companyIds) ? entry.companyIds : [])
    .map((id) => String(id).trim())
    .filter(Boolean);
  const rateScopeValue = selectedCompanyIds.length ? "specific" : "all";
  const auditSummary = G.formatRouteRateAuditSummary(entry);
  const scopeStepHtml = G.buildRouteRateScopeStepInnerHtml(companies, {
    scopeValue: rateScopeValue,
    selectedCompanyIds
  });
  const deptOpts = [{ value: "", label: "Seleccione..." }, ...Object.keys(G.COLOMBIA_LOCATIONS).sort().map((d) => ({ value: d, label: d }))];
  const cityPlaceholder = [{ value: "", label: "Seleccione departamento..." }];
  G.openEditModal({
    title: "Editar tarifa de trayecto",
    subtitle: G.humanTripRateRouteLabelFromStorageKey(key),
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
      { name: "tripRateCop", label: "Valor del viaje (COP)", type: "number", min: 1, step: 1, value: G.parseNum(entry.value), required: true },
      { type: "custom", full: true, html: `<p class="muted" style="margin:0">${G.escapeHtml(auditSummary)}</p>` },
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
      G.setSelectValueInsensitive(od, parts.originDepartment);
      G.attachDepartmentCitySelects(formEl, {
        departmentSelector: "select[name='originDepartment']",
        citySelector: "select[name='originCity']",
        initialDepartment: parts.originDepartment,
        initialCity: parts.originCity
      });
      G.setSelectValueInsensitive(oc, parts.originCity);
      G.setSelectValueInsensitive(dd, parts.destinationDepartment);
      G.attachDepartmentCitySelects(formEl, {
        departmentSelector: "select[name='destinationDepartment']",
        citySelector: "select[name='destinationCity']",
        initialDepartment: parts.destinationDepartment,
        initialCity: parts.destinationCity
      });
      G.setSelectValueInsensitive(dc, parts.destinationCity);
      G.wireRouteRateScopeSection(formEl);
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
      const tripRateCop = G.parseNum(payload.tripRateCop);
      if (!od) {
        G.failPortalField(formEl, "originDepartment", G.userMessage("routeRateSelectRoute"));
        return false;
      }
      if (!oc) {
        G.failPortalField(formEl, "originCity", G.userMessage("routeRateSelectRoute"));
        return false;
      }
      if (!dd) {
        G.failPortalField(formEl, "destinationDepartment", G.userMessage("routeRateSelectRoute"));
        return false;
      }
      if (!dc) {
        G.failPortalField(formEl, "destinationCity", G.userMessage("routeRateSelectRoute"));
        return false;
      }
      if (tripRateCop <= 0) {
        G.failPortalField(formEl, "tripRateCop", G.userMessage("routeRateInvalidCop"));
        return false;
      }
      if (scope === "specific" && !companyIds.length) {
        const scopeEl =
          formEl.querySelector("[data-route-rate-companies-field]") || formEl.querySelector("[name='rateClientCompanies']");
        G.failPortalField(formEl, scopeEl || "rateClientCompanies", "Selecciona al menos una empresa para una tarifa específica.");
        return false;
      }
      const routeKey = G.buildTripRouteRateKey(od, oc, dd, dc);
      const normalized = G.getTripRouteRatesNormalized();
      const newStorageKey = G.tripRateStorageKey(routeKey, companyIds);
      const editingKey = String(payload.editingRateKey || "").trim();
      const previousEntry = editingKey ? normalized[editingKey] : normalized[newStorageKey];
      const next = { ...normalized, [newStorageKey]: G.buildRouteRateEntry(tripRateCop, companyIds, previousEntry) };
      if (editingKey && editingKey !== newStorageKey) delete next[editingKey];
      try {
        await G.writeAwaitServer(G.KEYS.tripRouteRates, next);
      } catch (err) {
        G.notify(String(err?.message || G.userMessage("genericError")), "error");
        return false;
      }
      G.notify("Tarifa por trayecto actualizada.", "success");
      G.renderPortalView();
      return true;
    }
  });
}

export {
  deletedTripSnapshotForTableRow,
  deletedRequestSnapshotForTableRow,
  formatDeletedRequestSnapshotRouteLine,
  formatDeletedRequestSnapshotTableSummary,
  formatDeletedTripSnapshotTableSummary,
  openAssignedTripInfoModal,
  openRequestDetailModal,
  openDeletedTransportRequestAuditModal,
  openDeletedTransportTripAuditModal,
  openEditTripModal,
  openEditRouteRateModal
};
