/**
 * Dominio del dashboard: KPIs operativos, alertas y acciones prioritarias.
 */
import { KEYS, STATUS } from "../core/config.js";
import { read } from "../core/data-io.js";
import {
  canAccessAuthorizationsView,
  isViewAllowedForUser
} from "../core/auth.js";
import { isPortalClientUser } from "../core/client-data-scope-ui.js";
import { colombiaNowIso, colombiaTodayIsoDate } from "../core/utils.js";
import { requestPickupIsoDate, tripRequestStatusIsOperational } from "./viajes.domain.js";
import { filterPendingApprovalsForActor, readApprovalsSync, readPendingPortalRegistrationsSync } from "./authorizations.domain.js";

function readRequests() {
  if (typeof globalThis.readPortalTransportRequests === "function") {
    return globalThis.readPortalTransportRequests();
  }
  return read(KEYS.requests, []);
}

function getVisibleRequests(user) {
  const SD = globalThis.AntaresSolicitudesDomain;
  const requests = readRequests();
  if (!user || !SD || typeof SD.filterVisibleTransportRequests !== "function") return [];
  return SD.filterVisibleTransportRequests(requests, user, {
    getClientDataScope: globalThis.getClientDataScope,
    canViewAllTransportRequests: globalThis.canViewAllTransportRequests
  });
}

function countUnreadNotifications() {
  const N = globalThis.AntaresNotificacionesDomain;
  if (!N || typeof N.getCurrentNotifications !== "function") return 0;
  const isRead = typeof N.notificationIsRead === "function" ? N.notificationIsRead : () => true;
  return N.getCurrentNotifications().filter((n) => !isRead(n)).length;
}

function countPendingTripAssignments(user, visible) {
  const SD = globalThis.AntaresSolicitudesDomain;
  const canApprove = globalThis.canApproveTransportRequests;
  if (!SD || typeof SD.filterPendingRequestsForTripAssignment !== "function") return 0;
  return SD.filterPendingRequestsForTripAssignment(visible, user, canApprove).length;
}

function countAuthorizationQueue(user) {
  if (!user || !canAccessAuthorizationsView(user)) return 0;
  const approvals = readApprovalsSync().filter((a) => String(a?.status || "").toLowerCase() === "pendiente");
  const pendingApprovals = filterPendingApprovalsForActor(approvals, user).length;
  const pendingRegs =
    typeof globalThis.canApprovePortalRegistration === "function" && globalThis.canApprovePortalRegistration(user)
      ? readPendingPortalRegistrationsSync().length
      : 0;
  return pendingApprovals + pendingRegs;
}

function vehicleDocIsAtRisk(vehicle) {
  const fn = globalThis.docExpiryStatus;
  if (typeof fn !== "function" || !vehicle) return false;
  const soat = fn(vehicle.soatExpeditionDate, vehicle.soatExpiryDate);
  const tech = fn(vehicle.techInspectionExpeditionDate, vehicle.techInspectionExpiryDate);
  return soat.days < 0 || tech.days < 0 || soat.days <= 30 || tech.days <= 30;
}

function countFleetDocRisk(user) {
  if (isPortalClientUser(user)) return 0;
  const vehicles = read(KEYS.vehicles, []);
  return vehicles.filter((v) => vehicleDocIsAtRisk(v)).length;
}

function requestOutcomeTone(status) {
  const key = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (["completada", "cerrada"].includes(key)) return "ok";
  if (["cancelada", "rechazada"].includes(key)) return "fail";
  if (["espera_standby"].includes(key)) return "warn";
  if (["en_transito", "viaje_asignado"].includes(key)) return "live";
  return "neutral";
}

function requestIsDelayed(request, nowTs = Date.now()) {
  if (!request || !tripRequestStatusIsOperational(request.status)) return false;
  const eta = String(request?.trip?.etaDelivery || request?.deliveryAt || request?.trip?.etaPickup || request?.pickupAt || "").trim();
  const ts = new Date(eta).getTime();
  return Number.isFinite(ts) && ts < nowTs;
}

