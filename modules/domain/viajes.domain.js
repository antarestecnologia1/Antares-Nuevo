/**
 * Dominio transporte / viajes: ventanas horarias, solapes de agenda, ocupación flota,
 * facturación al cierre y permisos de edición con viaje asignado.
 * Sin render HTML ni DOM (eventos de UI permanecen en app.js).
 */
import { KEYS, PERMISSIONS, ROLES } from "../core/config.js";
import { read, write, writeAwaitServer } from "../core/data-io.js";
import { currentUser, hasPermission } from "../core/auth.js";
import { readPortalTransportRequests, reqWriteAwait } from "./solicitudes.domain.js";

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
  const nextVehicles = vehicles.map((vehicle) => {
    const liveBusy = activeTrips.some((r) => activeTripOccupiesVehicleAtInstant(r, vehicle, nowTs));
    if (liveBusy) {
      if (vehicle.available === false && vehicle.autoBusy === true) return vehicle;
      vehiclesChanged = true;
      return { ...vehicle, available: false, autoBusy: true };
    }
    if (vehicle.autoBusy) {
      vehiclesChanged = true;
      return { ...vehicle, available: true, autoBusy: false };
    }
    return vehicle;
  });

  let driversChanged = false;
  const nextDrivers = drivers.map((driver) => {
    const liveBusy = activeTrips.some((r) => activeTripOccupiesDriverAtInstant(r, driver, nowTs));
    if (liveBusy) {
      if (driver.available === false && driver.autoBusy === true) return driver;
      driversChanged = true;
      return { ...driver, available: false, autoBusy: true };
    }
    if (driver.autoBusy) {
      driversChanged = true;
      return { ...driver, available: true, autoBusy: false };
    }
    return driver;
  });

  if (vehiclesChanged || driversChanged) {
    void (async () => {
      try {
        if (vehiclesChanged) await writeAwaitServer(KEYS.vehicles, nextVehicles);
        if (driversChanged) await writeAwaitServer(KEYS.drivers, nextDrivers);
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
  const next = requests.map((request) => {
    if (!request?.trip || request.status !== VIAJES_STATUS.COMPLETADA || !request.deliveredAt) return request;
    const deliveredTs = new Date(request.deliveredAt).getTime();
    if (!Number.isFinite(deliveredTs) || now - deliveredTs < oneHourMs) return request;
    changed = true;
    return {
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
  });
  if (changed) {
    void (async () => {
      try {
        await reqWriteAwait(next);
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
