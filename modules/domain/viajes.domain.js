/**
 * Dominio transporte / viajes: ventanas horarias, solapes de agenda, ocupación flota,
 * facturación al cierre, permisos, historial de edición, standby / transiciones de estado,
 * asignación (agenda ocupada, compatibilidad flota) y requisitos de camión / Termoking.
 * Parte de la UI modal sigue en `portal-runtime.js` (Fase 8 sub-zonas G–H pendientes de mover).
 */
import { KEYS, PERMISSIONS, ROLES, STATUS, STATUS_TRANSITIONS, TRANSPORT_MODOS_SERVICIO, TRIP_ASSIGNMENT_FLEET_TYPE_KEYS } from "../core/config.js";
import { read, write, writeAwaitServer } from "../core/data-io.js";
import {
  canApproveTransportRequests,
  canManageTransportTrips,
  currentUser,
  hasPermission,
  isAdminActor
} from "../core/auth.js";
import { nodes } from "../core/store.js";
import { escapeAttr, escapeHtml, fieldLabel, fmtDate, newUuidV4, normalizePortalDateYmd, nowIso, nowLocalIso } from "../core/utils.js";
import { notify, openEditModal, userMessage, failPortalField } from "../ui/modals.js";
import {
  readPortalTransportRequests,
  reqWriteAwait,
  normalizeRequestRequiredTruckType,
  requestRequiredTruckTypeShowsFuelles
} from "./solicitudes.domain.js";

/** Misma enumeración que `STATUS` en app.js (texto persistido en solicitudes). */
export const VIAJES_STATUS = Object.freeze({
  PENDIENTE: "Pendiente",
  APROBADA_PENDIENTE_ASIGNACION: "Aprobada pendiente asignacion",
  VIAJE_ASIGNADO: "Viaje asignado",
  EN_TRANSITO: "En transito",
  ESPERA_STANDBY: "Espera standby",
  COMPLETADA: "Completada",
  CERRADA: "Cerrada",
  CANCELADA: "Cancelada",
  RECHAZADA: "Rechazada"
});

const CO_TIMEZONE = "America/Bogota";

/** Estados en los que ya no aplica edición de solicitud (admin / cliente). */
export const REQUEST_EDIT_FINAL_STATUSES = [
  VIAJES_STATUS.COMPLETADA,
  VIAJES_STATUS.CERRADA,
  VIAJES_STATUS.CANCELADA,
  VIAJES_STATUS.RECHAZADA
];

/** Permisos que habilitan editar una solicitud que ya tiene viaje asignado. */
export const REQUEST_EDIT_WITH_TRIP_PERMISSIONS = [
  PERMISSIONS.TRANSPORT_TRIPS,
  PERMISSIONS.AUTHORIZATIONS_MANAGE,
  PERMISSIONS.AUTHORIZATIONS_TRANSPORT
];

export const TRANSPORT_SCHEDULE_BUSY_TTL_MS = 90_000;

const transportScheduleBusyState = {
  key: "",
  busyVehicleIds: null,
  busyDriverIds: null,
  at: 0,
  inflight: null
};

const AUTO_APPROVE_MINUTES = 10;

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function getColombiaDateParts(dateValue = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(dateValue);
  const pick = (type) => parts.find((part) => part.type === type)?.value || "00";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second")
  };
}