function filterTodayTrips(list, todayIso) {
  return list.filter((r) => {
    const pickupDay = requestPickupIsoDate(r);
    if (pickupDay === todayIso) return true;
    return Boolean(r.trip) && tripRequestStatusIsOperational(r.status);
  });
}

export function computeDashboardKpis() {
  const requests = readRequests();
  const trips = requests.filter((r) => r?.trip);
  const activeStatuses = new Set([STATUS.EN_TRANSITO, STATUS.VIAJE_ASIGNADO, STATUS.ESPERA_STANDBY]);
  const closedStatuses = new Set([STATUS.COMPLETADA, STATUS.CERRADA]);
  const activeTrips = requests.filter((r) => activeStatuses.has(String(r?.status || "")));
  const completedTrips = requests.filter((r) => closedStatuses.has(String(r?.status || "")));
  const pending = requests.filter((r) => String(r?.status || "") === STATUS.PENDIENTE);
  const vehicles = read(KEYS.vehicles, []);
  const drivers = read(KEYS.drivers, []);
  return {
    requestsTotal: requests.length,
    tripsTotal: trips.length,
    activeTrips: activeTrips.length,
    completedTrips: completedTrips.length,
    pendingRequests: pending.length,
    vehiclesTotal: vehicles.length,
    driversTotal: drivers.length
  };
}

/** Resumen operativo del día para torre de control y tarjetas del header. */
export function computeTodayOperationsSnapshot(user) {
  const list = getVisibleRequests(user);
  const todayIso = colombiaTodayIsoDate();
  const todayTrips = filterTodayTrips(list, todayIso);
  const activeTrips = todayTrips.filter((r) => r.trip && tripRequestStatusIsOperational(r.status));
  const vehicleIdsEnRuta = new Set(activeTrips.map((r) => String(r.trip?.vehicleId || "").trim()).filter(Boolean));
  const assignedToday = todayTrips.filter((r) => r.trip).length;
  const completedToday = todayTrips.filter((r) => [STATUS.COMPLETADA, STATUS.CERRADA].includes(r.status)).length;
  const compliancePct = assignedToday ? Math.round((completedToday / assignedToday) * 100) : 0;
  const okDeliveries = todayTrips.filter((r) => requestOutcomeTone(r.status) === "ok").length;
  const issueDeliveries = todayTrips.filter((r) => ["fail", "warn"].includes(requestOutcomeTone(r.status))).length;
  const deliveryBarPct = assignedToday ? Math.round((okDeliveries / assignedToday) * 100) : 0;
  const standbyToday = todayTrips.filter((r) => requestOutcomeTone(r.status) === "warn").length;
  const delayedToday = todayTrips.filter((r) => requestIsDelayed(r)).length;
  const vehicles = read(KEYS.vehicles, []);
  const fleetTotal = isPortalClientUser(user)
    ? new Set(todayTrips.map((r) => String(r.trip?.vehicleId || "").trim()).filter(Boolean)).size
    : vehicles.length;
  const fleetUtilPct = fleetTotal ? Math.round((vehicleIdsEnRuta.size / fleetTotal) * 100) : 0;

  return {
    todayIso,
    generatedAt: colombiaNowIso(),
    vehicleIdsEnRuta: vehicleIdsEnRuta.size,
    assignedToday,
    completedToday,
    compliancePct,
    okDeliveries,
    issueDeliveries,
    deliveryBarPct,
    standbyToday,
    delayedToday,
    fleetUtilPct,
    pendingAssignment: countPendingTripAssignments(user, list),
    pendingAuthorization: countAuthorizationQueue(user),
    docRisk: countFleetDocRisk(user),
    unreadNotifications: countUnreadNotifications(),
    attentionScore:
      countUnreadNotifications() +
      countPendingTripAssignments(user, list) +
      countAuthorizationQueue(user) +
      countFleetDocRisk(user) +
      delayedToday +
      standbyToday
  };
}

/**
 * Ítems accionables para la franja «Requiere atención» del dashboard.
 * @returns {Array<{ id: string, label: string, value: number, tone: string, help?: string, targetView?: string }>}
 */
