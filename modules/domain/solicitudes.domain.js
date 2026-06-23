/**
 * Dominio solicitudes de transporte: normalización de filas, lectura/escritura,
 * alcance por usuario/cliente y filtros para asignación de viajes.
 * Permisos globales (`canViewAllTransportRequests`, `canApproveTransportRequests`) se inyectan
 * desde `portal-runtime.js` para no acoplar este módulo a `state` ni a listas de permisos extensas.
 */
import { getSession } from "../core/auth.js";
import { CLIENT_DATA_SCOPE, KEYS, ROLES } from "../core/config.js";
import { read, readArray, write, writeAwaitServer } from "../core/data-io.js";
import { isUuidString, newUuidV4 } from "../core/utils.js";

const REQUEST_REQUIRED_TRUCK_TYPES = ["Turbo", "Camión", "Tractomula"];

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLatinUpperForDb(value) {
  if (typeof window !== "undefined" && window.AntaresValidation?.normalizeLatinUpperForDb) {
    return window.AntaresValidation.normalizeLatinUpperForDb(value);
  }
  return String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ñ/g, "N");
}

export function normalizeRequestRequiredTruckType(value) {
  const s = String(value || "").trim();
  if (REQUEST_REQUIRED_TRUCK_TYPES.includes(s)) return s;
  const u = normalizeLatinUpperForDb(s);
  if (u === "TURBO") return "Turbo";
  if (u === "CAMION") return "Camión";
  if (u === "TRACTOMULA") return "Tractomula";
  return "";
}

export function requestRequiredTruckTypeShowsFuelles(t) {
  return t === "Turbo" || t === "Camión";
}

/** Normaliza aliases de API/caché (contacto, tipo camión, fuelles, Termoking). */
export function normalizePortalTransportRequestRow(row) {
  if (!row || typeof row !== "object") return row;
  const truckType = normalizeRequestRequiredTruckType(row.vehicleType || row.requiredTruckType);
  const siteContactName = String(row.siteContactName ?? row.contactName ?? "").trim();
  const siteContactPhone = String(row.siteContactPhone ?? row.contactPhone ?? "").trim();
  const needsFuelles = requestRequiredTruckTypeShowsFuelles(truckType);
  const normalizedFuelles =
    row.fuelles != null && row.fuelles !== "" ? parseNum(row.fuelles) : needsFuelles ? 0 : row.fuelles ?? null;
  const normalized = {
    ...row,
    vehicleType: truckType || String(row.vehicleType || row.requiredTruckType || "").trim(),
    requiredTruckType: truckType || String(row.requiredTruckType || row.vehicleType || "").trim(),
    fuelles: normalizedFuelles,
    siteContactName,
    siteContactPhone,
    contactName: siteContactName,
    contactPhone: siteContactPhone
  };
  if (normalized.refrigeracionTermoking == null && typeof row.requiresThermoking === "boolean") {
    normalized.refrigeracionTermoking = row.requiresThermoking;
  }
  return normalized;
}

function portalIsoOrNull(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

function portalRequestIsoOrThrow(value, label) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    throw new Error(`Falta ${label} en la solicitud. Revise fecha y hora en el formulario.`);
  }
  const ms = new Date(raw).getTime();
  if (!Number.isFinite(ms)) {
    throw new Error(`${label} no es válida. Revise fecha y hora en el formulario.`);
  }
  return new Date(ms).toISOString();
}