function colombiaNowIso() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}-05:00`;
}

function domainNowIso() {
  return colombiaNowIso();
}

function domainNowLocalIso() {
  return colombiaNowIso().slice(0, 19);
}

function domainColombiaTodayIsoDate() {
  const p = getColombiaDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

function readCounters() {
  return read(KEYS.counters, {});
}

function nextCounter(prefix) {
  const counters = readCounters();
  const current = Number(counters[prefix] || 0) + 1;
  counters[prefix] = current;
  write(KEYS.counters, counters);
  return current;
}

export function buildColombiaOffsetDateTime(datePart, timePart) {
  const date = String(datePart || "").trim();
  const raw = String(timePart || "").trim();
  if (!date || !raw) return "";
  /** `type="time"` suele enviar `HH:mm`; algunos navegadores `HH:mm:ss`. Evitar `T10:00:00:00` inválido. */
  let timeNorm = "";
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(":");
    timeNorm = `${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}:00`;
  } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(raw)) {
    const [h, m, s] = raw.split(":");
    timeNorm = `${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}:${String(Number(s)).padStart(2, "0")}`;
  } else {
    return "";
  }
  return `${date}T${timeNorm}-05:00`;
}

export function requestPickupIsoForEdit(req) {
  const direct = String(req?.pickupAt ?? "").trim();
  if (direct) return direct;
  const trip = String(req?.trip?.etaPickup ?? "").trim();
  if (trip) return trip;
  const pd = String(req?.pickupDate ?? "").trim();
  const pt = String(req?.pickupTime ?? "").trim();
  if (pd && pt) {
    const built = buildColombiaOffsetDateTime(pd, pt);
    if (built) return built;
  }
  return "";
}

export function requestDeliveryIsoForEdit(req) {
  const direct = String(req?.etaDelivery ?? "").trim();
  if (direct) return direct;
  const trip = String(req?.trip?.etaDelivery ?? "").trim();
  if (trip) return trip;
  const dd = String(req?.deliveryDate ?? "").trim();
  const dt = String(req?.deliveryTime ?? "").trim();
  if (dd && dt) {
    const built = buildColombiaOffsetDateTime(dd, dt);
    if (built) return built;
  }
  return requestPickupIsoForEdit(req);
}

/** Recogida efectiva para solapes de agenda y API `transport-schedule-busy`. */
export function requestSchedulingPickupIso(req) {
  return requestPickupIsoForEdit(req);
}

/** Entrega efectiva para solapes de agenda y API `transport-schedule-busy`. */
export function requestSchedulingDeliveryIso(req) {
  return requestDeliveryIsoForEdit(req);
}

function diffMinutes(fromIso) {
  return (Date.now() - new Date(fromIso).getTime()) / 60000;
}

function slugStatus(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(" ", "_");
}

export function parseTripWindowRange(trip) {
  const start = new Date(trip?.etaPickup || "").getTime();
  const endRaw = new Date(trip?.etaDelivery || trip?.etaPickup || "").getTime();
  if (![start, endRaw].every(Number.isFinite)) return null;
  const end = endRaw > start ? endRaw : start + 60 * 1000;
  return { start, end };
}

export function tripWindowRangeFromTransportRequest(request) {
  const t = request?.trip;
  if (!t) return null;
  const pickup = String(t.etaPickup || request?.pickupAt || "").trim();
  if (!pickup) return null;
  const delivery = String(t.etaDelivery || request?.etaDelivery || "").trim();
  return parseTripWindowRange({
    etaPickup: pickup,
    etaDelivery: delivery || pickup
  });
}

export function describeTripTimingVsNow(transportRequest, nowTs = Date.now()) {
  const range = tripWindowRangeFromTransportRequest(transportRequest);
  if (!range) return { timing: "unknown", minutes: null };
  if (nowTs < range.start) return { timing: "upcoming", minutes: Math.ceil((range.start - nowTs) / 60000) };
  if (nowTs >= range.end) return { timing: "past", minutes: Math.ceil((nowTs - range.end) / 60000) };
  return { timing: "ongoing", minutes: Math.ceil((range.end - nowTs) / 60000) };
}

export function activeTripStatuses() {
  return [VIAJES_STATUS.VIAJE_ASIGNADO, VIAJES_STATUS.EN_TRANSITO, VIAJES_STATUS.ESPERA_STANDBY];
}

export function tripRequestStatusIsOperational(status) {
  return activeTripStatuses().some((s) => slugStatus(s) === slugStatus(status));
}

export function requestPickupIsoDate(request) {
  const raw = String(request?.trip?.etaPickup || request?.pickupAt || "").trim();
  const inline = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (inline) return inline[1];
  const ts = new Date(raw).getTime();
  if (!Number.isFinite(ts)) return "";
  const p = getColombiaDateParts(new Date(ts));
  return `${p.year}-${p.month}-${p.day}`;
}

export function rSafePickup(request) {
  const pickup = String(request?.trip?.etaPickup || request?.pickupAt || "").trim();
  if (pickup) return pickup;
  return String(request?.createdAt || domainNowIso());
}

export function isRequestPickupSameDayOrFuture(request, todayIso = domainColombiaTodayIsoDate()) {
  const pickupIso = requestPickupIsoDate(request);
  if (!pickupIso) return false;
  return pickupIso >= String(todayIso || "");
}

export function getActiveTrips() {
  const requests = readPortalTransportRequests();
  return requests.filter((r) => r.trip && tripRequestStatusIsOperational(r.status));
}

export function tripWindowContainsInstant(trip, instantTs = Date.now()) {
  const range = parseTripWindowRange(trip);
  if (!range) return false;
  return instantTs >= range.start && instantTs < range.end;
}

export function activeTripOccupiesVehicleAtInstant(transportRequest, vehicle, instantTs = Date.now()) {
  const trip = transportRequest?.trip;
  if (!trip || !vehicle) return false;
  const range = tripWindowRangeFromTransportRequest(transportRequest);
  if (!range || !(instantTs >= range.start && instantTs < range.end)) return false;
  const vid = String(vehicle.id || "").trim();
  const vplate = String(vehicle.plate || "").trim().toUpperCase();
  if (trip.vehicleId && String(trip.vehicleId).trim() === vid) return true;
  if (!trip.vehicleId && vplate && String(trip.vehiclePlate || "").trim().toUpperCase() === vplate) return true;
  return false;
}

export function activeTripOccupiesDriverAtInstant(transportRequest, driver, instantTs = Date.now()) {
  const trip = transportRequest?.trip;
  if (!trip || !driver) return false;
  const range = tripWindowRangeFromTransportRequest(transportRequest);
  if (!range || !(instantTs >= range.start && instantTs < range.end)) return false;
  const did = String(driver.id || "").trim();
  const dname = String(driver.name || "").trim().toLowerCase();
  if (trip.driverId && String(trip.driverId).trim() === did) return true;
  if (!trip.driverId && dname && String(trip.driverName || "").trim().toLowerCase() === dname) return true;
  return false;
}

export function recalculateResourceAvailability() {
  const nowTs = Date.now();
  const activeTrips = getActiveTrips();
  const vehicles = read(KEYS.vehicles, []);
  const drivers = read(KEYS.drivers, []);

  let vehiclesChanged = false;
  const changedVehicles = [];
  const nextVehicles = vehicles.map((vehicle) => {
    const liveBusy = activeTrips.some((r) => activeTripOccupiesVehicleAtInstant(r, vehicle, nowTs));
    if (liveBusy) {
      if (vehicle.available === false && vehicle.autoBusy === true) return vehicle;
      vehiclesChanged = true;
      const next = { ...vehicle, available: false, autoBusy: true };
      changedVehicles.push(next);
      return next;
    }
    if (vehicle.autoBusy) {
      vehiclesChanged = true;
      const next = { ...vehicle, available: true, autoBusy: false };
      changedVehicles.push(next);
      return next;
    }
    return vehicle;
  });

  let driversChanged = false;
  const changedDrivers = [];
  const nextDrivers = drivers.map((driver) => {
    const liveBusy = activeTrips.some((r) => activeTripOccupiesDriverAtInstant(r, driver, nowTs));
    if (liveBusy) {
      if (driver.available === false && driver.autoBusy === true) return driver;
      driversChanged = true;
      const next = { ...driver, available: false, autoBusy: true };
      changedDrivers.push(next);
      return next;
    }
    if (driver.autoBusy) {
      driversChanged = true;
      const next = { ...driver, available: true, autoBusy: false };
      changedDrivers.push(next);
      return next;
    }
    return driver;
  });

  if (vehiclesChanged || driversChanged) {
    void (async () => {
      try {
        if (vehiclesChanged) {
          await writeAwaitServer(KEYS.vehicles, nextVehicles, { syncData: changedVehicles });
        }
        if (driversChanged) {
          await writeAwaitServer(KEYS.drivers, nextDrivers, { syncData: changedDrivers });
        }
      } catch {
        /* noop */
      }
    })();
  }
}

export function buildTripInvoice(request) {
  if (!request?.trip) return null;
  if (request.trip.invoice) return request.trip.invoice;
  const base = parseNum(request.tripValue || request.insuredValue || 0);
  const standby = parseNum(request.standbyChargeTotal || 0);
  const subtotal = base + standby;
  const ivaRate = 0.19;
  const iva = Math.round(subtotal * ivaRate);
  const total = subtotal + iva;
  return {
    number: `FAC-${String(nextCounter("invoice")).padStart(6, "0")}`,
    generatedAt: domainNowLocalIso(),
    currency: "COP",
    baseValue: base,
    standbyValue: standby,
    subtotal,
    ivaRate,
    ivaValue: iva,
    total,
    issuer: "Antares Tecnologia SAS"
  };
}

export function closeCompletedTripsAndGenerateInvoices() {
  const requests = readPortalTransportRequests();
  let changed = false;
  const oneHourMs = 60 * 60 * 1000;
  const now = Date.now();
  const changedRows = [];
  const next = requests.map((request) => {
    if (!request?.trip || request.status !== VIAJES_STATUS.COMPLETADA || !request.deliveredAt) return request;
    const deliveredTs = new Date(request.deliveredAt).getTime();
    if (!Number.isFinite(deliveredTs) || now - deliveredTs < oneHourMs) return request;
    changed = true;
    const updated = {
      ...request,
      status: VIAJES_STATUS.CERRADA,
      closedAt: domainNowLocalIso(),
      trip: {
        ...request.trip,
        realtimeStatus: VIAJES_STATUS.CERRADA,
        invoice: buildTripInvoice(request),
        updatedAt: domainNowIso()
      }
    };
    changedRows.push(updated);
    return updated;
  });
  if (changed) {
    void (async () => {
      try {
        await reqWriteAwait(next, changedRows);
      } catch {
        /* noop */
      }
      recalculateResourceAvailability();
    })();
  }
}

export function canEditTransportRequestWithAssignedTrip(request, actor) {
  const user = actor || currentUser();
  if (!request?.trip || !user) return false;
  if (user.role === ROLES.CLIENT) return false;
  if (REQUEST_EDIT_FINAL_STATUSES.includes(request.status)) return false;
  return REQUEST_EDIT_WITH_TRIP_PERMISSIONS.some((perm) => hasPermission(user, perm));
}

export function transportRequestScheduledRange(request) {
  const t = request?.trip;
  if (!t) return null;
  const pickup = String(t.etaPickup || request?.pickupAt || "").trim();
  if (!pickup) return null;
  const tripDel = String(t.etaDelivery || "").trim();
  const reqDel = String(requestSchedulingDeliveryIso(request) || "").trim();
  const delivery = tripDel || (reqDel && reqDel !== pickup ? reqDel : "") || pickup;
  return parseTripWindowRange({ etaPickup: pickup, etaDelivery: delivery });
}

export function scheduleRangeFromPickupDelivery(pickupAt, etaDelivery) {
  const del =
    etaDelivery != null && String(etaDelivery).trim() !== "" ? String(etaDelivery).trim() : String(pickupAt || "");
  return parseTripWindowRange({ etaPickup: pickupAt, etaDelivery: del });
}

export function tripScheduleRangesConflict(candidate, existing) {
  if (!candidate || !existing) return false;
  if (candidate.start >= existing.end) return false;
  if (candidate.end <= existing.start) return false;
  return true;
}

export function findActiveTripScheduleConflict(pickupAt, etaDelivery, currentRequestId, tripMatches) {
  const candidate = scheduleRangeFromPickupDelivery(pickupAt, etaDelivery);
  if (!candidate) return null;
  for (const request of getActiveTrips()) {
    if (currentRequestId && request.id === currentRequestId) continue;
    const t = request.trip;
    if (!t || !tripMatches(t)) continue;
    const existing = transportRequestScheduledRange(request);
    if (existing && tripScheduleRangesConflict(candidate, existing)) return request;
  }
  return null;
}

export function activeTripSchedulingConflictsWith(pickupAt, etaDelivery, currentRequestId, tripMatches) {
  return findActiveTripScheduleConflict(pickupAt, etaDelivery, currentRequestId, tripMatches) != null;
}

export function transportScheduleBusyCacheKey(requestId, pickup, delivery) {
  return `${String(requestId || "").trim()}|${String(pickup || "").trim()}|${String(delivery || "").trim()}`;
}

export function invalidateTransportScheduleBusyCache() {
  transportScheduleBusyState.key = "";
  transportScheduleBusyState.busyVehicleIds = null;
  transportScheduleBusyState.busyDriverIds = null;
  transportScheduleBusyState.at = 0;
  transportScheduleBusyState.inflight = null;
}

export function isTransportScheduleBusyCacheReady(request, requestId) {
  const pickup = requestSchedulingPickupIso(request);
  const delivery = requestSchedulingDeliveryIso(request);
  const key = transportScheduleBusyCacheKey(requestId, pickup, delivery);
  return (
    transportScheduleBusyState.key === key &&
    transportScheduleBusyState.busyVehicleIds instanceof Set &&
    transportScheduleBusyState.busyDriverIds instanceof Set &&
    Date.now() - transportScheduleBusyState.at < TRANSPORT_SCHEDULE_BUSY_TTL_MS
  );
}

export function scheduleBusyCacheMatches(pickupAt, etaDelivery, currentRequestId) {
  return (
    transportScheduleBusyState.key === transportScheduleBusyCacheKey(currentRequestId, pickupAt, etaDelivery) &&
    transportScheduleBusyState.busyVehicleIds instanceof Set &&
    transportScheduleBusyState.busyDriverIds instanceof Set &&
    Date.now() - transportScheduleBusyState.at < TRANSPORT_SCHEDULE_BUSY_TTL_MS
  );
}

/** Expone estado interno para app.js (prefetch API + evento DOM). No mutar desde fuera del dominio. */
export function getTransportScheduleBusyStateSnapshot() {
  return transportScheduleBusyState;
}

export function transportScheduleBusySetKeyForFetch(key) {
  transportScheduleBusyState.key = key;
}

export function transportScheduleBusySetInflight(promise) {
  transportScheduleBusyState.inflight = promise;
}

export function transportScheduleBusyClearInflightIfSame(promise) {
  if (transportScheduleBusyState.inflight === promise) transportScheduleBusyState.inflight = null;
}

export function transportScheduleBusyApplySuccessForKey(key, res) {
  if (transportScheduleBusyState.key !== key) return transportScheduleBusyState;
  transportScheduleBusyState.busyVehicleIds = new Set((res?.busyVehicleIds || []).map((id) => String(id).trim()).filter(Boolean));
  transportScheduleBusyState.busyDriverIds = new Set((res?.busyDriverIds || []).map((id) => String(id).trim()).filter(Boolean));
  transportScheduleBusyState.at = Date.now();
  return transportScheduleBusyState;
}

export function transportScheduleBusyApplyErrorForKey(key) {
  if (transportScheduleBusyState.key === key) {
    transportScheduleBusyState.busyVehicleIds = null;
    transportScheduleBusyState.busyDriverIds = null;
  }
}

/**
 * Administrador: puede editar/cancelar solicitud mientras no esté en estado final (sin viaje asignado).
 */
export function canAdminEditTransportRequestFields(request, actor) {
  if (!request) return false;
  const user = actor || currentUser();
  if (!user) return false;
  const canOps =
    user.role === ROLES.ADMIN || canApproveTransportRequests(user) || canManageTransportTrips(user);
  if (!canOps) return false;
  if (request.trip) return false;
  return !REQUEST_EDIT_FINAL_STATUSES.includes(request.status);
}

/**
 * Cliente: solo mientras la solicitud sigue en **Pendiente** (no aprobada aún) y sin viaje.
 */
export function canClientEditOwnPendingTransportRequest(request, actor) {
  const user = actor || currentUser();
  if (!request || !user || user.role !== ROLES.CLIENT) return false;
  if (request.trip) return false;
  return request.status === STATUS.PENDIENTE;
}

/**
 * Puede abrir el formulario de edición de solicitud.
 * Sin viaje: admin (no final) o cliente pendiente. Con viaje: permiso operativo + justificación al guardar.
 */
export function canPortalUserEditTransportRequest(request, actor) {
  if (!request) return false;
  if (request.trip) return canEditTransportRequestWithAssignedTrip(request, actor);
  return canAdminEditTransportRequestFields(request, actor) || canClientEditOwnPendingTransportRequest(request, actor);
}

/**
 * @deprecated Nombre histórico; equivale a {@link canAdminEditTransportRequestFields}.
 */
export function canClientManageRequest(request) {
  return canAdminEditTransportRequestFields(request);
}

/**
 * Permiso de edición sobre el detalle del viaje (vehículo, conductor,
 * fechas estimadas, observaciones). Solo administradores y mientras el
 * viaje no haya sido cerrado/completado/cancelado.
 */
export function canAdminEditTrip(request, actor) {
  if (!request?.trip) return false;
  const user = actor || currentUser();
  if (!canManageTransportTrips(user) && !isAdminActor(user)) return false;
  return !REQUEST_EDIT_FINAL_STATUSES.includes(request.status);
}

export function hasUnsavedPortalFormData() {
  const modal = document.getElementById("crud-modal");
  if (modal && !modal.classList.contains("hidden")) return true;
  if (!nodes.viewRoot) return false;
  const forms = [...nodes.viewRoot.querySelectorAll("form")];
  if (!forms.length) return false;
  if (document.activeElement && nodes.viewRoot.contains(document.activeElement) && document.activeElement.closest("form")) {
    return true;
  }
  return forms.some((form) => {
    const fields = [...form.querySelectorAll("input, select, textarea")];
    return fields.some((field) => {
      const el = field;
      if (el.disabled || el.readOnly) return false;
      const type = String(el.type || "").toLowerCase();
      if (["hidden", "submit", "button", "reset"].includes(type)) return false;
      if (type === "checkbox" || type === "radio") return !!el.checked;
      if (type === "file") return !!el.files?.length;
      return String(el.value || "").trim() !== "";
    });
  });
}

function appendPortalModuleAuditLog(entry) {
  const fn = globalThis.appendModuleAuditLog;
  if (typeof fn === "function") fn(entry);
}

export function mergeTransportRequestModificationLog(request, entry) {
  const prev = Array.isArray(request?.modificationLog) ? request.modificationLog : [];
  const actorEmail = String(entry?.actorEmail || "").trim();
  const actorUserId = String(entry?.actorUserId || "").trim();
  const actorName = String(entry?.actorName || "").trim();
  const actor = actorEmail || actorName;
  const usuarioFn = globalThis.historyAuditFormatStoredUsuario;
  const usuario =
    String(entry?.usuario || "").trim() ||
    (typeof usuarioFn === "function"
      ? usuarioFn(actor, actorEmail, actorUserId)
      : actorEmail || actorName);
  const row = {
    id: String(entry?.id || newUuidV4()),
    at: String(entry?.at || nowIso()),
    actorName,
    actorEmail,
    actorUserId,
    usuario,
    justification: String(entry?.justification || "").trim(),
    tripNumber: String(entry?.tripNumber || request?.trip?.tripNumber || "").trim(),
    changesSummary: String(entry?.changesSummary || "").trim()
  };
  return [row, ...prev].slice(0, 80);
}

export function summarizeTransportRequestEditChanges(before, after) {
  const labels = {
    originCity: "origen",
    destinationCity: "destino",
    originAddress: "dirección origen",
    destinationAddress: "dirección destino",
    pickupAt: "recogida",
    etaDelivery: "entrega",
    cargoDescription: "carga",
    serviceType: "modo de transporte",
    vehicleType: "tipo de camión",
    siteContactName: "contacto",
    siteContactPhone: "teléfono contacto",
    tripValue: "valor del viaje",
    notes: "observaciones"
  };
  const changed = [];
  for (const [key, label] of Object.entries(labels)) {
    const a = before?.[key];
    const b = after?.[key];
    if (String(a ?? "").trim() !== String(b ?? "").trim()) changed.push(label);
  }
  if (Boolean(before?.refrigeracionTermoking) !== Boolean(after?.refrigeracionTermoking)) {
    changed.push("Termoking");
  }
  return changed.length ? changed.join(", ") : "datos de la solicitud";
}

export function recordTransportRequestModification(request, { justification, actor, changesSummary }) {
  const user = actor || currentUser();
  const actorName = String(user?.name || user?.email || "Usuario").trim();
  const actorEmail = String(user?.email || "").trim();
  const actorUserId = String(user?.id || "").trim();
  const tripNumber = String(request?.trip?.tripNumber || "").trim();
  const just = String(justification || "").trim();
  const summary = String(changesSummary || "").trim();
  const modEntry = {
    justification: just,
    actorName,
    actorEmail,
    actorUserId,
    tripNumber,
    changesSummary: summary
  };
  const modificationLog = mergeTransportRequestModificationLog(request, modEntry);
  const latest = modificationLog[0];
  const auditSummary = tripNumber
    ? `Viaje ${tripNumber}${summary ? ` · ${summary}` : ""}: ${just}`
    : `${summary ? `${summary}: ` : ""}${just}`;
  const usuarioFn = globalThis.historyAuditFormatStoredUsuario;
  const usuario =
    String(latest?.usuario || "").trim() ||
    (typeof usuarioFn === "function"
      ? usuarioFn(actorEmail || actorName, actorEmail, actorUserId)
      : actorEmail || actorName);
  appendPortalModuleAuditLog({
    id: latest?.id ? `transport-request-mod-${String(request?.id || "")}-${String(latest.id)}` : undefined,
    action: "update",
    moduleId: "requests",
    moduleLabel: "Mis solicitudes",
    entityId: String(request?.id || ""),
    entityLabel: String(request?.requestNumber || request?.id || "Solicitud"),
    summary: auditSummary,
    actor: actorEmail || actorName,
    actorEmail,
    actorUserId,
    usuario,
    detailAction: "detail",
    detailId: String(request?.id || "")
  });
  return modificationLog;
}

export function renderRequestModificationLogSectionHtml(request) {
  const rows = Array.isArray(request?.modificationLog) ? request.modificationLog : [];
  if (!rows.length) return "";
  const items = rows
    .map((row) => {
      const when = fmtDate(row.at);
      const who = escapeHtml(
        String(row.usuario || row.actorName || row.actorEmail || "Sin registrar").trim() || "Sin registrar"
      );
      const trip = row.tripNumber ? ` · Viaje ${escapeHtml(String(row.tripNumber))}` : "";
      const changes = row.changesSummary
        ? `<p class="muted" style="margin:0.25rem 0 0;font-size:0.88em">Campos: ${escapeHtml(String(row.changesSummary))}</p>`
        : "";
      return `<li class="request-mod-log-item">
        <p class="request-mod-log-meta"><time datetime="${escapeAttr(String(row.at || ""))}">${escapeHtml(when)}</time> · ${who}${trip}</p>
        <p class="request-mod-log-just">${escapeHtml(String(row.justification || "—"))}</p>
        ${changes}
      </li>`;
    })
    .join("");
  return `<section class="solicitud-detail-section solicitud-detail-section--mod-log" aria-label="Historial de modificaciones con viaje asignado">
    <h3 class="solicitud-detail-heading">Historial de modificaciones</h3>
    <ul class="request-mod-log-list">${items}</ul>
  </section>`;
}

export function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export function requestStandbyChargeInput() {
  const IC = globalThis.IC || {};
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    openEditModal({
      title: "Registrar standby",
      subtitle: "Define las horas y tarifa para este evento de espera.",
      submitText: "Guardar standby",
      fields: [
        {
          name: "hours",
          labelHtml: fieldLabel(IC.clock, "Horas en standby", { required: true }),
          type: "number",
          value: "1",
          min: "1",
          required: true
        },
        {
          name: "rate",
          labelHtml: fieldLabel(IC.dollar || IC.file, "Valor por hora (COP)", { required: true }),
          type: "number",
          value: "50000",
          min: "0",
          required: true
        }
      ],
      onSubmit: (form) => {
        const hours = Math.max(1, parseNum(form.hours));
        const rate = Math.max(0, parseNum(form.rate));
        if (!Number.isFinite(hours) || hours <= 0) {
          notify("Ingresa una cantidad valida de horas (minimo 1).", "error");
          return false;
        }
        if (!Number.isFinite(rate) || rate < 0) {
          notify("Ingresa una tarifa valida por hora.", "error");
          return false;
        }
        settle({ hours, rate });
        return true;
      }
    });
    const modal = document.getElementById("crud-modal");
    if (!modal) {
      settle(null);
      return;
    }
    const abort = () => settle(null);
    const closeBtn = modal.querySelector("#crud-close");
    const cancelBtn = modal.querySelector("#crud-cancel");
    closeBtn?.addEventListener("click", abort, { once: true });
    cancelBtn?.addEventListener("click", abort, { once: true });
    modal.addEventListener(
      "click",
      (event) => {
        if (event.target === modal) abort();
      },
      { once: true }
    );
  });
}

export async function applyStandbyCharge(request, actorName) {
  const input = await requestStandbyChargeInput();
  if (!input) return null;
  const hours = input.hours;
  const rate = input.rate;
  const value = hours * rate;
  const currentTotal = parseNum(request.standbyChargeTotal);
  const event = {
    id: newUuidV4(),
    hours,
    rate,
    value,
    createdAt: nowIso(),
    createdBy: actorName
  };
  return {
    standbyChargeTotal: currentTotal + value,
    standbyEvents: [...(request.standbyEvents || []), event]
  };
}

export async function transitionRequestStatus(requestId, nextStatus, actorName = "Sistema") {
  const requests = readPortalTransportRequests();
  const target = requests.find((request) => request.id === requestId);
  if (!target) return false;

  if (!canTransitionStatus(target.status, nextStatus)) {
    notify(userMessage("tripTransitionDenied", target.status, nextStatus), "error");
    return false;
  }

  let extra = {};
  if (nextStatus === STATUS.ESPERA_STANDBY) {
    const standbyData = await applyStandbyCharge(target, actorName);
    if (!standbyData) return false;
    extra = standbyData;
  }

  const updated = requests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status: nextStatus,
          ...extra,
          deliveredAt: nextStatus === STATUS.COMPLETADA ? nowIso() : request.deliveredAt,
          closedAt: nextStatus === STATUS.CERRADA ? nowLocalIso() : request.closedAt,
          trip: request.trip
            ? {
                ...request.trip,
                realtimeStatus: nextStatus,
                invoice: nextStatus === STATUS.CERRADA ? request.trip.invoice || buildTripInvoice(request) : request.trip.invoice,
                updatedAt: nowIso()
              }
            : request.trip
        }
      : request
  );
  const updatedRow = updated.find((request) => request.id === requestId);
  void (async () => {
    try {
      await reqWriteAwait(updated, updatedRow);
    } catch (_e) {}
    recalculateResourceAvailability();
  })();
  return true;
}

function isManuallyUnavailable(resource) {
  return Boolean(resource && resource.available === false && resource.autoBusy !== true);
}

function fleetDaysUntil(dateValue) {
  const target = new Date(dateValue).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.floor((target - now) / 86400000);
}

function fleetAddYears(dateValue, years) {
  const d = new Date(dateValue);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/** Estado de vigencia SOAT / Tecnomecánica (misma lógica que portal-runtime). */
function docExpiryStatus(expeditionDate, expiryDate) {
  const expYmd = expiryDate !== undefined ? normalizePortalDateYmd(expiryDate) : "";
  const exdYmd = normalizePortalDateYmd(expeditionDate);
  let expiresAt;
  if (expYmd) {
    expiresAt = new Date(`${expYmd}T12:00:00`);
  } else if (exdYmd) {
    expiresAt = fleetAddYears(new Date(`${exdYmd}T12:00:00`), 1);
  } else {
    return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  }
  if (Number.isNaN(expiresAt.getTime())) {
    return { label: "Sin fecha", cls: "status-rechazada", days: -9999, expiresAt: null };
  }
  const days = fleetDaysUntil(expiresAt);
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)} dias`, cls: "status-rechazada", days, expiresAt };
  if (days <= 30) return { label: `Por vencer (${days} dias)`, cls: "status-pendiente", days, expiresAt };
  return { label: `Vigente (${days} dias)`, cls: "status-viaje_asignado", days, expiresAt };
}

