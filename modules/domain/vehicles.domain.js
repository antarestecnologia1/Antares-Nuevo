/**
 * Dominio de vehículos (flota): normalización de layout y filtros de búsqueda.
 */
import { KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";

export function normalizeVehicleFleetLayout(raw) {
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

export function readVehiclesSync() {
  return read(KEYS.vehicles, []);
}

export function filterVehiclesBySearch(vehicles, search) {
  const q = String(search || "").trim().toLowerCase();
  const rows = Array.isArray(vehicles) ? vehicles : [];
  if (!q) return rows;
  return rows.filter((v) => {
    const blob = [
      v?.plate,
      v?.brand,
      v?.model,
      v?.vin,
      v?.type,
      v?.status,
      v?.companyName
    ]
      .map((x) => String(x || "").toLowerCase())
      .join(" ");
    return blob.includes(q);
  });
}

export function vehicleStatusLabel(status) {
  const key = String(status || "").trim().toLowerCase();
  if (key === "active" || key === "activo") return "Activo";
  if (key === "inactive" || key === "inactivo") return "Inactivo";
  if (key === "maintenance" || key === "taller") return "En taller";
  return status ? String(status) : "—";
}