/** Payload mínimo y estable para POST /portal/sync-key (solo filas tocadas, sin campos de UI). */
export function buildPortalRequestSyncPayload(row) {
  const normalized = normalizePortalTransportRequestRow(row);
  if (!normalized || typeof normalized !== "object") return normalized;

  const sessionUid = String(getSession()?.userId || "").trim();
  const truckType = normalizeRequestRequiredTruckType(
    normalized.vehicleType || normalized.requiredTruckType
  );
  const contactName = String(
    normalized.contactName ?? normalized.siteContactName ?? ""
  ).trim();
  const contactPhone = String(
    normalized.contactPhone ?? normalized.siteContactPhone ?? ""
  ).trim();
  const observationsRaw = String(
    normalized.observations ?? normalized.notes ?? ""
  ).trim();

  let pickupAt = String(normalized.pickupAt ?? "").trim();
  let etaDelivery = String(normalized.etaDelivery ?? "").trim();
  if (!pickupAt && normalized.pickupDate && normalized.pickupTime) {
    const built =
      typeof window.buildColombiaOffsetDateTime === "function"
        ? window.buildColombiaOffsetDateTime(normalized.pickupDate, normalized.pickupTime)
        : "";
    if (built) pickupAt = new Date(built).toISOString();
  }
  if (!etaDelivery && normalized.deliveryDate && normalized.deliveryTime) {
    const built =
      typeof window.buildColombiaOffsetDateTime === "function"
        ? window.buildColombiaOffsetDateTime(normalized.deliveryDate, normalized.deliveryTime)
        : "";
    if (built) etaDelivery = new Date(built).toISOString();
  }

  const clientUid = isUuidString(normalized.clientUserId)
    ? String(normalized.clientUserId).trim()
    : isUuidString(sessionUid)
      ? sessionUid
      : "";
  if (!clientUid) {
    throw new Error(
      "Su sesión no tiene un identificador válido en el servidor. Cierre sesión, vuelva a entrar y cree la solicitud de nuevo."
    );
  }

  const companyCandidate = String(
    normalized.clientCompanyId || normalized.companyId || ""
  ).trim();
  const clientCompanyId = isUuidString(companyCandidate) ? companyCandidate : null;
  if (window.AntaresApi?.isConfigured?.() && !clientCompanyId) {
    throw new Error(
      "La empresa seleccionada no está registrada en el servidor (falta UUID). Elija una empresa del listado o pida al administrador que la cree en Administración · Usuarios."
    );
  }

  const payload = {
    id: isUuidString(normalized.id) ? String(normalized.id).trim() : newUuidV4(),
    requestNumber: String(normalized.requestNumber || "").trim(),
    clientUserId: clientUid,
    clientCompanyId,
    clientName: String(normalized.clientName || "").trim(),
    requestedByName: String(normalized.requestedByName || "").trim(),
    originDepartment: String(normalized.originDepartment || "").trim(),
    originCity: String(normalized.originCity || "").trim(),
    originAddress: String(normalized.originAddress || "").trim(),
    destinationDepartment: String(normalized.destinationDepartment || "").trim(),
    destinationCity: String(normalized.destinationCity || "").trim(),
    destinationAddress: String(normalized.destinationAddress || "").trim(),
    pickupAt: portalRequestIsoOrThrow(pickupAt, "la fecha de recogida"),
    etaDelivery: portalRequestIsoOrThrow(etaDelivery, "la fecha de entrega"),
    vehicleType: truckType,
    requiredTruckType: truckType,
    serviceType: String(normalized.serviceType || "").trim(),
    refrigeracionTermoking:
      typeof normalized.refrigeracionTermoking === "boolean"
        ? normalized.refrigeracionTermoking
        : false,
    cargoDescription: String(normalized.cargoDescription || "").trim(),
    contactName,
    contactPhone,
    siteContactName: contactName,
    siteContactPhone: contactPhone,
    boxesCount: Math.max(0, Number(normalized.boxesCount ?? normalized.boxes ?? 0) || 0),
    insuredValue:
      normalized.insuredValue != null && String(normalized.insuredValue).trim() !== ""
        ? Math.max(0, Number(normalized.insuredValue) || 0)
        : null,
    distanceKm:
      normalized.distanceKm != null && String(normalized.distanceKm).trim() !== ""
        ? Math.max(0, Number(normalized.distanceKm) || 0)
        : null,
    observations: observationsRaw || null,
    status: String(normalized.status || "Pendiente").trim() || "Pendiente",
    tripValue: Math.max(0, Number(normalized.tripValue) || 0),
    standbyChargeTotal: Math.max(0, Number(normalized.standbyChargeTotal) || 0),
    standbyEvents: Array.isArray(normalized.standbyEvents) ? normalized.standbyEvents : [],
    rejectionReason: String(normalized.rejectionReason || "").trim(),
    approvedAt: portalIsoOrNull(normalized.approvedAt),
    approvedBy:
      normalized.approvedBy != null && String(normalized.approvedBy).trim() !== ""
        ? String(normalized.approvedBy).trim()
        : null,
    autoApproved: Boolean(normalized.autoApproved),
    deliveredAt: portalIsoOrNull(normalized.deliveredAt),
    closedAt: portalIsoOrNull(normalized.closedAt),
    trip: null
  };

  if (requestRequiredTruckTypeShowsFuelles(truckType)) {
    const fuellesRaw = normalized.fuelles;
    const fuellesNum =
      typeof fuellesRaw === "number" ? fuellesRaw : Number(String(fuellesRaw ?? "").trim());
    if (!Number.isFinite(fuellesNum) || fuellesNum < 0) {
      throw new Error("Indique la cantidad de fuelles para Turbo o Camión.");
    }
    payload.fuelles = Math.floor(fuellesNum);
    payload.weightKg = 0;
  } else if (truckType === "Tractomula") {
    payload.fuelles = null;
    payload.weightKg = Math.max(0, Number(normalized.weightKg) || 0);
    if (payload.weightKg <= 0) {
      throw new Error("Indique el peso en kg para tractomula.");
    }
  } else {
    payload.fuelles = null;
    payload.weightKg = Math.max(0, Number(normalized.weightKg) || 0);
  }

  if (normalized.trip && typeof normalized.trip === "object" && !Array.isArray(normalized.trip)) {
    const trip = { ...normalized.trip };
    if (!isUuidString(trip.id)) delete trip.id;
    if (!isUuidString(trip.vehicleId)) delete trip.vehicleId;
    if (!isUuidString(trip.driverId)) delete trip.driverId;
    payload.trip = String(trip.tripNumber || "").trim() ? trip : null;
  }

  const pickupMs = new Date(payload.pickupAt).getTime();
  const deliveryMs = new Date(payload.etaDelivery).getTime();
  if (!Number.isFinite(pickupMs) || !Number.isFinite(deliveryMs) || deliveryMs <= pickupMs) {
    throw new Error("La fecha de entrega debe ser posterior a la de recogida.");
  }

  return payload;
}