function refreshSearchableSelectPortal(selectEl) {
  const fn = globalThis.refreshSearchableSelect;
  if (typeof fn === "function") fn(selectEl);
}

export function notifyScheduleConflictIfAny(pickupAt, etaDelivery, currentRequestId, resourceLabel, tripMatches, inline = null) {
  const conflict = findActiveTripScheduleConflict(pickupAt, etaDelivery, currentRequestId, tripMatches);
  if (!conflict) return false;
  const tripNum = String(conflict.trip?.tripNumber || conflict.requestNumber || "-").trim();
  const range = transportRequestScheduledRange(conflict);
  const windowLabel =
    range && Number.isFinite(range.start) && Number.isFinite(range.end)
      ? `${fmtDate(new Date(range.start).toISOString())} – ${fmtDate(new Date(range.end).toISOString())}`
      : "";
  const msg = userMessage("scheduleConflict", resourceLabel, tripNum, windowLabel);
  if (inline?.form && inline?.field) {
    failPortalField(inline.form, inline.field, msg);
    return true;
  }
  notify(msg, "error");
  return true;
}

/** POST /portal/transport-schedule-busy — una ida al servidor; resultado en caché ~90 s. */
export function refreshTransportScheduleBusyFromApi(request, requestId) {
  const pickup = requestSchedulingPickupIso(request);
  const delivery = requestSchedulingDeliveryIso(request);
  const key = transportScheduleBusyCacheKey(requestId, pickup, delivery);
  if (isTransportScheduleBusyCacheReady(request, requestId)) {
    return Promise.resolve(getTransportScheduleBusyStateSnapshot());
  }
  const busySnap0 = getTransportScheduleBusyStateSnapshot();
  if (busySnap0.inflight && busySnap0.key === key) {
    return busySnap0.inflight;
  }
  const api = window.AntaresApi;
  if (!api?.postJson || !pickup || !delivery) {
    return Promise.resolve(null);
  }
  transportScheduleBusySetKeyForFetch(key);
  const run = api
    .postJson("/portal/transport-schedule-busy", {
      excludeRequestId: requestId || undefined,
      pickupAt: pickup,
      deliveryAt: delivery
    })
    .then((res) => {
      transportScheduleBusyApplySuccessForKey(key, res);
      document.dispatchEvent(
        new CustomEvent("transport-schedule-busy-updated", {
          detail: { requestId, pickup, delivery }
        })
      );
      return getTransportScheduleBusyStateSnapshot();
    })
    .catch(() => {
      transportScheduleBusyApplyErrorForKey(key);
      return null;
    })
    .finally(() => {
      transportScheduleBusyClearInflightIfSame(run);
    });
  transportScheduleBusySetInflight(run);
  return run;
}

