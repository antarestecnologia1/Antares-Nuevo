/**
 * Dominio de vehículos (flota): normalización de layout, validación y filtros.
 */
import { KEYS } from "../core/config.js";
import { read } from "../core/data-io.js";
import { vehicleSearchBlob } from "./vehicles.logic.js";

export {
  canonicalVehicleType,
  compareVehiclesByPlate,
  isValidColombianCargoPlate,
  isValidVehicleVin,
  normalizeVehicleFleetComplianceFilter,
  normalizeVehicleFleetDocFilter,
  normalizeVehicleFleetEquipFilter,
  normalizeVehicleFleetGpsFilter,
  normalizeVehicleFleetStatusFilter,
  normalizeVehicleFleetTypeFilter,
  normalizeVehiclePlate,
  normalizeVehicleVin,
  resolveVehicleTypeForStorage,
  validateVehicleFormPayload,
  bodyTypeImpliesDryCargo,
  bodyTypeImpliesTermoking,
  vehicleComplianceState,
  vehicleDocumentRiskLevel,
  vehicleHasActiveGps,
  vehicleHasRefrigeration,
  vehicleTermokingBodyConflict,
  vehicleOperationalTone,
  vehiclePassesFleetFilters,
  vehicleSearchBlob,
  vehicleTypeKey
} from "./vehicles.logic.js";

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
  return rows.filter((v) => vehicleSearchBlob(v).includes(q));
}

export function vehicleStatusLabel(status) {
  const key = String(status || "").trim().toLowerCase();
  if (key === "active" || key === "activo") return "Activo";
  if (key === "inactive" || key === "inactivo") return "Inactivo";
  if (key === "maintenance" || key === "taller") return "En taller";
  return status ? String(status) : "—";
}