/** @deprecated alias interno; usar buildPortalRequestSyncPayload. */
export function sanitizePortalRequestRowForServer(row) {
  return buildPortalRequestSyncPayload(row);
}

export function reqWrite(next) {
  if (typeof window !== "undefined" && typeof window.DomainModules?.requests?.writeAllSync === "function") {
    window.DomainModules.requests.writeAllSync(next);
  } else {
    write(KEYS.requests, next, { skipSyncSchedule: true });
  }
}

/** Quita filas legacy (ids no UUID) que rompen POST /portal/sync-key si se envían en bloque. */
export function filterPortalRequestsForServerCache(rows) {
  if (!Array.isArray(rows)) return [];
  const apiOn = typeof window !== "undefined" && window.AntaresApi?.isConfigured?.();
  return rows.filter((row) => {
    if (!row || typeof row !== "object") return false;
    if (!apiOn) return true;
    if (!isUuidString(row.id) || !isUuidString(row.clientUserId)) return false;
    const companyRaw = String(row.clientCompanyId || row.companyId || "").trim();
    if (companyRaw && !isUuidString(companyRaw)) return false;
    return true;
  });
}

export async function reqWriteAwait(next, syncRows, deleteIds, extraOpts = {}) {
  /** No programar sync-key del array completo; solo la fila editada vía writeAwaitServer. */
  write(KEYS.requests, next, { skipSyncSchedule: true });
  const opts = { ...(extraOpts && typeof extraOpts === "object" ? extraOpts : {}) };
  if (deleteIds != null && deleteIds !== false) {
    const ids = (Array.isArray(deleteIds) ? deleteIds : [deleteIds])
      .map((id) => String(id || "").trim())
      .filter(Boolean);
    if (ids.length) {
      opts.syncData = [];
      opts.deletedIds = ids;
    }
  } else if (syncRows != null) {
    const rows = Array.isArray(syncRows) ? syncRows : [syncRows];
    const apiOn = typeof window !== "undefined" && window.AntaresApi?.isConfigured?.();
    opts.syncData = apiOn ? rows.map((r) => buildPortalRequestSyncPayload(r)) : rows;
  }
  await writeAwaitServer(KEYS.requests, read(KEYS.requests, []), opts);
}