export function isVehicleBusyAtHour(vehicle, pickupAt, etaDelivery, currentRequestId = null) {
  const vid = String(vehicle?.id || "").trim();
  const vplate = String(vehicle?.plate || "").trim().toUpperCase();
  const busySnap = getTransportScheduleBusyStateSnapshot();
  if (vid && scheduleBusyCacheMatches(pickupAt, etaDelivery, currentRequestId)) {
    return busySnap.busyVehicleIds && busySnap.busyVehicleIds.has(vid);
  }
  return activeTripSchedulingConflictsWith(pickupAt, etaDelivery, currentRequestId, (t) => {
    if (t.vehicleId) return String(t.vehicleId).trim() === vid;
    return Boolean(vplate && String(t.vehiclePlate || "").trim().toUpperCase() === vplate);
  });
}

export function isDriverBusyAtHour(driver, pickupAt, etaDelivery, currentRequestId = null) {
  const did = String(driver?.id || "").trim();
  const dname = String(driver?.name || "").trim().toLowerCase();
  const busySnap = getTransportScheduleBusyStateSnapshot();
  if (did && scheduleBusyCacheMatches(pickupAt, etaDelivery, currentRequestId)) {
    return busySnap.busyDriverIds && busySnap.busyDriverIds.has(did);
  }
  return activeTripSchedulingConflictsWith(pickupAt, etaDelivery, currentRequestId, (t) => {
    if (t.driverId) return String(t.driverId).trim() === did;
    return Boolean(dname && String(t.driverName || "").trim().toLowerCase() === dname);
  });
}

