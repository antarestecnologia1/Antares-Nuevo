/**
 * Dominio del dashboard: KPIs operativos agregados.
 */
import { KEYS, STATUS } from "../core/config.js";
import { read } from "../core/data-io.js";

function readRequests() {
  if (typeof globalThis.readPortalTransportRequests === "function") {
    return globalThis.readPortalTransportRequests();
  }
  return read(KEYS.requests, []);
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