export function readPortalTransportRequests() {
  const rows =
    typeof window !== "undefined" && typeof window.DomainModules?.requests?.readAllSync === "function"
      ? window.DomainModules.requests.readAllSync()
      : readArray(KEYS.requests);
  return Array.isArray(rows) ? rows.map(normalizePortalTransportRequestRow) : [];
}

/** Lista normalizada (mismo contrato que antes en `portal-runtime.js`). */
export function reqRead() {
  return readPortalTransportRequests();
}

/** Busca solicitud por id (UUID en API, string en DOM `data-id`). */
export function findTransportRequestById(id) {
  const key = String(id ?? "").trim();
  if (!key) return null;
  return reqRead().find((r) => String(r.id ?? "").trim() === key) || null;
}

/** Literales de estado usados en asignación (deben coincidir con `STATUS` en portal-runtime). */
const STATUS_ASIGNACION_VIAJE = Object.freeze({
  PENDIENTE: "Pendiente",
  APROBADA_PENDIENTE_ASIGNACION: "Aprobada pendiente asignacion"
});

/**
 * Alcance de solicitudes de transporte.
 * - Cliente: solo su empresa asignada (nunca otras); en vista individual solo sus propias solicitudes.
 * - Interno sin permiso global: solicitante o misma empresa.
 * @param {() => string} getClientDataScope devuelve `CLIENT_DATA_SCOPE.COMPANY` o `INDIVIDUAL`
 */
export function transportRequestBelongsToUserScope(request, user, getClientDataScope) {
  if (!request || !user) return false;
  const userId = String(user.id || "").trim();
  const companyId = String(user.companyId || "").trim();
  const reqUserId = String(request.clientUserId || "").trim();
  const reqCompanyId = String(request.clientCompanyId || "").trim();

  if (user.role === ROLES.CLIENT) {
    if (!companyId) return Boolean(userId && reqUserId === userId);
    if (!reqCompanyId || reqCompanyId !== companyId) return false;
    const scope =
      typeof getClientDataScope === "function" ? getClientDataScope() : CLIENT_DATA_SCOPE.COMPANY;
    if (scope === CLIENT_DATA_SCOPE.INDIVIDUAL) {
      return Boolean(userId && reqUserId === userId);
    }
    return true;
  }

  if (userId && reqUserId === userId) return true;
  if (companyId && reqCompanyId === companyId) return true;
  return false;
}

/**
 * Lista visible según alcance (delega “ver todo” en `canViewAllTransportRequests`).
 * @param {unknown[]} requests
 * @param {{ getClientDataScope?: () => string; canViewAllTransportRequests?: (u: unknown) => boolean }} deps
 */
export function filterVisibleTransportRequests(requests, user, deps = {}) {
  const { getClientDataScope, canViewAllTransportRequests } = deps;
  if (!user || !Array.isArray(requests)) return [];
  if (typeof canViewAllTransportRequests === "function" && canViewAllTransportRequests(user)) {
    return requests;
  }
  const getScope =
    typeof getClientDataScope === "function" ? getClientDataScope : () => CLIENT_DATA_SCOPE.COMPANY;
  return requests.filter((r) => transportRequestBelongsToUserScope(r, user, getScope));
}

/**
 * Solicitudes listas para asignar viaje (sin `trip`), según estado y permiso de aprobación.
 * @param {(u: unknown) => boolean} canApproveTransportRequests
 */