export function rebuildTripAssignmentSelectOptions(formEl, request, requestId, needsTermoking) {
  if (!formEl || !request) return;
  const vehSel = formEl.querySelector("select[name='vehicleId']");
  const drvSel = formEl.querySelector("select[name='driverId']");
  if (!vehSel && !drvSel) return;
  const vehicleCandidates = getVehicleCandidatesForRequest(request, requestId);
  const driverCandidates = getDriverCandidatesForRequest(request, requestId);
  if (vehSel) {
    const prev = String(vehSel.value || "");
    vehSel.innerHTML = [
      `<option value="">${vehicleCandidates.length ? "Sin asignar por ahora" : needsTermoking ? "No hay vehículos con Termoking para capacidad, documentos u horario" : "No hay vehículos para capacidad, documentos u horario"}</option>`,
      ...vehicleCandidates.map((vehicle) => {
        const dis = Boolean(vehicle.isBusy || vehicle.isUnavailable || vehicle.hasExpiredDocs || vehicle.wrongTruckType);
        const label = tripAssignmentVehicleOptionLabel(vehicle, {
          needsTermoking,
          isBusy: vehicle.isBusy,
          isUnavailable: vehicle.isUnavailable,
          hasExpiredDocs: vehicle.hasExpiredDocs,
          wrongTruckType: vehicle.wrongTruckType,
          requestTruckType: normalizeRequestRequiredTruckType(request?.vehicleType)
        });
        return `<option value="${escapeAttr(String(vehicle.id))}"${dis ? " disabled" : ""}>${escapeHtml(label)}</option>`;
      })
    ].join("");
    if (prev && [...vehSel.options].some((o) => o.value === prev && !o.disabled)) vehSel.value = prev;
    refreshSearchableSelectPortal(vehSel);
  }
  if (drvSel) {
    const prev = String(drvSel.value || "");
    drvSel.innerHTML = [
      `<option value="">${driverCandidates.length ? "Sin asignar por ahora" : "No hay conductores disponibles para el horario"}</option>`,
      ...driverCandidates.map((driver) => {
        const dis = Boolean(driver.isBusy || driver.isUnavailable || driver.hasExpiredDocs);
        const label = tripAssignmentDriverOptionLabel(driver, {
          isBusy: driver.isBusy,
          isUnavailable: driver.isUnavailable,
          hasExpiredDocs: driver.hasExpiredDocs
        });
        return `<option value="${escapeAttr(String(driver.id))}"${dis ? " disabled" : ""}>${escapeHtml(label)}</option>`;
      })
    ].join("");
    if (prev && [...drvSel.options].some((o) => o.value === prev && !o.disabled)) drvSel.value = prev;
    refreshSearchableSelectPortal(drvSel);
  }
}

