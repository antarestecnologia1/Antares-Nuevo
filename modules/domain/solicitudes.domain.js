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

/** Alinea ids y fechas opcionales antes de POST /portal/sync-key (evita 22P02 por caché legacy). */
export function sanitizePortalRequestRowForServer(row) {
  if (!row || typeof row !== "object") return row;
  const out = { ...row };
  const sessionUid = String(getSession()?.userId || "").trim();

  if (!isUuidString(out.id)) {
    out.id = newUuidV4();
  }

  const clientUid = isUuidString(out.clientUserId)
    ? String(out.clientUserId).trim()
    : isUuidString(sessionUid)
      ? sessionUid
      : "";
  if (!clientUid) {
    throw new Error(
      "Su sesión no tiene un identificador válido en el servidor. Cierre sesión, vuelva a entrar y cree la solicitud de nuevo."
    );
  }
  out.clientUserId = clientUid;

  const companyCandidate = String(out.clientCompanyId || out.companyId || "").trim();
  out.clientCompanyId = isUuidString(companyCandidate) ? companyCandidate : null;

  out.approvedAt = portalIsoOrNull(out.approvedAt);
  out.deliveredAt = portalIsoOrNull(out.deliveredAt);
  out.closedAt = portalIsoOrNull(out.closedAt);
  if (out.approvedBy != null && String(out.approvedBy).trim() === "") {
    out.approvedBy = null;
  }

  if (out.trip && typeof out.trip === "object" && !Array.isArray(out.trip)) {
    const trip = { ...out.trip };
    if (!isUuidString(trip.id)) delete trip.id;
    if (!isUuidString(trip.vehicleId)) delete trip.vehicleId;
    if (!isUuidString(trip.driverId)) delete trip.driverId;
    out.trip = String(trip.tripNumber || "").trim() ? trip : null;
  } else {
    out.trip = null;
  }

  return out;
}

export function reqWrite(next) {
  if (typeof window !== "undefined" && window.DomainModules?.requests?.writeAllSync === "function") {
    window.DomainModules.requests.writeAllSync(next);
  } else {
    write(KEYS.requests, next);
  }
}

export async function reqWriteAwait(next, syncRows, deleteIds, extraOpts = {}) {
  reqWrite(next);
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
    opts.syncData = apiOn ? rows.map((r) => sanitizePortalRequestRowForServer(r)) : rows;
  }
  await writeAwaitServer(KEYS.requests, read(KEYS.requests, []), opts);
}

export function readPortalTransportRequests() {
  const rows =
    typeof window !== "undefined" && window.DomainModules?.requests?.readAllSync === "function"
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
  write(KEYS.counters, counters);
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