export function filterPendingRequestsForTripAssignment(visibleRequests, user, canApproveTransportRequests) {
  if (!Array.isArray(visibleRequests)) return [];
  return visibleRequests.filter((r) => {
    if (r.trip) return false;
    if (r.status === STATUS_ASIGNACION_VIAJE.APROBADA_PENDIENTE_ASIGNACION) return true;
    if (
      r.status === STATUS_ASIGNACION_VIAJE.PENDIENTE &&
      typeof canApproveTransportRequests === "function" &&
      canApproveTransportRequests(user)
    ) {
      return true;
    }
    return false;
  });
}

/**
 * ¿Puede asignarse viaje a esta solicitud desde el módulo Viajes? (misma regla que el filtro pendiente).
 * @param {(u: unknown) => boolean} canApproveTransportRequests
 */
export function transportRequestEligibleForViajesAssignment(request, user, canApproveTransportRequests) {
  if (!request) return false;
  if (request.status === STATUS_ASIGNACION_VIAJE.APROBADA_PENDIENTE_ASIGNACION) return true;
  if (
    request.status === STATUS_ASIGNACION_VIAJE.PENDIENTE &&
    typeof canApproveTransportRequests === "function" &&
    canApproveTransportRequests(user)
  ) {
    return true;
  }
  return false;
}

function readCounters() {
  return read(KEYS.counters, {});
}

export function nextCounter(prefix) {
  const counters = readCounters();
  const current = Number(counters[prefix] || 0) + 1;
  counters[prefix] = current;
  const skipSync =
    typeof window !== "undefined" && window.AntaresApi?.isConfigured?.();
  write(KEYS.counters, counters, { skipSyncSchedule: skipSync });
  return current;
}

export function makeRequestNumber(existingNumbers = new Set()) {
  let code = `SOL-${String(nextCounter("request")).padStart(6, "0")}`;
  while (existingNumbers.has(code)) {
    code = `SOL-${String(nextCounter("request")).padStart(6, "0")}`;
  }
  return code;
}

export function makeTripNumber(existingNumbers = new Set()) {
  let code = `VIA-${String(nextCounter("trip")).padStart(6, "0")}`;
  while (existingNumbers.has(code)) {
    code = `VIA-${String(nextCounter("trip")).padStart(6, "0")}`;
  }
  return code;
}

/**
 * Vacía la caché local de solicitudes (RAM, localStorage legacy y snapshot en sessionStorage)
 * y repuebla desde GET /portal/bootstrap. No borra filas en PostgreSQL.
 * @returns {Promise<unknown[]>} solicitudes tras la rehidratación
 */
export async function clearPortalRequestsLocalAndResyncFromServer(opts = {}) {
  if (typeof window === "undefined") return [];

  const storageKey = KEYS.requests;
  const PS = window.AntaresPortalSync;
  if (PS?.cancelScheduled) PS.cancelScheduled(storageKey);
  if (PS?.beginBootstrap) PS.beginBootstrap();
  try {
    try {
      localStorage.removeItem(storageKey);
    } catch (_e) {
      /* noop */
    }
    if (window.AntaresPersistence?.remove) {
      window.AntaresPersistence.remove(storageKey);
    } else {
      write(storageKey, [], { skipSyncSchedule: true });
    }
    const uid = String(getSession()?.userId || "").trim();
    if (uid && window.PortalBootstrapCache?.removeStorageKey) {
      window.PortalBootstrapCache.removeStorageKey(uid, storageKey);
    }
  } finally {
    if (PS?.endBootstrap) PS.endBootstrap();
  }

  if (window.AntaresApi?.isConfigured?.()) {
    const { applyPortalBootstrapFromApi } = await import("../core/bootstrap.js");
    await applyPortalBootstrapFromApi({ skipSecondaryHydration: opts.skipSecondaryHydration === true });
    const cleaned = filterPortalRequestsForServerCache(reqRead());
    write(KEYS.requests, cleaned, { skipSyncSchedule: true });
  }

  if (opts.rerender !== false) {
    if (typeof window.scheduleRenderPortalView === "function") {
      window.scheduleRenderPortalView();
    } else {
      const { scheduleRenderPortalView } = await import("../core/router.js");
      scheduleRenderPortalView();
    }
  }

  return reqRead();
}