/** Prefetch POST /portal/transport-schedule-busy y refresca selects al responder (modales + crear viaje). */
export function wireTripAssignmentScheduleBusyRefresh(formEl, request, requestId, needsTermoking) {
  if (!formEl || !request) return;
  const rid = String(requestId || request.id || "").trim();
  formEl.dataset.scheduleBusyRequestId = rid;
  const refreshUi = () => {
    if (String(formEl.id || "") === "form-create-trip") {
      const rf = globalThis.refreshCreateTripModuleForm;
      if (typeof rf === "function") rf(formEl);
      return;
    }
    rebuildTripAssignmentSelectOptions(formEl, request, rid, needsTermoking);
  };
  if (formEl._scheduleBusyHandler) {
    document.removeEventListener("transport-schedule-busy-updated", formEl._scheduleBusyHandler);
  }
  const onBusy = (ev) => {
    const d = ev?.detail || {};
    if (String(d.requestId || "") !== rid) return;
    refreshUi();
  };
  formEl._scheduleBusyHandler = onBusy;
  document.addEventListener("transport-schedule-busy-updated", onBusy);
  void refreshTransportScheduleBusyFromApi(request, rid).then(refreshUi);
}

export function selectBestVehicle(weight, pickupAt, etaDelivery, currentRequestId = null, options = {}) {
  const requiresRefrigeration = Boolean(options.requiresRefrigeration);
  const reqForType = options.request && typeof options.request === "object" ? options.request : null;
  const vehicles = read(KEYS.vehicles, []);
  /** Con Termoking en solicitud → solo unidades con equipo; sin Termoking → solo secas (excluye refrigerados). */
  const matchesThermal = (v) =>
    requiresRefrigeration ? vehicleHasTermokingEquipment(v) : !vehicleHasTermokingEquipment(v);
  const matchesReqTruck = (v) => !reqForType || vehicleMatchesRequestTruckType(v, reqForType);
  const filtered = vehicles.filter(
    (v) =>
      !isManuallyUnavailable(v) &&
      isVehicleEligibleForTripAssignment(v) &&
      matchesThermal(v) &&
      matchesReqTruck(v) &&
      !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
  );
  const pick =
    filtered.find((v) => v.capacityKg >= weight) ||
    filtered[0] ||
    vehicles.find(
      (v) =>
        !isManuallyUnavailable(v) &&
        isVehicleEligibleForTripAssignment(v) &&
        matchesThermal(v) &&
        matchesReqTruck(v) &&
        !isVehicleBusyAtHour(v, pickupAt, etaDelivery, currentRequestId)
    ) ||
    null;
  return pick || null;
}

export function selectDriver(pickupAt, etaDelivery, currentRequestId = null) {
  const drivers = read(KEYS.drivers, []);
  return (
    drivers.find((d) => !isManuallyUnavailable(d) && !isDriverBusyAtHour(d, pickupAt, etaDelivery, currentRequestId)) ||
    null
  );
}

/**
 * Solicitud con equipo refrigerado (Termoking) o equivalentes legacy.
 * Importante: "Transporte nacional sin termoking" contiene la subcadena "termoking";
 * hay que excluir explícitamente el caso seco antes de buscar "termoking".
 */
export function serviceTypeRequiresRefrigeration(serviceType) {
  const s = String(serviceType || "").toLowerCase().trim();
  if (!s) return false;
  if (s === "dry" || s.includes("sin termoking") || s.includes("without thermo")) return false;
  if (s === "refrigerated") return true;
  return (
    s.includes("termoking") ||
    s.includes("thermo king") ||
    s.includes("refrigerada") ||
    s.includes("refrigerado")
  );
}

export function normalizeRequestTransportMode(serviceType) {
  const raw = String(serviceType || "").trim();
  if (TRANSPORT_MODOS_SERVICIO.has(raw)) return raw;
  const lower = raw.toLowerCase();
  if (lower.includes("entre sedes") || lower.includes("sedes del cliente")) {
    return "Transporte entre sedes del cliente";
  }
  return "Transporte nacional";
}

/** Modo de transporte legible para fichas de solicitud (detalle, modal). */
export function requestTransportModeFromRequest(req) {
  const raw = String(req?.serviceType ?? "").trim();
  if (!raw) return "—";
  return normalizeRequestTransportMode(raw);
}

