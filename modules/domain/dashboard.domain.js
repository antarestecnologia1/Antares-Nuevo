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
import { colombiaNowIso, colombiaTodayIsoDate, getColombiaDateParts } from "../core/utils.js";
import { requestPickupIsoDate, tripRequestStatusIsOperational } from "./viajes.domain.js";
import { filterPendingApprovalsForActor, readApprovalsSync, readPendingPortalRegistrationsSync } from "./authorizations.domain.js";
import {
  resolveEmployeeComplianceExpiryYmd,
  COMPLIANCE_DUE_SOON_DAYS
} from "./driver-compliance-vigencia.domain.js";

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

export function requestOutcomeTone(status) {
  const key = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (["completada", "cerrada"].includes(key)) return "ok";
  if (["cancelada", "rechazada"].includes(key)) return "fail";
  if (["espera_standby"].includes(key)) return "warn";
  if (["en_transito", "viaje_asignado"].includes(key)) return "live";
  return "neutral";
}

export function requestIsDelayed(request, nowTs = Date.now()) {
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

function parseMetricNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function docStatusLabel(days) {
  if (days < 0) return "venció";
  if (days === 0) return "vence hoy";
  if (days === 1) return "vence mañana";
  return `vence en ${days} días`;
}

/** Entregas agrupadas por hora (06:00–19:00) para gráfico operativo. */
export function computeDeliveriesByHour(todayTrips) {
  const buckets = Array.from({ length: 14 }, (_, i) => ({
    hour: i + 6,
    label: String(i + 6).padStart(2, "0"),
    count: 0
  }));
  (Array.isArray(todayTrips) ? todayTrips : []).forEach((r) => {
    const raw = r.deliveredAt || r.trip?.etaDelivery || r.deliveryAt || r.pickupAt || r.trip?.etaPickup;
    const ts = new Date(raw).getTime();
    if (!Number.isFinite(ts)) return;
    const hour = new Date(raw).getHours();
    if (hour < 6 || hour > 19) return;
    buckets[hour - 6].count += 1;
  });
  const peak = Math.max(1, ...buckets.map((b) => b.count));
  return buckets.map((b) => ({ ...b, pct: Math.round((b.count / peak) * 100) }));
}

/** Estado de flota para gráfico circular: activos, en espera, mantenimiento. */
export function computeFleetStatusBreakdown(user, groupList = []) {
  const vehicles = read(KEYS.vehicles, []);
  const activeIds = new Set();
  (Array.isArray(groupList) ? groupList : []).forEach((g) => {
    const live = (g.trips || []).some((r) => requestOutcomeTone(r.status) === "live");
    if (live) activeIds.add(String(g.vehicleId || ""));
  });

  if (isPortalClientUser(user)) {
    const activos = activeIds.size;
    const espera = Math.max(0, groupList.length - activos);
    return { activos, espera, mantenimiento: 0, total: groupList.length || activos + espera };
  }

  let activos = 0;
  let espera = 0;
  let mantenimiento = 0;
  vehicles.forEach((v) => {
    const id = String(v.id || "");
    const status = String(v.status || v.availability || v.fleetStatus || "").toLowerCase();
    if (status.includes("manten") || status.includes("taller") || status.includes("repair")) {
      mantenimiento += 1;
      return;
    }
    if (activeIds.has(id)) activos += 1;
    else espera += 1;
  });
  return { activos, espera, mantenimiento, total: vehicles.length };
}

/** Métricas ejecutivas del día (combustible, km, puntualidad). */
export function computeTodayExecutiveMetrics(user) {
  const snap = computeTodayOperationsSnapshot(user);
  const todayIso = snap.todayIso || colombiaTodayIsoDate();
  const fuelLogs = read(KEYS.fuelLogs, []).filter((log) => {
    const day = String(log.date || log.createdAt || "").slice(0, 10);
    return day === todayIso;
  });
  const fuelLiters = fuelLogs.reduce((acc, log) => acc + parseMetricNum(log.liters), 0);
  const odometers = fuelLogs
    .map((log) => parseMetricNum(log.odometerKm))
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const kmToday = odometers.length >= 2 ? odometers[odometers.length - 1] - odometers[0] : 0;
  const punctualityPct = snap.assignedToday
    ? Math.max(0, Math.round(((snap.assignedToday - snap.delayedToday) / snap.assignedToday) * 100))
    : 100;

  return {
    activeVehicles: snap.vehicleIdsEnRuta,
    compliancePct: snap.compliancePct,
    punctualityPct,
    fleetUtilPct: snap.fleetUtilPct,
    fuelLiters: Math.round(fuelLiters * 10) / 10,
    kmToday: Math.max(0, Math.round(kmToday))
  };
}

/**
 * Alertas críticas con mensaje descriptivo para el centro de alertas.
 * @returns {Array<{ id: string, tone: string, message: string, targetView?: string, fleetTab?: string, help?: string }>}
 */
export function computeDashboardCriticalAlerts(user) {
  if (!user) return [];
  const alerts = [];
  const list = getVisibleRequests(user);
  const todayIso = colombiaTodayIsoDate();
  const todayTrips = filterTodayTrips(list, todayIso);
  const docFn = globalThis.docExpiryStatus;
  const nowTs = Date.now();

  todayTrips
    .filter((r) => requestIsDelayed(r, nowTs))
    .slice(0, 4)
    .forEach((r) => {
      const plate = String(r.trip?.vehiclePlate || "Vehículo").trim();
      const eta = r.trip?.etaDelivery || r.deliveryAt || r.trip?.etaPickup;
      const mins = eta ? Math.max(1, Math.round((nowTs - new Date(eta).getTime()) / 60000)) : 0;
      alerts.push({
        id: `delay-${r.id}`,
        tone: "alert",
        message: `Vehículo ${plate} retrasado ${mins} min`,
        help: `${r.requestNumber || r.id} · ${r.clientName || "Cliente"}`,
        targetView: "dashboard",
        fleetTab: "en-ruta"
      });
    });

  if (!isPortalClientUser(user) && typeof docFn === "function") {
    const vehicles = read(KEYS.vehicles, []);
    vehicles.forEach((v) => {
      const plate = String(v.plate || "Sin placa").trim();
      const soat = docFn(v.soatExpeditionDate, v.soatExpiryDate);
      const tech = docFn(v.techInspectionExpeditionDate, v.techInspectionExpiryDate);
      if (soat.days <= 30) {
        alerts.push({
          id: `soat-${v.id}`,
          tone: soat.days < 0 ? "alert" : "warn",
          message: `SOAT ${plate} ${docStatusLabel(soat.days)}`,
          help: "Revise documentación en Transporte · Camiones",
          targetView: "transport-vehicles"
        });
      }
      if (tech.days <= 30) {
        alerts.push({
          id: `tech-${v.id}`,
          tone: tech.days < 0 ? "alert" : "warn",
          message: `Tecnomecánica ${plate} ${docStatusLabel(tech.days)}`,
          help: "Revise documentación en Transporte · Camiones",
          targetView: "transport-vehicles"
        });
      }
    });

    const complianceDueSoonDays = COMPLIANCE_DUE_SOON_DAYS;
    const pushComplianceAlert = (id, toneDays, message, help, targetView) => {
      alerts.push({
        id,
        tone: toneDays < 0 ? "alert" : "warn",
        message,
        help,
        targetView
      });
    };
    const daysUntilYmd = (ymd) => {
      const expTs = new Date(`${ymd}T12:00:00`).getTime();
      if (!Number.isFinite(expTs)) return null;
      const todayTs = new Date().setHours(0, 0, 0, 0);
      return Math.floor((expTs - todayTs) / 86400000);
    };

    const drivers = read(KEYS.drivers, []);
    drivers.forEach((d) => {
      const expiry = String(d.licenseExpiry || "").trim();
      if (!expiry) return;
      const days = daysUntilYmd(expiry);
      if (days === null || days > complianceDueSoonDays) return;
      const name = String(d.name || d.fullName || "Conductor").trim().split(/\s+/)[0];
      pushComplianceAlert(
        `license-${d.id}`,
        days,
        `Licencia ${name} ${docStatusLabel(days)}`,
        "Revise en Transporte · Conductores",
        "transport-drivers"
      );
      const occExpiry = resolveEmployeeComplianceExpiryYmd(d, "occupationalExamExpiry", "occupationalExamDate");
      if (occExpiry) {
        const occDays = daysUntilYmd(occExpiry);
        if (occDays !== null && occDays <= complianceDueSoonDays) {
          pushComplianceAlert(
            `occ-driver-${d.id}`,
            occDays,
            `Examen ocupacional ${name} ${docStatusLabel(occDays)}`,
            "Revise en Cumplimiento laboral y SST",
            "labor-compliance"
          );
        }
      }
      const intraExpiry = resolveEmployeeComplianceExpiryYmd(d, "instruvialExamExpiry", "instruvialExamDate");
      if (intraExpiry) {
        const intraDays = daysUntilYmd(intraExpiry);
        if (intraDays !== null && intraDays <= complianceDueSoonDays) {
          pushComplianceAlert(
            `intra-driver-${d.id}`,
            intraDays,
            `Examen instruvial ${name} ${docStatusLabel(intraDays)}`,
            "Revise en Cumplimiento laboral y SST",
            "labor-compliance"
          );
        }
      }
    });

    const employees = read(KEYS.payrollEmployees, []);
    employees.forEach((employee) => {
      const name = String(employee.name || "Colaborador").trim().split(/\s+/)[0];
      const occExpiry = resolveEmployeeComplianceExpiryYmd(
        employee,
        "occupationalExamExpiry",
        "occupationalExamDate"
      );
      if (occExpiry) {
        const occDays = daysUntilYmd(occExpiry);
        if (occDays !== null && occDays <= complianceDueSoonDays) {
          pushComplianceAlert(
            `occ-emp-${employee.id}`,
            occDays,
            `Examen ocupacional ${name} ${docStatusLabel(occDays)}`,
            "Revise en Cumplimiento laboral y SST",
            "labor-compliance"
          );
        }
      }
      if (String(employee.workerRole || "").trim().toLowerCase() !== "conductor") return;
      const licExpiry = resolveEmployeeComplianceExpiryYmd(
        employee,
        "licenseExpiry",
        "licenseIssueDate"
      );
      if (licExpiry) {
        const licDays = daysUntilYmd(licExpiry);
        if (licDays !== null && licDays <= complianceDueSoonDays) {
          pushComplianceAlert(
            `license-emp-${employee.id}`,
            licDays,
            `Licencia ${name} ${docStatusLabel(licDays)}`,
            "Revise en Gestión humana o Conductores",
            "labor-compliance"
          );
        }
      }
      const intraExpiry = resolveEmployeeComplianceExpiryYmd(
        employee,
        "instruvialExamExpiry",
        "instruvialExamDate"
      );
      if (intraExpiry) {
        const intraDays = daysUntilYmd(intraExpiry);
        if (intraDays !== null && intraDays <= complianceDueSoonDays) {
          pushComplianceAlert(
            `intra-emp-${employee.id}`,
            intraDays,
            `Examen instruvial ${name} ${docStatusLabel(intraDays)}`,
            "Revise en Cumplimiento laboral y SST",
            "labor-compliance"
          );
        }
      }
    });
  }

  const snap = computeTodayOperationsSnapshot(user);
  if (snap.pendingAssignment > 0 && isViewAllowedForUser(user, "transport-trips")) {
    alerts.push({
      id: "pending-assign",
      tone: "warn",
      message: `${snap.pendingAssignment} viaje${snap.pendingAssignment === 1 ? "" : "s"} sin asignar`,
      help: "Solicitudes listas para programación",
      targetView: "transport-trips"
    });
  }
  if (snap.unreadNotifications > 0 && isViewAllowedForUser(user, "notifications")) {
    alerts.push({
      id: "notifications",
      tone: "warn",
      message: `${snap.unreadNotifications} notificación${snap.unreadNotifications === 1 ? "" : "es"} sin leer`,
      targetView: "notifications"
    });
  }

  const toneRank = { alert: 0, warn: 1, ok: 2 };
  return alerts
    .sort((a, b) => (toneRank[a.tone] ?? 9) - (toneRank[b.tone] ?? 9))
    .slice(0, 8);
}

/** Puntos para mapa en vivo a partir de viajes activos del día. */
export function computeDashboardMapMarkers(groupList = []) {
  const cityCoords = {
    Bogota: { lat: 4.711, lng: -74.072 },
    Bogotá: { lat: 4.711, lng: -74.072 },
    Medellin: { lat: 6.244, lng: -75.581 },
    Medellín: { lat: 6.244, lng: -75.581 },
    Cali: { lat: 3.451, lng: -76.532 },
    Barranquilla: { lat: 10.963, lng: -74.796 },
    Cartagena: { lat: 10.391, lng: -75.479 },
    Bucaramanga: { lat: 7.119, lng: -73.123 },
    Pereira: { lat: 4.813, lng: -75.696 },
    Neiva: { lat: 2.935, lng: -75.282 },
    "Santa Marta": { lat: 11.241, lng: -74.199 },
    Manizales: { lat: 5.068, lng: -75.517 },
    Armenia: { lat: 4.533, lng: -75.681 },
    Ibague: { lat: 4.438, lng: -75.232 },
    Ibagué: { lat: 4.438, lng: -75.232 },
    Cucuta: { lat: 7.893, lng: -72.508 },
    Cúcuta: { lat: 7.893, lng: -72.508 }
  };

  const project = (lat, lng) => ({
    x: Math.min(94, Math.max(6, ((lng + 79) / 13) * 100)),
    y: Math.min(90, Math.max(10, ((12.5 - lat) / 12.5) * 100))
  });

  const markers = [];
  (Array.isArray(groupList) ? groupList : []).forEach((g, gi) => {
    const liveTrips = (g.trips || []).filter((r) => requestOutcomeTone(r.status) === "live");
    if (!liveTrips.length) return;
    const trip = liveTrips[0];
    const city = String(trip.destinationCity || trip.originCity || "").trim();
    const coords = cityCoords[city];
    const base = coords ? project(coords.lat, coords.lng) : project(4.7 + (gi % 5) * 0.4, -74.1 - (gi % 4) * 0.8);
    markers.push({
      id: String(g.vehicleId || gi),
      plate: String(g.plate || "—"),
      driver: String(g.driverName || ""),
      city: city || "En ruta",
      delayed: liveTrips.some((r) => requestIsDelayed(r)),
      x: base.x,
      y: base.y
    });
  });
  return markers;
}

function parseNum(value) {
  if (typeof globalThis.parseNum === "function") return globalThis.parseNum(value);
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function deriveRequestValue(request) {
  if (typeof globalThis.deriveRequestOperationalValue === "function") {
    return globalThis.deriveRequestOperationalValue(request);
  }
  const invoiceTotal = parseNum(request?.trip?.invoice?.total || 0);
  if (invoiceTotal > 0) return invoiceTotal;
  return parseNum(request?.insuredValue || request?.tripValue || 0) + parseNum(request?.standbyChargeTotal || 0);
}

function requestActivityIsoDate(request) {
  const raw = request?.trip?.assignedAt || request?.approvedAt || request?.pickupAt || request?.createdAt || "";
  const ts = new Date(raw).getTime();
  if (!Number.isFinite(ts)) return "";
  const p = getColombiaDateParts(new Date(ts));
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function addDaysToIsoDate(isoDate, deltaDays) {
  const m = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDate;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function enumerateIsoDates(fromIso, toIso) {
  const out = [];
  if (!fromIso || !toIso || fromIso > toIso) return out;
  let cursor = fromIso;
  while (cursor <= toIso) {
    out.push(cursor);
    cursor = addDaysToIsoDate(cursor, 1);
  }
  return out;
}

function resolveCompanyStatsDateRange(opts = {}) {
  const today = colombiaTodayIsoDate();
  const period = String(opts.period || "7d").trim();
  if (period === "custom") {
    const fromDate = String(opts.fromDate || "").trim();
    const toDate = String(opts.toDate || today).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(fromDate) && /^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
      return { fromDate: fromDate <= toDate ? fromDate : toDate, toDate: fromDate <= toDate ? toDate : fromDate, period };
    }
  }
  const days = period === "1d" ? 0 : period === "3d" ? 2 : 6;
  return { fromDate: addDaysToIsoDate(today, -days), toDate: today, period: period === "1d" ? "1d" : period === "3d" ? "3d" : "7d" };
}

function filterRequestsForCompanyStats(requests, range, opts = {}) {
  const clientFilter = String(opts.clientFilter || "all").trim();
  const statusFilter = String(opts.statusFilter || "all").trim();
  return (Array.isArray(requests) ? requests : []).filter((r) => {
    const day = requestActivityIsoDate(r);
    if (!day || day < range.fromDate || day > range.toDate) return false;
    if (clientFilter !== "all" && String(r.clientName || "").trim() !== clientFilter) return false;
    if (statusFilter !== "all" && String(r.status || "") !== statusFilter) return false;
    return true;
  });
}

function readFuelLogsForStats() {
  return read(KEYS.fuelLogs, []);
}

function readMaintLogsForStats() {
  return read(KEYS.vehicleTechnicalLogs, []);
}

function logIsoDate(log) {
  const raw = log?.date || log?.createdAt || "";
  const ts = new Date(raw).getTime();
  if (!Number.isFinite(ts)) return "";
  const p = getColombiaDateParts(new Date(ts));
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function humanStatsMonth(isoDate) {
  const m = String(isoDate || "").match(/^(\d{4})-(\d{2})/);
  if (!m) return "";
  const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${names[Number(m[2]) - 1] || m[2]} ${m[1]}`;
}

function humanStatsDayLabel(isoDate) {
  const m = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDate;
  return `${m[2]}/${m[3]}`;
}

/** Snapshot analítico de la empresa para gráficas del dashboard. */
export function computeCompanyStatsSnapshot(user, opts = {}) {
  const range = resolveCompanyStatsDateRange(opts);
  const allVisible = getVisibleRequests(user);
  const requests = filterRequestsForCompanyStats(allVisible, range, opts);
  const dayKeys = enumerateIsoDates(range.fromDate, range.toDate);

  const revenue = requests.reduce((acc, r) => acc + deriveRequestValue(r), 0);
  const trips = requests.filter((r) => r.trip).length;

  const fuelLogs = readFuelLogsForStats().filter((log) => {
    const day = logIsoDate(log);
    return day && day >= range.fromDate && day <= range.toDate;
  });
  const maintLogs = readMaintLogsForStats().filter((log) => {
    const day = logIsoDate(log);
    return day && day >= range.fromDate && day <= range.toDate;
  });
  const fuelCost = fuelLogs.reduce((acc, log) => acc + parseNum(log.totalCost), 0);
  const maintCost = maintLogs.reduce((acc, log) => acc + parseNum(log.cost), 0);
  const totalCost = fuelCost + maintCost;

  const prevFrom = addDaysToIsoDate(range.fromDate, -(dayKeys.length || 1));
  const prevTo = addDaysToIsoDate(range.toDate, -(dayKeys.length || 1));
  const prevRequests = filterRequestsForCompanyStats(allVisible, { fromDate: prevFrom, toDate: prevTo }, opts);
  const prevRevenue = prevRequests.reduce((acc, r) => acc + deriveRequestValue(r), 0);

  const dailyRevenue = {};
  const dailyTrips = {};
  const dailyFuel = {};
  const dailyMaint = {};
  dayKeys.forEach((d) => {
    dailyRevenue[d] = 0;
    dailyTrips[d] = 0;
    dailyFuel[d] = 0;
    dailyMaint[d] = 0;
  });
  requests.forEach((r) => {
    const d = requestActivityIsoDate(r);
    if (dailyRevenue[d] == null) return;
    dailyRevenue[d] += deriveRequestValue(r);
    if (r.trip) dailyTrips[d] += 1;
  });
  fuelLogs.forEach((log) => {
    const d = logIsoDate(log);
    if (dailyFuel[d] != null) dailyFuel[d] += parseNum(log.totalCost);
  });
  maintLogs.forEach((log) => {
    const d = logIsoDate(log);
    if (dailyMaint[d] != null) dailyMaint[d] += parseNum(log.cost);
  });

  const clientRevenue = {};
  requests.forEach((r) => {
    const c = String(r.clientName || "Sin cliente").trim();
    clientRevenue[c] = (clientRevenue[c] || 0) + deriveRequestValue(r);
  });
  const clientChart = Object.entries(clientRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([label, value]) => ({ label, value }));

  const statusCounts = {};
  requests.forEach((r) => {
    const label = String(r.status || "sin_estado");
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  });
  const statusChart = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({
      label: typeof globalThis.prettyStatus === "function"
        ? String(globalThis.prettyStatus(label, "request")).replace(/<[^>]+>/g, "")
        : label,
      value
    }));

  const topClients = clientChart.slice(0, 5).map((x) => x.label);
  const clientDailySeries = topClients.map((client) => ({
    label: client,
    data: dayKeys.map((d) => {
      return requests
        .filter((r) => String(r.clientName || "Sin cliente").trim() === client && requestActivityIsoDate(r) === d)
        .reduce((acc, r) => acc + deriveRequestValue(r), 0);
    })
  }));

  const avgDaily90 = (() => {
    const start90 = addDaysToIsoDate(colombiaTodayIsoDate(), -89);
    const slice = filterRequestsForCompanyStats(allVisible, { fromDate: start90, toDate: colombiaTodayIsoDate() }, { clientFilter: "all", statusFilter: "all" });
    const total = slice.reduce((acc, r) => acc + deriveRequestValue(r), 0);
    return total / 90;
  })();
  const periodTarget = Math.max(Math.round(avgDaily90 * dayKeys.length), revenue, 1);
  const budgetPct = Math.min(100, Math.round((revenue / periodTarget) * 100));

  const clients = [...new Set(allVisible.map((r) => String(r.clientName || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const statuses = [...new Set(allVisible.map((r) => String(r.status || "").trim()).filter(Boolean))].sort();

  const fmtCop = (n) => `$${parseNum(n).toLocaleString("es-CO")}`;
  const trendPct = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : revenue > 0 ? 100 : 0;

  return {
    ...range,
    monthLabel: humanStatsMonth(range.toDate),
    generatedAt: colombiaNowIso(),
    fmtCop,
    revenue,
    trips,
    fuelCost,
    maintCost,
    totalCost,
    periodTarget,
    budgetPct,
    trendPct,
    dayKeys,
    dayLabels: dayKeys.map(humanStatsDayLabel),
    dailyRevenueSeries: dayKeys.map((d) => dailyRevenue[d] || 0),
    dailyTripsSeries: dayKeys.map((d) => dailyTrips[d] || 0),
    dailyFuelSeries: dayKeys.map((d) => dailyFuel[d] || 0),
    dailyMaintSeries: dayKeys.map((d) => dailyMaint[d] || 0),
    clientChart,
    statusChart,
    clientDailySeries,
    clients,
    statuses,
    filters: {
      clientFilter: String(opts.clientFilter || "all"),
      statusFilter: String(opts.statusFilter || "all")
    }
  };
}
