/**
 * Dominio de conductores: listado, filtros y estado documental.
 */
import { KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";

export function readDriversSync() {
  return read(KEYS.drivers, []);
}

export function normalizeDriversFleetLayout(raw) {
  return String(raw || "").trim().toLowerCase() === "list" ? "list" : "cards";
}

export function filterDriversBySearch(drivers, search) {
  const q = String(search || "").trim().toLowerCase();
  const rows = Array.isArray(drivers) ? drivers : [];
  if (!q) return rows;
  return rows.filter((d) => {
    const blob = [d?.fullName, d?.name, d?.taxId, d?.phone, d?.email, d?.licenseNumber, d?.status]
      .map((x) => String(x || "").toLowerCase())
      .join(" ");
    return blob.includes(q);
  });
}

export function filterDriversByStatus(drivers, statusFilter) {
  const key = String(statusFilter || "all").trim().toLowerCase();
  const rows = Array.isArray(drivers) ? drivers : [];
  if (key === "all") return rows;
  return rows.filter((d) => String(d?.status || "").trim().toLowerCase() === key);
}

export function driverDisplayName(driver) {
  return String(driver?.fullName || driver?.name || "Sin nombre").trim() || "Sin nombre";
}