export function requestRequiredTruckTypeShowsTractomulaKg(t) {
  return t === "Tractomula";
}

/** Muestra/oculta fuelles (Turbo/Camión) vs kg (Tractomula) y limpia el campo que no aplica. */
export function attachRequestTruckTypeFields(formEl) {
  if (!formEl) return;
  const truckSel = formEl.querySelector("select[name='requiredTruckType']");
  const fuellesRow = formEl.querySelector(".request-truck-field--fuelles");
  const kgRow = formEl.querySelector(".request-truck-field--kg");
  const fuellesInput = formEl.querySelector("input[name='fuelles']");
  const kgInput = formEl.querySelector("input[name='weightKg']");
  if (!truckSel || !fuellesRow || !kgRow) return;

  const stripRequiredMarkers = (label) => {
    label?.querySelectorAll?.(".required-marker")?.forEach((m) => m.remove());
  };

  const sync = () => {
    const t = normalizeRequestRequiredTruckType(truckSel.value);
    const showF = requestRequiredTruckTypeShowsFuelles(t);
    const showKg = requestRequiredTruckTypeShowsTractomulaKg(t);
    fuellesRow.hidden = !showF;
    kgRow.hidden = !showKg;
    if (fuellesInput) {
      fuellesInput.required = showF;
      fuellesInput.toggleAttribute("required", showF);
      if (!showF) {
        fuellesInput.value = "";
        stripRequiredMarkers(fuellesRow);
      }
    }
    if (kgInput) {
      kgInput.required = showKg;
      kgInput.toggleAttribute("required", showKg);
      if (!showKg) {
        kgInput.value = "";
        stripRequiredMarkers(kgRow);
      }
    }
  };

  if (truckSel.dataset.truckTypeWired !== "1") {
    truckSel.dataset.truckTypeWired = "1";
    truckSel.addEventListener("change", sync);
  }
  sync();
}

/** Filas de edición (modal) para tipo de camión, fuelles y peso tractomula. */
export function buildRequestTruckTypeEditFieldRows(req) {
  const truckVt = normalizeRequestRequiredTruckType(req?.vehicleType);
  const showFuelles = requestRequiredTruckTypeShowsFuelles(truckVt);
  const showKg = requestRequiredTruckTypeShowsTractomulaKg(truckVt);
  return [
    {
      name: "requiredTruckType",
      label: "Tipo de camión requerido",
      type: "select",
      value: truckVt || "",
      required: true,
      full: true,
      options: [
        { value: "", label: "Seleccione..." },
        { value: "Turbo", label: "Turbo" },
        { value: "Camión", label: "Camión" },
        { value: "Tractomula", label: "Tractomula" }
      ]
    },
    {
      name: "fuelles",
      label: "Cantidad de fuelles",
      type: "number",
      min: 0,
      step: 1,
      value: req.fuelles != null && req.fuelles !== "" ? parseNum(req.fuelles) : "",
      required: showFuelles,
      hidden: !showFuelles,
      wrapperClass: "request-truck-field request-truck-field--fuelles"
    },
    {
      name: "weightKg",
      label: "Peso (kg) tractomula",
      type: "number",
      min: 0,
      step: 0.01,
      value: showKg ? parseNum(req.weightKg) || "" : "",
      required: showKg,
      hidden: !showKg,
      wrapperClass: "request-truck-field request-truck-field--kg"
    }
  ];
}

/** Resumen legible de tipo de camión, fuelles o peso (tarjetas y detalle). */
export function requestTruckRequirementSummaryHtml(req) {
  const vt = normalizeRequestRequiredTruckType(req?.vehicleType);
  if (vt === "Tractomula") {
    const kg = parseNum(req?.weightKg).toLocaleString("es-CO");
    return `${escapeHtml(vt)} · ${kg} kg`;
  }
  if (requestRequiredTruckTypeShowsFuelles(vt)) {
    const n = parseNum(req?.fuelles);
    return `${escapeHtml(vt)} · ${n.toLocaleString("es-CO")} fuelle(s)`;
  }
  const boxes = parseNum(req?.boxes ?? req?.boxesCount);
  const w = parseNum(req?.weightKg);
  const legacy = (boxes > 0 || w > 0) && !vt;
  if (legacy) {
    return `${w.toLocaleString("es-CO")} kg · ${boxes.toLocaleString("es-CO")} cajas`;
  }
  const shown = String(req?.vehicleType || "").trim();
  if (shown && shown !== "Por definir") return escapeHtml(shown);
  return escapeHtml("—");
}

/** Termoking: columna `refrigeracionTermoking` si existe; si no, inferencia legacy desde `serviceType`. */
export function requestRequiresTermoking(request) {
  if (request && typeof request.refrigeracionTermoking === "boolean") return request.refrigeracionTermoking;
  return serviceTypeRequiresRefrigeration(request?.serviceType);
}

/** BD `vehiculos.refrigerado_termoking` ↔ portal `refrigerated`; tolera strings legacy en sincronización. */
export function vehicleHasTermokingEquipment(vehicle) {
  if (!vehicle || typeof vehicle !== "object") return false;
  const r = vehicle.refrigerated ?? vehicle.refrigerado_termoking;
  if (r === true || r === 1) return true;
  if (typeof r === "string") {
    const t = r.trim().toLowerCase();
    return t === "true" || t === "t" || t === "1" || t === "si" || t === "yes";
  }
  return false;
}

/** Placa miniatura estilo Colombia (fondo amarillo) para tarjetas de vehículo. */
export function renderColombianPlateBadgeHtml(plate) {
  const p = String(plate || "—").trim().toUpperCase() || "—";
  const len = p.replace(/[^A-Z0-9]/gi, "").length;
  const sizeClass =
    len >= 7 ? " directory-card__avatar--plate-plate7" : len >= 6 ? " directory-card__avatar--plate-plate6" : "";
  return `<div class="directory-card__avatar directory-card__avatar--plate${sizeClass}" title="${escapeAttr(p)}" aria-label="Placa ${escapeAttr(p)}"><span class="directory-card__plate-text">${escapeHtml(p)}</span></div>`;
}

/** Lo que el cliente define en la solicitud: solo Termoking sí / no (sin tipo de carrocería). */
export function requestTermokingClientLabel(request) {
  if (!request) return "—";
  if (typeof request.refrigeracionTermoking === "boolean") {
    return request.refrigeracionTermoking ? "Con Termoking" : "Sin Termoking";
  }
  if (!String(request.serviceType || "").trim()) return "—";
  return serviceTypeRequiresRefrigeration(request.serviceType) ? "Con Termoking" : "Sin Termoking";
}

/** Columna historial: preferencia Termoking del cliente + tipo de flota si ya hay viaje asignado. */
export function historyVehicleColumn(request) {
  const tk = requestTermokingClientLabel(request);
  const assigned = String(request?.trip?.vehicleType || "").trim();
  if (assigned) return `${tk} · ${assigned}`;
  return tk;
}