export function computeDashboardAttentionItems(user) {
  if (!user) return [];
  const snap = computeTodayOperationsSnapshot(user);
  const items = [];

  if (snap.delayedToday > 0) {
    items.push({
      id: "delayed",
      label: "entregas con retraso",
      value: snap.delayedToday,
      tone: "alert",
      help: "Viajes activos cuya ventana de entrega ya venció.",
      targetView: "dashboard"
    });
  }
  if (snap.standbyToday > 0) {
    items.push({
      id: "standby",
      label: "en espera / standby",
      value: snap.standbyToday,
      tone: "warn",
      help: "Solicitudes detenidas que requieren seguimiento operativo.",
      targetView: "dashboard"
    });
  }
  if (snap.pendingAssignment > 0 && isViewAllowedForUser(user, "transport-trips")) {
    items.push({
      id: "assign",
      label: "sin asignar viaje",
      value: snap.pendingAssignment,
      tone: "warn",
      help: "Solicitudes aprobadas o pendientes listas para asignación.",
      targetView: "transport-trips"
    });
  }
  if (snap.pendingAuthorization > 0 && canAccessAuthorizationsView(user)) {
    items.push({
      id: "auth",
      label: "en autorizaciones",
      value: snap.pendingAuthorization,
      tone: "warn",
      help: "Aprobaciones, altas o solicitudes en bandeja.",
      targetView: "authorizations"
    });
  }
  if (snap.docRisk > 0 && isViewAllowedForUser(user, "transport-vehicles")) {
    items.push({
      id: "docs",
      label: "docs de flota por vencer",
      value: snap.docRisk,
      tone: snap.docRisk > 2 ? "alert" : "warn",
      help: "Vehículos con SOAT o tecnomecánica vencida o en ventana de 30 días.",
      targetView: "transport-vehicles"
    });
  }
  if (snap.unreadNotifications > 0 && isViewAllowedForUser(user, "notifications")) {
    items.push({
      id: "notifications",
      label: "notificaciones sin leer",
      value: snap.unreadNotifications,
      tone: "warn",
      help: "Avisos del portal que aún no ha revisado.",
      targetView: "notifications"
    });
  }
  if (isPortalClientUser(user)) {
    const ownPending = getVisibleRequests(user).filter((r) => r.status === STATUS.PENDIENTE).length;
    if (ownPending > 0) {
      items.push({
        id: "own-pending",
        label: "solicitudes en revisión",
        value: ownPending,
        tone: "warn",
        help: "Sus solicitudes de transporte esperando respuesta.",
        targetView: "requests"
      });
    }
  }

  return items;
}

/** Tarjetas KPI del header del portal (vista dashboard). */
export function buildDashboardHeaderKpiCards(user, icons = {}) {
  const snap = computeTodayOperationsSnapshot(user);
  const IC = icons && typeof icons === "object" ? icons : {};
  const complianceColor = snap.compliancePct >= 80 ? "kpi-icon-success" : snap.compliancePct >= 50 ? "kpi-icon-warning" : "kpi-icon-rose";

  return [
    {
      icon: IC.truck || "",
      label: "En ruta",
      value: String(snap.vehicleIdsEnRuta),
      color: "kpi-icon-primary"
    },
    {
      icon: IC.compass || "",
      label: "Asignados hoy",
      value: String(snap.assignedToday),
      color: "kpi-icon-teal"
    },
    {
      icon: IC.check || IC.package || "",
      label: "Completados",
      value: String(snap.completedToday),
      color: "kpi-icon-success"
    },
    {
      icon: IC.activity || "",
      label: "Cumplimiento",
      value: `${snap.compliancePct}%`,
      color: complianceColor
    }
  ];
}

export function groupRequestsByVehicleForDashboard(requests) {
  const map = new Map();
  (Array.isArray(requests) ? requests : []).forEach((r) => {
    const vid = String(r?.trip?.vehicleId || "").trim() || "_none";
    if (!map.has(vid)) {
      map.set(vid, {
        vehicleId: vid,
        plate: r?.trip?.vehiclePlate || "Sin placa",
        driverName: r?.trip?.driverName || "",
        trips: []
      });
    }
    map.get(vid).trips.push(r);
  });
  return [...map.values()];
}