export function normalizeFleetTypeForTripAssignment(type) {
  return String(type || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Turbo / Camión / Tractomula de la solicitud ↔ mismo tipo en flota (tolerante a tildes/mayúsculas). Sin tipo requerido → no se filtra (datos legacy). */
export function vehicleMatchesRequestTruckType(vehicle, request) {
  const reqLabel = normalizeRequestRequiredTruckType(request?.vehicleType);
  if (!reqLabel) return true;
  const reqKey = normalizeFleetTypeForTripAssignment(reqLabel);
  const vKey = normalizeFleetTypeForTripAssignment(vehicle?.type);
  return Boolean(reqKey && vKey && reqKey === vKey);
}

export function isVehicleEligibleForTripAssignment(vehicle) {
  return TRIP_ASSIGNMENT_FLEET_TYPE_KEYS.has(normalizeFleetTypeForTripAssignment(vehicle?.type));
}

/** Etiqueta unificada en selects de asignación; con Termoking en solicitud muestra bandera explícita. */
export function tripAssignmentVehicleOptionLabel(vehicle, options = {}) {
  const needsTermoking = Boolean(options.needsTermoking);
  const isBusy = Boolean(options.isBusy);
  const isUnavailable = Boolean(options.isUnavailable);
  const hasExpiredDocs = Boolean(options.hasExpiredDocs);
  const cap = `${parseNum(vehicle.capacityKg).toLocaleString("es-CO")} kg`;
  const soat = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate).label;
  const tec = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate).label;
  const thermal = needsTermoking
    ? vehicleHasTermokingEquipment(vehicle)
      ? " · Termoking: sí"
      : " · Termoking: no"
    : ` · ${vehicleHasTermokingEquipment(vehicle) ? "Refrigerado" : "Seco"}`;
  let tail = ` · SOAT ${soat} · Tec ${tec}`;
  if (isBusy) tail += " · Ocupado (horario)";
  if (isUnavailable) tail += " · No disponible";
  if (hasExpiredDocs) tail += " · Documentación vencida";
  if (options.wrongTruckType) {
    const rt = String(options.requestTruckType || "").trim();
    tail += rt ? ` · Tipo no coincide (solicitud: ${rt})` : " · Tipo no coincide con la solicitud";
  }
  return `${vehicle.plate} · ${vehicle.type} · ${cap}${thermal}${tail}`;
}

export function tripAssignmentDriverOptionLabel(driver, options = {}) {
  const isBusy = Boolean(options.isBusy);
  const isUnavailable = Boolean(options.isUnavailable);
  const hasExpiredDocs = Boolean(options.hasExpiredDocs);
  const dname = driver.name || driver.fullName || "";
  let tail = `${dname} · Lic ${driver.license || "-"} · vence ${driver.licenseExpiry || "-"} · ${driver.phone || "-"}`;
  if (isBusy) tail += " · Ocupado (horario)";
  if (isUnavailable) tail += " · No disponible";
  if (hasExpiredDocs) tail += " · Licencia vencida";
  return tail;
}

export function getCompatibleVehiclesForRequest(request, currentRequestId = null, compatOpts = {}) {
  const moduleCreate = !!(compatOpts && compatOpts.moduleCreateTrip);
  const requiresRefrigeration = requestRequiresTermoking(request);
  return read(KEYS.vehicles, []).filter((vehicle) => {
    if (isManuallyUnavailable(vehicle)) return false;
    if (!vehicleMatchesRequestTruckType(vehicle, request)) return false;
    if (moduleCreate) {
      // Asistente en Viajes: sin filtro estricto Camión/Turbo/Tractomula en `isVehicleEligible…`;
      // el tipo pedido en la solicitud sí restringe (`vehicleMatchesRequestTruckType` arriba).
    } else {
      if (!isVehicleEligibleForTripAssignment(vehicle)) return false;
    }
    if (parseNum(vehicle.capacityKg) < parseNum(request?.weightKg)) return false;
    if (requiresRefrigeration && !vehicleHasTermokingEquipment(vehicle)) return false;
    if (!requiresRefrigeration && vehicleHasTermokingEquipment(vehicle)) return false;
    if (docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate).days < 0) return false;
    if (docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate).days < 0) return false;
    if (
      isVehicleBusyAtHour(
        vehicle,
        requestSchedulingPickupIso(request),
        requestSchedulingDeliveryIso(request),
        currentRequestId
      )
    )
      return false;
    return true;
  });
}

export function getCompatibleDriversForRequest(request, currentRequestId = null) {
  return read(KEYS.drivers, []).filter(
    (driver) =>
      !isManuallyUnavailable(driver) &&
      fleetDaysUntil(driver.licenseExpiry) >= 0 &&
      !isDriverBusyAtHour(driver, requestSchedulingPickupIso(request), requestSchedulingDeliveryIso(request), currentRequestId)
  );
}

export function getVehicleCandidatesForRequest(request, currentRequestId = null) {
  const requiresRefrigeration = requestRequiresTermoking(request);
  return read(KEYS.vehicles, [])
    .filter((vehicle) => {
      if (!isVehicleEligibleForTripAssignment(vehicle)) return false;
      if (parseNum(vehicle.capacityKg) < parseNum(request?.weightKg)) return false;
      if (requiresRefrigeration && !vehicleHasTermokingEquipment(vehicle)) return false;
      if (!requiresRefrigeration && vehicleHasTermokingEquipment(vehicle)) return false;
      return true;
    })
    .map((vehicle) => {
      const soatDays = docExpiryStatus(vehicle.soatExpeditionDate, vehicle.soatExpiryDate).days;
      const techDays = docExpiryStatus(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate).days;
      const busyBySchedule = isVehicleBusyAtHour(
        vehicle,
        requestSchedulingPickupIso(request),
        requestSchedulingDeliveryIso(request),
        currentRequestId
      );
      const unavailableManual = isManuallyUnavailable(vehicle);
      const wrongTruckType = !vehicleMatchesRequestTruckType(vehicle, request);
      return {
        ...vehicle,
        isBusy: busyBySchedule,
        isUnavailable: unavailableManual,
        hasExpiredDocs: soatDays < 0 || techDays < 0,
        wrongTruckType
      };
    });
}

export function getDriverCandidatesForRequest(request, currentRequestId = null) {
  return read(KEYS.drivers, []).map((driver) => {
    const expiredLicense = fleetDaysUntil(driver.licenseExpiry) < 0;
    const busyBySchedule = isDriverBusyAtHour(
      driver,
      requestSchedulingPickupIso(request),
      requestSchedulingDeliveryIso(request),
      currentRequestId
    );
    const unavailableManual = isManuallyUnavailable(driver);
    return {
      ...driver,
      isBusy: busyBySchedule,
      isUnavailable: unavailableManual,
      hasExpiredDocs: expiredLicense
    };
  });
}

/**
 * Autoaprobación de solicitudes pendientes (delega la mutación en `approveRequest` de app.js
 * por el acoplamiento con notificaciones y reglas de asignación).
 * @param {(requestId: string, actorName?: string, auto?: boolean, ...rest: unknown[]) => boolean} approveRequestFn
 * @param {{ PENDIENTE?: string }} [statusRef] — mismos literales que `STATUS` global en app.js
 */
export function runPendingTransportAutoApprove(approveRequestFn, statusRef = {}) {
  const PEND = statusRef.PENDIENTE || VIAJES_STATUS.PENDIENTE;
  const requests = readPortalTransportRequests();
  let changed = false;
  requests
    .filter((r) => r.status === PEND)
    .forEach((r) => {
      if (diffMinutes(r.createdAt) >= AUTO_APPROVE_MINUTES) {
        if (approveRequestFn(r.id, "Sistema", true)) changed = true;
      }
    });
  return changed;
}
